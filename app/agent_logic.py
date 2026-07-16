import os
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 1. Base Setup and LLM Initialization
# TODO: Insert Google API Key here later or export as environment variable
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "YOUR_GOOGLE_API_KEY_HERE")

# We use temperature=0.1 to keep the LLM grounded and reduce hallucinations
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.1)

# 2. Prompt Engineering

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

# RCA Agent Prompt
rca_prompt = ChatPromptTemplate.from_template("""
You are an expert Root Cause Analysis (RCA) agent.
Analyze the user's fault description or error code. Use ONLY the provided context to identify the root cause and propose actionable troubleshooting steps.

Context:
{context}

User Query: {query}

If the context does not contain relevant troubleshooting information, clearly state: "I cannot diagnose this issue with the available documentation." Do not guess or hallucinate.
Format your output with sections: ### Analysis, ### Action Items, and ### References (citing the source file).
""")

# Compliance Agent Prompt
compliance_prompt = ChatPromptTemplate.from_template("""
You are a strict Compliance and Best Practices Auditor.
Evaluate the user's query or scenario against the provided compliance context.

Context:
{context}

User Query: {query}

Highlight any violations of the guidelines, cite the relevant section, and provide the recommended compliant approach. 
If the context does not address the query, state: "The provided guidelines do not cover this scenario."
Format your output with sections: ### Evaluation, ### Violations, ### Recommendations, and ### References (citing the source file).
""")

# Knowledge Copilot Prompt
copilot_prompt = ChatPromptTemplate.from_template("""
You are a helpful Knowledge Copilot.
Answer the user's question clearly and concisely using ONLY the provided context.

Context:
{context}

User Query: {query}

Break down complex explanations into easy-to-understand steps. If the information is not in the context, inform the user: "I don't have that information in my knowledge base."
Format your output clearly, using bullet points where necessary, and end with ### References (citing the source file).
""")

# 3. Agent Workflow and Routing Chains

rca_chain = rca_prompt | llm | StrOutputParser()
compliance_chain = compliance_prompt | llm | StrOutputParser()
copilot_chain = copilot_prompt | llm | StrOutputParser()

def route_query(info: Dict[str, Any]) -> str:
    """
    Routes the query to the appropriate agent chain based on the router's classification.
    """
    # Ask the LLM to classify the query
    router_chain = router_prompt | llm | StrOutputParser()
    category = router_chain.invoke({"query": info["query"]}).strip().upper()
    
    print(f"[Router] Query classified as: {category}")
    
    # Execute the corresponding chain
    if category == "RCA":
        return rca_chain.invoke(info)
    elif category == "COMPLIANCE":
        return compliance_chain.invoke(info)
    else:
        # Default to copilot if classification is unclear
        return copilot_chain.invoke(info)

def process_query_with_agents(query: str, context: str) -> str:
    """
    Main entry point for processing a user query with RAG context.
    """
    agent_input = {
        "query": query,
        "context": context
    }
    
    # Route and execute
    return route_query(agent_input)

# For testing logic standalone
if __name__ == "__main__":
    test_query = "What does error code F30005 mean?"
    test_context = "Source: G120C_manual.pdf\nF30005 means overvoltage. Check power supply."
    print("Testing routing and agent execution...")
    print(process_query_with_agents(test_query, test_context))

