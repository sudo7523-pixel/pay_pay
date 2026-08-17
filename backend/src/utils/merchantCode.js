import Merchant from "../models/Merchant.js";

export const generateMerchantCode = async () => {
  const lastMerchant = await Merchant.findOne()
    .sort({ createdAt: -1 })
    .select("merchantCode");

  let nextNumber = 100001;
  if (lastMerchant && lastMerchant.merchantCode) {
    const numericPart = parseInt(
      lastMerchant.merchantCode.replace("CP", ""),
      10
    );
    nextNumber = numericPart + 1;
  }

  return `CP${nextNumber}`;
};
