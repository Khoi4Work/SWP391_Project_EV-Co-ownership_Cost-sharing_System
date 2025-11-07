import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";
interface DecisionVoteDetail {
  id: number;
  optionDecisionVote: string; // "PENDING", "APPROVED", "REJECTED", "ABSENT"
  votedAt: string;
  groupMember: {
    users: {
      id: number;
      hovaTen: string;
      email: string;
    };
    group: {
      groupId: number;
    }
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
  const [decision, setDecision] = useState<DecisionVoteDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const userId = localStorage.getItem("userId");
  // ✅ Giả lập currentUser (bạn có thể lấy từ context hoặc localStorage)
  // 🧠 Lấy thông tin DecisionVote từ BE
  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const res = await axiosClient.get(`/groupMember/decision/vote/detail/${id}`);
        if (res.status !== 200) throw new Error("Không thể tải danh sách biểu quyết");

        const details: DecisionVoteDetail[] = res.data;
        setDecision(details); // 🟢 Lưu trực tiếp danh sách detail
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
      const groupId = decision[0].groupMember.group.groupId
      const body = {
        groupId,
        decisionId: Number(id),
        userId: userId,
        vote: vote ? 1 : 0,
      };

      await axiosClient.patch(`/groupMember/decision`, body);

      toast({
        title: "Đã gửi biểu quyết",
        description: `Bạn đã ${vote ? "đồng ý ✅" : "không đồng ý ❌"} với quyết định này.`,
      });

      // Cập nhật lại danh sách vote
      const updated = await axiosClient.get(`/groupMember/decision/${id}`);
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
  if (!decision || decision.length === 0)
    return <p className="text-center py-10">Không có chi tiết biểu quyết.</p>;

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <h2 className="text-xl font-bold text-center">Chi tiết biểu quyết #{id}</h2>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Danh sách thành viên và lựa chọn của họ
          </p>
        </CardHeader>

        <CardContent>
          <ul className="text-sm space-y-1">
            {decision.map((d) => (
              <li
                key={d.id}
                className="flex justify-between border-b py-1 text-muted-foreground"
              >
                <span>{d.groupMember.users.hovaTen}</span>
                <span>
                  {d.optionDecisionVote === "PENDING" && "⏳ Chưa biểu quyết"}
                  {d.optionDecisionVote === "APPROVED" && "✅ Đồng ý"}
                  {d.optionDecisionVote === "REJECTED" && "❌ Không đồng ý"}
                  {d.optionDecisionVote === "ABSENT" && "🚫 Vắng mặt"}
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
