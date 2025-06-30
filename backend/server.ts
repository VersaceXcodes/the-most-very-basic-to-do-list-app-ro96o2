import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ESM workaround for __dirname
const __filename = fileURLToURL(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Connection (Included as per instructions, but NOT USED for Taks MVP) ---
// The BRD explicitly states that the NexTask MVP is purely client-side and uses LocalStorage.
// Therefore, the database connection is set up here as instructed for future potential use or
// to demonstrate capability, but no API routes for tasks will interact with it in this MVP.
import pkg from 'pg';
const { Pool } = pkg;
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: { require: true }
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true }, // Ensure SSL is enabled for PostgreSQL connections
      }
);

/**
 * @function testDbConnection
 * @description Tests the PostgreSQL database connection and logs the result.
 *            This function is for demonstration/testing purposes and not directly
 *            part of the application's core logic as defined by the BRD for task management.
 */
async function testDbConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('PostgreSQL database connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Current database time:', res.rows[0].now);
  } catch (err) {
    console.error('PostgreSQL database connection error:', err.message, '\nDetails:', err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Call the DB connection test if you want to verify it starts up correctly
// testDbConnection(); 
// Not calling this by default, as the app strictly relies on LocalStorage for tasks as per specs.

// --- Middleware ---

/**
 * @description Enable Cross-Origin Resource Sharing (CORS) for all routes.
 *              This allows client-side applications from different origins to make requests.
 *              While not strictly necessary for a purely static file server on the same domain,
 *              it's a good practice for web applications and aligns with the typical setup.
 */
app.use(cors());

/**
 * @description Parse incoming JSON requests.
 *              This middleware automatically parses the JSON payload of incoming requests
 *              and makes it available on `req.body`.
 *              Although no JSON API endpoints are present in this MVP (due to client-side data),
 *              it's included for completeness in a typical Express setup.
 */
app.use(express.json());

/**
 * @description Parse incoming URL-encoded requests.
 *              This middleware parses requests with `Content-Type: application/x-www-form-urlencoded`
 *              and makes the parsed data available on `req.body`.
 *              `extended: true` allows for rich objects and arrays to be encoded into the URL-encoded format.
 *              Similar to `express.json()`, its immediate utility is limited in this MVP but is standard.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * @description HTTP request logger middleware.
 *              Logs details of every incoming request to the console.
 *              Useful for debugging and monitoring during development.
 *              The 'dev' format provides a concise, color-coded output.
 */
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - Headers: :req[headers] - Params: :req[params] - Query: :req[query] - Body: :req[body]', {
  skip: (req, res) => req.method === 'GET' && req.url !== '/' // Skip logging for static file requests (except for root) to keep console clean for dev.
}));


// --- Static Files and SPA Routing ---

/**
 * @description Serve static files from the 'public' directory.
 *              This middleware serves all static assets (HTML, CSS, JavaScript, images, etc.)
 *              located in the 'public' folder. When a request comes in, Express will first
 *              look for a matching file in this directory.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * @description Catch-all route for Single Page Application (SPA) routing.
 *              For any GET request that doesn't match a static file or a specific API endpoint (if any),
 *              this route will send `index.html`. This is crucial for SPAs, as it allows client-side
 *              routing libraries to handle different URLs while always serving the same base HTML file.
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Server Start ---

/**
 * @description Starts the Express server.
 *              The server listens for incoming HTTP requests on the specified port.
 *              A callback function logs a message to the console once the server is successfully running.
 */
app.listen(PORT, () => {
  console.log(`NexTask Server running on http://localhost:${PORT}`);
});
