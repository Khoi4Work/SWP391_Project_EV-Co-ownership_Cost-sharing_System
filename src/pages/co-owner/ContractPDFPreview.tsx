// Thay import jsPDF bằng:
import { PDFDocument, StandardFonts } from "pdf-lib";

// Thay hàm GenerateContractPDF cũ bằng cái này:
export async function GenerateContractPDF(userData: any, vehicleData: any): Promise<{ pdfBlob: Blob; pdfUrl: string }> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  // Title + thông tin
  page.drawText("VEHICLE REGISTRATION AGREEMENT", { x: 50, y: height - 72, size: 18, font: helvetica });
  page.drawText(`Primary Co-Owner: ${userData?.name ?? "N/A"}`, { x: 40, y: height - 110, size: 12, font: helvetica });
  page.drawText(`Email: ${userData?.email ?? "N/A"}`, { x: 40, y: height - 130, size: 12, font: helvetica });
  page.drawText(`Phone Number: ${userData?.phone ?? "N/A"}`, { x: 40, y: height - 150, size: 12, font: helvetica });
  page.drawText(`Platform: EcoShare Platform`, { x: 40, y: height - 170, size: 12, font: helvetica });
  page.drawText(`Registered Vehicle: ${vehicleData?.model ?? "N/A"}`, { x: 40, y: height - 190, size: 12, font: helvetica });
  page.drawText(`License Plate: ${vehicleData?.licensePlate ?? "N/A"}`, { x: 40, y: height - 210, size: 12, font: helvetica });
  page.drawText(`Activation Date: ${new Date().toLocaleDateString()}`, { x: 40, y: height - 230, size: 12, font: helvetica });

  const policy = "Policy for Party A: Party A commits to providing truthful information. The system is responsible for maintaining data confidentiality and offering technical support within the scope of the service.";
  page.drawText(policy, { x: 40, y: height - 260, size: 10, font: helvetica, maxWidth: 515 });

  // Form (radio group: chỉ chọn 1 trong 2)
  const form = pdfDoc.getForm();
  const consent = form.createRadioGroup("consent");
  consent.addOptionToPage("accept", page, { x: 40, y: height - 320, width: 15, height: 15 });
  page.drawText("I Agree", { x: 62, y: height - 317, size: 12, font: helvetica });
  consent.addOptionToPage("reject", page, { x: 160, y: height - 320, width: 15, height: 15 });
  page.drawText("I Do Not Agree", { x: 182, y: height - 317, size: 12, font: helvetica });
  // (Chú ý: không gọi form.flatten() — để file vẫn ở dạng interactive)

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as any], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return { pdfBlob, pdfUrl };
}
