import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'id-card';
  orientation?: 'portrait' | 'landscape';
}

export class IDCardPDFGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private margin: number = 20;

  constructor(format: 'a4' | 'letter' | 'id-card' = 'id-card', orientation: 'portrait' | 'landscape' = 'portrait') {
    // ID card dimensions: 85.6mm x 53.98mm (standard credit card size)
    if (format === 'id-card') {
      this.pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [85.6, 53.98]
      });
      this.margin = 2;
    } else {
      this.pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format
      });
    }
  }

  // Generate PDF from HTML element
  async generateFromElement(element: HTMLElement, options: PDFOptions = {}): Promise<Blob> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        ...options
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pdf.internal.pageSize.getWidth() - (this.margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      this.pdf.addImage(imgData, 'PNG', this.margin, this.margin, imgWidth, imgHeight);
      
      return this.pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  // Generate multiple ID cards on one page
  async generateMultipleCards(elements: HTMLElement[], options: PDFOptions = {}): Promise<Blob> {
    // Switch to A4 for multiple cards
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const cardWidth = 85.6;
    const cardHeight = 53.98;
    const cardsPerRow = 2;
    const cardsPerColumn = 5;
    
    let cardCount = 0;
    let currentPage = 1;

    for (const element of elements) {
      if (cardCount > 0 && cardCount % (cardsPerRow * cardsPerColumn) === 0) {
        this.pdf.addPage();
        currentPage++;
      }

      const rowIndex = Math.floor((cardCount % (cardsPerRow * cardsPerColumn)) / cardsPerRow);
      const colIndex = cardCount % cardsPerRow;
      
      const x = this.margin + (colIndex * (cardWidth + 10));
      const y = this.margin + (rowIndex * (cardHeight + 10));

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        this.pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
      } catch (error) {
        console.error('Error processing card:', error);
      }

      cardCount++;
    }

    return this.pdf.output('blob');
  }

  // Download the PDF
  download(filename: string = 'id-card.pdf') {
    this.pdf.save(filename);
  }

  // Get PDF as blob
  getBlob(): Blob {
    return this.pdf.output('blob');
  }

  // Get PDF as data URL
  getDataURL(): string {
    return this.pdf.output('dataurlstring');
  }
}

// Utility functions
export const downloadIDCardPDF = async (element: HTMLElement, filename: string = 'id-card.pdf') => {
  const generator = new IDCardPDFGenerator('id-card');
  const blob = await generator.generateFromElement(element);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
};

export const downloadMultipleIDCards = async (elements: HTMLElement[], filename: string = 'id-cards-batch.pdf') => {
  const generator = new IDCardPDFGenerator('a4');
  const blob = await generator.generateMultipleCards(elements);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
};

export const printIDCard = (element: HTMLElement) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Get the element's HTML and styles
  const elementHTML = element.outerHTML;
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student ID Card</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; padding: 0; }
            * { box-shadow: none !important; }
          }
        </style>
      </head>
      <body>
        ${elementHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for styles and images to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};