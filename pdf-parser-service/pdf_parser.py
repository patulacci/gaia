from io import BytesIO
from typing import List, Dict
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

def process_pdf(pdf_bytes: bytes) -> Dict[str, List[Dict[str, str]]]:
    """
    Process a PDF file and extract text content divided into sections.
    
    Args:
        pdf_bytes: Raw PDF file bytes
    
    Returns:
        Dictionary containing sections with extracted text
    """
    output_string = BytesIO()
    with BytesIO(pdf_bytes) as pdf_file:
        # Extract text with PDFMiner
        extract_text_to_fp(pdf_file, output_string, laparams=LAParams())
    
    # Get the extracted text
    text = output_string.getvalue().decode('utf-8')
    
    # Split into sections (similar logic to TypeScript version)
    sections = []
    current_section = []
    
    for line in text.split('\n'):
        if not line.strip():
            if current_section:
                section_text = ' '.join(current_section).strip()
                if section_text:
                    sections.append({"content": section_text})
                current_section = []
        else:
            current_section.append(line.strip())
    
    # Add the last section if it exists
    if current_section:
        section_text = ' '.join(current_section).strip()
        if section_text:
            sections.append({"content": section_text})
    
    return {"sections": sections}
