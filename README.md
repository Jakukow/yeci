# 🧊 YECI - Solana Social Wallet

Yeci is a modern, full-stack crypto application that combines a Solana wallet interface with social features. Built with **Next.js 15**, it allows users to sign in with their Solana wallets, manage testnet USDC funds, add friends, and chat in real-time.

![YECI App Screenshot](public/vite.svg)

## ✨ Features

- **🔐 Sign In With Solana (SIWS):** Secure authentication using wallet signatures (Phantom, Backpack) and JWT cookies.
- **💸 Crypto Wallet:**
  - View real-time USDC balance (Solana Devnet).
  - **Faucet:** Built-in airdrop to mint test USDC instantly.
  - Deposit & Withdraw functionality.
  - Internal off-chain transfers between users.
- **👥 Social System:**
  - Add friends via wallet address.
  - Accept/Reject friend requests.
- **💬 Messaging:**
  - Chat with friends.
  - Transaction history in chat (e.g., "Sent $50").
- **⚡ Tech Stack:** Next.js App Router, Server Actions/API Routes, MongoDB Atlas.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `tw-animate-css`
- **Database:** MongoDB Atlas
- **Blockchain:** Solana Web3.js, SPL Token
- **Authentication:** Custom Wallet Signature Verification + JWT
