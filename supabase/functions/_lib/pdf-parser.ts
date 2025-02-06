interface Section {
  content: string;
}

interface ProcessedPDF {
  sections: Section[];
}

export async function processPDF(buffer: ArrayBuffer): Promise<ProcessedPDF> {
  try {
    // Convert ArrayBuffer to Blob
    const blob = new Blob([buffer], { type: 'application/pdf' });
    
    // Create FormData and append the PDF file
    const formData = new FormData();
    formData.append('file', blob, 'document.pdf');
    
    // Get API configuration from environment variables
    const API_URL = Deno.env.get('PDF_PARSER_API_URL');
    const API_KEY = Deno.env.get('PDF_PARSER_API_KEY');

    if (!API_KEY) {
      throw new Error('PDF_PARSER_API_KEY environment variable is not set');
    }

    // Send to FastAPI service
    const response = await fetch(`${API_URL}/parse`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PDF parsing failed: ${error}`);
    }
    
    const result = await response.json();
    return result as ProcessedPDF;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF file: ' + (error as Error).message);
  }
}
