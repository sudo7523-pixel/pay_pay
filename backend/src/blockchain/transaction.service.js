import {
  rpc,
  TransactionBuilder,
  nativeToScVal,
  Address,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import { sorobanConfig } from "./stellar.config.js";
import {
  getRpcServer,
  withRetry,
  sendTransaction,
  getTransaction,
} from "./rpc.service.js";
import { getContract } from "./contract.service.js";
import { blockchainLogger } from "./logger.service.js";

const parseTransactionError = (errorResult) => {
  try {
    const resultCode = errorResult.result().switch();
    const codeName = resultCode.name || "unknown";
    blockchainLogger.error("Transaction result code", { code: codeName, value: resultCode.value });
    return { code: codeName };
  } catch (err) {
    return { code: "unparseable", error: err.message };
  }
};

const parseFailedResultXdr = (resultXdr) => {
  try {
    const txResult = xdr.TransactionResult.fromXDR(resultXdr, "base64");
    const resultCode = txResult.result().switch();
    const codeName = resultCode.name || "unknown";

    let info = { code: codeName };

    if (resultCode === xdr.TransactionResultCode.txFailed()) {
      try {
        const opResults = txResult.result().results();
        if (opResults && opResults.length > 0) {
          info.operations = Array.from(opResults).map((op) => {
            try {
              return { operationCode: op.tr().switch().name || "unknown" };
            } catch {
              return { operationCode: "unparseable" };
            }
          });
        }
      } catch {
        // operation results not available
      }
    }

    return info;
  } catch (err) {
    return { code: "unparseable", error: err.message };
  }
};

export const buildSorobanPaymentTransaction = async ({
  sourceAddress,
  payerAddress,
  merchantAddress,
  tokenAddress,
  amount,
  nonce,
  memo,
  reference,
}) => {
  const server = getRpcServer();
  const contract = getContract();

  const sourceAccount = await withRetry(
    () => server.getAccount(sourceAddress.trim()),
    `getAccount(${sourceAddress})`
  );

  blockchainLogger.debug("Source account sequence", {
    address: sourceAddress,
    sequence: sourceAccount.sequenceNumber(),
  });

  const payArgs = [
    new Address(payerAddress.trim()).toScVal(),
    new Address(merchantAddress.trim()).toScVal(),
    nativeToScVal(amount, { type: "i128" }),
    new Address(tokenAddress.trim()).toScVal(),
    nativeToScVal(Buffer.from(nonce), { type: "bytes" }),
    nativeToScVal(memo || "", { type: "string" }),
    nativeToScVal(reference || "", { type: "string" }),
  ];

  const contractCall = contract.call("pay", ...payArgs);

  blockchainLogger.debug("Built contract call for pay()");

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: sorobanConfig.networkPassphrase,
  })
    .addOperation(contractCall)
    .setTimeout(300)
    .build();

  blockchainLogger.debug("Simulating Soroban payment transaction");

  const simulation = await server.simulateTransaction(transaction);

  if (simulation.error) {
    blockchainLogger.error("Simulation error:", simulation.error);
    const err = new Error(`Contract simulation failed: ${simulation.error}`);
    err.contractError = simulation.error;
    throw err;
  }

  blockchainLogger.debug("Simulation result", {
    minResourceFee: simulation.minResourceFee,
    hasResult: !!simulation.result,
    authCount: simulation.sorobanAuth?.length || 0,
    footprintType: simulation.footprint
      ? simulation.footprint.v1?.ledgerContracts?.length || 0
      : "none",
    hasError: !!simulation.error,
  });

  // Build soroban auth entries with SourceAccount credentials.
  // The payer is the transaction signer, so SourceAccount tells the Soroban
  // host to trust the envelope signature — no explicit signature needed in
  // the auth entry (Freighter does not fill SorobanAddressCredentials).
  blockchainLogger.debug("Building soroban auth entries with SourceAccount credentials");

  const invokeContractArgs = new xdr.InvokeContractArgs({
    contractAddress: contract.address().toScAddress(),
    functionName: "pay",
    args: payArgs,
  });
  const authFunction = xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
    invokeContractArgs
  );
  const invocation = new xdr.SorobanAuthorizedInvocation({
    function: authFunction,
    subInvocations: [],
  });
  const authEntry = new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
    rootInvocation: invocation,
  });

  const originalXdr = simulation.results?.[0]?.xdr || "";
  simulation.results = [{ auth: [authEntry.toXDR("base64")], xdr: originalXdr }];

  const preparedTransaction = rpc.assembleTransaction(transaction, simulation).build();

  const fee = simulation.minResourceFee
    ? parseInt(simulation.minResourceFee, 10)
    : BASE_FEE;

  blockchainLogger.debug("Transaction built", {
    sequence: sourceAccount.sequenceNumber(),
    fee,
    hash: transaction.hash().toString("hex"),
  });

  return {
    unsignedXDR: preparedTransaction.toXDR(),
    simulationResult: simulation,
    fee,
  };
};

