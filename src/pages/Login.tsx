import {useState} from "react";
import axios from "axios";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Link, useNavigate} from "react-router-dom";
import {useToast} from "@/hooks/use-toast";
import {Car, ArrowLeft} from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userTypes, setUserTypes] = useState<string[]>([]);
    const navigate = useNavigate();
    const {toast} = useToast();

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
            "co-owner": 1, // 1 = user
            "user": 1
        };
        const selectedType = userTypes[0];
        const roleId = roleMap[selectedType];
        try {
            // Thay đổi URL này thành endpoint backend thực tế của bạn
            const response = await axios.post("http://localhost:8080/auth/login", {
                email,
                password,
                roleId,
            });
            const hasValidData = Boolean(response?.data && (response.data.token || response.data.id));
            console.log(response.data.token);
            if (!hasValidData) {
                toast({
                    title: "Lỗi đăng nhập",
                    description: "Tài khoản hoặc mật khẩu không đúng.",
                    variant: "destructive",
                });
                return;
            }
            console.log(response.data)
            // Xử lý response backend trả về
            toast({
                title: "Đăng nhập thành công",
                description: `Chào mừng bạn đến với EcoShare!`,
            });
            // Điều hướng theo loại tài khoản
            if (selectedType === "co-owner") {
                navigate("/co-owner/dashboard");
            } else if (selectedType === "staff") {
                navigate("/staff/dashboard");
            } else if (selectedType === "admin") {
                navigate("/admin/dashboard");
            }
        } catch (err) {
            // Xử lý lỗi trả về từ backend
            toast({
                title: "Lỗi đăng nhập",
                description:
                    err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-white hover:bg-white/10"
            >
                <ArrowLeft className="h-4 w-4 mr-2"/>
                Quay lại
            </Button>
            <Card className="w-full max-w-md shadow-glow border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <Car className="h-8 w-8 text-primary"/>
                        <span className="text-2xl font-bold text-primary">EcoShare</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
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
                                    {value: "co-owner", label: "Chủ sở hữu (Co-owner)"},
                                    {value: "staff", label: "Nhân viên (Staff)"},
                                    {value: "admin", label: "Quản trị viên (Admin)"}
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
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow">
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Chưa có tài khoản? </span>
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Đăng ký ngay
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
