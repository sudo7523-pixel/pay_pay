import { scValToNative } from "@stellar/stellar-sdk";
import Transaction from "../models/Transaction.js";
import { sorobanConfig } from "./stellar.config.js";
import { getEvents, getLatestLedger } from "./rpc.service.js";
import { blockchainLogger } from "./logger.service.js";

let syncState = {
  running: false,
  lastProcessedLedger: sorobanConfig.eventSyncStartLedger || 0,
  totalEventsProcessed: 0,
  totalTransactionsUpdated: 0,
  intervalHandle: null,
  lastRunAt: null,
};

const CONTRACT_ID = sorobanConfig.contractId;

const PAYMENT_COMPLETED_TOPIC = "payment_completed";
const CONFIG_UPDATED_TOPIC = "config_updated";
const CONTRACT_UPGRADED_TOPIC = "contract_upgraded";

const argToAddress = (val) => {
  try {
    const address = scValToNative(val);
    return address ? address.toString() : null;
  } catch {
    return null;
  }
};

const parsePaymentCompletedEvent = (event) => {
  try {
    const topics = event.topic;

    const paymentIdScVal = topics._attributes?.[1] || topics[1];
    const data = scValToNative(event.value);

    const paymentId = paymentIdScVal
      ? Buffer.from(paymentIdScVal._attributes?.value || paymentIdScVal.value || []).toString("hex")
      : null;

    const from = data[0] ? data[0].toString() : null;
    const to = data[1] ? data[1].toString() : null;
    const amount = data[2] ? data[2].toString() : null;
    const token = data[3] ? data[3].toString() : null;
    const fee = data[4] ? data[4].toString() : null;
    const reference = data[5] || null;
    const timestamp = data[6] ? Number(data[6]) : null;

    return {
      type: "PaymentCompleted",
      paymentId,
      from,
      to,
      amount,
      token,
      fee,
      reference,
      timestamp,
      ledger: event.ledger,
      ledgerClosedAt: event.ledgerClosedAt ? new Date(event.ledgerClosedAt) : null,
      txHash: event.txHash || event.id?.split("-")?.[0] || null,
    };
  } catch (error) {
    blockchainLogger.warn("Failed to parse PaymentCompleted event:", error.message);
    return null;
  }
};

const parseConfigUpdatedEvent = (event) => {
  try {
    const data = scValToNative(event.value);
    return {
      type: "ConfigUpdated",
      admin: data[0] ? data[0].toString() : null,
      feeBps: data[1] ?? null,
      feeRecipient: data[2] ? data[2].toString() : null,
      paused: data[3] ?? null,
      ledger: event.ledger,
      ledgerClosedAt: event.ledgerClosedAt ? new Date(event.ledgerClosedAt) : null,
      txHash: event.txHash || null,
    };
  } catch (error) {
    blockchainLogger.warn("Failed to parse ConfigUpdated event:", error.message);
    return null;
  }
};

const parseContractUpgradedEvent = (event) => {
  try {
    const data = scValToNative(event.value);
    return {
      type: "ContractUpgraded",
      oldVersion: data[0] ?? null,
      newVersion: data[1] ?? null,
      newWasmHash: data[2] ? Buffer.from(data[2]).toString("hex") : null,
      ledger: event.ledger,
      ledgerClosedAt: event.ledgerClosedAt ? new Date(event.ledgerClosedAt) : null,
      txHash: event.txHash || null,
    };
  } catch (error) {
    blockchainLogger.warn("Failed to parse ContractUpgraded event:", error.message);
    return null;
  }
};

const parseRawEvent = (event) => {
  try {
    const topics = event.topic || [];

    let topicSymbols = [];
    if (Array.isArray(topics)) {
      topicSymbols = topics.map((t) => {
        try {
          return scValToNative(t);
        } catch {
          return null;
        }
      });
    } else if (topics._attributes) {
      topicSymbols = Object.values(topics._attributes).map((t) => {
        try {
          return scValToNative(t);
        } catch {
          return null;
        }
      });
    }

    const eventTypeSymbol = topicSymbols[0];
    if (!eventTypeSymbol) return null;

    const eventType = typeof eventTypeSymbol === "string" ? eventTypeSymbol : eventTypeSymbol.toString();

    if (eventType === PAYMENT_COMPLETED_TOPIC) {
      return parsePaymentCompletedEvent(event);
    }
    if (eventType === CONFIG_UPDATED_TOPIC) {
      return parseConfigUpdatedEvent(event);
    }
    if (eventType === CONTRACT_UPGRADED_TOPIC) {
      return parseContractUpgradedEvent(event);
    }

    return null;
  } catch (error) {
    blockchainLogger.warn("Failed to parse raw event:", error.message);
    return null;
  }
};

