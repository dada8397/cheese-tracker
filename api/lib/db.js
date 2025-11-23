import pg from 'pg';
const { Client } = pg;

/**
 * Database connection utility
 * Uses standard pg (node-postgres) client for database operations
 * Supports standard PostgreSQL connection strings including Prisma Accelerate
 */

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Create client for connection
let client = null;

if (connectionString) {
  try {
    client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Prisma Accelerate and some cloud providers
      }
    });
  } catch (error) {
    console.error('Failed to create database client:', error);
  }
} else {
  console.warn('No connection string found (POSTGRES_URL or DATABASE_URL)');
}

// Track connection state
let isConnected = false;

/**
 * Ensure client is connected
 */
async function ensureConnected() {
  if (!client) {
    throw new Error('Database client not initialized. Check POSTGRES_URL or DATABASE_URL environment variable.');
  }
  
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
}

/**
 * SQL template literal wrapper
 * Usage: await sql`SELECT * FROM users WHERE id = ${id}`
 * Converts template literal to parameterized query
 */
export const sql = async (strings, ...values) => {
  await ensureConnected();
  
  // Convert template literal to parameterized query
  let queryText = '';
  const params = [];
  
  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      queryText += `$${params.length}`;
    }
  }
  
  try {
    const result = await client.query(queryText, params);
    return result;
  } catch (error) {
    console.error('SQL query error:', error);
    throw error;
  }
};

/**
 * Execute a SQL query with error handling
 * Note: Prefer using sql template literal for better performance and safety
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<Object>} Query result
 */
export async function query(queryText, params = []) {
  try {
    await ensureConnected();
    const result = await client.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a SQL query that expects a single row
 * Note: Prefer using sql template literal for better performance
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<Object|null>} Single row or null
 */
export async function queryOne(queryText, params = []) {
  try {
    await ensureConnected();
    const result = await client.query(queryText, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a SQL query that expects multiple rows
 * Note: Prefer using sql template literal for better performance
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<Array>} Array of rows
 */
export async function queryMany(queryText, params = []) {
  try {
    await ensureConnected();
    const result = await client.query(queryText, params);
    return result.rows || [];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Check database connection
 * @returns {Promise<boolean>} True if connected
 */
export async function checkConnection() {
  try {
    if (!client) {
      return false;
    }
    
    await ensureConnected();
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    isConnected = false;
    return false;
  }
}

/**
 * Get the database client for advanced operations
 * @returns {Client|null} The database client
 */
export function getClient() {
  return client;
}

