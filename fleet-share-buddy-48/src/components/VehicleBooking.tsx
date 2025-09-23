import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, Users, AlertCircle, Edit, X, Check, Shield, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRuleEngine } from "@/hooks/useRuleEngine";
import { RuleViolationPanel } from "@/components/RuleViolationPanel";

interface BookingSlot {
  id: string;
  time: string;
  date: string;
  vehicle: string;
  bookedBy: string;
  ownershipLevel: number;
  canOverride?: boolean;
  isMyBooking?: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  available: boolean;
  groupName: string;
}

export default function VehicleBooking() {
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
  const { toast } = useToast();

  // Rule Engine for booking validation
  const { 
    violations, 
    isChecking, 
    checkRules, 
    canMakeBooking, 
    resolveViolation 
  } = useRuleEngine("group-1", "user-1");

  // Mock data - would come from backend
  const vehicles: Vehicle[] = [
    { id: "1", name: "VinFast VF8", available: true, groupName: "Nhóm VinFast" },
    { id: "2", name: "Tesla Model Y", available: true, groupName: "Nhóm Tesla" },
  ];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const existingBookings: BookingSlot[] = [
    {
      id: "1",
      time: "09:00-11:00",
      date: "2024-01-16",
      vehicle: "VinFast VF8",
      bookedBy: "Bạn (35%)", // Current user's booking
      ownershipLevel: 35,
      canOverride: false,
      isMyBooking: true
    },
    {
      id: "2", 
      time: "14:00-17:00",
      date: "2024-01-16",
      vehicle: "Tesla Model Y",
      bookedBy: "Trần Thị B (25%)",
      ownershipLevel: 25,
      canOverride: true,
      isMyBooking: false
    },
    {
      id: "3",
      time: "13:00-15:00", 
      date: "2024-01-16",
      vehicle: "VinFast VF8",
      bookedBy: "Lê Văn C (40%)",
      ownershipLevel: 40,
      canOverride: false,
      isMyBooking: false
    },
    {
      id: "4",
      time: "16:00-18:00",
      date: "2024-01-17", 
      vehicle: "Tesla Model Y",
      bookedBy: "Bạn (35%)", // Another booking by current user
      ownershipLevel: 35,
      canOverride: false,
      isMyBooking: true
    }
  ];

  const currentUserOwnership = 35; // Mock current user ownership percentage

  const getOwnershipColor = (ownership: number) => {
    if (ownership >= 50) return "default";
    if (ownership >= 30) return "secondary";
    return "outline";
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
    setSelectedTime(timeRange);
    setShowTimeSelector(false);
    
    toast({
      title: "Đã chọn thời gian",
      description: `Thời gian: ${timeRange}`,
    });
  };

  const handleBooking = () => {
    if (!selectedVehicle || !selectedDate || !selectedTime) return;
    
    // Check if user can make booking based on rule engine
    const canBook = canMakeBooking();
    
    if (!canBook) {
      toast({
        title: "Không thể đặt lịch",
        description: "Bạn có vi phạm quy định hoặc nợ quá hạn. Vui lòng kiểm tra phần vi phạm.",
        variant: "destructive"
      });
      return;
    }

    // Demo: Simulate different rule scenarios based on selected date
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    const daysDiff = Math.ceil((selectedDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Create demo schedule to check rules
    const demoSchedule = {
      id: `schedule-${Date.now()}`,
      userId: "user-1",
      groupId: "group-1", 
      vehicleId: selectedVehicle === "VinFast VF8" ? "vehicle-1" : "vehicle-2",
      startTime: `${selectedDate}T${selectedStartTime?.split('-')[0] || '09'}:00:00Z`,
      endTime: `${selectedDate}T${selectedEndTime || '17:00'}:00Z`,
      status: "pending" as const,
      priority: 50,
      isEmergency: false
    };

    // Demo different scenarios based on booking pattern
    let consecutiveDays = 8; // Normal usage
    
    // If booking for more than 7 days from today, simulate consecutive usage violation
    if (daysDiff > 7) {
      consecutiveDays = 16; // Triggers violation: exceeds 14 day limit
      toast({
        title: "Demo: Kích hoạt vi phạm",
        description: "Đặt lịch xa (>7 ngày) sẽ mô phỏng vi phạm sử dụng quá 14 ngày liên tiếp",
        variant: "destructive"
      });
    }

    const demoHistory = {
      userId: "user-1", 
      groupId: "group-1",
      totalHours: 80 + (daysDiff * 2), // Increase hours based on days
      totalDays: 12 + daysDiff,
      consecutiveDaysUsed: consecutiveDays,
      violationCount: consecutiveDays > 14 ? 1 : 0,
      lastUsageDate: "2024-01-15T00:00:00Z"
    };

    // Check scheduling rules
    checkRules(demoSchedule, demoHistory);
    
    console.log("Booking:", { selectedVehicle, selectedDate, selectedTime });
    
    toast({
      title: "Đặt lịch thành công",
      description: `Đã đặt ${selectedVehicle} vào ${selectedDate} từ ${selectedTime}`,
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = existingBookings.find(b => b.id === bookingId);
    if (booking && !booking.isMyBooking) {
      toast({
        title: "Không thể hủy",
        description: "Bạn chỉ có thể hủy lịch của chính mình",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Cancelling booking:", bookingId);
    toast({
      title: "Đã hủy lịch",
      description: "Lịch đặt xe đã được hủy thành công",
    });
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = existingBookings.find(b => b.id === bookingId);
    if (booking && !booking.isMyBooking) {
      toast({
        title: "Không thể chỉnh sửa",
        description: "Bạn chỉ có thể chỉnh sửa lịch của chính mình",
        variant: "destructive"
      });
      return;
    }
    
    if (booking) {
      setEditingBooking(bookingId);
      setEditVehicle(booking.vehicle);
      setEditDate(booking.date);
      setEditTime(booking.time);
    }
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditVehicle("");
    setEditDate("");
    setEditTime("");
  };

  const handleUpdateBooking = () => {
    try {
      console.log("Updating booking:", { editingBooking, editVehicle, editDate, editTime });
      
      toast({
        title: "Cập nhật thành công",
        description: "Lịch đặt xe đã được cập nhật thành công",
      });
      
      setEditingBooking(null);
      setEditVehicle("");
      setEditDate("");
      setEditTime("");
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Đặt lịch sử dụng xe</span>
            </CardTitle>
            <CardDescription>
              Lên lịch sử dụng xe điện trong nhóm đồng sở hữu
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Vi phạm đặt lịch ({violations.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quản lý vi phạm quy định đặt lịch</DialogTitle>
                </DialogHeader>
                <RuleViolationPanel
                  violations={violations}
                  onResolve={resolveViolation}
                  canResolve={false}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Rules Explanation */}
        <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Hướng dẫn demo quy tắc:</span>
              </div>
              <ul className="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-1 ml-6">
                <li>• Đặt lịch trong 7 ngày: Sử dụng bình thường</li>
                <li>• Đặt lịch xa hơn 7 ngày: Mô phỏng vi phạm "sử dụng quá 14 ngày liên tiếp"</li>
                <li>• Chỉ có thể chỉnh sửa/hủy lịch của chính mình</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Chọn xe</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
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
          className={`w-full ${canMakeBooking() ? 'bg-gradient-primary hover:shadow-glow' : 'bg-destructive hover:bg-destructive/90'}`}
          disabled={!selectedVehicle || !selectedDate || !selectedTime}
        >
          {canMakeBooking() ? 'Đặt lịch' : 'Không thể đặt lịch (có vi phạm)'}
        </Button>

        {/* Rule violations warning */}
        {violations.length > 0 && (
          <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Bạn có {violations.length} vi phạm quy định có thể ảnh hưởng đến việc đặt lịch
                </span>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <Select value={editTime} onValueChange={setEditTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <span>{time}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <div className="space-y-3">
            {existingBookings.map((booking) => (
              <div 
                key={booking.id} 
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  editingBooking === booking.id ? 'bg-primary/10 border-primary/50' : 'bg-accent/20'
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
                    {booking.isMyBooking && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Lịch của bạn
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {booking.date} • {booking.time}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {booking.canOverride && !booking.isMyBooking && (
                    <Badge variant="secondary" className="text-xs bg-warning/20 text-warning-foreground">
                      Có thể thay thế
                    </Badge>
                  )}
                  {booking.isMyBooking && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBooking(booking.id)}
                        disabled={editingBooking === booking.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {!booking.isMyBooking && (
                    <Badge variant="outline" className="text-xs">
                      Của người khác
                    </Badge>
                  )}
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
