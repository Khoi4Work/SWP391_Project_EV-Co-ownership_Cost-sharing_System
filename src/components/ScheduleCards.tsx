import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Car, Clock, User} from "lucide-react";

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
const USE_MOCK = false; // tắt mock, dùng BE thật

function formatDateTime(iso?: string) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit", hour12: false})}`;
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

export default function ScheduleCards() {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [openCheckIn, setOpenCheckIn] = useState(false);
    const [openCheckOut, setOpenCheckOut] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);

    const [checkInForm, setCheckInForm] = useState<CheckInForm>({condition: "GOOD", notes: "", images: []});
    const [checkOutForm, setCheckOutForm] = useState<CheckOutForm>({condition: "GOOD", notes: "", images: []});
    const currentUserId = useMemo(() => Number(localStorage.getItem("userId")) || 2, []);

    // Detail states
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detail, setDetail] = useState<ScheduleDetailResponse | null>(null);

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const groupId = Number(localStorage.getItem("groupId")) || 1;
            if (USE_MOCK) {
                // đọc mock schedules từ localStorage (được tạo bởi VehicleBooking)
                const raw = JSON.parse(localStorage.getItem("mockSchedules") || "[]");
                const vehiclesMock = [
                    { vehicleId: 101, plateNo: "51A-123.45", brand: "VinFast", model: "VF8" },
                    { vehicleId: 102, plateNo: "51A-678.90", brand: "Hyundai", model: "Kona Electric" },
                    { vehicleId: 201, plateNo: "30H-000.11", brand: "Tesla", model: "Model 3" },
                ];
                const mapped: ScheduleItem[] = raw
                    .filter((r: any) => r.groupId === groupId)
                    .map((r: any) => {
                        const v = vehiclesMock.find(x => x.vehicleId === r.vehicleId);
                        return {
                            scheduleId: r.scheduleId,
                            startTime: r.startTime,
                            endTime: r.endTime,
                            vehicleName: v ? `${v.brand} ${v.model}` : `Xe ${r.vehicleId}`,
                            vehiclePlate: v?.plateNo,
                            userName: r.userName || "Bạn",
                            userId: r.userId || currentUserId, // Lấy userId từ booking
                            hasCheckIn: Boolean(r.checkInTime),
                            hasCheckOut: Boolean(r.checkOutTime),
                            checkInTime: r.checkInTime,
                            checkOutTime: r.checkOutTime,
                        } as ScheduleItem;
                    });
                setItems(mapped);
            } else {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`${beBaseUrl}/booking/schedules/group/${groupId}/booked`, {
                    headers: {
                        "Accept": "application/json",
                        ...(token ? {"Authorization": `Bearer ${token}`} : {})
                    },
                    credentials: "include",
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `HTTP ${res.status}`);
                }
                const ct = res.headers.get("content-type") || "";
                if (!ct.includes("application/json")) {
                    const text = await res.text();
                    throw new Error(`Không nhận được JSON từ server: ${text.slice(0, 120)}`);
                }
                const data = await res.json();
                // Đảm bảo mỗi item có userId để kiểm tra quyền
                const itemsWithUserId = (data as ScheduleItem[]).map(item => ({
                    ...item,
                    userId: item.userId || currentUserId // Fallback về currentUserId nếu không có
                }));
                setItems(itemsWithUserId);
            }
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

    const openDetailDialog = async (id: number) => {
        setActiveId(id);
        setOpenDetail(true);
        setDetail(null);
        setDetailError(null);
        setDetailLoading(true);
        try {
            if (USE_MOCK) {
                const raw = JSON.parse(localStorage.getItem("mockSchedules") || "[]");
                const r = raw.find((x: any) => x.scheduleId === id);
                if (!r) throw new Error("Không tìm thấy lịch trong mock");
                const vehiclesMock = [
                    { vehicleId: 101, plateNo: "51A-123.45", brand: "VinFast", model: "VF8" },
                    { vehicleId: 102, plateNo: "51A-678.90", brand: "Hyundai", model: "Kona Electric" },
                    { vehicleId: 201, plateNo: "30H-000.11", brand: "Tesla", model: "Model 3" },
                ];
                const v = vehiclesMock.find((x) => x.vehicleId === r.vehicleId);
                const d: ScheduleDetailResponse = {
                    scheduleId: r.scheduleId,
                    startTime: r.startTime,
                    endTime: r.endTime,
                    vehicleName: v ? `${v.brand} ${v.model}` : `Xe ${r.vehicleId}`,
                    vehiclePlate: v?.plateNo,
                    userName: r.userName || "Bạn",
                    scheduleStatus: r.status,
                    checkIn: r.checkInTime ? {
                        checkInId: r.scheduleId,
                        checkInTime: r.checkInTime,
                        condition: "GOOD",
                        notes: r.checkInNotes || "",
                        images: r.checkInImages || "",
                    } : null,
                    checkOut: r.checkOutTime ? {
                        checkOutId: r.scheduleId,
                        checkOutTime: r.checkOutTime,
                        condition: "GOOD",
                        notes: r.checkOutNotes || "",
                        images: r.checkOutImages || "",
                    } : null,
                };
                setDetail(d);
            } else {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`${beBaseUrl}/booking/detail/${id}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        ...(token ? {"Authorization": `Bearer ${token}`} : {})
                    },
                    credentials: "include",
                });
                const data = await res.json();
                setDetail(data as ScheduleDetailResponse);
            }
        } catch (e: any) {
            setDetailError(e.message || "Không thể tải chi tiết");
        } finally {
            setDetailLoading(false);
        }
    };

    const openCheckInDialog = (id: number) => {
        setActiveId(id);
        setCheckInForm({condition: "GOOD", notes: "", images: []});
        setOpenCheckIn(true);
    };

    const openCheckOutDialog = (id: number) => {
        setActiveId(id);
        setCheckOutForm({condition: "GOOD", notes: "", images: []});
        setOpenCheckOut(true);
    };

    const submitCheckIn = async () => {
        if (activeId == null) return;
        
        // Kiểm tra xem booking có thuộc về user hiện tại không
        const booking = items.find(item => item.scheduleId === activeId);
        if (!booking) {
            alert("Không tìm thấy booking");
            return;
        }
        if (booking.userId !== currentUserId) {
            alert("Bạn chỉ có thể check-in những xe mà bạn đã đăng ký");
            setOpenCheckIn(false);
            return;
        }
        
        if (USE_MOCK) {
            const key = "mockSchedules";
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = list.findIndex((b: any) => b.scheduleId === activeId);
            if (idx !== -1) {
                // Kiểm tra lại userId trong mock data
                if (list[idx].userId !== currentUserId) {
                    alert("Bạn chỉ có thể check-in những xe mà bạn đã đăng ký");
                    setOpenCheckIn(false);
                    return;
                }
                list[idx].checkInTime = new Date().toISOString();
                localStorage.setItem(key, JSON.stringify(list));
                alert("Check-in thành công (mock)");
            }
            setOpenCheckIn(false);
            fetchSchedules();
            return;
        } else {
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
                    ...(token ? {"Authorization": `Bearer ${token}`} : {})
                },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const text = await res.text();
                alert(`Check-in thất bại: ${text}`);
                return;
            }
            alert("Check-in thành công");
            setOpenCheckIn(false);
            fetchSchedules();
        }
    };

    const submitCheckOut = async () => {
        if (activeId == null) return;
        
        // Kiểm tra xem booking có thuộc về user hiện tại không
        const booking = items.find(item => item.scheduleId === activeId);
        if (!booking) {
            alert("Không tìm thấy booking");
            return;
        }
        if (booking.userId !== currentUserId) {
            alert("Bạn chỉ có thể check-out những xe mà bạn đã đăng ký");
            setOpenCheckOut(false);
            return;
        }
        
        if (USE_MOCK) {
            const key = "mockSchedules";
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = list.findIndex((b: any) => b.scheduleId === activeId);
            if (idx !== -1) {
                // Kiểm tra lại userId trong mock data
                if (list[idx].userId !== currentUserId) {
                    alert("Bạn chỉ có thể check-out những xe mà bạn đã đăng ký");
                    setOpenCheckOut(false);
                    return;
                }
                list[idx].checkOutTime = new Date().toISOString();
                localStorage.setItem(key, JSON.stringify(list));
                alert("Check-out thành công (mock)");
            }
            setOpenCheckOut(false);
            fetchSchedules();
            return;
        } else {
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
                    ...(token ? {"Authorization": `Bearer ${token}`} : {})
                },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const text = await res.text();
                alert(`Check-out thất bại: ${text}`);
                return;
            }
            alert("Check-out thành công");
            setOpenCheckOut(false);
            fetchSchedules();
        }
    };

    return (
        <Card className="shadow-elegant">
            <CardHeader>
                <CardTitle>Danh sách đặt lịch</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-muted-foreground">Đang tải...</div>
                ) : error ? (
                    <div className="text-destructive">{error}</div>
                ) : items.length === 0 ? (
                    <div className="text-muted-foreground">Chưa có lịch nào</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map(it => {
                            const statusBadge = !it.hasCheckIn ? {text: "Chờ nhận xe", style: "bg-blue-600"}
                                : it.hasCheckIn && !it.hasCheckOut ? {text: "Đang sử dụng", style: "bg-orange-500"}
                                    : {text: "Đã trả xe", style: "bg-green-600"};
                            return (
                                <div key={it.scheduleId} className="p-4 border rounded-lg bg-background">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold">{it.vehicleName || "Xe"}</div>
                                        <span className={`text-xs text-white px-2 py-0.5 rounded ${statusBadge.style}`}>{statusBadge.text}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Biển số: {it.vehiclePlate || "-"}</div>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <div className="flex items-center gap-2"><User className="h-4 w-4"/>Người thuê: {it.userName || "-"}</div>
                                        <div className="flex items-center gap-2"><Clock className="h-4 w-4"/>Bắt đầu: {formatDateTime(it.startTime)}</div>
                                        <div className="flex items-center gap-2"><Clock className="h-4 w-4"/>Kết thúc: {formatDateTime(it.endTime)}</div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {/* Chỉ hiển thị nút Check-in/Check-out nếu booking thuộc về user hiện tại */}
                                        {it.userId === currentUserId && !it.hasCheckIn && (
                                            <Button size="sm" onClick={() => openCheckInDialog(it.scheduleId)}>Check-in</Button>
                                        )}
                                        {it.userId === currentUserId && it.hasCheckIn && !it.hasCheckOut && (
                                            <Button size="sm" variant="outline" onClick={() => openCheckOutDialog(it.scheduleId)}>Check-out</Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => openDetailDialog(it.scheduleId)}>Xem chi tiết</Button>
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
                                <Select value={checkInForm.condition} onValueChange={(v) => setCheckInForm(prev => ({...prev, condition: v}))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn tình trạng"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOOD">Tốt</SelectItem>
                                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                                        <SelectItem value="BAD">Hư hỏng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="text-sm mb-1">Ghi chú</div>
                                <Textarea value={checkInForm.notes} onChange={(e) => setCheckInForm(prev => ({...prev, notes: e.target.value}))} placeholder="Ghi chú..."/>
                            </div>
                            <div>
                                <div className="text-sm mb-1">Hình ảnh</div>
                                <input type="file" multiple onChange={async (e) => {
                                    const imgs = await fileListToBase64(e.target.files);
                                    setCheckInForm(prev => ({...prev, images: imgs}));
                                }}/>
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
                                Hãy kiểm tra lại tình trạng xe so với lúc check-in: {formatDateTime(items.find(i => i.scheduleId === activeId)?.checkInTime)}
                            </div>
                            <div>
                                <div className="text-sm mb-1">Tình trạng xe</div>
                                <Select value={checkOutForm.condition} onValueChange={(v) => setCheckOutForm(prev => ({...prev, condition: v}))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn tình trạng"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOOD">Tốt</SelectItem>
                                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                                        <SelectItem value="BAD">Hư hỏng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="text-sm mb-1">Ghi chú</div>
                                <Textarea value={checkOutForm.notes} onChange={(e) => setCheckOutForm(prev => ({...prev, notes: e.target.value}))} placeholder="Ghi chú..."/>
                            </div>
                            <div>
                                <div className="text-sm mb-1">Hình ảnh</div>
                                <input type="file" multiple onChange={async (e) => {
                                    const imgs = await fileListToBase64(e.target.files);
                                    setCheckOutForm(prev => ({...prev, images: imgs}));
                                }}/>
                            </div>
                            {/* Đã bỏ đánh giá theo yêu cầu */}
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
                                                <img src={detail.checkIn.images} alt="checkin" className="mt-2 max-h-48 object-contain"/>
                                            )}
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
                                                <img src={detail.checkOut.images} alt="checkout" className="mt-2 max-h-48 object-contain"/>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Chưa check-out</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}


