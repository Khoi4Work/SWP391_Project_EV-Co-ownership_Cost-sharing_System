import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

export default function ContractPDFPreview({ userData, vehicleData }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const doc = new jsPDF();

    // 🧾 Tiêu đề hợp đồng
    doc.setFontSize(18);
    doc.text("HỢP ĐỒNG ĐĂNG KÝ XE", 70, 20);

    doc.setFontSize(12);
    doc.text(`Bên A (Chủ sỡ hữu chính): ${userData?.name || "Chưa có"}`, 20, 40);
    doc.text(`Email: ${userData?.email || "Chưa có"}`, 20, 50);
    doc.text(`SĐT: ${userData?.phone || "Chưa có"}`, 20, 60);
    doc.text(`Bên B (Hệ thống): EcoShare Platform`, 20, 80);
    doc.text(`Xe đăng ký: ${vehicleData?.model || "Chưa có"}`, 20, 100);
    doc.text(`Biển số: ${vehicleData?.licensePlate || "Chưa có"}`, 20, 110);
    doc.text(`Ngày hiệu lực: ${new Date().toLocaleDateString()}`, 20, 130);

    doc.text(
      "Điều khoản: Bên A cam kết cung cấp thông tin trung thực. Hệ thống chịu trách nhiệm bảo mật thông tin và hỗ trợ kỹ thuật trong phạm vi dịch vụ.",
      20,
      150,
      { maxWidth: 170 }
    );

    doc.text("Ký xác nhận:", 20, 200);
    doc.text("Bên A: ____________________", 20, 220);
    doc.text("Bên B: ____________________", 120, 220);

    // 🖼️ Xuất blob
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  }, [userData, vehicleData]);

  if (!pdfUrl) return <p>Đang tạo hợp đồng PDF...</p>;

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <iframe
        src={pdfUrl}
        width="100%"
        height="100%"
        title="Hợp đồng đăng ký xe"
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={() => window.open(pdfUrl, "_blank")}
          className="bg-green-500 text-white p-2 rounded"
        >
          Xem toàn màn hình
        </button>
      </div>
    </div>
  );
}
