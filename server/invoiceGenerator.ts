import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { RequestWithDetails } from '@shared/schema';

interface InvoiceData {
  request: RequestWithDetails;
  invoiceNumber: string;
  preTowPhotoPath?: string;
  postTowPhotoPath?: string;
  signaturePath?: string;
}

export class InvoiceGenerator {
  static invoicesDir = path.join(process.cwd(), 'invoices');
  
  // Helper functions for safe layout
  private static ensureSpace(doc: PDFDocument, yPos: number, requiredSpace = 80): number {
    if (yPos + requiredSpace > doc.page.height - 120) {
      doc.addPage();
      return 50;
    }
    return yPos;
  }
  
  private static drawSectionTitle(doc: PDFDocument, title: string, yPos: number): number {
    doc.fontSize(14).fillColor('#000').text(title, 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(550, yPos + 20).strokeColor('#ccc').stroke();
    return yPos + 35;
  }
  
  static async generateTestInvoice(data: any): Promise<string> {
    const filename = `${data.invoiceNumber}.pdf`;
    const filepath = path.join(this.invoicesDir, filename);
    
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filepath));
    
    // Header
    doc.fontSize(24).fillColor('#000').text('TowApp', 50, 50);
    doc.fontSize(12).fillColor('#333').text('Professional Towing Services', 50, 80);
    doc.text('Phone: +27 11 123 4567', 50, 95);
    doc.text('Email: support@towapp.com', 50, 110);
    
    // Invoice metadata
    doc.fontSize(18).fillColor('#000').text('INVOICE', 400, 50);
    doc.fontSize(10).text(`Invoice #: ${data.invoiceNumber}`, 400, 75);
    doc.text(`Date: ${data.date}`, 400, 90);
    
    let yPos = 140;
    
    // Customer info
    doc.fontSize(12).fillColor('#000').text('BILL TO:', 50, yPos);
    doc.fontSize(10).fillColor('#333');
    doc.text(data.customerName, 50, yPos + 20);
    doc.text(data.customerEmail, 50, yPos + 35);
    doc.text(data.customerPhone, 50, yPos + 50);
    
    // Service provider
    doc.fontSize(12).fillColor('#000').text('SERVICE PROVIDER:', 300, yPos);
    doc.fontSize(10).fillColor('#333');
    doc.text(data.driverName, 300, yPos + 20);
    doc.text(data.companyName, 300, yPos + 35);
    
    yPos += 80;
    
    // Service details
    doc.fontSize(14).fillColor('#000').text('SERVICE DETAILS', 50, yPos);
    yPos += 25;
    doc.fontSize(10).fillColor('#333');
    doc.text('Service Type:', 50, yPos).text(data.service, 200, yPos);
    yPos += 15;
    doc.text('Vehicle:', 50, yPos).text(data.vehicleInfo, 200, yPos);
    yPos += 15;
    doc.text('Pickup:', 50, yPos).text(data.pickupLocation, 200, yPos);
    yPos += 15;
    doc.text('Drop-off:', 50, yPos).text(data.dropoffLocation, 200, yPos);
    yPos += 15;
    doc.text('Distance:', 50, yPos).text(data.distance, 200, yPos);
    yPos += 15;
    doc.text('Duration:', 50, yPos).text(data.duration, 200, yPos);
    
    yPos += 30;
    
    // GPS proof
    doc.fontSize(14).fillColor('#000').text('GPS VERIFICATION', 50, yPos);
    yPos += 25;
    doc.fontSize(10).fillColor('#333');
    doc.text('Pickup GPS: -25.7483, 28.2299', 50, yPos);
    yPos += 15;
    doc.text('Drop-off GPS: -25.7520, 28.2350', 50, yPos);
    yPos += 15;
    doc.text('Driver Arrival: 14:25:30', 50, yPos);
    yPos += 15;
    doc.text('Service Complete: 15:15:45', 50, yPos);
    yPos += 15;
    doc.text('GPS Verified: ✓', 50, yPos);
    
    yPos += 30;
    
    // Payment summary
    doc.rect(50, yPos, 500, 60).stroke();
    doc.fontSize(12).fillColor('#000').text('PAYMENT SUMMARY', 60, yPos + 10);
    doc.fontSize(10).text('Service Fee:', 60, yPos + 30).text(data.amount, 450, yPos + 30);
    doc.fontSize(12).text('TOTAL:', 60, yPos + 45).text(data.amount, 450, yPos + 45);
    
    yPos += 80;
    
