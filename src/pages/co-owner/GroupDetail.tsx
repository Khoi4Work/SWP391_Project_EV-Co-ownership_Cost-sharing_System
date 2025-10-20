import { useMemo, useState } from "react";
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
import { CURRENT_USER_ID, getGroupById } from "@/data/mockGroups";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const group = useMemo(() => groupId ? getGroupById(groupId) : undefined, [groupId]);

  useSEO({
    title: group ? `${group.name} | Nhóm | EcoShare` : "Nhóm | EcoShare",
    description: group ? `Thông tin nhóm ${group.name}, chủ sở hữu, thành viên và xe.` : "Chi tiết nhóm đồng sở hữu",
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

  // Service request states
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [openServiceRequest, setOpenServiceRequest] = useState(false);
  const [paymentType, setPaymentType] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [serviceRequests, setServiceRequests] = useState<Array<{
    id: string;
    vehicleId: string;
    vehicleName: string;
    paymentType: string;
    serviceType: string;
    description: string;
    status: "pending" | "approved" | "rejected";
    date: string;
  }>>([]);

  if (!group) {
    return <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Không tìm thấy nhóm</CardTitle>
          <CardDescription>Vui lòng kiểm tra lại liên kết.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
        </CardContent>
      </Card>
    </div>;
  }

  const owner = group.users.find(u => u.id === group.ownerId)!;
  const members = group.users.filter(u => u.id !== group.ownerId);
  const me = group.users.find(u => u.id === CURRENT_USER_ID);
  const myRole = me?.role ?? "member";

  const getUserUsage = (userId: string) => {
    const usageMap: Record<string, number> = {
      "owner-1": 45,
      "member-1": 35,
      "member-2": 20
    };
    return usageMap[userId] || 0;
  };

  const getMonthlyContribution = (userId: string) => {
    const usage = getUserUsage(userId);
    const baseAmount = 2000000;
    return Math.round(baseAmount * (usage / 100));
  };

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
    toast({
      title: "Đã tạo QR chuyển tiền",
      description: `${amt.toLocaleString("vi-VN")} VNĐ`
    });
  };

  const myTransactions = group.transactions.filter(t => t.userId === CURRENT_USER_ID);

  const bankId = "970422";
  const accountNo = "100614072002";
  const accountName = "ECOSHARE";

  const qrValue = `00020101021238${(38 + accountNo.length).toString().padStart(2, '0')}0010A00000072701${(14 + accountNo.length).toString().padStart(2, '0')}0006${bankId}01${accountNo.length.toString().padStart(2, '0')}${accountNo}0208QRIBFTTA5303704540${String(Number(amount) || 0).length.toString().padStart(2, '0')}${Number(amount) || 0}5802VN62${(8 + String(group.name).length).toString().padStart(2, '0')}08${String(group.name).length.toString().padStart(2, '0')}${group.name}6304`;

  const momoPhone = "0901234567";
  const qrMomoValue = `2|99|${momoPhone}|||0|0|${Number(amount) || 0}|Chuyen tien cho ${group.name}`;

  const qrBankValue = qrValue;

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
              <div>
                <div className="text-sm text-muted-foreground">Quỹ chung</div>
                <div className="text-2xl font-bold">{group.fund.toLocaleString("vi-VN")} VNĐ</div>
              </div>

              <div>
                <div className="mb-3">
                  <div className="text-sm text-muted-foreground mb-2">Đóng góp hàng tháng của bạn theo tỉ lệ sử dụng:</div>
                  {me && <div className="flex items-center justify-between text-xs">
                    <span>{me.name}: {getUserUsage(me.id)}%</span>
                    <span className="font-medium text-primary">{getMonthlyContribution(me.id).toLocaleString()} VNĐ</span>
                  </div>}
                </div>

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

              <div className="flex gap-2">
                <Button onClick={handleGenerateQR} className="flex-1">Tạo QR chuyển tiền</Button>
                <Button variant="outline" onClick={() => setOpenHistory(true)}>Lịch sử giao dịch</Button>
              </div>
            </div>

            {showQR && (
              <div className="mt-6 flex items-center gap-6">
                <div className="rounded-md border p-4 bg-background">
                  <QRCode
                    value={paymentMethod === "ecoshare" ? qrValue : paymentMethod === "momo" ? qrMomoValue : qrBankValue}
                    size={144}
                  />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {paymentMethod === "ecoshare" ? "QR Ngân hàng (VietQR)" : paymentMethod === "momo" ? "QR MoMo" : "QR Ngân hàng (VietQR)"}
                  </div>
                  <div className="font-semibold">{group.name}</div>
                  <div className="text-sm">
                    Số tiền: {Number(amount).toLocaleString("vi-VN")} VNĐ
                  </div>
                  {paymentMethod === "momo" && <div className="text-xs text-muted-foreground mt-1">Quét QR bằng app MoMo</div>}
                  {(paymentMethod === "bank" || paymentMethod === "ecoshare") && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <div>STK: {accountNo}</div>
                      <div>Ngân hàng: MB Bank</div>
                      <div>Chủ TK: {accountName}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <main className="grid gap-6 lg:grid-cols-2">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Chủ sở hữu nhóm</CardTitle>
              <CardDescription>Thông tin người quản trị nhóm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={owner.avatar} alt={`Ảnh đại diện ${owner.name}`} loading="lazy" />
                    <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      {owner.name}
                      <Badge>Admin</Badge>
                      {owner.id === CURRENT_USER_ID && <Badge variant="outline">Bạn</Badge>}
                    </div>
                    {owner.email && <div className="text-sm text-muted-foreground">{owner.email}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{getUserUsage(owner.id)}%</div>
                  <div className="text-xs text-muted-foreground">Tỉ lệ sử dụng</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Đồng sở hữu</CardTitle>
                  <CardDescription>Các thành viên trong nhóm</CardDescription>
                </div>
                {myRole === "admin" && <Button onClick={() => setOpenAddMember(true)} size="sm">
                  Thêm thành viên
                </Button>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map(m => <div key={m.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={m.avatar} alt={`Ảnh đại diện ${m.name}`} loading="lazy" />
                      <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {m.name}
                        {m.id === CURRENT_USER_ID && <Badge variant="outline">Bạn</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">Member</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">{getUserUsage(m.id)}%</div>
                      <div className="text-xs text-muted-foreground">Tỉ lệ sử dụng</div>
                    </div>
                    {myRole === "admin" && m.id !== CURRENT_USER_ID && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedMemberToRemove(m.id);
                          setOpenRemoveMember(true);
                        }}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>)}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Xe của nhóm</CardTitle>
                  <CardDescription>Hình ảnh, thông tin và trạng thái</CardDescription>
                </div>
                <Button onClick={() => setOpenServiceRequest(true)} disabled={!selectedVehicle} size="sm">
                  Request dịch vụ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="vehicles">
                <TabsList>
                  <TabsTrigger value="vehicles">Danh sách xe</TabsTrigger>
                  <TabsTrigger value="requests">Yêu cầu dịch vụ ({serviceRequests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="vehicles">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.vehicles.map(v => <div key={v.id} className={`border rounded-md p-3 cursor-pointer transition-colors ${selectedVehicle === v.id ? "border-primary bg-primary/5" : "hover:bg-accent/50"}`} onClick={() => setSelectedVehicle(v.id)}>
                      <img src={v.imageUrl} alt={`Hình ảnh xe ${v.name}`} loading="lazy" className="w-full h-32 object-cover rounded mb-2" />
                      <div className="font-semibold flex items-center gap-2">
                        {v.name}
                        {selectedVehicle === v.id && <Badge variant="outline">Đã chọn</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{v.info}</div>
                      <Badge variant={v.status === "maintenance" ? "destructive" : v.status === "in-use" ? "secondary" : "default"}>
                        {v.status === "available" ? "Sẵn sàng" : v.status === "in-use" ? "Đang sử dụng" : "Bảo dưỡng"}
                      </Badge>
                    </div>)}
                  </div>
                </TabsContent>

                <TabsContent value="requests">
                  <div className="space-y-3">
                    {serviceRequests.length === 0 ? <div className="text-center py-6 text-muted-foreground">
                      Chưa có yêu cầu dịch vụ nào
                    </div> : serviceRequests.map(request => <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{request.vehicleName}</div>
                          <div className="text-sm text-muted-foreground">{request.serviceType}</div>
                          <div className="text-sm mt-1">{request.description}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {request.paymentType === "self" ? "Tự chi trả" : "Dùng quỹ chung"} • {request.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                            {request.status === "pending" ? "Chờ duyệt" : request.status === "approved" ? "Đã duyệt" : "Từ chối"}
                          </Badge>
                          {request.status === "pending" && <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingRequest(request.id);
                              setSelectedVehicle(request.vehicleId);
                              setPaymentType(request.paymentType);
                              setServiceType(request.serviceType);
                              setServiceDescription(request.description);
                              setOpenServiceRequest(true);
                            }}>
                              Sửa
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              setServiceRequests(prev => prev.filter(r => r.id !== request.id));
                              toast({
                                title: "Đã xóa yêu cầu",
                                description: "Yêu cầu dịch vụ đã được xóa thành công"
                              });
                            }}>
                              Xóa
                            </Button>
                          </div>}
                        </div>
                      </div>
                    </div>)}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử giao dịch</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="mine">
            <TabsList>
              <TabsTrigger value="mine">Của tôi</TabsTrigger>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
            </TabsList>
            <TabsContent value="mine">
              <TransactionTable rows={myTransactions.map(t => ({
                ...t,
                groupName: group.name
              }))} />
            </TabsContent>
            <TabsContent value="all">
              <TransactionTable rows={group.transactions.map(t => ({
                ...t,
                groupName: group.name
              }))} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={openAddMember} onOpenChange={setOpenAddMember}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm thành viên mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email" className="text-sm font-medium">Email thành viên mới:</Label>
              <Input
                id="member-email"
                type="email"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                placeholder="example@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-ownership" className="text-sm font-medium">Tỉ lệ sở hữu (%):</Label>
              <Input
                id="member-ownership"
                type="number"
                min="1"
                max="100"
                value={newMemberOwnership}
                onChange={e => setNewMemberOwnership(e.target.value)}
                placeholder="Nhập tỉ lệ từ 1-100%"
              />
              <p className="text-xs text-muted-foreground">
                Tỉ lệ sở hữu sẽ ảnh hưởng đến mức đóng góp quỹ hàng tháng
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => {
                const ownership = Number(newMemberOwnership);
                if (newMemberEmail.trim()
                  && newMemberEmail.includes("@gmail.com")
                  && ownership > 0
                  && ownership <= 100) {
                  toast({
                    title: "Yêu cầu đã được gửi",
                    description: `Thêm ${newMemberEmail} với tỉ lệ sở hữu ${ownership}%. Staff sẽ xử lý trong 24h.`
                  });
                  setOpenAddMember(false);
                  setNewMemberEmail("");
                  setNewMemberOwnership("");
                } else {
                  toast({
                    title: "Thông tin không hợp lệ",
                    description: "Vui lòng nhập đúng Gmail và tỉ lệ sở hữu (1-100%)",
                    variant: "destructive"
                  });
                }
              }} className="flex-1">
                Gửi yêu cầu
              </Button>
              <Button variant="outline" onClick={() => {
                setOpenAddMember(false);
                setNewMemberEmail("");
                setNewMemberOwnership("");
              }}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openRemoveMember} onOpenChange={setOpenRemoveMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?</p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => {
                toast({
                  title: "Yêu cầu đã được gửi",
                  description: "Staff sẽ xử lý yêu cầu xóa thành viên trong 24h"
                });
                setOpenRemoveMember(false);
                setSelectedMemberToRemove("");
              }} className="flex-1">
                Gửi yêu cầu xóa
              </Button>
              <Button variant="outline" onClick={() => setOpenRemoveMember(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openServiceRequest} onOpenChange={setOpenServiceRequest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRequest ? "Chỉnh sửa yêu cầu dịch vụ" : "Yêu cầu dịch vụ xe"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Xe đã chọn:</Label>
              <div className="mt-1 p-2 bg-accent/30 rounded-md">
                {group.vehicles.find(v => v.id === selectedVehicle)?.name || "Chưa chọn xe"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Hình thức thanh toán:</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self">Tự chi trả (tự lái xe đi thực hiện dịch vụ)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group" id="group" />
                  <Label htmlFor="group">Dùng quỹ chung (gửi xe lên công ty vận hành)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium">Loại dịch vụ:</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parking">Đậu xe</SelectItem>
                  <SelectItem value="wash">Rửa xe</SelectItem>
                  <SelectItem value="maintenance">Bảo dưỡng</SelectItem>
                  <SelectItem value="repair">Sửa chữa</SelectItem>
                  <SelectItem value="inspection">Kiểm định</SelectItem>
                  <SelectItem value="insurance">Bảo hiểm</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Mô tả chi tiết:</Label>
              <Textarea value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} placeholder="Nhập mô tả chi tiết về dịch vụ cần thực hiện..." className="mt-1" rows={3} />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => {
                if (!selectedVehicle || !paymentType || !serviceType || !serviceDescription.trim()) {
                  toast({
                    title: "Thông tin chưa đầy đủ",
                    description: "Vui lòng điền đầy đủ thông tin yêu cầu"
                  });
                  return;
                }
                if (editingRequest) {
                  setServiceRequests(prev => prev.map(req => req.id === editingRequest ? {
                    ...req,
                    vehicleId: selectedVehicle,
                    vehicleName: group.vehicles.find(v => v.id === selectedVehicle)?.name || "",
                    paymentType,
                    serviceType,
                    description: serviceDescription
                  } : req));
                  toast({
                    title: "Cập nhật thành công",
                    description: "Yêu cầu dịch vụ đã được cập nhật"
                  });
                } else {
                  const newRequest = {
                    id: `req-${Date.now()}`,
                    vehicleId: selectedVehicle,
                    vehicleName: group.vehicles.find(v => v.id === selectedVehicle)?.name || "",
                    paymentType,
                    serviceType,
                    description: serviceDescription,
                    status: "pending" as const,
                    date: new Date().toLocaleDateString("vi-VN")
                  };
                  setServiceRequests(prev => [...prev, newRequest]);
                  toast({
                    title: "Gửi yêu cầu thành công",
                    description: "Staff sẽ xử lý yêu cầu của bạn trong 24h"
                  });
                }
                setOpenServiceRequest(false);
                setEditingRequest(null);
                setPaymentType("");
                setServiceType("");
                setServiceDescription("");
              }} className="flex-1">
                {editingRequest ? "Cập nhật yêu cầu" : "Gửi yêu cầu"}
              </Button>
              <Button variant="outline" onClick={() => {
                setOpenServiceRequest(false);
                setEditingRequest(null);
                setPaymentType("");
                setServiceType("");
                setServiceDescription("");
              }}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TxRow {
  id: string;
  name: string;
  amount: number;
  type: "in" | "out";
  date: string;
  groupName: string;
}

function TransactionTable({ rows }: { rows: TxRow[] }) {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Người thực hiện</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Số tiền (VNĐ)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.id}>
              <TableCell>{new Date(r.date).toLocaleDateString("vi-VN")}</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.type === "in" ? "Nạp quỹ" : "Chi quỹ"}</TableCell>
              <TableCell className="text-right">{r.amount.toLocaleString("vi-VN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}