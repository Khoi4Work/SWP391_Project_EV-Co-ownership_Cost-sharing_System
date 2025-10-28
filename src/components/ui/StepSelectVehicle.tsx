import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface StepSelectVehicleProps {
  vehicles: any[];
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
  setStep: (step: number) => void;
}

export default function StepSelectVehicle({ vehicles, selectedVehicle, setSelectedVehicle, setStep }: StepSelectVehicleProps) {
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!selectedVehicle) {
      toast({
        title: "Chưa chọn xe",
        description: "Vui lòng chọn một xe để tiếp tục.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5" />
          <span>Chọn xe điện</span>
        </CardTitle>
        <CardDescription>
          Chọn xe điện bạn muốn đăng ký đồng sở hữu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`cursor-pointer border-2 ${selectedVehicle === vehicle.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-muted"
                } transition-all`}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold">{vehicle.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {vehicle.model} — {vehicle.batteryCapacity}
                </p>
                <p className="text-sm text-muted-foreground">
                  Biển số: {vehicle.plate}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleNext}>Tiếp tục</Button>
        </div>
      </CardContent>
    </Card>
  );
}
