# PayStream

## Description

This project is a Soroban smart contract demonstrating trustless payment settlement on the Stellar network. It includes a frontend interface and a deployed smart contract, designed to fulfill the requirements of the Soroban Level 3 assignment.

## Project Links

- **Live Demo:** [Insert Live Demo Link Here (e.g., Vercel, Netlify)]
- **Demo Video:** [Insert Demo Video Link Here (1-2 minutes)]
- **Contract Deployment Address:** [`CDYXZNWEP7LEMWNCI4GJHEKS2I62HZGOINULO32CNZZFORPTLT7KI4HR`](https://lab.stellar.org/r/testnet/contract/CDYXZNWEP7LEMWNCI4GJHEKS2I62HZGOINULO32CNZZFORPTLT7KI4HR)
- **Transaction Hash:** [`f09fcb1754423356778e34ba5dfdeb2c91f187c5580287932eca97f7d100d240`](https://stellar.expert/explorer/testnet/tx/f09fcb1754423356778e34ba5dfdeb2c91f187c5580287932eca97f7d100d240)

## Documentation

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/[YOUR-USERNAME]/paystream.git
   cd paystream
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Build the contract:**
   Make sure you have the `stellar` CLI and Rust toolchain installed.
   ```bash
   cd ../contract
   stellar contract build
   ```

### Running Locally

To run the frontend:
```bash
cd frontend
npm run dev
```

### Testing

Run the smart contract tests:
```bash
cd contract
cargo test
```

## Folder Structure

```text
Coin-Pay-main/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── contract/
│   ├── src/
│   ├── test_snapshots/
│   └── Cargo.toml
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
└── soroban.js
```

## CI/CD Pipeline Configuration

This project uses GitHub Actions for Continuous Integration. The pipeline automatically installs dependencies, builds the frontend and smart contract, and runs contract tests on every push and pull request to the `main` branch.

**`.github/workflows/ci.yml`**:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm install

      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm install

      - name: Setup Rust Toolchain
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown

      - name: Install Soroban CLI
        run: cargo install --locked soroban-cli

      - name: Build Smart Contract
        working-directory: ./contract
        run: cargo build --target wasm32-unknown-unknown --release

      - name: Test Smart Contract
        working-directory: ./contract
        run: cargo test
```

## Screenshots

### Mobile Responsive UI
![Mobile Responsive UI]([Insert Image URL or Path Here])

### CI/CD Pipeline Running
![CI/CD Pipeline]([Insert Image URL or Path Here])

### Test Output (3+ Passing Tests)
![Test Output]([Insert Image URL or Path Here])

## License

This project is licensed under the MIT License.
