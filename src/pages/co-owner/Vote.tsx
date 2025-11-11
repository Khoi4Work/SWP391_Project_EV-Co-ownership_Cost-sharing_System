import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";

interface Service {
  id: number;
  serviceName: string;
  price: number;
  receiptImageUrl: string;
}

interface PaymentDetailResponse {
  payerName: string;
  services: Service[];
  groupMemberCount: number;
}

export default function PaymentConfirmation() {
  const { id } = useParams(); // id của nhóm hoặc quyết định, tuỳ BE
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [groupMemberCount, setGroupMemberCount] = useState(1);
  const [decisionDetails, setDecisionDetails] = useState([]);
  const totalAmount = services.reduce((sum, s) => sum + s.price, 0);
  const amountPerPerson = Math.floor(totalAmount / groupMemberCount);

  useEffect(() => {
    const fetchDecisionVoteDetail = async () => {
      try {
        const res = await axiosClient.get(`/decision/vote/detail/${id}`);
        if (res.status !== 200) throw new Error("Không thể tải chi tiết bỏ phiếu");

        const data = res.data; // Mảng DecisionVoteDetail[]
        setDecisionDetails(data); // Lưu vào state để hiển thị
        setPayerName(data.createdBy.user.hovaTen);

      } catch (err) {
        console.error(err);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin chi tiết bỏ phiếu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDecisionVoteDetail();
  }, [id]);


  const handleConfirmPayment = async () => {
    try {
      setSubmitting(true);
      // ⚠️ Gửi xác nhận thanh toán
      await axiosClient.post(`/groupMember/payment/confirm/${id}`);
      toast({
        title: "Xác nhận thành công",
        description: "Bạn đã xác nhận trả tiền cho các dịch vụ.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận trả tiền.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <h2 className="text-xl font-bold text-center">
            Thành viên {payerName} đã đăng ký các dịch vụ
          </h2>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{s.serviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    Giá: {s.price.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <img
                  src={s.receiptImageUrl}
                  alt="Phiếu thanh toán"
                  className="w-20 h-20 object-cover rounded"
                />
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-4 space-y-2">
            <p className="text-sm">
              Tổng chi phí:{" "}
              <span className="font-bold">
                {totalAmount.toLocaleString("vi-VN")}₫
              </span>
            </p>
            <p className="text-sm">
              Số thành viên:{" "}
              <span className="font-bold">{groupMemberCount}</span>
            </p>
            <p className="text-lg font-bold text-primary">
              Mỗi người trả: {amountPerPerson.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleConfirmPayment}
            disabled={submitting}
          >
            {submitting ? "Đang xác nhận..." : "Xác nhận trả tiền"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
