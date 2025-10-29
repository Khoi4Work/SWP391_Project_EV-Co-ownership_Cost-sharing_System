import {useEffect, useRef, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Calendar, Clock, Car, Edit, X, Check, AlertCircle} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

// ===== INTERFACES =====
interface OverrideInfo {
    userId: number;
    groupId: number;
    overridesUsed: number;
    overridesRemaining: number;
    maxOverridesPerMonth: number;
    currentMonth: string;
    nextResetDate: string;
}

interface BookingSlot {
    scheduleId: number;
    time: string;
    date: string;
    brand: string;
    model: string;
    vehicleId: number;
    bookedBy: string;
    userId: number;
    groupId: number;
    status: string;
    ownershipPercentage: number;
}

interface Vehicle {
    vehicleId: number;
    plateNo: string;
    brand: string;
    model: string;
    color: string;
    batteryCapacity: number;
    price: number;
    imageUrl: string | null;
    createdAt: string;
    groupId: number;
    groupName: string;
}

interface ToastMessage {
    id: number;
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
}

export default function VehicleBooking() {
    // ===== CONSOLIDATED STATE =====
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [vehiclesError, setVehiclesError] = useState<string | null>(null);
    const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [overrideInfo, setOverrideInfo] = useState<OverrideInfo | null>(null);
    const [loadingOverrideInfo, setLoadingOverrideInfo] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [daysUsedThisMonth, setDaysUsedThisMonth] = useState(0);
    const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<number | null>(null);

    // Booking Form State
    const [bookingForm, setBookingForm] = useState({
        vehicle: "",
        date: "",
        time: "",
        startTime: "",
        endTime: "",
        showTimeSelector: false
    });

    // Edit Form State
    const [editForm, setEditForm] = useState({
        bookingId: null as number | null,
        vehicle: "",
        date: "",
        time: "",
        startTime: "",
        endTime: "",
        showTimeSelector: false
    });

    // ===== REFS & CONSTANTS =====
    const bookingsListRef = useRef<HTMLDivElement | null>(null);
    const USE_MOCK = true; // bật DB ảo, không cần BE
    const beBaseUrl = "http://localhost:8080";
    const currentUserId = USE_MOCK ? 2 : Number(localStorage.getItem("userId"));
    const token = USE_MOCK ? null : localStorage.getItem("accessToken");
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

    // ===== HELPER FUNCTIONS =====
    const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
        const id = Date.now();
        setToasts(prev => [...prev, {id, title, description, variant}]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const getHeaders = () => ({
        "Content-Type": "application/json",
        ...(token ? {"Authorization": `Bearer ${token}`} : {})
    });

    const toLocalDateTime = (date: string, hhmm: string) => `${date}T${hhmm}:00`;

    const toMinutes = (hhmm: string) => {
        const [hh, mm] = hhmm.split(":").map(Number);
        return hh * 60 + mm;
    };

    const parseRange = (range: string) => {
        const [start, end] = range.split('-');
        return {start: toMinutes(start), end: toMinutes(end)};
    };

    const isSameMonth = (dateA: string, dateB: string) => {
        const a = new Date(dateA);
        const b = new Date(dateB);
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    };

    const getUserBookedUniqueDaysInMonth = (targetDate: string) => {
        const set = new Set<string>();
        existingBookings.forEach(booking => {
            if (booking.userId === currentUserId && isSameMonth(booking.date, targetDate)) {
                set.add(booking.date);
            }
        });
        return set;
    };

    const getHighestOwnershipByGroup = (groupId: number): number => {
        const bookingsInGroup = existingBookings.filter(b => b.groupId === groupId);
        return bookingsInGroup.length > 0 ? Math.max(...bookingsInGroup.map(b => b.ownershipPercentage || 0)) : 0;
    };

    const handleScheduleError = (errorText: string) => {
        const errorMap: Record<string, [string, string]> = {
            "Override limit exceeded": ["Đã hết lượt override", "Bạn đã dùng hết 3 lượt override trong tháng này."],
            "lower than existing booking": ["Không thể override", "Ownership của bạn thấp hơn người đã đặt lịch này."],
            "Equal ownership": ["Không thể override", "Ownership bằng nhau - người đặt trước được ưu tiên."],
            "Cannot override schedule starting within 24 hours": ["Không thể override", "Chỉ có thể chèn lịch trước 24 tiếng."],
            "Cannot book schedule in the past": ["Lỗi thời gian", "Không thể đặt lịch trong quá khứ."],
            "End time must be after start time": ["Lỗi thời gian", "Thời gian kết thúc phải sau thời gian bắt đầu."]
        };

        for (const [key, [title, msg]] of Object.entries(errorMap)) {
            if (errorText.includes(key)) {
                showToast(title, msg, "destructive");
                return;
            }
        }
        showToast("Lỗi", errorText, "destructive");
    };

    const validateTimeRange = (date: string, start: string, end: string) => {
        const startDateTime = new Date(`${date}T${start}:00`);
        const endDateTime = new Date(`${date}T${end}:00`);
        const now = new Date();

        if (startDateTime < now) throw new Error("Không thể đặt lịch trong quá khứ");
        if (endDateTime < now) throw new Error("Thời gian kết thúc phải ở tương lai");
        if (endDateTime <= startDateTime) throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
        return true;
    };

    // ===== API FUNCTIONS =====
    const apiCall = async (endpoint: string, method: string = "GET", body?: any) => {
        if (USE_MOCK) throw new Error("MOCK_MODE");
        const res = await fetch(`${beBaseUrl}${endpoint}`, {
            method,
            headers: getHeaders(),
            credentials: "include",
            ...(body && {body: JSON.stringify(body)})
        });
        if (!res.ok) throw new Error(await res.text());
        return method === "DELETE" ? null : res.json();
    };

    const loadGroupId = async () => {
        try {
            if (USE_MOCK) {
                const mockGroupIds = [1];
                localStorage.setItem("groupIds", JSON.stringify(mockGroupIds));
                localStorage.setItem("groupId", String(mockGroupIds[0]));
                return;
            }
            const groupIds: number[] = await apiCall(`/groupMember/getGroupIdsByUserId?userId=${currentUserId}`);
            if (!groupIds || groupIds.length === 0) {
                showToast("Thông báo", "Bạn chưa tham gia nhóm nào", "destructive");
                return;
            }
            localStorage.setItem("groupIds", JSON.stringify(groupIds));
            localStorage.setItem("groupId", groupIds[0].toString());
        } catch (error: any) {
            showToast("Lỗi", "Không thể lấy thông tin nhóm", "destructive");
        }
    };

    const loadVehicles = async () => {
        setLoadingVehicles(true);
        setVehiclesError(null);
        try {
            const groupIdsStr = localStorage.getItem("groupIds");
            if (!groupIdsStr) {
                setVehicles([]);
                setVehiclesError("Chưa có thông tin nhóm");
                return;
            }

            const groupIds: number[] = JSON.parse(groupIdsStr);
            let vehiclesArr: Vehicle[] = [];
            if (USE_MOCK) {
                // DB ảo: danh sách xe mẫu theo group
                const mockAll: Vehicle[] = [
                    { vehicleId: 101, plateNo: "51A-123.45", brand: "VinFast", model: "VF8", color: "White", batteryCapacity: 82, price: 0, imageUrl: null, createdAt: new Date().toISOString(), groupId: 1, groupName: "Nhóm HCM - Q1" },
                    { vehicleId: 102, plateNo: "51A-678.90", brand: "Hyundai", model: "Kona Electric", color: "Blue", batteryCapacity: 64, price: 0, imageUrl: null, createdAt: new Date().toISOString(), groupId: 1, groupName: "Nhóm HCM - Q1" },
                    { vehicleId: 201, plateNo: "30H-000.11", brand: "Tesla", model: "Model 3", color: "Black", batteryCapacity: 60, price: 0, imageUrl: null, createdAt: new Date().toISOString(), groupId: 2, groupName: "Nhóm HN - Cầu Giấy" },
                ];
                vehiclesArr = mockAll.filter(v => groupIds.includes(v.groupId));
            } else {
                const fetchPromises = groupIds.map(groupId =>
                    apiCall(`/Schedule/vehicle?groupId=${groupId}&userId=${currentUserId}`).catch(() => null)
                );
                const allVehiclesData = await Promise.all(fetchPromises);
                vehiclesArr = allVehiclesData
                    .filter(data => data !== null)
                    .flatMap(data => Array.isArray(data) ? data : (data ? [data] : []));
            }

            setVehicles(vehiclesArr);
            if (vehiclesArr.length === 0) setVehiclesError("Các nhóm chưa có xe nào");
        } catch (error: any) {
            setVehicles([]);
            setVehiclesError(error.message || "Không thể tải danh sách xe");
            showToast("Lỗi", "Không thể tải danh sách xe", "destructive");
        } finally {
            setLoadingVehicles(false);
        }
    };

    const loadBookings = async () => {
        setLoadingBookings(true);
        try {
            const groupIdsStr = localStorage.getItem('groupIds');
            if (!groupIdsStr) throw new Error("Không tìm thấy groupIds trong localStorage");

            const groupIds: number[] = JSON.parse(groupIdsStr);
            let formattedBookings: BookingSlot[] = [];
            if (USE_MOCK) {
                const raw = JSON.parse(localStorage.getItem("mockSchedules") || "[]");
                const filtered = raw.filter((r: any) => groupIds.includes(r.groupId));
                formattedBookings = filtered.map((item: any) => {
                    const start = new Date(item.startTime);
                    const end = new Date(item.endTime);
                    const date = start.toISOString().split('T')[0];
                    const startTime = start.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit', hour12: false});
                    const endTime = end.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit', hour12: false});
                    const vehicle = vehicles.find(v => v.vehicleId === item.vehicleId);
                    return {
                        scheduleId: item.scheduleId,
                        time: `${startTime}-${endTime}`,
                        date,
                        brand: vehicle?.brand || "Xe",
                        model: vehicle?.model || "",
                        vehicleId: item.vehicleId,
                        bookedBy: item.userName || "Bạn",
                        userId: item.userId,
                        groupId: item.groupId,
                        status: item.status,
                        ownershipPercentage: item.ownershipPercentage ?? 50
                    };
                });
            } else {
                const fetchPromises = groupIds.map(groupId => apiCall(`/Schedule/group/${groupId}`));
                const allBookingsArrays = await Promise.all(fetchPromises);
                const data = allBookingsArrays.flat();
                if (!Array.isArray(data)) throw new Error("API trả về không phải array");
                formattedBookings = data
                    .map((item: any) => {
                        if (!item.startTime || !item.endTime || !item.vehicleId) return null;
                        const startTime = new Date(item.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit', hour12: false});
                        const endTime = new Date(item.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit', hour12: false});
                        const date = new Date(item.startTime).toISOString().split('T')[0];
                        const vehicle = vehicles.find(v => v.vehicleId === item.vehicleId);
                        if (!vehicle) return null;
                        return {
                            scheduleId: item.scheduleId,
                            time: `${startTime}-${endTime}`,
                            date,
                            brand: vehicle.brand,
                            model: vehicle.model,
                            vehicleId: item.vehicleId,
                            bookedBy: item.userName,
                            userId: item.userId,
                            groupId: item.groupId,
                            status: item.status,
                            ownershipPercentage: item.ownershipPercentage
                        };
                    })
                    .filter((item): item is BookingSlot => item !== null);
            }

            setExistingBookings(formattedBookings);
        } catch (e: any) {
            showToast("Lỗi tải lịch", e.message, "destructive");
        } finally {
            setLoadingBookings(false);
        }
    };

    const loadOverrideInfo = async (groupId: number) => {
        setLoadingOverrideInfo(true);
        try {
            const data: OverrideInfo = await apiCall(`/Schedule/override-count?userId=${currentUserId}&groupId=${groupId}`);
            setOverrideInfo(data);
        } catch (error: any) {
            console.error("Error loading override info:", error);
        } finally {
            setLoadingOverrideInfo(false);
        }
    };

    // ===== EVENT HANDLERS =====
    const handleTimeSelection = (isEdit: boolean = false) => {
        const form = isEdit ? editForm : bookingForm;
        const setForm = isEdit ? setEditForm : setBookingForm;

        if (!form.startTime || !form.endTime) return;

        const timeRange = `${form.startTime}-${form.endTime}`;
        setForm(prev => ({...prev, time: timeRange, showTimeSelector: false}));
        showToast("Đã chọn thời gian", `Thời gian ${timeRange}`);
    };

    const handleBooking = async () => {

        if (daysUsedThisMonth > 3) {
            showToast("Vượt giới hạn trong tháng", "Bạn chỉ được đăng ký tối đa 14 ngày sử dụng trong 1 tháng.", "destructive");
            return;
        }

        try {
            const currentGroupId = localStorage.getItem("groupId");
            const [start, end] = bookingForm.time.split("-");

            if (USE_MOCK) {
                const storeKey = "mockSchedules";
                const list = JSON.parse(localStorage.getItem(storeKey) || "[]");
                const scheduleId = Date.now();
                list.push({
                    scheduleId,
                    startTime: toLocalDateTime(bookingForm.date, start),
                    endTime: toLocalDateTime(bookingForm.date, end),
                    status: "BOOKED",
                    groupId: Number(currentGroupId),
                    userId: currentUserId,
                    vehicleId: Number(bookingForm.vehicle),
                    ownershipPercentage: 50,
                    userName: "Bạn",
                });
                localStorage.setItem(storeKey, JSON.stringify(list));
            } else {
                await apiCall("/Schedule/register", "POST", {
                    startTime: toLocalDateTime(bookingForm.date, start),
                    endTime: toLocalDateTime(bookingForm.date, end),
                    status: "BOOKED",
                    groupId: currentGroupId,
                    userId: currentUserId,
                    vehicleId: Number(bookingForm.vehicle),
                });
            }

            await loadBookings();
            window.dispatchEvent(new CustomEvent('schedules-updated'));
            const groupId = Number(localStorage.getItem("groupId"));
            await loadOverrideInfo(groupId);

            const selectedVehicle = vehicles.find(v => String(v.vehicleId) === bookingForm.vehicle);
            showToast("Đặt lịch thành công", `Đã đặt ${selectedVehicle?.brand} ${selectedVehicle?.model} vào ${bookingForm.date} từ ${bookingForm.time}.`);

            setBookingForm({vehicle: "", date: "", time: "", startTime: "", endTime: "", showTimeSelector: false});
            bookingsListRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
        } catch (e: any) {
            handleScheduleError(e.message);
        }
    };

    const handleCancelBooking = async (scheduleId: number) => {
        try {
            if (USE_MOCK) {
                const storeKey = "mockSchedules";
                const list = JSON.parse(localStorage.getItem(storeKey) || "[]");
                const updated = list.map((b: any) => b.scheduleId === scheduleId ? {...b, status: "canceled"} : b);
                localStorage.setItem(storeKey, JSON.stringify(updated));
            } else {
                await apiCall(`/Schedule/delete/${scheduleId}`, "DELETE");
            }
            await loadBookings();
            window.dispatchEvent(new CustomEvent('schedules-updated'));
            showToast("Đã hủy lịch", "Lịch đặt xe đã được hủy thành công");
        } catch (e: any) {
            showToast("Lỗi hủy lịch", "Không thể hủy lịch. Vui lòng thử lại.", "destructive");
        }
    };

    const handleEditBooking = (scheduleId: number) => {
        const booking = existingBookings.find(b => b.scheduleId === scheduleId);
        if (booking) {
            const [startTime, endTime] = booking.time.split('-');
            setBookingForm({
                vehicle: "",
                date: "",
                time: "",
                startTime: "",
                endTime: "",
                showTimeSelector: false
            });
            setEditForm({
                bookingId: scheduleId,
                vehicle: String(booking.vehicleId),
                date: booking.date,
                time: booking.time,
                startTime: startTime || "",
                endTime: endTime || "",
                showTimeSelector: false
            });
        }
    };

    const handleCancelEdit = () => {
        setEditForm({
            bookingId: null,
            vehicle: "",
            date: "",
            time: "",
            startTime: "",
            endTime: "",
            showTimeSelector: false
        });
    };

    const handleUpdateBooking = async () => {
        try {
            const [start, end] = editForm.time.split("-");
            validateTimeRange(editForm.date, start, end);

            const currentGroupId = localStorage.getItem("groupId");
            if (USE_MOCK) {
                const storeKey = "mockSchedules";
                const list = JSON.parse(localStorage.getItem(storeKey) || "[]");
                const updated = list.map((b: any) => b.scheduleId === editForm.bookingId ? {
                    ...b,
                    startTime: toLocalDateTime(editForm.date, start),
                    endTime: toLocalDateTime(editForm.date, end),
                    groupId: Number(currentGroupId),
                    userId: currentUserId,
                    vehicleId: Number(editForm.vehicle)
                } : b);
                localStorage.setItem(storeKey, JSON.stringify(updated));
            } else {
                await apiCall(`/Schedule/update/${editForm.bookingId}`, "PUT", {
                    startTime: toLocalDateTime(editForm.date, start),
                    endTime: toLocalDateTime(editForm.date, end),
                    groupId: currentGroupId,
                    userId: currentUserId,
                    vehicleId: Number(editForm.vehicle),
                });
            }

            await loadBookings();
            window.dispatchEvent(new CustomEvent('schedules-updated'));
            const groupId = Number(localStorage.getItem("groupId"));
            await loadOverrideInfo(groupId);

            showToast("Cập nhật thành công", "Lịch đặt xe đã được cập nhật thành công");
            handleCancelEdit();
        } catch (e: any) {
            handleScheduleError(e.message);
        }
    };

    // ===== EFFECTS =====
    useEffect(() => {
        const initData = async () => {
            await loadGroupId();
            await loadVehicles();

            const groupIdsStr = localStorage.getItem("groupIds");
            if (groupIdsStr) {
                const groupIds: number[] = JSON.parse(groupIdsStr);
                if (groupIds.length > 0) await loadOverrideInfo(groupIds[0]);
            }
        };
        initData();
    }, []);

    useEffect(() => {
        if (vehicles && vehicles.length > 0) loadBookings();
    }, [vehicles]);

    useEffect(() => {
        const calculateDays = (date: string) => {
            if (!date) return 0;
            const daysSet = getUserBookedUniqueDaysInMonth(date);
            const alreadyCounted = daysSet.has(date);
            const prospectiveDaysCount = alreadyCounted ? daysSet.size : daysSet.size + 1;

            if (prospectiveDaysCount > 3 && !alreadyCounted) {
                showToast("Đã hết lượt đặt lịch", `Bạn đã sử dụng hết 14 ngày trong tháng.`, "destructive");
            } else if (prospectiveDaysCount === 3 && !alreadyCounted) {
                showToast("Sắp hết lượt đặt lịch", `Cảnh báo: Đây là ngày cuối cùng trong tháng này.`, "default");
            }
            return prospectiveDaysCount;
        };

        if (bookingForm.date) {
            setDaysUsedThisMonth(calculateDays(bookingForm.date));
        }

        if (editForm.date && editForm.bookingId) {
            const currentBooking = existingBookings.find(b => b.scheduleId === editForm.bookingId);
            if (currentBooking?.date && currentBooking.date !== editForm.date) {
                calculateDays(editForm.date);
            }
        }
    }, [bookingForm.date, editForm.date, existingBookings, editForm.bookingId]);

    // ===== TIME SLOT CHECKER =====
    const isTimeSlotDisabled = (time: string, isEdit: boolean, isEndTime: boolean = false) => {
        const form = isEdit ? editForm : bookingForm;
        const filteredBookings = existingBookings.filter(
            b => String(b.vehicleId) === String(form.vehicle) &&
                b.date === form.date &&
                b.status !== "canceled" &&
                b.status !== "overridden" &&
                (isEdit ? b.scheduleId !== editForm.bookingId : true)
        );

        const isBookedByOthers = filteredBookings.some(b => {
            const [bookedStart, bookedEnd] = b.time.split('-');
            return (isEndTime ? bookedEnd === time : bookedStart === time) && b.userId !== currentUserId;
        });

        const noOverrideLeft = overrideInfo && overrideInfo.overridesRemaining === 0;
        return (isEndTime && form.startTime && time <= form.startTime) || (isBookedByOthers && noOverrideLeft);
    };

    // ===== RENDER TIME SELECTOR DIALOG =====
    const renderTimeSelector = (isEdit: boolean) => {
        const form = isEdit ? editForm : bookingForm;
        const setForm = isEdit ? setEditForm : setBookingForm;
        const open = form.showTimeSelector;

        const filteredBookings = existingBookings.filter(
            b => String(b.vehicleId) === String(form.vehicle) &&
                b.date === form.date &&
                b.status !== "canceled" &&
                b.status !== "overridden" &&
                (isEdit ? b.scheduleId !== editForm.bookingId : true)
        );

        const highestOwnership = filteredBookings.length > 0
            ? Math.max(...filteredBookings.map(b => b.ownershipPercentage || 0))
            : 0;

        return (
            <Dialog open={open} onOpenChange={(val) => setForm(prev => ({...prev, showTimeSelector: val}))}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5"/>
                            <span>Chọn khung giờ sử dụng</span>
                        </DialogTitle>
                        <div className="text-muted-foreground text-sm mt-1">
                            Chọn khung giờ và xem các khung giờ đã đăng ký cho xe/ngày này.
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {overrideInfo && overrideInfo.overridesRemaining === 1 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                                    <div className="text-sm text-red-800">
                                        <p className="font-medium">Cảnh báo: Bạn chỉ còn 1 lượt override trong tháng</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {form.vehicle && form.date && (
                            <div className="mb-2">
                                <div className="text-sm font-medium mb-1">Lịch đã đăng ký cho xe này:</div>
                                <div className="space-y-2">
                                    {filteredBookings.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">Chưa có lịch nào</span>
                                    ) : (
                                        filteredBookings.map(b => {
                                            const isHighestOwner = b.ownershipPercentage === highestOwnership;
                                            const isOthersBooking = b.userId !== currentUserId;
                                            const noOverrideLeft = overrideInfo && overrideInfo.overridesRemaining === 0;
                                            const shouldDim = isOthersBooking && noOverrideLeft;

                                            return (
                                                <div
                                                    key={b.scheduleId}
                                                    className="flex items-center gap-3 px-3 py-2 rounded border bg-gray-50 text-xs cursor-pointer hover:bg-gray-100"
                                                    title="Bấm để điền nhanh giờ bắt đầu/kết thúc"
                                                    onClick={() => {
                                                        const [s, e] = (b.time || "").split('-');
                                                        setForm(prev => ({...prev, startTime: s || "", endTime: e || ""}));
                                                    }}
                                                >
                                                    <span className="text-gray-700">{b.date}</span>
                                                    <span className="font-semibold text-blue-700">{b.time}</span>
                                                    <span className="text-gray-700">{b.brand} {b.model}</span>
                                                    <span className="text-gray-500">Người đặt: {b.bookedBy}</span>
                                                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                                                        isHighestOwner ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                                    }`}>
                                                        {b.ownershipPercentage.toFixed(1)}%
                                                    </span>
                                                    <span className="text-gray-500">Trạng thái: {b.status}</span>
                                                    {shouldDim && (
                                                        <span className="text-red-600 font-medium">(Không thể override - Hết lượt)</span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                                <Select value={form.startTime}
                                        onValueChange={(val) => setForm(prev => ({...prev, startTime: val}))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn giờ bắt đầu"/></SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map(time => {
                                            const shouldDisable = isTimeSlotDisabled(time, isEdit, false);
                                            return (
                                                <SelectItem key={time} value={time} disabled={shouldDisable}
                                                            className={shouldDisable ? "opacity-50 cursor-not-allowed line-through" : ""}>
                                                    {time}
                                                    {shouldDisable}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                                <Select value={form.endTime}
                                        onValueChange={(val) => setForm(prev => ({...prev, endTime: val}))}>
                                    <SelectTrigger><SelectValue placeholder="Chọn giờ kết thúc"/></SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map(time => {
                                            const shouldDisable = isTimeSlotDisabled(time, isEdit, true);
                                            return (
                                                <SelectItem key={time} value={time} disabled={shouldDisable}
                                                            className={shouldDisable ? "opacity-50 cursor-not-allowed line-through" : ""}>
                                                    {time}
                                                    {shouldDisable}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <Button onClick={() => handleTimeSelection(isEdit)}
                                    disabled={!form.startTime || !form.endTime}>
                                <Check className="h-4 w-4 mr-2"/>Chọn
                            </Button>
                            <Button variant="outline" onClick={() => setForm(prev => ({
                                ...prev,
                                showTimeSelector: false,
                                startTime: "",
                                endTime: ""
                            }))}>
                                <X className="h-4 w-4 mr-2"/>Hủy
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    // ===== RENDER =====
    return (
        <div className="relative">
            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div key={toast.id}
                         className={`p-4 rounded-lg shadow-lg border min-w-[300px] ${toast.variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                className={`h-5 w-5 mt-0.5 ${toast.variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`}/>
                            <div className="flex-1">
                                <div className="font-semibold">{toast.title}</div>
                                <div className="text-sm mt-1 opacity-90">{toast.description}</div>
                            </div>
                            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                    className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5"/>
                        <span>Đặt lịch sử dụng xe</span>
                    </CardTitle>
                    <CardDescription>Lên lịch sử dụng xe điện trong nhóm đồng sở hữu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Booking Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Chọn xe</label>
                            <Select value={bookingForm.vehicle}
                                    onValueChange={(val) => setBookingForm(prev => ({...prev, vehicle: val}))}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingVehicles ? "Đang tải..." : "Chọn xe"}>
                                        {bookingForm.vehicle && vehicles.find(v => String(v.vehicleId) === bookingForm.vehicle) && (
                                            <div className="flex items-center space-x-2">
                                                <Car className="h-4 w-4"/>
                                                <span>{vehicles.find(v => String(v.vehicleId) === bookingForm.vehicle)?.brand} {vehicles.find(v => String(v.vehicleId) === bookingForm.vehicle)?.model} {vehicles.find(v => String(v.vehicleId) === bookingForm.vehicle)?.groupName}</span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {vehiclesError &&
                                        <div className="px-3 py-2 text-sm text-destructive">{vehiclesError}</div>}
                                    {!vehiclesError && vehicles.length === 0 && !loadingVehicles && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">Không có xe nào</div>
                                    )}
                                    {!vehiclesError && vehicles.map((vehicle) => (
                                        <SelectItem key={vehicle.vehicleId} value={String(vehicle.vehicleId)}>
                                            <div className="flex items-center space-x-2">
                                                <Car className="h-4 w-4"/>
                                                <span>{vehicle.brand} {vehicle.model} {vehicle.groupName}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Chọn ngày</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                value={bookingForm.date}
                                onChange={(e) => setBookingForm(prev => ({...prev, date: e.target.value, time: ""}))}
                                onBlur={(e) => {
                                    const selectedValue = e.target.value;
                                    const today = new Date().toISOString().split('T')[0];
                                    if (selectedValue && selectedValue < today) {
                                        showToast("Ngày không hợp lệ", "Không thể chọn ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi.", "destructive");
                                        setBookingForm(prev => ({...prev, date: ""}));
                                    }
                                }}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
                            <Button variant="outline" className="w-full justify-start text-left font-normal"
                                    onClick={() => setBookingForm(prev => ({...prev, showTimeSelector: true}))}
                                    disabled={!bookingForm.vehicle || !bookingForm.date}>
                                <Clock className="h-4 w-4 mr-2"/>
                                {bookingForm.time ? bookingForm.time : "Chọn khung giờ"}
                            </Button>
                        </div>
                    </div>

                    {/* Override Info */}
                    {overrideInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600"/>
                                    <span className="font-medium text-blue-900">Thông tin Override</span>
                                </div>
                                <Badge variant={overrideInfo.overridesRemaining > 0 ? "default" : "destructive"}>
                                    {overrideInfo.overridesRemaining}/{overrideInfo.maxOverridesPerMonth} lượt còn lại
                                </Badge>
                            </div>
                            <div className="mt-2 text-sm text-blue-800">
                                <p>Đã sử dụng: <span className="font-semibold">{overrideInfo.overridesUsed}</span> lượt
                                    trong tháng {overrideInfo.currentMonth}</p>
                                <p className="text-xs text-blue-600 mt-1">Reset vào: {overrideInfo.nextResetDate}</p>
                            </div>
                            {overrideInfo.overridesRemaining === 0 && (
                                <div className="mt-2 text-xs text-red-600 font-medium">
                                    ⚠️ Bạn đã hết lượt override trong tháng này. Chỉ có thể đặt khung giờ trống.
                                </div>
                            )}
                        </div>
                    )}

                    <Button onClick={handleBooking} className="w-full"
                            disabled={!bookingForm.vehicle || !bookingForm.date || !bookingForm.time || daysUsedThisMonth > 3}>
                        {daysUsedThisMonth > 3 ? "Đã hết lượt đặt lịch tháng này" : "Đặt lịch"}
                    </Button>

                    {/* Time Selector Dialog */}
                    {renderTimeSelector(false)}

                    {/* Edit Dialog */}
                    {editForm.bookingId && (
                        <Dialog open={!!editForm.bookingId} onOpenChange={handleCancelEdit}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Chỉnh sửa lịch đặt</DialogTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Chỉnh sửa thông tin xe, ngày và khung giờ sử dụng.
                                    </p>
                                </DialogHeader>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Chọn xe</label>
                                    <Select value={editForm.vehicle}
                                            onValueChange={(val) => setEditForm(prev => ({...prev, vehicle: val}))}>
                                        <SelectTrigger><SelectValue placeholder="Chọn xe"/></SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.vehicleId} value={String(vehicle.vehicleId)}>
                                                    {vehicle.brand} {vehicle.model} - {vehicle.groupName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Chọn ngày</label>
                                    <input
                                        type="date"
                                        value={editForm.date}
                                        className="w-full p-2 border rounded-md"
                                        onChange={(e) => setEditForm(prev => ({
                                            ...prev,
                                            date: e.target.value,
                                            time: ""
                                        }))}
                                        onBlur={(e) => {
                                            const selectedValue = e.target.value;
                                            const today = new Date().toISOString().split("T")[0];
                                            if (selectedValue && selectedValue < today) {
                                                showToast("Ngày không hợp lệ", "Không thể chọn ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi.", "destructive");
                                                setEditForm(prev => ({...prev, date: ""}));
                                            }
                                        }}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Chọn giờ</label>
                                    <Button variant="outline" className="w-full justify-start"
                                            onClick={() => setEditForm(prev => ({...prev, showTimeSelector: true}))}
                                            disabled={!editForm.vehicle || !editForm.date}>
                                        <Clock className="mr-2 h-4 w-4"/>
                                        {editForm.time ? editForm.time : "Chọn khung giờ"}
                                    </Button>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={handleCancelEdit}>Hủy chỉnh sửa</Button>
                                    <Button onClick={handleUpdateBooking}
                                            disabled={(() => {
                                                if (!editForm.date || !editForm.vehicle || !editForm.time) return true;
                                                const currentBooking = existingBookings.find(b => b.scheduleId === editForm.bookingId);
                                                const originalDate = currentBooking?.date;
                                                if (originalDate === editForm.date) return false;
                                                const daysSet = getUserBookedUniqueDaysInMonth(editForm.date);
                                                const alreadyCounted = daysSet.has(editForm.date);
                                                const prospectiveDaysCount = alreadyCounted ? daysSet.size : daysSet.size + 1;
                                                return prospectiveDaysCount > 3;
                                            })()}>
                                        {(() => {
                                            if (!editForm.date) return "Cập nhật";
                                            const currentBooking = existingBookings.find(b => b.scheduleId === editForm.bookingId);
                                            const originalDate = currentBooking?.date;
                                            if (originalDate === editForm.date) return "Cập nhật";
                                            const daysSet = getUserBookedUniqueDaysInMonth(editForm.date);
                                            const alreadyCounted = daysSet.has(editForm.date);
                                            const prospectiveDaysCount = alreadyCounted ? daysSet.size : daysSet.size + 1;
                                            return prospectiveDaysCount > 3 ? "Đã hết lượt tháng này" : "Cập nhật";
                                        })()}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Edit Time Selector */}
                    {renderTimeSelector(true)}

                    {/* Bookings List */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                            <Clock className="h-4 w-4"/>
                            <span>Lịch đã đặt</span>
                        </h4>
                        <div ref={bookingsListRef} className="space-y-3">
                            {loadingBookings ? (
                                <div className="text-center py-4 text-muted-foreground">Đang tải...</div>
                            ) : existingBookings.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">Chưa có lịch đặt nào</div>
                            ) : (
                                existingBookings
                                    .filter(booking => booking.status !== "overridden")
                                    .map((booking) => {
                                        const highestOwnershipInGroup = getHighestOwnershipByGroup(booking.groupId);
                                        const isHighestOwnerInGroup = booking.ownershipPercentage === highestOwnershipInGroup;

                                        return (
                                            <div key={booking.scheduleId}
                                                 className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                                                     editForm.bookingId === booking.scheduleId ? 'bg-primary/10 border-primary/50' :
                                                         newlyCreatedBooking === booking.scheduleId ? 'bg-green-100 border-green-300 shadow-lg' :
                                                             booking.status === "canceled" ? 'bg-gray-100 opacity-50' :
                                                                 'bg-accent/20'
                                                 }`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Car className="h-4 w-4"/>
                                                            <span
                                                                className="font-medium">{booking.brand} {booking.model}</span>
                                                        </div>
                                                        <Badge variant="secondary">{booking.bookedBy}</Badge>
                                                        {booking.ownershipPercentage !== undefined && (
                                                            <Badge variant="outline"
                                                                   className={isHighestOwnerInGroup
                                                                       ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold"
                                                                       : "bg-green-50 text-green-700 border-green-300"}>
                                                                {booking.ownershipPercentage.toFixed(1)}%
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant={booking.status === "BOOKED" ? "outline" : "default"}
                                                            className={booking.status === "canceled"
                                                                ? "bg-red-100 text-red-700 border-red-300 font-semibold"
                                                                : booking.status === "BOOKED"
                                                                    ? "bg-green-100 text-green-700 border-green-300 font-semibold"
                                                                    : ""}>
                                                            {booking.status}
                                                        </Badge>
                                                        {newlyCreatedBooking === booking.scheduleId &&
                                                            <Badge className="bg-green-100 text-green-800">Mới</Badge>}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {booking.date} • {booking.time}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {booking.userId === currentUserId && (booking.status === "BOOKED" || booking.status === "booked") && (
                                                        <>
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleEditBooking(booking.scheduleId)}
                                                                    disabled={editForm.bookingId === booking.scheduleId}>
                                                                <Edit className="h-4 w-4 mr-1"/>Sửa
                                                            </Button>
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleCancelBooking(booking.scheduleId)}>
                                                                <X className="h-4 w-4 mr-1"/>Hủy
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
