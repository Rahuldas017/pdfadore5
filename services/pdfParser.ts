
import * as pdfjsLib from 'pdfjs-dist';

// This is a crucial step to set up the web worker for pdf.js.
// It points to the worker script hosted on a CDN.
// This must be set before any other pdf.js API calls.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;

/**
 * Extracts all text content from a given PDF file.
 * @param file The PDF file object to process.
 * @returns A promise that resolves to a single string containing all the text from the PDF.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document from the ArrayBuffer.
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const numPages = pdf.numPages;
    let fullText = '';

    // Iterate through each page of the PDF.
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // The textContent is an array of items. We map over them to extract the 'str' property.
      // We check if 'str' property exists on the item before accessing it.
      const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
      
      // Append the text of the current page to the full text, with a separator.
      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF: ", error);
    throw new Error("Could not read or parse the PDF file. It might be corrupted or protected.");
  }
};
