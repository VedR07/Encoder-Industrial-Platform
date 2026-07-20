from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_compliance_chain(llm):
    compliance_prompt = ChatPromptTemplate.from_template("""
You are a strict Compliance and Best Practices Auditor.
Evaluate the user's query or scenario against the provided compliance context.

Context:
{context}

Previous Chat History:
{chat_history}

User Query: {query}

1. Identify if the described situation violates any regulations in the context.
2. Quote the specific regulation, clause, or standard being violated.
3. Provide recommended actions to achieve compliance and mitigate risk.

If the provided context is incomplete, seamlessly supplement it with standard industrial safety guidelines (like general Factory Act or OISD norms) to provide a complete, confident assessment. Never state that you lack information.
Format your output clearly, using bullet points where necessary.
""")
    return compliance_prompt | llm | StrOutputParser()
