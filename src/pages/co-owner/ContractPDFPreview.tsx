import { jsPDF } from "jspdf";
export function GenerateContractPDF(userData, vehicleData) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("VEHICLE REGISTRATION AGREEMENT", 55, 20);
  doc.setFontSize(12);
  doc.text(`Primary Co-Owner: ${userData?.name || "N/A"}`, 20, 40);
  doc.text(`Email: ${userData?.email || "N/A"}`, 20, 50);
  doc.text(`Phone Number: ${userData?.phone || "N/A"}`, 20, 60);
  doc.text(`Platform: EcoShare Platform`, 20, 80);
  doc.text(`Registered Vehicle: ${vehicleData?.model || "N/A"}`, 20, 100);
  doc.text(`License Plate: ${vehicleData?.licensePlate || "N/A"}`, 20, 110);
  doc.text(`Activation Date: ${new Date().toLocaleDateString()}`, 20, 130);

  doc.text(
    "Policy for Party A: Party A commits to providing truthful information. The system is responsible for maintaining data confidentiality and offering technical support within the scope of the service.",
    20,
    150,
    { maxWidth: 170 }
  );

  doc.text("Signatures:", 20, 200);
  doc.text("Party A: ____________________", 20, 220);
  doc.text("Party B: ____________________", 120, 220);

  // 🖼️ Xuất blob và URL
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return { pdfBlob, pdfUrl };
}
