# PayStream - Web3 Tap-to-Pay Payment Platform

Blockchain-based tap-to-pay payment platform built on Stellar Soroban.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Language:** JavaScript (ES Modules)

## Installation

```bash
npm install
```

## Running the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

## Environment Variables

| Variable          | Description                     |
| ----------------- | ------------------------------- |
| `PORT`            | Server port (default: 5000)     |
| `MONGO_URI`       | MongoDB connection string       |
| `JWT_SECRET`      | JWT signing secret              |
| `STELLAR_NETWORK` | Stellar network (testnet/main)  |
| `STELLAR_SECRET`  | Stellar secret key              |
| `STELLAR_PUBLIC`  | Stellar public key              |
