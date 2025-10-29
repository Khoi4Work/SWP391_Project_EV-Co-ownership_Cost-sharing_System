import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  hovaTen: string;
  avatar?: string;
  email?: string;
  role: "admin" | "member";
  ownershipPercentage?: number;
}

interface Vehicle {
  id: string;
  name: string;
  info?: string;
  status: "available" | "in-use" | "maintenance";
  imageUrl?: string;
}

interface Transaction {
  id: string;
  name: string;
  type: "deposit" | "withdraw" | "transfer";
  amount: number;
  date: string;
  userId?: string;
}

interface Group {
  id: string;
  fundId: number;
  name: string;
  ownerId: string;
  fund: number;
  minTransfer: number;
  users: User[];
  vehicles: Vehicle[];
  transactions: Transaction[];
}

const CURRENT_USER_ID = "me";
const API_BASE_URL = "http://localhost:8080";

function mockFetchGroups() {
  return new Promise<any[]>(resolve => {
    setTimeout(() => {
      resolve([
        {
          roleInGroup: "admin",
          status: "active",
          ownershipPercentage: 50,
          group: {
            groupId: 1,
            fundId: 1,
            groupName: "Nhóm A",
            description: "Mô tả nhóm A",
            createdAt: "2025-10-22T00:00:00",
            status: "active",
            vehicles: [
              { id: 1, name: "Xe 1", info: "Xe số 1", status: "available", imageUrl: "" }
            ],
            transactions: [],
            fund: 10000000,
            minTransfer: 10000
          },
          members: [
            {
              id: 1,
              roleInGroup: "admin",
              ownershipPercentage: 50,
              users: { id: "owner", hovaTen: "Nguyễn Văn A", email: "a@ex.com", avatar: "" }
            },
            {
              id: 2,
              roleInGroup: "member",
              ownershipPercentage: 30,
              users: { id: "me", hovaTen: "Bạn", email: "me@ex.com", avatar: "" }
            }
          ]
        }
      ]);
    }, 300);
  });
}

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      const data = await mockFetchGroups();
      const beGroup = data.find(g => g.group.groupId.toString() === groupId);
      if (!beGroup) {
        setGroup(null);
        setLoading(false);
        return;
      }

      const groupMapped: Group = {
        id: beGroup.group.groupId.toString(),
        fundId: beGroup.group.fundId,
        name: beGroup.group.groupName,
        ownerId: beGroup.members.find((m: any) => m.roleInGroup === "admin")?.users?.id || "",
        fund: beGroup.group.fund,
        minTransfer: beGroup.group.minTransfer,
        users: beGroup.members.map((m: any) => ({
          id: m.users.id,
          hovaTen: m.users.hovaTen,
          email: m.users.email,
          avatar: m.users.avatar || "https://via.placeholder.com/40",
          role: m.roleInGroup === "admin" ? "admin" : "member",
          ownershipPercentage: m.ownershipPercentage
        })),
        vehicles: beGroup.group.vehicles.map((v: any) => ({
          id: v.id.toString(),
          name: v.name,
          info: v.info,
          status: v.status,
          imageUrl: v.imageUrl || ""
        })),
        transactions: beGroup.group.transactions && beGroup.group.transactions.length > 0
          ? beGroup.group.transactions
          : [
            { id: "1", name: "Nạp quỹ", type: "deposit", amount: 500000, date: new Date().toISOString(), userId: "me" },
            { id: "2", name: "Rút quỹ", type: "withdraw", amount: 200000, date: new Date().toISOString(), userId: "owner" }
          ]
      };

      setGroup(groupMapped);
      setLoading(false);
    }

    fetchGroup();
  }, [groupId]);

  const handleDeposit = async () => {
    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt < group!.minTransfer) {
      toast({
        title: "Số tiền không hợp lệ",
        description: `Tối thiểu ${group!.minTransfer.toLocaleString("vi-VN")} VNĐ`,
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/fund-payment/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Thêm Authorization header nếu có
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fundId: group!.fundId,
          groupId: Number(groupId),
          userId: Number(CURRENT_USER_ID === "me" ? 2 : 1), // Convert user ID sang số
          amount: amt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        toast({
          title: "Đang chuyển đến VNPay",
          description: `Số tiền: ${amt.toLocaleString("vi-VN")} VNĐ`
        });
        
        // Redirect đến VNPay payment gateway
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.message || 'No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi tạo thanh toán",
        description: "Không thể kết nối đến cổng thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  if (loading) return <div className="container mx-auto p-6">Đang tải...</div>;
  if (!group) return <div className="container mx-auto p-6">Không tìm thấy nhóm</div>;

  const me = group.users.find(u => u.id === CURRENT_USER_ID);
  const myRole = me?.role ?? "member";
  const min = group.minTransfer;

  return (
    <div className="container mx-auto p-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Quay lại</Button>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <Badge variant="secondary">Vai trò: {myRole === "admin" ? "Admin" : "Member"}</Badge>
        </div>
      </header>

      <section className="mb-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3 items-end">
              {/* Quỹ chung */}
              <div>
                <div className="text-sm text-muted-foreground">Quỹ chung</div>
                <div className="text-2xl font-bold">{group.fund.toLocaleString("vi-VN")} VNĐ</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tối thiểu: {min.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>

              {/* Nhập số tiền */}
              <div>
                <label htmlFor="amount" className="text-sm font-medium mb-2 block">
                  Số tiền nạp
                </label>
                <Input
                  id="amount"
                  type="number"
                  min={min}
                  placeholder={`Tối thiểu ${min.toLocaleString("vi-VN")} VNĐ`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={processing}
                />
              </div>

              {/* Button nạp tiền */}
              <div>
                <Button 
                  onClick={handleDeposit} 
                  className="w-full"
                  disabled={processing || !amount}
                >
                  {processing ? "Đang xử lý..." : "Nạp tiền qua VNPay"}
                </Button>
              </div>
            </div>

            {/* Danh sách thành viên */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-lg">Thành viên nhóm</h3>
              <div className="flex gap-3 flex-wrap">
                {group.users.map(u => (
                  <div key={u.id} className="flex items-center gap-2 p-3 border rounded-lg bg-background hover:bg-accent transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {u.hovaTen.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{u.hovaTen}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.role === "admin" ? "Quản trị viên" : "Thành viên"} • {u.ownershipPercentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách xe */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-lg">Xe trong nhóm</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {group.vehicles.map(v => (
                  <div key={v.id} className="p-4 border rounded-lg bg-background">
                    <div className="font-medium text-lg">{v.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{v.info}</div>
                    <Badge 
                      variant={v.status === "available" ? "default" : v.status === "in-use" ? "secondary" : "destructive"}
                      className="mt-2"
                    >
                      {v.status === "available" ? "Sẵn sàng" : v.status === "in-use" ? "Đang sử dụng" : "Bảo trì"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Lịch sử giao dịch */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-lg">Lịch sử giao dịch</h3>
              {group.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                  Chưa có giao dịch nào
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left font-medium">Tên giao dịch</th>
                        <th className="p-3 text-left font-medium">Loại</th>
                        <th className="p-3 text-right font-medium">Số tiền</th>
                        <th className="p-3 text-left font-medium">Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.transactions.map(t => (
                        <tr key={t.id} className="border-t hover:bg-muted/50 transition-colors">
                          <td className="p-3">{t.name}</td>
                          <td className="p-3">
                            <Badge variant={t.type === "deposit" ? "default" : t.type === "withdraw" ? "destructive" : "secondary"}>
                              {t.type === "deposit" ? "Nạp tiền" : t.type === "withdraw" ? "Rút tiền" : "Chuyển khoản"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-medium">
                            <span className={t.type === "deposit" ? "text-green-600" : "text-red-600"}>
                              {t.type === "deposit" ? "+" : "-"}{t.amount.toLocaleString("vi-VN")} VNĐ
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(t.date).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}