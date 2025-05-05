# 💸 Expense Tracker Web Application

This is a full-stack Expense Tracker application developed using **MySQL** for the backend database and **HTML, CSS, JavaScript** for the frontend (vanilla JS, no external frameworks). The app helps users efficiently manage their incomes, expenses, budgets, and reports.

---

## 📌 Problem Statement

Build a web-based expense tracking system that enables users to:

- Track their income and expenses by category.
- Set budgets for different spending categories.
- View financial summaries and reports.
- Store data securely using a normalized relational database.

---

## 🛠 Tech Stack

| Layer        | Technology               |
|--------------|---------------------------|
| Frontend     | HTML, CSS, JavaScript     |
| Backend DB   | MySQL                     |
| Optional API | PHP / Flask (optional)    |

---

## 🗃 Database Design

- ✅ Normalized to **Third Normal Form (3NF)**
- ✅ ER Diagram with proper relationships
- ✅ DCL (user roles and permissions)
- ✅ Triggers for backup
- ✅ Procedures & Functions

### 📑 Tables

- `Users`
- `Categories`
- `Expenses`
- `Income`
- `Payments`
- `Budget`
- `Reports`
- `Transactions`
- `Transactions_Backup`

---

## 📂 File Structure

| File                          | Description                                  |
|-------------------------------|----------------------------------------------|
| `1_create_database.sql`       | DDL for database & all tables                |
| `2_insert_initial_data.sql`   | Inserts 4–5 records into each table          |
| `3_dcl_triggers_procedures.sql` | DCL commands, Triggers, Functions & Procedures |
| `README.md`                   | Project overview and documentation           |

---

## 🧪 SQL Features Used

- ✅ **DDL, DML, DCL**
- ✅ **Joins & Subqueries**
- ✅ **Aggregate Functions**
- ✅ **Stored Procedures & Functions**
- ✅ **Triggers for Data Backup**
- ✅ **User Roles & Privileges**

---

## 🚀 How to Use

1. Import `1_create_database.sql` to set up the DB and tables.
2. Run `2_insert_initial_data.sql` to add dummy data.
3. Execute `3_dcl_triggers_procedures.sql` for user permissions, triggers, and logic.
4. Connect your frontend to the MySQL database using backend logic (e.g., PHP or Flask).
5. Run queries or procedures like:
   ```sql
   CALL generate_report(1, '2025-03-01', '2025-03-31');
   SELECT * FROM Reports;

