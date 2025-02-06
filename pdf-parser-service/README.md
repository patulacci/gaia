# PDF Parser Service

A FastAPI-based microservice that extracts and processes text content from PDF files, dividing it into logical sections.

## Features

- PDF text extraction using PDFMiner
- Section-based content organization
- API key authentication
- CORS support
- Docker deployment ready

## Prerequisites

- Python 3.11+
- Docker (for containerized deployment)

## Environment Variables Setup

### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PDF_PARSER_API_KEY` | Authentication key for API access. This is a security measure to protect your API endpoints. Generate ONE secure key to use across all environments (local and production). | Yes | None |
| `PDF_PARSER_ALLOWED_ORIGINS` | Comma-separated list of allowed origins for CORS. Use "*" to allow all origins (not recommended for production). | No | "*" |

### Environment Setup Guide

1. Generate a secure API key
   ```bash
   # You can use OpenSSL to generate a secure random key
   openssl rand -base64 32
   ```
   Save this key - you'll use the same key for both local development and production.

2. Set up your environment variables:

   For local development:
   ```bash
   export PDF_PARSER_API_KEY="your-generated-api-key"
   export PDF_PARSER_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
   ```

   For production:
   ```bash
   export PDF_PARSER_API_KEY="same-generated-api-key"
   export PDF_PARSER_ALLOWED_ORIGINS="https://your-production-domain.com"
   ```

## Development Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Docker Deployment

1. Navigate to the pdf-parser-service directory:
```bash
cd pdf-parser-service
```

2. Build the Docker image:
```bash
docker build -t pdf-parser-service .
```

3. Run the container with environment variables:
```bash
docker run -d \
  -p 8001:8000 \
  -e PDF_PARSER_API_KEY="your-api-key" \
  -e PDF_PARSER_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173" \
  pdf-parser-service
```

## API Documentation

### Parse PDF

Extracts text content from a PDF file and returns it organized in sections.

**Endpoint:** `POST /parse`

**Headers:**
- `X-API-Key`: Your API key for authentication (same key used in environment variables)
- `Content-Type`: multipart/form-data

**Request Body:**
- `file`: PDF file (multipart/form-data)

**Response Format:**
```json
{
  "sections": [
    {
      "content": "Section text content..."
    },
    {
      "content": "Another section text content..."
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: File must be a PDF
- `403 Forbidden`: Invalid API key
- `500 Internal Server Error`: Processing error

## Example Usage

```python
import requests

url = "http://host.docker.internal:8000/parse"
headers = {
    "X-API-Key": "your-api-key-here"  # Same key set in PDF_PARSER_API_KEY environment variable
}
files = {
    "file": ("document.pdf", open("document.pdf", "rb"), "application/pdf")
}

response = requests.post(url, headers=headers, files=files)
sections = response.json()["sections"]
```

## Security Notes

1. Keep your API_KEY secure and never commit it to version control
2. Use HTTPS in production
3. Set ALLOWED_ORIGINS to specific domains in production
4. Regularly rotate your API key for better security
