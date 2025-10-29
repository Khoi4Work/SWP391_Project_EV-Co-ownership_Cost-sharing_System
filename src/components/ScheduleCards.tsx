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
    hasCheckIn: boolean;
    hasCheckOut: boolean;
    checkInTime?: string; // ISO
    checkOutTime?: string; // ISO
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
    rating: number;
};

const beBaseUrl = "http://localhost:8080";
const USE_MOCK = true; // bật để test không cần BE

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
    const [activeId, setActiveId] = useState<number | null>(null);

    const [checkInForm, setCheckInForm] = useState<CheckInForm>({condition: "GOOD", notes: "", images: []});
    const [checkOutForm, setCheckOutForm] = useState<CheckOutForm>({condition: "GOOD", notes: "", images: [], rating: 5});
    const currentUserId = useMemo(() => Number(localStorage.getItem("userId")) || 2, []);

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
                setItems(data as ScheduleItem[]);
            }
        } catch (e: any) {
            setError(e.message || "Không thể tải danh sách lịch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const openCheckInDialog = (id: number) => {
        setActiveId(id);
        setCheckInForm({condition: "GOOD", notes: "", images: []});
        setOpenCheckIn(true);
    };

    const openCheckOutDialog = (id: number) => {
        setActiveId(id);
        setCheckOutForm({condition: "GOOD", notes: "", images: [], rating: 5});
        setOpenCheckOut(true);
    };

    const submitCheckIn = async () => {
        if (activeId == null) return;
        if (USE_MOCK) {
            const key = "mockSchedules";
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = list.findIndex((b: any) => b.scheduleId === activeId);
            if (idx !== -1) {
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
            const res = await fetch(`${beBaseUrl}/booking/checkIn/${activeId}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
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
        if (USE_MOCK) {
            const key = "mockSchedules";
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = list.findIndex((b: any) => b.scheduleId === activeId);
            if (idx !== -1) {
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
                rating: checkOutForm.rating,
            } as any;
            const res = await fetch(`${beBaseUrl}/booking/checkOut/${activeId}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
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
                                        {!it.hasCheckIn && (
                                            <Button size="sm" onClick={() => openCheckInDialog(it.scheduleId)}>Check-in</Button>
                                        )}
                                        {it.hasCheckIn && !it.hasCheckOut && (
                                            <Button size="sm" variant="outline" onClick={() => openCheckOutDialog(it.scheduleId)}>Check-out</Button>
                                        )}
                                        {it.hasCheckIn && it.hasCheckOut && (
                                            <Button size="sm" variant="ghost">Xem chi tiết</Button>
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
                            <div>
                                <div className="text-sm mb-1">Đánh giá</div>
                                <Select value={String(checkOutForm.rating)} onValueChange={(v) => setCheckOutForm(prev => ({...prev, rating: Number(v)}))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn sao"/></SelectTrigger>
                                    <SelectContent>
                                        {[1,2,3,4,5].map(n => (<SelectItem key={n} value={String(n)}>{n} sao</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button onClick={submitCheckOut}>Xác nhận</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}


