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

    // ✅ Set state nếu bạn cần preview hoặc lưu lại file
    setFile(selected);

    console.log("🚀 Auto-submit for:", selected.name);

    // ✅ Gửi tiếp thông tin cho BE xử lý hoặc sang bước kế tiếp
    onFinish({
      uploadType: isPDF ? "PDF" : "IMAGE",
      contractType: "VEHICLE_OWNERSHIP",
      file: selected,
    });

    toast({
      title: "Tải lên thành công ✅",
      description: isPDF
        ? "Đã nhận file PDF"
        : "Đã nhận ảnh hợp đồng",
    });
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
      </CardContent>
    </Card>
  );
};

export default ContractImport;
