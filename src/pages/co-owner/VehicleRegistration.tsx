import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ContractImport from "./ContractImport";
import axiosClient from "@/api/axiosClient";
import {
  Car,
  User,
  Users,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Mail
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFormik, Form, ErrorMessage, Field, FormikProvider } from "formik";
import * as Yup from "yup";
import CoOwnerForm from "./AddingCoOwners";

interface CoOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  ownership: number;
  idNumber: string;
  address: string;
}

interface VehicleInfo {
  plateNo: string;
  brand: string;
  model: string;
  color: string;
  batteryCapacity: string;
  price: number;
  imageFile: File | null;
}

export default function VehicleRegistration() {
  const [showErrors, setShowErrors] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
    ownership: 0,
  });
  const CREATE_CONTRACT = import.meta.env.VITE_CONTRACT_CREATE;
  const [emailMessage, setEmailMessage] = useState(""); // 👈 state hiển thị thông báo
  const [isFileConfirmed, setIsFileConfirmed] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInfo | null>(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [status, setStatus] = useState<number | null>(null);
  const [fileType, setFileType] = useState("");
  const navigate = useNavigate();
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [vehicles, setVehicles] = useState([]);
  const GET_ALL_VEHICLES = import.meta.env.VITE_VEHICLES;
  const { toast } = useToast();
  const handleFileImport = (data) => {
    const { file, uploadType } = data;
    setContractFile(file);
    setFileType(uploadType); // PDF / IMAGE
  };
  const handleConfirmFile = () => {
    if (!contractFile) return;

    // fileType là "pdf" hoặc "image" đã được set trong handleFileImport
    if (fileType !== "PDF" && fileType !== "IMAGE") {
      toast({
        title: "File không hợp lệ",
        description: "Chỉ hỗ trợ PDF hoặc hình ảnh",
        variant: "destructive",
      });
      return;
    }
    setIsFileConfirmed(true);
    setStep(1); // qua bước nhập thông tin xe
  };
  const handleNextFromStep3 = () => {
    // 1) kiểm tra mỗi coOwner không vượt main owner
    const invalid = coOwners.find(c => Number(c.ownership) > mainOwnership);
    if (invalid) {
      toast({
        title: "Lỗi",
        description: `Đồng sở hữu ${invalid.name || invalid.email || invalid.id} có tỷ lệ lớn hơn chủ sở hữu chính (${mainOwnership}%).`,
        variant: "destructive"
      });
      return;
    }

    // 2) kiểm tra tổng = 100
    if (totalOwnership !== 100) {
      toast({
        title: "Lỗi",
        description: `Tổng tỷ lệ sở hữu phải bằng 100% (hiện tại ${totalOwnership}%).`,
        variant: "destructive"
      });
      return;
    }

    setStep(4);
  };
  const GET_USERS = import.meta.env.VITE_USERS_GET;
  const fetchUserByEmail = async (email: string) => {
    try {
      const res = await axiosClient.get(GET_USERS, {
        params: { email }
      });
      const user = res.data;
      if (!user) {
        toast({
          title: "Không tìm thấy",
          description: `Không tìm thấy người dùng với email ${email}. Vui lòng nhập thông tin thủ công.`,
          variant: "destructive"
        })
      }

      // toast({
      //   title: "Thành công",
      //   description: `Tự động điền thông tin thành công`,
      //   variant: "success", // hoặc bỏ variant nếu bạn dùng toast mặc định là success
      // });
      return {
        id: user.id,
        name: user.hovaTen,       // map hovaTen -> name
        email: user.email,
        phone: user.phone,
        idNumber: user.cccd,      // map cccd -> idNumber
        address: "",              // API chưa có -> để trống
        ownership: 0             // default
      } as CoOwner;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  const formik = useFormik<CoOwner>({
    initialValues: ownerInfo,
    enableReinitialize: true,
    validationSchema: Yup.object({
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      ownership: Yup.number()
        .required("Vui lòng nhập tỷ lệ sở hữu")
        .min(15, "Tỷ lệ sỡ hữu chính >= 15%")
        .max(85, "Tỷ lệ sỡ hữu chính <= 85%"),
    }),
    onSubmit: (values) => {
      setOwnerInfo(values);
      localStorage.setItem("ownerInfo", JSON.stringify(values));
      setStep(3);
    },
  });
  const mainOwnership = Number(formik.values.ownership) || 0;
  const totalOwnership = mainOwnership + coOwners.reduce((sum, co) => sum + (Number(co.ownership) || 0), 0);
  // useEffect(() => {
  //   let completed = 0;
  //   for (let i = 0; i <= 4; i++) {
  //     if (isStepCompleted(i)) completed++;
  //     else break;
  //   }
  //   console.log("✅ completedSteps:", completed, ownerInfo);
  //   setCompletedSteps(completed);
  // }, [selectedVehicle, coOwners, ownerInfo]);

  useEffect(() => {
    let completed = 0;
    // Bỏ qua bước cuối cùng (Xác nhận) nếu bạn không muốn nó ảnh hưởng đến %
    // Hoặc giữ nguyên 0 <= i <= 4 nếu muốn xác nhận là bước cuối cùng
    for (let i = 0; i <= 4; i++) {
      if (isStepCompleted(i)) completed++;
      else break;
    }
    console.log("✅ completedSteps:", completed, ownerInfo);
    // ✅ Cập nhật chỉ khi số bước hoàn thành thay đổi
    if (completed !== completedSteps) {
      setCompletedSteps(completed);
    }
  }, [selectedVehicle, coOwners, ownerInfo, isFileConfirmed, step]);

  // Helper function to check if a step is completed
  const isStepCompleted = (stepNumber: number) => {
    switch (stepNumber) {
      case 0:
        console.log(stepNumber + ": ", isFileConfirmed);
        return isFileConfirmed; // Nếu bước này không cần điều kiện đặc biệt
      case 1:
        return selectedVehicle !== null; // Xe đã được chọn chưa
      case 2:
        return (
          ownerInfo.email &&
          ownerInfo.ownership > 0 &&
          selectedVehicle !== null
        );
      case 3:
        return (
          coOwners.length > 0 &&
          totalOwnership === 100 &&
          coOwners.every(co => co.email)
        );
      case 4:
        return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3); // Tất cả các bước trước đó phải hoàn thành
      default:
        return false;
    }
  };

  // Calculate progress based on completed steps
  const getProgress = () => {
    console.log("Progress:", (completedSteps / 5) * 100);
    return (completedSteps / 5) * 100;
  };

  const getVehiclePrice = () => {
    const vehicle = typeof selectedVehicle === "object"
      ? selectedVehicle
      : vehicles.find(v => v.id === selectedVehicle);

    return vehicle
      ? parseInt(vehicle.price.replace(/[^0-9]/g, ''))
      : 0;
  };

  const getOwnershipAmount = (percentage: number) => {
    const price = getVehiclePrice();
    return Math.round(price * (percentage / 100));
  };
  const addCoOwner = () => {
    // Maximum 5 people total (including primary owner)
    if (coOwners.length >= 4) {
      toast({
        title: "Giới hạn số người",
        description: "Tối đa 5 người đồng sở hữu (bao gồm chủ sở hữu chính)",
        variant: "destructive"
      });
      return;
    }

    if (totalOwnership >= 100) {
      toast({
        title: "Lỗi",
        description: "Tổng tỷ lệ sở hữu không được vượt quá 100%",
        variant: "destructive"
      });
      return;
    }
    const remaining = 100 - mainOwnership - coOwners.reduce((s, c) => s + (Number(c.ownership) || 0), 0);
    const maxAllowedForNew = Math.min(mainOwnership, remaining);

    if (maxAllowedForNew < 15) {
      toast({
        title: "Không thể thêm",
        description: "Không đủ phần trăm để thêm đồng sở hữu tối thiểu 15%",
        variant: "destructive"
      });
      return;
    }
    const newCoOwner: CoOwner = {
      id: Date.now(),
      name: "",
      email: "",
      phone: "",
      ownership: 15,
      idNumber: "",
      address: "",
    };
    setCoOwners([...coOwners, newCoOwner]);
  };

  const updateCoOwner = async (
    id: number,
    field: keyof CoOwner,
    value: string | number
  ) => {
    // ✅ Nếu đang nhập email → tìm user trong DB
    if (field === "email") {
      const emailValue = value as string;
      try {
        const user = await fetchUserByEmail(emailValue);
        if (user) {
          setCoOwners((prev) => {
            const updated = prev.map((co) =>
              co.id === id
                ? {
                  ...co,
                  id: user.id,   // ✅ Gán id thật từ DB
                  name: user.name ?? co.name,
                  phone: user.phone ?? co.phone,
                  idNumber: user.idNumber ?? co.idNumber,
                  address: user.address ?? co.address,
                  email: emailValue,
                }
                : co
            );
            localStorage.setItem("coOwners", JSON.stringify(updated));
            return updated;
          });
          return;
        }
      } catch (error) {
        console.error("Không tìm thấy user theo email:", error);
      }
    }

    // ✅ Xử lý ownership (giữ nguyên như bạn đang có)
    if (field === "ownership") {
      const newVal = Number(value);
      if (isNaN(newVal) || newVal < 15 || newVal > mainOwnership) return;

      const sumWithoutThis = coOwners.reduce(
        (s, c) => (c.id === id ? s : s + (Number(c.ownership) || 0)),
        0
      );

      if (mainOwnership + sumWithoutThis + newVal > 100) return;

      setCoOwners((prev) => {
        const updated = prev.map((co) =>
          co.id === id ? { ...co, [field]: newVal } : co
        );
        localStorage.setItem("coOwners", JSON.stringify(updated));
        return updated;
      });
    } else {
      // ✅ Các field khác giữ logic cũ
      setCoOwners((prev) =>
        prev.map((co) => (co.id === id ? { ...co, [field]: value } : co))
      );
    }
  };
  const VehicleSchema = Yup.object().shape({
    plateNo: Yup.string()
      .required("Vui lòng nhập biển số xe")
      .matches(
        /^[0-9]{2}[A-Z]{1,2}-\d{3,4}\.\d{2}$/,
        "Biển số xe không hợp lệ (ví dụ: 51H-123.45)"
      ),
    brand: Yup.string().required("Vui lòng nhập hãng xe").matches(/^[a-zA-Z\s]+$/, "Hãng xe chỉ có thể chứa chữ"),
    model: Yup.string().required("Vui lòng nhập mẫu xe"),
    color: Yup.string().required("Vui lòng nhập màu xe"),
    batteryCapacity: Yup.number()
      .typeError("Dung lượng pin phải là số")
      .positive("Dung lượng pin phải lớn hơn 0")
      .max(200, "Dung lượng pin không vượt quá 200 kWh")
      .required("Vui lòng nhập dung lượng pin"),
    price: Yup.string()
      .required("Vui lòng nhập giá xe")
      .matches(/^\d{1,3}(,\d{3})*(\.\d+)?$|^\d+$/, "Giá phải là số hợp lệ"),
    imageFile: Yup.mixed().required("Cần có ảnh xe")
  });
  const vehicleFormik = useFormik({
    initialValues: {
      plateNo: "",
      brand: "",
      model: "",
      color: "",
      batteryCapacity: "",
      price: 0,
      imageUrl: null,
      imageFile: null,
    },
    validationSchema: VehicleSchema,
    onSubmit: async (values) => {
      // Validate toàn bộ form trước khi tiếp tục
      const errors = await vehicleFormik.validateForm();
      vehicleFormik.setErrors(errors);
      // Kiểm tra lỗi nếu có
      if (Object.keys(errors).length > 0) {
        alert("Vui lòng sửa các lỗi trước khi tiếp tục.");
        return;
      }
      // Kiểm tra biển số xe có bị trùng trong hệ thống không
      const isDuplicate = vehicles.some(
        (vehicle) => vehicle.plateNo.toUpperCase() === values.plateNo.trim().toUpperCase()
      );
      if (isDuplicate) {
        toast({
          title: "Lỗi",
          description: "Biển số xe đã tồn tại trong hệ thống!",
          variant: "destructive",
        })
        return;
      }

      console.log("Dữ liệu: ", values);
      localStorage.setItem("selectedVehicle", JSON.stringify(values));
      setSelectedVehicle(values); // lưu xe đã nhập
      setStep(2); // sang bước kế tiếp
    },
  });
  useEffect(() => {
    const saved = localStorage.getItem("coOwners");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // chỉ load nếu có ít nhất 1 đồng sở hữu có name hoặc email hợp lệ
        const valid = Array.isArray(parsed) && parsed.some(co => co.name || co.email);
        if (valid) setCoOwners(parsed);
        else localStorage.removeItem("coOwners"); // dữ liệu rỗng → xóa luôn
      } catch {
        localStorage.removeItem("coOwners");
      }
    }
  }, []);
  useEffect(() => {
    // khi người dùng chọn xe mới → reset đồng sở hữu
    setCoOwners([]);
    localStorage.removeItem("coOwners");
  }, [selectedVehicle]);
  useEffect(() => {
    const getVehicles = async () => {
      try {
        const res = await axiosClient.get(GET_ALL_VEHICLES);
        console.log("Vehicles fetched:", res.data);
        setVehicles(res.data); // res.data là List<> từ BE
      } catch (err) {
        console.error("Không thể lấy Backend:", err);
      }
    };

    getVehicles();
  }, []);
  const removeCoOwner = (id: number) => {
    const updated = coOwners.filter(co => co.id !== id);
    setCoOwners(updated);
    if (updated.length === 0) localStorage.removeItem("coOwners");
    else localStorage.setItem("coOwners", JSON.stringify(updated));
  };
  const handleSubmit = async () => {
    const formData = new FormData();
    var documentUrl = `${window.location.origin}/contract/preview/`;
    // ⚙️ Gửi đúng tên field giống backend
    formData.append("documentUrl", documentUrl); // nếu có link hợp đồng thì truyền vào
    formData.append("contractType", "CO_OWNER"); // ví dụ: "CO_OWNER" hoặc "LEASE"
    formData.append("plateNo", selectedVehicle.plateNo);
    formData.append("brand", selectedVehicle.brand);
    formData.append("model", selectedVehicle.model);
    formData.append("color", selectedVehicle.color);
    formData.append("batteryCapacity", selectedVehicle.batteryCapacity);
    formData.append("price", String(selectedVehicle.price));
    formData.append("vehicleImage", selectedVehicle.imageFile);
    // ⚙️ userId là danh sách => cần append từng phần tử
    coOwners.forEach(owner => {
      formData.append("idUsers", owner.id.toString());
    });

    formData.append("idUsers", ownerInfo.id.toString());


    // ⚙️ File upload
    if (contractFile) formData.append("imageContract", contractFile);
    // if (selectedVehicle.imageFile) formData.append("vehicleImage", selectedVehicle.imageFile);

    try {
      await axiosClient.post(CREATE_CONTRACT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Gửi hợp đồng thành công",
        description: "Vui lòng đợi nhân viên xác nhận"
      });

      navigate("/co-owner/dashboard");
    } catch (err) {
      toast({
        title: "Gửi thất bại",
        description: "Vui lòng thử lại sau",
        variant: "destructive"
      });
    }
  };
  if (isSubmitted) {
    localStorage.setItem("ownerInfo", JSON.stringify(ownerInfo));
    localStorage.setItem("coOwners", JSON.stringify(coOwners));
    localStorage.setItem("selectedVehicle", JSON.stringify(selectedVehicle));
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-glow border-0 text-center">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-6">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Đăng ký hợp đồng thành công!
              </h2>
              <p className="text-muted-foreground text-lg">
                Hợp đồng của bạn đã được gửi thành công.
                Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.
              </p>
            </div>

            {/* 🔽 Thêm khối hiển thị PDF vào đây */}
            <div className="bg-accent/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Thông tin đã được gửi qua email</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Hợp đồng và các thông tin chi tiết đã được gửi đến địa chỉ email của bạn.
                Vui lòng kiểm tra hộp thư để xem chi tiết.
              </p>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">📄 Xem hợp đồng:</h3>

                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Xem hợp đồng đồng sở hữu (PDF)
                  </a>
                ) : (
                  <p>Đang tạo hợp đồng PDF...</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/co-owner/dashboard")}
                className="bg-gradient-primary hover:shadow-glow"
              >
                Về bảng điều khiển
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setStep(1);
                  setSelectedVehicle(null);
                  formik.resetForm({
                    values: {
                      id: 0,
                      name: "",
                      email: "",
                      phone: "",
                      idNumber: "",
                      address: "",
                      ownership: 50,
                    },
                  });
                  setCoOwners([]);
                }}
              >
                Đăng ký xe khác
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* 🔹 Hiển thị thanh header và tiến trình cho tất cả các bước (0–4) */}
      <header className="bg-gradient-primary text-white p-4 shadow-glow">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/co-owner/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Đăng ký xe điện</h1>
              <p className="text-sm opacity-90">
                Quy trình đăng ký đồng sở hữu xe điện
              </p>
            </div>
          </div>
          <Car className="h-8 w-8" />
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* 🔹 Tiến trình (có thêm Bước 0) */}
        <Card className="mb-6 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Bước {step + 1} / 5</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(getProgress())}% hoàn thành
              </span>
            </div>

            <Progress value={getProgress()} className="mb-4" />

            <div className="grid grid-cols-5 text-center text-xs">
              {["Nhập hợp đồng", "Nhập thông tin xe", "Chủ sở hữu chính", "Các Đồng sở hữu", "Xác nhận"].map(
                (label, index) => (
                  <span
                    key={index}
                    className={
                      isStepCompleted(index)
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* 🔹 Bước 0: Import hợp đồng */}
        {step === 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5" />
                <span>Nhập hợp đồng từ file</span>
              </CardTitle>
              <CardDescription>
                Tải lên hợp đồng đồng sở hữu xe (PDF hoặc ảnh).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContractImport
                // onFinish={(data) => {
                //   setContractFile(data.file);
                //   toast({
                //     title: "File hợp đồng đã được tải",
                //     description: `Loại file: ${data.uploadType}`,
                //   });
                // }}
                onFinish={handleFileImport}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleConfirmFile}
                  variant="outline"
                  disabled={!contractFile}
                >
                  Tiếp tục quy trình
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Step 1: Vehicle Selection */}
      {step === 1 && (
        <Card
          className="shadow-lg border border-gray-100 rounded-xl bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
              <Car className="h-5 w-5 text-primary" />
              <span>Nhập thông tin xe</span>
            </CardTitle>
            <CardDescription className="text-gray-500">
              Điền đầy đủ thông tin về xe bạn muốn tham gia đồng sở hữu
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowErrors(true);
                vehicleFormik.handleSubmit(e);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    id: "plateNo",
                    label: "Biển số xe(VD: 51H-123.45)",
                    placeholder: "Nhập biển số xe"
                  },
                  { id: "brand", label: "Hãng xe(Vd: Vinfast)", placeholder: "Nhập hãng xe" },
                  { id: "model", label: "Mẫu xe(vd: vf8)", placeholder: "Nhập mẫu xe" },
                  { id: "color", label: "Màu xe", placeholder: "Chọn hoặc nhập mã màu" },
                  {
                    id: "batteryCapacity",
                    label: "Dung tích pin (kWh)",
                    placeholder: "Nhập dung tích pin"
                  },
                  { id: "price", label: "Giá xe (VNĐ)", placeholder: "Nhập giá xe" },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <Label htmlFor={field.id} className="font-medium text-gray-700 mb-1">
                      {field.label}
                    </Label>

                    {field.id === "plateNo" ? (
                      <>
                        <Input
                          id="plateNo"
                          name="plateNo"
                          value={vehicleFormik.values.plateNo}
                          onChange={(e) => {
                            const newValue = e.target.value.trim().toUpperCase();
                            vehicleFormik.setFieldValue("plateNo", newValue);

                            // Khi người dùng đang gõ, không set lỗi mới, chỉ xóa lỗi cũ nếu có
                            if (vehicleFormik.errors.plateNo) {
                              vehicleFormik.setFieldError("plateNo", "");
                            }
                          }}
                          onBlur={(e) => {
                            const plate = e.target.value.trim().toUpperCase();
                            if (!plate) return;

                            // Kiểm tra trùng lặp với danh sách vehicles
                            const isDuplicate = vehicles.some(
                              (v) => v.plateNo.toUpperCase() === plate
                            );

                            // ✅ Chỉ set lỗi nếu chưa có lỗi hiện tại
                            if (isDuplicate && !vehicleFormik.errors.plateNo) {
                              vehicleFormik.setFieldError(
                                "plateNo",
                                "Biển số xe đã tồn tại trong hệ thống!"
                              );
                            }

                            // ✅ Nếu không trùng, xóa lỗi (nếu có)
                            if (!isDuplicate && vehicleFormik.errors.plateNo) {
                              vehicleFormik.setFieldError("plateNo", "");
                            }
                          }}
                          placeholder="Nhập biển số xe"
                          className={`border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all rounded-md ${vehicleFormik.errors.plateNo ? "border-red-500" : ""
                            }`}
                        />

                        {/* Hiển thị lỗi duy nhất */}
                        {/* {vehicleFormik.errors.plateNo && (
                          <p className="text-red-500 text-sm mt-1">
                            {vehicleFormik.errors.plateNo}
                          </p>
                        )} */}
                      </>
                    ) : field.id === "color" ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id={field.id}
                          name={field.id}
                          value={vehicleFormik.values.color || "#000000"}
                          onChange={vehicleFormik.handleChange}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <Input
                          id={`${field.id}-text`}
                          name={field.id}
                          value={vehicleFormik.values.color}
                          onChange={vehicleFormik.handleChange}
                          placeholder={field.placeholder}
                          className="flex-1 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 rounded-md"
                        />
                      </div>
                    ) : field.id === "price" ? (
                      <Input
                        id={field.id}
                        name={field.id}
                        value={vehicleFormik.values.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/,/g, "");
                          if (!isNaN(Number(val))) vehicleFormik.setFieldValue("price", val);
                        }}
                        placeholder={field.placeholder}
                        className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all rounded-md"
                      />
                    ) : (
                      <Input
                        id={field.id}
                        name={field.id}
                        value={vehicleFormik.values[field.id]}
                        onChange={vehicleFormik.handleChange}
                        placeholder={field.placeholder}
                        className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all rounded-md"
                      />
                    )}

                    {showErrors && vehicleFormik.errors[field.id] && (
                      <p className="text-red-500 text-sm mt-1">{vehicleFormik.errors[field.id]}</p>
                    )}
                  </div>
                ))}
                <div className="flex flex-col">
                  <Label htmlFor="vehicleImage" className="font-medium text-gray-700 mb-1">
                    Ảnh xe
                  </Label>

                  <input
                    type="file"
                    id="vehicleImage"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // lưu file vào Formik
                        vehicleFormik.setFieldValue("imageFile", file);
                        // tạo URL tạm để preview
                        vehicleFormik.setFieldValue("imageUrl", URL.createObjectURL(file));
                      }
                    }}
                    className="border rounded-md p-2"
                  />

                  {vehicleFormik.values.imageUrl && (
                    <img
                      src={vehicleFormik.values.imageUrl}
                      alt="Preview xe"
                      className="mt-2 w-32 h-32 object-cover rounded-md border"
                    />
                  )}
                  {/* {showErrors && vehicleFormik.errors?.imageFile && (
                    <p className="text-red-500 text-sm mt-1">{vehicleFormik.errors.imageFile}</p>
                  )} */}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-md hover:shadow-md transition-all duration-300"
                >
                  Tiếp tục
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {/* Step 2: Owner Information */}
      {step === 2 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Thông tin chủ sở hữu chính</span>
            </CardTitle>
            <CardDescription>
              Người có tỷ lệ sở hữu cao nhất sẽ là chủ sở hữu chính
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FormikProvider value={formik}>
              <Form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* ✅ Chỉ giữ lại Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={async (e) => {
                        formik.handleBlur(e); // 👈 bắt buộc gọi
                        const user = await fetchUserByEmail(e.target.value);
                        if (user) {
                          formik.setValues((prev: any) => ({
                            ...prev,
                            id: user.id || prev.id,
                            name: user.name || prev.name,
                            phone: user.phone || prev.phone,
                            idNumber: user.idNumber || prev.idNumber,
                            address: user.address || prev.address,
                            email: user.email || prev.email,
                          }));
                          setEmailMessage("✅ Xác thực thông tin thành công");
                          setTimeout(() => {
                            setEmailMessage("");
                          }, 3000);
                        } else {
                          setEmailMessage("");
                        }
                      }}
                    />
                    <ErrorMessage name="email" component="div"
                      className="text-red-500 text-sm" />
                    <div className="text-sm text-green-500 mt-1">{emailMessage}</div>
                    {/* 👈 thêm dòng này */}
                  </div>

                  {/* ✅ Chỉ giữ lại Ownership */}
                  <div className="space-y-2">
                    <Label htmlFor="ownership">Tỷ lệ sở hữu (%) *</Label>
                    <div className="flex items-center space-x-2">
                      <Field
                        as={Input}
                        id="ownership"
                        name="ownership"
                        type="number"
                        min={15}
                        max={85}
                        className="flex-1"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          let num = parseInt(e.target.value || "", 10);
                          if (isNaN(num)) {
                            formik.setFieldValue("ownership", "");
                            return;
                          }
                          if (num > 90) num = 90;
                          formik.setFieldValue("ownership", num);
                        }}
                        onBlur={() => {
                          let num = formik.values.ownership;
                          if (num < 15) num = 15;
                          formik.setFieldValue("ownership", num);
                        }}
                      />
                      {selectedVehicle && (
                        <div className="text-sm text-primary font-medium">
                          {getOwnershipAmount(formik.values.ownership).toLocaleString()} VNĐ
                        </div>
                      )}
                    </div>
                    <ErrorMessage name="ownership" component="div"
                      className="text-red-500 text-sm" />
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:shadow-glow">
                    Tiếp tục
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Form>
            </FormikProvider>
          </CardContent>
        </Card>
      )}


      {/* Step 3: Co-owners */}
      {step === 3 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Thông tin đồng sở hữu</span>
            </CardTitle>
            <CardDescription>
              Thêm thông tin các đồng sở hữu khác (tùy chọn)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Tổng tỷ lệ sở hữu:</span>
                <span className="font-bold text-lg">{totalOwnership}%</span>
              </div>
              <Progress value={totalOwnership} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Tổng tỷ lệ sở hữu phải bằng 100% để hoàn tất đăng ký
              </p>
            </div>

            {coOwners.map((coOwner, index) => (
              <CoOwnerForm
                key={coOwner.id}
                coOwner={coOwner}
                index={index}
                updateCoOwner={updateCoOwner}
                removeCoOwner={removeCoOwner}
                getOwnershipAmount={getOwnershipAmount}
                selectedVehicle={selectedVehicle}
                fetchUserByEmail={fetchUserByEmail}
                mainOwnership={mainOwnership}
                mainOwneremail={formik.values.email}
              />
            ))}

            <Button
              variant="outline"
              onClick={addCoOwner}
              disabled={totalOwnership >= 100}
              className="w-full"
            >
              Thêm đồng sở hữu
            </Button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button
                onClick={handleNextFromStep3}
                className="bg-gradient-primary hover:shadow-glow"
              >
                Tiếp tục
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <>
          {console.log("Co-owners at step 4:", coOwners)}
          < Card className="shadow-elegant" style={{ paddingLeft: "30px", paddingRight: "30px" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5" />
                <span>Xác nhận thông tin đăng ký</span>
              </CardTitle>
              <CardDescription>
                Vui lòng kiểm tra lại thông tin trước khi gửi đăng ký
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Info */}
              <div className="border rounded-lg p-4">
                <h1 className="font-semibold mb-4" style={{ fontSize: "20px" }}>THÔNG TIN XE</h1>

                {selectedVehicle ? (
                  <div className="flex flex-col md:flex-row md:items-start md:space-x-6 text-gray-700">
                    {/* Cột thông tin */}
                    <div className="flex-1 space-y-2">
                      <p><span className="font-medium">Biển số xe:</span> {selectedVehicle.plateNo}</p>
                      <p><span className="font-medium">Hãng xe:</span> {selectedVehicle.brand}</p>
                      <p><span className="font-medium">Mẫu xe:</span> {selectedVehicle.model}</p>
                      <p className="flex items-center space-x-2">
                        <span className="font-medium">Màu xe:</span>
                        <span
                          className="inline-block w-5 h-5 rounded-full border"
                          style={{ backgroundColor: selectedVehicle.color }}
                        ></span>
                        <span>{selectedVehicle.color}</span>
                      </p>
                      <p><span className="font-medium">Dung tích pin:</span> {selectedVehicle.batteryCapacity} kWh</p>
                      <p><span className="font-medium">Giá xe:</span> {Number(selectedVehicle.price).toLocaleString("vi-VN")} VNĐ</p>
                    </div>

                    {/* Cột ảnh */}
                    <div className="mt-4 md:mt-0 flex-shrink-0">
                      {selectedVehicle.imageFile ? (
                        <img
                          src={URL.createObjectURL(selectedVehicle.imageFile)}
                          alt="Ảnh xe"
                          className="rounded-lg border shadow-sm object-cover"
                          style={{
                            maxHeight: "184px",
                            width: "300px",
                            display: "block"
                          }}
                        />
                      ) : (
                        <p className="text-gray-500 italic">Không có ảnh</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Chưa có xe nào được chọn</p>
                )}
              </div>

              {/* Owner Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Chủ sở hữu chính ({ownerInfo.ownership}%)</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Họ tên: {ownerInfo.name}</div>
                  <div>Email: {ownerInfo.email}</div>
                  <div>Điện thoại: {ownerInfo.phone}</div>
                  <div>CCCD: {ownerInfo.idNumber}</div>
                </div>
              </div>

              {/* Co-owners */}
              {coOwners.length > 0 && (
                <div className="border rounded-lg p-4">
                  {coOwners.map((coOwner) => (
                    <div key={coOwner.id} className="mb-2 text-sm">
                      <h3 className="font-semibold mb-2">Đồng sỡ hữu
                        ({coOwner.ownership}%)</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Họ tên:{coOwner.name}</div>
                        <div>Email: {coOwner.email}</div>
                        <div>Điện thoại: {coOwner.phone}</div>
                        <div>CCCD: {coOwner.idNumber}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
                <Button onClick={handleSubmit} className="bg-gradient-primary hover:shadow-glow">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Gửi đăng ký
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}