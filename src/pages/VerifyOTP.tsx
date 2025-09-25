import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Car, ArrowLeft, MessageSquare, Mail, Clock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Formik, Form } from "formik";
import * as Yup from "yup";
export default function VerifyOTP() {
  const didRun = useRef(false);
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"sms" | "email">("email");
  const [time, setTime] = useState(30);
  const [expired, setExpired] = useState(false);
  const [initialDelayDone, setInitialDelayDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const userInfo = location.state as { phone?: string; email?: string; fullName?: string };
  if (!userInfo) {
    navigate("/register");
    return null;
  }

  const formatPhoneToE164 = (phone?: string) => {
    if (!phone) return "";
    phone = phone.replace(/\s+/g, "");
    if (phone.startsWith("0")) return "+84" + phone.slice(1);
    return phone;
  };

  const generateOtp = async (method: "sms" | "email") => {
    // tránh sinh OTP 2 lần trong Strict Mode (dev only)
    if (!didRun.current) {
      didRun.current = true;
    } else {
      // chỉ bỏ qua lần gọi thừa khi Strict Mode chạy effect 2 lần
      if (process.env.NODE_ENV === "development") return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(randomOtp);
    setTime(30);
    setExpired(false);

    console.log("OTP (debug):", randomOtp);

    try {
      if (method === "email" && userInfo?.email) {
        const response = await fetch("http://localhost:5000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "email",
            destination: userInfo.email,
            otp: randomOtp,
          }),
        });
        if (!response.ok) throw new Error("Send OTP failed");
        toast({
          title: "OTP đã được tạo",
          description: `Mã xác thực đã gửi qua Email: ${userInfo.email}`,
        });
      } else if (method === "sms" && userInfo?.phone) {
        const formattedPhone = formatPhoneToE164(userInfo.phone);
        const response = await fetch("http://localhost:5000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "sms",
            destination: formattedPhone,
            otp: randomOtp,
          }),
        });
        if (!response.ok) throw new Error("Send OTP failed");
        toast({
          title: "OTP đã được tạo",
          description: `Mã xác thực đã gửi qua SMS: ${formattedPhone}`,
        });
      } else {
        toast({
          title: "OTP đã được tạo",
          description: "Không thể gửi OTP vì thiếu thông tin liên hệ",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      toast({
        title: "Gửi OTP thất bại",
        description: "Không thể gửi OTP",
        variant: "destructive",
      });
    }
  };


  // gửi OTP lần đầu sau 5s, và gửi lại khi đổi phương thức
  useEffect(() => {
    if (!initialDelayDone) {
      const timer = setTimeout(() => {
        generateOtp(selectedMethod);
        setInitialDelayDone(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // chỉ chạy khi user đổi phương thức sau lần đầu
      generateOtp(selectedMethod);
    }
  }, [selectedMethod, initialDelayDone]);

  // countdown timer
  useEffect(() => {
    if (!initialDelayDone || time <= 0) return;
    const timer = setTimeout(() => setTime(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [time, initialDelayDone]);

  const otpSchema = Yup.object().shape({
    otp: Yup.string()
      .required("Vui lòng nhập OTP")
      .matches(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
  });
  const sendUserInfoToBackend = async () => {
    try {
      const response = await fetch("https://68ca27d4430c4476c34861d4.mockapi.io/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });
      if (!response.ok) throw new Error("Failed to create user");
      const data = await response.json();
      console.log("User created:", data);
    } catch (err) {
      console.error("Error sending userInfo:", err);
    }
  };

  const handleMethodChange = (method: "sms" | "email") => {
    setSelectedMethod(method);
    if (!initialDelayDone) {
      setSelectedMethod(method); // cập nhật lựa chọn để 5s sau gửi đúng
    }
  };

  const handleResendOTP = () => {
    setIsResending(true);
    setTimeout(() => {
      generateOtp(selectedMethod);
      setIsResending(false);
    }, 2000);
  };

  const maskedContact =
    selectedMethod === "sms"
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
          <CardDescription>Nhập mã OTP để hoàn tất đăng ký tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chọn phương thức */}
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

          {/* Thông tin liên hệ */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Mã OTP đã được gửi đến</p>
            <p className="font-medium">
              {selectedMethod === "sms" ? "📱 " : "📧 "}
              {maskedContact}
            </p>
          </div>

          {/* Form OTP với Formik */}
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={otpSchema}
            onSubmit={async values => {
              if (expired) {
                toast({
                  title: "OTP hết hạn",
                  description: "Vui lòng yêu cầu gửi lại mã OTP mới",
                  variant: "destructive",
                });
                return;
              }
              if (values.otp === otp) {
                await sendUserInfoToBackend();
                navigate("/co-owner/vehicle-registration");
                toast({
                  title: "Xác thực thành công",
                  description: "Tài khoản đã được tạo thành công!",
                });
              } else {
                toast({
                  title: "Mã OTP không đúng",
                  description: "Vui lòng kiểm tra lại mã OTP",
                  variant: "destructive",
                });
              }
            }}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-center block">
                    Nhập mã OTP (6 số)
                  </label>
                  <div className="text-center text-sm text-muted-foreground">
                    {expired
                      ? "OTP đã hết hạn, vui lòng gửi lại."
                      : `Mã OTP hết hạn sau ${time}s`}
                  </div>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={values.otp}
                      onChange={value => setFieldValue("otp", value)}
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
                  {errors.otp && touched.otp && (
                    <p className="text-red-500 text-sm text-center">{errors.otp}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  disabled={!!errors.otp || values.otp.length !== 6}
                >
                  Xác thực OTP
                </Button>
              </Form>
            )}
          </Formik>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Không nhận được mã?</p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={!expired || isResending}
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

          {/* Quay lại đăng ký */}
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
