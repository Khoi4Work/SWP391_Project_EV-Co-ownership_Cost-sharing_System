import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Users, ArrowLeft, LogOut, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import axiosClient from "@/api/axiosClient";
export default function MyGroups() {
    useSEO({
        title: "Nhóm của tôi | EcoShare",
        description: "Quản lý các nhóm đồng sở hữu bạn tham gia: chủ sở hữu, vai trò và thành viên.",
        canonicalPath: "/co-owner/groups",
    });
    const tokenUser = JSON.parse(localStorage.getItem("accessToken") || "{}");
    const currentUserId = tokenUser?.id;
    const navigate = useNavigate();
    const { toast } = useToast();
    const [leaveRequestDialogOpen, setLeaveRequestDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string | number>("");
    const [groups, setGroups] = useState<any[]>([]);

    const handleRequestLeave = (groupId: number) => {
        setSelectedGroup(groupId);
        setLeaveRequestDialogOpen(true);
    };
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                console.log("⏳ Đang gọi API: /group/get/current...");
                const res = await axiosClient.get("/group/get/current");
                const data = res?.data;

                // Kiểm tra dữ liệu trả về có đúng dạng mảng không
                if (!Array.isArray(data)) {
                    console.warn("⚠️ API không trả về mảng group:", data);
                    setGroups([]);
                    return;
                }

                console.log("✅ Danh sách group nhận được:", data);
                setGroups(data);
            } catch (error) {
                console.error("❌ Lỗi khi gọi API /group/get/current:", error);
                setGroups([]);
            }
        };

        fetchGroups();
    }, []);


    const confirmRequestLeave = async () => {
        try {
            console.log("⏳ Gửi yêu cầu rời nhóm...");

            // 1. Lấy group hiện tại
            const group = groups.find((g) => g.id === selectedGroup);
            if (!group) {
                console.warn("⚠️ Không tìm thấy group trong dữ liệu trả về:", groups);
                toast({
                    title: "Lỗi",
                    description: "Bạn hiện không nằm trong nhóm nào.",
                    variant: "destructive"
                });
                setLeaveRequestDialogOpen(false);
                return;
            }

            // 2. Lấy user từ token/localStorage
            if (!currentUserId) {
                console.error("❌ Không tìm thấy userId trong accessToken:", tokenUser);
                toast({
                    title: "Lỗi xác thực",
                    description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
                    variant: "destructive",
                });
                return;
            }

            // 3. Gửi request rời nhóm
            console.log("📤 Đang gửi request rời nhóm với payload:", {
                groupId: group.id,
                userId: currentUserId,
            });

            await axiosClient.post("/group/request", {
                groupId: group.id,
                userId: currentUserId,
                nameRequestGroup: `Yêu cầu rời nhóm - ${currentUserId}`,
                descriptionRequestGroup: "Người dùng yêu cầu rời nhóm",
                statusRequestGroup: "pending"
            });

            console.log("✅ Gửi request thành công!");

            toast({
                title: "Đã gửi yêu cầu",
                description: `Yêu cầu rời nhóm đã được gửi đến nhân viên xử lý.`,
            });

            setLeaveRequestDialogOpen(false);

        } catch (error: any) {
            console.error("❌ Lỗi khi gửi request rời nhóm:", error);

            // Phân loại lỗi giống ở đoạn trước
            if (error.response) {
                console.error("📌 Backend trả lỗi:", {
                    status: error.response.status,
                    data: error.response.data,
                });
            } else if (error.request) {
                console.error("📌 Không nhận được phản hồi từ server:", error.request);
            } else {
                console.error("📌 Lỗi khác:", error.message);
            }

            toast({
                title: "Lỗi",
                description: "Không thể gửi yêu cầu. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };



    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-gradient-primary text-white p-4 shadow-glow">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/co-owner/dashboard">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Nhóm của tôi</h1>
                            <p className="text-sm opacity-90">Quản lý các nhóm đồng sở hữu xe bạn tham gia</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6">
                <main>
                    <section
                        aria-label="Danh sách nhóm"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {groups
                            .filter((g) => g.users.some((u) => u.id === currentUserId)) // ✅ chỉ lấy nhóm user tham gia
                            .map((g) => {
                                const owner = g.users.find((u) => u.id === g.ownerId)!;
                                const me = g.users.find((u) => u.id === currentUserId);
                                const myRole = me?.role ?? "member";
                                const otherMembers = g.users.filter((u) => u.id !== g.ownerId);

                                return (
                                    <Card key={g.id} className="relative hover:shadow-elegant transition">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <CardTitle className="text-base">{g.name}</CardTitle>
                                                        <CardDescription>
                                                            Chủ sở hữu: {owner.name}{" "}
                                                            <Badge className="ml-1">Admin</Badge>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    Vai trò: {myRole === "admin" ? "Admin" : "Member"}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex -space-x-2">
                                                    {otherMembers.slice(0, 5).map((m) => (
                                                        <Avatar key={m.id} className="border">
                                                            <AvatarImage
                                                                src={m.avatar}
                                                                alt={`Ảnh đại diện ${m.name}`}
                                                                loading="lazy"
                                                            />
                                                            <AvatarFallback>{m.name?.charAt(0) || "?"}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    Thành viên:{" "}
                                                    {otherMembers
                                                        .map((m) => m.name)
                                                        .slice(0, 3)
                                                        .join(", ")}
                                                    {otherMembers.length > 3
                                                        ? ` và +${otherMembers.length - 3} nữa`
                                                        : ""}
                                                </p>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Quỹ nhóm:</span>
                                                    <span className="font-semibold">
                                                        {Number(g.fund || 0).toLocaleString("vi-VN")} VNĐ
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => navigate(`/co-owner/groups/${g.id}`)}
                                                    >
                                                        Xem chi tiết
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRequestLeave(g.id)}
                                                        className="px-3"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </section>
                </main>
            </div>

            {/* Leave Request Dialog */}
            <Dialog open={leaveRequestDialogOpen} onOpenChange={setLeaveRequestDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Yêu cầu rời nhóm
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn gửi yêu cầu rời nhóm này không? Yêu cầu sẽ được gửi đến staff để xét
                            duyệt.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            <strong>Lưu ý:</strong> Chỉ staff mới có quyền phê duyệt yêu cầu rời nhóm của bạn.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setLeaveRequestDialogOpen(false);
                            setSelectedGroup("");
                        }}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={confirmRequestLeave}>
                            Gửi yêu cầu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
