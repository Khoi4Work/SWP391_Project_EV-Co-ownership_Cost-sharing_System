import { useLocation } from "react-router-dom";

export default function PdfPreview() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pdfUrl = query.get("url"); // lấy link PDF từ query

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Không tìm thấy file PDF.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <iframe
        src={pdfUrl}
        title="Xem hợp đồng"
        className="w-full h-full border rounded-lg shadow-lg"
      />
    </div>
  );
}
