import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Car,
    FileText,
    Users,
    Calendar,
    Download,
    Bell,
    Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserDropdown from "@/components/UserDropdown";
import VehicleBooking from "@/components/VehicleBooking";
import ScheduleCards from "@/components/ScheduleCards";
import { useEffect, useState } from "react";
import axiosClient from "@/api/axiosClient";
import { useToast } from "@/hooks/use-toast";

export default function CoOwnerDashboard() {
    const HISTORY_CONTRACT = import.meta.env.VITE_CONTRACT_HISTORY_PATH
    const navigate = useNavigate();
    const { toast } = useToast();
    const [registrations, setRegistrations] = useState([]);
    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "default";
            case "pending":
                return "secondary";
            case "rejected":
                return "destructive";
            default:
                return "outline";
        }
    };
    const CURRENT_USER = import.meta.env.VITE_AUTH_CURRENT

    useEffect(() => {
        axiosClient.get(CURRENT_USER).then(
            (res) => {
                if (res.data.role.roleName !== "co-owner") {
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
        const fetchData = async () => {
            try {
                const res = await axiosClient.get(HISTORY_CONTRACT);
                const mapped = res.data.map((item) => ({
                    id: `Contract-${item.id}`,
                    vehicleName: item.vehicle || "Chưa cập nhật",
                    ownership: item.ownership || "Chưa cập nhật",
                    status: item.status || "pending",
                    date: item.date,
                }))
                setRegistrations(mapped);
            } catch (err) {
                console.error("Lỗi fetch:", err);
            }
        };
        fetchData();
    }, []);
    const getStatusText = (status: string) => {
        switch (status) {
            case "approved":
                return "Đã duyệt";
            case "pending":
                return "Đang xử lý";
            case "rejected":
                return "Từ chối";
            default:
                return "Không xác định";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-gradient-primary text-white p-4 shadow-glow">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Car className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold">EcoShare</h1>
                            <p className="text-sm opacity-90">Màn hình chính chủ sở hữu</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/co-owner/group-registration">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <Plus className="h-4 w-4 mr-2" />
                                Đăng ký nhóm
                            </Button>
                        </Link>
                        <UserDropdown />
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6 space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-elegant">
                        <CardHeader className="text-center">
                            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                            <CardTitle>Nhóm của tôi</CardTitle>
                            <CardDescription>
                                Quản lý các nhóm đồng sở hữu đã tham gia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" onClick={() => navigate('/co-owner/groups')}>
                                Xem nhóm
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-elegant">
                        <CardHeader className="text-center">
                            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                            <CardTitle>Hợp đồng</CardTitle>
                            <CardDescription>
                                Xem và tải xuống hợp đồng đồng sở hữu
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full"
                                onClick={() => navigate('/co-owner/contracts')}>
                                Xem hợp đồng
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Vehicle Booking */}
                <VehicleBooking />

                {/* Schedule list + Check-in/out */}
                <ScheduleCards />

                {/* Registration History */}
                <Card className="shadow-elegant">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Lịch sử đăng ký xe</span>
                        </CardTitle>
                        <CardDescription>
                            Theo dõi trạng thái các đơn đăng ký xe điện
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {registrations.map((reg) => (
                                <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="font-semibold">{reg.vehicle}</h3>
                                            <Badge variant={getStatusColor(reg.status) as any}>
                                                {getStatusText(reg.status)}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            <span>Mã: {reg.id}</span>
                                            <span className="mx-2">•</span>
                                            <span>Tỷ lệ sở hữu: {reg.ownership}</span>
                                            <span className="mx-2">•</span>
                                            <span>Ngày đăng ký: {reg.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}