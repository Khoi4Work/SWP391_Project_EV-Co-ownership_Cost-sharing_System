import {useEffect, useRef, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Calendar, Clock, Car, Edit, X, Check, AlertCircle} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

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

            // API trả về trực tiếp array of integers: [1, 2]
            const groupIds: number[] = await groupRes.json();

            if (!groupIds || groupIds.length === 0) {
                showToast("Thông báo", "Bạn chưa tham gia nhóm nào", "destructive");
                return;
            }

            // Lưu array groupIds vào localStorage (phải stringify)
            localStorage.setItem("groupIds", JSON.stringify(groupIds));

            // Lưu groupId đầu tiên làm mặc định cho loadVehicles
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
            // Lấy tất cả groupIds thay vì chỉ 1
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

            // Chờ tất cả requests hoàn thành
            const allVehiclesData = await Promise.all(fetchPromises);

            console.log("All vehicles data:", allVehiclesData);

            // Filter out null values và flatten thành single array
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
            // Lấy tất cả groupIds từ localStorage
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
                            status: item.status
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

    // ===== EFFECTS =====
    // Effect 1: Initialize data on mount
    useEffect(() => {
        const initData = async () => {
            console.log("=== Initializing Data ===");
            await loadGroupId();
            await loadVehicles();
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
        const selectedV = vehicles.find(v => String(v.vehicleId) === selectedVehicle);
        const hasOverlap = existingBookings.filter(booking => booking.status !== "canceled")
            .some(booking =>
                booking.vehicleId === Number(selectedVehicle) &&
                booking.date === selectedDate &&
                rangesOverlap(booking.time, timeRange)
            );
        if (hasOverlap) {
            showToast("Xung đột thời gian", "Khung giờ bạn chọn bị chồng lấn với lịch đã đặt.", "destructive");
            return;
        }
        setSelectedTime(timeRange);
        setShowTimeSelector(false);
        showToast("Đã chọn thời gian", `Thời gian: ${timeRange}`);
    };

    const handleBooking = async () => {
        if (!selectedVehicle || !selectedDate || !selectedTime) {
            showToast("Thiếu thông tin", "Vui lòng chọn xe, ngày và khung giờ trước khi đặt.", "destructive");
            return;
        }
        const daysSet = getUserBookedUniqueDaysInMonth(selectedDate);
        const alreadyCounted = daysSet.has(selectedDate);
        const prospectiveDaysCount = alreadyCounted ? daysSet.size : daysSet.size + 1;
        if (prospectiveDaysCount > 3) {
            showToast("Vượt giới hạn trong tháng", "Bạn chỉ được đăng ký tối đa 14 ngày sử dụng trong 1 tháng.", "destructive");
            return;
        }
        const hasConflict = existingBookings.filter(booking => booking.status !== "canceled")
            .some(booking =>
                booking.vehicleId === Number(selectedVehicle) && booking.date === selectedDate && rangesOverlap(booking.time, selectedTime)
            );
        if (hasConflict) {
            showToast("Khung giờ đã được đặt", `Xe ${getSelectedVehicleName()} vào ${selectedDate} từ ${selectedTime} đã có người đặt.`, "destructive");
            return;
        }

        // Gọi BE để tạo lịch mới
        try {
            const currentGroupId = localStorage.getItem("groupId");
            const [start, end] = selectedTime.split("-");
            console.log("Sending schedule request:", {
                startTime: toLocalDateTime(selectedDate, start),
                endTime: toLocalDateTime(selectedDate, end),
                status: "pending",
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
                    status: "pending",
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
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            await loadBookings();
            showToast("Đặt lịch thành công", `Đã đặt ${getSelectedVehicleName()} vào ${selectedDate} từ ${selectedTime}.`);
            setSelectedVehicle("");
            setSelectedDate("");
            setSelectedTime("");
            setSelectedStartTime("");
            setSelectedEndTime("");
            if (bookingsListRef.current) {
                bookingsListRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
        } catch (e) {
            console.error("Booking error:", e);
            showToast("Lỗi đặt lịch", "Không thể đặt lịch. Vui lòng thử lại.", "destructive");
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
                            <input type="date"
                                   className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                   value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                                   min={new Date().toISOString().split('T')[0]}/>
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

                    <Button onClick={handleBooking} className="w-full"
                            disabled={!selectedVehicle || !selectedDate || !selectedTime}>Đặt lịch</Button>

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
                                {/* Hiển thị chi tiết các khung giờ đã đăng ký cho xe/ngày này */}
                                {selectedVehicle && selectedDate && (
                                    <div className="mb-2">
                                        <div className="text-sm font-medium mb-1">Lịch đã đăng ký cho xe này:</div>
                                        <div className="space-y-2">
                                            {existingBookings
                                                .filter(
                                                    b =>
                                                        String(b.vehicleId) === String(selectedVehicle) &&
                                                        b.date === selectedDate
                                                )
                                                .map(b => (
                                                    <div
                                                        key={b.scheduleId}
                                                        className="flex items-center gap-3 px-3 py-2 rounded border bg-gray-50 text-xs"
                                                    >
                                                            <span
                                                                className="font-semibold text-blue-700">{b.time}</span>
                                                        <span className="text-gray-700">{b.brand} {b.model}</span>
                                                        <span
                                                            className="text-gray-500">Người đặt: {b.bookedBy}</span>
                                                        <span
                                                            className="text-gray-500">Trạng thái: {b.status}</span>
                                                    </div>
                                                ))}
                                            {existingBookings.filter(
                                                b =>
                                                    String(b.vehicleId) === String(selectedVehicle) &&
                                                    b.date === selectedDate
                                            ).length === 0 && (
                                                <span
                                                    className="text-xs text-muted-foreground">Chưa có lịch nào</span>
                                            )}
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
                                        <input type="date"
                                               className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                               value={editDate} onChange={(e) => setEditDate(e.target.value)}
                                               min={new Date().toISOString().split('T')[0]}/>
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
                                existingBookings.map((booking) => (
                                    <div key={booking.scheduleId}
                                         className={`flex items-center justify-between p-3 border rounded-lg transition-all ${editingBooking === booking.scheduleId ? 'bg-primary/10 border-primary/50' : newlyCreatedBooking === booking.scheduleId ? 'bg-green-100 border-green-300 shadow-lg' : 'bg-accent/20'}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <Car className="h-4 w-4"/>
                                                    <span
                                                        className="font-medium">{booking.brand} {booking.model}</span>
                                                </div>
                                                <Badge variant="secondary">{booking.bookedBy}</Badge>
                                                <Badge
                                                    variant={booking.status === "pending" ? "outline" : "default"}>{booking.status}</Badge>
                                                {newlyCreatedBooking === booking.scheduleId &&
                                                    <Badge className="bg-green-100 text-green-800">Mới</Badge>}
                                            </div>
                                            <div
                                                className="text-sm text-muted-foreground mt-1">{booking.date} • {booking.time}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" variant="outline"
                                                    onClick={() => handleEditBooking(booking.scheduleId)}
                                                    disabled={editingBooking === booking.scheduleId}>
                                                <Edit className="h-4 w-4 mr-1"/>Sửa
                                            </Button>
                                            <Button size="sm" variant="outline"
                                                    onClick={() => handleCancelBooking(booking.scheduleId)}>
                                                <X className="h-4 w-4 mr-1"/>Hủy
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}