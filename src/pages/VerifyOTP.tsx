import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Car, ArrowLeft, Mail, Clock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Formik, Form } from "formik";
import * as Yup from "yup";
export default function VerifyOTP() {
  const didRun = useRef(false);
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [selectedMethod] = useState<"email">("email");
  const [time, setTime] = useState(30);
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null)
  useEffect(() => {
    // ưu tiên lấy từ location.state (điều hướng từ Register qua)
    if (location.state) {
      console.log("User data từ Register:", location.state);
      setUserData(location.state);
      localStorage.setItem("userInfo", JSON.stringify(location.state));
    } else {
      // nếu reload thì lấy từ localStorage
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      } else {
        navigate("/register"); // không có gì thì về lại Register
      }
    }
  }, [location.state, navigate]);
  const generateOtp = async (method: "sms" | "email") => {
    // tránh sinh OTP 2 lần trong Strict Mode (dev only)
    //if (!didRun.current) {
    //didRun.current = true;
    //} else {
    // chỉ bỏ qua lần gọi thừa khi Strict Mode chạy effect 2 lần
    //if (process.env.NODE_ENV === "development") return;
    //}

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(randomOtp);
    setTime(30);
    setExpired(false);

    console.log("OTP (debug):", randomOtp);

    try {
      if (method === "email" && userData?.email) {
        const response = await fetch("http://localhost:5000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "email",
            destination: userData.email,
            otp: randomOtp,
          }),
        });
        if (!response.ok) throw new Error("Send OTP failed");
        toast({
          title: "OTP đã được tạo",
          description: `Mã xác thực đã gửi qua Email: ${userData.email}`,
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


  // gửi OTP lần đầu//
  useEffect(() => {
    if (userData) {
      generateOtp("email");
    }
  }, [userData]);


  // countdown timer
  useEffect(() => {
    if (time <= 0) return;
    const timer = setTimeout(() => setTime(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [time]);
  useEffect(() => {
    if (time === 0) setExpired(true);
  }, [time]);
  const otpSchema = Yup.object().shape({
    otp: Yup.string()
      .required("Vui lòng nhập OTP")
      .matches(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
  });
  const sendUserInfoToBackend = async () => {
    try {
      // lấy danh sách user trước
      const checkRes = await fetch("http://localhost:8080/auth/register");
      const users = await checkRes.json();

      const exists = users.find(
        (u: any) => u.email === userData.email || u.cccd === userData.cccd || u.gplx === userData.gplx
      );

      if (exists) {
        toast({
          title: "Đăng ký thất bại",
          description: "Email/CCCD/GPLX đã tồn tại trong hệ thống",
          variant: "destructive",
        });
        return; // không tạo nữa
      }

      // nếu không trùng -> mới tạo user
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to create user");
      const data = await response.json();
      console.log("User created:", data);
    } catch (err) {
      console.error("Error sending userInfo:", err);
    }
  };
  const handleResendOTP = () => {
    setIsResending(true);
    setTimeout(() => {
      setOtp("");
      generateOtp(selectedMethod);
      setTime(30);        // reset countdown về 30
      setExpired(false);  // cho phép chạy lại
      setIsResending(false);
    }, 2000);
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      navigate("/register"); // nếu không có thì quay lại đăng ký
    }
  }, [navigate]);
  const maskedContact = userData?.email?.replace(/(.{2}).*(@.*)/, "$1****$2");
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
                navigate("/co-owner/dashboard");
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
