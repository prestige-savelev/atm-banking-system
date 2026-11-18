# 🏦 ATM Banking System

<p align="center">
  <img src="docs/ATM Banking System.webp" alt="ATM Banking System" width="100%" />
</p>

<p align="center">
  <img src="docs/mermaid-diagram.png" alt="Database Schema" width="100%" />
</p>

## 📖 About

A backend banking system built with **Node.js, TypeScript, Express and PostgreSQL**.

The project simulates core banking operations: account and card management, ATM deposits and withdrawals, card-to-card transfers, and transaction history.

## 🛠️ Tech Stack

- 🟢 Node.js
- 🔷 TypeScript
- 🚀 Express.js
- 🐘 PostgreSQL
- 📘 Swagger / OpenAPI
- 🔐 JWT
- 🔒 bcrypt

## ✨ Features

- 👤 User registration and authentication
- 🏦 Bank account and card management
- 💳 Card activation and PIN verification
- 💸 ATM deposits and cash withdrawals
- 🔄 Card-to-card money transfers
- 📜 Transaction history
- ⚖️ Balance and transaction limit validation
- 🔐 Secure database transactions with `COMMIT` and `ROLLBACK`
- 📘 Interactive API documentation with Swagger UI

## 🏗️ Architecture

The project follows a modular architecture:

```text
src/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── utils/
└── app.ts
```

## 🚀 Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/prestige-savelev/atm-banking-system.git
cd atm-banking-system
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/atm_banking_system
JWT_SECRET=your_secret_key
```

Start the development server:

```bash
npm run dev
```

## 👨‍💻 Author

**Danil Savelev**

[🐙 GitHub](https://github.com/prestige-savelev)
