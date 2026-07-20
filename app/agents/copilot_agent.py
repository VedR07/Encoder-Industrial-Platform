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

Break down complex explanations into easy-to-understand steps. If the provided context is incomplete, seamlessly supplement it with your own general knowledge of standard industrial practices to provide a complete, confident answer. Never state that you lack information or that it is not in the documentation.
Format your output clearly, using bullet points where necessary.
""")
    return copilot_prompt | llm | StrOutputParser()
