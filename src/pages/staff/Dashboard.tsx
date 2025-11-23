import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VehicleCard from "./VehicleCard";
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
import axiosClient from "@/api/axiosClient";
import { get } from "http";

export default function StaffDashboard() {

    const GET_CONTRACT_PENDING = import.meta.env.VITE_GET_PENDING_CONTRACT_PATH;
    const GET_VEHICLES = import.meta.env.VITE_VEHICLES
    const LEAVE_GROUP = import.meta.env.VITE_GET_ALL_GROUP_REQUEST_PATH;
    const GET_ALL_GROUPS = import.meta.env.VITE_GET_ALL_GROUPS_PATH
    const GET_CONTRACT_CONFIRMED = import.meta.env.VITE_GET_CONFIRMED_CONTRACT_PATH
    const CURRENT_USER = import.meta.env.VITE_AUTH_CURRENT
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [showChat, setShowChat] = useState(false);
    const [services, setServices] = useState<any>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const navigate = useNavigate();
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [donChoDuyet, setDonChoDuyet] = useState(0)
    const [donDaDuyet, setDonDaDuyet] = useState(0)
    const [nhomQuanLy, setNhomQuanLy] = useState(0)
    const [xeHoatDong, setXeHoatDong] = useState(0)
    const [refreshKey, setRefreshKey] = useState(0);
    const ALL_VEHICLES = import.meta.env.VITE_VEHICLES;

    const stats = [
        { label: "Đơn chờ duyệt", value: donChoDuyet, icon: Clock, color: "warning" },
        { label: "Đơn đã duyệt", value: donDaDuyet, icon: CheckCircle, color: "success" },
        { label: "Nhóm quản lý", value: nhomQuanLy, icon: Users, color: "primary" },
        { label: "Xe hoạt động", value: xeHoatDong, icon: Car, color: "primary" }
    ];
    useEffect(() => {
        axiosClient.get(CURRENT_USER).then(
            (res) => {
                if (res.data.role.roleName !== "staff") {
                    toast({
                        title: "Không có quyền truy cập",
                        description: "Bạn không có quyền truy cập trang này.",
                        variant: "destructive",
                    });
                    navigate("/login");
                }
            }
        );
        // Request
        setDonChoDuyet(0);
        axiosClient.get(GET_CONTRACT_PENDING)
            .then(res => {
                if (res.status === 200 && Array.isArray(res.data)) {
                    // Lưu toàn bộ danh sách ContractPendingRes vào state
                    setServices(res.data);
                    console.log("res.data:", res.data);
                    // **Lọc và đếm theo trạng thái**
                    const pendingContracts = res.data.length;
                    console.log("pendingContracts:" + pendingContracts);
                    // Cập nhật State (sử dụng callback để cộng dồn nếu cần tổng hợp nhiều API)
                    setDonChoDuyet(prevState => prevState + pendingContracts);

                    console.log("endDate", res.data[0].contract.endDate);
                } else if (res.status === 204) {
                    // Không có hợp đồng chờ duyệt
                    setServices([]);
                    toast({
                        title: "Không có hợp đồng chờ duyệt",
                        description: "Hiện không có yêu cầu nào đang chờ xử lý.",
                    });
                } else {
                    console.warn("Phản hồi BE không mong đợi:", res);
                }
            })
            .catch(err => {
                console.error("Không kết nối được BE:", err.message);
                setServices([]);
                toast({
                    title: "Lỗi kết nối Backend",
                    description: "Không thể tải danh sách hợp đồng chờ duyệt.",
                    variant: "destructive",
                });
            });

        // Request
        setXeHoatDong(0);
        axiosClient.get(GET_VEHICLES)
            .then(res => {
                if (res.status === 200 && Array.isArray(res.data)) {
                    // Lưu toàn bộ danh sách ContractPendingRes vào state
                    // setServices(res.data);

                    // **Lọc và đếm theo trạng thái**
                    const vehicles = res.data.length;
                    console.log("Vehicles :" + vehicles);
                    // Cập nhật State (sử dụng callback để cộng dồn nếu cần tổng hợp nhiều API)
                    setXeHoatDong(prevState => prevState + vehicles);

                } else if (res.status === 204) {
                    // Không có hợp đồng chờ duyệt
                    setServices([]);
                    toast({
                        title: "Không có xe đang hoạt động",
                        description: "Hiện tại không có xe đang hoạt động trong hệ thống.",
                    });
                } else {
                    console.warn("Phản hồi BE không mong đợi:", res);
                }
            })
            .catch(err => {
                console.error("Không kết nối được BE:", err.message);
                setServices([]);
                toast({
                    title: "Lỗi kết nối Backend",
                    description: "Không thể tải danh sách xe.",
                    variant: "destructive",
                });
            });

        // Request
        setNhomQuanLy(0);
        axiosClient.get(GET_ALL_GROUPS)
            .then(res => {
                if (res.status === 200 && Array.isArray(res.data)) {
                    // Lưu toàn bộ danh sách ContractPendingRes vào state
                    // setServices(res.data);

                    // **Lọc và đếm theo trạng thái**
                    const groups = res.data.length;
                    console.log("Groups :" + groups);
                    // Cập nhật State (sử dụng callback để cộng dồn nếu cần tổng hợp nhiều API)
                    setNhomQuanLy(prevState => prevState + groups);

                } else if (res.status === 204) {
                    // Không có hợp đồng chờ duyệt
                    setServices([]);
                    toast({
                        title: "Không có nhóm hoạt động",
                        description: "Hiện tại không có nhóm đang hoạt động trong hệ thống.",
                    });
                } else {
                    console.warn("Phản hồi BE không mong đợi:", res);
                }
            })
            .catch(err => {
                console.error("Không kết nối được BE:", err.message);
                setServices([]);
                toast({
                    title: "Lỗi kết nối Backend",
                    description: "Không thể tải danh sách nhóm.",
                    variant: "destructive",
                });
            });

        // Request
        setDonDaDuyet(0);
        axiosClient.get(GET_CONTRACT_CONFIRMED)
            .then(res => {
                if (res.status === 200 && Array.isArray(res.data)) {
                    // Lưu toàn bộ danh sách ContractPendingRes vào state
                    // setServices(res.data);

                    // **Lọc và đếm theo trạng thái**
                    const confirmedContracts = res.data.length;
                    console.log("confirmedContracts :" + confirmedContracts);
                    // Cập nhật State (sử dụng callback để cộng dồn nếu cần tổng hợp nhiều API)
                    setDonDaDuyet(prevState => prevState + confirmedContracts);

                } else if (res.status === 204) {
                    // Không có hợp đồng chờ duyệt
                    setServices([]);
                    toast({
                        title: "Không có đơn đã duyệt nào",
                        description: "Hiện tại không có đơn đã duyệt nào trong hệ thống.",
                    });
                } else {
                    console.warn("Phản hồi BE không mong đợi:", res);
                }
            })
            .catch(err => {
                console.error("Không kết nối được BE:", err.message);
                setServices([]);
                toast({
                    title: "Lỗi kết nối Backend",
                    description: "Không thể tải danh sách hợp đồng đã duyệt.",
                    variant: "destructive",
                });
            });

    }, [refreshKey]);
    useEffect(() => {
        const getVehicles = async () => {
            await axiosClient.get(ALL_VEHICLES).then(res => {
                setVehicles(res.data);
            })
        }
        getVehicles();
    }, []);
    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const res = await axiosClient.get(LEAVE_GROUP);

                if (Array.isArray(res.data)) {
                    setLeaveRequests(res.data);


                    console.log("leaveRequests: " + res.data.length);
                    setDonChoDuyet(prevState => prevState + res.data.length);


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
    }, [LEAVE_GROUP, refreshKey]);

    const PATCH_CONTRACT = import.meta.env.VITE_PATCH_VERIFY_CONTRACT_PATH;
    const HANDLE_LEAVE_GROUP = import.meta.env.VITE_PATCH_LEAVE_GROUP_PATH;
    const UPDATE_REQUEST = import.meta.env.VITE_PATCH_GROUP_REQUEST_PATH;

    const handleLeaveApprove = async (contractId: number) => {
        const request = leaveRequests.find((r) => r.id === contractId);
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
            console.log("Request group ID:", request.id);
            console.log(request.groupMember?.group?.id)
            const res = await axiosClient.patch(HANDLE_LEAVE_GROUP, {
                // groupId: request.groupMember?.group?.id || request.groupId,
                requestId: request.id,
            });



            console.log(res)

            if (res.status === 200) {
                // Cập nhật FE
                setLeaveRequests((prev) => prev.filter((r) => r.id !== contractId));
                const updateRes = await axiosClient.patch(UPDATE_REQUEST, {
                    idRequestGroup: request.id,
                    idChoice: 1
                })
                toast({
                    title: "Đã duyệt yêu cầu",
                    description: "Nhân viên đã được rời khỏi nhóm thành công.",
                    variant: "success",
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
    }
    const handleLeaveReject = async (contractId: number) => {
        const request = leaveRequests.find((r) => r.id === contractId);
        if (!request) {
            toast({
                title: "Lỗi",
                description: "Không tìm thấy yêu cầu.",
                variant: "destructive",
            });
            return;
        }
        setLeaveRequests(prev =>
            prev.map(r =>
                r.id === contractId ? { ...r, status: "rejected" } : r
            )
        );
        setLeaveRequests(prev => prev.filter(r => r.id !== contractId));
        const updateRes = await axiosClient.patch(UPDATE_REQUEST, {
            idRequestGroup: request.id,
            idChoice: 0
        })
        toast({
            title: "Đã từ chối đơn",
            description: "Yêu cầu rời nhóm không được chấp nhận.",
        });
    }
    const handleApprove = async (contractId: number) => {
        try {
            const formData = new FormData();
            formData.append("declinedContractLink", "");
            const res = await axiosClient.patch(`${PATCH_CONTRACT}${contractId}/1`, formData);
            if (res.status === 200) {
                toast({
                    title: "Thành công",
                    description: "Hợp đồng đã được duyệt.",
                    variant: "success",
                });
                // Cập nhật lại UI
                setServices(prev => prev.filter(item => item.contract.contractId !== contractId));

                setRefreshKey(prev => prev - (donChoDuyet - (donChoDuyet - 1)));
            }
        } catch (err) {
            toast({
                title: "Lỗi",
                description: "Không thể duyệt hợp đồng. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    const handleReject = async (contractId: number) => {


        try {
            const formData = new FormData();
            // Tạo URL bản xem hợp đồng readonly
            const previewUrl = `${window.location.origin}/contract/view-only/${contractId}`;
            formData.append("declinedContractLink", previewUrl);
            console.log(previewUrl)

            // Gửi PATCH request với previewUrl dưới dạng request param
            const res = await axiosClient.patch(
                `${PATCH_CONTRACT}${contractId}/0`, formData
            );


            if (res.status === 200) {
                toast({
                    title: "Đã từ chối hợp đồng",
                    description: "Đường link xem hợp đồng đã được gửi cho người dùng.",
                    variant: "success",
                });

                // Cập nhật lại danh sách hợp đồng trên FE
                setServices(prev => prev.filter(item => item.contract.contractId !== contractId));

                setRefreshKey(prev => prev - (donChoDuyet - (donChoDuyet - 1)));
            }
        } catch (err) {
            toast({
                title: "Lỗi",
                description: "Không thể từ chối hợp đồng. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
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
                                    {services.length > 0 ? (
                                        services.map((item: any, index: number) => {
                                            const contract = item.contract;
                                            console.log(contract.imageContract);
                                            return (
                                                <Card
                                                    key={index}
                                                    className="bg-white text-black border-gray-300 mb-4 shadow-md"
                                                >
                                                    <CardHeader>
                                                        <CardTitle>Hợp đồng #{contract.contractId}</CardTitle>
                                                        <CardDescription className="text-gray-600">
                                                            <strong>Loại hợp đồng:</strong> {contract.contractType}
                                                        </CardDescription>
                                                    </CardHeader>

                                                    <CardContent className="space-y-2">
                                                        <p>
                                                            <Calendar className="inline w-4 h-4 mr-1 text-gray-600" />
                                                            <strong>Ngày bắt đầu:</strong> {contract.startDate}
                                                        </p>
                                                        <p>
                                                            <Calendar className="inline w-4 h-4 mr-1 text-gray-600" />
                                                            <strong>Ngày kết thúc:</strong> {contract.endDate}
                                                        </p>
                                                        <p>
                                                            <Activity className="inline w-4 h-4 mr-1 text-gray-600" />
                                                            <strong>Trạng thái:</strong> {contract.status}
                                                        </p>

                                                        {/* Thông tin nhóm và nhân viên phụ trách */}
                                                        {contract.group && (
                                                            <p>
                                                                <Users className="inline w-4 h-4 mr-1 text-gray-600" />
                                                                <strong>Nhóm:</strong> {contract.group.groupName}
                                                            </p>
                                                        )}
                                                        {contract.staff && (
                                                            <p>
                                                                <FileCheck
                                                                    className="inline w-4 h-4 mr-1 text-gray-600" />
                                                                <strong>Nhân viên phụ trách:</strong>{" "}
                                                                {contract.staff.hovaTen} ({contract.staff.email})
                                                            </p>
                                                        )}
                                                        {/* Danh sách người ký */}
                                                        {item.contractSignerList?.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="font-semibold mb-1">Người ký hợp đồng:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-700">
                                                                    {item.contractSignerList.map((signer: any) => (
                                                                        <li key={signer.id}>
                                                                            {signer.hovaTen} — {signer.email} — {signer.phone}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Nút thao tác */}
                                                        <div className="flex space-x-3 mt-4">
                                                            <Button
                                                                variant="default"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => handleApprove(contract.contractId)}
                                                            >
                                                                Duyệt
                                                            </Button>

                                                            <Button
                                                                variant="destructive"
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                                onClick={() => handleReject(contract.contractId)}
                                                            >
                                                                Không duyệt
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="border-gray-400 text-gray-700 hover:bg-gray-100 ml-auto"
                                                                onClick={() => {
                                                                    if (!contract.imageContract || contract.imageContract.trim() === "") {
                                                                        toast({
                                                                            title: "Không có link hợp đồng",
                                                                            description: "Hợp đồng này chưa có đường dẫn để xem.",
                                                                            variant: "destructive", // màu đỏ nhẹ
                                                                        });
                                                                    } else {
                                                                        window.open(contract.imageContract, "_blank");
                                                                    }
                                                                }}
                                                            >
                                                                Xem bản hợp đồng
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <p className="text-center text-gray-600 mt-4">
                                            Không có hợp đồng chờ duyệt
                                        </p>
                                    )}
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
                                                <p><strong>Người yêu
                                                    cầu:</strong> {req.groupMember?.users?.username || "Không rõ"}</p>
                                                <p><strong>Ngày gửi:</strong> {new Date(req.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={() => handleLeaveApprove(req.id)}>Duyệt</Button>
                                                <Button size="sm" variant="destructive"
                                                    onClick={() => handleLeaveReject(req.id)}>Từ chối</Button>
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
                                    {vehicles.map((vehicle) => (
                                        <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
                                    ))}
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