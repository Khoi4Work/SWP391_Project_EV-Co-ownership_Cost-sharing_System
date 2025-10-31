import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

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

    console.log("📂 File selected:", selected);

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
    console.log("🚀 Upload started for:", file.name);

    try {
      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      console.log("📎 File type:", isPDF ? "PDF" : isImage ? "IMAGE" : "UNKNOWN");

      // ✅ Chỉ gửi cấu trúc, staff xét duyệt nội dung
      onFinish({
        uploadType: isPDF ? "PDF" : "IMAGE",
        contractType: "VEHICLE_OWNERSHIP",
        file,
      });

      toast({
        title: "Tải lên thành công ✅",
        description: isPDF
          ? "Đã nhận file PDF, chuyển tới bước xác nhận"
          : "Đã nhận ảnh hợp đồng",
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      toast({
        title: "Lỗi",
        description: "Không thể xử lý file, thử lại nhé!",
        variant: "destructive",
      });
    } finally {
      console.log("✅ Upload process finished.");
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 border rounded-lg shadow-sm">
      <CardContent className="flex flex-col gap-4">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="block w-full border rounded p-2"
        />

        {file && (
          <p className="text-sm text-gray-600">
            Đã chọn: <strong>{file.name}</strong>
          </p>
        )}

        <Button disabled={isUploading} onClick={handleUpload} className="w-fit">
          {isUploading ? "Đang xử lý..." : "Tải lên & Tiếp tục"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContractImport;
