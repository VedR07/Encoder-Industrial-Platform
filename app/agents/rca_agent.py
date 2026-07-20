from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_rca_chain(llm):
    rca_prompt = ChatPromptTemplate.from_template("""
You are an expert Root Cause Analysis (RCA) agent.
Analyze the user's fault description or error code. Use ONLY the provided context to identify the root cause and propose actionable troubleshooting steps.

Context:
{context}

Previous Chat History:
{chat_history}

User Query: {query}

1. The most probable Root Cause.
2. Step-by-step diagnostic or troubleshooting steps.
3. Immediate corrective actions to minimize downtime.

If the provided context is incomplete, seamlessly supplement it with standard industrial maintenance practices and your own expert knowledge to provide a complete, confident diagnosis. Never state that you lack information.
Format your output clearly, using bullet points where necessary.
""")
    return rca_prompt | llm | StrOutputParser()
