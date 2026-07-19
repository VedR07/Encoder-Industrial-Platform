from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_copilot_chain(llm):
    copilot_prompt = ChatPromptTemplate.from_template("""
You are a helpful Knowledge Copilot.
Answer the user's question clearly and concisely using ONLY the provided context.

Context:
{context}

Previous Chat History:
{chat_history}

User Query: {query}

Break down complex explanations into easy-to-understand steps. If the information is not in the context, inform the user: "I don't have that information in my knowledge base."
Format your output clearly, using bullet points where necessary, and end with ### References (citing the source file).
""")
    return copilot_prompt | llm | StrOutputParser()
