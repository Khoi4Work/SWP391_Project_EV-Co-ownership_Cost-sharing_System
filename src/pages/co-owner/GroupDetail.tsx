import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosClient from "@/api/axiosClient";
import { fetchUsageHistoryDetail, fetchUsageHistoryList } from "@/api/usageHistory";
import { 
    groups,
    getGroupById,
    getMonthlyFeesByGroupId,
    payMonthlyFee as payFeeMock
} from "@/mock/mockData";
import QRCode from "react-qr-code";

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
    status: "Hoàn thành" | "Đang sử dụng" | "Chờ nhận xe";
    note: string;
    checkIn: string;
    checkOut: string | null;
    distance: number | null;
}

interface FundFeeResponse {
    fundDetailId: number;
    groupMemberId: number;
    userId: number;
    userName: string;
    amount: number;
    monthYear: string;
    status: "PENDING" | "COMPLETED";
    createdAt: string;
    isOverdue: boolean;
    dueDate: string;
}

interface GroupFeeResponse {
    groupId: number;
    groupName: string;
    monthYear: string;
    totalPending: number;
    pendingCount: number;
    paidCount: number;
    fees: FundFeeResponse[];
}

const API_BASE_URL = "http://localhost:8080";
const GET_GROUP = import.meta.env.VITE_GET_GROUP_BY_ID_PATH as string | undefined;

// 🔧 CONFIG: Chuyển đổi giữa mock data và backend thật
const USE_MOCK_DATA = false;

