import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import axiosClient from "@/api/axiosClient";
import * as pdfjsLib from "pdfjs-dist";
interface ContractImportProps {
  onFinish: (data: any) => void;
}

const ContractImport: React.FC<ContractImportProps> = ({ onFinish }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isPDF = selected.type === "application/pdf";
    const isImage = selected.type.startsWith("image/");

    if (!isPDF && !isImage) {
      toast({
        title: "Lỗi định dạng",
        description: "Chỉ chấp nhận file PDF hoặc hình ảnh (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    setFile(selected);
  };
  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + " ";
    }

    return text;
  };
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Thiếu file",
        description: "Vui lòng chọn file trước khi tiếp tục.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // 🟡 Upload file để lấy link
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axiosClient.post("contract/upload", formData);

      const fileUrl = uploadRes.data?.url || "";

      // 🧩 Kiểm tra loại file
      const fileName = file.name.toLowerCase();
      const isPDF =
        file.type === "application/pdf" || fileName.endsWith(".pdf");
      const isImage =
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif)$/i.test(fileName);

      if (isPDF) {
        // 🟢 Đọc nội dung PDF bằng pdfjs-dist
        const text = await extractTextFromPDF(file);
        const normalizedText = text.toLowerCase();

        const isVehicleContract =
          normalizedText.includes("đồng sở hữu") &&
          normalizedText.includes("xe");

        if (isVehicleContract) {
          toast({
            title: "Xác định: Hợp đồng đồng sở hữu xe",
            description: "Hệ thống sẽ gửi hợp đồng cho staff để xác nhận.",
          });

          onFinish({
            uploadType: "PDF",
            contractLink: fileUrl,
            contractType: "VEHICLE_REGISTRATION",
          });
        } else {
          toast({
            title: "File PDF không phải hợp đồng xe",
            description: "Vui lòng chọn đúng file hợp đồng đồng sở hữu xe.",
            variant: "destructive",
          });
          return;
        }
      } else if (isImage) {
        // 🟠 OCR giả lập nếu là ảnh
        toast({
          title: "Đang đọc thông tin từ hình ảnh...",
        });

        setTimeout(() => {
          const mockExtract = {
            contractType: "VEHICLE_REGISTRATION",
            recognizedText: "Giấy tờ hợp đồng đồng sở hữu xe điện",
            vehicleInfo: {
              name: "VinFast VF5",
              plate: "29A-12345",
              model: "2024",
              batteryCapacity: "42 kWh",
            },
          };

          toast({
            title: "Đọc ảnh thành công",
            description: "Bạn có thể kiểm tra và nhập thêm thông tin chi tiết.",
          });

          onFinish({
            uploadType: "IMAGE",
            contractLink: fileUrl,
            ...mockExtract,
          });
        }, 2000);
      } else {
        toast({
          title: "Định dạng không hợp lệ",
          description: "Vui lòng chọn file PDF hoặc hình ảnh (JPG, PNG).",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      toast({
        title: "Lỗi upload",
        description: "Không thể tải file lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 border rounded-lg shadow-sm">
      <CardContent className="flex flex-col gap-4">
        <div>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="block w-full border rounded p-2"
          />
        </div>

        {file && (
          <p className="text-sm text-gray-600">
            Đã chọn: <strong>{file.name}</strong>
          </p>
        )}

        <Button
          disabled={isUploading}
          onClick={handleUpload}
          className="w-fit"
        >
          {isUploading ? "Đang xử lý..." : "Tải lên & Tiếp tục"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContractImport;
