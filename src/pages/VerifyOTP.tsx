import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Car, ArrowLeft, Clock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axiosClient from "@/api/axiosClient";
export default function VerifyOTP() {
    const [canResend, setCanResend] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otp, setOtp] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [time, setTime] = useState(60);
    const [expired, setExpired] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const userData = location.state?.userObject;
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!userData) {
            toast({
                title: "Thiếu thông tin đăng ký",
                description: "Vui lòng điền lại thông tin ở trang đăng ký.",
                variant: "destructive",
            });
            navigate("/register");
            return;
        }
        sendOtpEmail();         // Không để canResend = true trước khi startTimer
    }, [userData]);
    // 🔹 Frontend tạo OTP và gửi tới backend để backend gửi mail
    const SEND_OTP = import.meta.env.VITE_SEND_EMAIL_OTP_PATH;
    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTime(60);
        setExpired(false);
        timerRef.current = setInterval(() => {
            setTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    const sendOtpEmail = async () => {
        // Dừng timer cũ
        if (timerRef.current) clearInterval(timerRef.current);

        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtp(randomOtp);

        try {
            await axiosClient.post(SEND_OTP, {
                email: userData.email,
                content: randomOtp,
                template: "",
                subject: "",
                name: userData.hovaTen,
            });
            startTimer(); // ⬅️ Quan trọng
            toast({
                title: "Đã gửi mã OTP",
                description: `Vui lòng kiểm tra email: ${userData.email}`,
                variant: "success",
            });
        } catch (err) {
            toast({
                title: "Gửi OTP thất bại",
                description: "Không thể gửi email xác thực.",
                variant: "destructive",
            });
        }
    };

    // ⏰ Đếm ngược thời gian
    useEffect(() => {
        if (time === 0) setExpired(true);
    }, [time]);

    const otpSchema = Yup.object().shape({
        otp: Yup.string()
            .required("Vui lòng nhập OTP")
            .matches(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
    });

    const handleResendOTP = async () => {
        if (!canResend) return;
        setIsResending(true); // 🔥 bật trạng thái loading

        try {
            await sendOtpEmail();
            setCanResend(false)
            startTimer();          // disable nút + 60s đếm ngược
        } catch (err) {
            console.error(err);
        } finally {
            setIsResending(false); // 🔥 tắt loading sau khi xong
        }
    };

    const REGISTER = import.meta.env.VITE_AUTH_REGISTER;
    // 🔹 Chỉ gọi 1 lần API tạo tài khoản khi OTP đúng
    const handleVerify = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsVerifying(true);
        try {
            await axiosClient.post(REGISTER, userData);
            toast({
                title: "Xác thực thành công",
                description: "Tài khoản đã được tạo!",
                variant: "success",
            });
            setTimeout(() => navigate("/login"), 1000);
        } catch (error: any) {
            console.error("Error creating user:", error);
        }
        finally {
            setIsVerifying(false);
        }
    };
    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-glow border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <Car className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-primary">EcoShare</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Xác thực tài khoản</CardTitle>
                    <CardDescription>Nhập mã OTP để hoàn tất đăng ký</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Formik
                        initialValues={{ otp: "" }}
                        validationSchema={otpSchema}
                        onSubmit={async (values) => {
                            if (expired) {
                                toast({
                                    title: "OTP hết hạn",
                                    description: "Vui lòng yêu cầu gửi lại mã OTP mới",
                                    variant: "destructive",
                                });
                                return;
                            }
                            if (timerRef.current) clearInterval(timerRef.current);
                            if (values.otp === otp) {
                                await handleVerify(); // ✅ chỉ gọi 1 lần API tạo tài khoản
                            } else {
                                toast({
                                    title: "Mã OTP không đúng",
                                    description: "Mã OTP bạn nhập không khớp. Vui lòng thử lại.",
                                    variant: "destructive",
                                });
                            }
                        }}
                    >
                        {({ values, setFieldValue, errors, touched }) => (
                            <Form className="space-y-6">
                                <div className="space-y-2 text-center">
                                    <label className="text-sm font-medium">Nhập mã OTP (6 số)</label>
                                    <div className="text-sm text-muted-foreground">
                                        {expired ? "OTP đã hết hạn" : `Còn lại ${time}s`}
                                    </div>
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            value={values.otp}
                                            onChange={(value) => setFieldValue("otp", value)}
                                        >
                                            <InputOTPGroup>
                                                {[...Array(6)].map((_, i) => (
                                                    <InputOTPSlot key={i} index={i} />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    {errors.otp && touched.otp && (
                                        <p className="text-red-500 text-sm text-center">{errors.otp}</p>
                                    )}
                                </div>

                                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                                    <Button disabled={isVerifying || !!errors.otp || values.otp.length !== 6}>
                                        {isVerifying ? "Đang xác thực..." : "Xác thực OTP"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-center">
                            Không nhận được mã?
                        </p>

                        <div className="flex justify-center w-full">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResendOTP}
                                disabled={!canResend || isResending}
                                className="text-primary hover:text-primary/80"
                            >
                                {isResending ? (
                                    "Đang xử lý..."
                                ) : canResend ? (
                                    "Gửi lại mã OTP"
                                ) : (
                                    <>Gửi lại mã OTP ({time}s)</>
                                )}
                            </Button>

                        </div>
                    </div>
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
