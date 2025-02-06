from fastapi import FastAPI, UploadFile, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pdf_parser import process_pdf
import os
from typing import List

API_KEY = os.getenv("PDF_PARSER_API_KEY")
if not API_KEY:
    raise ValueError("PDF_PARSER_API_KEY environment variable is not set")
    
ALLOWED_ORIGINS = os.getenv("PDF_PARSER_ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(title="PDF Parser Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# API Key security
api_key_header = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key

@app.post("/parse")
async def parse_pdf(
    file: UploadFile,
    api_key: str = Depends(get_api_key)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        contents = await file.read()
        result = process_pdf(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
