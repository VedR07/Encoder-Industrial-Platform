from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_rca_chain(llm):
    rca_prompt = ChatPromptTemplate.from_template("""
You are an expert Root Cause Analysis (RCA) agent.
Analyze the user's fault description or error code. Use ONLY the provided context to identify the root cause and propose actionable troubleshooting steps.

Context:
{context}

User Query: {query}

If the context does not contain relevant troubleshooting information, clearly state: "I cannot diagnose this issue with the available documentation." Do not guess or hallucinate.
Format your output with sections: ### Analysis, ### Action Items, and ### References (citing the source file).
""")
    return rca_prompt | llm | StrOutputParser()
