const express = require('express');
const cron = require("node-cron");
const db = require('./db'); // Import the database connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken package
const cors = require('cors');
require('dotenv').config(); // For loading environment variables
const app = express();
const port = 3000;
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const cookie = require("cookie");
const cookieParser = require("cookie-parser");
const transporter = nodemailer.createTransport({
  host: "secure.emailsrvr.com", // Office 365 SMTP server
  port: 465, // SMTP port for TLS
  secure: true, // `false` for STARTTLS
  auth: {
    user: "bharath@uniqueschools.ie", // Replace with your Microsoft Work Account
    pass: "BharathUniqueB5!", // Use App Password if required
  },
  tls: {
    ciphers: "SSLv3", // Required for Office 365
  },
});// To parse JSON request bodies
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3001', // Allow only your frontend's origin
  credentials: true,  // Allow credentials (cookies, HTTP authentication)
}; 
app.use(cors(corsOptions));
app.use(cookieParser());
// Endpoint to register a new user
app.post('/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);

    const { firstName, lastName, email, password, employeeType } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !employeeType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists in `users` or `pending_users`
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const [pendingUser] = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);

    if (existingUser.length > 0 || pendingUser.length > 0) {
      return res.status(400).json({ error: "Email is already registered or awaiting verification" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Generate a unique verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Store user in `pending_users` table until verified
    const [insertResult] = await db.query(
      'INSERT INTO pending_users (first_name, last_name, email, password_hash, role, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, employeeType, verificationToken]
    );

   // console.log('Pending user inserted with ID:', insertResult.insertId);
    const emailHTML = `
  <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center;">
      <img src="https://www.uniqueschoolapp.ie/themes/bootstrap/images/logo_US.png" alt="Company Logo" style="max-width: 150px; margin-bottom: 10px;">
    </div>
    <h2 style="color: #333; text-align: center;">Verify Your Email for LMS</h2>
    <p style="color: #555; text-align: center;">
      Hello, <strong>[User's Name]</strong>,  
      <br>Thank you for signing up for Unique School App LMS!  
      <br>Please verify your email to activate your account.
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="[Verification Link]" 
         style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Email
      </a>
    </div>
    <p style="color: #777; font-size: 14px; text-align: center;">
      If you did not create an account, please ignore this email.
    </p>
    <hr>
    <div style="text-align: center; font-size: 12px; color: #999;">
      &copy; 2025 [Your Company]. All rights reserved.  
      <br>1234 Your Street, Your City, Country | Contact: support@yourcompany.com  
    </div>
  </div>
`;


    // 📩 **Send Verification Email**
    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: "bharath@uniqueschools.ie", // MUST match your Microsoft Work Account
      to: email,
      subject: "Verify Your Email for LMS",
      html: emailHTML
      .replace("[User's Name]", `${firstName} ${lastName}`)
      .replace("[Verification Link]", verificationLink),
    });

    res.status(200).json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Error registering user" });
  }
});

// 📌 **Email Verification Endpoint**
app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Invalid or missing token");
    }

    // Retrieve user from `pending_users`
    const [user] = await db.query('SELECT * FROM pending_users WHERE verification_token = ?', [token]);

    if (user.length === 0) {
      return res.status(400).send("Invalid or expired token");
    }

    // Move user to `users` table
    await db.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [user[0].first_name, user[0].last_name, user[0].email, user[0].password_hash, user[0].role]
    );

    // Remove from `pending_users`
    await db.query('DELETE FROM pending_users WHERE email = ?', [user[0].email]);

    // Serve an HTML response with styled success card + animations
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified</title>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(to bottom right, #3b82f6, #9333ea);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            text-align: center;
            width: 360px;
            animation: fadeIn 0.8s ease-out;
          }
          .logo {
            width: 150px;
            margin-bottom: 20px;
          }
          .checkmark {
            font-size: 60px;
            color: #4CAF50;
            animation: bounce 1s infinite;
          }
          h2 {
            color: #333;
            font-size: 22px;
            margin: 15px 0;
          }
          p {
            color: #555;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 20px;
            background: #4f46e5;
            color: white;
            text-decoration: none;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            transition: 0.3s ease;
          }
          .button:hover {
            background: #4338ca;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img class="logo" src="https://www.uniqueschoolapp.ie/themes/bootstrap/images/logo_US.png" alt="Logo">
          <div class="checkmark">✔</div>
          <h2>Email Verified Successfully!</h2>
          <p>Your email has been verified. You can now log in to your account.</p>
          </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Error verifying email:", err);
    res.status(500).send("Error verifying email");
  }
});


// Endpoint for user login

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT with user details
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Set the token in an HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true, // Prevents JavaScript from accessing it
      secure: false, // Set to true in production
      sameSite: "Lax", // Helps prevent CSRF attacks
      maxAge: 3600000, // 1 hour expiration
    });

    // Set the user info in a separate cookie
    res.cookie("userInfo", JSON.stringify({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role
    }), {
      httpOnly: false, // So JavaScript can access it
      secure: false, // Set to true in production
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour expiration
    });

    // Send user details (excluding password)
    return res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
});


