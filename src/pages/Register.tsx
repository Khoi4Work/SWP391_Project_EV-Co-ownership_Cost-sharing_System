declare const window: any;
import { useNavigate, Link } from "react-router-dom";
import { Car, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { waitForCvReady } from "@/lib/opencvHelpers";
import { useLocation } from "react-router-dom";
import axios from "axios";
async function preprocessWithOpenCV(file: File): Promise<string> {
    await waitForCvReady(); // helper ở trên
    const cv = (window as any).cv;

    // Load image -> canvas
    const imgURL = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = imgURL;
    });

    const canvas = document.createElement("canvas");
    const maxW = 1200;
    const scale = img.width > maxW ? maxW / img.width : 1;
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // OpenCV processing
    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);
    const thresh = new cv.Mat();
    cv.adaptiveThreshold(blurred, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 8);

    // invert so text black-on-white if needed
    const inverted = new cv.Mat();
    cv.bitwise_not(thresh, inverted);

    // write to canvas
    const out = new cv.Mat();
    cv.cvtColor(inverted, out, cv.COLOR_GRAY2RGBA);
    const outCanvas = document.createElement("canvas");
    outCanvas.width = out.cols;
    outCanvas.height = out.rows;
    const imgData = new ImageData(new Uint8ClampedArray(out.data), out.cols, out.rows);
    outCanvas.getContext("2d")!.putImageData(imgData, 0, 0);

    // cleanup
    src.delete();
    gray.delete();
    blurred.delete();
    thresh.delete();
    inverted.delete();
    out.delete();

    return outCanvas.toDataURL("image/png");
}

