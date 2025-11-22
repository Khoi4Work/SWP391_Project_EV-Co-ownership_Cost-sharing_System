import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Pencil,
    Shield,
    Users,
    FileText,
    Plus,
    Settings,
    Search,
    UserPlus,
    Lock,
    LogOut,
    ArrowLeft,
    Car,
    Calendar,
    DollarSign,
    TrendingUp,
    Download,
    Eye,
    CheckCircle,
    Trash2,
    Receipt
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axiosClient from "@/api/axiosClient";
import { toast } from "../../hooks/use-toast";
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const GET_STAFFS = import.meta.env.VITE_GET_GET_ALL_STAFF_PATH;
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditStaffModal, setShowEditStaffModal] = useState(false);
    const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);
    const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);
    const [showFireConfirmModal, setShowFireConfirmModal] = useState(false);
    const [showActionSuccessModal, setShowActionSuccessModal] = useState(false);
    const [actionType, setActionType] = useState(""); // "lock", "unlock", "fire"
    const [activeTab, setActiveTab] = useState("staff");
    const [confirmationText, setConfirmationText] = useState("");
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStaff, setFilteredStaff] = useState([]);
    const UPDATE_STAFF = import.meta.env.VITE_PUT_UPDATE_STAFF_PATH;
    const [editStaffData, setEditStaffData] = useState({
        hovaTen: "",
        phone: "",
        cccd: "",
        gplx: "",
    });
    const [newStaffData, setNewStaffData] = useState({
        hovaTen: "",
        email: "",
        password: "",
        cccd: "",
        phone: "",
        gplx: ""
    });
    const [createdStaff, setCreatedStaff] = useState<any>(null);
    const [showContractDetailModal, setShowContractDetailModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const { toast } = useToast();
    const CREATE_STAFF = import.meta.env.VITE_POST_CREATE_STAFF_PATH;

    // Monthly fee history states
    const [fundFees, setFundFees] = useState<any[]>([]);
    const [loadingFundFees, setLoadingFundFees] = useState(false);
    const [feeSearchTerm, setFeeSearchTerm] = useState("");
    const [feeStatusFilter, setFeeStatusFilter] = useState<string>("all"); // "all", "PENDING", "COMPLETED"
    const displayedStaff = searchTerm.trim()
        ? filteredStaff
        : staffList;
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "success";
            case "inactive":
                return "destructive";
            default:
                return "secondary";
        }
    };
    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "Hoạt động";
            case "inactive":
                return "Ngưng hoạt động";
            default:
                return "Không xác định";
        }
    };
    const CURRENT_USER = import.meta.env.VITE_AUTH_CURRENT

    useEffect(() => {
        axiosClient.get(CURRENT_USER).then(
            (res) => {
                if (res.data.role.roleName !== "admin") {
                    toast({
                        title: "Không có quyền truy cập",
                        description: "Bạn không có quyền truy cập trang này.",
                        variant: "destructive",
                    });
                    navigate("/login");
                }
            }
        );
    }, []);
    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                const res = await axiosClient.get(GET_STAFFS);
                setStaffList(res.data); // BE trả về List<StaffResponse>
            } catch (err: any) {
                console.error(err);
                toast({
                    title: "lỗi",
                    description: "lấy nhân viên thất bại",
                    variant: "destructive"
                })
            }
        };

        fetchStaffList();
    }, []);
    const DELETE_STAFF = import.meta.env.VITE_DELETE_STAFF_PATH;
    const deleteStaff = async (staffId: number) => {
        try {
            const res = await axiosClient.delete(`${DELETE_STAFF}${staffId}`);
            if (res.status === 200) {
                toast({
                    title: "Thành công",
                    description: "Xóa nhân viên thành công",
                    variant: "success",
                });
                // Xóa khỏi UI
                setStaffList(prev => prev.filter(s => s.id !== staffId));
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Xóa nhân viên thất bại",
                variant: "destructive",
            });
        }
    };

    // Fetch monthly fee history
    useEffect(() => {
        const fetchFundFees = async () => {
            setLoadingFundFees(true);
            try {
                const res = await axiosClient.get("/api/fund-fee/get-all");
                setFundFees(Array.isArray(res.data) ? res.data : []);
            } catch (err: any) {
                console.error("Lỗi khi lấy lịch sử phí hàng tháng:", err);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải lịch sử giao dịch phí hàng tháng",
                    variant: "destructive"
                });
                setFundFees([]);
            } finally {
                setLoadingFundFees(false);
            }
        };

        fetchFundFees();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStaff(staffList);
        } else {
            const lower = searchTerm.toLowerCase();
            const filtered = staffList.filter((staff: any) =>
                staff.hovaTen.toLowerCase().includes(lower) ||
                staff.email.toLowerCase().includes(lower) ||
                staff.cccd.toLowerCase().includes(lower)
            );
            setFilteredStaff(filtered);
        }
    }, [searchTerm, staffList]);
    const handleCreateStaff = async () => {
        // kiểm tra dữ liệu
        if (!newStaffData.hovaTen || !newStaffData.email || !newStaffData.password || !newStaffData.cccd || !newStaffData.phone) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập đầy đủ thông tin bắt buộc",
                variant: "destructive",
            });
            return;
        }

        try {
            // gọi API BE
            const res = await axiosClient.post(CREATE_STAFF, {
                hovaTen: newStaffData.hovaTen,
                email: newStaffData.email,
                password: newStaffData.password,
                cccd: newStaffData.cccd,
                phone: newStaffData.phone,
                gplx: newStaffData.gplx,
            });

            // cập nhật lại danh sách hiển thị trong UI
            setStaffList((prev) => [...prev, res.data]);

            // hiển thị thông báo thành công
            toast({
                title: "Thành công",
                description: "Tạo nhân viên mới thành công",
            });

            // đóng modal và mở modal thành công nếu có
            setShowAddStaffModal(false);
            setShowSuccessModal(true);

            // reset form
            setNewStaffData({
                hovaTen: "",
                email: "",
                password: "",
                cccd: "",
                phone: "",
                gplx: "",
            });
        } catch (err: any) {
            console.error("Lỗi khi tạo nhân viên:", err);
            toast({
                title: "Lỗi",
                description: "Không thể tạo nhân viên. Vui lòng thử lại",
                variant: "destructive",
            });
        }
    };

    const handleEditStaff = (staff: any) => {
        // chỉ mở modal và set dữ liệu form
        setSelectedStaff(staff);
        setEditStaffData({
            hovaTen: staff.hovaTen,
            cccd: staff.cccd,
            phone: staff.phone,
            gplx: staff.gplx
        });
        setShowEditStaffModal(true);
    };
    const handleUpdateStaff = async () => {
        if (!editStaffData.hovaTen || !editStaffData.phone || !editStaffData.cccd) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập đầy đủ thông tin bắt buộc",
                variant: "destructive"
            });
            return;
        }
        try {
            const res = await axiosClient.put(
                `${UPDATE_STAFF}${selectedStaff.id}`,
                editStaffData // body: { hovaTen, cccd, phone }
            );

            toast({
                title: "Thành công",
                description: "Cập nhật thông tin nhân viên thành công",
            });

            // cập nhật lại danh sách trong UI
            setStaffList(prev =>
                prev.map((s) => (s.id === selectedStaff.id ? res.data : s))
            );
            setShowEditStaffModal(false);
            setShowUpdateSuccessModal(true);
        } catch (err: any) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Cập nhật nhân viên thất bại",
                variant: "destructive",
            });
        }
    };
    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin": return "destructive";
            case "staff": return "secondary";
            default: return "outline";
        }
    };
    const handleLockUnlock = (staff: any) => {
        setSelectedStaff(staff);
        setActionType(staff.status === "active" ? "lock" : "unlock");
        setConfirmationText("");
        setShowLockConfirmModal(true);
    };
    const handleFire = (staff: any) => {
        setSelectedStaff(staff);
        setActionType("fire");
        setConfirmationText("");
        setShowFireConfirmModal(true);
    };
    const confirmAction = () => {
        const expectedText = actionType === "lock" ? "Xác nhận khóa nhân viên này" : actionType === "unlock" ? "Xác nhận mở khóa nhân viên này" : "Xác nhận sa thải nhân viên này";
        if (confirmationText !== expectedText) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập đúng nội dung xác nhận",
                variant: "destructive"
            });
            return;
        }

        // Simulate action
        setShowLockConfirmModal(false);
        setShowFireConfirmModal(false);
        setShowActionSuccessModal(true);
    };
    return <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border shadow-elegant">
            {/* Logo/Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-lg font-bold">AdminKit</h1>
                        <p className="text-xs text-muted-foreground">PRO</p>
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">AH</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Admin Hall</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Pages
                </div>

                <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'staff' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('staff')}>
                    <Users className="h-4 w-4" />
                    <span>Nhân viên</span>
                </button>

                <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'fee-history' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('fee-history')}>
                    <Receipt className="h-4 w-4" />
                    <span>Lịch sử phí hàng tháng</span>
                </button>

            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
            {/* EcoShare Header */}
            <header className="bg-gradient-primary text-white p-4 shadow-glow">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Car className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold">EcoShare</h1>
                            <p className="text-sm opacity-90">Bảng điều khiển quản trị</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors"
                            onClick={() => navigate('/login')}>
                            <LogOut className="h-4 w-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-6 space-y-6">
                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">


                    <TabsContent value="staff">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Users className="h-5 w-5" />
                                            <span>Quản lý nhân viên</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Tạo, chỉnh sửa và quản lý tài khoản nhân viên
                                        </CardDescription>
                                    </div>
                                    <Button className="bg-gradient-primary hover:shadow-glow"
                                        onClick={() => setShowAddStaffModal(true)}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Thêm nhân viên
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 🔍 Thanh tìm kiếm */}
                                <div className="flex items-center space-x-4">
                                    <div className="relative flex-1">
                                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm nhân viên..."
                                            className="pl-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {displayedStaff.length > 0 ? (
                                        displayedStaff.map((staff: any) => (
                                            <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        {/* 🔹 Họ và tên */}
                                                        <h3 className="font-semibold">{staff.hovaTen}</h3>

                                                        {/* 🔹 Role */}
                                                        <Badge variant={getRoleColor(staff.roleName) as any}>
                                                            {staff.roleName}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-1">

                                                        {/* Thông tin nhân viên */}
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <span>{staff.email}</span>
                                                            <span className="mx-1">•</span>
                                                            <span>CCCD: {staff.cccd}</span>
                                                            <span className="mx-1">•</span>
                                                            <span>📞 {staff.phone}</span>
                                                        </div>

                                                        {/* Các nút */}
                                                        <div className="flex gap-3">
                                                            {/* Nút Edit */}
                                                            <button
                                                                onClick={() => handleEditStaff(staff.id)}
                                                                className="
                                                               flex items-center gap-1 px-3 py-1.5 text-sm 
                                                               bg-blue-100 text-blue-700 
                                                               rounded-xl border border-blue-200 
                                                               hover:bg-blue-200 hover:shadow 
                                                               transition-all duration-200
                                                                "
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                                Edit
                                                            </button>

                                                            {/* Nút Delete */}
                                                            <button
                                                                onClick={() => deleteStaff(staff.id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-sm 
                                                                           bg-red-100 text-red-700 
                                                                           rounded-xl border border-red-200 
                                                                           hover:bg-red-200 hover:shadow 
                                                                           transition-all duration-200
                                                                           "
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-4">
                                            Không tìm thấy nhân viên nào.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Monthly Fee History */}
                    <TabsContent value="fee-history">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Receipt className="h-5 w-5" />
                                    <span>Lịch sử giao dịch phí hàng tháng</span>
                                </CardTitle>
                                <CardDescription>
                                    Theo dõi toàn bộ lịch sử thanh toán phí dịch vụ hàng tháng của các nhóm
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-primary">{fundFees.length}</p>
                                            <p className="text-sm text-muted-foreground">Tổng giao dịch</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-success">
                                                {fundFees.filter((f: any) => f.status === "COMPLETED").length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-warning">
                                                {fundFees.filter((f: any) => f.status === "PENDING").length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-destructive">
                                                {fundFees.filter((f: any) => f.isOverdue).length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Quá hạn</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm theo tên thành viên..."
                                            className="pl-9"
                                            value={feeSearchTerm}
                                            onChange={(e) => setFeeSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={feeStatusFilter === "all" ? "default" : "outline"}
                                            onClick={() => setFeeStatusFilter("all")}
                                        >
                                            Tất cả
                                        </Button>
                                        <Button
                                            variant={feeStatusFilter === "COMPLETED" ? "default" : "outline"}
                                            onClick={() => setFeeStatusFilter("COMPLETED")}
                                        >
                                            Đã thanh toán
                                        </Button>
                                        <Button
                                            variant={feeStatusFilter === "PENDING" ? "default" : "outline"}
                                            onClick={() => setFeeStatusFilter("PENDING")}
                                        >
                                            Chưa thanh toán
                                        </Button>
                                    </div>
                                </div>

                                {/* Table */}
                                {loadingFundFees ? (
                                    <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3 font-semibold">ID</th>
                                                    <th className="text-left p-3 font-semibold">Thành viên</th>
                                                    <th className="text-left p-3 font-semibold">Tháng/Năm</th>
                                                    <th className="text-left p-3 font-semibold">Số tiền</th>
                                                    <th className="text-left p-3 font-semibold">Trạng thái</th>
                                                    <th className="text-left p-3 font-semibold">Hạn thanh toán</th>
                                                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fundFees
                                                    .filter((fee: any) => {
                                                        const matchesSearch = feeSearchTerm === "" ||
                                                            (fee.userName && fee.userName.toLowerCase().includes(feeSearchTerm.toLowerCase()));
                                                        const matchesStatus = feeStatusFilter === "all" || fee.status === feeStatusFilter;
                                                        return matchesSearch && matchesStatus;
                                                    })
                                                    .map((fee: any) => {
                                                        const formatDate = (dateString: string) => {
                                                            if (!dateString) return "N/A";
                                                            const date = new Date(dateString);
                                                            return date.toLocaleDateString("vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric"
                                                            });
                                                        };

                                                        const formatMonthYear = (monthYear: string) => {
                                                            if (!monthYear) return "N/A";
                                                            const [year, month] = monthYear.split("-");
                                                            return `${month}/${year}`;
                                                        };

                                                        const isPending = fee.status === "PENDING";
                                                        const isOverdue = fee.isOverdue;

                                                        return (
                                                            <tr key={fee.fundDetailId} className="border-b hover:bg-muted/50">
                                                                <td className="p-3 text-sm">{fee.fundDetailId}</td>
                                                                <td className="p-3">
                                                                    <div>
                                                                        <p className="font-medium">{fee.userName || "N/A"}</p>
                                                                        <p className="text-xs text-muted-foreground">User ID: {fee.userId}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-sm">{formatMonthYear(fee.monthYear)}</td>
                                                                <td className="p-3">
                                                                    <span className="font-semibold text-success">
                                                                        {fee.amount ? fee.amount.toLocaleString("vi-VN") : "0"} VND
                                                                    </span>
                                                                </td>
                                                                <td className="p-3">
                                                                    <Badge
                                                                        className={
                                                                            isPending
                                                                                ? isOverdue
                                                                                    ? "bg-red-100 text-red-700 border-red-200"
                                                                                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                                : "bg-green-100 text-green-700 border-green-200"
                                                                        }
                                                                    >
                                                                        {isPending ? (
                                                                            isOverdue ? "⚠️ Quá hạn" : "⌛ Chưa thanh toán"
                                                                        ) : (
                                                                            "✅ Đã thanh toán"
                                                                        )}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-3 text-sm">
                                                                    {fee.dueDate ? formatDate(fee.dueDate) : "N/A"}
                                                                </td>
                                                                <td className="p-3 text-sm">
                                                                    {fee.createdAt ? formatDate(fee.createdAt) : "N/A"}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                        {fundFees.filter((fee: any) => {
                                            const matchesSearch = feeSearchTerm === "" ||
                                                (fee.userName && fee.userName.toLowerCase().includes(feeSearchTerm.toLowerCase()));
                                            const matchesStatus = feeStatusFilter === "all" || fee.status === feeStatusFilter;
                                            return matchesSearch && matchesStatus;
                                        }).length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    Không tìm thấy giao dịch nào
                                                </div>
                                            )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


                {/* Add Staff Modal */}
                {showAddStaffModal &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-background rounded-lg shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold flex items-center space-x-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Thêm nhân viên mới</span>
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Nhập thông tin cá nhân và tạo tài khoản cho nhân viên
                                </p>
                            </div>

                            <div className="space-y-6 p-6">
                                {/* Thông tin cá nhân */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Users className="h-5 w-5" />
                                            <span>Thông tin cá nhân</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                                                <Input placeholder="Nhập họ và tên đầy đủ" value={newStaffData.hovaTen}
                                                    onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        hovaTen: e.target.value
                                                    })} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email *</label>
                                                <Input type="email" placeholder="example@ecoshare.vn"
                                                    value={newStaffData.email} onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        email: e.target.value
                                                    })} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                                                <Input placeholder="0123456789" value={newStaffData.phone || ''}
                                                    onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        phone: e.target.value
                                                    })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Căn cước công dân *</label>
                                                <Input placeholder="Nhập căn cước" value={newStaffData.cccd}
                                                    onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        cccd: e.target.value
                                                    })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Giấy phép lái xe *</label>
                                                <Input placeholder="nhập giấy phép" value={newStaffData.gplx}
                                                    onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        gplx: e.target.value
                                                    })} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Thông tin tài khoản */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Shield className="h-5 w-5" />
                                            <span>Thông tin tài khoản</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* <div>
                                                <label className="block text-sm font-medium mb-2">Tên đăng nhập
                                                    *</label>
                                                <Input placeholder="Nhập tên đăng nhập" value={newStaffData.username}
                                                    onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        username: e.target.value
                                                    })} />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Tên đăng nhập sẽ được sử dụng để đăng nhập vào hệ thống
                                                </p>
                                            </div> */}

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Mật khẩu tạm thời
                                                    *</label>
                                                <Input type="password" placeholder="Nhập mật khẩu tạm thời"
                                                    value={newStaffData.password} onChange={e => setNewStaffData({
                                                        ...newStaffData,
                                                        password: e.target.value
                                                    })} />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Nhân viên sẽ được yêu cầu thay đổi mật khẩu khi đăng nhập lần đầu
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end space-x-3 p-6 border-t">
                                <Button variant="outline" onClick={() => setShowAddStaffModal(false)}>
                                    Hủy
                                </Button>
                                <Button className="bg-gradient-primary hover:shadow-glow" onClick={handleCreateStaff}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Tạo nhân viên
                                </Button>
                            </div>
                        </div>
                    </div>}

                {/* Success Modal */}
                {showSuccessModal && createdStaff &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-elegant max-w-md w-full">
                            <div className="p-6 text-center">
                                <div
                                    className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Thêm nhân viên thành công!</h3>
                                <p className="text-muted-foreground mb-6">
                                    Tài khoản nhân viên đã được tạo và gửi thông tin đến email.
                                </p>

                                <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2 mb-6">
                                    <h4 className="font-medium">Thông tin nhân viên:</h4>
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">Tên:</span> {createdStaff.name}</p>
                                        <p><span className="font-medium">Email:</span> {createdStaff.email}</p>
                                        <p><span className="font-medium">Tài khoản:</span> {createdStaff.username}</p>
                                        <p><span className="font-medium">Mã nhân viên:</span> {createdStaff.id}</p>
                                        <p><span className="font-medium">Tỉnh/TP:</span> {createdStaff.province}</p>
                                    </div>
                                </div>

                                <Button className="w-full bg-gradient-primary hover:shadow-glow"
                                    onClick={() => setShowSuccessModal(false)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    </div>}

                {/* Edit Staff Modal */}
                {showEditStaffModal && selectedStaff &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-background rounded-lg shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Chỉnh sửa thông tin nhân viên</span>
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Chỉnh sửa thông tin cá nhân của nhân viên
                                </p>
                            </div>

                            <div className="space-y-6 p-6">
                                {/* Thông tin tài khoản (chỉ đọc) */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Shield className="h-5 w-5" />
                                            <span>Thông tin tài khoản</span>
                                        </CardTitle>
                                        <CardDescription>Thông tin này không thể chỉnh sửa</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Mã nhân viên</p>
                                                <p className="font-medium">{selectedStaff.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Vai trò</p>
                                                <p className="font-medium">{selectedStaff.role}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Trạng thái</p>
                                                <Badge variant={getStatusColor(selectedStaff.status) as any}>
                                                    {getStatusText(selectedStaff.status)}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số nhóm quản lý</p>
                                                <p className="font-medium">{selectedStaff.groups} nhóm</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Thông tin cá nhân (có thể chỉnh sửa) */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Users className="h-5 w-5" />
                                            <span>Thông tin cá nhân</span>
                                        </CardTitle>
                                        <CardDescription>Chỉnh sửa thông tin cá nhân của nhân viên</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                                                <Input placeholder="Nhập họ và tên đầy đủ" value={editStaffData.hovaTen}
                                                    onChange={e => setEditStaffData({
                                                        ...editStaffData,
                                                        hovaTen: e.target.value
                                                    })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                                                <Input placeholder="0123456789" value={editStaffData.phone}
                                                    onChange={e => setEditStaffData({
                                                        ...editStaffData,
                                                        phone: e.target.value
                                                    })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Căn cước công dân</label>
                                                <Input placeholder="nhập Căn cước mới" value={editStaffData.cccd}
                                                    onChange={e => setEditStaffData({
                                                        ...editStaffData,
                                                        cccd: e.target.value
                                                    })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Giấy phép lái xe</label>
                                                <Input placeholder="nhập giấy phép lái xe mới" value={editStaffData.gplx}
                                                    onChange={e => setEditStaffData({
                                                        ...editStaffData,
                                                        gplx: e.target.value
                                                    })} />
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end space-x-3 p-6 border-t">
                                <Button variant="outline" onClick={() => setShowEditStaffModal(false)}>
                                    Hủy
                                </Button>
                                <Button className="bg-gradient-primary hover:shadow-glow" onClick={handleUpdateStaff}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Cập nhật
                                </Button>
                            </div>
                        </div>
                    </div>}

                {/* Update Success Modal */}
                {showUpdateSuccessModal &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-elegant max-w-md w-full">
                            <div className="p-6 text-center">
                                <div
                                    className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Cập nhật thành công!</h3>
                                <p className="text-muted-foreground mb-6">
                                    Thông tin nhân viên đã được cập nhật thành công.
                                </p>

                                <Button className="w-full bg-gradient-primary hover:shadow-glow"
                                    onClick={() => setShowUpdateSuccessModal(false)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    </div>}

                {/* Lock/Unlock Confirmation Modal */}
                {showLockConfirmModal && selectedStaff &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-elegant max-w-md w-full">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    {actionType === "lock" ? "Xác nhận khóa nhân viên" : "Xác nhận mở khóa nhân viên"}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Nhân viên: <span className="font-medium">{selectedStaff.name}</span>
                                </p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Nhập
                                        "{actionType === "lock" ? "Xác nhận khóa nhân viên này" : "Xác nhận mở khóa nhân viên này"}"
                                        để xác nhận:
                                    </label>
                                    <Input
                                        placeholder={actionType === "lock" ? "Xác nhận khóa nhân viên này" : "Xác nhận mở khóa nhân viên này"}
                                        value={confirmationText} onChange={e => setConfirmationText(e.target.value)} />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Button variant="outline" onClick={() => setShowLockConfirmModal(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        className={actionType === "lock" ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-primary hover:shadow-glow"}
                                        onClick={confirmAction}>
                                        {actionType === "lock" ? "Khóa" : "Mở khóa"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>}

                {/* Fire Confirmation Modal */}
                {showFireConfirmModal && selectedStaff &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-elegant max-w-md w-full">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4 text-destructive">
                                    Xác nhận sa thải nhân viên
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Nhân viên: <span className="font-medium">{selectedStaff.name}</span>
                                </p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Nhập "Xác nhận sa thải nhân viên này" để xác nhận:
                                    </label>
                                    <Input placeholder="Xác nhận sa thải nhân viên này" value={confirmationText}
                                        onChange={e => setConfirmationText(e.target.value)} />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Button variant="outline" onClick={() => setShowFireConfirmModal(false)}>
                                        Hủy
                                    </Button>
                                    <Button className="bg-destructive hover:bg-destructive/90" onClick={confirmAction}>
                                        Sa thải
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>}

                {/* Action Success Modal */}
                {showActionSuccessModal &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-elegant max-w-md w-full">
                            <div className="p-6 text-center">
                                <div
                                    className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {actionType === "lock" ? "Khóa thành công!" : actionType === "unlock" ? "Mở khóa thành công!" : "Sa thải thành công!"}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {actionType === "lock" ? "Nhân viên đã được khóa tài khoản." : actionType === "unlock" ? "Nhân viên đã được mở khóa tài khoản." : "Nhân viên đã được sa thải khỏi hệ thống."}
                                </p>

                                <Button className="w-full bg-gradient-primary hover:shadow-glow"
                                    onClick={() => setShowActionSuccessModal(false)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    </div>}

                {/* Contract Detail Modal */}
                {showContractDetailModal && selectedContract &&
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-background rounded-lg shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Chi tiết hợp đồng</span>
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Thông tin chi tiết về hợp đồng đã được duyệt
                                </p>
                            </div>

                            <div className="space-y-6 p-6">
                                {/* Contract Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <FileText className="h-5 w-5" />
                                            <span>Thông tin hợp đồng</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Mã hợp đồng</p>
                                                <p className="font-medium">{selectedContract.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tên hợp đồng</p>
                                                <p className="font-medium">{selectedContract.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Loại hợp đồng</p>
                                                <p className="font-medium">{selectedContract.contractType}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Ngày ký</p>
                                                <p className="font-medium">{selectedContract.signedDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Giá trị hợp đồng</p>
                                                <p className="font-medium text-success">{selectedContract.value}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Trạng thái</p>
                                                <Badge
                                                    variant={selectedContract.status === 'active' ? 'default' : 'secondary'}>
                                                    {selectedContract.status === 'active' ? 'Hiệu lực' : selectedContract.status === 'expired' ? 'Hết hạn' : 'Chờ ký'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Staff & Group Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Users className="h-5 w-5" />
                                            <span>Thông tin nhóm & nhân viên</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Nhân viên xử lý</p>
                                                <p className="font-medium">{selectedContract.staff}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số thành viên</p>
                                                <p className="font-medium">{selectedContract.memberCount} người</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số xe điện</p>
                                                <p className="font-medium">{selectedContract.vehicleCount} xe</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Kích thước file</p>
                                                <p className="font-medium">{selectedContract.fileSize}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Vehicle Details (if applicable) */}
                                {selectedContract.contractType.includes('đồng sở hữu') && <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Car className="h-5 w-5" />
                                            <span>Chi tiết phương tiện</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">VinFast VF8 2024</p>
                                                        <p className="text-sm text-muted-foreground">Xe điện cao cấp</p>
                                                    </div>
                                                    <Badge variant="default">Hoạt động</Badge>
                                                </div>
                                            </div>
                                            {selectedContract.vehicleCount > 1 &&
                                                <div className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">Tesla Model Y 2023</p>
                                                            <p className="text-sm text-muted-foreground">Xe điện thể
                                                                thao</p>
                                                        </div>
                                                        <Badge variant="default">Hoạt động</Badge>
                                                    </div>
                                                </div>}
                                        </div>
                                    </CardContent>
                                </Card>}
                            </div>

                            <div className="flex justify-end space-x-3 p-6 border-t">
                                <Button variant="outline" onClick={() => setShowContractDetailModal(false)}>
                                    Đóng
                                </Button>
                                <Button className="bg-gradient-primary hover:shadow-glow" onClick={() => {
                                    toast({
                                        title: "Trạng thái tải xuống",
                                        description: selectedContract.status === 'active' ? "Hợp đồng có thể tải xuống" : "Hợp đồng chưa sẵn sàng để tải"
                                    });
                                }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Tải về hợp đồng
                                </Button>
                            </div>
                        </div>
                    </div>}

            </div>
        </div>
    </div>;
}