app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { joiningDate, designation, department } = req.body;

  // Validate and update user details
  try {
    await db.query(
      'UPDATE employees SET joiningDate = ?, designation = ?, department = ? WHERE id = ?',
      [joiningDate, designation, department, id]
    );
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Error updating profile' });
  }
});
const getEmployees = async () => {
  try {
    // Query the database using async/await
    const [rows] = await db.query('SELECT * FROM employees');
     return rows;
  } catch (err) {
    console.error("Error fetching employees:", err);
    throw err;
  }
};

app.get('/employees', async (req, res) => {
  try {
    const employees = await getEmployees();
    res.json(employees);
  } catch (err) {
    res.status(500).send('Error fetching employees');
  }
});
app.put("/employees/:id", async (req, res) => {
  const { id } = req.params;
  let { name, email, employeeType, designation, department, joiningDate,status,plOpeningBalance,lastworkingDay } = req.body;

  if (!employeeType) {
    console.warn("Warning: employeeType is missing, defaulting to 'employee'");
    employeeType = "employee";
  }

  //console.log("Received ID:", id);
  //console.log("Data to Update:", { name, email, employeeType, designation, department, joiningDate,status });

  if (!name || !email || !designation || !department || !joiningDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let connection;
  try {
    // Get a connection from the pool
    connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Correct way to start a transaction
    const newJoiningYear = new Date(joiningDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (newJoiningYear === currentYear) {
      await accruePL(); 
      await accrueCL();// Trigger PL accrual
    }
    // Update employees table
    const updateEmployeeQuery = `
      UPDATE employees 
      SET name = ?, email = ?, employeetype = ?, designation = ?, department = ?, joiningDate = ?, status=?,lastworkingday=?
      WHERE id = ?
    `;

   const updatePLBalance=`UPDATE pl_balances SET balance=balance+? WHERE employeeId=?`;
   const [employeebalance]=await connection.execute(updatePLBalance,[plOpeningBalance,id]);
    const [employeeResult] = await connection.execute(updateEmployeeQuery, [
      name,
      email,
      employeeType,
      designation,
      department,
      joiningDate,
      status,
      lastworkingDay,
      id,
    ]);
   const empbalance=await connection.execute("SELECT balance from pl_balances WHERE employeeId=?",[id]);
   await connection.execute("UPDATE pl_balances SET carryForward=? WHERE employeeId=?",[plOpeningBalance,id]);
    if (employeeResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update users table
    const updateUserQuery = `UPDATE users SET role = ? WHERE email = ?`;
    const [userResult] = await connection.execute(updateUserQuery, [employeeType, email]);

    // Commit transaction
    await connection.commit();
    res.status(200).json({ message: "Employee and user role updated successfully" });
  } catch (err) {
    console.error("Transaction Error:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ message: "Error updating employee data" });
  } finally {
    if (connection) connection.release(); // ✅ Always release connection
  }
});
app.post("/leave-request", async (req, res) => {
  const {
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    totalLeaveDays, // Total leave days sent from frontend
    startDayType,   // Full/Half for the start date
    endDayType,     // Full/Half for the end date
  } = req.body;

  console.log("Received leave request:", req.body); // Debug log

  // Validate required fields
  if (!employeeId || !leaveType || !startDate || !endDate || !reason || totalLeaveDays === undefined) {
    console.error("Missing required fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the employee exists
    const [rows] = await db.query("SELECT name FROM employees WHERE id = ?", [employeeId]);

    if (rows.length === 0) {
      console.error("Employee not found for ID:", employeeId);
      return res.status(404).json({ message: "Employee not found" });
    }

    // If it's Paid Leave, ensure that both start and end day types are set to "Full Day"
    if (leaveType === "Paid Leave") {
      startDayType = "Full Day";
      endDayType = "Full Day";
    }

    // Insert the leave request into the database
    const [leaveRequestResult] = await db.query(
      "INSERT INTO leave_requests (employeeId, name, type, startDate, endDate, reason, status, startDayType, endDayType, totalLeaveDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        employeeId,
        rows[0].name,
        leaveType,
        startDate,
        endDate,
        reason,
        "Pending",  // Initial status
        startDayType,
        endDayType,
        totalLeaveDays,  // Use the total leave days sent from the frontend
      ]
    );

    res.status(201).json({ message: "Leave request submitted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/leave-public-holidays", async (req, res) => {
  try {
    const [holidays] = await db.query("SELECT date FROM public_holidays");
    res.json(holidays);
  } catch (error) {
    console.error("Error fetching public holidays:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/public-holidays', async (req, res) => {
  try {
      const { date, name } = req.body;
      if (!date || !name) {
          return res.status(400).json({ message: "Date and holiday name are required" });
      }

      await db.execute('INSERT INTO public_holidays (date, name) VALUES (?, ?)', [date, name]);
      res.status(201).json({ message: "Holiday added successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/public-holidays', async (req, res) => {
  try {
    const [holidays] = await db.execute('SELECT id, name, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM public_holidays;');
    
    const formattedHolidays = holidays.map(holiday => {
      const utcDate = new Date(holiday.date);
      return {
        ...holiday,
        date: `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`
      };
    });
    

    res.json(formattedHolidays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a public holiday
app.delete('/public-holidays/:id', async (req, res) => {
  try {
      const { id } = req.params;

      const [result] = await db.execute('DELETE FROM public_holidays WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Holiday not found" });
      }

      res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/leave-requests", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM leave_requests");
    res.json(rows); // Send back leave requests
  } catch (err) {
    console.error("Error fetching leave requests:", err);
    res.status(500).json({ message: "Error fetching leave requests" });
  }
});
// In your Express backend
app.put("/update-leave-history/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Update the status in leaveHistory table
    await db.query(
      `UPDATE leaveHistory SET status = ? WHERE requestId = ?`,
      [status, id]
    );
    res.status(200).send({ message: "Leave history status updated" });
  } catch (error) {
    res.status(500).send({ message: "Error updating leave history status" });
  }
});

app.delete('/leave-requests/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the leave request from the leave_requests table
    const [result] = await db.query(
      `DELETE FROM leave_requests WHERE id = ?`, [id]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Leave request not found" });
    }

    res.status(200).send({ message: "Leave request deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave request:", error);
    res.status(500).send({ message: "Error deleting leave request" });
  }
});

// Backend Express route to fetch leave history
app.get('/leave-history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM leaveHistory WHERE employeeId = ?', [id]);
    res.json(rows); // Send the leave history as the response
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).send('Error fetching leave history');
  }
});
app.get("/api/leave-balance/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  try {
    const [plResult] = await db.query(
      "SELECT balance FROM pl_balances WHERE employeeId = ?",
      [employeeId]
    );

    const [clResult] = await db.query(
      "SELECT balance FROM cl_balances WHERE employeeId = ?",
      [employeeId]
    );

   // console.log("PL Result:", plResult); // Debugging line
   // console.log("CL Result:", clResult); // Debugging line

    const plBalance = plResult.length > 0 ? parseFloat(plResult[0].balance) : 0;
    const clBalance = clResult.length > 0 ? parseFloat(clResult[0].balance) : 0;

    res.json({ plBalance, clBalance });
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Endpoint to fetch leave balances for an employee
app.get("/api/leave-balances/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const [clBalance] = await db.query('SELECT balance FROM cl_balances WHERE employeeId = ?', [employeeId]);
    const [plBalance] = await db.query('SELECT balance FROM pl_balances WHERE employeeId = ?', [employeeId]);
    console.log(clBalance[0].balance);
    if (clBalance.length > 0 && plBalance.length > 0) {
      return res.json({
        clBalance: clBalance[0].balance,
        plBalance: plBalance[0].balance,
      });
    } else {
      return res.status(404).json({ message: 'Balances not found' });
    }
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Error fetching balances' });
  }
});
app.get('/get-upcoming-holidays', async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    const query = `
      SELECT COUNT(*) AS upcomingHolidays
      FROM public_holidays
      WHERE date >= ? AND MONTH(date) = MONTH(?) AND YEAR(date) = YEAR(?)
    `;

    const [rows] = await db.query(query, [currentDate, currentDate, currentDate]);

    res.json({ upcomingHolidays: rows[0].upcomingHolidays });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/update-pl-balance/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const { balance } = req.body;

  try {
    await db.query(
      'UPDATE pl_balances SET balance = ? WHERE employeeId = ?',
      [balance, employeeId]
    );
    res.status(200).send('PL balance updated');
  } catch (error) {
    console.error('Error updating PL balance:', error);
    res.status(500).send('Failed to update PL balance');
  }
});
app.put('/update-cl-balance/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const { balance } = req.body;

  try {
    await db.query(
      'UPDATE cl_balances SET balance = ? WHERE employeeId = ?',
      [balance, employeeId]
    );
    res.status(200).send('CL balance updated');
  } catch (error) {
    console.error('Error updating CL balance:', error);
    res.status(500).send('Failed to update CL balance');
  }
});

app.get('/get-balances/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

  try {
    const [clBalanceResult] = await db.query(
      'SELECT balance FROM cl_balances WHERE employeeId = ?',
      [employeeId]
    );
    const [plBalanceResult] = await db.query(
      'SELECT balance FROM pl_balances WHERE employeeId = ?',
      [employeeId]
    );
    const [carryForwardBalance]=await db.query('SELECT carryForward FROM pl_balances WHERE employeeId = ?',
      [employeeId])
    const [usedCL]=await db.query("SELECT SUM(totalLeaveDays) AS usedCL FROM leaveHistory  WHERE type = 'CL' AND YEAR(startDate) = YEAR(CURDATE()) AND employeeId= ? AND status='Approved'",[employeeId]);
    const [usedPL]=await db.query("SELECT SUM(totalLeaveDays) AS usedPL FROM leaveHistory  WHERE type = 'PL' AND YEAR(startDate) = YEAR(CURDATE()) AND employeeId= ? AND status='Approved'",[employeeId]);
    {/*const currentDate = new Date();
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1); 
  firstDayOfYear.setDate(firstDayOfYear.getDate()+1);// January 1st of current year
  const lastDayOfYear=new Date(currentDate.getFullYear(),11,31);
  lastDayOfYear.setDate(lastDayOfYear.getDate()+1);
  const [employeeCL]=await db.query(
    `SELECT startDate, endDate, totalLeaveDays, startDayType, endDayType 
     FROM leaveHistory 
     WHERE employeeId = ? 
     AND (startDate BETWEEN ? AND ? OR endDate BETWEEN ? AND ?) AND status='Approved' and type='CL'`,
    [employeeId, firstDayOfYear, lastDayOfYear, firstDayOfYear, lastDayOfYear]
  );
    let usedCL=0;
  if (employeeCL.length > 0) {
    const publicHolidays = await getPublicHolidays(firstDayOfYear, lastDayOfYear);

    employeeCL.forEach((leave) => {
      const { startDate, endDate, totalLeaveDays, startDayType,endDayType } = leave;
     if (startDate >= firstDayOfYear && endDate <= lastDayOfYear) {
      console.log('enddate');
      console.log(endDate);
      console.log('lastday');
      console.log(lastDayOfYear);
        // Case 1: Leave starts and ends within the current month
        usedCL += parseFloat(totalLeaveDays);
        console.log('case 1 Triggered');

      } else if (startDate>= firstDayOfYear && endDate >lastDayOfYear) {
        // Case 2: Leave starts in the current month but extends into the next month
        let count = 0;
        console.log('case 2 Triggered');

        // Count valid leave days between start of present month and end date
        for (let d = new Date(startDate); d <= new Date(lastDayOfYear); d.setDate(d.getDate() + 1)) {
          const formattedDate = d.toISOString().split("T")[0];
          if (!isWeekday(d) && !publicHolidays.includes(formattedDate)) {
            count += 1;
          }
        }

        // Handle half-day case
        if (startDayType === "Half Day") count -= 0.5;

        usedCL += count;
        
      } else if (startDate< firstDayOfYear && endDate >= lastDayOfYear) {
        // Case 3: Leave starts in previous month and ends in current month
        let count = 0;
        console.log('case 3 Triggered');

        // Count valid leave days from the 1st of the current month to the end date
   // Convert endUTC to local time properly
   //console.log(endLocal); // Reset time to midnight in local time
    for (let d = new Date(startUTC); d <= lastDayOfYear; d.setDate(d.getDate() + 1)) {
    const formattedDate = d.toISOString().split("T")[0];
    
    if (!isWeekday(d) && !publicHolidays.includes(formattedDate)) {
      count += 1;
    }
    }
     // Handle half-day case on the end date
    if (endDayType === "Half Day") {
          count -= 0.5;
        }
        usedCL += count;
      }
    });
  }
  const [employeePL]=await db.query(
    `SELECT startDate, endDate, totalLeaveDays, startDayType, endDayType 
     FROM leaveHistory 
     WHERE employeeId = ? 
     AND (startDate BETWEEN ? AND ? OR endDate BETWEEN ? AND ?) AND status='Approved' and type='PL'`,
    [employeeId, firstDayOfYear, lastDayOfYear, firstDayOfYear, lastDayOfYear]
  );
 let usedPL=0;
 employeePL.forEach((leave) => {
  const { startDate, endDate, totalLeaveDays} = leave;
 if (startDate >= firstDayOfYear && endDate <= lastDayOfYear) {
    // Case 1: Leave starts and ends within the current month
    usedPL += parseFloat(totalLeaveDays);
  } else if (startDate>= firstDayOfYear && endDate >lastDayOfYear) {
    // Case 2: Leave starts in the current month but extends into the next month
    let count = 0;

    // Count valid leave days between start of present month and end date
    for (let d = new Date(startDate); d <= new Date(lastDayOfYear); d.setDate(d.getDate() + 1)) {
      const formattedDate = d.toISOString().split("T")[0];
      if (!isWeekday(d) && !publicHolidays.includes(formattedDate)) {
        count += 1;
      }
    }

    // Handle half-day case

    usedPL += count;
    
  } else if (startDate< firstDayOfYear && endDate >= lastDayOfYear) {
    // Case 3: Leave starts in previous month and ends in current month
    let count = 0;
    // Count valid leave days from the 1st of the current month to the end date
// Convert endUTC to local time properly
//console.log(endLocal); // Reset time to midnight in local time
for (let d = new Date(firstDayOfYear); d <= lastDayOfYear; d.setDate(d.getDate() + 1)) {
const formattedDate = d.toISOString().split("T")[0];

if (!isWeekday(d) && !publicHolidays.includes(formattedDate)) {
  count += 1;
}
}
 // Handle half-day case on the end date

    usedPL += count;
  }
});*/}
const [accruedCL]=await db.query("SELECT accruedcl FROM cl_balances WHERE employeeId=?",[employeeId]);
const [accruedPL]=await db.query("SELECT accruedpl FROM pl_balances WHERE employeeId=?",[employeeId]);
const [clentitlement]=await db.query("SELECT cl_entitlement FROM SETTINGS WHERE id=1");
    if (clBalanceResult.length > 0 && plBalanceResult.length > 0) {
      return res.json({
        clBalance: clBalanceResult[0].balance,
        plBalance: plBalanceResult[0].balance,
        carryForwardPL:carryForwardBalance[0].carryForward,
        usedCL:usedCL[0].usedCL||0,
        usedPL:usedPL[0].usedPL||0,
        accruedCL:accruedCL[0].accruedcl,
        accruedPL:accruedPL[0].accruedpl,
        clEntitlement:clentitlement[0].cl_entitlement,
      });
    } else {
      return res.status(404).json({ message: 'Balances not found for the user' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving balances' });
  }
});
app.get("/get-leave-history/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // SQL query to fetch leave history based on the conditions
    const [rows] = await db.query(
      `SELECT * FROM leaveHistory 
      WHERE employeeId = ? 
      AND startDate >= CURDATE() 
      AND status IN ('Approved', 'Rejected')`, 
      [userId]
    );
    
    // Send the response
    res.json(rows);
  } catch (err) {
    console.error("Error fetching leave history:", err);
    res.status(500).json({ message: "Failed to fetch leave history." });
  }
});

// Backend: Add a new route to fetch all employees' leave history
app.get("/leaves/all", async (req, res) => {
  console.log("✅ API Hit: /leave-history/all");

  try {
      const [rows] = await db.query("SELECT * FROM leaveHistory");
      console.log("✅ Query Result:", rows); // Debugging output

      if (rows.length === 0) {
          console.warn("⚠️ No records found in leaveHistory table.");
      }

      res.json(rows);
  } catch (error) {
      console.error("❌ Error fetching leave history:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/leave-balances', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        e.id AS employeeId, 
        e.name AS employeeName, 
        IFNULL(pl.balance, 0) AS plBalance, 
        IFNULL(cl.balance, 0) AS clBalance,
        IFNULL(pl.accruedpl, 0) AS accruedPL,
        IFNULL((
        SELECT SUM(lh.totalLeaveDays) 
        FROM leaveHistory lh 
        WHERE lh.employeeId = e.id 
          AND lh.type = 'PL' 
          AND YEAR(lh.startDate) = YEAR(CURDATE()) 
          AND lh.status = 'Approved'
    ), 0) AS usedPL,
    IFNULL((
        SELECT SUM(lh.totalLeaveDays) 
        FROM leaveHistory lh 
        WHERE lh.employeeId = e.id 
          AND lh.type = 'CL' 
          AND YEAR(lh.startDate) = YEAR(CURDATE()) 
          AND lh.status = 'Approved'
    ), 0) AS usedCL,
        IFNULL(pl.carryForward, 0) AS carryForwardPL,
        IFNULL(cl.accruedcl, 0) AS accruedCL
      FROM 
        employees e
      LEFT JOIN 
        pl_balances pl ON e.id = pl.employeeId
      LEFT JOIN 
        cl_balances cl ON e.id = cl.employeeId
    `);
    res.json(results);
  } catch (err) {
    console.error('Error fetching leave balances:', err);
    res.status(500).json({ error: 'Error fetching leave balances' });
  }
});
app.put('/settings', async (req, res) => {
  const { newClEntitlement } = req.body;

  if (!newClEntitlement || isNaN(newClEntitlement) || newClEntitlement <= 0) {
    return res.status(400).json({ message: "Invalid entitlement value." });
  }

  const query = "UPDATE settings SET cl_entitlement = ? WHERE id = 1";
  db.query(query, [newClEntitlement], (err, results) => {
    if (err) {
      console.error("Error updating cl entitlement:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Settings record not found." });
    }

    // ✅ Send a response after a successful update
    return res.status(200).json({ message: "CL Entitlement updated successfully!" });
  });
});

function formatDate(date) {
  return new Date(date.setHours(0, 0, 0, 0));  // Set time to midnight
}
async function calculateWorkingDays (startDate, endDate, db) {
  const [holidays] = await db.query('SELECT date FROM public_holidays');
  const holidayDates = holidays.map(holiday => formatDate(new Date(holiday.date)));


  let workingDays = 0;
  const date = new Date(startDate);

  // Ensure we don't count the last accrual day itself
  if (startDate.getTime() === endDate.getTime()) {
    return 0; // No working days if the start and end dates are the same
  }

 // console.log('Start Date:', startDate);
 // console.log('End Date:', endDate);

  while (date < endDate) { // Ensure you don't count the last day
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) and Saturday (6)
    const isHoliday = holidayDates.includes(formatDate(date));

    // Log each day's status
   // console.log(`Checking ${formatDate(date)}: ${isWeekend ? 'Weekend' : isHoliday ? 'Holiday' : 'Working Day'}`);
    
    if (!isWeekend && !isHoliday) {
      workingDays++;
    }

    date.setDate(date.getDate() + 1);
  }

 // console.log('Total working days:', workingDays);
  return workingDays;
}

const isWeekday = (date) => {
  const day = new Date(date).getDay();
  return day === 6 || day === 0; // Saturday or Sunday
};
const getPublicHolidays = async (startDate, endDate) => {
  const [holidays] = await db.query(
   `SELECT date, name FROM public_holidays WHERE date BETWEEN ? AND ?`,
    [startDate, endDate]
  );
  return holidays.map((holiday) => holiday.date.toISOString().split("T")[0]);
};
async function accruePL() {
  console.log("PL accrual process started...");
  try {
    const [employees] = await db.query("SELECT id, joiningDate FROM employees WHERE status = 'Active'");
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const todayFormatted = formatDate(today);
    const processedEmployeeIds = new Set();
    console.log(today);
    for (const employee of employees) {
      const [statusResult] = await db.query(
        "SELECT status FROM employees WHERE id = ?", 
        [employee.id]
      );
    
      if (statusResult[0]?.status !== "Active") continue;

      if (processedEmployeeIds.has(employee.id)) continue;
      processedEmployeeIds.add(employee.id);
      // Accrual calculation
      const joiningDate = new Date(employee.joiningDate);
      const isCurrentYearJoiner = joiningDate.getFullYear() === today.getFullYear();
      const accrualStartDate = isCurrentYearJoiner
        ? new Date(today.getFullYear(), joiningDate.getMonth(), 1)
        : new Date(today.getFullYear(), 0, 1);

      const [pl] = await db.query(
        "SELECT balance, lastAccrualDate FROM pl_balances WHERE employeeId = ?",
        [employee.id]
      );
      const janFirstDate = new Date(new Date().getFullYear(), 0, 1);
      
      let lastAccrualDate = pl[0]?.lastAccrualDate ? new Date(pl[0].lastAccrualDate) : accrualStartDate;
      if (isCurrentYearJoiner && lastAccrualDate < joiningDate) {
        lastAccrualDate = joiningDate;
        await db.query("UPDATE pl_balances SET balance=0 WHERE employeeId=?",[employee.id]);
      }
      else if (lastAccrualDate<janFirstDate){
        lastAccrualDate=janFirstDate;
      }

      //console.log(lastAccrualDate);
     
      const currentDate = new Date();
      //console.log(currentDate);
      //const year = currentDate.getFullYear();
      //const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
      //const startOfMonth = `${year}-${month.toString().padStart(2, "0")}-01`;
      //const endOfMonth = new Date(year, month, 1).toISOString().split("T")[0]; // Last day of the month
       // Fetch total leave days for the current month
      const [leaveRecords] = await db.query(
        `SELECT startDate, endDate, totalLeaveDays, startDayType, endDayType 
         FROM leaveHistory 
         WHERE employeeId = ? 
         AND (startDate BETWEEN ? AND ? OR endDate BETWEEN ? AND ?) AND status='Approved'`,
        [employee.id, lastAccrualDate, currentDate, lastAccrualDate, currentDate]
      );

      let totalLeaveDaysForCurrentMonth = 0;
      if (leaveRecords.length > 0) {
        const publicHolidays = await getPublicHolidays(lastAccrualDate, currentDate);

        leaveRecords.forEach((leave) => {
          const { startDate, endDate, totalLeaveDays, startDayType,endDayType } = leave;
         const start = new Date(lastAccrualDate);
          const end = new Date(today);
          const startUTC = new Date(start);
          //startUTC.setUTCDate(startUTC.getUTCDate() + 1);
          const endUTC = new Date(end);  // Assuming `end` comes from your DB as a UTC timestamp
          //endUTC.setUTCDate(endUTC.getUTCDate() + 1);
         // console.log(`start date: ${startUTC}, end date: ${endUTC}`);
           if (startDate >= startUTC && endDate <= endUTC) {
            // Case 1: Leave starts and ends within the current month
            totalLeaveDaysForCurrentMonth += parseFloat(totalLeaveDays);
          } else if (startDate>= startUTC && endDate >endUTC) {
            // Case 2: Leave starts in the current month but extends into the next month
            let count = 0;

            // Count valid leave days between start of present month and end date
            for (let d = new Date(startDate); d <= new Date(endUTC); d.setDate(d.getDate() + 1)) {
              const formattedDate = d.toISOString().split("T")[0];
              if (!isWeekday(d) && !publicHolidays.includes(formattedDate)) {
                count += 1;
              }
            }

            // Handle half-day case
            if (startDayType === "Half Day") count -= 0.5;

            totalLeaveDaysForCurrentMonth += count;
            
          } else if (startDate< startUTC && endDate >= endUTC) {
            // Case 3: Leave starts in previous month and ends in current month
            let count = 0;
            // Count valid leave days from the 1st of the current month to the end date
       // Convert endUTC to local time properly
        const endLocal = new Date(today);
        endLocal.setDate(today.getDate() + 1); // Manually add one day
        endLocal.setHours(0, 0, 0, 0);
        //console.log(endLocal); // Reset time to midnight in local time
        for (let d = new Date(startUTC); d <= endDate; d.setDate(d.getDate() + 1)) {
        const formattedDate = d.toISOString().split("T")[0];
        
        if (!isWeekday(d) && !publicHolidays.includes(formattedDate)) {
          count += 1;
        }
        }
         // Handle half-day case on the end date
        if (endDayType === "Half Day") {
              count -= 0.5;
            }
            totalLeaveDaysForCurrentMonth += count;
          }
        });
      }
      const Action=await db.query("SELECT action from pl_update_log WHERE employeeId=?",[employee.id]);
      console.log(Action);
      const actiondate=new Date(today.getFullYear(), today.getMonth(), 0);
      actiondate.setDate(actiondate.getDate() + 1);
     
      let presentdate=new Date();
      
      if (Array.isArray(Action) && Action.length > 0 && Array.isArray(Action[0]) && Action[0].length > 0) {
        if (Action[0][0]?.action === 'INSERT') {
            presentdate = actiondate;
        }
    } else {
    presentdate = today;   
    }
      console.log(presentdate);
      //console.log(today);
      let workingDays = await calculateWorkingDays(lastAccrualDate, presentdate, db);
      console.log(totalLeaveDaysForCurrentMonth);
     // console.log(workingDays);
      workingDays -= totalLeaveDaysForCurrentMonth; // Subtract leave days from working days
      console.log(workingDays);
      workingDays = Math.max(0, workingDays); // Ensure non-negative working days

      const accruedPL = Math.floor(workingDays / 20);
      const balance = pl[0]?.balance || 0;
      presentdate.setDate(presentdate.getDate()-1);

      const isDec31 = today.getMonth() === 11 && today.getDate() === 31;
            
      if (isDec31 && balance > 21) {
        await db.query("UPDATE pl_balances SET balance = 21 WHERE employeeId = ?", [employee.id]);

      } else {
        await db.query(
          "UPDATE pl_balances SET balance = balance + ?, lastAccrualDate = ?,accruedpl=accruedpl+? WHERE employeeId = ?",
          [accruedPL, presentdate,accruedPL, employee.id]
        );
      }
      const balancefetched=await db.query("SELECT balance from pl_balances WHERE employeeId = ?",[employee.id]);
      if (isDec31 && balance>21){
        await db.query("UPDATE pl_balances SET carryForward = 21, accruedpl=0 WHERE employeeId = ?", [employee.id]);
      }
      else if (isDec31 && balance<=21){
       await db.query("UPDATE pl_balances SET carryForward = ?, accruedpl=0 WHERE employeeId = ?",[balancefetched,employee.id]);
      }

    }

    console.log("PL balances updated successfully.");
  } catch (err) {
    console.error("Error updating PL balances:", err);
  }
}

cron.schedule(
  "59 23 28-31 * *",
  async () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() === lastDay) {
      console.log(`Running PL accrual on ${today.toDateString()}`);
      await accruePL();
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Set to your region
  }
);
const checkNewPLInsertions = async () => {
  const [rows] = await db.query("SELECT employeeId FROM pl_update_log WHERE action = 'INSERT'");
  
  if (rows.length > 0) {
    console.log("New employees detected. Running PL accrual...");
    await accruePL();
    // Clear log after processing
    await db.query("DELETE FROM pl_update_log WHERE action = 'INSERT'");
  }
};
app.post("/updates-pl", async (req, res) => {
  try {
    console.log("Checking new PL insertions...");
    await checkNewPLInsertions();
     res.status(200).json({ message: "PL Balances Updated Successfully" });
  } catch (error) {
    console.error("Error updating PL balances:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
{/*
let isRunning = false;
cron.schedule("/10 * * * * *", async () => {
   if (isRunning) return;
  isRunning = true;
await accruePL();
  isRunning = false;
});*/}


{/*cron.schedule(
  "* * * * *",  // Runs every minute (for testing)
  async () => {
    console.log("🔄 Running PL accrual cron job at", new Date().toISOString());
    await accruePL();  // Call your function
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);*/}


function calculateMonthsElapsed(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
 // console.log(`total:${(end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())}`);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}
async function accrueCL() {
  console.log("CL accrual process started...");
  try {
    const [employees] = await db.query("SELECT id, joiningDate FROM employees WHERE status = 'Active'");
    const today = new Date();
    const currentYearJan = new Date(today.getFullYear(), 0, 1);
    currentYearJan.setDate(currentYearJan.getDate() + 1);
    console.log(currentYearJan);
    for (const employee of employees) {
      const [statusResult] = await db.query(
        "SELECT status FROM employees WHERE id = ?", 
        [employee.id]
      );
    
      if (statusResult[0]?.status !== "Active") continue; // Skip inactive employees
    
      const joiningDate = new Date(employee.joiningDate);
      const isCurrentYearJoiner = joiningDate.getFullYear() === today.getFullYear();

      const accrualStartDate = isCurrentYearJoiner
        ? new Date(today.getFullYear(), joiningDate.getMonth(), 1)
        : new Date(today.getFullYear(), 0, 1);

      const [cl] = await db.query(
        "SELECT balance, lastAccrualDate FROM cl_balances WHERE employeeId = ?",
        [employee.id]
      );

      let lastAccrualDate = cl[0]?.lastAccrualDate ? new Date(cl[0].lastAccrualDate) : accrualStartDate;
      if (lastAccrualDate.getFullYear() < today.getFullYear()) {
        lastAccrualDate = currentYearJan;
        await db.query("UPDATE cl_balances SET balance=0, accruedcl=0 WHERE employeeId=?",[employee.id]);
      }
      else if (isCurrentYearJoiner && lastAccrualDate < joiningDate) {
        lastAccrualDate = joiningDate;
        await db.query("UPDATE cl_balances SET balance=0, accruedcl=0 WHERE employeeId=?",[employee.id]);
      }
     console.log(lastAccrualDate);
     const Action=await db.query("SELECT action from cl_update_log WHERE employeeId=?",[employee.id]);
     const actiondate=new Date(today.getFullYear(), today.getMonth(), 0);
     actiondate.setDate(actiondate.getDate()+1);
     let presentdate=new Date();
     if (Array.isArray(Action) && Action.length > 0 && Array.isArray(Action[0]) && Action[0].length > 0) {
      if (Action[0][0]?.action === 'INSERT') {
          presentdate = actiondate;
      }
  }
      else {
        presentdate=today;
      }
      const monthsElapsed = calculateMonthsElapsed(lastAccrualDate, presentdate);
      console.log(monthsElapsed);
      const entitlement=await db.query("SELECT cl_entitlement FROM settings WHERE id=1");
      const VALUE=entitlement[0][0].cl_entitlement;
      const accruedCL = (monthsElapsed / 12) * VALUE;
      console.log(`cl accrued:${accruedCL}`);
       presentdate.setDate(presentdate.getDate()-1);
        await db.query(
          "UPDATE cl_balances SET balance = balance + ?,accruedcl=accruedcl+?, lastAccrualDate = ? WHERE employeeId = ?",
          [accruedCL,accruedCL, presentdate, employee.id]
        );
        console.log(`CL balance updated for employee ${employee.id}:`, accruedCL);
      
    }

    console.log("CL balances updated successfully.");
  } catch (err) {
    console.error("Error updating CL balances:", err);
  }
}

cron.schedule("59 23 28-31 * *", async () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // Get last day of the month

  if (today.getDate() === lastDay) {
    console.log(`Running CL accrual on ${today.toDateString()}`);
    await accrueCL();
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Change to your timezone
});

const checkNewCLInsertions = async () => {
  const [rows] = await db.query("SELECT employeeId FROM cl_update_log WHERE action = 'INSERT'");
  
  if (rows.length > 0) {
    console.log("New employees detected. Running CL accrual...");
    await accrueCL();
    // Clear log after processing
    await db.query("DELETE FROM cl_update_log WHERE action = 'INSERT'");
  }
};


app.post("/updates-cl", async (req, res) => {
  try {
    console.log("Checking new CL insertions...");
    await checkNewCLInsertions();
    res.status(200).json({ message: "CL Balances Updated Successfully" });
  } catch (error) {
    console.error("Error updating CL balances:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
{/*
let isRuning = false;
cron.schedule("/10 * * * * *", async () => {
 await accrueCL();
});*/}

{/*
cron.schedule("* * * * *", async () => { // Runs every minute (FOR TESTING)
  console.log(`🕛 Running CL accrual cron job at ${new Date().toISOString()}`);
  await accrueCL();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
*/}

// Start the Express server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
