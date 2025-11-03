import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    FileCheck,
    TrendingUp,
    Car,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    LogOut,
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Activity
} from "lucide-react";
import ChatBox from "@/components/ChatBox";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { groups as initialGroups } from "@/data/mockGroups";
import axiosClient from "@/api/axiosClient";

export default function StaffDashboard() {
    const GET_REQUESTS = import.meta.env.VITE_GET_PENDING_CONTRACT_PATH;
    const [showChat, setShowChat] = useState(false);
    const [services, setServices] = useState<any>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const navigate = useNavigate();
    const [groups, setGroups] = useState(initialGroups);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const LEAVE_GROUP = import.meta.env.VITE_GET_ALL_GROUP_REQUEST_PATH;
    const stats = [
        { label: "Đơn chờ duyệt", value: 12, icon: Clock, color: "warning" },
        { label: "Đơn đã duyệt", value: 45, icon: CheckCircle, color: "success" },
        { label: "Nhóm quản lý", value: 8, icon: Users, color: "primary" },
        { label: "Xe hoạt động", value: 24, icon: Car, color: "primary" }
    ];
    useEffect(() => {
        axiosClient.get(GET_REQUESTS)
            .then(res => {
                if (Array.isArray(res.data)) {
                    const allServices = res.data
                        .map((item: any) => item.groupMember?.requestServices || [])
                        .flat();
                    setServices(allServices);
                }
            })
            .catch(err => {
                console.error("Không kết nối được BE:", err.message);
                setLeaveRequests([]); // đảm bảo luôn là []
            });
    }, []);
    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const res = await axiosClient.get(LEAVE_GROUP);

                if (Array.isArray(res.data)) {
                    setLeaveRequests(res.data);
                    console.log("📦 Leave Requests fetched:", res.data);
                } else if (res.status === 204 || res.data === null) {
                    setLeaveRequests([]);
                    console.warn("⚠️ Không có yêu cầu rời nhóm nào (204 No Content).");
                } else {
                    console.error("⚠️ Dữ liệu trả về không hợp lệ:", res.data);
                    setLeaveRequests([]);
                }
            } catch (error: any) {
                console.error("❌ Lỗi khi gọi API LEAVE_GROUP:", error.message);
                toast({
                    title: "Lỗi tải yêu cầu rời nhóm",
                    description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
                    variant: "destructive",
                });
                setLeaveRequests([]);
            }
        };

        fetchLeaveRequests();
    }, [LEAVE_GROUP]);
    const handleApprove = async (appId: number) => {
        const request = leaveRequests.find((r) => r.id === appId);
        if (!request) {
            toast({
                title: "Lỗi",
                description: "Không tìm thấy yêu cầu.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Gửi request đến BE
            const res = await axiosClient.post(LEAVE_GROUP, {
                groupId: request.groupMember?.group?.id || request.groupId,
                requestId: request.id,
            });

            if (res.status === 200) {
                // Cập nhật FE
                setLeaveRequests((prev) => prev.filter((r) => r.id !== appId));
                toast({
                    title: "Đã duyệt yêu cầu",
                    description: "Nhân viên đã được rời khỏi nhóm thành công.",
                });
            } else {
                toast({
                    title: "Lỗi",
                    description: "Backend trả về trạng thái không mong muốn.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể xử lý yêu cầu ở backend.",
                variant: "destructive",
            });
        }
    };




    const handleReject = (appId: string) => {
        setLeaveRequests(prev =>
            prev.map(r =>
                r.id === appId ? { ...r, status: "rejected" } : r
            )
        );
        setLeaveRequests(prev => prev.filter(r => r.id !== appId));
        toast({
            title: "Đã từ chối đơn",
            description: "Yêu cầu rời nhóm không được chấp nhận.",
        });
    };


    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-gradient-primary text-white p-4 shadow-glow">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Bảng điều khiển nhân viên</h1>
                        <p className="text-sm opacity-90">Quản lý đơn đăng ký và nhóm đồng sở hữu</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Quay lại
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => navigate('/login')}
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="shadow-elegant">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`h-8 w-8 text-${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="applications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="applications">Đơn đăng ký</TabsTrigger>
                        <TabsTrigger value="groups">Quản lý nhóm</TabsTrigger>
                        <TabsTrigger value="vehicles">Quản lý xe</TabsTrigger>
                        <TabsTrigger value="reports">Báo cáo</TabsTrigger>
                    </TabsList>

                    {/* Applications Management */}
                    <TabsContent value="applications">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileCheck className="h-5 w-5" />
                                    <span>Đơn đăng ký chờ duyệt</span>
                                </CardTitle>
                                <CardDescription>
                                    Xem xét và phê duyệt các đơn đăng ký xe điện
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {services.map((req) => (
                                        <div
                                            key={req.id}
                                            className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm"
                                        >
                                            <div>
                                                <p><strong>Tên dịch vụ:</strong> {req.serviceName}</p>
                                                <p><strong>Mô tả:</strong> {req.description}</p>
                                                <p><strong>Giá:</strong> {req.price ? req.price.toLocaleString("vi-VN") + " ₫" : "Chưa có giá"}</p>
                                                <p><strong>Trạng thái:</strong> {req.status}</p>
                                                <p><strong>Ngày tạo:</strong> {req.createdAt ? new Date(req.createdAt).toLocaleString("vi-VN") : "Không rõ"}</p>

                                                {req.vehicle && (
                                                    <p><strong>Phương tiện:</strong> {req.vehicle.plateNo || "Không rõ"}</p>
                                                )}

                                                {req.groupMember && (
                                                    <p><strong>Người yêu cầu:</strong> {req.groupMember.users?.username || "Không rõ"}</p>
                                                )}
                                            </div>

                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={() => handleApprove(req.id)}>Duyệt</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>Từ chối</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Groups Management */}
                    <TabsContent value="groups">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Quản lý nhóm</span>
                                </CardTitle>
                                <CardDescription>
                                    Theo dõi và quản lý các nhóm đồng sở hữu theo tỉnh/showroom
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {leaveRequests.map((req) => (
                                        <div key={req.id} className="p-4 border rounded-lg flex justify-between">
                                            <div>
                                                <p><strong>Nhóm:</strong> {req.nameRequestGroup}</p>
                                                <p><strong>Loại đơn:</strong> {req.descriptionRequestGroup}</p>
                                                <p><strong>Người yêu cầu:</strong> {req.groupMember?.users?.username || "Không rõ"}</p>
                                                <p><strong>Ngày gửi:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={() => handleApprove(req.id)}>Duyệt</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>Từ chối</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vehicles Management */}
                    <TabsContent value="vehicles">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5" />
                                    <span>Quản lý xe nhóm</span>
                                </CardTitle>
                                <CardDescription>
                                    Theo dõi xe của từng nhóm và xử lý yêu cầu chi trả dịch vụ
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Vehicles by Group */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium mb-4 flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>Xe theo nhóm</span>
                                        </h4>
                                        <div className="space-y-4">
                                            {/* Group 1 */}
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle className="text-lg">Nhóm HCM - Quận 1</CardTitle>
                                                            <p className="text-sm text-muted-foreground">12 thành viên •
                                                                Quỹ: 50,000,000 VNĐ</p>
                                                        </div>
                                                        <Badge variant="outline">3 xe</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="border rounded p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="secondary">Đang sử dụng</Badge>
                                                                <Activity className="h-4 w-4 text-success" />
                                                            </div>
                                                            <h5 className="font-semibold">VinFast VF8</h5>
                                                            <p className="text-sm text-muted-foreground">51A-123.45</p>
                                                            <p className="text-xs mt-1">Người dùng: Nguyễn Văn A</p>
                                                        </div>
                                                        <div className="border rounded p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="outline">Sẵn sàng</Badge>
                                                                <Activity className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <h5 className="font-semibold">Tesla Model Y</h5>
                                                            <p className="text-sm text-muted-foreground">30A-678.90</p>
                                                            <p className="text-xs mt-1">Pin: 85%</p>
                                                        </div>
                                                        <div className="border rounded p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="destructive">Bảo trì</Badge>
                                                                <Activity className="h-4 w-4 text-destructive" />
                                                            </div>
                                                            <h5 className="font-semibold">Hyundai Kona</h5>
                                                            <p className="text-sm text-muted-foreground">29A-111.22</p>
                                                            <p className="text-xs mt-1">Thay lốp</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Group 2 */}
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle className="text-lg">Nhóm HN - Cầu
                                                                Giấy</CardTitle>
                                                            <p className="text-sm text-muted-foreground">8 thành viên •
                                                                Quỹ: 35,000,000 VNĐ</p>
                                                        </div>
                                                        <Badge variant="outline">2 xe</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="border rounded p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="outline">Sẵn sàng</Badge>
                                                                <Activity className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <h5 className="font-semibold">BMW iX3</h5>
                                                            <p className="text-sm text-muted-foreground">30B-456.78</p>
                                                            <p className="text-xs mt-1">Pin: 92%</p>
                                                        </div>
                                                        <div className="border rounded p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="secondary">Đang sử dụng</Badge>
                                                                <Activity className="h-4 w-4 text-success" />
                                                            </div>
                                                            <h5 className="font-semibold">Audi e-tron</h5>
                                                            <p className="text-sm text-muted-foreground">30B-789.01</p>
                                                            <p className="text-xs mt-1">Người dùng: Lê Thị D</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Service Payment Requests */}
                                    <div>
                                        <h4 className="font-medium mb-4 flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Yêu cầu chi trả dịch vụ</span>
                                            <Badge variant="destructive">4 yêu cầu</Badge>
                                        </h4>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    id: "PAY-001",
                                                    group: "Nhóm HCM - Quận 1",
                                                    vehicle: "VF8 - 51A-123.45",
                                                    service: "Bảo trì định kỳ",
                                                    amount: "2,500,000 VNĐ",
                                                    groupFund: "50,000,000 VNĐ",
                                                    date: "20/01/2024",
                                                    status: "pending",
                                                    paymentType: "group",
                                                    description: "Bảo trì định kỳ 6 tháng theo quy định"
                                                },
                                                {
                                                    id: "PAY-002",
                                                    group: "Nhóm HN - Cầu Giấy",
                                                    vehicle: "BMW iX3 - 30B-456.78",
                                                    service: "Thay lốp",
                                                    amount: "1,800,000 VNĐ",
                                                    groupFund: "35,000,000 VNĐ",
                                                    date: "19/01/2024",
                                                    status: "pending",
                                                    paymentType: "self",
                                                    description: "Thay lốp sau do bị thủng"
                                                },
                                                {
                                                    id: "PAY-003",
                                                    group: "Nhóm HCM - Quận 1",
                                                    vehicle: "Model Y - 30A-678.90",
                                                    service: "Sửa chữa hệ thống điện",
                                                    amount: "3,200,000 VNĐ",
                                                    groupFund: "50,000,000 VNĐ",
                                                    date: "18/01/2024",
                                                    status: "pending",
                                                    paymentType: "group",
                                                    description: "Lỗi hệ thống sạc, cần thay bộ điều khiển"
                                                },
                                                {
                                                    id: "PAY-004",
                                                    group: "Nhóm HN - Cầu Giấy",
                                                    vehicle: "Audi e-tron - 30B-789.01",
                                                    service: "Kiểm tra pin",
                                                    amount: "800,000 VNĐ",
                                                    groupFund: "35,000,000 VNĐ",
                                                    date: "17/01/2024",
                                                    status: "pending",
                                                    paymentType: "self",
                                                    description: "Kiểm tra độ chai pin theo định kỳ"
                                                }
                                            ].map((request) => (
                                                <Card key={request.id}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h5 className="font-semibold">{request.service}</h5>
                                                                    <Badge variant="outline">{request.id}</Badge>
                                                                    <Badge
                                                                        variant={request.paymentType === 'group' ? 'default' : 'secondary'}
                                                                        className="text-xs">
                                                                        {request.paymentType === 'group' ? 'Quỹ chung' : 'Tự chi trả'}
                                                                    </Badge>
                                                                </div>
                                                                <div
                                                                    className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                                                                    <div>
                                                                        <span
                                                                            className="font-medium">Nhóm:</span> {request.group}
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="font-medium">Xe:</span> {request.vehicle}
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="font-medium">Ngày:</span> {request.date}
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground mb-2">
                                                                    <span
                                                                        className="font-medium">Mô tả:</span> {request.description}
                                                                </div>
                                                                <div className="flex items-center space-x-4">
                                                                    {request.paymentType === 'group' && (
                                                                        <>
                                                                            <div className="text-sm">
                                                                                <span className="text-muted-foreground">Chi phí:</span>
                                                                                <span
                                                                                    className="font-semibold text-destructive ml-1">{request.amount}</span>
                                                                            </div>
                                                                            <div className="text-sm">
                                                                                <span className="text-muted-foreground">Quỹ nhóm:</span>
                                                                                <span
                                                                                    className="font-semibold text-success ml-1">{request.groupFund}</span>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                    {request.paymentType === 'self' && (
                                                                        <div className="text-sm">
                                                                            <span className="text-muted-foreground">Hình thức:</span>
                                                                            <span className="font-semibold ml-1">Tự lái xe thực hiện dịch vụ</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2 ml-4">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-success border-success hover:bg-success hover:text-success-foreground"
                                                                    onClick={() => {
                                                                        toast({
                                                                            title: "Thanh toán thành công",
                                                                            description: `Đã thanh toán ${request.amount} cho ${request.service} từ quỹ ${request.group}`
                                                                        });
                                                                    }}
                                                                >
                                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                                    Thanh toán
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                                    onClick={() => {
                                                                        toast({
                                                                            title: "Đã từ chối thanh toán",
                                                                            description: `Yêu cầu thanh toán ${request.service} đã bị từ chối`,
                                                                            variant: "destructive"
                                                                        });
                                                                    }}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Từ chối
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reports */}
                    <TabsContent value="reports">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>Báo cáo hoạt động</span>
                                </CardTitle>
                                <CardDescription>
                                    Thống kê và phân tích hoạt động hệ thống
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                                            <p className="text-2xl font-bold">142</p>
                                            <p className="text-sm text-muted-foreground">Lượt sử dụng (tháng)</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                                            <p className="text-2xl font-bold">25.5M</p>
                                            <p className="text-sm text-muted-foreground">Doanh thu (tháng)</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Users className="h-8 w-8 mx-auto mb-2 text-warning" />
                                            <p className="text-2xl font-bold">85%</p>
                                            <p className="text-sm text-muted-foreground">Tỷ lệ sử dụng</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Car className="h-8 w-8 mx-auto mb-2 text-primary" />
                                            <p className="text-2xl font-bold">24/26</p>
                                            <p className="text-sm text-muted-foreground">Xe hoạt động</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Báo cáo theo nhóm</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {[
                                                    { group: "Nhóm HCM - Q1", usage: "45 lượt", revenue: "12.5M VNĐ" },
                                                    {
                                                        group: "Nhóm HN - Cầu Giấy",
                                                        usage: "32 lượt",
                                                        revenue: "8.2M VNĐ"
                                                    },
                                                    { group: "Nhóm ĐN - Hải Châu", usage: "28 lượt", revenue: "4.8M VNĐ" }
                                                ].map((item, index) => (
                                                    <div key={index}
                                                        className="flex justify-between items-center p-3 bg-muted/50 rounded">
                                                        <div>
                                                            <p className="font-medium">{item.group}</p>
                                                            <p className="text-sm text-muted-foreground">{item.usage}</p>
                                                        </div>
                                                        <p className="font-medium text-success">{item.revenue}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Xu hướng sử dụng</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span>Thứ 2</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-24 bg-muted rounded-full h-2">
                                                            <div className="bg-primary h-2 rounded-full"
                                                                style={{ width: '70%' }}></div>
                                                        </div>
                                                        <span className="text-sm">70%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Thứ 3</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-24 bg-muted rounded-full h-2">
                                                            <div className="bg-primary h-2 rounded-full"
                                                                style={{ width: '85%' }}></div>
                                                        </div>
                                                        <span className="text-sm">85%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Thứ 4</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-24 bg-muted rounded-full h-2">
                                                            <div className="bg-primary h-2 rounded-full"
                                                                style={{ width: '90%' }}></div>
                                                        </div>
                                                        <span className="text-sm">90%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Thứ 5</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-24 bg-muted rounded-full h-2">
                                                            <div className="bg-primary h-2 rounded-full"
                                                                style={{ width: '75%' }}></div>
                                                        </div>
                                                        <span className="text-sm">75%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Application Detail Modal */}
            <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <FileCheck className="h-5 w-5" />
                            <span>Chi tiết đơn đăng ký - {selectedApp?.id}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết về đơn đăng ký đồng sở hữu xe điện
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="space-y-6">
                            {/* Vehicle Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Car className="h-5 w-5" />
                                        <span>Thông tin xe</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-lg">{selectedApp.vehicle}</h4>
                                            <p className="text-muted-foreground">Tổng giá
                                                trị: {selectedApp.details.totalAmount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ngày đăng ký</p>
                                            <p className="font-medium">{selectedApp.date}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Main Owner Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>Chủ sở hữu chính</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {selectedApp.applicant.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{selectedApp.applicant}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="secondary">Chủ sở hữu chính</Badge>
                                                    <Badge
                                                        className="bg-primary/20 text-primary">{selectedApp.ownership}</Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-primary">
                                                    {(parseFloat(selectedApp.ownership) * parseFloat(selectedApp.details.totalAmount.replace(/[^0-9]/g, '')) / 100).toLocaleString()} VNĐ
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{selectedApp.details.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                                <p className="font-medium">{selectedApp.details.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">CCCD/CMND</p>
                                                <p className="font-medium">{selectedApp.details.idNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                                <p className="font-medium">{selectedApp.details.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Co-owners Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>Đồng sở hữu ({selectedApp.details.coOwners.length})</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedApp.details.coOwners.map((coOwner: any, index: number) => (
                                            <div key={index}
                                                className="flex items-center space-x-4 p-4 border rounded-lg">
                                                <Avatar>
                                                    <AvatarFallback className="bg-accent text-accent-foreground">
                                                        {coOwner.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{coOwner.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{coOwner.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="outline">{coOwner.ownership}</Badge>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {(parseFloat(coOwner.ownership) * parseFloat(selectedApp.details.totalAmount.replace(/[^0-9]/g, '')) / 100).toLocaleString()} VNĐ
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ownership Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tổng kết tỷ lệ sở hữu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Chủ sở hữu chính:</span>
                                            <span className="font-semibold">{selectedApp.ownership}</span>
                                        </div>
                                        {selectedApp.details.coOwners.map((coOwner: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span>{coOwner.name}:</span>
                                                <span className="font-semibold">{coOwner.ownership}</span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-3 flex justify-between items-center font-bold">
                                            <span>Tổng cộng:</span>
                                            <span className="text-primary">
                                                {(parseFloat(selectedApp.ownership) + selectedApp.details.coOwners.reduce((sum: number, co: any) => sum + parseFloat(co.ownership), 0))}%
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => {
                                        handleReject(selectedApp.id);
                                        setSelectedApp(null);
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Từ chối
                                </Button>
                                <Button
                                    className="bg-gradient-primary hover:shadow-glow"
                                    onClick={() => {
                                        handleApprove(selectedApp.id);
                                        setSelectedApp(null);
                                    }}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Phê duyệt
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Group Details Dialog */}
            <Dialog open={selectedGroup !== null} onOpenChange={() => setSelectedGroup(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Chi tiết nhóm: {selectedGroup?.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin nhóm và các yêu cầu từ admin
                        </DialogDescription>
                    </DialogHeader>

                    {selectedGroup && (
                        <div className="space-y-6">
                            {/* Group Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin chung</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tên nhóm</p>
                                            <p className="font-semibold">{selectedGroup.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Số thành viên</p>
                                            <p className="font-semibold">{selectedGroup.members} người</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Quỹ nhóm</p>
                                            <p className="font-semibold">{selectedGroup.fund.toLocaleString()} VNĐ</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Admin Requests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Yêu cầu từ Admin</span>
                                        <Badge variant="destructive">{selectedGroup.requests.length} yêu cầu</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedGroup.requests.map((request: any) => (
                                            <div key={request.id} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            variant={
                                                                request.type === "delete_group" ? "destructive" :
                                                                    request.type === "add_member" ? "default" :
                                                                        "secondary"
                                                            }
                                                        >
                                                            {request.type === "delete_group" ? "Xóa nhóm" :
                                                                request.type === "add_member" ? "Thêm thành viên" :
                                                                    "Xóa thành viên"}
                                                        </Badge>
                                                        <span
                                                            className="text-sm text-muted-foreground">{request.date}</span>
                                                    </div>
                                                    <Badge variant="outline">Chờ xử lý</Badge>
                                                </div>

                                                <p className="text-sm">{request.description}</p>

                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                                                        onClick={() => {
                                                            console.log("Approved request:", request.id);
                                                            toast({
                                                                title: "Đã duyệt yêu cầu",
                                                                description: `Yêu cầu ${request.type === "delete_group" ? "xóa nhóm" : request.type === "add_member" ? "thêm thành viên" : "xóa thành viên"} đã được phê duyệt thành công.`
                                                            });
                                                        }}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Duyệt
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                        onClick={() => {
                                                            console.log("Rejected request:", request.id);
                                                            toast({
                                                                title: "Đã từ chối yêu cầu",
                                                                description: `Yêu cầu ${request.type === "delete_group" ? "xóa nhóm" : request.type === "add_member" ? "thêm thành viên" : "xóa thành viên"} đã bị từ chối.`,
                                                                variant: "destructive"
                                                            });
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Từ chối
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedGroup(null)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}