import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Car, ArrowLeft, Clock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";

export default function VerifyOTP() {
    const [otp, setOtp] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [time, setTime] = useState(30);
    const [expired, setExpired] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const userData = location.state; // lấy từ Register

    useEffect(() => {
        if (!userData) {
            navigate("/register");
            return;
        }
        generateOtp();
    }, []);

    // Gửi OTP qua email
    const generateOtp = async () => {
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtp(randomOtp);
        setTime(30);
        setExpired(false);

        console.log("OTP (debug):", randomOtp);

        try {
            await axios.post("http://localhost:5000/send-otp", {
                method: "email",
                destination: userData.email,
                otp: randomOtp,
            });

            toast({
                title: "OTP đã được gửi",
                description: `Vui lòng kiểm tra email: ${userData.email}`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Gửi OTP thất bại",
                description: "Không thể gửi mã xác thực",
                variant: "destructive",
            });
        }
    };

    // Countdown timer
    useEffect(() => {
        if (time <= 0) return;
        const timer = setTimeout(() => setTime((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [time]);

    useEffect(() => {
        if (time === 0) setExpired(true);
    }, [time]);

    const otpSchema = Yup.object().shape({
        otp: Yup.string().required("Vui lòng nhập OTP").matches(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
    });

    const handleResendOTP = async () => {
        setIsResending(true);
        await generateOtp();
        setIsResending(false);
    };

    const handleVerify = async () => {
        try {
            await axios.post("http://localhost:8080/auth/register", userData);
            toast({
                title: "Xác thực thành công",
                description: "Tài khoản đã được tạo!",
            });
            navigate("/co-owner/dashboard");
        } catch (error) {
            console.error("Error creating user:", error);
            toast({
                title: "Đăng ký thất bại",
                description: "Không thể tạo tài khoản",
                variant: "destructive",
            });
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
                            if (values.otp === otp) {
                                await handleVerify();
                            } else {
                                toast({
                                    title: "Mã OTP không đúng",
                                    description: "Vui lòng kiểm tra lại mã",
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
                                    <Clock className="h-4 w-4 mr-2 animate-spin" /> Đang gửi lại...
                                </>
                            ) : (
                                "Gửi lại mã OTP"
                            )}
                        </Button>
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
