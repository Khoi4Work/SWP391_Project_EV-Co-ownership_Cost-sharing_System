import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export default function StepOwnerInfo({ ownerInfo, setOwnerInfo, setStep }) {
  const handleNext = () => {
    if (!ownerInfo.name || !ownerInfo.email) {
      alert("Vui lòng nhập đầy đủ thông tin chủ sở hữu chính.");
      return;
    }
    setStep(3);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Chủ sở hữu chính</span>
        </CardTitle>
        <CardDescription>Nhập thông tin của chủ sở hữu chính của xe điện.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Họ và tên</Label>
          <Input
            placeholder="Nguyễn Văn A"
            value={ownerInfo.name || ""}
            onChange={(e) => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="example@email.com"
            value={ownerInfo.email || ""}
            onChange={(e) => setOwnerInfo({ ...ownerInfo, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Tỷ lệ sở hữu (%)</Label>
          <Input
            type="number"
            value={ownerInfo.ownership || ""}
            onChange={(e) => setOwnerInfo({ ...ownerInfo, ownership: Number(e.target.value) })}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleNext}>Tiếp tục</Button>
        </div>
      </CardContent>
    </Card>
  );
}
