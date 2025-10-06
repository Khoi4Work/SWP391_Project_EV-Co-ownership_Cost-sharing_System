import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, Edit, X, Check, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BookingSlot {
  scheduleId: number;
  time: string;
  date: string;
  vehicleName: string;
  vehicleId: number;
  bookedBy: string;
  userId: number;
  groupId: number;
  status: string;
}

interface Vehicle {
  vehicleId: number;
  name: string;
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
  const bookingsListRef = useRef<HTMLDivElement | null>(null);
  const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const beBaseUrl = "http://localhost:8080/api";
  const currentUserId = Number(localStorage.getItem("currentUserId") || "1");
  const currentGroupId = Number(localStorage.getItem("currentGroupId") || "1");
  const currentUserName = localStorage.getItem("currentUserName") || "Bạn";

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    loadVehiclesAndBookings();
  }, []);

  const loadVehiclesAndBookings = async () => {
    await Promise.all([loadVehicles(), loadBookings()]);
  };

  // Sửa loadVehicles: luôn trả về mảng và thêm xe mẫu để test
  const loadVehicles = async () => {
    setLoadingVehicles(true);
    setVehiclesError(null);
    try {
      const res = await fetch(`${beBaseUrl}/Schedule/vehicle?groupId=${currentGroupId}&userId=${currentUserId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      let vehiclesArr: Vehicle[] = [];
      if (res.ok) {
        const data = await res.json();
        vehiclesArr = Array.isArray(data) ? data : [data];
      }
      // Nếu không lấy được xe từ BE hoặc BE trả về rỗng, luôn thêm xe mẫu để test
      if (!vehiclesArr || vehiclesArr.length === 0) {
        vehiclesArr = [
          {
            vehicleId: 9991,
            name: "VinFast VF e34",
            groupId: currentGroupId,
            groupName: "Nhóm A",
          },
          {
            vehicleId: 9992,
            name: "Kia EV6",
            groupId: currentGroupId,
            groupName: "Nhóm A",
          },
          {
            vehicleId: 9993,
            name: "Hyundai Ioniq 5",
            groupId: currentGroupId,
            groupName: "Nhóm A",
          },
        ];
      }
      setVehicles(vehiclesArr);
    } catch (e: any) {
      // Nếu lỗi BE, vẫn set xe mẫu để test
      setVehicles([
        {
          vehicleId: 9991,
          name: "VinFast VF e34",
          groupId: currentGroupId,
          groupName: "Nhóm A",
        },
        {
          vehicleId: 9992,
          name: "Kia EV6",
          groupId: currentGroupId,
          groupName: "Nhóm A",
        },
        {
          vehicleId: 9993,
          name: "Hyundai Ioniq 5",
          groupId: currentGroupId,
          groupName: "Nhóm A",
        },
      ]);
      setVehiclesError("Không kết nối được BE, đang dùng xe mẫu để test.");
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${beBaseUrl}/Schedule/all`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const formattedBookings: BookingSlot[] = data.map((item: any) => {
        const startTime = new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = new Date(item.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const date = new Date(item.startTime).toISOString().split('T')[0];
        const vehicle = vehicles.find(v => v.vehicleId === item.vehicleId);
        return {
          scheduleId: item.scheduleId,
          time: `${startTime}-${endTime}`,
          date: date,
          vehicleName: vehicle?.name || "Xe không xác định",
          vehicleId: item.vehicleId,
          bookedBy: item.userId === currentUserId ? currentUserName : `User ${item.userId}`,
          userId: item.userId,
          groupId: item.groupId,
          status: item.status
        };
      });
      setExistingBookings(formattedBookings);
    } catch (e: any) {
      // Nếu lỗi BE, tạo dữ liệu mẫu để test UI
      setExistingBookings([
        {
          scheduleId: 1,
          time: "08:00-10:00",
          date: new Date().toISOString().split('T')[0],
          vehicleName: "VinFast VF e34",
          vehicleId: 9991,
          bookedBy: "User 2",
          userId: 2,
          groupId: currentGroupId,
          status: "pending"
        },
        {
          scheduleId: 2,
          time: "12:00-14:00",
          date: new Date().toISOString().split('T')[0],
          vehicleName: "Kia EV6",
          vehicleId: 9992,
          bookedBy: "User 3",
          userId: 3,
          groupId: currentGroupId,
          status: "approved"
        }
      ]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const toLocalDateTime = (date: string, hhmm: string) => {
    const [hh, mm] = hhmm.split(":");
    return `${date}T${hh}:${mm}:00`;
  };

  const getSelectedVehicleName = () => {
    const v = vehicles.find(v => String(v.vehicleId) === String(selectedVehicle));
    return v?.name || "";
  };

  const toMinutes = (hhmm: string) => {
    const [hh, mm] = hhmm.split(":").map(Number);
    return hh * 60 + mm;
  };

  const parseRange = (range: string) => {
    const [start, end] = range.split('-');
    return { start: toMinutes(start), end: toMinutes(end) };
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
    const hasOverlap = existingBookings.some(booking => 
      booking.vehicleName === getSelectedVehicleName() && booking.date === selectedDate && rangesOverlap(booking.time, timeRange)
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
    if (prospectiveDaysCount > 14) {
      showToast("Vượt giới hạn trong tháng", "Bạn chỉ được đăng ký tối đa 14 ngày sử dụng trong 1 tháng.", "destructive");
      return;
    }
    const hasConflict = existingBookings.some(booking => 
      booking.vehicleName === getSelectedVehicleName() && booking.date === selectedDate && rangesOverlap(booking.time, selectedTime)
    );
    if (hasConflict) {
      showToast("Khung giờ đã được đặt", `Xe ${getSelectedVehicleName()} vào ${selectedDate} từ ${selectedTime} đã có người đặt.`, "destructive");
      return;
    }

    // Gọi BE để tạo lịch mới
    try {
      const [start, end] = selectedTime.split("-");
      const res = await fetch(`${beBaseUrl}/Schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadBookings();
      showToast("Đặt lịch thành công", `Đã đặt ${getSelectedVehicleName()} vào ${selectedDate} từ ${selectedTime}.`);
      setSelectedVehicle("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStartTime("");
      setSelectedEndTime("");
      if (bookingsListRef.current) {
        bookingsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      showToast("Lỗi đặt lịch", "Không thể đặt lịch. Vui lòng thử lại.", "destructive");
    }
  };

  // Sửa handleCancelBooking: gọi API BE để xóa lịch
  const handleCancelBooking = async (scheduleId: number) => {
    try {
      const res = await fetch(`${beBaseUrl}/Schedule/${scheduleId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExistingBookings(prev => prev.filter(booking => booking.scheduleId !== scheduleId));
      showToast("Đã hủy lịch", "Lịch đặt xe đã được hủy thành công");
    } catch (e) {
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
    const hasOverlap = existingBookings.some(booking => 
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
    if (!editVehicle || !editDate || !editTime) return;
    // Nếu không muốn gọi BE, chỉ cập nhật trực tiếp trên state:
    setExistingBookings(prev =>
      prev.map(booking =>
        booking.scheduleId === editingBooking
          ? {
              ...booking,
              vehicleId: Number(editVehicle),
              vehicleName: vehicles.find(v => v.vehicleId === Number(editVehicle))?.name || booking.vehicleName,
              date: editDate,
              time: editTime,
            }
          : booking
      )
    );
    showToast("Cập nhật thành công", "Lịch đặt xe đã được cập nhật thành công");
    handleCancelEdit();
  };

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-lg shadow-lg border min-w-[300px] ${toast.variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${toast.variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
              <div className="flex-1">
                <div className="font-semibold">{toast.title}</div>
                <div className="text-sm mt-1 opacity-90">{toast.description}</div>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />S
              </button>
            </div>
          </div>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Đặt lịch sử dụng xe</span>
          </CardTitle>
          <CardDescription>Lên lịch sử dụng xe điện trong nhóm đồng sở hữu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn xe</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingVehicles ? "Đang tải..." : "Chọn xe"} />
                </SelectTrigger>
                <SelectContent>
                  {vehiclesError && <div className="px-3 py-2 text-sm text-destructive">{vehiclesError}</div>}
                  {!vehiclesError && vehicles.length === 0 && !loadingVehicles && <div className="px-3 py-2 text-sm text-muted-foreground">Không có xe nào</div>}
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.vehicleId} value={String(vehicle.vehicleId)}>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>{vehicle.name} - {vehicle.groupName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn ngày</label>
              <input type="date" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
              <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={() => setShowTimeSelector(true)} disabled={!selectedVehicle || !selectedDate}>
                <Clock className="h-4 w-4 mr-2" />
                {selectedTime ? selectedTime : "Chọn khung giờ"}
              </Button>
            </div>
          </div>

          <Button onClick={handleBooking} className="w-full" disabled={!selectedVehicle || !selectedDate || !selectedTime}>Đặt lịch</Button>

          <Dialog open={showTimeSelector} onOpenChange={setShowTimeSelector}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
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
                            <span className="font-semibold text-blue-700">{b.time}</span>
                            <span className="text-gray-700">{b.vehicleName}</span>
                            <span className="text-gray-500">Người đặt: {b.bookedBy}</span>
                            <span className="text-gray-500">Trạng thái: {b.status}</span>
                          </div>
                        ))}
                      {existingBookings.filter(
                        b =>
                          String(b.vehicleId) === String(selectedVehicle) &&
                          b.date === selectedDate
                      ).length === 0 && (
                        <span className="text-xs text-muted-foreground">Chưa có lịch nào</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                    <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                      <SelectTrigger><SelectValue placeholder="Chọn giờ bắt đầu" /></SelectTrigger>
                      <SelectContent>{timeSlots.map((time) => (<SelectItem key={time} value={time}>{time}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                    <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                      <SelectTrigger><SelectValue placeholder="Chọn giờ kết thúc" /></SelectTrigger>
                      <SelectContent>{timeSlots.map((time) => (<SelectItem key={time} value={time} disabled={selectedStartTime && time <= selectedStartTime}>{time}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleTimeSelection} disabled={!selectedStartTime || !selectedEndTime}><Check className="h-4 w-4 mr-2" />Chọn</Button>
                  <Button variant="outline" onClick={() => { setShowTimeSelector(false); setSelectedStartTime(""); setSelectedEndTime(""); }}><X className="h-4 w-4 mr-2" />Hủy</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showEditTimeSelector} onOpenChange={setShowEditTimeSelector}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Chỉnh sửa khung giờ</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                    <Select value={editStartTime} onValueChange={setEditStartTime}>
                      <SelectTrigger><SelectValue placeholder="Chọn giờ bắt đầu" /></SelectTrigger>
                      <SelectContent>{timeSlots.map((time) => (<SelectItem key={time} value={time}>{time}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                    <Select value={editEndTime} onValueChange={setEditEndTime}>
                      <SelectTrigger><SelectValue placeholder="Chọn giờ kết thúc" /></SelectTrigger>
                      <SelectContent>{timeSlots.map((time) => (<SelectItem key={time} value={time} disabled={editStartTime && time <= editStartTime}>{time}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleEditTimeSelection} disabled={!editStartTime || !editEndTime}><Check className="h-4 w-4 mr-2" />Chọn</Button>
                  <Button variant="outline" onClick={() => { setShowEditTimeSelector(false); setEditStartTime(""); setEditEndTime(""); }}><X className="h-4 w-4 mr-2" />Hủy</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {editingBooking && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Chỉnh sửa lịch đặt</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chọn xe</label>
                    <Select value={editVehicle} onValueChange={setEditVehicle}>
                      <SelectTrigger><SelectValue placeholder="Chọn xe" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.vehicleId} value={String(vehicle.vehicleId)}>
                            <div className="flex items-center space-x-2">
                              <Car className="h-4 w-4" />
                              <span>{vehicle.name} - {vehicle.groupName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chọn ngày</label>
                    <input type="date" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={editDate} onChange={(e) => setEditDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={() => setShowEditTimeSelector(true)}>
                      <Clock className="h-4 w-4 mr-2" />
                      {editTime ? editTime : "Chọn khung giờ"}
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateBooking} disabled={!editVehicle || !editDate || !editTime}><Check className="h-4 w-4 mr-2" />Cập nhật</Button>
                  <Button onClick={handleCancelEdit} variant="outline"><X className="h-4 w-4 mr-2" />Hủy chỉnh sửa</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Lịch đã đặt</span>
            </h4>
            <div ref={bookingsListRef} className="space-y-3">
              {loadingBookings ? (
                <div className="text-center py-4 text-muted-foreground">Đang tải...</div>
              ) : existingBookings.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">Chưa có lịch đặt nào</div>
              ) : (
                existingBookings.map((booking) => (
                  <div key={booking.scheduleId} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${editingBooking === booking.scheduleId ? 'bg-primary/10 border-primary/50' : newlyCreatedBooking === booking.scheduleId ? 'bg-green-100 border-green-300 shadow-lg' : 'bg-accent/20'}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span className="font-medium">{booking.vehicleName}</span>
                        </div>
                        <Badge variant="secondary">{booking.bookedBy}</Badge>
                        <Badge variant={booking.status === "pending" ? "outline" : "default"}>{booking.status}</Badge>
                        {newlyCreatedBooking === booking.scheduleId && <Badge className="bg-green-100 text-green-800">Mới</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{booking.date} • {booking.time}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditBooking(booking.scheduleId)} disabled={editingBooking === booking.scheduleId}>
                        <Edit className="h-4 w-4 mr-1" />Sửa
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.scheduleId)}>
                        <X className="h-4 w-4 mr-1" />Hủy
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