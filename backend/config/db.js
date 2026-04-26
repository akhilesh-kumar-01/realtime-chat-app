const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to the MySQL database
// A pool is better because it can handle multiple connections automatically
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to check if the database connection is working with retry logic
const checkConnection = async (retries = 5) => {
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log("MySQL Connected successfully");
      connection.release(); // release the connection back to the pool
      return; // Exit loop if successful
    } catch (error) {
      console.error(`MySQL Connection Error: ${error.message}. Retrying in 2 seconds...`);
      retries -= 1;
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error("MySQL Connection Failed after 5 retries. Please ensure your database server is running.");
};

// Run the check when the file is loaded
checkConnection();

// Export the pool so we can use it in other files to run queries
module.exports = pool;
