from src.llm import GeminiLLM
from src.agents.rca_agent import get_rca_prompt
from src.agents.compliance_agent import get_compliance_prompt
from src.agents.copilot_agent import get_copilot_prompt
from src.utils import setup_logger

logger = setup_logger(__name__)

def route_and_execute_query(query: str, context: str, llm: GeminiLLM) -> str:
    """
    Classifies the user query and routes it to the appropriate specialized agent.
    Returns the agent's response.
    """
    router_prompt = f"""You are an intelligent router for an industrial automation support system.
Classify the following user query into exactly one of three categories: 
1. "RCA" (if the query is about diagnosing errors, faults, or troubleshooting)
2. "COMPLIANCE" (if the query is about guidelines, best practices, or code standards)
3. "COPILOT" (if the query is a general how-to, concept explanation, or basic knowledge question)

User Query: {query}

Output ONLY the category name (RCA, COMPLIANCE, or COPILOT) and nothing else."""

    try:
        # 1. Classify the query
        category = llm.generate(router_prompt).strip().upper()
        
        # Clean up any potential markdown formatting in response (e.g. `RCA`)
        category = category.replace("`", "").replace('"', "").replace("'", "")
        logger.info(f"[Router] Query classified as: {category}")

        # 2. Select the right agent prompt
        if "RCA" in category:
            final_prompt = get_rca_prompt(query, context)
            agent_used = "RCA"
        elif "COMPLIANCE" in category:
            final_prompt = get_compliance_prompt(query, context)
            agent_used = "COMPLIANCE"
        else:
            final_prompt = get_copilot_prompt(query, context)
            agent_used = "COPILOT"

        # 3. Generate response
        response = llm.generate(final_prompt)
        
        # We prefix the response with the agent used for transparency (optional)
        return f"[{agent_used} AGENT]\n\n{response}"

    except Exception as e:
        logger.error(f"Error in Multi-Agent Router: {e}")
        raise
