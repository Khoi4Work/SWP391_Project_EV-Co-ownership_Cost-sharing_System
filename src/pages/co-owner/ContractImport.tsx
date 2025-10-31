import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import axiosClient from "@/api/axiosClient";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker?url";

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

  const extractTextFromPDF = async (file: File) => {
    console.log("📄 Extracting PDF text...");
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`📑 Reading PDF page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        fullText += strings.join(" ") + "\n";
      }

      console.log("📄 PDF Extract Result:", fullText.slice(0, 500) + "...");
      return fullText;
    } catch (err) {
      console.error("❌ Error reading PDF:", err);
      throw err;
    }
  };

  const extractTextFromImage = async (file: File) => {
    console.log("🖼️ Extracting Image text with OCR...");
    const worker = await createWorker("vie");
    const imgUrl = URL.createObjectURL(file);

    console.log("🖼️ Image URL:", imgUrl);

    const { data } = await worker.recognize(imgUrl);
    await worker.terminate();

    console.log("🔍 OCR Result:", data.text.slice(0, 500) + "...");

    return data.text;
  };

  const validateVehicleContract = (text: string) => {
    console.log("✅ Validating contract content...");
    const normalized = text.toLowerCase();
    const result =
      normalized.includes("đồng sở hữu") ||
      normalized.includes("xe") ||
      normalized.includes("hợp đồng") ||
      normalized.includes("email");
    console.log("📌 Validate result:", result);
    return result;
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
      console.log("🚀 Upload started for:", file.name);

      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      let text = "";

      // Extract text
      if (isPDF) text = await extractTextFromPDF(file);
      else if (isImage) text = await extractTextFromImage(file);

      if (!text || text.trim().length < 10) {
        console.error("⚠️ OCR returned empty text!");
        toast({
          title: "Không đọc được nội dung 🚫",
          description: "Hãy thử file chất lượng hơn hoặc định dạng khác.",
          variant: "destructive",
        });
        return;
      }

      console.log("📜 Extracted text preview:", text.slice(0, 500) + "...");

      // Validate
      if (!validateVehicleContract(text)) {
        toast({
          title: "Không phải hợp đồng đồng sở hữu xe 🚫",
          description: "Hãy chọn đúng file hợp đồng.",
          variant: "destructive",
        });
        return;
      }

      console.log("📦 Contract validated. Sending to parent...");

      onFinish({
        uploadType: isPDF ? "PDF" : "IMAGE",
        contractType: "VEHICLE_OWNERSHIP",
        recognizedText: text,
        file,
      });
      toast({
        title: "Thành công ✅",
        description: "Hợp đồng đã được tải lên!",
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
