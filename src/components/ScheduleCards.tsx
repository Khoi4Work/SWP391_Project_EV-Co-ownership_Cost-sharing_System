import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Car, Clock, User, AlertCircle } from "lucide-react";
import axiosClient from "@/api/axiosClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
type ScheduleItem = {
    scheduleId: number;
    startTime: string; // ISO
    endTime: string;   // ISO
    vehicleName?: string;
    vehiclePlate?: string;
    userName?: string;
    userId?: number; // Thêm userId để kiểm tra quyền check in/out
    hasCheckIn: boolean;
    hasCheckOut: boolean;
    checkInTime?: string; // ISO
    checkOutTime?: string; // ISO
};

// ===== Detail types (phù hợp BE) =====
type CheckInDetailResponse = {
    checkInId: number;
    checkInTime: string;
    condition: string;
    notes: string;
    images: string;
};

type CheckOutDetailResponse = {
    checkOutId: number;
    checkOutTime: string;
    condition: string;

    notes: string;
    images: string;
};

type ScheduleDetailResponse = {
    scheduleId: number;
    vehicleName?: string;
    vehiclePlate?: string;
    userName?: string;
    startTime: string;
    endTime: string;
    scheduleStatus?: string;
    checkIn?: CheckInDetailResponse | null;
    checkOut?: CheckOutDetailResponse | null;
};

type CheckInForm = {
    condition: string;
    notes: string;
    images: string[]; // base64 strings
};

type CheckOutForm = {
    condition: string;
    notes: string;
    images: string[];
};

const beBaseUrl = "http://localhost:8080";


