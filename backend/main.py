from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import fitz
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key="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")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@app.post("/analyse")
async def analyse_resume(
    pdf: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        pdf_bytes = await pdf.read()
        resume_text = extract_text_from_pdf(pdf_bytes)

        prompt = f"""
        You are an expert HR recruiter and resume analyst.
        
        Analyse this resume against the job description and provide:
        1. A score out of 100
        2. Top 3 strengths of the resume
        3. Top 3 missing skills or weaknesses
        4. One line overall suggestion
        
        Resume:
        {resume_text}
        
        Job Description:
        {job_description}
        
        Respond in this exact format:
        SCORE: (number)/100
        STRENGTHS:
        - (strength 1)
        - (strength 2)
        - (strength 3)
        WEAKNESSES:
        - (weakness 1)
        - (weakness 2)
        - (weakness 3)
        SUGGESTION: (one line suggestion)
        """

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"result": response.choices[0].message.content}

    except Exception as e:
        print("ERROR:", str(e))
        return {"result": f"Error: {str(e)}"}