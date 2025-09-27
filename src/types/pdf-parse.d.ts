declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseData {
    text?: string
  }
  function pdfParse(buffer: Buffer): Promise<PdfParseData>
  export default pdfParse
}