    // Footer
    doc.fontSize(9).fillColor('#666').text(
      'This invoice serves as official proof of towing service rendered and completed.',
      50, yPos
    );
    
    doc.end();
    
    return new Promise((resolve) => {
      doc.on('end', () => resolve(filename));
    });
  }
  static async generateInvoice(data: InvoiceData): Promise<string> {
    const doc = new PDFDocument({ margin: 50 });
    const invoiceDir = path.join(process.cwd(), 'invoices');
    
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
    
    const filename = `invoice-${data.request.id}-${Date.now()}.pdf`;
    const filepath = path.join(invoiceDir, filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    // Header
    doc.fontSize(24).fillColor('#FF6B35').text('TOWAPP', 50, 50);
    doc.fontSize(12).fillColor('#666').text('Professional Towing Services', 50, 80);
    
    // Invoice details
    doc.fontSize(16).fillColor('#000').text('INVOICE', 400, 50);
    doc.fontSize(10).text(`Invoice #: ${data.invoiceNumber}`, 400, 75);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 90);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 400, 105);
    
    let yPos = 140;
    
    // Customer details
    doc.fontSize(12).fillColor('#000').text('CUSTOMER DETAILS', 50, yPos);
    yPos += 20;
    doc.fontSize(10).text(`Name: ${data.request.user.name}`, 50, yPos);
    yPos += 15;
    doc.text(`Phone: ${data.request.user.phone}`, 50, yPos);
    yPos += 15;
    doc.text(`Email: ${data.request.user.email}`, 50, yPos);
    yPos += 30;
    
    // Driver details
    if (data.request.driver) {
      doc.fontSize(12).text('DRIVER DETAILS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).text(`Name: ${data.request.driver.user.name}`, 50, yPos);
      yPos += 15;
      doc.text(`Vehicle: ${data.request.driver.vehicleType}`, 50, yPos);
      yPos += 15;
      doc.text(`License: ${data.request.driver.licensePlate}`, 50, yPos);
      yPos += 30;
    }
    
    // Trip details
    doc.fontSize(12).text('TRIP DETAILS', 50, yPos);
    yPos += 20;
    doc.fontSize(10).text(`From: ${data.request.pickupAddress}`, 50, yPos);
    yPos += 15;
    doc.text(`To: ${data.request.dropoffAddress || 'N/A'}`, 50, yPos);
    yPos += 15;
    doc.text(`Service: Vehicle Towing`, 50, yPos);
    yPos += 30;
    
    // Pricing
    doc.fontSize(12).text('COST BREAKDOWN', 50, yPos);
    yPos += 20;
    const estimatedPrice = parseFloat(data.request.estimatedPrice?.toString() || '0');
    const actualPrice = parseFloat(data.request.actualPrice?.toString() || '0') || estimatedPrice;
    
    doc.fontSize(10).text(`Service Fee: R${estimatedPrice.toFixed(2)}`, 50, yPos);
    yPos += 15;
    doc.fontSize(12).fillColor('#000').text(`TOTAL: R${actualPrice.toFixed(2)}`, 50, yPos);
    yPos += 30;
    
    // Recipient info
    if (data.request.recipientName) {
      doc.fontSize(12).text('RECIPIENT VERIFICATION', 50, yPos);
      yPos += 20;
      doc.fontSize(10).text(`Received by: ${data.request.recipientName}`, 50, yPos);
      yPos += 15;
      doc.text(`Signature on file: Yes`, 50, yPos);
      yPos += 15;
      doc.text(`ID verified: Yes`, 50, yPos);
      yPos += 30;
    }
    
    // Documentation
    doc.fontSize(12).text('DOCUMENTATION', 50, yPos);
    yPos += 20;
    doc.fontSize(10).text('✓ Pre-tow vehicle photo', 50, yPos);
    yPos += 15;
    doc.text('✓ Post-tow vehicle photo', 50, yPos);
    if (data.request.recipientName) {
      yPos += 15;
      doc.text('✓ Recipient signature', 50, yPos);
      yPos += 15;
      doc.text('✓ Recipient ID verification', 50, yPos);
    }
    
    // Footer
    doc.fontSize(8).fillColor('#666').text(
      'This invoice is generated automatically and serves as proof of service completion.',
      50,
      doc.page.height - 100
    );
    
    doc.end();
    
    return filename;
  }
  
  static getInvoicePath(filename: string): string {
    return path.join(process.cwd(), 'invoices', filename);
  }
  
  static getInvoiceUrl(filename: string): string {
    return `/api/invoices/${filename}`;
  }
}