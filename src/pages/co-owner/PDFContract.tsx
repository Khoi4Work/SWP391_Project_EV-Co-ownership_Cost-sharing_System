import { useParams } from "react-router-dom";
import { useEffect } from "react";
import axiosClient from "@/api/axiosClient";

export default function PDFContract() {
  const { contractId } = useParams<{ contractId: string }>();

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) {
        document.body.innerHTML = "<p>Không tìm thấy hợp đồng. Vui lòng thử lại.</p>";
        return;
      }

      try {
        const res = await axiosClient.get(
          `/contract/preview?contractId=${contractId}`,
          { responseType: "text" } // backend trả HTML Thymeleaf
        );

        // Ghi trực tiếp HTML vào document
        document.open();
        document.write(res.data);
        document.close();
      } catch (error) {
        console.error("Error previewing contract:", error);
        document.body.innerHTML = "<p>Không thể xem hợp đồng. Vui lòng thử lại.</p>";
      }
    };

    fetchContract();
  }, [contractId]);
  return null; // Page này không render gì, chỉ dùng document.write
}