export default function GroupDetail() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    // States
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<VehicleUsage | null>(null);
    const [vehicleUsages, setVehicleUsages] = useState<VehicleUsage[]>([]);
    const [groupFee, setGroupFee] = useState<GroupFeeResponse | null>(null);
    const [feeDetailOpen, setFeeDetailOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<FundFeeResponse | null>(null);
    const [processingPayment, setProcessingPayment] = useState<number | null>(null);
    const [paymentQRUrl, setPaymentQRUrl] = useState<string | null>(null);
    const [loadingQR, setLoadingQR] = useState(false);

    // Load lịch sử sử dụng xe từ BE
    useEffect(() => {
        const userIdStr = localStorage.getItem("userId");
        if (!groupId || !userIdStr) return;

        const userIdNum = Number(userIdStr);
        const gId = Number(groupId);

        // Gọi API cần userId và groupId
        fetchUsageHistoryList(userIdNum, gId)
            .then(list => {
                const mapped: VehicleUsage[] = list.map((it: any) => {
                    const [start, end] = (it.timeRange || " - ").split(" - ");
                    const hasIn = Boolean(it.hasCheckIn);
                    const hasOut = Boolean(it.hasCheckOut);
                    const statusText = !hasIn ? "Chờ nhận xe" : !hasOut ? "Đang sử dụng" : "Hoàn thành";

                    return {
                        id: it.scheduleId,
                        date: it.date,
                        vehicle: it.vehicleName,
                        user: it.userName,
                        start: start || "",
                        end: end || "",
                        status: statusText as any,
                        note: "",
                        checkIn: start || "",
                        checkOut: hasOut ? (end || null) : null,
                        distance: null,
                    };
                });
                setVehicleUsages(mapped);
            })
            .catch(err => {
                console.warn("⚠️ Cannot load usage history:", err?.message || err);
            });
    }, [groupId]);

    // Load thanh toán quỹ tháng từ BE hoặc mock data
    useEffect(() => {
        if (!groupId) return;

        async function fetchMonthlyFees() {
            if (USE_MOCK_DATA) {
                console.log("📦 Using MOCK DATA for monthly fees");
                const gid = Number(groupId);
                const mockFee = getMonthlyFeesByGroupId(gid);
                if (mockFee) {
                    setGroupFee(mockFee);
                }
                return;
            }

            console.log("🔗 Connecting to BACKEND API for monthly fees");
            try {
                const token = localStorage.getItem("accessToken");
                const res = await axiosClient.get<GroupFeeResponse>(
                    `/api/fund-fee/group/${groupId}/current-month`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }
                );
                setGroupFee(res.data);
                console.log("✅ Loaded monthly fees from backend");
            } catch (err: any) {
                const errorStatus = err?.response?.status;
                const errorMessage = err?.message || "Unknown error";
                console.warn("⚠️ Backend API failed, falling back to mock data:", {
                    status: errorStatus,
                    message: errorMessage
                });

                // Fallback to mock data if API fails
                const gid = Number(groupId);
                const mockFee = getMonthlyFeesByGroupId(gid);
                if (mockFee) {
                    setGroupFee(mockFee);
                    if (!errorStatus || errorStatus >= 500) {
                        toast({
                            title: "⚠️ Backend không khả dụng",
                            description: "Đang sử dụng mock data để hiển thị. Kiểm tra xem backend có đang chạy không.",
                            variant: "destructive"
                        });
                    }
                } else {
                    console.error("❌ No mock data available for fallback");
                }
            }
        }

        fetchMonthlyFees();
    }, [groupId]);

    // EFFECT 1: Load group ID nếu chưa có
    useEffect(() => {
        if (groupId) return;

        async function loadGroupId() {
            try {
                const userId = Number(localStorage.getItem("userId"));
                if (!userId) {
                    setError("Không tìm thấy userId");
                    return;
                }

                const token = localStorage.getItem("accessToken");
                const endpoint = (GET_GROUP && GET_GROUP.trim().length > 0) ? GET_GROUP : "/groupMember/getGroupIdsByUserId";
                
                const res = await axiosClient.get(endpoint, {
                    params: { userId },
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                const groupIds: number[] = res.data;
                if (!groupIds || groupIds.length === 0) {
                    navigate("/co-owner/dashboard");
                    return;
                }

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

                if (USE_MOCK_DATA) {
                    console.log("📦 Using MOCK DATA for group detail");
                    let mockGroup = getGroupById(groupId);
                    if (!mockGroup && !isNaN(gid) && gid > 0) {
                        const index = gid - 1;
                        if (index >= 0 && index < groups.length) {
                            mockGroup = groups[index];
                        }
                    }
                    if (!mockGroup) {
                        mockGroup = groups[0];
                    }

                    if (!mockGroup) {
                        setError("Không tìm thấy nhóm");
                        setLoading(false);
                        return;
                    }

                    const mappedGroup: Group = {
                        id: mockGroup.id,
                        name: mockGroup.name,
                        ownerId: mockGroup.ownerId,
                        fund: mockGroup.fund,
                        minTransfer: mockGroup.minTransfer,
                        users: mockGroup.users.map(u => ({
                            id: u.id,
                            hovaTen: u.name,
                            email: u.email || "",
                            avatar: u.avatar || "",
                            role: u.role,
                            ownershipPercentage: u.role === "admin" ? 50 : 25
                        })),
                        vehicles: mockGroup.vehicles.map(v => ({
                            id: v.id,
                            name: v.name,
                            info: v.info || "",
                            status: v.status,
                            imageUrl: v.imageUrl
                        })),
                        transactions: mockGroup.transactions.map(t => ({
                            id: t.id,
                            name: t.name,
                            type: t.type === "in" ? "deposit" : "withdraw" as any,
                            amount: t.amount,
                            date: t.date,
                            userId: t.userId
                        }))
                    };

                    console.log("✅ Mock group data loaded:", mappedGroup);
                    setGroup(mappedGroup);
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem("accessToken");

                // Improved fallback function with better logging
                const getWithFallback = async <T,>(paths: string[]): Promise<T> => {
                    let lastError: any = null;
                    
                    for (const path of paths) {
                        try {
                            console.log(`🔍 Trying endpoint: ${path}`);
                            const res = await axiosClient.get<T>(path, {
                                headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            console.log(`✅ Success with endpoint: ${path}`);
                            return res.data as T;
                        } catch (err: any) {
                            lastError = err;
                            const status = err?.response?.status;
                            console.warn(`❌ Failed endpoint ${path}:`, status || err.message);
                            
                            // Nếu không phải 404, có thể là lỗi khác (401, 403, 500) - nên dừng thử
                            if (status && status !== 404) {
                                console.error(`🛑 Stopping fallback attempts due to ${status} error`);
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
                    const membersResponse = await getWithFallback<any>([
                        `/api/groupMember/group/${gid}`,
                        `/groupMember/group/${gid}`,
                        `/api/group-members/group/${gid}`,
                        `/group-members/group/${gid}`,
                    ]);

                    // Cải thiện logic xử lý response
                    if (Array.isArray(membersResponse)) {
                        members = membersResponse;
                    } else if (membersResponse?.data && Array.isArray(membersResponse.data)) {
                        members = membersResponse.data;
                    } else if (membersResponse && typeof membersResponse === 'object') {
                        // Tìm array đầu tiên trong object
                        const possibleArrayKeys = ['members', 'data', 'result', 'items'];
                        for (const key of possibleArrayKeys) {
                            if (Array.isArray(membersResponse[key])) {
                                members = membersResponse[key];
                                break;
                            }
                        }
                        
                        // Nếu vẫn không tìm thấy, tìm bất kỳ array nào
                        if (members.length === 0) {
                            const firstArrayKey = Object.keys(membersResponse).find(key => 
                                Array.isArray(membersResponse[key])
                            );
                            if (firstArrayKey) {
                                members = membersResponse[firstArrayKey];
                            }
                        }
                    }

                    console.log("✅ Members loaded:", members.length, "members");

                    if (!Array.isArray(members) || members.length === 0) {
                        throw new Error("No members found in response");
                    }
                } catch (err: any) {
                    console.error("❌ Error fetching members:", err);
                    setError(`Không thể lấy danh sách thành viên: ${err.response?.status || err.message}`);
                    setLoading(false);
                    return;
                }

                // 2. Fetch Group Info (optional - để lấy tên nhóm)
                console.log("Step 2: Fetching group info...");
                let groupName = "Nhóm";
                try {
                    const groupInfo = await getWithFallback<any>([
                        `/api/group/${gid}`,           // Match với @GetMapping("/group/{groupId}")
                        `/group/${gid}`,
                        `/api/groups/${gid}`,
                        `/groups/${gid}`
                    ]);
                    
                    // Xử lý nhiều format response khác nhau
                    groupName = groupInfo?.data?.name || 
                                groupInfo?.data?.groupName || 
                                groupInfo?.name || 
                                groupInfo?.groupName || 
                                "Nhóm";
                    
                    console.log("✅ Group info loaded:", groupInfo);
                } catch (err: any) {
                    console.warn("⚠️ Group info not found, using default name:", err.message);
                    // Không throw error vì đây là optional
                }

                // 3. Fetch Vehicles
                console.log("Step 3: Fetching vehicles...");
                let vehicles: any[] = [];
                try {
                    const res = await axiosClient.get(`/vehicle/getVehicleByGroupID/${gid}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    vehicles = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
                    console.log("✅ Vehicles loaded:", vehicles.length, "vehicles");
                } catch (err: any) {
                    console.warn("⚠️ Vehicles not found:", err.message);
                }

                // Map dữ liệu vào Group object
                console.log("Step 4: Mapping data...");
                const mappedGroup: Group = {
                    id: gid.toString(),
                    name: groupName,
                    ownerId: (Array.isArray(members) ? members.find(m => m.roleInGroup?.toLowerCase() === "admin")?.userId?.toString() : "") || "",
                    fund: 0,
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
                    transactions: []
                };

                console.log("=== GROUP DETAIL LOADED ===");
                console.log("Group ID:", gid);
                console.log("Group Name:", groupName);
                console.log("Members:", members.length);
                console.log("Vehicles:", vehicles.length);
                console.log("Owner ID:", members.find(m => m.roleInGroup?.toLowerCase() === "admin")?.userId);
                console.log("===========================");

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

    // Handle pay quỹ tháng
    const handlePayFee = async (fundDetailId: number) => {
        // Kiểm tra xem fee có quá hạn không
        const fee = groupFee?.fees?.find(f => f.fundDetailId === fundDetailId);
        if (fee?.isOverdue) {
            toast({
                title: "⚠️ Không thể thanh toán",
                description: "Quỹ tháng này đã quá hạn thanh toán. Vui lòng liên hệ quản trị viên.",
                variant: "destructive"
            });
            return;
        }

        setProcessingPayment(fundDetailId);
        try {
            if (USE_MOCK_DATA) {
                console.log("📦 Simulating payment with MOCK DATA for fundDetailId:", fundDetailId);
                const result = payFeeMock(fundDetailId);
                if (result.success && result.updatedFee) {
                    toast({
                        title: "✅ Thanh toán thành công",
                        description: "Thanh toán quỹ tháng đã được thanh toán (mock data)"
                    });
                    setGroupFee(result.updatedFee);
                } else {
                    throw new Error("Không tìm thấy quỹ tháng cần thanh toán");
                }
                return;
            }

            console.log("🔗 Creating payment via BACKEND API for fundDetailId:", fundDetailId);
            const token = localStorage.getItem("accessToken");
            const response = await axiosClient.post<{ status: string; message: string; paymentUrl: string }>(
                `/api/fund-fee/${fundDetailId}/create-payment`,
                {},
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            if (response.data.paymentUrl) {
                toast({
                    title: "Đang chuyển đến VNPay",
                    description: "Vui lòng thanh toán quỹ tháng"
                });
                window.location.href = response.data.paymentUrl;
            } else {
                throw new Error(response.data.message || "Không nhận được link thanh toán");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                title: "Lỗi tạo thanh toán",
                description: error.response?.data?.message || error.message || "Không thể kết nối đến cổng thanh toán",
                variant: "destructive"
            });
        } finally {
            setProcessingPayment(null);
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

    const formatMonthYear = (monthYear: string) => {
        const [year, month] = monthYear.split("-");
        return `${month}/${year}`;
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

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
                {/* Card Thanh toán quỹ tháng */}
                {groupFee && groupFee.fees && groupFee.fees.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Thanh toán quỹ tháng ({groupFee.monthYear && formatMonthYear(groupFee.monthYear)})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {groupFee.fees.map((fee) => {
                                    const isPending = fee.status === "PENDING";
                                    const isCurrentUser = fee.userId.toString() === userId;

                                    return (
                                        <Card key={fee.fundDetailId} className="border-2">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start gap-2 mb-4">
                                                    <span className="text-2xl">💰</span>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">Thanh toán quỹ tháng</h3>
                                                        <p className="text-sm text-muted-foreground">Nhóm: {groupFee.groupName}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Tháng:</span>
                                                        <span className="text-sm font-medium">
                                                            {fee.monthYear && formatMonthYear(fee.monthYear)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Số tiền:</span>
                                                        <span className="text-sm font-medium">
                                                            {fee.amount.toLocaleString("vi-VN")} VND
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                                        <Badge
                                                            className={
                                                                isPending
                                                                    ? fee.isOverdue
                                                                        ? "bg-red-100 text-red-700 border-red-200"
                                                                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                    : "bg-green-100 text-green-700 border-green-200"
                                                            }
                                                        >
                                                            {isPending ? (
                                                                fee.isOverdue ? "⚠️ Quá hạn" : "⌛ Chưa thanh toán"
                                                            ) : (
                                                                "✅ Đã thanh toán"
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    {fee.dueDate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Hạn:</span>
                                                            <span className="text-sm font-medium">{formatDueDate(fee.dueDate)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Thành viên:</span>
                                                        <span className="text-sm font-medium">{fee.userName}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    {isPending && (
                                                        <>
                                                            {fee.isOverdue ? (
                                                                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md text-center">
                                                                    <p className="text-sm text-red-700 font-medium">
                                                                        ⚠️ Đã quá hạn thanh toán
                                                                    </p>
                                                                    <p className="text-xs text-red-600 mt-1">
                                                                        Vui lòng liên hệ quản trị viên
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePayFee(fee.fundDetailId)}
                                                                    disabled={processingPayment === fee.fundDetailId || !isCurrentUser}
                                                                    className="w-full"
                                                                    variant={isCurrentUser ? "default" : "secondary"}
                                                                >
                                                                    {processingPayment === fee.fundDetailId
                                                                        ? "⏳ Đang xử lý..."
                                                                        : "Thanh toán VNPay"}
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                            {groupFee && (
                                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tổng chưa thanh toán</p>
                                            <p className="text-lg font-bold text-yellow-600">
                                                {groupFee.totalPending.toLocaleString("vi-VN")} VND
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
                                            <p className="text-lg font-bold">{groupFee.pendingCount} thành viên</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                                            <p className="text-lg font-bold text-green-600">{groupFee.paidCount} thành viên</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

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
                                            {user.role === "admin" ? "👑 Admin" : "👤 Member"} •
                                            Quyền sở hữu: {user.ownershipPercentage?.toFixed(1) || 0}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}