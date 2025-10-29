import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileCheck } from "lucide-react";
import ContractImport from "@/pages/co-owner/ContractImport";

export default function StepImportContract({ importedData, setImportedData, setStep }) {
  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileCheck className="h-5 w-5" />
          <span>Nhập hợp đồng từ file</span>
        </CardTitle>
        <CardDescription>
          Tải lên hợp đồng đồng sở hữu xe (PDF hoặc ảnh).
          Nếu là PDF sẽ gửi ngay cho nhân viên xác nhận, nếu là ảnh sẽ tiếp tục quy trình bên dưới.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ContractImport onFinish={setImportedData} />
        <div className="flex justify-end">
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            disabled={!importedData || importedData.type !== "image"}
          >
            Tiếp tục quy trình
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
