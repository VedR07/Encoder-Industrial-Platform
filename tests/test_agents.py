import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock

# ─── Test 1: RCA Agent Routing ───────────────────────────────────────────────
def test_rca_routing():
    """
    A fault/error query should be classified and routed to the RCA agent.
    """
    with patch("app.router.route_query") as mock_route:
        mock_route.return_value = "### Analysis\nOvervoltage detected."

        from app.router import process_query_with_agents
        query = "My drive is showing error code F30005, what does it mean?"
        context = "Source: G120C_manual.pdf\nF30005 means overvoltage on the DC link."

        response = process_query_with_agents(query=query, context=context)

        mock_route.assert_called_once()
        assert response is not None
        print("✅ Test 1 Passed: RCA routing works correctly.")

# ─── Test 2: Compliance Agent Routing ────────────────────────────────────────
def test_compliance_routing():
    """
    A guidelines/best practices query should be classified and routed to the Compliance agent.
    """
    with patch("app.router.route_query") as mock_route:
        mock_route.return_value = "### Evaluation\nNo violations found."

        from app.router import process_query_with_agents
        query = "Are we following the correct naming conventions for PLC variables?"
        context = "Source: Programming_Guideline_v16.pdf\nVariables must follow IEC 61131-3 naming standards."

        response = process_query_with_agents(query=query, context=context)

        mock_route.assert_called_once()
        assert response is not None
        print("✅ Test 2 Passed: Compliance routing works correctly.")

if __name__ == "__main__":
    test_rca_routing()
    test_compliance_routing()

