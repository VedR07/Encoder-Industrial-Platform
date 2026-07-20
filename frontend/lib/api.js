/**
 * api.js
 * ------
 * Shared API client for the Encoder Industrial Platform frontend.
 * All backend communication goes through this file.
 *
 * Backend endpoint: POST /query
 * Request:  { query: string, agent_type?: "RCA" | "COMPLIANCE" | "COPILOT" }
 * Response: { agent: string, response: string }
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Sends a query to the backend multi-agent system.
 *
 * @param {string} query      - The user's question or fault description.
 * @param {string} agentType  - Optional: "RCA", "COMPLIANCE", or "COPILOT".
 *                              When provided, bypasses auto-routing and forces
 *                              the request to the specified agent.
 * @returns {Promise<{ agent: string, response: string }>}
 */
export async function queryAgent(query, agentType = null) {
  const body = { query };
  if (agentType) body.agent_type = agentType;

  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

/**
 * Fetches dashboard KPI metrics from the backend.
 * @returns {Promise<{ uptime, active_hypotheses, outstanding_audits, critical_gaps }>}
 */
export const fetchMetrics = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE_URL}/ingest`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) throw new Error('Document ingestion failed');
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
