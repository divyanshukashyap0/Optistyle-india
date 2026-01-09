
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { VisionEstimation } from "./eyeTestLogic";
import { CartItem } from "../types";

// --- THEME CONSTANTS ---
const COLORS = {
    primary: [37, 99, 235], // Brand Blue (#2563EB)
    secondary: [15, 23, 42], // Slate 900 (#0F172A)
    text: [51, 65, 85], // Slate 700 (#334155)
    textLight: [100, 116, 139], // Slate 500 (#64748B)
    border: [226, 232, 240], // Slate 200 (#E2E8F0)
    white: [255, 255, 255],
    accent: [241, 245, 249], // Slate 100
    success: [22, 163, 74]   // Green 600
};

// --- HELPER FUNCTIONS ---
const fitTextToWidth = (
    doc: any,
    text: string,
    maxWidth: number,
    fontSize: number,
    minFontSize = 7
) => {
    let size = fontSize;
    doc.setFontSize(size);
    while (size > minFontSize && doc.getTextWidth(text) > maxWidth) {
        size -= 0.5;
        doc.setFontSize(size);
    }
    return size;
};

const splitToWidth = (doc: any, text: string, maxWidth: number) => {
    if (!text) return [''];
    if (typeof doc.splitTextToSize === 'function') return doc.splitTextToSize(text, maxWidth);
    return [text];
};

const drawHeader = (doc: any, pageWidth: number) => {
    // Top Bar
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Brand Name
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("OptiStyle", 20, 28);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("VISION CENTER", 20, 34);

    // Company Contact (Right aligned)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Plot 42, Hitech City", pageWidth - 20, 24, { align: "right" });
    doc.text("Hyderabad, India 500081", pageWidth - 20, 29, { align: "right" });
    doc.text("Support: +91 80053 43226", pageWidth - 20, 34, { align: "right" });
    
    // Horizontal Line
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 42, pageWidth - 20, 42);
};

const drawFooter = (doc: any, pageWidth: number, pageHeight: number) => {
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(`Generated electronically by OptiStyle AI Engine on ${new Date().toLocaleString('en-IN')}`, 20, pageHeight - 8);
    doc.text("Page 1 of 1", pageWidth - 20, pageHeight - 8, { align: "right" });
};

