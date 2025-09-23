import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Car, ArrowLeft, MessageSquare, Mail, Clock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"sms" | "email">("sms");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get user info from registration
  const userInfo = location.state as { phone?: string; email?: string; fullName?: string };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng nhập đầy đủ mã OTP 6 số",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP verification
    if (otp === "123456") {
      navigate("/co-owner/vehicle-registration");
      toast({
        title: "Xác thực thành công",
        description: "Tài khoản đã được xác thực. Hãy đăng ký xe của bạn!",
      });
    } else {
      toast({
        title: "Mã OTP không đúng",
        description: "Vui lòng kiểm tra lại mã OTP",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    // Simulate resend delay
    setTimeout(() => {
      setIsResending(false);
      toast({
        title: "Đã gửi lại mã OTP",
        description: `Mã xác thực đã được gửi đến ${selectedMethod === "sms" ? "số điện thoại" : "email"} của bạn`,
      });
    }, 2000);
  };

  const handleMethodChange = (method: "sms" | "email") => {
    setSelectedMethod(method);
    setOtp("");
    toast({
      title: "Đã chuyển phương thức",
      description: `Mã OTP sẽ được gửi qua ${method === "sms" ? "tin nhắn" : "email"}`,
    });
  };

  const maskedContact = selectedMethod === "sms" 
    ? userInfo?.phone?.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")
    : userInfo?.email?.replace(/(.{2}).*(@.*)/, "$1****$2");

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-glow border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EcoShare</span>
          </div>
          <CardTitle className="text-2xl font-bold">Xác thực tài khoản</CardTitle>
          <CardDescription>
            Nhập mã OTP để hoàn tất đăng ký tài khoản
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Chọn phương thức nhận mã:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedMethod === "sms" ? "default" : "outline"}
                onClick={() => handleMethodChange("sms")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Tin nhắn
              </Button>
              <Button
                type="button"
                variant={selectedMethod === "email" ? "default" : "outline"}
                onClick={() => handleMethodChange("email")}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Contact Info Display */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Mã OTP đã được gửi đến
            </p>
            <p className="font-medium">
              {selectedMethod === "sms" ? "📱 " : "📧 "}{maskedContact}
            </p>
          </div>

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">
                Nhập mã OTP (6 số)
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow"
              disabled={otp.length !== 6}
            >
              Xác thực OTP
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Không nhận được mã?
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-primary hover:text-primary/80"
            >
              {isResending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi lại...
                </>
              ) : (
                "Gửi lại mã OTP"
              )}
            </Button>
          </div>

          {/* Back to Register */}
          <div className="mt-6">
            <Link 
              to="/register" 
              className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại đăng ký</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}