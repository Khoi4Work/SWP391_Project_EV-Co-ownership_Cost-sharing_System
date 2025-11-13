import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Shield,
    Users,
    Building,
    FileText,
    BarChart3,
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
    Trash2
} from "lucide-react";
import ChatBox from "@/components/ChatBox";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axiosClient from "@/api/axiosClient";
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const GET_STAFFS = import.meta.env.VITE_GET_GET_ALL_STAFF_PATH;
    const [showChat, setShowChat] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditStaffModal, setShowEditStaffModal] = useState(false);
    const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);
    const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);
    const [showFireConfirmModal, setShowFireConfirmModal] = useState(false);
    const [showActionSuccessModal, setShowActionSuccessModal] = useState(false);
    const [actionType, setActionType] = useState(""); // "lock", "unlock", "fire"
    const [activeTab, setActiveTab] = useState("analytics");
    const [confirmationText, setConfirmationText] = useState("");
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStaff, setFilteredStaff] = useState([]);
    const UPDATE_STAFF = import.meta.env.VITE_PUT_UPDATE_STAFF_PATH;
    const [editStaffData, setEditStaffData] = useState({
        hovaTen: "",
        phone: "",
        cccd: "",
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
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(false);
    const { toast } = useToast();
    const CREATE_STAFF = import.meta.env.VITE_POST_CREATE_STAFF_PATH;
    const displayedStaff = searchTerm.trim()
        ? filteredStaff
        : staffList;
    const stats = [{
        label: "Tổng nhân viên",
        value: 25,
        icon: Users,
        color: "primary"
    }, {
        label: "Showroom",
        value: 12,
        icon: Building,
        color: "success"
    }, {
        label: "Hợp đồng",
        value: 158,
        icon: FileText,
        color: "warning"
    }, {
        label: "Doanh thu (tháng)",
        value: "2.5B VNĐ",
        icon: BarChart3,
        color: "primary"
    }];
    const showrooms = [{
        id: "SR001",
        name: "EcoShare Saigon Center",
        address: "123 Nguyễn Huệ, Q1, HCM",
        manager: "Nguyễn Văn A",
        vehicles: 15,
        status: "active"
    }, {
        id: "SR002",
        name: "EcoShare Hanoi Plaza",
        address: "456 Hoàn Kiếm, Hà Nội",
        manager: "Trần Thị B",
        vehicles: 12,
        status: "active"
    }];
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

    // Fetch blocked users
    useEffect(() => {
        const fetchBlockedUsers = async () => {
            setLoadingBlockedUsers(true);
            try {
                const res = await axiosClient.get("/api/admin/staff/getUserStatusBlock");
                setBlockedUsers(Array.isArray(res.data) ? res.data : []);
            } catch (err: any) {
                console.error("Lỗi khi lấy danh sách users bị block:", err);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách tài khoản bị khóa",
                    variant: "destructive"
                });
                setBlockedUsers([]);
            } finally {
                setLoadingBlockedUsers(false);
            }
        };

        fetchBlockedUsers();
    }, []);

    // Handle unblock user
    const handleUnblockUser = async (userId: number) => {
        try {
            const res = await axiosClient.put(`/api/admin/staff/users/${userId}/unblock`);
            if (res.status === 200) {
                toast({
                    title: "Thành công",
                    description: "Đã mở khóa tài khoản thành công",
                });
                // Cập nhật lại danh sách
                setBlockedUsers(prev => prev.filter(user => user.id !== userId));
            }
        } catch (err: any) {
            console.error("Lỗi khi mở khóa user:", err);
            toast({
                title: "Lỗi",
                description: err.response?.data?.message || "Không thể mở khóa tài khoản",
                variant: "destructive"
            });
        }
    };
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
            phone: staff.phone
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
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'analytics' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('analytics')}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                </button>

                <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'staff' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('staff')}>
                    <Users className="h-4 w-4" />
                    <span>Nhân viên</span>
                </button>

                <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'showrooms' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('showrooms')}>
                    <Building className="h-4 w-4" />
                    <span>Showroom</span>
                </button>

                <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'contracts' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('contracts')}>
                    <FileText className="h-4 w-4" />
                    <span>Hợp đồng</span>
                </button>

                <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('history')}>
                    <Car className="h-4 w-4" />
                    <span>Lịch sử xe</span>
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
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors">
                            <Settings className="h-4 w-4" />
                            <span>Cài đặt</span>
                        </button>

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
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map(stat => <Card key={stat.label} className="shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-8 w-8 text-${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>)}
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">


                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Phân tích doanh thu</span>
                                </CardTitle>
                                <CardDescription>
                                    Báo cáo tổng quan về hoạt động kinh doanh
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="h-5 w-5 text-success" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Doanh thu tháng</p>
                                                        <p className="text-lg font-bold">2.5B VNĐ</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Tăng trưởng</p>
                                                        <p className="text-lg font-bold text-success">+12.5%</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-5 w-5 text-warning" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Khách hàng mới</p>
                                                        <p className="text-lg font-bold">248</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

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

                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {/* 🔹 Email */}
                                                        <span>{staff.email}</span>

                                                        <span className="mx-2">•</span>

                                                        {/* 🔹 CCCD */}
                                                        <span>CCCD: {staff.cccd}</span>

                                                        <span className="mx-2">•</span>

                                                        {/* 🔹 Số điện thoại */}
                                                        <span>📞 {staff.phone}</span>
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

                        {/* Blocked Users Section */}
                        <Card className="shadow-elegant mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Lock className="h-5 w-5" />
                                    <span>Tài khoản bị khóa</span>
                                </CardTitle>
                                <CardDescription>
                                    Danh sách các tài khoản người dùng bị khóa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loadingBlockedUsers ? (
                                    <div className="text-center py-4 text-muted-foreground">Đang tải...</div>
                                ) : blockedUsers.length > 0 ? (
                                    blockedUsers.map((user: any) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50/50">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-semibold">{user.hovaTen}</h3>
                                                    <Badge variant="destructive">Bị khóa</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    <span>{user.email}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>CCCD: {user.cccd}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>📞 {user.phone}</span>
                                                    {user.gplx && (
                                                        <>
                                                            <span className="mx-2">•</span>
                                                            <span>GPLX: {user.gplx}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                                onClick={() => handleUnblockUser(user.id)}
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Mở khóa
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-4 text-center">
                                        Không có tài khoản nào bị khóa.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Showroom Management */}
                    <TabsContent value="showrooms">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Building className="h-5 w-5" />
                                            <span>Quản lý Showroom</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Quản lý các showroom và hợp đồng đối tác
                                        </CardDescription>
                                    </div>
                                    <Button className="bg-gradient-primary hover:shadow-glow">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm showroom
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {showrooms.map(showroom => <div key={showroom.id}
                                        className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="font-semibold">{showroom.name}</h3>
                                                <Badge variant={getStatusColor(showroom.status) as any}>
                                                    {getStatusText(showroom.status)}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                <span>{showroom.address}</span>
                                                <span className="mx-2">•</span>
                                                <span>Quản lý: {showroom.manager}</span>
                                                <span className="mx-2">•</span>
                                                <span>{showroom.vehicles} xe</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" variant="outline">
                                                Xem hợp đồng
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Settings className="h-4 w-4 mr-1" />
                                                Chỉnh sửa
                                            </Button>
                                        </div>
                                    </div>)}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contracts */}
                    <TabsContent value="contracts">
                        <div className="space-y-6">
                            {/* Search and Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-3">
                                    <Card className="shadow-elegant">
                                        <CardHeader>
                                            <CardTitle>Tìm kiếm hợp đồng</CardTitle>
                                            <CardDescription>
                                                Tra cứu hợp đồng theo tên, nhân viên xử lý hoặc mã hợp đồng
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="relative">
                                                <Search
                                                    className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="Nhập tên hợp đồng, nhân viên hoặc mã hợp đồng..."
                                                    className="pl-10" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="shadow-elegant">
                                    <CardHeader className="text-center">
                                        <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <CardTitle>15</CardTitle>
                                        <CardDescription>Tổng số hợp đồng</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Contracts List */}
                            <Card className="shadow-elegant">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5" />
                                        <span>Danh sách hợp đồng</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Quản lý tất cả hợp đồng trong hệ thống theo nhân viên xử lý
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[{
                                            id: "CONTRACT-001",
                                            title: "Hợp đồng đồng sở hữu - Nhóm HCM Quận 1",
                                            staff: "Nguyễn Văn Nam",
                                            contractType: "Đồng sở hữu xe điện",
                                            status: "active",
                                            signedDate: "15/01/2024",
                                            vehicleCount: 3,
                                            memberCount: 12,
                                            value: "1.2B VNĐ",
                                            fileSize: "2.5 MB"
                                        }, {
                                            id: "CONTRACT-002",
                                            title: "Hợp đồng showroom - Chi nhánh HCM",
                                            staff: "Trần Thị Lan",
                                            contractType: "Hợp tác showroom",
                                            status: "pending",
                                            signedDate: "20/01/2024",
                                            vehicleCount: 0,
                                            memberCount: 8,
                                            value: "500M VNĐ",
                                            fileSize: "3.1 MB"
                                        }, {
                                            id: "CONTRACT-003",
                                            title: "Hợp đồng đồng sở hữu - Nhóm HN Cầu Giấy",
                                            staff: "Lê Văn Tùng",
                                            contractType: "Đồng sở hữu xe điện",
                                            status: "active",
                                            signedDate: "18/01/2024",
                                            vehicleCount: 2,
                                            memberCount: 8,
                                            value: "800M VNĐ",
                                            fileSize: "2.8 MB"
                                        }, {
                                            id: "CONTRACT-004",
                                            title: "Hợp đồng bảo trì - Trung tâm Đà Nẵng",
                                            staff: "Phạm Minh Đức",
                                            contractType: "Bảo trì và sửa chữa",
                                            status: "expired",
                                            signedDate: "05/12/2023",
                                            vehicleCount: 0,
                                            memberCount: 3,
                                            value: "50M VNĐ",
                                            fileSize: "1.2 MB"
                                        }].map(contract => {
                                            const getStatusColor = (status: string) => {
                                                switch (status) {
                                                    case "active":
                                                        return "default";
                                                    case "expired":
                                                        return "destructive";
                                                    case "pending":
                                                        return "secondary";
                                                    default:
                                                        return "outline";
                                                }
                                            };
                                            const getStatusText = (status: string) => {
                                                switch (status) {
                                                    case "active":
                                                        return "Hiệu lực";
                                                    case "expired":
                                                        return "Hết hạn";
                                                    case "pending":
                                                        return "Chờ ký";
                                                    default:
                                                        return "Không xác định";
                                                }
                                            };
                                            return <div key={contract.id}
                                                className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold">{contract.title}</h3>
                                                            <Badge variant={getStatusColor(contract.status) as any}>
                                                                {getStatusText(contract.status)}
                                                            </Badge>
                                                        </div>

                                                        <div
                                                            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>Ngày ký: {contract.signedDate}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Users className="h-4 w-4" />
                                                                <span>{contract.memberCount} thành viên</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Car className="h-4 w-4" />
                                                                <span>{contract.vehicleCount} xe điện</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm space-y-1">
                                                            <div>
                                                                <span
                                                                    className="font-medium">Mã hợp đồng:</span> {contract.id}
                                                                <span className="mx-3">•</span>
                                                                <span
                                                                    className="font-medium">Loại:</span> {contract.contractType}
                                                                <span className="mx-3">•</span>
                                                                <span
                                                                    className="font-medium">Kích thước:</span> {contract.fileSize}
                                                            </div>
                                                            <div>
                                                                <span
                                                                    className="font-medium">NV xử lý:</span> {contract.staff}
                                                                <span className="mx-3">•</span>
                                                                <span
                                                                    className="font-medium">Giá trị:</span> {contract.value}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col space-y-2 ml-4">
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setSelectedContract(contract);
                                                            setShowContractDetailModal(true);
                                                        }}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Xem
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            toast({
                                                                title: "Trạng thái tải xuống",
                                                                description: contract.status === 'active' ? "Hợp đồng có thể tải xuống" : "Hợp đồng chưa sẵn sàng để tải"
                                                            });
                                                        }}>
                                                            <Download className="h-4 w-4 mr-1" />
                                                            Tải về
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>;
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Analytics */}
                    <TabsContent value="analytics">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Phân tích & Báo cáo AI</span>
                                </CardTitle>
                                <CardDescription>
                                    Phân tích dữ liệu hệ thống với AI và tạo báo cáo chi tiết
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
                                            <p className="text-2xl font-bold">+25%</p>
                                            <p className="text-sm text-muted-foreground">Tăng trưởng doanh thu</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                                            <p className="text-2xl font-bold">1,245</p>
                                            <p className="text-sm text-muted-foreground">Người dùng hoạt động</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Car className="h-8 w-8 mx-auto mb-2 text-warning" />
                                            <p className="text-2xl font-bold">92%</p>
                                            <p className="text-sm text-muted-foreground">Tỷ lệ sử dụng xe</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                                            <p className="text-2xl font-bold">156M</p>
                                            <p className="text-sm text-muted-foreground">Doanh thu tháng</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Phân tích xu hướng</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="p-3 bg-success/10 border border-success/20 rounded">
                                                    <p className="font-medium text-success">📈 Xu hướng tích cực</p>
                                                    <p className="text-sm">Số lượng đăng ký mới tăng 35% so với tháng
                                                        trước</p>
                                                </div>
                                                <div className="p-3 bg-warning/10 border border-warning/20 rounded">
                                                    <p className="font-medium text-warning">⚠️ Cần chú ý</p>
                                                    <p className="text-sm">Thời gian sử dụng trung bình giảm 8% trong
                                                        tuần qua</p>
                                                </div>
                                                <div className="p-3 bg-primary/10 border border-primary/20 rounded">
                                                    <p className="font-medium text-primary">💡 Gợi ý AI</p>
                                                    <p className="text-sm">Nên mở rộng dịch vụ tại Đà Nẵng và Cần
                                                        Thơ</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Báo cáo tự động</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 border rounded">
                                                    <div>
                                                        <p className="font-medium">Báo cáo doanh thu tháng</p>
                                                        <p className="text-sm text-muted-foreground">Tự động tạo mỗi
                                                            ngày 1</p>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Tải về
                                                    </Button>
                                                </div>
                                                <div className="flex justify-between items-center p-3 border rounded">
                                                    <div>
                                                        <p className="font-medium">Phân tích hiệu suất xe</p>
                                                        <p className="text-sm text-muted-foreground">Cập nhật hàng
                                                            tuần</p>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Xem
                                                    </Button>
                                                </div>
                                                <div className="flex justify-between items-center p-3 border rounded">
                                                    <div>
                                                        <p className="font-medium">Dự báo xu hướng AI</p>
                                                        <p className="text-sm text-muted-foreground">Dự báo 3 tháng
                                                            tới</p>
                                                    </div>
                                                    <Button size="sm" className="bg-gradient-primary hover:shadow-glow">
                                                        <BarChart3 className="h-4 w-4 mr-1" />
                                                        Phân tích
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vehicle History */}
                    <TabsContent value="history">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5" />
                                    <span>Lịch sử mua bán xe</span>
                                </CardTitle>
                                <CardDescription>
                                    Theo dõi toàn bộ lịch sử giao dịch xe trong hệ thống
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <p className="text-2xl font-bold text-success">142</p>
                                                    <p className="text-sm text-muted-foreground">Xe đã bán</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <p className="text-2xl font-bold text-primary">24</p>
                                                    <p className="text-sm text-muted-foreground">Xe đang hoạt động</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <p className="text-2xl font-bold text-warning">8</p>
                                                    <p className="text-sm text-muted-foreground">Xe đang bảo trì</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-medium">Giao dịch gần đây</h4>
                                        {[{
                                            id: "TX001",
                                            type: "Mua",
                                            vehicle: "VinFast VF8 2024",
                                            buyer: "Nhóm HCM-Q1 (12 thành viên)",
                                            seller: "VinFast Showroom HCM",
                                            price: "1.2B VNĐ",
                                            date: "22/01/2024",
                                            status: "completed"
                                        }, {
                                            id: "TX002",
                                            type: "Bán",
                                            vehicle: "Tesla Model Y 2023",
                                            buyer: "Công ty ABC",
                                            seller: "Nhóm HN-Cầu Giấy (8 thành viên)",
                                            price: "950M VNĐ",
                                            date: "20/01/2024",
                                            status: "completed"
                                        }, {
                                            id: "TX003",
                                            type: "Mua",
                                            vehicle: "Hyundai Kona Electric",
                                            buyer: "Nhóm ĐN-Hải Châu (6 thành viên)",
                                            seller: "Hyundai Đà Nẵng",
                                            price: "750M VNĐ",
                                            date: "18/01/2024",
                                            status: "processing"
                                        }].map(transaction => <div key={transaction.id}
                                            className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <Badge
                                                        variant={transaction.type === 'Mua' ? 'default' : 'secondary'}>
                                                        {transaction.type}
                                                    </Badge>
                                                    <h3 className="font-semibold">{transaction.vehicle}</h3>
                                                    <Badge
                                                        variant={transaction.status === 'completed' ? 'default' : 'outline'}>
                                                        {transaction.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    <span>{transaction.buyer}</span>
                                                    <span className="mx-2">←</span>
                                                    <span>{transaction.seller}</span>
                                                    <span className="mx-2">•</span>
                                                    <span
                                                        className="text-success font-medium">{transaction.price}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{transaction.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Chi tiết
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    Hợp đồng
                                                </Button>
                                            </div>
                                        </div>)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* AI Chat Button */}
                <div className="fixed bottom-6 right-6">
                    <Button onClick={() => setShowChat(true)} size="lg"
                        className="rounded-full bg-gradient-primary hover:shadow-glow shadow-lg">
                        Phân tích AI
                    </Button>
                </div>

                {/* Chat Box */}
                {showChat && <ChatBox isOpen={showChat} onClose={() => setShowChat(false)} userType="admin" />}

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

                                        <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                                            <h4 className="font-medium mb-2">Thông tin tài khoản sẽ tạo:</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span
                                                    className="font-medium">Email:</span> {newStaffData.email || 'Chưa nhập'}
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
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Căn cước công dân</label>
                                            <Input placeholder="0123456789" value={editStaffData.cccd}
                                                onChange={e => setEditStaffData({
                                                    ...editStaffData,
                                                    cccd: e.target.value
                                                })} />
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