// --- 1. EYE TEST CERTIFICATE ---
export const generateEyeTestCertificate = async (
    name: string,
    age: string,
    gender: string,
    leftEye: VisionEstimation,
    rightEye: VisionEstimation,
    certId: string,
    overallConfidence: number
) => {
    const doc: any = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    drawHeader(doc, pageWidth);
    
    // --- REPORT TITLE SECTION ---
    let yPos = 60;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text("Vision Screening Report", 20, yPos);
    
    // Status Badge
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.roundedRect(pageWidth - 60, yPos - 6, 40, 8, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.text("COMPLETED", pageWidth - 40, yPos - 1, { align: "center" });

    // --- PATIENT INFO CARD ---
    yPos += 20;
    
    // Card Background
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(20, yPos, pageWidth - 40, 40, 2, 2, 'FD');
    
    // Row 1: Labels
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("PATIENT NAME", 30, yPos + 10);
    doc.text("AGE / GENDER", 100, yPos + 10);
    doc.text("REFERENCE ID", 150, yPos + 10);
    
    // Row 1: Values
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    const nameText = (name || '').toUpperCase();
    doc.setFont("helvetica", "bold");
    fitTextToWidth(doc, nameText, 65, 11, 7);
    doc.text(nameText, 30, yPos + 18);
    doc.text(`${age} Yrs / ${gender}`, 100, yPos + 18);
    doc.setFont("helvetica", "bold");
    fitTextToWidth(doc, certId, 40, 11, 7);
    doc.text(certId, 150, yPos + 18);
    
    // Divider inside card
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.line(30, yPos + 26, pageWidth - 30, yPos + 26);
    
    // Row 2: Date & Confidence
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(`Date of Test: ${new Date().toLocaleDateString('en-IN')}`, 30, yPos + 34);
    (doc as any).text(`AI Confidence Score: ${overallConfidence}%`, 100, yPos + 34);

    // --- RESULTS TABLE ---
    yPos += 50;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text("Estimated Refraction Details", 20, yPos);

    // @ts-ignore
    doc.autoTable({
        startY: yPos + 5,
        head: [['Eye', 'Visual Acuity', 'Sphere (SPH)', 'Cylinder (CYL)', 'Axis']],
        body: [
            ['Right Eye (OD)', rightEye.acuity, rightEye.sph, rightEye.cyl, rightEye.axis],
            ['Left Eye (OS)', leftEye.acuity, leftEye.sph, leftEye.cyl, leftEye.axis],
        ],
        theme: 'grid',
        styles: { 
            fontSize: 10, 
            cellPadding: 12, 
            valign: 'middle', 
            textColor: COLORS.text 
        },
        headStyles: { 
            fillColor: COLORS.secondary, 
            textColor: COLORS.white,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' }
        },
        alternateRowStyles: {
            fillColor: COLORS.accent
        }
    });

    // --- QR CODE & VERIFICATION SECTION ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 20;
    
    // Verification Box
    const verificationBoxHeight = 60;
    const qrSize = 35;
    const qrX = 20 + (pageWidth - 40) - qrSize - 10;
    const qrYPos = finalY + (verificationBoxHeight - qrSize) / 2;
    const leftTextX = 30;
    const leftTextMaxWidth = qrX - leftTextX - 12;

    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.rect(20, finalY, pageWidth - 40, verificationBoxHeight);
    
    // Left side of verification box: Text
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Scan to Verify", leftTextX, finalY + 15);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    const verificationText = [
        "This QR code contains the digital signature of this test result.",
        "Scan with any QR reader to validate patient details and scores."
    ].join(' ');
    const verificationLines = splitToWidth(doc, verificationText, leftTextMaxWidth);
    doc.text(verificationLines, leftTextX, finalY + 22);
    
    // Generate QR Code
    // Data format: Simple Key-Value text for universal readability
    const qrData = `OPTISTYLE-CERT\nID:${certId}\nPATIENT:${name}\nDATE:${new Date().toISOString().split('T')[0]}\nOD:${rightEye.acuity}/${rightEye.sph}\nOS:${leftEye.acuity}/${leftEye.sph}`;
    
    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${encodeURIComponent(qrData)}`;
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            doc.addImage(base64data, 'PNG', qrX, qrYPos, qrSize, qrSize);
            
            finishPDF(doc, pageWidth, pageHeight, certId, finalY + verificationBoxHeight + 12);
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        console.warn("QR Code generation failed, generating PDF without it.");
        finishPDF(doc, pageWidth, pageHeight, certId, finalY + verificationBoxHeight + 12);
    }
};

const finishPDF = (doc: any, pageWidth: number, pageHeight: number, certId: string, startY: number) => {
    // --- DISCLAIMER ---
    const disclaimerText1 = "This certificate represents the results of an AI-assisted vision screening. It is NOT a medical prescription.";
    const disclaimerText2 = "Please consult a certified optometrist or ophthalmologist for a comprehensive eye exam before purchasing prescription lenses.";
    
    doc.setDrawColor(252, 165, 165); // Red 300
    doc.setFillColor(254, 242, 242); // Red 50
    
    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const bodyMaxWidth = pageWidth - 50;
    const lines1 = splitToWidth(doc, disclaimerText1, bodyMaxWidth);
    const lines2 = splitToWidth(doc, disclaimerText2, bodyMaxWidth);
    const lineHeight = 4;
    const boxHeight = Math.max(20, 8 + 5 + ((lines1.length + lines2.length) * lineHeight) + 4);
    const disclaimerY = Math.min(startY, pageHeight - (boxHeight + 20));
    doc.roundedRect(20, disclaimerY, pageWidth - 40, boxHeight, 2, 2, 'FD');
    doc.text("MEDICAL DISCLAIMER:", 25, disclaimerY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const textStartY = disclaimerY + 13;
    doc.text(lines1, 25, textStartY);
    doc.text(lines2, 25, textStartY + (lines1.length * lineHeight));

    drawFooter(doc, pageWidth, pageHeight);
    doc.save(`OptiStyle_Report_${certId}.pdf`);
};

// --- 2. TAX INVOICE (INR) ---
export const generateInvoice = (
    orderId: string,
    customer: { name: string; email: string; address: string; city: string; zip: string },
    items: CartItem[],
    total: number
) => {
    const doc: any = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    drawHeader(doc, pageWidth);

    // Invoice Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text("TAX INVOICE", pageWidth - 20, 50, { align: "right" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order #: ${orderId}`, pageWidth - 20, 56, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 20, 61, { align: "right" });

    // Bill To
    doc.text("Bill To:", 20, 70);
    doc.setFont("helvetica", "bold");
    doc.text(customer.name, 20, 75);
    doc.setFont("helvetica", "normal");
    doc.text(customer.address, 20, 80);
    doc.text(`${customer.city} - ${customer.zip}`, 20, 85);
    doc.text(`Email: ${customer.email}`, 20, 90);

    // Line Items
    // @ts-ignore
    doc.autoTable({
        startY: 100,
        head: [['Item Name', 'Type', 'Qty', 'Price', 'Total']],
        body: items.map(item => [
            item.name, 
            item.selectedLens?.name || 'Frame',
            item.quantity, 
            `Rs. ${item.price + (item.selectedLens?.price || 0)}`,
            `Rs. ${(item.price + (item.selectedLens?.price || 0)) * item.quantity}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: COLORS.secondary }
    });

    // Totals
    // @ts-ignore
    const finalY = (doc.lastAutoTable?.finalY || 100) + 10;
    
    doc.setFontSize(11);
    doc.text("Subtotal:", 140, finalY);
    doc.text(`Rs. ${total}`, pageWidth - 20, finalY, { align: "right" });
    
    doc.text("GST (18% Included):", 140, finalY + 6);
    doc.text("-", pageWidth - 20, finalY + 6, { align: "right" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 140, finalY + 14);
    (doc as any).text(`Rs. ${total}`, pageWidth - 20, finalY + 14, { align: "right" });

    drawFooter(doc, pageWidth, pageHeight);
    doc.save(`OptiStyle_Invoice_${orderId}.pdf`);
};
