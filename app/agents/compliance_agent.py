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

Highlight any violations of the guidelines, cite the relevant section, and provide the recommended compliant approach. 
If the context does not address the query, state: "The provided guidelines do not cover this scenario."
Format your output with sections: ### Evaluation, ### Violations, ### Recommendations, and ### References (citing the source file).
""")
    return compliance_prompt | llm | StrOutputParser()
