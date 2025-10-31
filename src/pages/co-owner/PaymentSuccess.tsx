import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const amount = params.get("amount");
        if (amount) {
            toast({
                title: "Thanh toán thành công",
                description: `Bạn đã nạp ${Number(amount).toLocaleString("vi-VN")} VNĐ vào quỹ`,
            });
        } else {
            toast({
                title: "Thanh toán thành công",
                description: "Giao dịch đã được ghi nhận.",
            });
        }
    }, [params]);

    return (
        <div className="container mx-auto p-6">
            <Card className="shadow-sm">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="text-2xl font-bold">Thanh toán thành công</div>
                    <div className="text-muted-foreground">Cảm ơn bạn đã nạp quỹ.</div>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate(-1)}>Quay lại</Button>
                        <Button variant="secondary" onClick={() => navigate("/co-owner/groups")}>Về nhóm của tôi</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;


