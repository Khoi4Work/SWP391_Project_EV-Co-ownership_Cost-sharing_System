import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const PaymentFailed = () => {
    const navigate = useNavigate();

    useEffect(() => {
        toast({
            title: "Thanh toán thất bại",
            description: "Giao dịch không thành công hoặc đã bị hủy.",
            variant: "destructive",
        });
    }, []);

    return (
        <div className="container mx-auto p-6">
            <Card className="shadow-sm">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="text-2xl font-bold">Thanh toán thất bại</div>
                    <div className="text-muted-foreground">Vui lòng thử lại .</div>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate(-1)}>Thử lại</Button>
                        <Button variant="secondary" onClick={() => navigate("/")}>Về trang chủ</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentFailed;


