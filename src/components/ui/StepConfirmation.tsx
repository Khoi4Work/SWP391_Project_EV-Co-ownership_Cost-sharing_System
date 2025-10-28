import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import axiosClient from "@/api/axiosClient";
import { useToast } from "@/hooks/use-toast";

export default function StepConfirmation({ ownerInfo, coOwners, selectedVehicle, importedData }) {
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const contract = {
        contractType: "VEHICLE_REGISTRATION",
        userId: [
          Number(ownerInfo.id),
          ...coOwners.filter((c) => c.id).map((c) => Number(c.id)),
        ],
        documentUrl: importedData?.contractLink,
      };

      await axiosClient.post("/contract/create", contract);

      toast({
        title: "Thành công",
        description: "Hợp đồng đã được gửi đi cho nhân viên xác nhận.",
      });
    } catch (err) {
      console.error("❌ Lỗi khi gửi hợp đồng:", err);
      toast({
        title: "Lỗi",
        description: "Không thể gửi hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Xác nhận thông tin</span>
        </CardTitle>
        <CardDescription>Kiểm tra lại thông tin trước khi gửi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p><strong>Chủ sở hữu:</strong> {ownerInfo.name} ({ownerInfo.email})</p>
        <p><strong>Đồng sở hữu:</strong></p>
        <ul className="list-disc list-inside text-sm">
          {coOwners.map((co, idx) => (
            <li key={idx}>
              {co.name} ({co.email}) — {co.ownership}%
            </li>
          ))}
        </ul>

        <p><strong>Xe đã chọn:</strong> {selectedVehicle}</p>
        <p><strong>Loại hợp đồng:</strong> {importedData?.contractType}</p>

        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Gửi hợp đồng</Button>
        </div>
      </CardContent>
    </Card>
  );
}