function formatDateTime(iso?: string) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    })}`;
}

async function fileListToBase64(files: FileList | null): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const tasks: Promise<string>[] = [];
    for (const f of Array.from(files)) {
        tasks.push(new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(f);
        }));
    }
    return Promise.all(tasks);
}

// Chuẩn hóa item từ BE về dạng ScheduleItem để UI hoạt động ổn định
function normalizeScheduleItem(raw: any): ScheduleItem | null {
    if (!raw) return null;

    const scheduleId = raw.scheduleId ?? raw.id ?? raw.scheduleID;
    const startTime = raw.startTime ?? raw.start ?? raw.start_time;
    const endTime = raw.endTime ?? raw.end ?? raw.end_time;

    const vehicleBrand = raw.vehicle?.brand ?? raw.brand;
    const vehicleModel = raw.vehicle?.model ?? raw.model;
    const vehicleName = raw.vehicleName ?? (vehicleBrand && vehicleModel ? `${vehicleBrand} ${vehicleModel}` : undefined);
    const vehiclePlate = raw.vehiclePlate ?? raw.plateNo ?? raw.licensePlate ?? raw.vehicle?.plateNo ?? raw.vehicle?.licensePlate;

    const userId = raw.userId ?? raw.renterId ?? raw.bookedById ?? raw.user?.id ?? raw.user?.userId;
    const userName = raw.userName ?? raw.renterName ?? raw.bookedByName ?? raw.user?.fullName ?? raw.user?.name;

    // Tìm checkIn object với nhiều tên field khác nhau
    const checkInObj = raw.checkIn ?? raw.checkin ?? raw.check_in ?? raw.checkInDetail;
    const checkOutObj = raw.checkOut ?? raw.checkout ?? raw.check_out ?? raw.checkOutDetail;

    // Tìm checkInTime từ nhiều nguồn
    const checkInTime = raw.checkInTime ??
        checkInObj?.checkInTime ??
        checkInObj?.time ??
        checkInObj?.createdAt ??
        checkInObj?.checkInDate;

    // Tìm checkOutTime từ nhiều nguồn
    const checkOutTime = raw.checkOutTime ??
        checkOutObj?.checkOutTime ??
        checkOutObj?.time ??
        checkOutObj?.createdAt ??
        checkOutObj?.checkOutDate;

    // Xác định hasCheckIn: ưu tiên flag từ BE, nếu không có thì check object hoặc time
    const hasCheckIn = (raw.hasCheckIn !== undefined && raw.hasCheckIn !== null)
        ? Boolean(raw.hasCheckIn)
        : (checkInObj != null && typeof checkInObj === 'object') // Có object checkIn
            ? true
            : (checkInTime != null && checkInTime !== ""); // Có thời gian checkIn

    // Xác định hasCheckOut tương tự
    const hasCheckOut = (raw.hasCheckOut !== undefined && raw.hasCheckOut !== null)
        ? Boolean(raw.hasCheckOut)
        : (checkOutObj != null && typeof checkOutObj === 'object') // Có object checkOut
            ? true
            : (checkOutTime != null && checkOutTime !== ""); // Có thời gian checkOut

    if (scheduleId == null || !startTime || !endTime) return null;

    return {
        scheduleId,
        startTime: String(startTime),
        endTime: String(endTime),
        vehicleName,
        vehiclePlate,
        userName,
        userId: userId != null ? Number(userId) : undefined,
        hasCheckIn,
        hasCheckOut,
        checkInTime: checkInTime ? String(checkInTime) : undefined,
        checkOutTime: checkOutTime ? String(checkOutTime) : undefined,
    } as ScheduleItem;
}

function RegisterVehicleServiceModal({ open, onClose }) {
    const navigate = useNavigate();
    const [vehicleServices, setVehicleServices] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [customService, setCustomService] = useState("");
    const { toast } = useToast();
    // ✅ Gọi API lấy danh sách dịch vụ
    useEffect(() => {
        if (open) {
            axiosClient
                .get("/vehicle/service")
                .then(res => {
                    if (res.status === 200) {
                        setVehicleServices(res.data);
                    }
                })
                .catch(() => {
                    toast({
                        title: "Lỗi tải danh sách dịch vụ",
                        description: "Không thể tải danh sách dịch vụ xe.",
                        variant: "destructive",
                    });
                });
        }
    }, [open]);

    const CREATE_DECISION = import.meta.env.VITE_PATCH_CREATE_DECISION_PATH;
    const idGroup = Number(localStorage.getItem("groupId"));
    const handleRegister = async () => {
        if (!selectedService) {
            toast({
                title: "Chưa chọn dịch vụ",
                description: "Vui lòng chọn một dịch vụ trước khi đăng ký.",
                variant: "destructive",
            });
            return;
        }
        navigate("/service-detail", { state: { selectedService } });
        // try {
        //     // 1. tạo DecisionVote
        //     const decisionReq = {
        //         decisionName: selectedService,
        //         description: `${selectedService} request`,
        //         // nếu DecisionVoteReq cần thêm field (ví dụ serviceId), thêm ở đây
        //     };

        //     const res = await axiosClient.post(`${CREATE_DECISION}${idGroup}`, decisionReq);
        //     console.log(res.data.creator.status)
        //     if (res.status !== 201) {
        //         throw new Error("Không thể tạo quyết định mới");
        //     }

        //     console.log(res)
        //     const voters = res.data.voters;
        //     const creator = res.data.creator;

        //     console.log("✅ Full decisionVote:", res.data);

        //     // 1️⃣ Creator name & group name (có thể null)
        //     const creatorName =
        //         creator?.createdBy?.users?.hovaTen || "Một thành viên";
        //     const groupNameFromRes =
        //         creator?.createdBy?.group?.groupName || "Nhóm";
        //     const decisionName = creator?.decisionName || selectedService;

        //     // 2️⃣ Lấy danh sách email từ decisionVoteDetails
        //     const emailList =
        //         voters?.map(
        //             (detail: any) => detail?.groupMember?.users?.email
        //         ).filter((email: string | undefined) => email) || [];

        //     console.log("✅ Email list:", emailList);

        //     // 4. Nếu không có email thì vẫn xử lý (thông báo hoặc log)
        //     if (emailList.length === 0) {
        //         console.warn("Không tìm thấy email co-owner trong voters:", voters);
        //     }

        //     // 5. Gửi email cho từng co-owner (POST /email/send)
        //     //    Tạo template đúng format: "group này - member này tạo service này. Xin vui lòng vào link này để vote."
        //     const emailPayloads = emailList.map((email: string) => ({
        //         email,
        //         subject: `Yêu cầu biểu quyết dịch vụ: ${decisionName}`,
        //         url: `${window.location.origin}/vote/${creator.id}`,
        //         template: `Nhóm ${groupNameFromRes} - thành viên ${creatorName} tạo yêu cầu ${decisionName}. Xin vui lòng vào link này ${window.location.origin}/vote/${creator.id} để vote.`
        //     }));

        //     // Gửi song song; bắt lỗi từng request
        //     const sendResults = await Promise.allSettled(
        //         emailPayloads.map((payload) => axiosClient.post("/email/send", payload))
        //     );

        //     // Kiểm tra kết quả gửi email
        //     const failed = sendResults.filter(r => r.status === "rejected");
        //     if (failed.length > 0) {
        //         console.error(`${failed.length} email gửi thất bại`, failed);
        //         // tuỳ chọn: hiển thị toast thông báo 1 phần thành công / 1 phần thất bại
        //         toast({
        //             title: "Gửi email",
        //             description: `${emailList.length - failed.length} / ${emailList.length} email đã được gửi.`,
        //             variant: failed.length === emailList.length ? "destructive" : undefined,
        //         });
        //     } else {
        //         toast({
        //             title: "Đăng ký dịch vụ thành công",
        //             description: `Đã gửi thông báo biểu quyết đến ${emailList.length} thành viên trong nhóm.`,
        //         });
        //     }
        // } catch (error) {
        //     console.error("Lỗi khi tạo decision hoặc gửi email:", error);
        //     toast({
        //         title: "Lỗi",
        //         description: "Không thể khởi tạo quyết định hoặc gửi email.",
        //         variant: "destructive",
        //     });
        // }

    };
    const onConfirm = () => {
        const serviceName =
            selectedService === "other" ? customService.trim() : selectedService;

        if (!serviceName) {
            alert("Vui lòng chọn hoặc nhập tên dịch vụ!");
            return;
        }

        handleRegister();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Đăng ký dịch vụ xe</DialogTitle>
                </DialogHeader>

                {/* Select box */}
                <div className="space-y-3 py-2">
                    <label className="text-sm font-medium">Chọn dịch vụ</label>
                    <Select onValueChange={setSelectedService}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn một dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                            {vehicleServices.map(service => (
                                <SelectItem key={service.id} value={service.serviceName}>
                                    {service.serviceName}
                                </SelectItem>
                            ))}
                            {/* Thêm lựa chọn “Khác” */}
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Textbox chỉ bật khi chọn “Khác” */}
                {selectedService === "other" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nhập tên dịch vụ khác</label>
                        <Input
                            placeholder="Nhập tên dịch vụ bạn muốn"
                            value={customService}
                            onChange={(e) => setCustomService(e.target.value)}
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onConfirm}>Đăng ký</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ScheduleCards() {
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [openCheckIn, setOpenCheckIn] = useState(false);
    const [openCheckOut, setOpenCheckOut] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);

    const [checkInForm, setCheckInForm] = useState<CheckInForm>({ condition: "GOOD", notes: "", images: [] });
    const [checkOutForm, setCheckOutForm] = useState<CheckOutForm>({ condition: "GOOD", notes: "", images: [] });
    const currentUserId = useMemo(() => Number(localStorage.getItem("userId")) || 2, []);
    const currentUserName = useMemo(() => String(localStorage.getItem("userName") || ""), []);
    const [overdueByGroup, setOverdueByGroup] = useState<Map<number, boolean>>(new Map());
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null)
    const { toast } = useToast();

    useEffect(() => {
        const handleGroupChange = (event: any) => {
            const newGroupId = event.detail.groupId;
            console.log("🔄 [ScheduleCards] Group changed to:", newGroupId);
            setCurrentGroupId(newGroupId);
        };

        window.addEventListener('group-changed', handleGroupChange);

        return () => {
            window.removeEventListener('group-changed', handleGroupChange);
        };
    }, []);
    // Detail states
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detail, setDetail] = useState<ScheduleDetailResponse | null>(null);

    // Kiểm tra quá hạn thanh toán
    const checkOverdueFee = async (groupId: number) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${beBaseUrl}/api/fund-fee/group/${groupId}/current-month`, {
                headers: {
                    "Accept": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                const userOverdueFee = data?.fees?.find((fee: any) =>
                    fee.userId === currentUserId &&
                    fee.status === "PENDING" &&
                    fee.isOverdue === true
                );

                // ✅ SỬA: Lưu theo groupId
                setOverdueByGroup(prev => {
                    const newMap = new Map(prev);
                    newMap.set(groupId, !!userOverdueFee);
                    return newMap;
                });
            } else {
                setOverdueByGroup(prev => {
                    const newMap = new Map(prev);
                    newMap.set(groupId, false);
                    return newMap;
                });
            }
        } catch (error: any) {
            console.error("Error checking overdue fee:", error);
            setOverdueByGroup(prev => {
                const newMap = new Map(prev);
                newMap.set(groupId, false);
                return newMap;
            });
        }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const groupId = Number(localStorage.getItem("groupId")) || 1;
            const token = localStorage.getItem("accessToken");
            const headers = {
                "Accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            };

            // Fetch schedules và vehicles song song
            const [schedulesRes, vehiclesRes] = await Promise.all([
                fetch(`${beBaseUrl}/schedule/group/${groupId}/booked`, {
                    headers,
                    credentials: "include",
                }),
                fetch(`${beBaseUrl}/schedule/vehicle?groupId=${groupId}&userId=${currentUserId}`, {
                    headers,
                    credentials: "include",
                }).catch(() => null) // Nếu lỗi thì bỏ qua, vehicles có thể null
            ]);

            if (!schedulesRes.ok) {
                const text = await schedulesRes.text();
                throw new Error(text || `HTTP ${schedulesRes.status}`);
            }

            const ct = schedulesRes.headers.get("content-type") || "";
            if (!ct.includes("application/json")) {
                const text = await schedulesRes.text();
                throw new Error(`Không nhận được JSON từ server: ${text.slice(0, 120)}`);
            }

            const schedulesData = await schedulesRes.json();
            console.log("📦 Raw schedules from BE:", schedulesData);

            // Parse vehicles nếu có
            let vehicles: any[] = [];
            if (vehiclesRes && vehiclesRes.ok) {
                try {
                    const vehiclesData = await vehiclesRes.json();
                    vehicles = Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.data || []);
                    console.log("🚗 Vehicles from BE:", vehicles);
                } catch (e) {
                    console.warn("Không thể parse vehicles:", e);
                }
            }

            // Parse schedules array
            const arr = Array.isArray(schedulesData) ? schedulesData : (schedulesData?.items || schedulesData?.data || []);

            // Log chi tiết từng schedule để debug check-in/check-out
            arr.forEach((raw: any, idx: number) => {
                console.log(`🔍 Schedule ${idx} (scheduleId: ${raw.scheduleId ?? raw.id}):`, {
                    scheduleId: raw.scheduleId ?? raw.id,
                    checkIn: raw.checkIn,
                    checkInTime: raw.checkInTime,
                    hasCheckIn: raw.hasCheckIn,
                    checkOut: raw.checkOut,
                    checkOutTime: raw.checkOutTime,
                    hasCheckOut: raw.hasCheckOut,
                    // Log toàn bộ raw object để xem cấu trúc
                    fullRaw: JSON.stringify(raw, null, 2)
                });
            });

            // Helper: Enrich items with booking detail if list lacks check-in/out info
            const enrichWithDetails = async (items: ScheduleItem[]): Promise<ScheduleItem[]> => {
                // Only fetch details for items missing both hasCheckIn and times
                const target = items.filter(it => (!it.hasCheckIn && !it.hasCheckOut) && !it.checkInTime && !it.checkOutTime);
                if (target.length === 0) return items;
                try {
                    const enrichedPairs = await Promise.all(target.map(async (it) => {
                        try {
                            const detailRes = await fetch(`${beBaseUrl}/booking/detail/${it.scheduleId}`, {
                                method: "GET",
                                headers: {
                                    "Accept": "application/json",
                                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                                },
                                credentials: "include",
                            });
                            if (!detailRes.ok) return [it.scheduleId, null] as const;
                            const d = await detailRes.json();
                            const checkInTime = d?.checkIn?.checkInTime || d?.checkInTime || d?.checkinTime;
                            const checkOutTime = d?.checkOut?.checkOutTime || d?.checkOutTime || d?.checkoutTime;
                            const hasCheckIn = !!(d?.checkIn || checkInTime);
                            const hasCheckOut = !!(d?.checkOut || checkOutTime);
                            const updated: ScheduleItem = {
                                ...it,
                                hasCheckIn: hasCheckIn || it.hasCheckIn,
                                hasCheckOut: hasCheckOut || it.hasCheckOut,
                                checkInTime: checkInTime || it.checkInTime,
                                checkOutTime: checkOutTime || it.checkOutTime,
                            };
                            return [it.scheduleId, updated] as const;
                        } catch {
                            return [it.scheduleId, null] as const;
                        }
                    }));
                    const idToUpdated = new Map<number, ScheduleItem>();
                    for (const [id, updated] of enrichedPairs) {
                        if (updated) idToUpdated.set(id, updated);
                    }
                    return items.map(it => idToUpdated.get(it.scheduleId) || it);
                } catch {
                    return items;
                }
            };

            const normalized = (arr as any[])
                .map(raw => {
                    const item = normalizeScheduleItem(raw);
                    if (!item) return null;

                    // Map vehicleId với thông tin xe
                    const vehicle = vehicles.find(v =>
                        v.vehicleId === raw.vehicleId ||
                        v.id === raw.vehicleId ||
                        v.vehicle?.vehicleId === raw.vehicleId
                    );

                    if (vehicle) {
                        const brand = vehicle.brand || vehicle.vehicle?.brand || "";
                        const model = vehicle.model || vehicle.vehicle?.model || "";
                        const plateNo = vehicle.plateNo || vehicle.licensePlate || vehicle.vehicle?.plateNo || vehicle.vehicle?.licensePlate || "";

                        return {
                            ...item,
                            vehicleName: brand && model ? `${brand} ${model}` : (item.vehicleName || `Xe ${raw.vehicleId}`),
                            vehiclePlate: plateNo || item.vehiclePlate,
                        } as ScheduleItem;
                    }

                    return item;
                })
                .filter((x): x is ScheduleItem => x !== null);

            // Enrich items with booking details if needed
            const enriched = await enrichWithDetails(normalized);

            console.log("✅ Normalized items with vehicles:", enriched);
            console.log("👤 Current user - ID:", currentUserId, "Name:", currentUserName);
            // Debug: Log check-in/check-out status cho từng item
            enriched.forEach(item => {
                console.log(`📋 Schedule ${item.scheduleId}: hasCheckIn=${item.hasCheckIn}, hasCheckOut=${item.hasCheckOut}, checkInTime=${item.checkInTime}`);
            });
            setItems(enriched);
        } catch (e: any) {
            setError(e.message || "Không thể tải danh sách lịch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
        const onUpdated = () => fetchSchedules();
        window.addEventListener('schedules-updated', onUpdated as any);
        window.addEventListener('storage', onUpdated);
        return () => {
            window.removeEventListener('schedules-updated', onUpdated as any);
            window.removeEventListener('storage', onUpdated);
        };
    }, []);

    // Kiểm tra quá hạn thanh toán khi component mount
    useEffect(() => {
        // ✅ Load overdue cho TẤT CẢ nhóm
        const groupIdsStr = localStorage.getItem("groupIds");
        if (groupIdsStr) {
            const groupIds: number[] = JSON.parse(groupIdsStr);
            for (const gid of groupIds) {
                checkOverdueFee(gid);
            }
        } else {
            // Fallback: load cho groupId hiện tại
            const groupId = Number(localStorage.getItem("groupId")) || 1;
            checkOverdueFee(groupId);
        }
    }, []);


    const openDetailDialog = async (id: number) => {
        setActiveId(id);
        setOpenDetail(true);
        setDetail(null);
        setDetailError(null);
        setDetailLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${beBaseUrl}/booking/detail/${id}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                credentials: "include",
            });
            const data = await res.json();
            setDetail(data as ScheduleDetailResponse);
        } catch (e: any) {
            setDetailError(e.message || "Không thể tải chi tiết");
        } finally {
            setDetailLoading(false);
        }
    };

    const openCheckInDialog = (id: number) => {
        // Chỉ mở dialog nếu là lịch của tôi
        const booking = items.find(item => item.scheduleId === id);
        if (!booking) {
            alert("Không tìm thấy lịch thuê xe");
            return;
        }

        const isMine = booking.userId !== null
            ? booking.userId === currentUserId
            : booking.userName === currentUserName || booking.userName === "Bạn";

        if (!isMine) {
            alert("Bạn chỉ có thể check-in những xe mà bạn đăng ký");
            return;
        }

        // ✅ SỬA: Lấy groupId từ booking (cần thêm field groupId vào ScheduleItem)
        // Nếu BE không trả groupId, dùng localStorage fallback
        const groupId = Number(localStorage.getItem("groupId")) || 1;
        const hasOverdueInThisGroup = overdueByGroup.get(groupId) || false;

        if (hasOverdueInThisGroup) {
            toast({
                title: "Không thể check-in",
                description: "Tài khoản của bạn quá hạn thanh toán trong nhóm này. Vui lòng liên hệ admin thanh toán trước khi sử dụng dịch vụ.",
                variant: "destructive",
            });
            return;
        }

        setActiveId(id);
        setCheckInForm({ condition: "GOOD", notes: "", images: [] });
        setOpenCheckIn(true);
    };

    const openCheckOutDialog = (id: number) => {
        // Chỉ mở dialog nếu là lịch của tôi
        const booking = items.find(item => item.scheduleId === id);
        if (!booking) {
            alert("Không tìm thấy lịch thuê xe");
            return;
        }

        const isMine = booking.userId !== null
            ? booking.userId === currentUserId
            : booking.userName === currentUserName || booking.userName === "Bạn";

        if (!isMine) {
            alert("Bạn chỉ có thể check-out những xe mà bạn đăng ký");
            return;
        }

      const hasOverdueInThisGroup = overdueByGroup.get(currentGroupId) || false;


        if (hasOverdueInThisGroup) {
            toast({
                title: "Không thể check-out",
                description: "Tài khoản của bạn quá hạn thanh toán trong nhóm này. Vui lòng liên hệ admin thanh toán trước khi sử dụng dịch vụ.",
                variant: "destructive",
            });
            return;
        }

        setActiveId(id);
        setCheckOutForm({ condition: "GOOD", notes: "", images: [] });
        setOpenCheckOut(true);
    };


    const submitCheckIn = async () => {
        if (activeId == null) return;

        // Kiểm tra xem booking có thuộc về user hiện tại không
        const booking = items.find(item => item.scheduleId === activeId);
        if (!booking) {
            alert("Không tìm thấy lịch đặt xe");
            return;
        }
        {
            const isMine = booking.userId != null
                ? booking.userId === currentUserId
                : (booking.userName === currentUserName || booking.userName === "Bạn");
            if (!isMine) {
                alert("Bạn chỉ có thể check-in những xe mà bạn đã đăng ký");
                setOpenCheckIn(false);
                return;
            }
        }

        const payload = {
            userId: currentUserId,
            condition: checkInForm.condition,
            notes: checkInForm.notes,
            images: checkInForm.images,
        };
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${beBaseUrl}/booking/checkIn/${activeId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const text = await res.text();
            alert(`Check-in thất bại: ${text}`);
            return;
        }
        // Parse response nếu có body
        let checkInTimeFromResponse: string | undefined = undefined;
        try {
            const checkInResult = await res.json();
            console.log("✅ Check-in response:", checkInResult);
            // Lấy checkInTime từ response nếu có
            checkInTimeFromResponse = checkInResult?.checkInTime ??
                checkInResult?.checkIn?.checkInTime ??
                checkInResult?.time ??
                new Date().toISOString(); // Fallback: dùng thời gian hiện tại
        } catch (e) {
            // Response có thể không có body, dùng thời gian hiện tại
            checkInTimeFromResponse = new Date().toISOString();
            console.log("✅ Check-in thành công (no response body)");
        }

        // Optimistic update: cập nhật state ngay lập tức
        setItems(prevItems => prevItems.map(item => {
            if (item.scheduleId === activeId) {
                return {
                    ...item,
                    hasCheckIn: true,
                    checkInTime: checkInTimeFromResponse || new Date().toISOString()
                };
            }
            return item;
        }));

        alert("Check-in thành công");
        setOpenCheckIn(false);

        // Fetch detail của schedule này để lấy thông tin mới nhất từ BE
        try {
            const detailRes = await fetch(`${beBaseUrl}/booking/detail/${activeId}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                credentials: "include",
            });
            if (detailRes.ok) {
                const detailData = await detailRes.json();
                console.log("✅ Fetched detail after check-in:", detailData);

                // Cập nhật state với dữ liệu từ detail, giữ lại thông tin vehicle từ item cũ
                setItems(prevItems => prevItems.map(item => {
                    if (item.scheduleId === activeId) {
                        const normalized = normalizeScheduleItem(detailData);
                        if (normalized) {
                            // Merge với item cũ để giữ lại vehicleName, vehiclePlate nếu detail không có
                            return {
                                ...normalized,
                                vehicleName: normalized.vehicleName || item.vehicleName,
                                vehiclePlate: normalized.vehiclePlate || item.vehiclePlate,
                            };
                        }
                    }
                    return item;
                }));
            }
        } catch (e) {
            console.warn("⚠️ Không thể fetch detail sau check-in:", e);
            // Nếu không fetch được detail, vẫn fetch lại list sau một chút
            setTimeout(() => {
                fetchSchedules();
            }, 1000);
        }
    };

    const submitCheckOut = async () => {
        if (activeId == null) return;

        // Kiểm tra xem booking có thuộc về user hiện tại không
        const booking = items.find(item => item.scheduleId === activeId);
        if (!booking) {
            alert("Không tìm thấy lịch đặt xe");
            return;
        }
        {
            const isMine = booking.userId != null
                ? booking.userId === currentUserId
                : (booking.userName === currentUserName || booking.userName === "Bạn");
            if (!isMine) {
                alert("Bạn chỉ có thể check-out những xe mà bạn đã đăng ký");
                setOpenCheckOut(false);
                return;
            }
        }

        const payload = {
            userId: currentUserId,
            condition: checkOutForm.condition,
            notes: checkOutForm.notes,
            images: checkOutForm.images,
        } as any;
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${beBaseUrl}/booking/checkOut/${activeId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const text = await res.text();
            alert(`Check-out thất bại: ${text}`);
            return;
        }
        // Parse response nếu có body
        let checkOutTimeFromResponse: string | undefined = undefined;
        try {
            const checkOutResult = await res.json();
            console.log("✅ Check-out response:", checkOutResult);
            // Lấy checkOutTime từ response nếu có
            checkOutTimeFromResponse = checkOutResult?.checkOutTime ??
                checkOutResult?.checkOut?.checkOutTime ??
                checkOutResult?.time ??
                new Date().toISOString(); // Fallback: dùng thời gian hiện tại
        } catch (e) {
            // Response có thể không có body, dùng thời gian hiện tại
            checkOutTimeFromResponse = new Date().toISOString();
            console.log("✅ Check-out thành công (no response body)");
        }

        // Optimistic update: cập nhật state ngay lập tức
        setItems(prevItems => prevItems.map(item => {
            if (item.scheduleId === activeId) {
                return {
                    ...item,
                    hasCheckOut: true,
                    checkOutTime: checkOutTimeFromResponse || new Date().toISOString()
                };
            }
            return item;
        }));

        alert("Check-out thành công");
        setOpenCheckOut(false);

        // Fetch detail của schedule này để lấy thông tin mới nhất từ BE
        try {
            const detailRes = await fetch(`${beBaseUrl}/booking/detail/${activeId}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                credentials: "include",
            });
            if (detailRes.ok) {
                const detailData = await detailRes.json();
                console.log("✅ Fetched detail after check-out:", detailData);

                // Cập nhật state với dữ liệu từ detail, giữ lại thông tin vehicle từ item cũ
                setItems(prevItems => prevItems.map(item => {
                    if (item.scheduleId === activeId) {
                        const normalized = normalizeScheduleItem(detailData);
                        if (normalized) {
                            // Merge với item cũ để giữ lại vehicleName, vehiclePlate nếu detail không có
                            return {
                                ...normalized,
                                vehicleName: normalized.vehicleName || item.vehicleName,
                                vehiclePlate: normalized.vehiclePlate || item.vehiclePlate,
                            };
                        }
                    }
                    return item;
                }));
            }
        } catch (e) {
            console.warn("⚠️ Không thể fetch detail sau check-out:", e);
            // Nếu không fetch được detail, vẫn fetch lại list sau một chút
            setTimeout(() => {
                fetchSchedules();
            }, 1000);
        }
    };

    return (
        <Card className="shadow-elegant">
            <CardHeader>
                <CardTitle>Danh sách đặt lịch</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Cảnh báo quá hạn thanh toán */}
                {/* Cảnh báo quá hạn thanh toán */}
                {(() => {
                    // ✅ Kiểm tra overdueByGroup đã load chưa
                    if (overdueByGroup.size === 0) {
                        return null; // Chưa load data overdue → không hiện warning
                    }

                    // ✅ Kiểm tra groupId có trong Map chưa
                    if (!overdueByGroup.has(currentGroupId)) {
                        return null; // Chưa có data cho groupId này → không hiện warning
                    }

                    const hasOverdueInThisGroup = overdueByGroup.get(currentGroupId) || false;

                    if (!hasOverdueInThisGroup) {
                        return null; // Không overdue → không hiện warning
                    }

                    return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-900">
                                        Tài khoản quá hạn thanh toán
                                    </p>
                                    <p className="text-sm text-red-700 mt-1">
                                        Tài khoản của bạn quá hạn thanh toán trong nhóm này.
                                        Vui lòng liên hệ admin thanh toán trước khi sử dụng dịch vụ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}





                {loading ? (
                    <div className="text-muted-foreground">Đang tải...</div>
                ) : error ? (
                    <div className="text-destructive">{error}</div>
                ) : items.length === 0 ? (
                    <div className="text-muted-foreground">Chưa có lịch nào</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map(it => {
                            const statusBadge = !it.hasCheckIn ? { text: "Chờ nhận xe", style: "bg-blue-600" }
                                : it.hasCheckIn && !it.hasCheckOut ? { text: "Đang sử dụng", style: "bg-orange-500" }
                                    : { text: "Đã trả xe", style: "bg-green-600" };

                            // Only show check-in/out buttons if the booking belongs to current user
                            // Fallback theo userName khi BE không trả userId
                            const normalizeName = (name?: string) => name?.trim().toLowerCase() || "";
                            const bookingName = normalizeName(it.userName);
                            const currentName = normalizeName(currentUserName);

                            // So sánh linh hoạt: chính xác hoặc một trong hai chứa tên kia
                            const nameMatches = bookingName === currentName ||
                                bookingName === "bạn" ||
                                (bookingName && currentName && (
                                    bookingName.includes(currentName) ||
                                    currentName.includes(bookingName)
                                ));

                            const isMyBooking = (
                                it.userId != null && it.userId !== undefined
                                    ? it.userId === currentUserId
                                    : nameMatches
                            );

                            // Debug log để kiểm tra
                            if (it.scheduleId) {
                                console.log(`🔍 Schedule ${it.scheduleId}: userId=${it.userId}, userName="${it.userName}", isMyBooking=${isMyBooking}, currentUserId=${currentUserId}, currentUserName="${currentUserName}", nameMatches=${nameMatches}`);
                            }

                            return (
                                <div key={it.scheduleId} className="p-4 border rounded-lg bg-background">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold">{it.vehicleName || "Xe"}</div>
                                        <span
                                            className={`text-xs text-white px-2 py-0.5 rounded ${statusBadge.style}`}>{statusBadge.text}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Biển
                                        số: {it.vehiclePlate || "-"}</div>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <div className="flex items-center gap-2"><User className="h-4 w-4" />Người
                                            thuê: {it.userName || "-"}</div>
                                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" />Bắt
                                            đầu: {formatDateTime(it.startTime)}</div>
                                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" />Kết
                                            thúc: {formatDateTime(it.endTime)}</div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {isMyBooking ? (
                                            <>
                                                {!it.hasCheckIn && (
                                                    <Button size="sm" onClick={() => openCheckInDialog(it.scheduleId)}>
                                                        Check-in
                                                    </Button>
                                                )}
                                                {it.hasCheckIn && !it.hasCheckOut && (
                                                    <Button size="sm" variant="outline"
                                                        onClick={() => openCheckOutDialog(it.scheduleId)}>
                                                        Check-out
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost"
                                                    onClick={() => openDetailDialog(it.scheduleId)}>
                                                    Xem chi tiết
                                                </Button>
                                            </>
                                        ) : (
                                            <Button size="sm" variant="ghost"
                                                onClick={() => openDetailDialog(it.scheduleId)}>
                                                Xem chi tiết
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Check-in dialog */}
                <Dialog open={openCheckIn} onOpenChange={setOpenCheckIn}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Check-in</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm mb-1">Tình trạng xe</div>
                                <Select value={checkInForm.condition}
                                    onValueChange={(v) => setCheckInForm(prev => ({ ...prev, condition: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn tình trạng" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOOD">Tốt</SelectItem>
                                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                                        <SelectItem value="BAD">Hư hỏng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="text-sm mb-1">Ghi chú</div>
                                <Textarea value={checkInForm.notes}
                                    onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Ghi chú..." />
                            </div>
                            <div>
                                <div className="text-sm mb-1">Hình ảnh</div>
                                <input type="file" multiple onChange={async (e) => {
                                    const imgs = await fileListToBase64(e.target.files);
                                    setCheckInForm(prev => ({ ...prev, images: imgs }));
                                }} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button onClick={submitCheckIn}>Xác nhận</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Check-out dialog */}
                <Dialog open={openCheckOut} onOpenChange={setOpenCheckOut}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Check-out</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                                Hãy kiểm tra lại tình trạng xe so với lúc
                                check-in: {formatDateTime(items.find(i => i.scheduleId === activeId)?.checkInTime)}
                            </div>
                            <div>
                                <div className="text-sm mb-1">Tình trạng xe</div>
                                <Select value={checkOutForm.condition}
                                    onValueChange={(v) => setCheckOutForm(prev => ({ ...prev, condition: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn tình trạng" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOOD">Tốt</SelectItem>
                                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                                        <SelectItem value="BAD">Hư hỏng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="text-sm mb-1">Ghi chú</div>
                                <Textarea value={checkOutForm.notes}
                                    onChange={(e) => setCheckOutForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Ghi chú..." />
                            </div>
                            <div>
                                <div className="text-sm mb-1">Hình ảnh</div>
                                <input type="file" multiple onChange={async (e) => {
                                    const imgs = await fileListToBase64(e.target.files);
                                    setCheckOutForm(prev => ({ ...prev, images: imgs }));
                                }} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button onClick={submitCheckOut}>Xác nhận</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Detail dialog */}
                <Dialog open={openDetail} onOpenChange={setOpenDetail}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Chi tiết lịch đặt</DialogTitle>
                        </DialogHeader>
                        {detailLoading ? (
                            <div className="text-muted-foreground">Đang tải...</div>
                        ) : detailError ? (
                            <div className="text-destructive">{detailError}</div>
                        ) : !detail ? (
                            <div className="text-muted-foreground">Không có dữ liệu</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Xe</div>
                                        <div className="font-medium">{detail.vehicleName || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Biển số</div>
                                        <div className="font-medium">{detail.vehiclePlate || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Người thuê</div>
                                        <div className="font-medium">{detail.userName || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Trạng thái</div>
                                        <div className="font-medium">{detail.scheduleStatus || '-'}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-sm">Bắt đầu: {formatDateTime(detail.startTime)}</div>
                                    <div className="text-sm">Kết thúc: {formatDateTime(detail.endTime)}</div>
                                </div>

                                <div className="border rounded-md p-3">
                                    <div className="font-semibold mb-2">Check-in</div>
                                    {detail.checkIn ? (
                                        <div className="space-y-1 text-sm">
                                            <div>Thời gian: {formatDateTime(detail.checkIn.checkInTime)}</div>
                                            <div>Tình trạng: {detail.checkIn.condition}</div>
                                            <div>Ghi chú: {detail.checkIn.notes || '-'}</div>
                                            {detail.checkIn.images && (
                                                <img src={detail.checkIn.images} alt="checkin"
                                                    className="mt-2 max-h-48 object-contain" />
                                            )}
                                            <Button
                                                variant="default"
                                                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => setShowRegisterModal(true)}
                                            >
                                                Đăng ký dịch vụ
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Chưa check-in</div>
                                    )}
                                </div>
                                <div className="border rounded-md p-3">
                                    <div className="font-semibold mb-2">Check-out</div>
                                    {detail.checkOut ? (
                                        <div className="space-y-1 text-sm">
                                            <div>Thời gian: {formatDateTime(detail.checkOut.checkOutTime)}</div>
                                            <div>Tình trạng: {detail.checkOut.condition}</div>
                                            <div>Ghi chú: {detail.checkOut.notes || '-'}</div>
                                            {detail.checkOut.images && (
                                                <img src={detail.checkOut.images} alt="checkout"
                                                    className="mt-2 max-h-48 object-contain" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Chưa check-out</div>
                                    )}
                                </div>
                                <RegisterVehicleServiceModal
                                    open={showRegisterModal}
                                    onClose={() => setShowRegisterModal(false)}
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}