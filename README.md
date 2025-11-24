# 🏠 Rent Manager App

A comprehensive full-stack property management system for landlords and tenants to manage buildings, rooms, rent collection, bills, and financial tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

## ✨ Features

### For Administrators
- 🏢 **Building Management**: Add and manage multiple properties
- 🚪 **Room Management**: Track room occupancy, rent, and tenant assignments
- 👥 **Tenant Management**: Manage tenant information and assignments
- 💰 **Bill Generation**: Automatically generate monthly bills with electricity and other charges
- 💳 **Payment Tracking**: Confirm payments and track collection rates
- 📊 **Financial Dashboard**: Real-time insights into collections, expenses, and profitability
- 📈 **Reports**: Monthly financial reports with detailed breakdowns
- 💸 **Expense Tracking**: Record and categorize building expenses
- 📋 **Payment History**: Complete audit trail of all transactions

### For Tenants
- 📄 **View Bills**: Access current and past bills
- ✅ **Payment Confirmation**: Mark bills as paid for admin verification
- 📜 **Payment History**: Track all payment records

## 🛠️ Tech Stack

### Frontend
- **React** 18+ with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Framer Motion** for animations
- **Shadcn/ui** for UI components
- **Lucide React** for icons
- **React Hook Form** for form handling
- **jsPDF** for PDF generation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-rate-limit** for API protection
- **dotenv** for environment variables

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Spectronyx/rent-manager-app.git
cd rent-manager-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
NODE_ENV=development
```

Start the backend server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:4000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/rent-manager` or Atlas URI |
| `JWT_SECRET` | Secret key for JWT tokens | Any random secure string |
| `PORT` | Backend server port | `4000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |

## 👤 Default Admin Account

After initial setup, create an admin account through the registration page:
- Use the registration endpoint to create your first admin user
- Role will be set to 'admin' automatically

## 📖 Usage Guide

### Admin Workflow

1. **Add Buildings**: Create properties you manage
2. **Add Rooms**: Define rooms within each building with monthly rent
3. **Add Tenants**: Register tenants and assign them to rooms
4. **Generate Bills**: Create monthly bills for occupied rooms
5. **Track Payments**: Confirm payments as tenants mark them as paid
6. **Monitor Finances**: View dashboard for real-time financial insights
7. **Manage Expenses**: Record building expenses to track profitability

### Tenant Workflow

1. **Login**: Access your tenant account
2. **View Bills**: See current outstanding bills
3. **Mark as Paid**: Notify admin of payment
4. **Check History**: Review past payments

## 🎨 Key Features Explained

### Financial Dashboard
- **Total Collections**: Sum of all confirmed payments
- **Collection Rate**: Percentage of expected rent collected
- **Occupancy Rate**: Percentage of rooms occupied
- **Net Profit**: Collections minus expenses
- **Total Dues**: Unpaid rent amounts
- **Period Filters**: View stats for specific months or all-time

### Bill Generation
- Automatically includes base rent
- Add electricity bills and other charges
- Carries forward previous dues
- Creates bills for all occupied rooms at once

### Payment Flow
1. Admin generates monthly bills
2. Tenant marks bill as "Paid"
3. Admin confirms payment
4. Payment recorded in collection history

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- MongoDB Atlas
- Backend deployment (Render, Railway, Heroku)
- Frontend deployment (Vercel, Netlify)

## 📁 Project Structure

```
rent-manager-app/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth & error handling
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── api/          # API service layer
│   │   ├── utils/        # Utility functions
│   │   └── hooks/        # Custom React hooks
│   └── index.html
└── README.md
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (Admin/Tenant)
- API rate limiting
- CORS protection
- Input validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🐛 Bug Reports

If you discover any bugs, please create an issue on GitHub with detailed information about the problem.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for property managers and tenants**
