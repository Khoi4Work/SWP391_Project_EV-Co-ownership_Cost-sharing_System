import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import QRCode from "react-qr-code";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "@/hooks/use-toast";
interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role: "admin" | "member";
}

interface Vehicle {
  id: string;
  name: string;
  imageUrl: string;
  info: string;
  status: "available" | "in-use" | "maintenance";
}

interface Transaction {
  id: string;
  userId: string;
  name: string; // Tên người thực hiện
  type: "in" | "out";
  amount: number;
  date: string;
}

interface Group {
  id: string;
  name: string;
  ownerId: string;
  minTransfer: number;
  fund: number;
  users: User[];
  vehicles: Vehicle[];
  transactions: Transaction[];
}
const CURRENT_USER_ID = "me"; // giả lập user

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tạm giả lập fetch BE
    setTimeout(() => {
      setGroup({
        id: groupId,
        name: "Nhóm A",
        ownerId: "owner",
        fund: 10000000,
        minTransfer: 10000,
        users: [
          { id: "owner", name: "Nguyễn Văn A", avatar: "", role: "admin", usagePercentage: 50, monthlyContribution: 500000 },
          { id: "me", name: "Bạn", avatar: "", role: "member", usagePercentage: 30, monthlyContribution: 300000 },
          { id: "user2", name: "Nguyễn Văn B", avatar: "", role: "member", usagePercentage: 20, monthlyContribution: 200000 }
        ],
        vehicles: [
          { id: "v1", name: "Xe 1", imageUrl: "", info: "Xe số 1", status: "available" }
        ],
        transactions: [],
        serviceRequests: []
      });
      setLoading(false);
    }, 500);
  }, [groupId]);

  useSEO({
    title: group ? `${group.name} | Nhóm | EcoShare` : "Nhóm | EcoShare",
    description: group ? `Thông tin nhóm ${group.name}` : "Chi tiết nhóm",
    canonicalPath: group ? `/co-owner/groups/${group.id}` : "/co-owner/groups"
  });

  const [amount, setAmount] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ecoshare" | "momo" | "bank">("ecoshare");
  const [openHistory, setOpenHistory] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openRemoveMember, setOpenRemoveMember] = useState(false);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<string>("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberOwnership, setNewMemberOwnership] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [openServiceRequest, setOpenServiceRequest] = useState(false);
  const [paymentType, setPaymentType] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [editingRequest, setEditingRequest] = useState<string | null>(null);

  if (loading) return <div className="container mx-auto p-6">Đang tải...</div>;
  if (!group) return <div>Không tìm thấy nhóm</div>;

  const owner = group.users.find((u: any) => u.id === group.ownerId)!;
  const members = group.users.filter((u: any) => u.id !== group.ownerId);
  const me = group.users.find((u: any) => u.id === CURRENT_USER_ID);
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

  const myTransactions = group.transactions.filter((t: any) => t.userId === CURRENT_USER_ID);

  const bankId = "970422";
  const accountNo = "100614072002";
  const accountName = "ECOSHARE";
  const momoPhone = "0901234567";

  const qrValue = ""; // tạm
  const qrMomoValue = "";
  const qrBankValue = "";

  return (
    <div className="container mx-auto p-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Quay lại</Button>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <Badge variant="secondary">Vai trò của bạn: {myRole === "admin" ? "Admin" : "Member"}</Badge>
        </div>
      </header>

      {/* Phần quỹ chung & QR */}
      <section className="mb-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <div>
                <div className="text-sm text-muted-foreground">Quỹ chung</div>
                <div className="text-2xl font-bold">{group.fund.toLocaleString("vi-VN")} VNĐ</div>
              </div>
              <div>
                <div className="mb-3">
                  {me && <div className="flex items-center justify-between text-xs">
                    <span>{me.name}: {me.usagePercentage}%</span>
                    <span className="font-medium text-primary">{me.monthlyContribution.toLocaleString()} VNĐ</span>
                  </div>}
                </div>
                <Input id="amount" type="number" min={min} placeholder={`${min}`} value={amount} onChange={e => setAmount(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <Button variant={paymentMethod === "ecoshare" ? "default" : "outline"} onClick={() => setPaymentMethod("ecoshare")} className="flex-1">EcoShare</Button>
                  <Button variant={paymentMethod === "momo" ? "default" : "outline"} onClick={() => setPaymentMethod("momo")} className="flex-1">MoMo</Button>
                  <Button variant={paymentMethod === "bank" ? "default" : "outline"} onClick={() => setPaymentMethod("bank")} className="flex-1">Ngân hàng</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerateQR} className="flex-1">Tạo QR chuyển tiền</Button>
                <Button variant="outline" onClick={() => setOpenHistory(true)}>Lịch sử giao dịch</Button>
              </div>
            </div>

            {showQR && (
              <div className="mt-6 flex items-center gap-6">
                <div className="rounded-md border p-4 bg-background">
                  <QRCode value={paymentMethod === "ecoshare" ? qrValue : paymentMethod === "momo" ? qrMomoValue : qrBankValue} size={144} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
