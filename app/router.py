from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load API key securely from .env
from app.config import GOOGLE_API_KEY

# Import all three specialized agent chains
from app.agents.rca_agent import get_rca_chain
from app.agents.compliance_agent import get_compliance_chain
from app.agents.copilot_agent import get_copilot_chain

# Initialize LLM with low temperature for reduced hallucination
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.1)

# Initialize all three agent chains
rca_chain = get_rca_chain(llm)
compliance_chain = get_compliance_chain(llm)
copilot_chain = get_copilot_chain(llm)

# Router Prompt
router_prompt = ChatPromptTemplate.from_template("""
You are an intelligent router for an industrial automation support system.
Classify the following user query into exactly one of three categories: 
1. "RCA" (if the query is about diagnosing errors, faults, or troubleshooting)
2. "COMPLIANCE" (if the query is about guidelines, best practices, or code standards)
3. "COPILOT" (if the query is a general how-to, concept explanation, or basic knowledge question)

User Query: {query}

Output ONLY the category name (RCA, COMPLIANCE, or COPILOT) and nothing else.
""")

# Global chat history for prototype
global_chat_history = []

def route_query(info: Dict[str, Any]) -> str:
    """
    Routes the query to the appropriate agent chain based on the router's classification.
    """
    router_chain = router_prompt | llm | StrOutputParser()
    category = router_chain.invoke({"query": info["query"]}).strip().upper()
    
    print(f"[Router] Query classified as: {category}")
    
    if category == "RCA":
        return rca_chain.invoke(info)
    elif category == "COMPLIANCE":
        return compliance_chain.invoke(info)
    else:
        # Default to copilot for general queries or unclear classifications
        return copilot_chain.invoke(info)

def process_query_with_agents(query: str, context: str) -> str:
    """
    Main entry point for processing a user query with RAG context.
    """
    global global_chat_history
    
    # Format the last 6 messages (3 turns) into a readable string
    history_str = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in global_chat_history[-6:]]
    )
    if not history_str:
        history_str = "None"
        
    agent_input = {
        "query": query,
        "context": context,
        "chat_history": history_str
    }
    
    # Get the AI response
    response = route_query(agent_input)
    
    # Save the interaction to memory
    global_chat_history.append({"role": "User", "content": query})
    global_chat_history.append({"role": "AI", "content": response})
    
    return response

# For testing logic standalone
if __name__ == "__main__":
    test_query = "What does error code F30005 mean?"
    test_context = "Source: G120C_manual.pdf\nF30005 means overvoltage. Check power supply."
    print("Testing routing and agent execution...")
    print(process_query_with_agents(test_query, test_context))
