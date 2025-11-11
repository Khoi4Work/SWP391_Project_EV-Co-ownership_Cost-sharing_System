import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Car, ArrowLeft } from "lucide-react";
import axiosClient from "@/api/axiosClient";

const USE_MOCK = false; // Bật DB ảo cho login

const MOCK_USERS = [
    { email: "coowner@test.com", password: "123", id: 2, hovaten: "Nguyễn Văn A", role: { roleName: "co-owner" }, token: "mock-token-coowner" },
    { email: "coowner2@test.com", password: "123", id: 4, hovaten: "Trần Thị B", role: { roleName: "co-owner" }, token: "mock-token-coowner-2" },
    // User có quá hạn thanh toán để test
    { email: "overdue@test.com", password: "123", id: 5, hovaten: "Người Dùng Quá Hạn", role: { roleName: "co-owner" }, token: "mock-token-overdue", hasOverdue: true },
    { email: "staff@test.com", password: "123", id: 3, hovaten: "Nhân viên Test", role: { roleName: "staff" }, token: "mock-token-staff" },
    { email: "admin@test.com", password: "123", id: 1, hovaten: "Admin Test", role: { roleName: "admin" }, token: "mock-token-admin" },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userTypes, setUserTypes] = useState<string[]>([]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const LOGIN = import.meta.env.VITE_AUTH_LOGIN;
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || userTypes.length === 0) {
            toast({
                title: "Lỗi đăng nhập",
                description: "Vui lòng điền đầy đủ thông tin",
                variant: "destructive",
            });
            return;
        }

        const roleMap: Record<string, number> = {
            "admin": 3,
            "staff": 4,
            "co-owner": 1,
            "user": 1
        };
        const selectedType = userTypes[0];
        const roleId = roleMap[selectedType];

        try {
            let response: any;

            if (USE_MOCK) {
                const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);

                if (!mockUser) {
                    toast({
                        title: "Lỗi đăng nhập",
                        description: "Tài khoản hoặc mật khẩu không đúng.",
                        variant: "destructive",
                    });
                    return;
                }

                const roleMatch =
                    (selectedType === "co-owner" && mockUser.role.roleName === "co-owner") ||
                    (selectedType === "staff" && mockUser.role.roleName === "staff") ||
                    (selectedType === "admin" && mockUser.role.roleName === "admin");

                if (!roleMatch) {
                    toast({
                        title: "Lỗi đăng nhập",
                        description: "Loại tài khoản không khớp. Vui lòng chọn đúng loại tài khoản.",
                        variant: "destructive",
                    });
                    return;
                }

                response = { data: mockUser };
            } else {
                response = await axiosClient.post(`${LOGIN}/${roleId}`, {
                    email,
                    password,
                });
            }

            const hasValidData = Boolean(response?.data && (response.data.token || response.data.id));

            if (!hasValidData) {
                toast({
                    title: "Lỗi đăng nhập",
                    description: "Tài khoản hoặc mật khẩu không đúng.",
                    variant: "destructive",
                });
                return;
            }

            const token = response.data.token;
            const userId = response.data.id;
            const hovaten = response.data.hovaTen;
            const role = response.data.role.roleName;

            // Lưu token tạm thời để có thể gọi API kiểm tra quá hạn
            localStorage.setItem("accessToken", token);
            localStorage.setItem("userId", userId.toString());
            localStorage.setItem("hovaten", hovaten);

            // Kiểm tra quá hạn thanh toán (chỉ cho co-owner)
            if (role.toLowerCase() === "co-owner" || role.toLowerCase() === "user") {
                let hasOverdueFee = false;

                // Mock: Kiểm tra nếu user có flag hasOverdue
                if (USE_MOCK && response.data.hasOverdue) {
                    hasOverdueFee = true;
                } else if (!USE_MOCK) {
                    // Chỉ check với BE thật khi không dùng mock
                    try {
                        // Lấy danh sách groupIds của user
                        const groupIdsRes = await axiosClient.get("/groupMember/getGroupIdsByUserId", {
                            params: { userId },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const groupIds: number[] = Array.isArray(groupIdsRes.data) ? groupIdsRes.data : [];

                        // Kiểm tra quá hạn thanh toán trong tất cả các nhóm
                        for (const groupId of groupIds) {
                            try {
                                const feeRes = await axiosClient.get(`/api/fund-fee/group/${groupId}/current-month`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                const fees = feeRes.data?.fees || [];
                                const userOverdueFee = fees.find((fee: any) =>
                                    fee.userId === userId &&
                                    fee.status === "PENDING" &&
                                    fee.isOverdue === true
                                );
                                if (userOverdueFee) {
                                    hasOverdueFee = true;
                                    break;
                                }
                            } catch (feeErr) {
                                console.warn(`Không thể kiểm tra quá hạn cho group ${groupId}:`, feeErr);
                            }
                        }
                    } catch (overdueErr: any) {
                        console.warn("Không thể kiểm tra quá hạn thanh toán:", overdueErr);
                        // Nếu không kiểm tra được, vẫn cho đăng nhập (tránh block user do lỗi API)
                    }
                }
                // //
                //                 if (hasOverdueFee) {
                //                     // Xóa token và thông tin user nếu quá hạn
                //                     localStorage.removeItem("accessToken");
                //                     localStorage.removeItem("userId");
                //                     localStorage.removeItem("hovaten");
                //                     toast({
                //                         title: "⚠️ Tài khoản bị khóa",
                //                         description: "Tài khoản của bạn đã quá hạn thanh toán. Vui lòng liên hệ admin để thanh toán.",
                //                         variant: "destructive",
                //                     });
                //                     return; // Không cho đăng nhập
                //                 }
            }
            console.log("Role:", role);
            console.log("Token:", token);
            console.log("User ID:", userId);

            toast({
                title: "Đăng nhập thành công",
                description: `Chào mừng ${hovaten} đến với EcoShare!`,
            });

            console.log("Role from backend:", role);

            if (role.toLowerCase() === "staff") {
                navigate("/staff/dashboard");
            } else if (role.toLowerCase() === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/co-owner/dashboard");
            }
        } catch (err) {
            toast({
                title: "Lỗi đăng nhập",
                description:
                    err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
                variant: "destructive",
            });
        }
        // ✅ BỎ finally block
        finally {
            navigate("/co-owner/dashboard")
        }
    };


    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-white hover:bg-white/10"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
            </Button>
            <Card className="w-full max-w-md shadow-glow border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <Car className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-primary">EcoShare</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Đăng nhập để truy cập hệ thống quản lý xe điện
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Loại tài khoản</Label>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { value: "co-owner", label: "Chủ sở hữu (Co-owner)" },
                                    { value: "staff", label: "Nhân viên (Staff)" },
                                    { value: "admin", label: "Quản trị viên (Admin)" }
                                ].map((type) => (
                                    <div key={type.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={type.value}
                                            checked={userTypes.includes(type.value)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setUserTypes([type.value]); // Only allow one selection
                                                } else {
                                                    setUserTypes([]);
                                                }
                                            }}
                                        />
                                        <Label htmlFor={type.value} className="text-sm font-normal">
                                            {type.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu của bạn"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-primary hover:shadow-glow text-white rounded-md p-2"
                        >
                            Đăng nhập
                        </button>

                        {/*<Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow">*/}
                        {/*    Đăng nhập*/}
                        {/*</Button>*/}
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Chưa có tài khoản ? </span>
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            👉Đăng ký ngay
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
