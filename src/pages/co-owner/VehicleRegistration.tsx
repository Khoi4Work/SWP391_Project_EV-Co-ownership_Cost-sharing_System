import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useFormik, Formik, Form, ErrorMessage, Field, FormikProvider } from "formik";
import * as Yup from "yup";
import CoOwnerForm from "./AddingCoOwners";
interface CoOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownership: number;
  idNumber: string;
  address: string;
}
import { useEffect } from "react";
export default function VehicleRegistration() {
  const ownerSchema = Yup.object({
    name: Yup.string().required("Tên không được để trống"),
    email: Yup.string().email("Email không hợp lệ").required("Email bắt buộc"),
    phone: Yup.string().required("Số điện thoại bắt buộc"),
  });
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const fetchUserByEmail = async (email: string) => {
    try {
      // const res = await fetch(`https://68ca27d4430c4476c34861d4.mockapi.io/user?email=${encodeURIComponent(email)}`);
        const res = await axiosClient.get(`/vehicle/`);

      const data = res.data;
      const user = Array.isArray(data) ? data[0] : data;
      if (!user) return null;
      return {
        id: user.id,
        name: user.hovaTen,       // map hovaTen -> name
        email: user.email,
        phone: user.phone,
        idNumber: user.cccd,      // map cccd -> idNumber
        address: "",              // API chưa có -> để trống
        ownership: 50             // default
      } as CoOwner;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  const formik = useFormik<CoOwner>({
    initialValues: {
      id: "",
      name: "",
      email: "",
      phone: "",
      idNumber: "",
      address: "",
      ownership: 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Vui lòng nhập họ và tên"),
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      phone: Yup.string()
        .required("Vui lòng nhập số điện thoại")
        .matches(/^0\d{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0"),
      idNumber: Yup.string()
        .required("Vui lòng nhập CCCD/CMND")
        .matches(/^0\d{11}$/, "CCCD phải có 12 số và bắt đầu bằng 0"),
      address: Yup.string().required("Vui lòng nhập địa chỉ"),
      ownership: Yup.number()
        .required("Vui lòng nhập tỷ lệ sở hữu")
        .min(15, "Tỷ lệ sỡ hữu chính >= 15%")
        .max(90, "Tỷ lệ sỡ hữu chính <= 90%"),
    }),
    onSubmit: (values) => {
      setStep(3);
    },
  });
  const ownerInfo = formik.values;
  const vehicles = [
    {
      id: "vf8",
      name: "VinFast VF8",
      price: "1,200,000,000 VNĐ",
      image: "/Vinfast_VF8.jpg",
      specs: ["87.7 kWh", "420 km", "Tự lái cấp 2"]
    },
    {
      id: "tesla-y",
      name: "Tesla Model Y",
      price: "1,800,000,000 VNĐ",
      image: "/TeslaModelY.jpg",
      specs: ["75 kWh", "525 km", "Autopilot"]
    },
    {
      id: "kona",
      name: "Hyundai Kona Electric",
      price: "800,000,000 VNĐ",
      image: "/HuyndaiKonaElectric.jpg",
      specs: ["64 kWh", "380 km", "SmartSense"]
    }
  ];
  const mainOwnership = Number(formik.values.ownership) || 0;
  const totalOwnership = mainOwnership + coOwners.reduce((sum, co) => sum + (Number(co.ownership) || 0), 0);

  // Helper function to check if a step is completed
  const isStepCompleted = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return selectedVehicle !== "";
      case 2: return ownerInfo.name && ownerInfo.email && ownerInfo.phone && ownerInfo.idNumber && ownerInfo.address;
      case 3:
        return (
          coOwners.length > 0 &&
          totalOwnership === 100 &&
          coOwners.every(co => co.name && co.email && co.idNumber)
        );
      case 4: return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3);
      default: return false;
    }
  };

  // Calculate progress based on completed steps
  const getProgress = () => {
    let completed = 0;
    for (let i = 1; i <= 4; i++) {
      if (isStepCompleted(i)) completed++;
      else break;
    }
    return (completed / 4) * 100;
  };

  const getVehiclePrice = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    return vehicle ? parseInt(vehicle.price.replace(/[^0-9]/g, '')) : 0;
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
      toast({ title: "Không thể thêm", description: "Không đủ phần trăm để thêm đồng sở hữu tối thiểu 15%", variant: "destructive" });
      return;
    }
    const newCoOwner: CoOwner = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      ownership: 15,
      idNumber: "",
      address: "",
    };
    setCoOwners([...coOwners, newCoOwner]);
  };

  const updateCoOwner = (id: string, field: keyof CoOwner, value: string | number) => {
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
      setCoOwners((prev) =>
        prev.map((co) => (co.id === id ? { ...co, [field]: value } : co))
      );
    }
  };

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
  const removeCoOwner = (id: string) => {
    const updated = coOwners.filter(co => co.id !== id);
    setCoOwners(updated);
    if (updated.length === 0) localStorage.removeItem("coOwners");
    else localStorage.setItem("coOwners", JSON.stringify(updated));
  };

  const handleSubmit = () => {
    if (totalOwnership !== 100) {
      toast({
        title: "Lỗi",
        description: "Tổng tỷ lệ sở hữu phải bằng 100%",
        variant: "destructive"
      });
      return;
    }
    const invalid = coOwners.find(co => Number(co.ownership) > mainOwnership);
    if (invalid) {
      toast({ title: "Lỗi", description: `Đồng sở hữu ${invalid.name || invalid.email} có tỷ lệ lớn hơn chủ sở hữu chính`, variant: "destructive" });
      return;
    }
    setIsSubmitted(true);
    toast({
      title: "Đăng ký thành công",
      description: "Đơn đăng ký xe đã được gửi thành công!",
    });
  };

  if (isSubmitted) {
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
                Đăng ký xe thành công!
              </h2>
              <p className="text-muted-foreground text-lg">
                Đơn đăng ký xe điện của bạn đã được gửi thành công.
                Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Thông tin đã được gửi qua email</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Hợp đồng và các thông tin chi tiết đã được gửi đến địa chỉ email của bạn.
                Vui lòng kiểm tra hộp thư để xem chi tiết.
              </p>
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
                  setSelectedVehicle("");
                  formik.resetForm({
                    values: {
                      id: "",
                      name: "",
                      email: "",
                      phone: "",
                      idNumber: "",
                      address: "",
                      ownership: 50
                    }
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
      {/* Header */}
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
              <p className="text-sm opacity-90">Quy trình đăng ký đồng sở hữu xe điện</p>
            </div>
          </div>
          <Car className="h-8 w-8" />
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Progress */}
        <Card className="mb-6 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Bước {step} / 4</span>
              <span className="text-sm text-muted-foreground">{Math.round(getProgress())}% hoàn thành</span>
            </div>
            <Progress value={getProgress()} className="mb-4" />
            <div className="flex justify-between text-xs">
              <span className={isStepCompleted(1) ? "text-primary font-medium" : "text-muted-foreground"}>
                Chọn xe
              </span>
              <span className={isStepCompleted(2) ? "text-primary font-medium" : "text-muted-foreground"}>
                Thông tin chủ sở hữu
              </span>
              <span className={isStepCompleted(3) ? "text-primary font-medium" : "text-muted-foreground"}>
                Đồng sở hữu
              </span>
              <span className={isStepCompleted(4) ? "text-primary font-medium" : "text-muted-foreground"}>
                Xác nhận
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Vehicle Selection */}
        {step === 1 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Chọn xe điện</span>
              </CardTitle>
              <CardDescription>
                Chọn mẫu xe điện bạn muốn tham gia đồng sở hữu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-elegant ${selectedVehicle === vehicle.id
                      ? "border-primary bg-primary/5 shadow-elegant"
                      : "border-border"
                      }`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h3 className="font-semibold mb-2">{vehicle.name}</h3>
                    <p className="text-lg font-bold text-primary mb-3">{vehicle.price}</p>
                    <div className="space-y-1">
                      {vehicle.specs.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedVehicle}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  Tiếp tục
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
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
              {/* Owner type (dùng chung với ownerInfo state) */}
              {/* interface Owner { name: string; email: string; phone: string; idNumber: string; address: string; ownership: number } */}

              <FormikProvider value={formik}>
                <Form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Field name="name">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            id="name"
                            placeholder="Nhập họ và tên đầy đủ"
                          />
                        )}
                      </Field>
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Field name="email">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="Nhập email"
                            onBlur={async (e) => {
                              field.onBlur(e); // giữ Formik sync
                              const user = await fetchUserByEmail(e.target.value);
                              if (user) {
                                formik.setValues(prev => ({
                                  ...prev, // giữ nguyên tất cả giá trị hiện tại
                                  id: user.id || prev.id,
                                  name: user.name || prev.name,
                                  phone: user.phone || prev.phone,
                                  idNumber: user.idNumber || prev.idNumber,
                                  address: user.address || prev.address,
                                  email: user.email || prev.email, // optional, email cũng có thể giữ nguyên
                                }));
                              }
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Field name="phone">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            id="phone"
                            placeholder="Nhập số điện thoại"
                          />
                        )}
                      </Field>
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">CCCD/CMND *</Label>
                      <Field name="idNumber">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            id="idNumber"
                            placeholder="Nhập số CCCD/CMND"
                          />
                        )}
                      </Field>
                      <ErrorMessage name="idNumber" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownership">Tỷ lệ sở hữu (%) *</Label>
                      <div className="flex items-center space-x-2">
                        <Field
                          as={Input}
                          id="ownership"
                          name="ownership"
                          type="number"
                          min={15}
                          max={90}
                          className="flex-1"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let num = parseInt(e.target.value || "", 10);
                            if (isNaN(num)) {
                              formik.setFieldValue("ownership", ""); // giữ trống khi xóa
                              return;
                            }

                            // Giới hạn tối đa 90
                            if (num > 90) num = 90;
                            formik.setFieldValue("ownership", num);
                          }}
                          onBlur={() => {
                            let num = formik.values.ownership;
                            if (num < 15) num = 15; // giới hạn tối thiểu
                            formik.setFieldValue("ownership", num);
                          }}
                        />
                        {selectedVehicle && (
                          <div className="text-sm text-primary font-medium">
                            {getOwnershipAmount(formik.values.ownership).toLocaleString()} VNĐ
                          </div>
                        )}
                      </div>
                      <ErrorMessage name="ownership" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Field
                      as={Textarea}
                      id="address"
                      name="address"
                      placeholder="Nhập địa chỉ đầy đủ"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const v = e.target.value;
                        formik.setFieldValue("address", v);
                      }}
                    />
                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
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
                />
              ))}

              <Button
                variant="outline"
                onClick={addCoOwner}
                disabled={totalOwnership >= 100}
                className="w-full"
              >
                + Thêm đồng sở hữu
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
            < Card className="shadow-elegant">
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
                  <h3 className="font-semibold mb-2">Xe đã chọn</h3>
                  <p>{vehicles.find(v => v.id === selectedVehicle)?.name}</p>
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
                    <h3 className="font-semibold mb-2">Đồng sở hữu</h3>
                    {coOwners.map((coOwner) => (
                      <div key={coOwner.id} className="mb-2 text-sm">
                        <strong>{coOwner.name}</strong> ({coOwner.ownership}%) - {coOwner.email}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Gửi đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div >
  );
}