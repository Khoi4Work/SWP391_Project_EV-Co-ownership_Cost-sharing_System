import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressHeaderProps {
  step: number;
  getProgress: () => number;
  isStepCompleted: (stepNumber: number) => boolean;
}

export default function ProgressHeader({ step, getProgress, isStepCompleted }: ProgressHeaderProps) {
  return (
    <Card className="mb-6 shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Bước {step} / 4</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(getProgress())}% hoàn thành
          </span>
        </div>
        <Progress value={getProgress()} className="mb-4" />
        <div className="flex justify-between text-xs">
          <span className={step === 0 ? "text-primary font-medium" : "text-muted-foreground"}>
            Nhập hợp đồng
          </span>
          <span className={isStepCompleted(1) ? "text-primary font-medium" : "text-muted-foreground"}>
            Chọn xe
          </span>
          <span className={isStepCompleted(2) ? "text-primary font-medium" : "text-muted-foreground"}>
            Chủ sở hữu
          </span>
          <span className={isStepCompleted(3) ? "text-primary font-medium" : "text-muted-foreground"}>
            Đồng sở hữu
          </span>
          <span className={isStepCompleted(4) ? "text-primary font-medium" : "text-muted-foreground"}>
            Xác nhận
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
