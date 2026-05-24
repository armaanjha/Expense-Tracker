# 💰 Expense Tracker

A full-stack Expense Tracker web app built with Node.js, Express, and MySQL. Track your daily expenses, filter by category, and view spending summaries — all with a clean, responsive UI.

## ✨ Features
- 🔐 User Registration and Login with session-based authentication
- ➕ Add expenses with title, amount, category, and date
- 🗑️ Delete any expense instantly
- 🔍 Filter expenses by category and date range
- 📊 Summary dashboard showing total spend and category-wise breakdown
- 💾 All data persisted in MySQL database

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Auth:** express-session, bcryptjs

## 🗂️ Project Structure
```
expense-tracker/
├── server.js          ← Express server and all API routes
├── db.js              ← MySQL database connection
├── package.json       ← Dependencies
└── public/
    ├── index.html     ← Login and Register page
    ├── dashboard.html ← Main app dashboard
    └── style.css      ← Styling
```

## ⚙️ How to Run

**1. Setup the database**
```sql
source setup.sql
```

**2. Update your MySQL credentials in `db.js`**
```js
password: 'your_mysql_password'
```

**3. Install dependencies and start**
```bash
npm install
node server.js
```

**4. Open in browser**
```
http://localhost:3000
```

## 🌐 API Routes
| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register a new user |
| POST | /login | Login and create session |
| GET | /expenses | Fetch all expenses (with filters) |
| POST | /expenses | Add a new expense |
| DELETE | /expenses/:id | Delete an expense |
| GET | /expenses/summary | Category-wise spending summary |

## 📸 Categories Supported
🍔 Food · 🚗 Transport · 🛍️ Shopping · 🎬 Entertainment · 🏥 Health · 📚 Education · 📦 Other
