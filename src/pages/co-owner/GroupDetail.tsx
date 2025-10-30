import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosClient from "@/api/axiosClient";
import {
  mockCommonFund,
  mockFundDetails,
  mockGroupMembers,
  mockVehicles,
} from "@/data/mockGroupDetail";

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
const API_BASE_URL = "http://localhost:8080"; // giữ lại hoặc lấy baseURL chung của dự án
const USE_MOCK_DATA = false;
const currentUserId = USE_MOCK_DATA ? 2 : Number(localStorage.getItem("userId"));

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  // Thêm state cho dialog xem chi tiết
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);

  // FUNCTION: Load group Ids nếu thiếu groupId param, lấy id đầu tiên
  useEffect(() => {
    async function loadGroupId() {
      try {
        // Nếu đang mock thì lấy cứng luôn
        if (USE_MOCK_DATA) {
          const mockGroupIds = [1];
          localStorage.setItem("groupIds", JSON.stringify(mockGroupIds));
          localStorage.setItem("groupId", String(mockGroupIds[0]));
          if (!groupId) navigate(`/group/${mockGroupIds[0]}`);
          return;
        }
        // Lấy userId từ localStorage
        const currentUserId = Number(localStorage.getItem("userId"));
        if (!currentUserId) return;
        // Fetch danh sách groupId user đang tham gia
        const res = await axiosClient.get(`/groupMember/getGroupIdsByUserId?userId=${currentUserId}`);
        const groupIds: number[] = res.data;
        if (!groupIds || groupIds.length === 0) {
          toast({ title: "Thông báo", description: "Bạn chưa tham gia nhóm nào", variant: "destructive" });
          navigate("/co-owner/dashboard");
          return;
        }
        localStorage.setItem("groupIds", JSON.stringify(groupIds));
        localStorage.setItem("groupId", String(groupIds[0]));
        if (!groupId) navigate(`/group/${groupIds[0]}`);
      } catch {
        toast({ title: "Lỗi", description: "Không thể lấy thông tin nhóm", variant: "destructive" });
      }
    }
    // Chỉ gọi nếu không có groupId param hoặc groupId là null/undefined
    if (!groupId) loadGroupId();
    // else: useEffect dưới sẽ fetch detail bình thường
  }, [groupId, navigate]);

  // CŨ: useEffect fetch thông tin detail group...
  useEffect(() => {
    // Nếu groupId không tồn tại (vẫn chưa set từ loadGroupId), thì không làm gì
    if (!groupId) return;
    async function fetchGroupBE() {
      setLoading(true);
      try {
        let commonFund, fundDetails, members, vehicles;
        if (USE_MOCK_DATA) {
          commonFund = mockCommonFund;
          fundDetails = mockFundDetails;
          members = mockGroupMembers;
          vehicles = mockVehicles;
        } else {
          const gid = Number(groupId);
          // Đúng endpoint mới lấy quỹ chung theo groupId
          // Đúng:
          const fundRes = await axiosClient.get(`/api/fund-payment/common-fund/group/${gid}`);
          commonFund = fundRes.data;
          // Lấy lịch sử quỹ
          const fundDetailRes = await axiosClient.get(`/api/fund-payment/fund-details/${commonFund.fundId}`);
          fundDetails = fundDetailRes.data;
          const membersRes = await axiosClient.get(`/groupMember/members/${gid}`);
          members = membersRes.data;
          const vehiclesRes = await axiosClient.get(`/vehicle/getVehicleByGroupID/${gid}`);
          vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [vehiclesRes.data];
        }
        setGroup({
          id: commonFund.group.groupId.toString(),
          fundId: commonFund.fundId,
          name: commonFund.group.groupName,
          ownerId: members.find((m: any) => m.roleInGroup === "admin")?.userId?.id || "",
          fund: Number(commonFund.balance),
          minTransfer: 10000,
          users: members.map((m: any) => ({
            id: m.userId.id?.toString() || '',
            hovaTen: m.userId.hovaTen || m.userId.fullName || '',
            email: m.userId.email,
            avatar: m.userId.avatar,
            role: m.roleInGroup === "admin" ? "admin" : "member",
            ownershipPercentage: m.ownershipPercentage
          })),
          vehicles: vehicles.map((v: any) => ({
            id: v.vehicleId?.toString() || '',
            name: v.plateNo + " " + v.brand + " " + v.model,
            info: v.model,
            status: "available",
            imageUrl: v.imageUrl
          })),
          transactions: fundDetails.map((fd: any) => ({
            id: fd.fundDetailId?.toString() || '',
            name: fd.transactionType,
            type: fd.transactionType && fd.transactionType.toLowerCase().includes("deposit") ? "deposit" : (fd.transactionType?.toLowerCase().includes("withdraw") ? "withdraw" : "transfer"),
            amount: Number(fd.amount),
            date: fd.createdAt || new Date().toISOString(),
            userId: fd.groupMember?.userId?.toString() || ''
          }))
        });
      } catch (err) {
        setGroup(null);
      }
      setLoading(false);
    }
    fetchGroupBE();
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/fund-payment/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

            {/* Lịch sử sử dụng xe */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-lg">Lịch sử sử dụng xe</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left font-medium">Ngày</th>
                      <th className="p-3 text-left font-medium">Xe</th>
                      <th className="p-3 text-left font-medium">Người dùng</th>
                      <th className="p-3 text-left font-medium">Giờ sử dụng</th>
                      <th className="p-3 text-left font-medium">Trạng thái</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                    // MOCK DATA. Số lượng nhiều cũng được
                    [{
                      id: 1, date: "2025-10-22", vehicle: "Xe 1", user: "Bạn", start:"08:00", end:"10:30", status: "Hoàn thành", note: 'Không lỗi gì', checkIn: '08:00', checkOut: '10:30', distance: 30
                    },
                    {
                      id: 2, date: "2025-10-20", vehicle: "Xe 1", user: "Nguyễn Văn A", start:"15:00", end:"17:00", status: "Đang sử dụng", note: 'Đang sử dụng - chưa check-out', checkIn: '15:00', checkOut: null, distance: null
                    }].map(x => (
                      <tr key={x.id} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-3">{x.date}</td>
                        <td className="p-3">{x.vehicle}</td>
                        <td className="p-3">{x.user}</td>
                        <td className="p-3">{x.start} - {x.end}</td>
                        <td className="p-3">
                          <Badge variant={x.status === "Hoàn thành" ? "default" : x.status === "Đang sử dụng" ? "secondary" : "outline"}>{x.status}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedHistory(x); setDetailOpen(true); }}>Xem chi tiết</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Dialog chi tiết lịch sử sử dụng xe */}
              <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Chi tiết sử dụng xe</DialogTitle>
                  </DialogHeader>
                  {selectedHistory && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-semibold">Ngày:</span> {selectedHistory.date}</div>
                        <div><span className="font-semibold">Xe:</span> {selectedHistory.vehicle}</div>
                        <div><span className="font-semibold">Người dùng:</span> {selectedHistory.user}</div>
                        <div><span className="font-semibold">Trạng thái:</span> {selectedHistory.status}</div>
                        <div><span className="font-semibold">Check-in:</span> {selectedHistory.checkIn}</div>
                        <div><span className="font-semibold">Check-out:</span> {selectedHistory.checkOut ?? '-'}</div>
                        <div><span className="font-semibold">Quãng đường:</span> {selectedHistory.distance != null ? `${selectedHistory.distance} km` : '-'}</div>
                        <div className="col-span-2"><span className="font-semibold">Ghi chú:</span> {selectedHistory.note || '-'}</div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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