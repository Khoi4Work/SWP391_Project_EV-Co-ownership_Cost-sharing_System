import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, Users, AlertCircle, Edit, X, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface BookingSlot {
  id: string;
  time: string;
  date: string;
  vehicle: string;
  bookedBy: string;
  ownershipLevel: number;
  canOverride?: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  available?: boolean;
  groupName?: string;
}

export default function VehicleBooking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [showTimeSelector, setShowTimeSelector] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [editVehicle, setEditVehicle] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editTime, setEditTime] = useState<string>("");
  const [editStartTime, setEditStartTime] = useState<string>("");
  const [editEndTime, setEditEndTime] = useState<string>("");
  const [showEditTimeSelector, setShowEditTimeSelector] = useState<boolean>(false);
  const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<string | null>(null);
  const { toast } = useToast();
  const bookingsListRef = useRef<HTMLDivElement | null>(null);

  // Load vehicles user registered (from backend)
  useEffect(() => {
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      setVehiclesError(null);
      try {
        const baseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5000";
        // Prefer a dedicated endpoint for user vehicles; adjust path as your backend exposes
        const res = await fetch(`${baseUrl}/Vehicles/my`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Expecting array of { id, name, groupName? }
        if (Array.isArray(data)) {
          setVehicles(data as Vehicle[]);
        } else if (Array.isArray(data?.vehicles)) {
          setVehicles(data.vehicles as Vehicle[]);
        } else {
          // Fallback: keep empty list
          setVehicles([]);
        }
      } catch (e: any) {
        console.error("[VehicleBooking] Lỗi tải danh sách xe:", e);
        setVehiclesError("Không tải được danh sách xe. Vui lòng thử lại.");
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, []);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([
    {
      id: "1",
      time: "09:00-11:00",
      date: "2024-01-16",
      vehicle: "VinFast VF8",
      bookedBy: "Nguyễn Văn A (60%)",
      ownershipLevel: 60,
      canOverride: false
    },
    {
      id: "2", 
      time: "14:00-17:00",
      date: "2024-01-16",
      vehicle: "Tesla Model Y",
      bookedBy: "Trần Thị B (25%)",
      ownershipLevel: 25,
      canOverride: true
    },
    {
      id: "3",
      time: "13:00-15:00", 
      date: "2024-01-16",
      vehicle: "VinFast VF8",
bookedBy: "Lê Văn C (40%)",
      ownershipLevel: 40,
      canOverride: false
    }
  ]);

  // Persist bookings to localStorage so they don't disappear after reload
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vehicleBookings");
      if (saved) {
        const parsed: BookingSlot[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExistingBookings(parsed);
        }
      }
    } catch (err) {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vehicleBookings", JSON.stringify(existingBookings));
    } catch {
      // ignore quota/storage errors
    }
  }, [existingBookings]);

  const currentUserOwnership = 35; // Mock current user ownership percentage
  const currentUserName = "Bạn"; // Mock current user display name for matching

  const getOwnershipColor = (ownership: number) => {
    if (ownership >= 50) return "default";
    if (ownership >= 30) return "secondary";
    return "outline";
  };

  // Helpers for time range overlap
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

  // Helpers for monthly limit
  const isSameMonth = (dateA: string, dateB: string) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  };

  const getUserBookedUniqueDaysInMonth = (targetDate: string): Set<string> => {
    const set = new Set<string>();
    for (const booking of existingBookings) {
      // Identify current user's bookings by name prefix "Bạn"
      if (booking.bookedBy?.startsWith(currentUserName) && isSameMonth(booking.date, targetDate)) {
        set.add(booking.date);
      }
    }
    return set;
  };

  const canBookSlot = (time: string, date: string, vehicle: string) => {
    const existingBooking = existingBookings.find(
      b => b.time === time && b.date === date && b.vehicle === vehicle
    );
    
    if (!existingBooking) return true;
    
    // Can override if current user has higher ownership
    return existingBooking.ownershipLevel < currentUserOwnership;
  };

  const handleTimeSelection = () => {
    if (!selectedStartTime || !selectedEndTime) return;
    
    const timeRange = `${selectedStartTime}-${selectedEndTime}`;
    // Prevent selecting an overlapping range for current vehicle/date
    const hasOverlap = existingBookings.some(booking => 
      booking.vehicle === selectedVehicle &&
      booking.date === selectedDate &&
      rangesOverlap(booking.time, timeRange)
    );
    if (hasOverlap) {
      toast({
        title: "Xung đột thời gian",
        description: "Khung giờ bạn chọn bị chồng lấn với lịch đã đặt.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTime(timeRange);
    setShowTimeSelector(false);
    
    toast({
      title: "Đã chọn thời gian",
      description: `Thời gian: ${timeRange}`,
    });
  };

  const handleBooking = () => {
    if (!selectedVehicle || !selectedDate || !selectedTime) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn xe, ngày và khung giờ trước khi đặt.",
        variant: "destructive",
      });
      return;
    }
    
    // Kiểm tra giới hạn 14 ngày/tháng theo người dùng (đếm ngày duy nhất)
    const daysSet = getUserBookedUniqueDaysInMonth(selectedDate);
    const alreadyCounted = daysSet.has(selectedDate);
const prospectiveDaysCount = alreadyCounted ? daysSet.size : daysSet.size + 1;
    if (prospectiveDaysCount > 14) {
      toast({
        title: "Vượt giới hạn trong tháng",
        description: "Bạn chỉ được đăng ký tối đa 14 ngày sử dụng trong 1 tháng.",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra chồng lấn thời gian cho cùng xe và ngày
    const hasConflict = existingBookings.some(booking => 
      booking.vehicle === selectedVehicle && 
      booking.date === selectedDate && 
      rangesOverlap(booking.time, selectedTime)
    );
    
    if (hasConflict) {
      toast({
        title: "Khung giờ đã được đặt",
        description: `Xe ${selectedVehicle} vào ${selectedDate} từ ${selectedTime} đã có người đặt. Vui lòng chọn khung giờ khác.`,
        variant: "destructive",
      });
      return;
    }
    
    // Tạo ID mới cho booking
    const newBookingId = (existingBookings.length + 1).toString();
    
    // Tạo booking mới
    const newBooking: BookingSlot = {
      id: newBookingId,
      time: selectedTime,
      date: selectedDate,
      vehicle: selectedVehicle,
      bookedBy: `${currentUserName} (${currentUserOwnership}%)`,
      ownershipLevel: currentUserOwnership,
      canOverride: false
    };
    
    // Thêm booking mới lên đầu danh sách
    setExistingBookings(prev => [newBooking, ...prev]);
    
    // Đánh dấu booking mới được tạo
    setNewlyCreatedBooking(newBookingId);
    
    // Reset form
    setSelectedVehicle("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStartTime("");
    setSelectedEndTime("");
    
    // Cuộn tới danh sách lịch và thông báo rõ ràng
    if (bookingsListRef.current) {
      try {
        bookingsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {}
    }

    // Xóa highlight sau 3 giây
    setTimeout(() => {
      setNewlyCreatedBooking(null);
    }, 3000);
    
    console.log("Booking:", { selectedVehicle, selectedDate, selectedTime });
    // Here would integrate with backend to create booking
    
    toast({
      title: "Đặt lịch thành công",
      description: `Đã đặt ${selectedVehicle} vào ${selectedDate} từ ${selectedTime}. Mục mới nằm ở đầu danh sách.`,
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    console.log("Cancelling booking:", bookingId);
    
    // Xóa booking khỏi danh sách
    setExistingBookings(prev => prev.filter(booking => booking.id !== bookingId));
    
    // Here would integrate with backend to cancel booking
    toast({
      title: "Đã hủy lịch",
      description: "Lịch đặt xe đã được hủy thành công",
    });
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = existingBookings.find(b => b.id === bookingId);
    if (booking) {
      setEditingBooking(bookingId);
      setEditVehicle(booking.vehicle);
      setEditDate(booking.date);
setEditTime(booking.time);
      
      // Parse time range to get start and end times
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
    // Prevent selecting overlapping range against other bookings
    const hasOverlap = existingBookings.some(booking => 
      booking.id !== editingBooking &&
      booking.vehicle === editVehicle &&
      booking.date === editDate &&
      rangesOverlap(booking.time, timeRange)
    );
    if (hasOverlap) {
      toast({
        title: "Xung đột thời gian",
        description: "Khung giờ bạn chọn bị chồng lấn với lịch đã đặt.",
        variant: "destructive",
      });
      return;
    }
    setEditTime(timeRange);
    setShowEditTimeSelector(false);
    
    toast({
      title: "Đã chọn thời gian",
      description: `Thời gian: ${timeRange}`,
    });
  };

  const handleUpdateBooking = () => {
    try {
      console.log("Updating booking:", { editingBooking, editVehicle, editDate, editTime });
      
      // Kiểm tra giới hạn 14 ngày/tháng khi chỉnh sửa
      const daysSet = getUserBookedUniqueDaysInMonth(editDate);
      const currentEditing = existingBookings.find(b => b.id === editingBooking);
      const isSameDateAsBefore = currentEditing?.date === editDate;
      const alreadyCounted = daysSet.has(editDate);
      const prospectiveDaysCount = alreadyCounted || isSameDateAsBefore ? daysSet.size : daysSet.size + 1;
      if (prospectiveDaysCount > 14) {
        toast({
          title: "Vượt giới hạn trong tháng",
          description: "Bạn chỉ được đăng ký tối đa 14 ngày sử dụng trong 1 tháng.",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra chồng lấn thời gian cho cùng xe và ngày (trừ booking đang chỉnh sửa)
      const hasConflict = existingBookings.some(booking => 
        booking.id !== editingBooking &&
        booking.vehicle === editVehicle && 
        booking.date === editDate && 
        rangesOverlap(booking.time, editTime)
      );
      
      if (hasConflict) {
        toast({
          title: "Khung giờ đã được đặt",
          description: `Xe ${editVehicle} vào ${editDate} từ ${editTime} đã có người đặt. Vui lòng chọn khung giờ khác.`,
          variant: "destructive",
        });
        return;
      }
      
      // Cập nhật booking trong danh sách
      setExistingBookings(prev => 
        prev.map(booking => 
          booking.id === editingBooking 
            ? { ...booking, vehicle: editVehicle, date: editDate, time: editTime }
            : booking
        )
      );
      
      // Here would integrate with backend to update booking
      
      toast({
        title: "Cập nhật thành công",
        description: "Lịch đặt xe đã được cập nhật thành công",
      });
      
      setEditingBooking(null);
      setEditVehicle("");
      setEditDate("");
      setEditTime("");
      setEditStartTime("");
      setEditEndTime("");
      setShowEditTimeSelector(false);
    } catch (error) {
      toast({
title: "Lỗi cập nhật",
        description: "Không thể cập nhật lịch đặt xe. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Đặt lịch sử dụng xe</span>
        </CardTitle>
        <CardDescription>
          Lên lịch sử dụng xe điện trong nhóm đồng sở hữu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Chọn xe</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder={loadingVehicles ? "Đang tải..." : "Chọn xe"} />
              </SelectTrigger>
              <SelectContent>
                {vehiclesError && (
                  <div className="px-3 py-2 text-sm text-destructive">{vehiclesError}</div>
                )}
                {!vehiclesError && vehicles.length === 0 && !loadingVehicles && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Không có xe nào trong nhóm của bạn</div>
                )}
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.name}>
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4" />
                      <span>{vehicle.name}{vehicle.groupName ? ` - ${vehicle.groupName}` : ""}</span>
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setShowTimeSelector(true)}
              disabled={!selectedVehicle || !selectedDate}
            >
              <Clock className="h-4 w-4 mr-2" />
              {selectedTime ? selectedTime : "Chọn khung giờ"}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleBooking}
          className="w-full bg-gradient-primary hover:shadow-glow"
          disabled={!selectedVehicle || !selectedDate || !selectedTime}
        >
          Đặt lịch
        </Button>

        {/* Time Selection Dialog */}
        <Dialog open={showTimeSelector} onOpenChange={setShowTimeSelector}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Chọn khung giờ sử dụng</span>
</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Time Range Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                  <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ bắt đầu" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                  <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ kết thúc" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={selectedStartTime && time <= selectedStartTime}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Existing Bookings for Selected Date */}
              {selectedDate && (
                <div>
                  <h4 className="font-medium mb-3">Lịch đã đặt trong ngày {selectedDate}</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {existingBookings
                      .filter(booking => booking.date === selectedDate && booking.vehicle === selectedVehicle)
                      .map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{booking.time}</span>
                          <Badge variant={getOwnershipColor(booking.ownershipLevel) as "default" | "secondary" | "destructive" | "outline"}>
                            {booking.bookedBy}
                          </Badge>
                        </div>
                        {booking.canOverride && (
                          <Badge variant="secondary" className="text-xs">
Có thể thay thế
                          </Badge>
                        )}
                      </div>
                    ))}
                    {existingBookings.filter(booking => booking.date === selectedDate && booking.vehicle === selectedVehicle).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có lịch đặt nào trong ngày này
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  onClick={handleTimeSelection}
                  className="bg-gradient-primary hover:shadow-glow"
                  disabled={!selectedStartTime || !selectedEndTime}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Chọn
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowTimeSelector(false);
                    setSelectedStartTime("");
                    setSelectedEndTime("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Time Selection Dialog */}
        <Dialog open={showEditTimeSelector} onOpenChange={setShowEditTimeSelector}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Chọn khung giờ sử dụng (Chỉnh sửa)</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Time Range Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                  <Select value={editStartTime} onValueChange={setEditStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ bắt đầu" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                  <Select value={editEndTime} onValueChange={setEditEndTime}>
                    <SelectTrigger>
<SelectValue placeholder="Chọn giờ kết thúc" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={editStartTime && time <= editStartTime}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  onClick={handleEditTimeSelection}
                  className="bg-gradient-primary hover:shadow-glow"
                  disabled={!editStartTime || !editEndTime}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Chọn
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowEditTimeSelector(false);
                    setEditStartTime("");
                    setEditEndTime("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Booking Form */}
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
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.name}>
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
                  <input
type="date"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Chọn giờ</label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setShowEditTimeSelector(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {editTime ? editTime : "Chọn khung giờ"}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleUpdateBooking}
                  className="bg-gradient-primary hover:shadow-glow"
                  disabled={!editVehicle || !editDate || !editTime}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Cập nhật
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy chỉnh sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Bookings */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Lịch đã đặt</span>
          </h4>
          {newlyCreatedBooking && (
            <div className="mb-3 p-3 rounded-lg border bg-green-50 border-green-200">
              <div className="text-sm font-medium mb-1">Bạn vừa đặt lịch thành công</div>
              {(() => {
                const b = existingBookings.find(bk => bk.id === newlyCreatedBooking);
                if (!b) return null;
                return (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium mr-2">{b.vehicle}</span>
                    <span>{b.date} • {b.time}</span>
                  </div>
                );
              })()}
            </div>
          )}
          <div ref={bookingsListRef} className="space-y-3">
            {existingBookings.map((booking) => (
              <div 
                key={booking.id} 
                className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-500 ${
                  editingBooking === booking.id 
                    ? 'bg-primary/10 border-primary/50' 
                    : newlyCreatedBooking === booking.id
                    ? 'bg-green-100 border-green-300 shadow-lg animate-pulse'
: 'bg-accent/20'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4" />
                      <span className="font-medium">{booking.vehicle}</span>
                    </div>
                    <Badge variant={getOwnershipColor(booking.ownershipLevel) as "default" | "secondary" | "destructive" | "outline"}>
                      {booking.bookedBy}
                    </Badge>
                    {editingBooking === booking.id && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Đang chỉnh sửa
                      </Badge>
                    )}
                    {newlyCreatedBooking === booking.id && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800 animate-bounce">
                        Mới
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {booking.date} • {booking.time}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {booking.canOverride && (
                    <Badge variant="secondary" className="text-xs bg-warning/20 text-warning-foreground">
                      Có thể thay thế
                    </Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditBooking(booking.id)}
                    disabled={editingBooking === booking.id}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Thay đổi
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Info */}
        <div className="bg-gradient-card p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h5 className="font-medium text-sm">Thứ tự ưu tiên đặt lịch</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Chủ sở hữu với tỷ lệ cao hơn sẽ được ưu tiên. Bạn có thể thay thế lịch của người có tỷ lệ sở hữu thấp hơn.
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
Tỷ lệ sở hữu của bạn: {currentUserOwnership}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 