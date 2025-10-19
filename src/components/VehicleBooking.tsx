import {useEffect, useRef, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Calendar, Clock, Car, Edit, X, Check, AlertCircle} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

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
    // ===== STATE DECLARATIONS =====
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [vehiclesError, setVehiclesError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");
    const [showTimeSelector, setShowTimeSelector] = useState(false);
    const [editingBooking, setEditingBooking] = useState<number | null>(null);
    const [editVehicle, setEditVehicle] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");
    const [showEditTimeSelector, setShowEditTimeSelector] = useState(false);
    const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<number | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [overrideInfo, setOverrideInfo] = useState<OverrideInfo | null>(null);
    const [loadingOverrideInfo, setLoadingOverrideInfo] = useState(false);

    // ===== REFS =====
    const bookingsListRef = useRef<HTMLDivElement | null>(null);

    // ===== CONSTANTS =====
    const beBaseUrl = "http://localhost:8080";
    const currentUserId = Number(localStorage.getItem("userId"));
    const currentUserName = localStorage.getItem("hovaten");
    const token = localStorage.getItem("accessToken");
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

    // ===== HELPER FUNCTIONS =====
    const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
        const id = Date.now();
        setToasts(prev => [...prev, {id, title, description, variant}]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);

    };

    const getHighestOwnershipByGroup = (groupId: number): number => {
        const bookingsInGroup = existingBookings.filter(b => b.groupId === groupId);
        if (bookingsInGroup.length === 0) return 0;
        return Math.max(...bookingsInGroup.map(b => b.ownershipPercentage || 0));
    };
    // ===== API FUNCTIONS =====
    const loadGroupId = async () => {
        try {
            console.log("Loading groupId for userId:", currentUserId);

            const groupRes = await fetch(
                `${beBaseUrl}/groupMember/getGroupIdsByUserId?userId=${currentUserId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    credentials: "include"
                }
            );

            if (!groupRes.ok) {
                throw new Error("Không thể lấy thông tin nhóm");
            }

            const groupIds: number[] = await groupRes.json();

            if (!groupIds || groupIds.length === 0) {
                showToast("Thông báo", "Bạn chưa tham gia nhóm nào", "destructive");
                return;
            }

            localStorage.setItem("groupIds", JSON.stringify(groupIds));

            localStorage.setItem("groupId", groupIds[0].toString());

            console.log("✅ All GroupIds loaded:", groupIds);
            console.log("✅ Default GroupId for vehicles:", groupIds[0]);

        } catch (error: any) {
            console.error("❌ Error loading groupId:", error);
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
            console.log("Loading vehicles for all groupIds:", groupIds);

            // Tạo array các fetch promises cho mỗi groupId
            const fetchPromises = groupIds.map(groupId =>
                fetch(
                    `${beBaseUrl}/Schedule/vehicle?groupId=${groupId}&userId=${currentUserId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? {"Authorization": `Bearer ${token}`} : {})
                        },
                        credentials: "include"
                    }
                ).then(async res => {
                    console.log(`Vehicles API response for group ${groupId}:`, res.status);

                    if (!res.ok) {
                        console.warn(`Failed to load vehicles for group ${groupId}`);
                        return null;
                    }

                    return res.json();
                })
            );

            const allVehiclesData = await Promise.all(fetchPromises);

            console.log("All vehicles data:", allVehiclesData);

            const vehiclesArr: Vehicle[] = allVehiclesData
                .filter(data => data !== null)
                .flatMap(data => Array.isArray(data) ? data : (data ? [data] : []));

            console.log("✅ Xe được  tải lên từ tất cả các nhóm:", vehiclesArr.length);

            setVehicles(vehiclesArr);

            if (vehiclesArr.length === 0) {
                setVehiclesError("Các nhóm chưa có xe nào");
            }

        } catch (error: any) {
            console.error("❌ Error loading vehicles:", error);
            setVehicles([]);
            setVehiclesError(error.message || "Không thể tải danh sách xe");
            showToast("Lỗi", "Không thể tải danh sách xe", "destructive");
        } finally {
            setLoadingVehicles(false);
        }
    };

    const loadBookings = async () => {
        setLoadingBookings(true);

        console.log("=== Loading Bookings ===");
        console.log("Current vehicles count:", vehicles.length);

        try {
            const groupIdsStr = localStorage.getItem('groupIds');

            if (!groupIdsStr) {
                throw new Error("Không tìm thấy groupIds trong localStorage");
            }

            // Parse JSON string thành array
            const groupIds: number[] = JSON.parse(groupIdsStr);
            console.log("Loading bookings for groupIds:", groupIds);

            // Tạo array các fetch promises cho mỗi groupId
            const fetchPromises = groupIds.map(groupId =>
                fetch(`${beBaseUrl}/Schedule/group/${groupId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? {"Authorization": `Bearer ${token}`} : {})
                    },
                    credentials: "include"
                }).then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status} for group ${groupId}`);
                    }
                    return res.json();
                })
            );

            // Chờ tất cả requests hoàn thành
            const allBookingsArrays = await Promise.all(fetchPromises);

            // Merge tất cả arrays thành một array duy nhất
            const data = allBookingsArrays.flat();

            console.log("Bookings raw data from all groups:", data);
            console.log("Is array:", Array.isArray(data));
            console.log("Data length:", data?.length || 0);

            if (!Array.isArray(data)) {
                throw new Error("API trả về không phải array");
            }

            if (data.length === 0) {
                console.warn("⚠️ Không có booking nào");
                setExistingBookings([]);
                return;
            }

            console.log("First booking item:", data[0]);

            const formattedBookings: BookingSlot[] = data
                .map((item: any, index: number) => {
                    try {
                        // Validate required fields
                        if (!item.startTime || !item.endTime || !item.vehicleId) {
                            console.warn(`⚠️ Item ${index} thiếu fields:`, item);
                            return null;
                        }

                        const startTime = new Date(item.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });

                        const endTime = new Date(item.endTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });

                        const date = new Date(item.startTime).toISOString().split('T')[0];

                        // Find vehicle
                        const vehicle = vehicles.find(v => v.vehicleId === item.vehicleId);

                        if (!vehicle) {
                            console.error(`❌ Không tìm thấy vehicle ID ${item.vehicleId}`);
                            console.log("Available vehicle IDs:", vehicles.map(v => v.vehicleId));
                            return null;
                        }

                        return {
                            scheduleId: item.scheduleId,
                            time: `${startTime}-${endTime}`,
                            date: date,
                            brand: vehicle.brand,
                            model: vehicle.model,
                            vehicleId: item.vehicleId,
                            bookedBy: item.userName,
                            userId: item.userId,
                            groupId: item.groupId,
                            status: item.status,
                            ownershipPercentage: item.ownershipPercentage
                        };
                    } catch (itemError: any) {
                        console.error(`❌ Lỗi xử lý item ${index}:`, itemError.message);
                        return null;
                    }
                })
                .filter((item): item is BookingSlot => item !== null);

            console.log("✅ Formatted bookings:", formattedBookings.length);
            if (formattedBookings.length > 0) {
                console.log("Sample booking:", formattedBookings[0]);
            }

            setExistingBookings(formattedBookings);

        } catch (e: any) {
            console.error("❌ Error loading bookings:", e.message);
            showToast("Lỗi tải lịch", e.message, "destructive");
        } finally {
            setLoadingBookings(false);
            console.log("=== End Loading Bookings ===");
        }
    };
    const loadOverrideInfo = async (groupId: number) => {
        setLoadingOverrideInfo(true);
        try {
            const res = await fetch(
                `${beBaseUrl}/Schedule/override-count?userId=${currentUserId}&groupId=${groupId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    credentials: "include"
                }
            );

            if (!res.ok) {
                throw new Error("Không thể lấy thông tin override");
            }

            const data: OverrideInfo = await res.json();
            console.log("✅ Override info loaded:", data);
            setOverrideInfo(data);
        } catch (error: any) {
            console.error("❌ Error loading override info:", error);
        } finally {
            setLoadingOverrideInfo(false);
        }
    };


    // Effect 1: Initialize data on mount
    useEffect(() => {
        const initData = async () => {
            console.log("=== Initializing Data ===");
            await loadGroupId();
            await loadVehicles();

            // Load override info sau khi có groupId
            const groupIdsStr = localStorage.getItem("groupIds");
            if (groupIdsStr) {
                const groupIds: number[] = JSON.parse(groupIdsStr);
                if (groupIds.length > 0) {
                    await loadOverrideInfo(groupIds[0]); // Load cho group đầu tiên
                }
            }
        };

        initData();
    }, []); // Run once on mount


    // Effect 2: Load bookings when vehicles are available
    useEffect(() => {
        console.log("=== Vehicles State Changed ===");
        console.log("Vehicles length:", vehicles.length);

        if (vehicles && vehicles.length > 0) {
            console.log("✅ Vehicles ready, loading bookings");
            loadBookings();
        }
    }, [vehicles]); // Run when vehicles change


    const toLocalDateTime = (date: string, hhmm: string) => {
        const [hh, mm] = hhmm.split(":");
        return `${date}T${hh}:${mm}:00`;
    };

    const getSelectedVehicleName = () => {
        const v = vehicles.find(v => String(v.vehicleId) === String(selectedVehicle));
        return v ? `${v.brand} ${v.model}` : "";
    };

    const toMinutes = (hhmm: string) => {
        const [hh, mm] = hhmm.split(":").map(Number);
        return hh * 60 + mm;
    };

    const parseRange = (range: string) => {
        const [start, end] = range.split('-');
        return {start: toMinutes(start), end: toMinutes(end)};
    };

    const rangesOverlap = (a: string, b: string) => {
        const ra = parseRange(a);
        const rb = parseRange(b);
        return ra.start < rb.end && ra.end > rb.start;
    };

    const isSameMonth = (dateA: string, dateB: string) => {
        const a = new Date(dateA);
        const b = new Date(dateB);
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    };

    const getUserBookedUniqueDaysInMonth = (targetDate: string) => {
        const set = new Set<string>();
        for (const booking of existingBookings) {
            if (booking.userId === currentUserId && isSameMonth(booking.date, targetDate)) {
                set.add(booking.date);
            }
        }
        return set;
    };

    const handleTimeSelection = () => {
        if (!selectedStartTime || !selectedEndTime) return;

        const timeRange = `${selectedStartTime}-${selectedEndTime}`;

        setSelectedTime(timeRange);
        setShowTimeSelector(false);
        showToast("Đã chọn thời gian", `Thời gian ${timeRange}`);
    };


    const handleBooking = async () => {
        if (!selectedVehicle || !selectedDate || !selectedTime) {
            showToast("Thiếu thông tin", "Vui lòng chọn xe, ngày và khung giờ trước khi đặt.", "destructive");
            return;
        }

        // Validation về giới hạn 14 ngày/tháng (GIỮ LẠI)
        const daysSet = getUserBookedUniqueDaysInMonth(selectedDate);
        const alreadyCounted = daysSet.has(selectedDate);
        const prospectiveDaysCount = alreadyCounted ? daysSet.size : daysSet.size + 1;
        if (prospectiveDaysCount > 3) {
            showToast("Vượt giới hạn trong tháng", "Bạn chỉ được đăng ký tối đa 14 ngày sử dụng trong 1 tháng.", "destructive");
            return;
        }

        // KHÔNG check conflict nữa, để backend xử lý override logic

        // Gọi BE để tạo lịch mới
        try {
            const currentGroupId = localStorage.getItem("groupId");
            const [start, end] = selectedTime.split("-");

            console.log("Sending schedule request:", {
                startTime: toLocalDateTime(selectedDate, start),
                endTime: toLocalDateTime(selectedDate, end),
                status: "booked",
                groupId: currentGroupId,
                userId: currentUserId,
                vehicleId: Number(selectedVehicle)
            });

            const res = await fetch(`${beBaseUrl}/Schedule/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? {"Authorization": `Bearer ${token}`} : {})
                },
                credentials: "include",
                body: JSON.stringify({
                    startTime: toLocalDateTime(selectedDate, start),
                    endTime: toLocalDateTime(selectedDate, end),
                    status: "booked",
                    groupId: currentGroupId,
                    userId: currentUserId,
                    vehicleId: Number(selectedVehicle),
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Schedule creation failed:", {
                    status: res.status,
                    response: errorText
                });

                // Xử lý các loại error từ backend
                if (errorText.includes("Override limit exceeded")) {
                    showToast(
                        "Đã hết lượt override",
                        "Bạn đã dùng hết 3 lượt override trong tháng này.",
                        "destructive"
                    );
                } else if (errorText.includes("Lower ownership") || errorText.includes("Cannot override")) {
                    showToast(
                        "Không thể override",
                        "Ownership của bạn thấp hơn người đã đặt lịch này.",
                        "destructive"
                    );
                } else if (errorText.includes("Equal ownership")) {
                    showToast(
                        "Không thể override",
                        "Ownership bằng nhau - người đặt trước được ưu tiên.",
                        "destructive"
                    );
                } else {
                    showToast("Lỗi đặt lịch", errorText || "Không thể đặt lịch.", "destructive");
                }
                return;
            }

            // Thành công
            await loadBookings();

            // Reload override info
            const groupId = Number(localStorage.getItem("groupId"));
            await loadOverrideInfo(groupId);

            showToast("Đặt lịch thành công", `Đã đặt ${getSelectedVehicleName()} vào ${selectedDate} từ ${selectedTime}.`);

            // Reset form
            setSelectedVehicle("");
            setSelectedDate("");
            setSelectedTime("");
            setSelectedStartTime("");
            setSelectedEndTime("");

            if (bookingsListRef.current) {
                bookingsListRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
        } catch (e: any) {
            console.error("Booking error:", e);
            showToast("Lỗi đặt lịch", e.message || "Không thể đặt lịch. Vui lòng thử lại.", "destructive");
        }
    };


    // Sửa handleCancelBooking: gọi API BE để xóa lịch
    const handleCancelBooking = async (scheduleId: number) => {
        try {
            const res = await fetch(`${beBaseUrl}/Schedule/delete/${scheduleId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? {"Authorization": `Bearer ${token}`} : {})
                },
                credentials: "include",
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Schedule deletion failed:", {
                    status: res.status,
                    response: errorText
                });
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            // Reload bookings from backend after successful deletion
            await loadBookings();

            showToast("Đã hủy lịch", "Lịch đặt xe đã được hủy thành công");
        } catch (e) {
            console.error("Delete error:", e);
            showToast("Lỗi hủy lịch", "Không thể hủy lịch. Vui lòng thử lại.", "destructive");
        }
    };
    const handleEditBooking = (scheduleId: number) => {
        const booking = existingBookings.find(b => b.scheduleId === scheduleId);
        if (booking) {
            setEditingBooking(scheduleId);
            setEditVehicle(String(booking.vehicleId));
            setEditDate(booking.date);
            setEditTime(booking.time);
            const [startTime, endTime] = booking.time.split('-');
            setEditStartTime(startTime || "");
            setEditEndTime(endTime || "");
        }
    };

    const handleCancelEdit = () => {
        setEditingBooking(null);
        setEditVehicle("");
        setEditDate("");
        setEditTime("");
        setEditStartTime("");
        setEditEndTime("");
        setShowEditTimeSelector(false);
    };

    const handleEditTimeSelection = () => {
        if (!editStartTime || !editEndTime) return;
        const timeRange = `${editStartTime}-${editEndTime}`;
        const hasOverlap = existingBookings.filter(booking => booking.status !== "canceled")
            .some(booking =>
                booking.scheduleId !== editingBooking && booking.vehicleId === Number(editVehicle) && booking.date === editDate && rangesOverlap(booking.time, timeRange)
            );
        if (hasOverlap) {
            showToast("Xung đột thời gian", "Khung giờ bạn chọn bị chồng lấn với lịch đã đặt.", "destructive");
            return;
        }
        setEditTime(timeRange);
        setShowEditTimeSelector(false);
        showToast("Đã chọn thời gian", `Thời gian: ${timeRange}`);
    };

    // Sửa handleUpdateBooking: gọi API BE để cập nhật lịch
    const handleUpdateBooking = async () => {
        if (!editVehicle || !editDate || !editTime) {
            showToast("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin trước khi cập nhật.", "destructive");
            return;
        }

        try {
            const currentGroupId = localStorage.getItem("groupId");
            const [start, end] = editTime.split("-");

            console.log("Sending update request:", {
                scheduleId: editingBooking,
                startTime: toLocalDateTime(editDate, start),
                endTime: toLocalDateTime(editDate, end),
                groupId: currentGroupId,
                userId: currentUserId,
                vehicleId: Number(editVehicle)
            });

            const res = await fetch(`${beBaseUrl}/Schedule/update/${editingBooking}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? {"Authorization": `Bearer ${token}`} : {})
                },
                credentials: "include",
                body: JSON.stringify({
                    startTime: toLocalDateTime(editDate, start),
                    endTime: toLocalDateTime(editDate, end),
                    groupId: currentGroupId,
                    userId: currentUserId,
                    vehicleId: Number(editVehicle),
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Schedule update failed:", {
                    status: res.status,
                    response: errorText
                });
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            // Reload bookings from backend after successful update
            await loadBookings();

            showToast("Cập nhật thành công", "Lịch đặt xe đã được cập nhật thành công");
            handleCancelEdit();
        } catch (e) {
            console.error("Update error:", e);
            showToast("Lỗi cập nhật", "Không thể cập nhật lịch. Vui lòng thử lại.", "destructive");
        }
    };

    // Thêm log cho việc chọn xe
    const handleVehicleSelect = (vehicleId: string) => {
        console.log("Selected vehicle ID:", vehicleId);
        console.log("Available vehicles:", vehicles);
        const selectedVehicle = vehicles.find(v => String(v.vehicleId) === vehicleId);
        console.log("Selected vehicle details:", selectedVehicle);
        setSelectedVehicle(vehicleId);
    };

    return (
        <div className="relative">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Chọn xe</label>
                            <Select value={selectedVehicle} onValueChange={handleVehicleSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingVehicles ? "Đang tải..." : "Chọn xe"}>
                                        {selectedVehicle && vehicles.find(v => String(v.vehicleId) === selectedVehicle) && (
                                            <div className="flex items-center space-x-2">
                                                <Car className="h-4 w-4"/>
                                                <span>{vehicles.find(v => String(v.vehicleId) === selectedVehicle)?.brand} {vehicles.find(v => String(v.vehicleId) === selectedVehicle)?.model} {vehicles.find(v => String(v.vehicleId) === selectedVehicle)?.groupName}</span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {vehiclesError && (
                                        <div className="px-3 py-2 text-sm text-destructive">
                                            {vehiclesError}
                                        </div>
                                    )}
                                    {!vehiclesError && vehicles.length === 0 && !loadingVehicles && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            Không có xe nào
                                        </div>
                                    )}
                                    {!vehiclesError && vehicles.map((vehicle) => {
                                        return (
                                            <SelectItem key={vehicle.vehicleId} value={String(vehicle.vehicleId)}>
                                                <div className="flex items-center space-x-2">
                                                    <Car className="h-4 w-4"/>
                                                    <span>{vehicle.brand} {vehicle.model} {vehicle.groupName}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Chọn ngày</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime("");
                                }}
                                onBlur={(e) => {
                                    const selectedValue = e.target.value;
                                    const today = new Date().toISOString().split('T')[0];

                                    if (selectedValue && selectedValue < today) {
                                        showToast(
                                            "Ngày không hợp lệ",
                                            "Không thể chọn ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi.",
                                            "destructive"
                                        );
                                        setSelectedDate("");
                                    }
                                }}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
                            <Button variant="outline" className="w-full justify-start text-left font-normal"
                                    onClick={() => setShowTimeSelector(true)}
                                    disabled={!selectedVehicle || !selectedDate}>
                                <Clock className="h-4 w-4 mr-2"/>
                                {selectedTime ? selectedTime : "Chọn khung giờ"}
                            </Button>
                        </div>
                    </div>

                    {/* OVERRIDE INFO */}
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
                            disabled={!selectedVehicle || !selectedDate || !selectedTime}>Đặt lịch</Button>

                    {/* 5. DIALOG CHỌN THỜI GIAN VỚI WARNING - SỬA LẠI DIALOG NÀY */}
                    <Dialog open={showTimeSelector} onOpenChange={setShowTimeSelector}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5"/>
                                    <span>Chọn khung giờ sử dụng</span>
                                </DialogTitle>
                                <div id="dialog-time-desc" className="text-muted-foreground text-sm mt-1">
                                    Chọn khung giờ và xem các khung giờ đã đăng ký cho xe/ngày này.
                                </div>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* THÊM WARNING VỀ OVERRIDE */}
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
                                {overrideInfo && overrideInfo.overridesRemaining === 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5"/>
                                            <div className="text-sm text-red-800">
                                                <p className="font-medium">Cảnh báo: Đã hết lượt override</p>
                                                <p className="mt-1">Bạn chỉ có thể đặt khung giờ trống. Không thể
                                                    override lịch của người khác.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* HIỂN THỊ LỊCH ĐÃ ĐĂNG KÝ - SỬA FILTER ĐỂ ẨN "overridden" */}
                                {selectedVehicle && selectedDate && (
                                    <div className="mb-2">
                                        <div className="text-sm font-medium mb-1">Lịch đã đăng ký cho xe này:</div>
                                        <div className="space-y-2">
                                            {(() => {
                                                // Lọc bookings cho xe và ngày này
                                                const filteredBookings = existingBookings.filter(
                                                    b =>
                                                        String(b.vehicleId) === String(selectedVehicle) &&
                                                        b.date === selectedDate &&
                                                        b.status !== "canceled" &&
                                                        b.status !== "overridden"
                                                );

                                                // Tìm ownership cao nhất trong những bookings này
                                                const highestOwnership = filteredBookings.length > 0
                                                    ? Math.max(...filteredBookings.map(b => b.ownershipPercentage || 0))
                                                    : 0;

                                                // Nếu không có booking nào
                                                if (filteredBookings.length === 0) {
                                                    return <span className="text-xs text-muted-foreground">Chưa có lịch nào</span>;
                                                }

                                                // Render từng booking với màu động
                                                return filteredBookings.map(b => {
                                                    const isHighestOwner = b.ownershipPercentage === highestOwnership;
                                                    const isOthersBooking = b.userId !== currentUserId;
                                                    const noOverrideLeft = overrideInfo && overrideInfo.overridesRemaining === 0;
                                                    const shouldDim = isOthersBooking && noOverrideLeft;
                                                    return (
                                                        <div
                                                            key={b.scheduleId}
                                                            className="flex items-center gap-3 px-3 py-2 rounded border bg-gray-50 text-xs"
                                                        >
                                                            <span className="font-semibold text-blue-700">{b.time}</span>
                                                            <span className="text-gray-700">{b.brand} {b.model}</span>
                                                            <span className="text-gray-500">Người đặt: {b.bookedBy}</span>
                                                            {/* ✅ OWNERSHIP BADGE VỚI MÀU ĐỘNG */}
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full font-medium ${
                                                                    isHighestOwner
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : "bg-green-100 text-green-700"
                                                                }`}
                                                            >
                                {b.ownershipPercentage.toFixed(1)}%
                            </span>
                                                            <span className="text-gray-500">Trạng thái: {b.status}</span>
                                                            {shouldDim && (
                                                                <span className="text-red-600 font-medium">(Không thể override - Hết lượt)</span>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                                        <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                                            <SelectTrigger><SelectValue
                                                placeholder="Chọn giờ bắt đầu"/></SelectTrigger>
                                            <SelectContent>{timeSlots.map((time) => (<SelectItem key={time}
                                                                                                 value={time}>{time}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                                        <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                                            <SelectTrigger><SelectValue
                                                placeholder="Chọn giờ kết thúc"/></SelectTrigger>
                                            <SelectContent>{timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}
                                                            disabled={selectedStartTime && time <= selectedStartTime}>{time}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={handleTimeSelection}
                                            disabled={!selectedStartTime || !selectedEndTime}><Check
                                        className="h-4 w-4 mr-2"/>Chọn</Button>
                                    <Button variant="outline" onClick={() => {
                                        setShowTimeSelector(false);
                                        setSelectedStartTime("");
                                        setSelectedEndTime("");
                                    }}><X className="h-4 w-4 mr-2"/>Hủy</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showEditTimeSelector} onOpenChange={setShowEditTimeSelector}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5"/>
                                    <span>Chỉnh sửa khung giờ</span>
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                                        <Select value={editStartTime} onValueChange={setEditStartTime}>
                                            <SelectTrigger><SelectValue
                                                placeholder="Chọn giờ bắt đầu"/></SelectTrigger>
                                            <SelectContent>{timeSlots.map((time) => (<SelectItem key={time}
                                                                                                 value={time}>{time}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                                        <Select value={editEndTime} onValueChange={setEditEndTime}>
                                            <SelectTrigger><SelectValue
                                                placeholder="Chọn giờ kết thúc"/></SelectTrigger>
                                            <SelectContent>{timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}
                                                            disabled={editStartTime && time <= editStartTime}>{time}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={handleEditTimeSelection}
                                            disabled={!editStartTime || !editEndTime}><Check
                                        className="h-4 w-4 mr-2"/>Chọn</Button>
                                    <Button variant="outline" onClick={() => {
                                        setShowEditTimeSelector(false);
                                        setEditStartTime("");
                                        setEditEndTime("");
                                    }}><X className="h-4 w-4 mr-2"/>Hủy</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {editingBooking && (
                        <Card className="border-primary/50 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                    <Edit className="h-5 w-5"/>
                                    <span>Chỉnh sửa lịch đặt</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Chọn xe</label>
                                        <Select value={editVehicle} onValueChange={setEditVehicle}>
                                            <SelectTrigger><SelectValue placeholder="Chọn xe"/></SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.vehicleId}
                                                                value={String(vehicle.vehicleId)}>
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
                                            value={editDate}
                                            onChange={(e) => {
                                                setEditDate(e.target.value);
                                                setEditTime("");
                                            }}
                                            onBlur={(e) => {
                                                const selectedValue = e.target.value;
                                                const today = new Date().toISOString().split('T')[0];

                                                //
                                                if (selectedValue && selectedValue < today) {
                                                    showToast(
                                                        "Ngày không hợp lệ",
                                                        "Không thể chọn ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi.",
                                                        "destructive"
                                                    );
                                                    setEditDate("");
                                                }
                                            }}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
                                        <Button variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                                onClick={() => setShowEditTimeSelector(true)}>
                                            <Clock className="h-4 w-4 mr-2"/>
                                            {editTime ? editTime : "Chọn khung giờ"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={handleUpdateBooking}
                                            disabled={!editVehicle || !editDate || !editTime}><Check
                                        className="h-4 w-4 mr-2"/>Cập nhật</Button>
                                    <Button onClick={handleCancelEdit} variant="outline"><X
                                        className="h-4 w-4 mr-2"/>Hủy
                                        chỉnh sửa</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 6. FILTER BOOKINGS ĐỂ ẨN CÁC BOOKING ĐÃ BỊ OVERRIDE */}
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
                                                     editingBooking === booking.scheduleId ? 'bg-primary/10 border-primary/50' :
                                                         newlyCreatedBooking === booking.scheduleId ? 'bg-green-100 border-green-300 shadow-lg' :
                                                             booking.status === "canceled" ? 'bg-gray-100 opacity-50' :
                                                                 'bg-accent/20'
                                                 }`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Car className="h-4 w-4"/>
                                                            <span className="font-medium">{booking.brand} {booking.model}</span>
                                                        </div>
                                                        <Badge variant="secondary">{booking.bookedBy}</Badge>
                                                        {booking.ownershipPercentage !== undefined && (
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    isHighestOwnerInGroup
                                                                        ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold"
                                                                        : "bg-green-50 text-green-700 border-green-300"
                                                                }
                                                            >
                                                                {booking.ownershipPercentage.toFixed(1)}%
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant={booking.status === "BOOKED" ? "outline" : "default"}
                                                            className={
                                                                booking.status === "canceled"
                                                                    ? "bg-red-100 text-red-700 border-red-300 font-semibold"
                                                                    : booking.status === "BOOKED"
                                                                        ? "bg-green-100 text-green-700 border-green-300 font-semibold"
                                                                        : ""
                                                            }
                                                        >
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
                                                    {/* CHỈ HIỂN THỊ NÚT SỬA/HỦY NẾU LÀ LỊCH CỦA USER HIỆN TẠI */}
                                                    {booking.userId === currentUserId && booking.status === "booked" && (
                                                        <>
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleEditBooking(booking.scheduleId)}
                                                                    disabled={editingBooking === booking.scheduleId}>
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