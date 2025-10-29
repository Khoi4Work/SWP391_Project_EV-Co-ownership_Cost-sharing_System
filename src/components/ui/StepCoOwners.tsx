import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

export default function StepCoOwners({ coOwners, setCoOwners, setStep }) {
  const handleAdd = () => {
    setCoOwners([...coOwners, { name: "", email: "", ownership: 0 }]);
  };

  const handleNext = () => {
    setStep(4);
  };

  const updateCoOwner = (index, field, value) => {
    const updated = [...coOwners];
    updated[index][field] = value;
    setCoOwners(updated);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Đồng sở hữu</span>
        </CardTitle>
        <CardDescription>Thêm thông tin các đồng sở hữu xe điện.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {coOwners.map((co, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tên</Label>
              <Input
                value={co.name}
                onChange={(e) => updateCoOwner(index, "name", e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={co.email}
                onChange={(e) => updateCoOwner(index, "email", e.target.value)}
              />
            </div>
            <div>
              <Label>Tỷ lệ (%)</Label>
              <Input
                type="number"
                value={co.ownership}
                onChange={(e) => updateCoOwner(index, "ownership", Number(e.target.value))}
              />
            </div>
          </div>
        ))}

        <Button onClick={handleAdd} variant="outline">
          + Thêm đồng sở hữu
        </Button>

        <div className="flex justify-end">
          <Button onClick={handleNext}>Tiếp tục</Button>
        </div>
      </CardContent>
    </Card>
  );
}
