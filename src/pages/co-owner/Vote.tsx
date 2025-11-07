import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";
interface DecisionVoteDetail {
  id: number;
  voteStatus: string; // "PENDING", "APPROVED", "REJECTED"
  groupMember: {
    users: {
      id: number;
      hovaTen: string;
      email: string;
    };
  };
}

interface DecisionVote {
  id: number;
  decisionName: string;
  description: string;
  createdDate: string;
  decisionVoteDetails: DecisionVoteDetail[];
}

export default function Vote() {
  const { id } = useParams(); // lấy id từ URL
  const [decision, setDecision] = useState<DecisionVote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const userId = localStorage.getItem("userId");
  // ✅ Giả lập currentUser (bạn có thể lấy từ context hoặc localStorage)
  // 🧠 Lấy thông tin DecisionVote từ BE
  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const decisionRes = await axiosClient.get(`groupMember/decision/vote/${id}`);
        if (decisionRes.status !== 20) {
          throw new Error("Không thể tạo quyết định mới");
        }
        const decisionVote = decisionRes.data;
        setDecision(decisionVote);
      } catch (err) {
        console.error(err);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin biểu quyết.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [id]);

  // ⚙️ Hàm gửi kết quả vote
  const handleVote = async (vote: boolean) => {
    if (!decision) return;
    setSubmitting(true);

    try {
      const body = {
        decisionId: decision.id,
        userId: userId,
        voteStatus: vote ? "APPROVED" : "REJECTED",
      };

      await axiosClient.patch(`groupMember/decision`, body);

      toast({
        title: "Đã gửi biểu quyết",
        description: `Bạn đã ${vote ? "đồng ý ✅" : "không đồng ý ❌"} với quyết định này.`,
      });

      // Cập nhật lại danh sách vote
      const updated = await axiosClient.get(`/decision/${id}`);
      setDecision(updated.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Lỗi",
        description: "Không thể gửi biểu quyết, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải...</p>;
  if (!decision) return <p className="text-center py-10">Không tìm thấy quyết định.</p>;

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <h2 className="text-xl font-bold text-center">{decision.decisionName}</h2>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {decision.description}
          </p>
        </CardHeader>

        <CardContent>
          <p className="text-sm mb-4 text-center">
            Ngày tạo: {new Date(decision.createdDate).toLocaleString("vi-VN")}
          </p>
          <h3 className="font-semibold mb-2 text-center">Trạng thái biểu quyết:</h3>
          <ul className="text-sm space-y-1">
            {decision.decisionVoteDetails.map((d) => (
              <li
                key={d.id}
                className="flex justify-between border-b py-1 text-muted-foreground"
              >
                <span>{d.groupMember.users.hovaTen}</span>
                <span>
                  {d.voteStatus === "PENDING" && "⏳ Chưa biểu quyết"}
                  {d.voteStatus === "APPROVED" && "✅ Đồng ý"}
                  {d.voteStatus === "REJECTED" && "❌ Không đồng ý"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          <Button
            disabled={submitting}
            onClick={() => handleVote(true)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Đồng ý ✅
          </Button>
          <Button
            variant="destructive"
            disabled={submitting}
            onClick={() => handleVote(false)}
          >
            Không đồng ý ❌
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