export const submitSorobanSignedTransaction = async (signedXDR) => {
  blockchainLogger.debug("Submitting signed Soroban transaction");

  let transaction;
  try {
    transaction = TransactionBuilder.fromXDR(signedXDR, sorobanConfig.networkPassphrase);
  } catch (parseError) {
    const err = new Error("Invalid signed XDR format");
    err.statusCode = 400;
    throw err;
  }

  blockchainLogger.debug("Signed transaction details", {
    source: transaction.source,
    sequence: transaction.sequence,
    hash: transaction.hash().toString("hex"),
    fee: transaction.fee,
    operations: transaction.operations.length,
    hasSorobanData: !!transaction.sorobanData,
  });

  const result = await sendTransaction(transaction);

  if (result.status === "ERROR" || result.errorResult) {
    const details = parseTransactionError(result.errorResult);
    blockchainLogger.error("Transaction submission error", {
      status: result.status,
      errorDetails: details,
    });
    const err = new Error(
      `Soroban transaction submission failed: ${details.code}`
    );
    err.submissionResult = result;
    err.errorDetails = details;
    throw err;
  }

  blockchainLogger.info("Transaction submitted", { hash: result.hash, status: result.status });

  return result;
};

export const waitForSorobanConfirmation = async (hash) => {
  blockchainLogger.info(`Waiting for transaction confirmation: ${hash}`);

  for (let attempt = 1; attempt <= sorobanConfig.confirmationMaxRetries; attempt++) {
    const result = await getTransaction(hash);

    if (result.status === "SUCCESS") {
      blockchainLogger.info("Transaction confirmed", { hash, ledger: result.ledger });
      const parsed = result.resultXdr
        ? parseSorobanTransactionResult(result.resultXdr)
        : null;
      return {
        confirmed: true,
        status: result.status,
        hash: result.hash,
        ledger: result.ledger,
        ledgerCloseTime: result.createdAt,
        resultXdr: result.resultXdr,
        parsedResult: parsed,
        retryCount: attempt,
      };
    }

    if (result.status === "FAILED") {
      const details = result.resultXdr
        ? parseFailedResultXdr(result.resultXdr)
        : { code: "unknown" };
      blockchainLogger.error("Transaction failed on-chain", {
        hash,
        details,
      });
      return {
        confirmed: false,
        status: result.status,
        hash,
        ledger: result.ledger,
        resultXdr: result.resultXdr,
        errorDetails: details,
        retryCount: attempt,
      };
    }

    if (result.status === "NOT_FOUND") {
      if (attempt < sorobanConfig.confirmationMaxRetries) {
        const delay = sorobanConfig.confirmationPollIntervalMs;
        blockchainLogger.debug(`Transaction not yet visible (${attempt}), retrying in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        blockchainLogger.warn(`Transaction not found after max retries: ${hash}`);
        return {
          confirmed: false,
          status: "NOT_FOUND",
          hash,
          ledger: null,
          retryCount: attempt,
        };
      }
    }
  }

  return {
    confirmed: false,
    status: "TIMEOUT",
    hash,
    ledger: null,
    retryCount: sorobanConfig.confirmationMaxRetries,
  };
};

export const parseSorobanTransactionResult = (resultXdr) => {
  try {
    const txResult = xdr.TransactionResult.fromXDR(resultXdr, "base64");
    const pair = txResult.result().results()[0];
    const contractResult = pair.tr().invokeHostFunctionResult().value();
    return contractResult;
  } catch (error) {
    blockchainLogger.warn("Failed to parse transaction result XDR:", error.message);
    return null;
  }
};
