import { useLocation, useNavigate } from "react-router-dom";
import { useFormik, FormikProvider, FieldArray, FormikErrors } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useState, useMemo } from "react";
import axiosClient from "@/api/axiosClient";

interface ServiceDetailForm {
  serviceName: string;
  price: string;
  image: File | null;
}

function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-red-500 text-xs mt-1">{error}</p>;
}

export default function ServiceDetail() {
  const CREATE_DECISION = import.meta.env.VITE_PATCH_CREATE_DECISION_PATH;
  const idGroup = Number(localStorage.getItem("groupId"));
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedService } = location.state || {};
  const [submitting, setSubmitting] = useState(false);

  const initialServiceName = selectedService || "";

  // ✅ Validation schema (đúng field name là "price", không phải "amount")
  const validationSchema = Yup.object({
    services: Yup.array().of(
      Yup.object({
        serviceName: Yup.string().required("Vui lòng nhập tên dịch vụ"),
        price: Yup.string()
          .matches(/^[0-9,]+$/, "Số tiền không hợp lệ")
          .required("Vui lòng nhập số tiền"),
        image: Yup.mixed()
          .required("Bắt buộc nộp ảnh")
          .test(
            "fileType",
            "Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png)",
            (value) => {
              if (!value) return false;
              if (value instanceof File) {
                return ["image/jpeg", "image/png", "image/jpg"].includes(
                  value.type
                );
              }
              return false;
            }
          ),
      })
    ),
  });

  const formik = useFormik({
    initialValues: {
      services: [
        { serviceName: initialServiceName, price: "", image: null } as ServiceDetailForm,
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);

        // 🧩 Tạo FormData (multipart)
        const formData = new FormData();

        // Gửi list decision name
        values.services.forEach((service, index) => {
          formData.append(`decisionNames[${index}]`, service.serviceName);
        });

        // Mô tả tổng
        const totalAmount = values.services.reduce((sum, s) => {
          const num = Number(s.price.replace(/,/g, "")) || 0;
          return sum + num;
        }, 0);

        formData.append("description", `Tổng số tiền phải trả: ${totalAmount.toLocaleString("vi-VN")} VNĐ`);
        formData.append("price", totalAmount.toString());

        // Ảnh đầu tiên làm bill (nếu backend yêu cầu 1 ảnh)
        const firstImage = values.services[0]?.image;
        if (firstImage) {
          formData.append("billImage", firstImage);
        }

        const res = await axiosClient.post(
          `${CREATE_DECISION}${idGroup}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 201 || res.status === 200) {
          toast({
            title: "Đăng ký thành công",
            description: "Dịch vụ đã được gửi lên hệ thống.",
          });
          navigate("/group");
        } else {
          throw new Error("Lỗi không xác định khi gửi dữ liệu");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Lỗi",
          description: "Không thể gửi thông tin dịch vụ.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const totalAmount = useMemo(() => {
    return formik.values.services.reduce((sum, s) => {
      const num = Number(s.price.replace(/,/g, "")) || 0;
      return sum + num;
    }, 0);
  }, [formik.values.services]);

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="max-w-2xl mx-auto py-10 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          Chi tiết đăng ký dịch vụ
        </h2>

        <FieldArray
          name="services"
          render={(arrayHelpers) => (
            <>
              {formik.values.services.map((service, index) => (
                <Card key={index} className="p-4 space-y-4">
                  <CardContent className="space-y-3">
                    {/* Tên dịch vụ */}
                    <div>
                      <label className="text-sm font-medium">Tên dịch vụ*</label>
                      <Input
                        name={`services[${index}].serviceName`}
                        value={service.serviceName}
                        onChange={formik.handleChange}
                      />
                      <FormError
                        error={
                          (formik.errors.services?.[index] as FormikErrors<ServiceDetailForm>)
                            ?.serviceName as string
                        }
                      />
                    </div>

                    {/* Số tiền */}
                    <div>
                      <label className="text-sm font-medium">Số tiền đã chi trả*</label>
                      <Input
                        name={`services[${index}].price`}
                        value={service.price}
                        onChange={(e) => {
                          const formatted = e.target.value
                            .replace(/[^\d]/g, "")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                          formik.setFieldValue(`services[${index}].price`, formatted);
                        }}
                      />
                      <FormError
                        error={
                          (formik.errors.services?.[index] as FormikErrors<ServiceDetailForm>)
                            ?.price as string
                        }
                      />
                    </div>

                    {/* Ảnh biên lai */}
                    <div>
                      <label className="text-sm font-medium">Ảnh biên lai*</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          formik.setFieldValue(
                            `services[${index}].image`,
                            e.currentTarget.files?.[0] || null
                          )
                        }
                      />
                      <FormError
                        error={
                          (formik.errors.services?.[index] as FormikErrors<ServiceDetailForm>)
                            ?.image as string
                        }
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    {index === formik.values.services.length - 1 && (
                      <Button
                        type="button"
                        onClick={() =>
                          arrayHelpers.push({
                            serviceName: "",
                            price: "",
                            image: null,
                          })
                        }
                      >
                        + Thêm dịch vụ
                      </Button>
                    )}

                    {formik.values.services.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        Xóa
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
        />

        {/* Tổng tiền */}
        <div className="text-right font-semibold">
          Tổng chi phí:{" "}
          <span className="text-green-600">
            {totalAmount.toLocaleString("vi-VN")} VNĐ
          </span>
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {submitting ? "Đang gửi..." : "Gửi đăng ký"}
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}
