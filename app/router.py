from typing import Dict, Any
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load Ollama config
from app.config import OLLAMA_BASE_URL

# Import all three specialized agent chains
from app.agents.rca_agent import get_rca_chain
from app.agents.compliance_agent import get_compliance_chain
from app.agents.copilot_agent import get_copilot_chain

# Initialize LLM — always use explicit localhost URL to avoid Ollama desktop app port conflicts
llm = ChatOllama(
    model="gemma3:4b",
    temperature=0.1,
    base_url="http://localhost:11434",
    timeout=120,
    num_predict=1024,
)

# Initialize all three agent chains once at startup
rca_chain = get_rca_chain(llm)
compliance_chain = get_compliance_chain(llm)
copilot_chain = get_copilot_chain(llm)

# Global chat history for prototype (keyed by session_id)
global_chat_history: Dict[str, list] = {}

def route_query(info: Dict[str, Any], forced_agent: str = None) -> str:
    """
    Routes the query to the appropriate agent chain.
    If forced_agent is set ("RCA", "COMPLIANCE", "COPILOT"), uses that directly.
    Otherwise falls back to keyword-based routing.
    """
    if forced_agent == "RCA":
        category = "RCA"
        result = rca_chain.invoke(info)
    elif forced_agent == "COMPLIANCE":
        category = "COMPLIANCE"
        result = compliance_chain.invoke(info)
    elif forced_agent == "COPILOT":
        category = "COPILOT"
        result = copilot_chain.invoke(info)
    else:
        # Keyword-based auto-routing
        query_lower = info["query"].lower()

        rca_keywords = [
            "error", "fault", "alarm", "failure", "trip", "f3", "a7", "diagnos",
            "root cause", "troubleshoot", "warning", "vibration", "overheat",
            "overcurrent", "overvoltage", "underheat", "spike", "malfunction"
        ]
        compliance_keywords = [
            "compliance", "regulation", "standard", "oisd", "factory act", "audit",
            "guideline", "requirement", "safety", "procedure", "inspection", "legal",
            "mandatory", "permit", "certificate", "violation", "protocol"
        ]

        if any(kw in query_lower for kw in rca_keywords):
            category = "RCA"
            result = rca_chain.invoke(info)
        elif any(kw in query_lower for kw in compliance_keywords):
            category = "COMPLIANCE"
            result = compliance_chain.invoke(info)
        else:
            category = "COPILOT"
            result = copilot_chain.invoke(info)

    print(f"[Router] Query classified as: {category} (forced={forced_agent is not None})")
    return result


def process_query_with_agents(query: str, context: str, forced_agent: str = None, session_id: str = "default") -> str:
    """
    Main entry point for processing a user query with RAG context.
    forced_agent: "RCA", "COMPLIANCE", or "COPILOT" — skips auto-routing when set.
    """
    global global_chat_history

    if session_id not in global_chat_history:
        global_chat_history[session_id] = []
        
    history_list = global_chat_history[session_id]

    # Format the last 6 messages (3 turns) into a readable string
    history_str = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in history_list[-6:]]
    )
    if not history_str:
        history_str = "None"

    agent_input = {
        "query": query,
        "context": context,
        "chat_history": history_str
    }

    # Get the AI response, passing forced_agent through
    response = route_query(agent_input, forced_agent=forced_agent)

    # Save the interaction to memory
    history_list.append({"role": "User", "content": query})
    history_list.append({"role": "AI", "content": response})

    return response


# For testing logic standalone
if __name__ == "__main__":
    test_query = "What does error code F30005 mean?"
    test_context = "Source: G120C_manual.pdf\nF30005 means overvoltage. Check power supply."
    print("Testing routing and agent execution...")
    print(process_query_with_agents(test_query, test_context))
