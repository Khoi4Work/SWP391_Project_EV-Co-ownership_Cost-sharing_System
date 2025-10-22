import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import QRCode from "react-qr-code";
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

interface Group {
  id: string;
  name: string;
  ownerId: string;
  fund: number;
  minTransfer: number;
  users: User[];
  vehicles: Vehicle[];
  transactions: Transaction[];
}
interface Transaction {
  id: string;
  name: string;
  type: "deposit" | "withdraw" | "transfer";
  amount: number;
  date: string;
}
const CURRENT_USER_ID = "me";

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
  const [showQR, setShowQR] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ecoshare" | "momo" | "bank">("ecoshare");

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
        name: beGroup.group.groupName,
        ownerId: beGroup.members.find((m: any) => m.roleInGroup === "admin")?.users?.id || "",
        fund: beGroup.group.fund,
        minTransfer: beGroup.group.minTransfer,
        users: beGroup.members.map((m: any) => ({
          id: m.users.id,
          hovaTen: m.users.hovaTen,
          email: m.users.email,
          avatar: m.users.avatar || "https://via.placeholder.com/40", // tạm avatar mặc định
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
        // Thêm transactions tạm thời, nếu BE chưa có
        transactions: beGroup.group.transactions && beGroup.group.transactions.length > 0
          ? beGroup.group.transactions
          : [
            { id: "1", name: "Nạp quỹ", type: "deposit", amount: 500000, date: new Date().toISOString() },
            { id: "2", name: "Rút quỹ", type: "withdraw", amount: 200000, date: new Date().toISOString() }
          ]
      };

      setGroup(groupMapped);
      setLoading(false);
    }

    fetchGroup();
  }, [groupId]);
  if (loading) return <div className="container mx-auto p-6">Đang tải...</div>;
  if (!group) return <div className="container mx-auto p-6">Không tìm thấy nhóm</div>;

  const owner = group.users.find(u => u.id === group.ownerId)!;
  const members = group.users.filter(u => u.id !== group.ownerId);
  const me = group.users.find(u => u.id === CURRENT_USER_ID);
  const myRole = me?.role ?? "member";
  const min = group.minTransfer;
  const handleGenerateQR = () => {
    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt < min) {
      toast({
        title: "Số tiền không hợp lệ",
        description: `Tối thiểu ${min.toLocaleString("vi-VN")} VNĐ`
      });
      setShowQR(false);
      return;
    }
    setShowQR(true);
    toast({ title: "Đã tạo QR chuyển tiền", description: `${amt.toLocaleString("vi-VN")} VNĐ` });
  };
  return (
    <div className="container mx-auto p-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Quay lại</Button>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <Badge variant="secondary">Vai trò của bạn: {myRole === "admin" ? "Admin" : "Member"}</Badge>
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
              </div>

              {/* Nhập số tiền */}
              <div>
                <Input
                  id="amount"
                  type="number"
                  min={min}
                  placeholder={`${min}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    variant={paymentMethod === "ecoshare" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("ecoshare")}
                    className="flex-1"
                  >
                    EcoShare
                  </Button>
                  <Button
                    variant={paymentMethod === "momo" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("momo")}
                    className="flex-1"
                  >
                    MoMo
                  </Button>
                  <Button
                    variant={paymentMethod === "bank" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("bank")}
                    className="flex-1"
                  >
                    Ngân hàng
                  </Button>
                </div>
              </div>

              {/* Tạo QR */}
              <div className="flex gap-2">
                <Button onClick={handleGenerateQR} className="flex-1">Tạo QR chuyển tiền</Button>
              </div>
            </div>

            {showQR && (
              <div className="mt-6 flex items-center gap-6">
                <div className="rounded-md border p-4 bg-background">
                  <QRCode value="tạm" size={144} />
                </div>
              </div>
            )}

            {/* Thêm danh sách thành viên */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Thành viên nhóm</h3>
              <div className="flex gap-3 flex-wrap">
                {group.users.map(u => (
                  <div key={u.id} className="flex items-center gap-2 p-2 border rounded">
                    {/* <Avatar>
                      <AvatarImage src={u.avatar} alt={u.hovaTen} />
                      <AvatarFallback>{u.hovaTen.charAt(0)}</AvatarFallback>
                    </Avatar> */}
                    <span>{u.hovaTen} ({u.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách xe */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Xe trong nhóm</h3>
              <div className="flex gap-3 flex-wrap">
                {group.vehicles.map(v => (
                  <div key={v.id} className="p-2 border rounded w-48">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-sm text-muted-foreground">{v.info}</div>
                    <Badge variant={v.status === "available" ? "default" : v.status === "in-use" ? "secondary" : "destructive"}>
                      {v.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Lịch sử giao dịch */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Giao dịch</h3>
              {group.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có giao dịch</p>
              ) : (
                <table className="w-full table-auto border">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Tên</th>
                      <th className="p-2 text-left">Loại</th>
                      <th className="p-2 text-left">Số tiền</th>
                      <th className="p-2 text-left">Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.transactions.map(t => (
                      <tr key={t.id} className="border-b">
                        <td className="p-2">{t.name}</td>
                        <td className="p-2">{t.type}</td>
                        <td className="p-2">{t.amount.toLocaleString("vi-VN")} VNĐ</td>
                        <td className="p-2">{new Date(t.date).toLocaleDateString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </CardContent>
        </Card>
      </section>
    </div>
  );
}