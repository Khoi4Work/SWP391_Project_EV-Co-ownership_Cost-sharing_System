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
import { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { waitForCvReady } from "@/lib/opencvHelpers";
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
    src.delete(); gray.delete(); blurred.delete(); thresh.delete(); inverted.delete(); out.delete();

    return outCanvas.toDataURL("image/png");
}

export default function Register() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showTerms, setShowTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState<{ [key: string]: string }>({});
    const [ocrLoadingCccd, setOcrLoadingCccd] = useState(false);
    const [ocrLoadingGplx, setOcrLoadingGplx] = useState(false);
    const errorTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const createUser = async (userData: {
        hovaTen: string;
        email: string;
        phone: string;
        cccd: string;
        gplx: string;
        password: string;
    }) => {
        try {
            // Thay đổi URL này thành endpoint backend thực tế của bạn
            const response = await axios.post("http://localhost:8080/Users/register", userData);
            console.log("Kết quả backend trả về:", response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    };
    // Hàm show lỗi tạm thời
    const showError = (field: string, message: string) => {
        setErrorMessage((prev) => ({ ...prev, [field]: message }));
        if (errorTimeouts.current[field]) clearTimeout(errorTimeouts.current[field]);
        errorTimeouts.current[field] = setTimeout(() => {
            setErrorMessage((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            delete errorTimeouts.current[field];
        }, 1000);
    };

    useEffect(() => {
        return () => Object.values(errorTimeouts.current).forEach(clearTimeout);
    }, []);

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
                setFieldValue("gplx", match[0].toUpperCase()); // in hoa cho chuẩn
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
            .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp"),
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
                        validateOnChange={true}
                        validateOnBlur={false}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            validationSchema
                                .validate(values, { abortEarly: false })
                                .then(async () => {
                                    const userObject = {
                                        role_id: { role_id: 1 }, // giữ giống đoạn mới
                                        hovaTen: values.hovaTen,
                                        email: values.email,
                                        phone: values.phone,
                                        cccd: values.cccd,
                                        gplx: values.gplx,
                                        password: values.password,
                                    };
                                    try {
                                        // gọi backend tạo user
                                        await createUser(userObject);

                                        navigate("/verify-otp", { state: userObject });
                                        toast({
                                            title: "Đăng ký thành công",
                                            description: "Vui lòng xác thực tài khoản bằng mã OTP",
                                        });
                                    } catch (err: any) {
                                        toast({
                                            title: "Lỗi đăng ký",
                                            description: err?.response?.data?.message || "Đã có lỗi xảy ra",
                                            variant: "destructive",
                                        });
                                    }
                                    setSubmitting(false);
                                })
                                .catch((err) => {
                                    if (err.inner) {
                                        const formErrors: { [key: string]: string } = {};
                                        err.inner.forEach((e: any) => {
                                            formErrors[e.path] = e.message;
                                            showError(e.path, e.message);
                                        });
                                        setErrors(formErrors);
                                    }
                                    setSubmitting(false);
                                });
                        }}
                        validate={(values) => {
                            try {
                                validationSchema.validateSync(values, { abortEarly: false });
                                setErrorMessage({});
                                return {};
                            } catch (err: any) {
                                const errors: { [key: string]: string } = {};
                                if (err.inner) {
                                    err.inner.forEach((e: any) => {
                                        errors[e.path] = e.message;
                                        showError(e.path, e.message);
                                    });
                                }
                                return errors;
                            }
                        }}
                    >
                        {({ isSubmitting, setFieldValue }) => (
                            <Form className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hovaTen">Họ và tên*</Label>
                                    <Field
                                        as={Input}
                                        id="hovaTen"
                                        name="hovaTen"
                                        type="text"
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                    <div className="text-red-500 text-xs">
                                        {errorMessage.hovaTen || <ErrorMessage name="hovaTen" />}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email*</Label>
                                    <Field
                                        as={Input}
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Nhập email của bạn"
                                    />
                                    <div className="text-red-500 text-xs">
                                        {errorMessage.email || <ErrorMessage name="email" />}
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <Label htmlFor="cccd">CCCD*</Label>
                                    <div className="relative">
                                        <Field as={Input} id="cccd" name="cccd" type="text" placeholder="Chỉ upload ảnh để điền CCCD" />
                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                                            {ocrLoadingCccd ? "⏳" : "📷"}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadCccd(e, setFieldValue)} />
                                        </label>
                                    </div>
                                    <div className="text-red-500 text-xs">{errorMessage.cccd || <ErrorMessage name="cccd" />}</div>
                                </div>
                                <div className="space-y-2 relative">
                                    <Label htmlFor="gplx">Giấy phép lái xe*</Label>
                                    <div className="relative">
                                        <Field as={Input} id="gplx" name="gplx" type="text" placeholder="Chỉ upload ảnh để điền GPLX" />
                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                                            {ocrLoadingGplx ? "⏳" : "📷"}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadGplx(e, setFieldValue)} />
                                        </label>
                                    </div>
                                    <div className="text-red-500 text-xs">{errorMessage.gplx || <ErrorMessage name="gplx" />}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại*</Label>
                                    <Field
                                        as={Input}
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="Nhập số điện thoại"
                                    />
                                    <div className="text-red-500 text-xs">
                                        {errorMessage.phone || <ErrorMessage name="phone" />}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu*</Label>
                                    <Field
                                        as={Input}
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <div className="text-red-500 text-xs">
                                        {errorMessage.password || <ErrorMessage name="password" />}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu*</Label>
                                    <Field
                                        as={Input}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                    <div className="text-red-500 text-xs">
                                        {errorMessage.confirmPassword || <ErrorMessage name="confirmPassword" />}
                                    </div>
                                </div>
                                <div style={{ height: 5 }} />
                                <div className="flex items-center space-x-2">
                                    <Field
                                        type="checkbox"
                                        id="acceptTerms"
                                        name="acceptTerms"
                                    />
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
                                <div className="text-red-500 text-xs">
                                    {errorMessage.acceptTerms || <ErrorMessage name="acceptTerms" />}
                                </div>
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
                                <div className="max-h-80 overflow-y-auto text-sm text-gray-700 space-y-2">
                                    <p>
                                        <strong>1. Đăng ký tài khoản:</strong> Bạn phải cung cấp thông tin chính xác và
                                        chịu trách nhiệm về thông tin đã đăng ký.
                                    </p>
                                    <p>
                                        <strong>2. Bảo mật:</strong> Bạn có trách nhiệm bảo mật thông tin tài khoản và
                                        không chia sẻ với người khác.
                                    </p>
                                    <p>
                                        <strong>3. Quyền sử dụng:</strong> Tài khoản chỉ được sử dụng cho mục đích hợp
                                        pháp liên quan đến dịch vụ EcoShare.
                                    </p>
                                    <p>
                                        <strong>4. Quyền thay đổi:</strong> Chúng tôi có quyền thay đổi, cập nhật điều
                                        khoản bất kỳ lúc nào mà không cần báo trước.
                                    </p>
                                    <p>
                                        <strong>5. Giới hạn trách nhiệm:</strong> Chúng tôi không chịu trách nhiệm với
                                        các thiệt hại phát sinh do việc sử dụng sai mục đích hoặc vi phạm điều khoản.
                                    </p>
                                    <p>
                                        <strong>6. Liên hệ:</strong> Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ
                                        của EcoShare.
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