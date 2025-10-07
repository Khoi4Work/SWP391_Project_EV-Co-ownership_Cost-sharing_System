import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Car,
    FileText,
    Users,
    Calendar,
    Download,
    MessageCircle,
    Bell,
    Plus
} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import ChatBox from "@/components/ChatBox";
import UserDropdown from "@/components/UserDropdown";
import VehicleBooking from "@/components/VehicleBooking";
import {useState} from "react";

export default function CoOwnerDashboard() {
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    const registrations = [
        {
            id: "VX-001",
            vehicle: "VinFast VF8",
            status: "approved",
            ownership: "35%",
            date: "2024-01-15",
            contract: "contract-vx001.pdf"
        },
        {
            id: "VX-002",
            vehicle: "Tesla Model Y",
            status: "pending",
            ownership: "40%",
            date: "2024-01-20",
            contract: null
        }
    ];

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
                        <Car className="h-8 w-8"/>
                        <div>
                            <h1 className="text-2xl font-bold">EcoShare</h1>
                            <p className="text-sm opacity-90">Bảng điều khiển chủ sở hữu</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/co-owner/vehicle-registration">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <Plus className="h-4 w-4 mr-2"/>
                                Đăng ký xe
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Bell className="h-4 w-4"/>
                        </Button>
                        <UserDropdown/>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6 space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-elegant">
                        <CardHeader className="text-center">
                            <Users className="h-8 w-8 text-primary mx-auto mb-2"/>
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
                            <FileText className="h-8 w-8 text-primary mx-auto mb-2"/>
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
                <VehicleBooking/>

                {/* Registration History */}
                <Card className="shadow-elegant">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5"/>
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

                {/* AI Chat Button */}
                <div className="fixed bottom-6 right-6">
                    <Button
                        onClick={() => setShowChat(true)}
                        size="lg"
                        className="rounded-full bg-gradient-primary hover:shadow-glow shadow-lg"
                    >
                        <MessageCircle className="h-5 w-5 mr-2"/>
                        Hỗ trợ AI
                    </Button>
                </div>

                {/* Chat Box */}
                {showChat && (
                    <ChatBox
                        isOpen={showChat}
                        onClose={() => setShowChat(false)}
                        userType="co-owner"
                    />
                )}
            </div>
        </div>
    );
}