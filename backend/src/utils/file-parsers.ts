/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Parse PDF buffer
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = (await pdfParse(buffer)) as { text: string }; // assert type
    return data.text;
  } catch (err) {
    console.error('Error parsing PDF:', err);
    return ''; // fallback empty string on error
  }
}

// Parse DOCX buffer
export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = (await mammoth.extractRawText({ buffer })) as {
      value: string;
    };
    return result.value;
  } catch (err) {
    console.error('Error parsing DOCX:', err);
    return ''; // fallback empty string on error
  }
}
