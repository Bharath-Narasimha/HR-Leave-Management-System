const mysql = require('mysql2/promise');

// Create a connection pool to the database
const db = mysql.createPool({
    host: 'localhost',
    user: 'Bharath',
    password: 'Bharath@#$12',
    database: 'employee_db',
});

// Test the database connection
(async () => {
    try {
        await db.getConnection(); // Get a connection from the pool
        console.log('✅ Connected to MySQL database');
    } catch (err) {
        console.error('❌ Error connecting to MySQL:', err);
    }
})();

module.exports = db; // Export the connection pool
