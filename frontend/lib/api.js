/**
 * api.js
 * ------
 * Shared API client for the Encoder Industrial Platform frontend.
 * All backend communication goes through this file.
 *
 * Backend endpoint: POST /query
 * Request:  { query: string }
 * Response: { agent: string, response: string }
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Sends a query to the backend multi-agent system.
 * The backend automatically routes to the correct agent (RCA, Compliance, or Copilot).
 *
 * @param {string} query - The user's question or fault description.
 * @returns {Promise<{ agent: string, response: string }>}
 */
export async function queryAgent(query) {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error (${response.status}): ${errorText}`);
  }

  return response.json(); // { agent: string, response: string }
}

/**
 * Pings the backend root endpoint to check if it is online.
 * @returns {Promise<boolean>} true if online, throws if offline.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
  if (!response.ok) throw new Error('Backend offline');
  return true;
}
