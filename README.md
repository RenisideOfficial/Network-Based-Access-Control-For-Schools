# Entry Log System – Network-Based Access Control

A web-based staff and visitor entry logging system with QR authentication, JWT security, and network-based access control.

Built with Node.js, Express, Sequelize, MySQL, and vanilla JavaScript.

---

## ✨ Features

- QR-based staff authentication
- Secure attendance check-in/check-out
- Network/IP validation for attendance actions
- Admin dashboard with analytics
- Visitor registration system
- CSV attendance export
- JWT authentication
- Role-based access control
- Responsive UI design
- Automated email credential delivery

---

## 🧱 Tech Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Backend         | Node.js, Express              |
| Database        | MySQL                         |
| ORM             | Sequelize                     |
| Authentication  | JWT, bcrypt                   |
| Frontend        | HTML, CSS, Vanilla JavaScript |
| QR System       | qrcode, html5-qrcode          |
| Email Service   | Nodemailer                    |
| Package Manager | pnpm                          |

---

## 📁 Project Structure

```bash
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   └── server.js
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── pages/
│   ├── assets/
│   └── index.html
│
├── seed.js
├── package.json
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MySQL v8+
- pnpm

Install pnpm globally if needed:

```bash
npm install -g pnpm
```

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/entry-log-system.git
cd entry-log-system
```

Install dependencies:

```bash
pnpm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=entry_log_db

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=8h

ALLOWED_SUBNETS=192.168.1.,10.0.0.,127.0.0.,::1

FRONTEND_URL=http://127.0.0.1:5500/frontend

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🗄️ Database Setup

Create a MySQL database:

```sql
CREATE DATABASE entry_log_db;
```

The application will automatically sync Sequelize models during startup.

---

## ▶️ Run the Backend

Development mode:

```bash
pnpm run dev
```

Production mode:

```bash
node server.js
```

Backend runs on:

```txt
http://localhost:5000
```

---

## 🌐 Run the Frontend

The frontend is static and can be served using VS Code Live Server.

Open:

```txt
frontend/index.html
```

Default frontend URL:

```txt
http://127.0.0.1:5500
```

---

## 🌱 Seed Demo Data (Optional)

```bash
node seed.js
```

Example accounts:

```txt
Admin
Email: admin@company.com
Password: Admin@123
```

```txt
Staff
Email: john.doe@company.com
Password: Staff@123
```

---

## 🔗 API Endpoints

| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| POST   | `/api/auth/login`             | User login            |
| POST   | `/api/staff`                  | Create staff          |
| GET    | `/api/staff`                  | Get all staff         |
| DELETE | `/api/staff/:id`              | Delete staff          |
| POST   | `/api/attendance/check-in`    | Staff check-in        |
| POST   | `/api/attendance/check-out`   | Staff check-out       |
| GET    | `/api/attendance/logs`        | Attendance logs       |
| POST   | `/api/visitors`               | Register visitor      |
| PUT    | `/api/visitors/:id/exit`      | Visitor exit          |
| GET    | `/api/dashboard/stats`        | Dashboard statistics  |
| GET    | `/api/reports/attendance/csv` | Export attendance CSV |

---

## 🧪 Testing Flow

1. Login as admin
2. Create a staff account
3. Staff receives generated credentials via email
4. Staff logs in using email/password or QR
5. Staff performs check-in/check-out
6. Admin monitors attendance logs and exports reports

---

## ⚠️ Limitations

- Network validation only applies to attendance actions
- No real-time updates
- QR scanner requires HTTPS or localhost

---

## 🔮 Future Improvements

- Real-time updates with WebSockets
- Password reset functionality
- Mobile application
- Biometric authentication
- PDF report generation

---

## 📄 License

MIT License

---

## 👤 Author

Reniside

GitHub: https://github.com/RenisideOfficial
Project: https://github.com/RenisideOfficial/Network-Based-Access-Control-For-Schools
