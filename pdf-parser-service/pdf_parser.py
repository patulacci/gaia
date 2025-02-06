from io import BytesIO
from typing import List, Dict
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
from langchain.text_splitter import RecursiveCharacterTextSplitter

def process_pdf(pdf_bytes: bytes, chunk_size: int = 400, overlap: int = 100) -> Dict[str, List[Dict[str, str]]]:
    """
    Process a PDF file and extract text content divided into sections with optimized splitting.
    
    Args:
        pdf_bytes: Raw PDF file bytes
        chunk_size: Maximum chunk size (default: 400 characters)
        overlap: Overlapping characters between chunks (default: 100 characters)
    
    Returns:
        Dictionary containing sections with extracted text
    """
    output_string = BytesIO()
    with BytesIO(pdf_bytes) as pdf_file:
        # Extract text with PDFMiner
        extract_text_to_fp(pdf_file, output_string, laparams=LAParams())

    # Get the extracted text
    text = output_string.getvalue().decode('utf-8')

    # Remove excessive newlines and trim whitespace
    cleaned_text = []
    current_paragraph = []

    for line in text.split('\n'):
        stripped_line = line.strip()
        if stripped_line:
            current_paragraph.append(stripped_line)
        else:
            # If we hit an empty line, finalize the paragraph
            if current_paragraph:
                cleaned_text.append(" ".join(current_paragraph))
                current_paragraph = []

    # Add last paragraph if exists
    if current_paragraph:
        cleaned_text.append(" ".join(current_paragraph))

    # Convert to a single block of text
    formatted_text = "\n\n".join(cleaned_text)

    # Split text into optimized chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", ".", "?", "!"]
    )
    
    sections = [{"content": chunk} for chunk in splitter.split_text(formatted_text)]
    
    return {"sections": sections}