export default function Register() {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const CHECK_DUPLICATE = import.meta.env.VITE_CHECK_DUPLICATE_FIELD;
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showTerms, setShowTerms] = useState(false);
    const [ocrLoadingCccd, setOcrLoadingCccd] = useState(false);
    const [ocrLoadingGplx, setOcrLoadingGplx] = useState(false);
    // check uniqueness API backend host:http://localhost:8080/users/check?${field}=${value} 

    useEffect(() => {
        if (location.state?.registorError) {
            toast({
                title: "Đăng ký thất bại",
                description: location.state.registorError,
                variant: "destructive",
            });
            // reset state để không hiển thị lại khi F5
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);
    // OCR CCCD
    const handleUploadCccd = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setOcrLoadingCccd(true);
        try {
            const preprocessed = await preprocessWithOpenCV(file);
            const { data } = await Tesseract.recognize(preprocessed, "eng", { logger: m => console.log(m) });
            const text = data.text.replace(/\s+/g, "");
            const match = text.match(/0\d{11}/); // Regex 12 số bắt đầu bằng 0
            if (match) {
                setFieldValue("cccd", match[0]);
                toast({ title: "CCCD nhận diện thành công", description: match[0] });
            } else {
                toast({ title: "Không nhận diện được CCCD", variant: "destructive" });
            }
        } catch (err) {
            console.error("OCR CCCD error:", err);
            toast({ title: "Lỗi OCR", description: "Có lỗi xảy ra", variant: "destructive" });
        } finally {
            setOcrLoadingCccd(false);
        }
    };

    // OCR GPLX
    const handleUploadGplx = async (e, setFieldValue) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setOcrLoadingGplx(true);
        try {
            const preprocessed = await preprocessWithOpenCV(file);
            const { data } = await Tesseract.recognize(preprocessed, "eng", { logger: m => console.log(m) });
            const text = data.text.replace(/\s+/g, "");
            // Lấy cả chữ in hoa và số, 8 ký tự trở lên
            // Lấy chuỗi số dài 8–12 chữ số
            const match = text.match(/\d{8,12}/);
            if (match) {
                setFieldValue("gplx", match[0]);
                console.log("GPLX OCR:", match[0]);
            } else {
                console.log("Không nhận diện được GPLX");
            }
        } catch (err) {
            console.error("OCR GPLX lỗi:", err);
        } finally {
            setOcrLoadingGplx(false);
        }
    };
    const validationSchema = Yup.object({
        hovaTen: Yup.string()
            .required("Vui lòng nhập họ và tên")
            .matches(/^[A-Za-zÀ-ỹà-ỹ\s]+$/, "Họ và tên chỉ được chứa chữ cái"),
        email: Yup.string()
            .required("Vui lòng nhập email")
            .matches(/^[a-zA-Z0-9][\w.-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email không hợp lệ"),
        phone: Yup.string()
            .required("Vui lòng nhập số điện thoại")
            .matches(/^0\d{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0"),
        cccd: Yup.string()
            .required("Vui lòng nhập số CCCD")
            .matches(/^0\d{11}$/, "CCCD phải có 12 số và bắt đầu bằng số 0"),
        gplx: Yup.string()
            .required("Vui lòng nhập số giấy phép lái xe")
            .matches(/^\d{12}$/, "GPLX phải có 12 chữ số"),
        password: Yup.string()
            .required("Vui lòng nhập mật khẩu")
            .min(6, "Mật khẩu phải từ 6 đến 20 ký tự")
            .max(20, "Mật khẩu phải từ 6 đến 20 ký tự"),
        confirmPassword: Yup.string()
            .required("Vui lòng xác nhận mật khẩu")
            .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp"),
        acceptTerms: Yup.boolean()
            .oneOf([true], "Bạn phải đồng ý với các điều khoản"),
    });
    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-glow border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <Car className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-primary">EcoShare</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
                    <CardDescription>
                        Tạo tài khoản để tham gia cộng đồng đồng sở hữu xe điện
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Formik
                        initialValues={{
                            hovaTen: "",
                            email: "",
                            phone: "",
                            cccd: "",
                            gplx: "",
                            password: "",
                            confirmPassword: "",
                            acceptTerms: false,
                        }}
                        validationSchema={validationSchema}
                        validateOnChange={false}
                        onSubmit={async (values, { setSubmitting }) => {
                            const userObject = {
                                hovaTen: values.hovaTen,
                                email: values.email,
                                phone: values.phone,
                                cccd: values.cccd,
                                gplx: values.gplx,
                                password: values.password,
                                roleId: 1
                            };
                            console.log("User Object:", userObject);
                            try {
                                const payload = {
                                    email: values.email,
                                    phone: values.phone,
                                    cccd: values.cccd,
                                    gplx: values.gplx,
                                    roleId: 1,
                                    hovaTen: values.hovaTen,
                                }
                                const response = await axios.get(`${BASE_URL}${CHECK_DUPLICATE}`, {
                                    params: payload,
                                });
                                // Nếu không lỗi → navigate
                                if (response.status === 200) {
                                    toast({
                                        title: "Thông tin hợp lệ",
                                        description: "Vui lòng xác thực tài khoản bằng mã OTP",
                                    });
                                    navigate("/verify-otp", { state: { userObject } });
                                }
                            } catch (error: any) {
                                console.log("ERROR:", error);
                                // BE trả về lỗi → hiển thị cho người dùng
                                toast({
                                    title: "Lỗi đăng ký",
                                    description: error.response?.data || "Đã xảy ra lỗi",
                                    variant: "destructive"
                                });
                            }
                            finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, setFieldValue }) => (
                            <Form className="space-y-4">

                                {/* Họ và tên */}
                                <div className="space-y-2">
                                    <Label htmlFor="hovaTen">Họ và tên*</Label>
                                    <Field name="hovaTen">
                                        {({ field, form }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="hovaTen"
                                                    placeholder="Nhập họ và tên đầy đủ"
                                                    onChange={(e) => {
                                                        form.setFieldValue("hovaTen", e.target.value);
                                                        form.setFieldError("hovaTen", "");
                                                    }}
                                                    onBlur={() => form.validateField("hovaTen")}
                                                />
                                                {form.touched.hovaTen && form.errors.hovaTen && (
                                                    <div className="text-red-500 text-xs">{form.errors.hovaTen}</div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email*</Label>
                                    <Field name="email">
                                        {({ field, form }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="email"
                                                    type="email"
                                                    placeholder="Nhập email của bạn"
                                                    onChange={(e) => {
                                                        form.setFieldValue("email", e.target.value);
                                                        form.setFieldError("email", "");
                                                    }}
                                                    onBlur={() => form.validateField("email")}
                                                />
                                                {form.touched.email && form.errors.email && (
                                                    <div className="text-red-500 text-xs">{form.errors.email}</div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* CCCD */}
                                <div className="space-y-2 relative">
                                    <Label htmlFor="cccd">CCCD*</Label>
                                    <Field name="cccd">
                                        {({ field, form }) => (
                                            <>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        id="cccd"
                                                        placeholder="Số CCCD"
                                                        onChange={(e) => {
                                                            form.setFieldValue("cccd", e.target.value);
                                                            form.setFieldError("cccd", "");
                                                        }}
                                                        onBlur={() => form.validateField("cccd")}
                                                    />
                                                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                                                        {ocrLoadingCccd ? "⏳" : "📷"}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleUploadCccd(e, setFieldValue)}
                                                        />
                                                    </label>
                                                </div>

                                                {form.touched.cccd && form.errors.cccd && (
                                                    <div className="text-red-500 text-xs">{form.errors.cccd}</div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* GPLX */}
                                <div className="space-y-2 relative">
                                    <Label htmlFor="gplx">Giấy phép lái xe*</Label>
                                    <Field name="gplx">
                                        {({ field, form }) => (
                                            <>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        id="gplx"
                                                        placeholder="số GPLX"
                                                        onChange={(e) => {
                                                            form.setFieldValue("gplx", e.target.value);
                                                            form.setFieldError("gplx", "");
                                                        }}
                                                        onBlur={() => form.validateField("gplx")}
                                                    />
                                                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                                                        {ocrLoadingGplx ? "⏳" : "📷"}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleUploadGplx(e, setFieldValue)}
                                                        />
                                                    </label>
                                                </div>

                                                {form.touched.gplx && form.errors.gplx && (
                                                    <div className="text-red-500 text-xs">{form.errors.gplx}</div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại*</Label>
                                    <Field name="phone">
                                        {({ field, form }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="Nhập số điện thoại"
                                                    onChange={(e) => {
                                                        form.setFieldValue("phone", e.target.value);
                                                        form.setFieldError("phone", "");
                                                    }}
                                                    onBlur={() => form.validateField("phone")}
                                                />
                                                {form.touched.phone && form.errors.phone && (
                                                    <div className="text-red-500 text-xs">{form.errors.phone}</div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu*</Label>
                                    <Field name="password">
                                        {({ field, form }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="password"
                                                    type="password"
                                                    placeholder="Nhập mật khẩu"
                                                    onChange={(e) => {
                                                        form.setFieldValue("password", e.target.value);
                                                        form.setFieldError("password", "");
                                                    }}
                                                    onBlur={() => form.validateField("password")}
                                                />
                                                {form.touched.password && form.errors.password && (
                                                    <div className="text-red-500 text-xs">{form.errors.password}</div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu*</Label>
                                    <Field name="confirmPassword">
                                        {({ field, form }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="Nhập lại mật khẩu"
                                                    onChange={(e) => {
                                                        form.setFieldValue("confirmPassword", e.target.value);
                                                        form.setFieldError("confirmPassword", "");
                                                    }}
                                                    onBlur={() => form.validateField("confirmPassword")}
                                                />
                                                {form.touched.confirmPassword &&
                                                    form.errors.confirmPassword && (
                                                        <div className="text-red-500 text-xs">
                                                            {form.errors.confirmPassword}
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Checkbox giữ nguyên */}
                                <div className="flex items-center space-x-2">
                                    <Field type="checkbox" id="acceptTerms" name="acceptTerms" />
                                    <Label htmlFor="acceptTerms" className="mb-0">
                                        Tôi đồng ý với{" "}
                                        <button
                                            type="button"
                                            className="text-primary underline"
                                            onClick={() => setShowTerms(true)}
                                        >
                                            Điều khoản và Điều kiện
                                        </button>
                                    </Label>
                                </div>

                                <ErrorMessage
                                    name="acceptTerms"
                                    component="div"
                                    className="text-red-500 text-xs"
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-primary hover:shadow-glow"
                                    disabled={isSubmitting}
                                >
                                    Đăng ký
                                </Button>
                            </Form>
                        )}
                    </Formik>
                    {showTerms && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                                <button
                                    className="absolute top-2 right-2 text-gray-500 hover:text-primary"
                                    onClick={() => setShowTerms(false)}
                                    aria-label="Đóng"
                                >
                                    ×
                                </button>
                                <h2 className="text-lg font-bold mb-2">Điều khoản và Điều kiện</h2>
                                <div className="max-h-80 overflow-y-auto text-sm text-gray-700 space-y-3">

                                    <p>
                                        <strong>1. Thông tin đăng ký:</strong> Người dùng cam kết cung cấp thông tin chính xác, đầy đủ và chịu trách nhiệm
                                        đối với toàn bộ dữ liệu đã cung cấp trên hệ thống EcoShare.
                                    </p>

                                    <p>
                                        <strong>2. Bảo mật tài khoản:</strong> Người dùng có trách nhiệm bảo vệ thông tin đăng nhập. EcoShare không chịu
                                        trách nhiệm đối với các thiệt hại phát sinh từ việc chia sẻ tài khoản hoặc sử dụng sai mục đích.
                                    </p>

                                    <p>
                                        <strong>3. Quyền và nghĩa vụ của người dùng:</strong> Tài khoản chỉ được sử dụng cho mục đích hợp pháp và theo đúng
                                        các quy định của EcoShare. Các hành vi gian lận, cung cấp thông tin giả, lạm dụng dịch vụ đều bị nghiêm cấm.
                                    </p>

                                    <p>
                                        <strong>4. Quyền và trách nhiệm của EcoShare:</strong> EcoShare có quyền cập nhật hoặc thay đổi nội dung dịch vụ,
                                        điều khoản sử dụng và các chính sách liên quan khi cần thiết, đồng thời sẽ thông báo cho người dùng theo quy định.
                                    </p>

                                    <p>
                                        <strong>5. Xử lý vi phạm:</strong> EcoShare có quyền tạm khóa, hạn chế hoặc chấm dứt tài khoản nếu phát hiện người
                                        dùng vi phạm điều khoản, gây ảnh hưởng đến hệ thống hoặc quyền lợi của người khác.
                                    </p>

                                    <p>
                                        <strong>6. Miễn trừ trách nhiệm:</strong> EcoShare không chịu trách nhiệm đối với các sự cố phát sinh ngoài khả năng
                                        kiểm soát như lỗi mạng, sự cố kỹ thuật từ phía nhà cung cấp thứ ba hoặc hành vi cố ý của người dùng.
                                    </p>

                                    <p>
                                        <strong>7. Hỗ trợ và liên hệ:</strong> Mọi thắc mắc hoặc yêu cầu hỗ trợ, người dùng có thể liên hệ trung tâm trợ giúp
                                        của EcoShare để được giải đáp kịp thời.
                                    </p>

                                </div>
                                <div className="mt-4 text-right">
                                    <Button type="button" onClick={() => setShowTerms(false)}>
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Đã có tài khoản? </span>
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Đăng nhập ngay
                        </Link>
                    </div>

                    <div className="mt-4">
                        <Link
                            to="/"
                            className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Quay về trang chủ</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
