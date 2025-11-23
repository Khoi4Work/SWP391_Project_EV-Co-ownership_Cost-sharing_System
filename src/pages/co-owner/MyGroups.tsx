import {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Users, ArrowLeft, LogOut, AlertTriangle} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useSEO} from "@/hooks/useSEO";
import axiosClient from "@/api/axiosClient";

export default function MyGroups() {
    useSEO({
        title: "Nhóm của tôi | EcoShare",
        description: "Quản lý các nhóm đồng sở hữu bạn tham gia: chủ sở hữu, vai trò và thành viên.",
        canonicalPath: "/co-owner/groups",
    });
    const GET_GROUPS = import.meta.env.VITE_GET_BELONGED_GROUP_PATH;
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const {toast} = useToast();
    const [leaveRequestDialogOpen, setLeaveRequestDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string | number>("");
    const [groups, setGroups] = useState<any[]>([]);
    const AUTH_CURRENT = import.meta.env.VITE_AUTH_CURRENT;
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axiosClient.get(AUTH_CURRENT);

                setCurrentUserId(res.data.id);
            } catch (err) {
                console.error("Lỗi lấy user hiện tại:", err);
            }
        };
        fetchCurrentUser();
    }, []);
    const handleRequestLeave = (groupId: number) => {
        setSelectedGroup(groupId);
        setLeaveRequestDialogOpen(true);
    };
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axiosClient.get(GET_GROUPS);
                const data = res?.data;

                if (!Array.isArray(data)) {
                    setGroups([]);
                    return;
                }
                setGroups(data);
            } catch (error) {
                console.error("❌ Lỗi khi gọi API /group/get/current:", error);
                setGroups([]);
            }
        };

        fetchGroups();
    }, []);
    const REQUEST_GROUP = import.meta.env.VITE_REQUEST_GROUP_PATH;
    const confirmRequestLeave = async () => {
        try {
            console.log("⏳ Gửi yêu cầu rời nhóm...");

            // 1. Lấy group hiện tại
            const group = groups.find(g => g.group.groupId === selectedGroup);
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
            // if (!currentUserId) {
            //     console.error("❌ Không tìm thấy userId trong accessToken:", tokenUser);
            //     toast({
            //         title: "Lỗi xác thực",
            //         description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
            //         variant: "destructive",
            //     });
            //     return;
            // }

            // 3. Gửi request rời nhóm
            console.log("📤 Đang gửi request rời nhóm với payload:", {
                groupId: group.group.groupId,
                nameRequestGroup: `Yêu cầu rời nhóm`,
                descriptionRequestGroup: "Người dùng yêu cầu rời nhóm",
                // userId: currentUserId,
            });

            const data = await axiosClient.post(`${REQUEST_GROUP}`, {
                groupId: group.group.groupId,
                // userId: currentUserId,
                nameRequestGroup: `Yêu cầu rời nhóm`,
                descriptionRequestGroup: "Người dùng yêu cầu rời nhóm",
                // statusRequestGroup: "pending"
            });

            console.log("✅ Gửi request thành công!");
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
    if (currentUserId === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang tải thông tin người dùng...</p>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-gradient-primary text-white p-4 shadow-glow">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/co-owner/dashboard">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2"/>
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
                        {groups.length === 0 ? (
                            <div
                                className="col-span-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <p className="text-lg text-muted-foreground">
                                    Bạn đang không ở trong nhóm nào. Xin vui lòng tạo nhóm bằng nút "Đăng ký nhóm" ở màn
                                    hình chính hoặc bấm vào nút dưới đây.
                                </p>
                                <Button
                                    variant="default"
                                    onClick={() => navigate("/co-owner/group-registration")}
                                >
                                    Tạo nhóm
                                </Button>
                            </div>
                        ) : (
                            groups.map((g) => {
                                const myRole = g.roleInGroup || "member";
                                const status = g.status || "active";
                                const ownership = g.ownershipPercentage ?? 0;
                                const groupName = g.group?.groupName || "Không có tên nhóm";
                                const createdAt = g.group?.createdAt
                                    ? new Date(g.group.createdAt).toLocaleDateString("vi-VN")
                                    : "-";
                                const createdAtDate = g.group?.createdAt ? new Date(g.group.createdAt) : null;
                                const endAt = createdAtDate
                                    ? new Date(
                                        createdAtDate.getFullYear() + 3,
                                        createdAtDate.getMonth(),
                                        createdAtDate.getDate()
                                    ).toLocaleDateString("vi-VN")
                                    : "-";
                                // Lấy các member khác (trừ chính user hiện tại)
                                const otherMembers = g.members
                                    ?.filter((m) => m.users.id !== currentUserId)
                                    .map((m) => ({
                                        id: m.users.id,
                                        name: m.users.hovaTen,
                                        avatar: m.users.avatar ?? "",
                                    })) || [];

                                return (
                                    <Card key={g.group.groupId} className="relative hover:shadow-elegant transition">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-5 w-5 text-primary"/>
                                                    <div>
                                                        <CardTitle className="text-base">{groupName}</CardTitle>
                                                        <CardDescription>
                                                            <b>Vai trò:</b> <Badge
                                                            className="ml-1">{myRole.toUpperCase()}</Badge> | Trạng
                                                            thái: {status}
                                                        </CardDescription>
                                                        <CardDescription>
                                                            <b>Ngày tạo:</b> {createdAt} <br/>
                                                            <b>Ngày kết thúc:</b> {endAt} <br/>
                                                            <b>Sở hữu:</b> {ownership}%
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex -space-x-2">
                                                    {otherMembers.slice(0, 5).map((m) => (
                                                        <Avatar key={m.id} className="border">
                                                            <AvatarImage src={m.avatar} alt={`Avatar ${m.name}`}
                                                                         loading="lazy"/>
                                                            <AvatarFallback>{m.name?.charAt(0) || "?"}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    Thành viên: {otherMembers.map((m) => m.name).slice(0, 3).join(", ")}
                                                    {otherMembers.length > 3 ? ` và +${otherMembers.length - 3} nữa` : ""}
                                                </p>

                                                <div className="flex items-center text-md">
                                                    <span style={{marginRight: "5px"}}>Phần trăm sở hữu của bạn:</span>
                                                    <span className="font-semibold">{ownership}%</span>
                                                </div>

                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => navigate(`/co-owner/groups/${g.group.groupId}`)}
                                                    >
                                                        Xem chi tiết
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRequestLeave(g.group.groupId)}
                                                        className="px-3"
                                                    >
                                                        <LogOut className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </section>

                </main>
            </div>

            {/* Leave Request Dialog */}
            <Dialog open={leaveRequestDialogOpen} onOpenChange={setLeaveRequestDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive"/>
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
