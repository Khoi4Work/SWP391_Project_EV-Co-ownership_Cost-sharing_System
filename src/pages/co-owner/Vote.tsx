import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";
import axios from "axios";

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
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  console.log("Token từ query string:", token);
  const { id } = useParams(); // id của nhóm hoặc quyết định, tuỳ BE
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [decisionDetails, setDecisionDetails] = useState([]);
  const [decisionNameList, setDecisionNameList] = useState<string[]>([]);
  const deciId = localStorage.getItem("decisionId");
  const serviId = localStorage.getItem("serviceId");
  console.log("Decision ID from localStorage:", deciId);
  const name = localStorage.getItem("creatorName");
  console.log("Name from localStorage:", name);
  const groupMemberCount = localStorage.getItem("groupMemberCount");
  const totalAmount = localStorage.getItem("totalAmount");
  const amountPerPerson = Math.floor(Number(totalAmount) / Number(groupMemberCount));
  console.log("Total Amount from localStorage:", totalAmount);


    useEffect(() => {

    }, []);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Lỗi",
        description: "Token không hợp lệ hoặc hết hạn.",
        variant: "destructive",
      });
      navigate("/co-owner/dashboard"); // hoặc "/home" hoặc bất kỳ trang nào bạn muốn
      return;
    }
    const fetchDecisionVoteDetail = async () => {
      try {
        const res = await axiosClient.get(`groupMember/decision/${deciId}`);
        if (res.status !== 200) throw new Error("Không thể tải chi tiết bỏ phiếu");
        const decisionName = res.data.decisionName ?? [];
        setDecisionNameList(decisionName);
        setServices(res.data);
        console.log("res data", res.data);
        const data = res.data;
        // setDecisionDetails(data); // Lưu vào state để hiển thị
        setPayerName(name || "Thành viên");
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
  }, [token, id, navigate]);


  const handleConfirm = async (voteValue: number) => {
    try {
      setSubmitting(true);
      const payload = {
        decisionId: deciId,
        groupId: id,
        serviceId: serviId,
        vote: voteValue,
      };
      const res = await axios.patch(`http://localhost:8080/groupMember/decision`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status !== 200) {
        throw new Error("Không thể gửi vote");
      }
      toast({
        title: voteValue === 1 ? "Đồng ý trả tiền" : "Không đồng ý trả tiền",
        description: voteValue === 1
          ? "Bạn đã xác nhận đồng ý trả tiền cho các dịch vụ."
          : "Bạn đã xác nhận không đồng ý trả tiền.",
      });
      navigate("/co-owner/dashboard");
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
    <div className="flex justify-center py-12 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-2xl shadow-lg rounded-xl border border-gray-200">

        <CardHeader>
          <h2 className="text-2xl font-extrabold text-center text-gray-800">
            Thành viên {payerName} đã đăng ký các dịch vụ
          </h2>
        </CardHeader>

        <CardContent className="px-6 py-4">
          {/* HIỂN THỊ DECISION NAME */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Chi tiết dịch vụ:
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              {decisionNameList.map((name, idx) => (
                <li key={idx} className="text-gray-900 text-lg">
                  <span className="font-bold">Tên dịch vụ:</span> {name}
                </li>
              ))}
            </ul>
          </div>

          {/* HIỂN THỊ SERVICE DETAILS */}
          <div className="mt-6 border-t border-gray-300 pt-4 space-y-3">
            <p className="text-base text-gray-700">
              Tổng chi phí:{" "}
              <span className="font-bold text-gray-900">
                {Number(totalAmount).toLocaleString("vi-VN")}₫
              </span>
            </p>
            <p className="text-lg font-bold text-green-600">
              Mỗi người trả: {amountPerPerson.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4 py-4">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition duration-200"
            onClick={() => handleConfirm(1)} // 1: Đồng ý
            disabled={submitting}
          >
            {submitting ? "Đang xác nhận..." : "Xác nhận trả tiền"}
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition duration-200"
            onClick={() => handleConfirm(0)} // 0: Không đồng ý
            disabled={submitting}
          >
            {submitting ? "Đang xác nhận..." : "Không đồng ý trả tiền"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
