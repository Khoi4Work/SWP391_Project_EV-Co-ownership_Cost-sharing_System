import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, Car, Check, X, Upload, Star, User } from "lucide-react";

// ===== MOCK DATA =====
const MOCK_SCHEDULES: ScheduleItem[] = [
  {
    scheduleId: 1,
    startTime: "2024-10-27T08:00:00",
    endTime: "2024-10-27T17:00:00",
    vehicleName: "VinFast VF e34",
    vehiclePlate: "51F-12345",
    userName: "Nguyễn Văn An",
    hasCheckIn: false,
    hasCheckOut: false
  },
  {
    scheduleId: 2,
    startTime: "2024-10-26T09:00:00",
    endTime: "2024-10-26T18:00:00",
    vehicleName: "Tesla Model 3",
    vehiclePlate: "51G-67890",
    userName: "Trần Thị Bình",
    hasCheckIn: true,
    hasCheckOut: false,
    checkInTime: "2024-10-26T09:05:00"
  },
  {
    scheduleId: 3,
    startTime: "2024-10-25T07:00:00",
    endTime: "2024-10-25T16:00:00",
    vehicleName: "VinFast VF 8",
    vehiclePlate: "51H-11111",
    userName: "Lê Văn Cường",
    hasCheckIn: true,
    hasCheckOut: true,
    checkInTime: "2024-10-25T07:10:00",
    checkOutTime: "2024-10-25T16:05:00"
  },
  {
    scheduleId: 4,
    startTime: "2024-10-28T10:00:00",
    endTime: "2024-10-28T19:00:00",
    vehicleName: "Hyundai Kona Electric",
    vehiclePlate: "51K-22222",
    userName: "Phạm Thị Dung",
    hasCheckIn: false,
    hasCheckOut: false
  },
  {
    scheduleId: 5,
    startTime: "2024-10-27T06:00:00",
    endTime: "2024-10-27T15:00:00",
    vehicleName: "BYD Atto 3",
    vehiclePlate: "51L-33333",
    userName: "Hoàng Văn Em",
    hasCheckIn: true,
    hasCheckOut: false,
    checkInTime: "2024-10-27T06:15:00"
  },
  {
    scheduleId: 6,
    startTime: "2024-10-24T11:00:00",
    endTime: "2024-10-24T20:00:00",
    vehicleName: "VinFast VF 9",
    vehiclePlate: "51M-44444",
    userName: "Đỗ Thị Giang",
    hasCheckIn: true,
    hasCheckOut: true,
    checkInTime: "2024-10-24T11:10:00",
    checkOutTime: "2024-10-24T20:00:00"
  },
  {
    scheduleId: 7,
    startTime: "2024-10-29T08:30:00",
    endTime: "2024-10-29T17:30:00",
    vehicleName: "Nissan Leaf",
    vehiclePlate: "51N-55555",
    userName: "Vũ Văn Hải",
    hasCheckIn: false,
    hasCheckOut: false
  },
  {
    scheduleId: 8,
    startTime: "2024-10-26T13:00:00",
    endTime: "2024-10-26T22:00:00",
    vehicleName: "MG ZS EV",
    vehiclePlate: "51P-66666",
    userName: "Ngô Thị Lan",
    hasCheckIn: true,
    hasCheckOut: false,
    checkInTime: "2024-10-26T13:05:00"
  }
];

// ===== INTERFACES =====
interface ScheduleItem {
  scheduleId: number;
  startTime: string;
  endTime: string;
  vehicleName: string;
  vehiclePlate: string;
  userName: string;
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

interface CheckInForm {
  condition: string;
  notes: string;
  images: string;
}

interface CheckOutForm {
  condition: string;
  notes: string;
  images: string;
  rating: number;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}

export default function VehicleCheckInOut() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Check-in Dialog State
  const [checkInDialog, setCheckInDialog] = useState<{
    open: boolean;
    scheduleId: number | null;
    schedule: ScheduleItem | null;
  }>({ open: false, scheduleId: null, schedule: null });
  
