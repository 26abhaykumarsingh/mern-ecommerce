# MERN Ecommerce Application

A full-stack ecommerce application built with MongoDB, Express, React, and Node.js.

## 🌐 Live Application

**Deployed Application:** [https://mern-ecommerce-black-nu.vercel.app](https://mern-ecommerce-black-nu.vercel.app)

**Login Page:** [https://mern-ecommerce-black-nu.vercel.app/login](https://mern-ecommerce-black-nu.vercel.app/login)

## 📦 Repository Links

**Frontend Repository:** [https://github.com/26abhaykumarsingh/react-ecommerce](https://github.com/26abhaykumarsingh/react-ecommerce)

**Backend Repository:** This repository (current repo)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud like MongoDB Atlas)
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Development Dependencies (Optional)

If you want to use `npm run dev` with auto-reload:

```bash
npm install --save-dev nodemon
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/ecommerce
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Authentication
JWT_SECRET_KEY=your-secret-jwt-key-here

# Session Secret
SESSION_SECRET_KEY=your-session-secret-key-here

# Stripe Payment (Optional - for payment functionality)
STRIPE_SERVER_KEY=sk_test_your_stripe_secret_key
ENDPOINT_SECRET=whsec_your_webhook_secret

# Server Port (Optional - defaults to 4242)
PORT=4242
```

**Important:** Replace all placeholder values with your actual credentials.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

- **Local MongoDB:** Start your local MongoDB service
- **MongoDB Atlas:** Your connection string should be in `MONGODB_URL`

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on **port 4242** (or the port specified in your `PORT` environment variable).

## Access the Application

### Local Development

Once the server is running, open your browser and navigate to:

```
http://localhost:4242
```

### Production

Visit the deployed application:
- **Main App:** [https://mern-ecommerce-black-nu.vercel.app](https://mern-ecommerce-black-nu.vercel.app)
- **Login:** [https://mern-ecommerce-black-nu.vercel.app/login](https://mern-ecommerce-black-nu.vercel.app/login)

The React frontend (from the `build/` folder) will be served automatically.

## API Endpoints

The backend provides the following API routes:

- `/auth` - Authentication endpoints
- `/products` - Product management
- `/categories` - Category management
- `/brands` - Brand management
- `/users` - User management
- `/cart` - Shopping cart operations
- `/orders` - Order management
- `/create-payment-intent` - Stripe payment processing
- `/webhook` - Stripe webhook handler

## Project Structure

```
├── build/              # React frontend build files
├── controller/         # Business logic controllers
├── model/             # MongoDB models
├── routes/            # Express routes
├── services/          # Common services/utilities
├── index.js           # Main server file
├── vercel.json        # Vercel deployment configuration
└── package.json       # Dependencies and scripts
```

## Deployment

This application is deployed on Vercel. The `vercel.json` configuration file handles:
- Serverless function setup for the Node.js backend
- Static file serving for the React frontend build
- Route rewrites for client-side routing

## Features

- User authentication and authorization (JWT-based)
- Product catalog with categories and brands
- Shopping cart functionality
- Order management
- Stripe payment integration
- RESTful API architecture

## Troubleshooting

1. **Port already in use:** Change the `PORT` in your `.env` file
2. **MongoDB connection error:** Verify your `MONGODB_URL` is correct
3. **Missing dependencies:** Run `npm install` again
4. **Environment variables not loading:** Make sure `.env` file is in the root directory
5. **Deployment issues:** Check Vercel environment variables match your `.env` file

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Passport.js (Local & JWT strategies)
- **Payment:** Stripe
- **Frontend:** React (served from build folder)
- **Deployment:** Vercel

