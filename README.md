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

## Screenshots

### Mobile Responsive UI
![Mobile Responsive UI]([Insert Image URL or Path Here])

### CI/CD Pipeline Running
![CI/CD Pipeline]([Insert Image URL or Path Here])

### Test Output (3+ Passing Tests)
![Test Output]([Insert Image URL or Path Here])

## License

This project is licensed under the MIT License.