  const [checkInForm, setCheckInForm] = useState<CheckInForm>({
    condition: "",
    notes: "",
    images: ""
  });

  // Check-out Dialog State
  const [checkOutDialog, setCheckOutDialog] = useState<{
    open: boolean;
    scheduleId: number | null;
    schedule: ScheduleItem | null;
  }>({ open: false, scheduleId: null, schedule: null });
  
  const [checkOutForm, setCheckOutForm] = useState<CheckOutForm>({
    condition: "",
    notes: "",
    images: "",
    rating: 0
  });

  // Detail Dialog State
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    schedule: ScheduleItem | null;
  }>({ open: false, schedule: null });

  // ===== CONSTANTS =====
  const beBaseUrl = "http://localhost:8080";
  const currentUserId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("accessToken");
  const groupId = Number(localStorage.getItem("groupId"));
  const USE_MOCK_DATA = true; // Toggle để bật/tắt mock data

  // ===== HELPER FUNCTIONS =====
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  });

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ===== API CALLS =====
  const loadSchedules = async () => {
    if (!USE_MOCK_DATA && !groupId) {
      showToast("Lỗi", "Không tìm thấy groupId", "destructive");
      return;
    }

    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Sử dụng mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập delay API
        setSchedules(MOCK_SCHEDULES);
        showToast("Thành công", "Đã tải mock data", "default");
      } else {
        // Gọi API thật
        const response = await fetch(`${beBaseUrl}/booking/schedules/group/${groupId}/booked`, {
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error("Không thể tải danh sách lịch đặt xe");
        }

        const data: ScheduleItem[] = await response.json();
        setSchedules(data);
      }
    } catch (error: any) {
      console.error("Error loading schedules:", error);
      showToast("Lỗi", error.message || "Không thể tải danh sách lịch đặt xe", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInForm.condition) {
      showToast("Thiếu thông tin", "Vui lòng chọn tình trạng xe", "destructive");
      return;
    }

    try {
      if (USE_MOCK_DATA) {
        // Mock check-in
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedSchedule = {
          ...checkInDialog.schedule!,
          hasCheckIn: true,
          checkInTime: new Date().toISOString()
        };
        
        setSchedules(prev => prev.map(s => 
          s.scheduleId === updatedSchedule.scheduleId ? updatedSchedule : s
        ));
      } else {
        // API thật
        const response = await fetch(`${beBaseUrl}/booking/checkIn/${checkInDialog.scheduleId}`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            userId: currentUserId,
            condition: checkInForm.condition,
            notes: checkInForm.notes,
            images: checkInForm.images
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Không thể check-in");
        }

        await loadSchedules();
      }
      
      setCheckInDialog({ open: false, scheduleId: null, schedule: null });
      setCheckInForm({ condition: "", notes: "", images: "" });
      showToast("Thành công", "Check-in thành công");
    } catch (error: any) {
      console.error("Error checking in:", error);
      showToast("Lỗi", error.message || "Không thể check-in", "destructive");
    }
  };

  const handleCheckOut = async () => {
    if (!checkOutForm.condition) {
      showToast("Thiếu thông tin", "Vui lòng chọn tình trạng xe", "destructive");
      return;
    }

    if (checkOutForm.rating === 0) {
      showToast("Thiếu thông tin", "Vui lòng đánh giá trải nghiệm", "destructive");
      return;
    }

    try {
      if (USE_MOCK_DATA) {
        // Mock check-out
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedSchedule = {
          ...checkOutDialog.schedule!,
          hasCheckOut: true,
          checkOutTime: new Date().toISOString()
        };
        
        setSchedules(prev => prev.map(s =>
          s.scheduleId === updatedSchedule.scheduleId ? updatedSchedule : s
        ));
      } else {
        // API thật
        const response = await fetch(`${beBaseUrl}/booking/checkOut/${checkOutDialog.scheduleId}`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            userId: currentUserId,
            condition: checkOutForm.condition,
            notes: checkOutForm.notes,
            images: checkOutForm.images,
            rating: checkOutForm.rating
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Không thể check-out");
        }

        await loadSchedules();
      }

      setCheckOutDialog({ open: false, scheduleId: null, schedule: null });
      setCheckOutForm({ condition: "", notes: "", images: "", rating: 0 });
      showToast("Thành công", "Check-out thành công");
    } catch (error: any) {
      console.error("Error checking out:", error);
      showToast("Lỗi", error.message || "Không thể check-out", "destructive");
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    loadSchedules();
  }, []);

  // ===== STATUS HELPER =====
  const getScheduleStatus = (schedule: ScheduleItem) => {
    if (!schedule.hasCheckIn) {
      return {
        label: "Chờ nhận xe",
        color: "bg-blue-500",
        action: "check-in"
      };
    } else if (schedule.hasCheckIn && !schedule.hasCheckOut) {
      return {
        label: "Đang sử dụng",
        color: "bg-orange-500",
        action: "check-out"
      };
    } else {
      return {
        label: "Đã trả xe",
        color: "bg-green-500",
        action: "view-detail"
      };
    }
  };

  // ===== RENDER =====
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id}
               className={`p-4 rounded-lg shadow-lg border min-w-[300px] ${toast.variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${toast.variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`}/>
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

      <h2 className="text-3xl font-bold mb-6 text-white">Danh sách đặt lịch</h2>

      {loading ? (
        <div className="text-center py-12 text-white">Đang tải...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Chưa có lịch đặt nào</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map(schedule => {
            const status = getScheduleStatus(schedule);
            return (
              <Card key={schedule.scheduleId} 
                    className="bg-black/90 border-gray-700 text-white p-6 rounded-xl space-y-4 hover:bg-black/80 transition-all">
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">{schedule.vehicleName}</h3>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Car className="h-4 w-4" />
                    <span>Biển số: {schedule.vehiclePlate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span>Người thuê: {schedule.userName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <div className="text-sm">
                      <p>Bắt đầu: {formatDateTime(schedule.startTime)}</p>
                      <p>Kết thúc: {formatDateTime(schedule.endTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  {!schedule.hasCheckIn && (
                    <Button 
                      onClick={() => setCheckInDialog({
                        open: true,
                        scheduleId: schedule.scheduleId,
                        schedule: schedule
                      })} 
                      className="bg-blue-500 hover:bg-blue-600">
                      Check-in
                    </Button>
                  )}
                  
                  {schedule.hasCheckIn && !schedule.hasCheckOut && (
                    <Button 
                      onClick={() => setCheckOutDialog({
                        open: true,
                        scheduleId: schedule.scheduleId,
                        schedule: schedule
                      })} 
                      className="bg-orange-500 hover:bg-orange-600">
                      Check-out
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setDetailDialog({
                      open: true,
                      schedule: schedule
                    })}
                    className="border-white text-white hover:bg-white/20">
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Check-in Dialog */}
      <Dialog open={checkInDialog.open} onOpenChange={(open) => {
        if (!open) {
          setCheckInDialog({ open: false, scheduleId: null, schedule: null });
          setCheckInForm({ condition: "", notes: "", images: "" });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in nhận xe</DialogTitle>
            {checkInDialog.schedule && (
              <div className="text-sm text-muted-foreground mt-2">
                <div>{checkInDialog.schedule.vehicleName}</div>
                <div>Biển số: {checkInDialog.schedule.vehiclePlate}</div>
              </div>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Tình trạng xe <span className="text-red-500">*</span>
              </label>
              <Select 
                value={checkInForm.condition}
                onValueChange={(val) => setCheckInForm(prev => ({ ...prev, condition: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tình trạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tốt">✅ Tốt</SelectItem>
                  <SelectItem value="Bình thường">⚠️ Bình thường</SelectItem>
                  <SelectItem value="Có vấn đề">❌ Có vấn đề</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Ghi chú</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                placeholder="Mô tả tình trạng xe, vấn đề nếu có..."
                value={checkInForm.notes}
                onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Upload ảnh</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="URL ảnh (tạm thời nhập text)"
                  value={checkInForm.images}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, images: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Chụp ảnh xe trước khi sử dụng
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCheckIn} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Xác nhận Check-in
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCheckInDialog({ open: false, scheduleId: null, schedule: null });
                  setCheckInForm({ condition: "", notes: "", images: "" });
                }}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={checkOutDialog.open} onOpenChange={(open) => {
        if (!open) {
          setCheckOutDialog({ open: false, scheduleId: null, schedule: null });
          setCheckOutForm({ condition: "", notes: "", images: "", rating: 0 });
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-out trả xe</DialogTitle>
            {checkOutDialog.schedule && (
              <div className="text-sm text-muted-foreground mt-2">
                <div>{checkOutDialog.schedule.vehicleName}</div>
                <div>Biển số: {checkOutDialog.schedule.vehiclePlate}</div>
              </div>
            )}
          </DialogHeader>

          {checkOutDialog.schedule?.hasCheckIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="font-medium mb-1">Thông tin check-in:</div>
              <div className="text-muted-foreground">
                Thời gian: {formatDateTime(checkOutDialog.schedule.checkInTime || "")}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Tình trạng xe hiện tại <span className="text-red-500">*</span>
              </label>
              <Select 
                value={checkOutForm.condition}
                onValueChange={(val) => setCheckOutForm(prev => ({ ...prev, condition: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tình trạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tốt">✅ Tốt</SelectItem>
                  <SelectItem value="Bình thường">⚠️ Bình thường</SelectItem>
                  <SelectItem value="Có vấn đề">❌ Có vấn đề</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Ghi chú</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                placeholder="Mô tả vấn đề phát sinh (nếu có)..."
                value={checkOutForm.notes}
                onChange={(e) => setCheckOutForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Upload ảnh</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="URL ảnh (tạm thời nhập text)"
                  value={checkOutForm.images}
                  onChange={(e) => setCheckOutForm(prev => ({ ...prev, images: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Chụp ảnh xe sau khi sử dụng
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Đánh giá trải nghiệm <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setCheckOutForm(prev => ({ ...prev, rating: star }))}
                    className="transition-transform hover:scale-110">
                    <Star 
                      className={`h-8 w-8 ${
                        star <= checkOutForm.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
                {checkOutForm.rating > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {checkOutForm.rating} sao
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCheckOut} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Xác nhận Check-out
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCheckOutDialog({ open: false, scheduleId: null, schedule: null });
                  setCheckOutForm({ condition: "", notes: "", images: "", rating: 0 });
                }}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => {
        if (!open) setDetailDialog({ open: false, schedule: null });
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết sử dụng xe</DialogTitle>
          </DialogHeader>
          
          {detailDialog.schedule && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="font-semibold text-lg">{detailDialog.schedule.vehicleName}</div>
                <div className="text-sm text-muted-foreground">
                  Biển số: {detailDialog.schedule.vehiclePlate}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Người thuê:</span>
                  <span className="font-medium">{detailDialog.schedule.userName}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Thời gian bắt đầu:</span>
                  <span className="font-medium">{formatDateTime(detailDialog.schedule.startTime)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Thời gian kết thúc:</span>
                  <span className="font-medium">{formatDateTime(detailDialog.schedule.endTime)}</span>
                </div>
                
                {detailDialog.schedule.hasCheckIn && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium text-green-600">
                      ✓ {formatDateTime(detailDialog.schedule.checkInTime || "")}
                    </span>
                  </div>
                )}

                {detailDialog.schedule.hasCheckOut && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium text-blue-600">
                      ✓ {formatDateTime(detailDialog.schedule.checkOutTime || "")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    detailDialog.schedule.hasCheckOut ? 'bg-green-500' :
                    detailDialog.schedule.hasCheckIn ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {detailDialog.schedule.hasCheckOut ? 'Đã trả xe' :
                     detailDialog.schedule.hasCheckIn ? 'Đang sử dụng' :
                     'Chờ nhận xe'}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => setDetailDialog({ open: false, schedule: null })}>
                Đóng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}