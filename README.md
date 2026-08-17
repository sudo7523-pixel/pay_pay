# PayStream

## Description
Paystream is a non-custodial payment platform that enables users to send, receive, and accept cryptocurrency payments with near-zero fees and instant settlement. Built on the Stellar network, it leverages Soroban smart contracts for trustless payment settlement while maintaining a familiar web experience.
## Project Links

- **Live Demo:** [vercel](https://vercel.com/sudo7523-pixels-projects/paystream)
- **Demo Video:** [demo](https://drive.google.com/file/d/1UEX3KizU2aaTUW_DDfjGAshs_I7Mmw5P/view?usp=sharing)
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
### Costumer dashboard:
<img width="1920" height="1020" alt="Screenshot 2026-08-17 115458" src="https://github.com/user-attachments/assets/a31aec8f-ae59-42c8-b1c5-aace576185ed" />
### Merchant  dashboard:
<img width="1920" height="1020" alt="Screenshot 2026-08-17 115304" src="https://github.com/user-attachments/assets/c50f5fa1-b59c-4db8-8be7-8b30baccb12e" />
### UI
<img width="1920" height="1020" alt="{4BC746F0-5F2B-4C8A-BAA6-0C7BF5E64CD2}" src="https://github.com/user-attachments/assets/1fbf472e-d751-457a-8e0d-d628d0aa16d8" />


### Mobile Responsive UI
<img width="720" height="1600" alt="WhatsApp Image 2026-08-17 at 12 10 55" src="https://github.com/user-attachments/assets/385ca46d-ea69-487c-9156-f57e80029787" />


### CI/CD Pipeline Running


### Test Output (3+ Passing Tests)


## License

This project is licensed under the MIT License.
