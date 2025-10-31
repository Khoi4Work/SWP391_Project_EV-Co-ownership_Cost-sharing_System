import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import axiosClient from "@/api/axiosClient";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker?url";
// set worker src
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(" ") + "\n";
    }

    return fullText;
  };

  const extractTextFromImage = async (file: File) => {
    const worker = await createWorker("vie");  // nếu bạn muốn tiếng Việt
    const { data } = await worker.recognize(URL.createObjectURL(file));
    await worker.terminate();
    return data.text;
  };

  const validateVehicleContract = (text: string) => {
    const normalized = text.toLowerCase();
    return (
      normalized.includes("đồng sở hữu") &&
      normalized.includes("xe") &&
      normalized.includes("ô tô") &&
      normalized.includes("hợp đồng")
    );
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
      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      let text = "";

      if (isPDF) text = await extractTextFromPDF(file);
      else if (isImage) text = await extractTextFromImage(file);

      if (!validateVehicleContract(text)) {
        toast({
          title: "Không phải hợp đồng đồng sở hữu xe 🚫",
          description: "Hãy upload đúng hợp đồng đồng sở hữu xe.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Xác nhận hợp đồng ✅",
        description: "Đang upload file...",
      });

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axiosClient.post("contract/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = uploadRes.data?.url || "";

      onFinish({
        uploadType: isPDF ? "PDF" : "IMAGE",
        contractLink: fileUrl,
        contractType: "VEHICLE_REGISTRATION",
        recognizedText: text,
      });

    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
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