const matchAndUpdateTransaction = async (parsed) => {
  if (!parsed || parsed.type !== "PaymentCompleted") return false;

  if (!parsed.paymentId && !parsed.txHash) {
    blockchainLogger.warn("PaymentCompleted event missing both paymentId and txHash — skipping", { parsed });
    return false;
  }

  try {
    let updateFields = {
      status: "Confirmed",
      confirmed: true,
      ledger: parsed.ledger || undefined,
      confirmationTimestamp: parsed.ledgerClosedAt || new Date(),
    };

    if (parsed.txHash) {
      updateFields.transactionHash = parsed.txHash;
    }

    let matchQuery = { blockchainType: "soroban" };
    if (parsed.paymentId) {
      matchQuery["blockchainMeta.paymentId"] = parsed.paymentId;
    }
    if (parsed.txHash) {
      matchQuery.transactionHash = parsed.txHash;
    }

    const updated = await Transaction.findOneAndUpdate(
      matchQuery,
      { $set: updateFields },
      { new: true }
    );

    if (updated) {
      blockchainLogger.info("Transaction confirmed via event sync", {
        transactionId: updated._id.toString(),
        paymentId: parsed.paymentId,
        ledger: parsed.ledger,
        txHash: parsed.txHash,
      });
      return true;
    }

    if (parsed.txHash) {
      const byHash = await Transaction.findOneAndUpdate(
        { transactionHash: parsed.txHash },
        { $set: updateFields },
        { new: true }
      );
      if (byHash) {
        blockchainLogger.info("Transaction confirmed via event sync (by hash)", {
          transactionId: byHash._id.toString(),
          txHash: parsed.txHash,
          ledger: parsed.ledger,
        });
        return true;
      }
    }

    blockchainLogger.debug("No matching transaction found for PaymentCompleted event", {
      paymentId: parsed.paymentId,
      txHash: parsed.txHash,
    });
    return false;
  } catch (error) {
    blockchainLogger.error("Failed to update transaction from event sync:", error.message);
    return false;
  }
};

const processEvents = async (events) => {
  let updatedCount = 0;
  let processedCount = 0;

  for (const rawEvent of events) {
    const parsed = parseRawEvent(rawEvent);
    if (!parsed) continue;

    processedCount++;
    blockchainLogger.debug("Processing blockchain event", {
      type: parsed.type,
      ledger: parsed.ledger,
      txHash: parsed.txHash,
    });

    if (parsed.type === "PaymentCompleted") {
      const matched = await matchAndUpdateTransaction(parsed);
      if (matched) updatedCount++;
    } else if (parsed.type === "ConfigUpdated" || parsed.type === "ContractUpgraded") {
      blockchainLogger.info("Non-payment event received", {
        type: parsed.type,
        ledger: parsed.ledger,
      });
    }
  }

  return { processedCount, updatedCount };
};

const syncEvents = async () => {
  try {
    const latestLedgerInfo = await getLatestLedger();
    const latestSequence = latestLedgerInfo.sequence;

    if (latestSequence <= syncState.lastProcessedLedger) {
      return { checkedLedger: latestSequence, newEvents: 0 };
    }

    const startLedger = syncState.lastProcessedLedger > 0
      ? syncState.lastProcessedLedger + 1
      : Math.max(1, latestSequence - 100);

    const filters = [
      {
        type: "contract",
        contractIds: [CONTRACT_ID],
      },
    ];

    blockchainLogger.debug(`Syncing events ledgers ${startLedger} to ${latestSequence}`);
    // Use any type to work around getEvents typing
    const result = await getEvents({
      startLedger,
      filters,
      pagination: { limit: 200 },
    });

    const events = result.events || [];
    if (events.length === 0) {
      syncState.lastProcessedLedger = latestSequence;
      return { checkedLedger: latestSequence, newEvents: 0 };
    }

    const { processedCount, updatedCount } = await processEvents(events);

    syncState.lastProcessedLedger = latestSequence;
    syncState.totalEventsProcessed += processedCount;
    syncState.totalTransactionsUpdated += updatedCount;

    blockchainLogger.info(
      `Event sync: processed ${processedCount} events, ` +
      `updated ${updatedCount} transactions, ` +
      `ledger ${latestSequence}`
    );

    return { checkedLedger: latestSequence, newEvents: events.length, processedCount, updatedCount };
  } catch (error) {
    blockchainLogger.error("Event sync error:", error.message);
    return { checkedLedger: syncState.lastProcessedLedger, error: error.message };
  }
};

export const startEventSync = () => {
  if (syncState.running) {
    blockchainLogger.warn("Event sync is already running");
    return;
  }

  syncState.running = true;
  blockchainLogger.info("Starting event sync service", {
    intervalMs: sorobanConfig.eventSyncIntervalMs,
    contractId: CONTRACT_ID,
  });

  const run = async () => {
    if (!syncState.running) return;
    try {
      syncState.lastRunAt = new Date();
      await syncEvents();
    } finally {
      if (syncState.running) {
        syncState.intervalHandle = setTimeout(run, sorobanConfig.eventSyncIntervalMs);
      }
    }
  };

  run();
};

export const stopEventSync = () => {
  syncState.running = false;
  if (syncState.intervalHandle) {
    clearTimeout(syncState.intervalHandle);
    syncState.intervalHandle = null;
  }
  blockchainLogger.info("Event sync service stopped");
};

export const getSyncStatus = () => ({
  running: syncState.running,
  lastProcessedLedger: syncState.lastProcessedLedger,
  totalEventsProcessed: syncState.totalEventsProcessed,
  totalTransactionsUpdated: syncState.totalTransactionsUpdated,
  lastRunAt: syncState.lastRunAt,
});

export const triggerManualSync = async () => {
  return syncEvents();
};
