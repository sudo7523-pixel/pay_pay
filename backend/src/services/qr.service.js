import QRCode from "qrcode";
import QRCodeModel from "../models/QRCode.js";
import Merchant from "../models/Merchant.js";

const generateQRImage = async (merchantCode, version) => {
  const payload = JSON.stringify({ merchantCode, version });

  const [png, svg] = await Promise.all([
    QRCode.toDataURL(payload),
    QRCode.toString(payload, { type: "svg" }),
  ]);

  return { png, svg };
};

export const generateQR = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found. Register as a merchant first.");
    err.statusCode = 404;
    throw err;
  }

  const existingQR = await QRCodeModel.findOne({ merchant: merchant._id });
  if (existingQR) {
    const err = new Error("QR code already exists for this merchant. Use regenerate instead.");
    err.statusCode = 409;
    throw err;
  }

  const qrRecord = await QRCodeModel.create({
    merchant: merchant._id,
    merchantCode: merchant.merchantCode,
    qrType: "STATIC",
    version: 1,
    active: true,
  });

  const images = await generateQRImage(qrRecord.merchantCode, qrRecord.version);

  return {
    qr: qrRecord,
    images,
  };
};

export const getQR = async (merchantCode) => {
  const qrRecord = await QRCodeModel.findOne({ merchantCode }).populate(
    "merchant",
    "businessName merchantCode"
  );

  if (!qrRecord) {
    const err = new Error("QR code not found for this merchant");
    err.statusCode = 404;
    throw err;
  }

  const images = await generateQRImage(qrRecord.merchantCode, qrRecord.version);

  return {
    qr: qrRecord,
    images,
  };
};

export const regenerateQR = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  let qrRecord = await QRCodeModel.findOne({ merchant: merchant._id });

  if (!qrRecord) {
    qrRecord = await QRCodeModel.create({
      merchant: merchant._id,
      merchantCode: merchant.merchantCode,
      qrType: "STATIC",
      version: 1,
      active: true,
    });
  } else {
    qrRecord.active = true;
    qrRecord.version += 1;
    await qrRecord.save();
  }

  const images = await generateQRImage(qrRecord.merchantCode, qrRecord.version);

  return {
    qr: qrRecord,
    images,
  };
};

export const disableQR = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  const qrRecord = await QRCodeModel.findOne({ merchant: merchant._id });
  if (!qrRecord) {
    const err = new Error("QR code not found for this merchant");
    err.statusCode = 404;
    throw err;
  }

  qrRecord.active = false;
  await qrRecord.save();

  return qrRecord;
};

export const validateMerchantCode = async (merchantCode) => {
  const merchant = await Merchant.findOne({ merchantCode });
  if (!merchant) {
    const err = new Error("Invalid merchant code");
    err.statusCode = 400;
    throw err;
  }

  return merchant;
};
