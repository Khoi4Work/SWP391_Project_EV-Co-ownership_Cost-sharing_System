import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GenerateContractPDF(
  userData: any,
  vehicleData: any,
  coOwners: any[] = [] // 🆕 thêm danh sách đồng sở hữu phụ
): Promise<{ pdfBlob: Blob; pdfUrl: string }> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  // ===== HEADER =====
  page.drawText("VEHICLE CO-OWNERSHIP AGREEMENT", {
    x: 50,
    y: height - 72,
    size: 18,
    font: helvetica,
  });
  page.drawLine({
    start: { x: 50, y: height - 78 },
    end: { x: width - 50, y: height - 78 },
    thickness: 1,
  });

  // ===== Party A (Primary Co-owner) =====
  page.drawText("Party A (Primary Co-Owner):", {
    x: 50,
    y: height - 110,
    size: 12,
    font: helvetica,
  });
  page.drawText(`Full Name: ${userData?.name ?? "N/A"}`, {
    x: 70,
    y: height - 130,
    size: 11,
    font: helvetica,
  });
  page.drawText(`Email: ${userData?.email ?? "N/A"}`, {
    x: 70,
    y: height - 145,
    size: 11,
    font: helvetica,
  });
  page.drawText(`Phone: ${userData?.phone ?? "N/A"}`, {
    x: 70,
    y: height - 160,
    size: 11,
    font: helvetica,
  });
  page.drawText(`Ownership Percentage: ${userData?.ownership ?? "N/A"}%`, {
    x: 70,
    y: height - 175,
    size: 11,
    font: helvetica,
  });

  // ===== Party B (Platform Operator) =====
  page.drawText("Party B (Platform Operator): EcoShare Platform", {
    x: 50,
    y: height - 200,
    size: 12,
    font: helvetica,
  });

  // ===== Co-Owners (Secondary Co-Owners) =====
  let yPos = height - 230;

  if (coOwners.length > 0) {
    page.drawText("Additional Co-Owners:", {
      x: 50,
      y: yPos,
      size: 12,
      font: helvetica,
    });
    yPos -= 20;

    coOwners.forEach((co, index) => {
      page.drawText(`Co-Owner ${index + 1}:`, {
        x: 70,
        y: yPos,
        size: 11,
        font: helvetica,
      });
      yPos -= 15;
      page.drawText(`Full Name: ${co.name ?? "N/A"}`, {
        x: 90,
        y: yPos,
        size: 10,
        font: helvetica,
      });
      yPos -= 13;
      page.drawText(`Email: ${co.email ?? "N/A"}`, {
        x: 90,
        y: yPos,
        size: 10,
        font: helvetica,
      });
      yPos -= 13;
      page.drawText(`Phone: ${co.phone ?? "N/A"}`, {
        x: 90,
        y: yPos,
        size: 10,
        font: helvetica,
      });
      yPos -= 13;
      page.drawText(`Ownership Percentage: ${co.ownership ?? "N/A"}%`, {
        x: 90,
        y: yPos,
        size: 10,
        font: helvetica,
      });
      yPos -= 20;
    });
  }

  // ===== Vehicle Information =====
  page.drawText("Vehicle Information:", {
    x: 50,
    y: yPos - 10,
    size: 12,
    font: helvetica,
  });
  yPos -= 25;
  page.drawText(`Model: ${vehicleData?.model ?? "N/A"}`, {
    x: 70,
    y: yPos,
    size: 11,
    font: helvetica,
  });
  page.drawText(`License Plate: ${vehicleData?.licensePlate ?? "N/A"}`, {
    x: 70,
    y: yPos - 15,
    size: 11,
    font: helvetica,
  });
  page.drawText(`Activation Date: ${new Date().toLocaleDateString()}`, {
    x: 70,
    y: yPos - 30,
    size: 11,
    font: helvetica,
  });

  yPos -= 60;

  // ===== Terms & Responsibilities =====
  const terms = [
    "1. Party A and all Co-Owners confirm that the vehicle information provided is true and accurate.",
    "2. All Co-Owners authorize Party B (EcoShare) to register, manage, and facilitate shared ownership of the vehicle.",
    "3. All ownership percentages must collectively equal 100% and each Co-Owner must hold at least 15%.",
    "4. Both parties agree that all transactions shall comply with applicable laws and EcoShare policies.",
    "5. This agreement becomes effective upon activation and remains valid until mutually terminated.",
  ];

  terms.forEach((line) => {
    page.drawText(line, { x: 50, y: yPos, size: 10, font: helvetica });
    yPos -= 15;
  });

  // ===== Consent Section =====
  page.drawText("Confirmation:", {
    x: 50,
    y: yPos - 15,
    size: 12,
    font: helvetica,
  });

  const form = pdfDoc.getForm();
  const consent = form.createRadioGroup("consent");

  consent.addOptionToPage("accept", page, {
    x: 70,
    y: yPos - 40,
    width: 15,
    height: 15,
  });
  page.drawText("I Agree to the above terms and confirm this registration.", {
    x: 95,
    y: yPos - 37,
    size: 11,
    font: helvetica,
  });

  consent.addOptionToPage("decline", page, {
    x: 70,
    y: yPos - 60,
    width: 15,
    height: 15,
  });
  page.drawText("I Do Not Agree and wish to decline this registration.", {
    x: 95,
    y: yPos - 57,
    size: 11,
    font: helvetica,
  });

  // ===== Footer =====
  page.drawLine({
    start: { x: 50, y: 80 },
    end: { x: width - 50, y: 80 },
    thickness: 1,
  });
  page.drawText("EcoShare Platform © All Rights Reserved", {
    x: 180,
    y: 65,
    size: 9,
    font: helvetica,
  });

  // ===== Output =====
  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as any], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return { pdfBlob, pdfUrl };
}
