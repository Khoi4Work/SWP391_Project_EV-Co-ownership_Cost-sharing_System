import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosClient from "@/api/axiosClient";
import { fetchUsageHistoryDetail, fetchUsageHistoryList } from "@/api/usageHistory";

// Interface cho GroupMember response từ BE
interface GroupMemberDetailRes {
    id: number;
    roleInGroup: string;
    ownershipPercentage: number;
    hovaten: string;
    userId: number;
    groupId: number;
}

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

interface VehicleUsage {
    id: number;
    date: string;
    vehicle: string;
    user: string;
    start: string;
    end: string;
    status: "Hoàn thành" | "Đang sử dụng";
    note: string;
    checkIn: string;
    checkOut: string | null;
    distance: number | null;
}

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK_DATA = false;

export default function GroupDetail() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    // States
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [amount, setAmount] = useState("");
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<VehicleUsage | null>(null);
    const [vehicleUsages, setVehicleUsages] = useState<VehicleUsage[]>([]);

    // Load lịch sử sử dụng xe từ BE
    useEffect(() => {
        const userIdStr = localStorage.getItem("userId");
        if (!groupId || !userIdStr) return;
        const userIdNum = Number(userIdStr);
        const gId = Number(groupId);
        fetchUsageHistoryList(userIdNum, gId)
            .then(list => {
                const mapped: VehicleUsage[] = list.map(it => {
                    const [start, end] = (it.timeRange || " - ").split(" - ");
                    return {
                        id: it.scheduleId,
                        date: it.date,
                        vehicle: it.vehicleName,
                        user: it.userName,
                        start: start || "",
                        end: end || "",
                        status: it.hasCheckOut ? "Hoàn thành" : "Đang sử dụng",
                        note: "",
                        checkIn: start || "",
                        checkOut: it.hasCheckOut ? (end || null) : null,
                        distance: null,
                    };
                });
                setVehicleUsages(mapped);
            })
            .catch(err => {
                console.warn("⚠️ Cannot load usage history:", err?.message || err);
            });
    }, [groupId]);

    // EFFECT 1: Load group ID nếu chưa có
    useEffect(() => {
        if (groupId) return; // Nếu đã có groupId param thì skip

        async function loadGroupId() {
            try {
                const userId = Number(localStorage.getItem("userId"));
                if (!userId) {
                    setError("Không tìm thấy userId");
                    return;
                }

                const token = localStorage.getItem("accessToken");
                // Lấy danh sách group của user
                const res = await axiosClient.get(`/groupMember/getGroupIdsByUserId`, {
                    params: { userId },
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                const groupIds: number[] = res.data;
                if (!groupIds || groupIds.length === 0) {
                    toast({
                        title: "Thông báo",
                        description: "Bạn chưa tham gia nhóm nào",
                        variant: "destructive"
                    });
                    navigate("/co-owner/dashboard");
                    return;
                }

                // Điều hướng sang group đầu tiên
                navigate(`/group/${groupIds[0]}`);
            } catch (err) {
                console.error("Error loading group ID:", err);
                setError("Không thể lấy danh sách nhóm");
            }
        }

        loadGroupId();
    }, [groupId, navigate]);

    // EFFECT 2: Fetch thông tin group chi tiết
    useEffect(() => {
        if (!groupId) return;

        async function fetchGroupDetail() {
            setLoading(true);
            setError("");

            try {
                const gid = Number(groupId);
                console.log("=== FETCHING GROUP DETAIL ===");
                console.log("GroupId:", gid);
                const token = localStorage.getItem("accessToken");

                // Helper: try multiple endpoints in case BE route differs between envs
                const getWithFallback = async <T,>(paths: string[]): Promise<T> => {
                    let lastError: any = null;
                    for (const path of paths) {
                        try {
                            const res = await axiosClient.get<T>(path, {
                                headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            return res.data as T;
                        } catch (err: any) {
                            lastError = err;
                            if (err?.response?.status && err.response.status !== 404) {
                                // If not 404, break early (e.g., 401/500)
                                break;
                            }
                        }
                    }
                    throw lastError || new Error("All endpoints failed");
                };

                // 1. Fetch Members
                console.log("Step 1: Fetching members...");
                let members: GroupMemberDetailRes[] = [];
                try {
                    members = await getWithFallback<GroupMemberDetailRes[]>([
                        `/groupMember/group/${gid}`,
                        `/api/groupMember/group/${gid}`,
                        `/api/group-members/group/${gid}`,
                        `/group-members/group/${gid}`,
                    ]);
                    members = members || [];
                    console.log("✅ Members loaded:", members);

                    if (!members || members.length === 0) {
                        setError("Nhóm không có thành viên");
                        setLoading(false);
                        return;
                    }
                } catch (err: any) {
                    console.error("❌ Error fetching members:", {
                        status: err.response?.status,
                        message: err.message,
                        endpoint: `members endpoints tried for group ${gid}`
                    });
                    setError(`Không thể lấy danh sách thành viên (${err.response?.status || "Network Error"})`);
                    setLoading(false);
                    return;
                }

                // 2. Fetch CommonFund
                console.log("Step 2: Fetching fund...");
                let commonFund: any = null;
                try {
                    const res = await axiosClient.get(`/api/fund-payment/common-fund/group/${gid}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    commonFund = res.data;
                    console.log("✅ Fund loaded:", commonFund);
                } catch (err: any) {
                    console.warn("⚠️ Fund not found, using defaults:", err.message);
                    commonFund = {
                        fundId: 0,
                        balance: 0,
                        group: { groupId: gid, groupName: "Nhóm" }
                    };
                }

                // 3. Fetch FundDetails
                console.log("Step 3: Fetching fund details...");
                let fundDetails: any[] = [];
                if (commonFund?.fundId) {
                    try {
                        const res = await axiosClient.get(`/api/fund-payment/fund-details/${commonFund.fundId}`, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                        });
                        fundDetails = res.data || [];
                        console.log("✅ Fund details loaded:", fundDetails);
                    } catch (err: any) {
                        console.warn("⚠️ Fund details not found:", err.message);
                    }
                }

                // 4. Fetch Vehicles
                console.log("Step 4: Fetching vehicles...");
                let vehicles: any[] = [];
                try {
                    const res = await axiosClient.get(`/vehicle/getVehicleByGroupID/${gid}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    vehicles = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
                    console.log("✅ Vehicles loaded:", vehicles);
                } catch (err: any) {
                    console.warn("⚠️ Vehicles not found:", err.message);
                }

                // Map dữ liệu vào Group object
                console.log("Step 5: Mapping data...");
                const mappedGroup: Group = {
                    id: gid.toString(),
                    fundId: commonFund?.fundId || 0,
                    name: commonFund?.group?.groupName || "Nhóm",
                    ownerId: members.find(m => m.roleInGroup?.toLowerCase() === "admin")?.userId?.toString() || "",
                    fund: Number(commonFund?.balance || 0),
                    minTransfer: 10000,
                    users: members.map(m => ({
                        id: m.userId.toString(),
                        hovaTen: m.hovaten || "N/A",
                        email: "",
                        avatar: "",
                        role: m.roleInGroup?.toLowerCase() === "admin" ? "admin" : "member",
                        ownershipPercentage: m.ownershipPercentage || 0
                    })),
                    vehicles: vehicles.map(v => ({
                        id: v.vehicleId?.toString() || v.id?.toString() || "",
                        name: `${v.plateNo || ""} ${v.brand || ""} ${v.model || ""}`.trim() || "Không có tên",
                        info: v.model || "",
                        status: "available",
                        imageUrl: v.imageUrl
                    })),
                    transactions: fundDetails.map(fd => ({
                        id: fd.fundDetailId?.toString() || fd.id?.toString() || "",
                        name: fd.transactionType || "Giao dịch",
                        type: fd.transactionType?.toLowerCase().includes("deposit")
                            ? "deposit"
                            : fd.transactionType?.toLowerCase().includes("withdraw")
                                ? "withdraw"
                                : "transfer",
                        amount: Number(fd.amount || 0),
                        date: fd.createdAt || new Date().toISOString(),
                        userId: fd.groupMember?.userId?.toString() || ""
                    }))
                };

                console.log("✅ Final group data:", mappedGroup);
                setGroup(mappedGroup);
            } catch (err: any) {
                console.error("❌ Unexpected error:", err);
                setError("Không thể tải thông tin nhóm: " + (err.message || "Unknown error"));
            } finally {
                setLoading(false);
            }
        }

        fetchGroupDetail();
    }, [groupId]);

    // Handle deposit
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
            const userId = Number(localStorage.getItem("userId"));
            const token = localStorage.getItem("accessToken");

            const response = await fetch(`${API_BASE_URL}/api/fund-payment/create-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    fundId: group!.fundId,
                    groupId: Number(groupId),
                    userId: userId || 1,
                    amount: amt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.paymentUrl) {
                toast({
                    title: "Đang chuyển đến VNPay",
                    description: `Số tiền: ${amt.toLocaleString("vi-VN")} VNĐ`
                });
                window.location.href = data.paymentUrl;
            } else {
                throw new Error(data.message || "Không nhận được link thanh toán");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                title: "Lỗi tạo thanh toán",
                description: error.message || "Không thể kết nối đến cổng thanh toán",
                variant: "destructive"
            });
        } finally {
            setProcessing(false);
        }
    };

    // Render
    if (loading) {
        return <div className="container mx-auto p-6 text-center">Đang tải...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600 font-medium">❌ {error}</p>
                        <Button onClick={() => window.location.reload()} className="mt-4">
                            Tải lại trang
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        Không tìm thấy nhóm
                    </CardContent>
                </Card>
            </div>
        );
    }

    const userId = localStorage.getItem("userId");
    const currentUser = group.users.find(u => u.id === userId);
    const myRole = currentUser?.role || "member";
    const min = group.minTransfer;

    return (
        <div className="container mx-auto p-6">
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        ← Quay lại
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{group.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Vai trò: {myRole === "admin" ? "👑 Quản trị viên" : "👤 Thành viên"}
                        </p>
                    </div>
                </div>
            </header>

            <section className="space-y-6">
                {/* Card Quỹ & Nạp tiền */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-3 items-end">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Quỹ chung</label>
                                <p className="text-3xl font-bold mt-2">{group.fund.toLocaleString("vi-VN")} VNĐ</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Tối thiểu nạp: {min.toLocaleString("vi-VN")} VNĐ
                                </p>
                            </div>

                            <div>
                                <label htmlFor="amount" className="text-sm font-medium mb-2 block">
                                    Số tiền nạp (VNĐ)
                                </label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min={min}
                                    step={10000}
                                    placeholder={`Tối thiểu ${min.toLocaleString("vi-VN")}`}
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    disabled={processing}
                                />
                            </div>

                            <Button
                                onClick={handleDeposit}
                                size="lg"
                                disabled={processing || !amount}
                                className="w-full"
                            >
                                {processing ? "⏳ Đang xử lý..." : "💳 Nạp tiền VNPay"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danh sách thành viên */}
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Thành viên nhóm ({group.users.length})</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            {group.users.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50 hover:bg-muted transition"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                                        {user.hovaTen.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{user.hovaTen}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.role === "admin" ? "👑 Admin" : "👤 Member"} • {user.ownershipPercentage}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Danh sách xe */}
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Xe trong nhóm ({group.vehicles.length})</h2>
                        {group.vehicles.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {group.vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="p-4 border rounded-lg">
                                        <p className="font-medium text-lg">{vehicle.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{vehicle.info}</p>
                                        <Badge className="mt-3">🚗 Sẵn sàng</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">Chưa có xe nào</p>
                        )}
                    </CardContent>
                </Card>

                {/* Lịch sử sử dụng xe */}
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Lịch sử sử dụng xe</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Ngày</th>
                                    <th className="px-4 py-3 text-left font-medium">Xe</th>
                                    <th className="px-4 py-3 text-left font-medium">Người dùng</th>
                                    <th className="px-4 py-3 text-left font-medium">Giờ</th>
                                    <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 text-center font-medium">Chi tiết</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {vehicleUsages.map(usage => (
                                    <tr key={usage.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3">{usage.date}</td>
                                        <td className="px-4 py-3">{usage.vehicle}</td>
                                        <td className="px-4 py-3">{usage.user}</td>
                                        <td className="px-4 py-3">
                                            {usage.start} - {usage.end || "..."}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={usage.status === "Hoàn thành" ? "default" : "secondary"}
                                            >
                                                {usage.status === "Hoàn thành" ? "✅" : "⏳"} {usage.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                    try {
                                                        const detail = await fetchUsageHistoryDetail(usage.id);
                                                        setSelectedHistory({
                                                            ...usage,
                                                            note: detail.checkOutNotes || detail.checkInNotes || "",
                                                            checkIn: detail.checkInTime ? new Date(detail.checkInTime).toLocaleTimeString() : usage.checkIn,
                                                            checkOut: detail.checkOutTime ? new Date(detail.checkOutTime).toLocaleTimeString() : usage.checkOut,
                                                            distance: null,
                                                        });
                                                        setDetailOpen(true);
                                                    } catch (e: any) {
                                                        toast({ title: "Lỗi", description: "Không tải được chi tiết lịch sử", variant: "destructive" });
                                                    }
                                                }}
                                            >
                                                Xem
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Lịch sử giao dịch */}
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h2>
                        {group.transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Tên</th>
                                        <th className="px-4 py-3 text-left font-medium">Loại</th>
                                        <th className="px-4 py-3 text-right font-medium">Số tiền</th>
                                        <th className="px-4 py-3 text-left font-medium">Ngày</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                    {group.transactions.map(transaction => (
                                        <tr key={transaction.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3">{transaction.name}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        transaction.type === "deposit"
                                                            ? "default"
                                                            : transaction.type === "withdraw"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                >
                                                    {transaction.type === "deposit"
                                                        ? "➕ Nạp"
                                                        : transaction.type === "withdraw"
                                                            ? "➖ Rút"
                                                            : "↔️ Chuyển"}
                                                </Badge>
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-medium ${
                                                    transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                                                }`}
                                            >
                                                {transaction.type === "deposit" ? "+" : "-"}
                                                {transaction.amount.toLocaleString("vi-VN")} VNĐ
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(transaction.date).toLocaleDateString("vi-VN")}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">Chưa có giao dịch nào</p>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Dialog chi tiết lịch sử xe */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chi tiết sử dụng xe</DialogTitle>
                    </DialogHeader>
                    {selectedHistory && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Ngày</p>
                                    <p className="font-medium">{selectedHistory.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Xe</p>
                                    <p className="font-medium">{selectedHistory.vehicle}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Người dùng</p>
                                    <p className="font-medium">{selectedHistory.user}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                                    <Badge variant={selectedHistory.status === "Hoàn thành" ? "default" : "secondary"}>
                                        {selectedHistory.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Check-in</p>
                                    <p className="font-medium">{selectedHistory.checkIn}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Check-out</p>
                                    <p className="font-medium">{selectedHistory.checkOut || "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Quãng đường</p>
                                    <p className="font-medium">
                                        {selectedHistory.distance ? `${selectedHistory.distance} km` : "—"}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Ghi chú</p>
                                    <p className="font-medium">{selectedHistory.note || "—"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
