import { useFormik, FormikProvider, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
interface CoOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  ownership: number;
}

interface Props {
  coOwner: CoOwner;
  index: number;
  updateCoOwner: (id: number, field: keyof CoOwner, value: any) => void;
  removeCoOwner: (id: number) => void;
  getOwnershipAmount: (ownership: number) => number;
  selectedVehicle: {
    plateNo: string;
    brand: string;
    model: string;
    color: string;
    batteryCapacity: string;
    price: number;
  } | null;
  fetchUserByEmail: (email: string) => Promise<Partial<CoOwner> | null>;
  mainOwnership: number;
  mainOwneremail: string; // ✅ thêm dòng này
}


export default function CoOwnerForm({
  coOwner,
  index,
  updateCoOwner,
  removeCoOwner,
  getOwnershipAmount,
  selectedVehicle,
  fetchUserByEmail,
  mainOwnership,
  mainOwneremail
}: Props) {
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState("");
  const formik = useFormik<CoOwner>({
    initialValues: coOwner,
    enableReinitialize: true,
    validationSchema: Yup.object({
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      ownership: Yup.number()
        .required("Vui lòng nhập tỷ lệ sở hữu")
        .min(15, "Tỷ lệ sở hữu tối thiểu là 15%")
        .max(100 - mainOwnership, `Tỷ lệ sở hữu tối đa là ${100 - mainOwnership}%`)
        .test(
          "max-main-owner",
          `Tỷ lệ đồng sở hữu phải nhỏ hơn hoặc bằng ${mainOwnership}%`,
          function (value) {
            return value !== undefined && value <= mainOwnership;
          }
        ),
    }),
    onSubmit: (values) => {
      Object.entries(values).forEach(([field, value]) => {
        updateCoOwner(coOwner.id, field as keyof CoOwner, value);
      });
    },
  });
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Đồng sở hữu #{index + 1}</h4>
        <Button size="sm" variant="outline" onClick={() => removeCoOwner(coOwner.id)}>
          Xóa
        </Button>
      </div>

      <FormikProvider value={formik}>
        <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ✅ Email (giữ lại) */}
          <div className="space-y-2 md:col-span-2">
            <Label>Email *</Label>

            <Field name="email">
              {({ field }: any) => (
                <Input
                  {...field}
                  placeholder="Nhập email"
                  onBlur={async (e) => {
                    field.onBlur(e);
                    const emailValue = e.target.value.trim();
                    if (!emailValue) return;

                    // Xóa thông báo cũ
                    setSuccessMessage("");

                    // ⚠️ Kiểm tra trùng với chủ sở hữu chính
                    if (emailValue.toLowerCase() === mainOwneremail.toLowerCase()) {
                      toast({
                        title: "Email trùng lặp",
                        description: "Địa chỉ email này đã được nhập cho chủ sở hữu chính.",
                        variant: "destructive",
                      });
                      formik.setFieldValue("email", "");
                      updateCoOwner(coOwner.id, "email", "");
                      return;
                    }

                    updateCoOwner(coOwner.id, "email", emailValue);

                    // ✅ Gọi API lấy thông tin user
                    const user = await fetchUserByEmail(emailValue);
                    if (user) {
                      formik.setValues({
                        ...formik.values,
                        ...user,
                        email: user.email ?? formik.values.email,
                      });
                      updateCoOwner(coOwner.id, "name", user.name);
                      updateCoOwner(coOwner.id, "phone", user.phone);
                      updateCoOwner(coOwner.id, "idNumber", user.idNumber);
                      // ✅ Hiển thị thông báo thành công
                      setSuccessMessage("Xác thực tài khoản thành công🎉");
                      setTimeout(() => {
                        setSuccessMessage("");
                      }, 3000);
                    }
                  }}
                />
              )}
            </Field>

            {/* ❌ Hiển thị lỗi nếu có */}
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />

            {/* ✅ Hiển thị thông báo thành công */}
            {successMessage && (
              <div className="text-green-600 text-sm font-medium mt-1">
                {successMessage}
              </div>
            )}
          </div>
          {/* ✅ Ownership (giữ lại) */}
          <div className="space-y-2 md:col-span-2">
            <Label>Tỷ lệ sở hữu (%) *</Label>
            <div className="flex items-center space-x-2">
              <Field name="ownership">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    min={15}
                    max={85}
                    className="flex-1"
                    onBlur={(e) => {
                      updateCoOwner(coOwner.id, "ownership", Number(e.target.value));
                    }}
                  />
                )}
              </Field>
              {selectedVehicle && (
                <div className="text-sm text-primary font-medium">
                  {getOwnershipAmount(formik.values.ownership).toLocaleString()} VNĐ
                </div>
              )}
            </div>
            <ErrorMessage name="ownership" component="div" className="text-red-500 text-sm" />
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
}