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

        // Gửi danh sách decisionNames
        values.services.forEach((service, index) => {
          formData.append(`decisionNames[${index}]`, service.serviceName);
        });

        // Gửi tổng mô tả
        formData.append(
          "description",
          `Tổng số tiền phải trả: ${totalAmount.toLocaleString("vi-VN")} VNĐ`
        );
        formData.append("price", totalAmount.toString());

        // Ảnh bill (chỉ lấy ảnh đầu tiên)
        const firstImage = values.services[0]?.image;
        if (firstImage) {
          formData.append("billImage", firstImage);
        }
        formData.append("idService", "1");
        // 🧩 Gọi API tạo DecisionVote (multipart/form-data)
        const res = await axiosClient.post(`${CREATE_DECISION}${idGroup}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status !== 201 && res.status !== 200) {
          throw new Error("Không thể tạo quyết định mới");
        }

        console.log("✅ Full decisionVote:", res.data);
        const voters = res.data.voters;
        const creator = res.data.creator;

        // 1️⃣ Creator name & group name
        const creatorName = creator?.createdBy?.users?.hovaTen || "Một thành viên";
        const groupNameFromRes = creator?.createdBy?.group?.groupName || "Nhóm";
        const decisionName = creator?.decisionName || "Dịch vụ";
        const decisionId = res.data.creator.id;
        const groupId = res.data.groupMember.id;
        console.log("decisionId:", decisionId);
        localStorage.setItem("decisionId", decisionId);
        localStorage.setItem("creatorName", creatorName);
        localStorage.setItem("totalAmount", totalAmount.toString());

        // 2️⃣ Lấy danh sách email từ decisionVoteDetails
        const emailList =
          voters
            ?.map((detail: any) => detail?.groupMember?.users?.email)
            .filter((email: string | undefined) => email) || [];

        console.log("✅ Email list:", emailList);

        // 3️⃣ Nếu không có email nào → cảnh báo
        if (emailList.length === 0) {
          console.warn("Không tìm thấy email co-owner trong voters:", voters);
        }

        // 4️⃣ Tạo danh sách payload để gửi email
        const emailPayloads = emailList.map((email: string) => ({
          email,
          subject: `Yêu cầu xác nhận thanh toán dịch vụ`,
          url: `${window.location.origin}/vote/${groupId}`,
          template: `Nhóm ${groupNameFromRes} - thành viên ${creatorName} tạo yêu cầu ${decisionName}. Xin vui lòng vào link này ${window.location.origin}/vote/${creator.id} để xác nhận thanh toán.`,
        }));

        // 5️⃣ Gửi email song song (Promise.allSettled để không ngắt khi lỗi 1 phần)
        const sendResults = await Promise.allSettled(
          emailPayloads.map((payload) => axiosClient.post("/email/send/vote/decision", payload))
        );

        const failed = sendResults.filter((r) => r.status === "rejected");

        if (failed.length > 0) {
          console.error(`${failed.length} email gửi thất bại`, failed);
          toast({
            title: "Gửi email",
            description: `${emailList.length - failed.length} / ${emailList.length} email đã được gửi.`,
            variant: failed.length === emailList.length ? "destructive" : undefined,
          });
        } else {
          toast({
            title: "Đăng ký dịch vụ thành công",
            description: `Đã gửi thông báo biểu quyết đến ${emailList.length} thành viên trong nhóm.`,
          });
        }

        // ✅ Cuối cùng: điều hướng về trang nhóm
        navigate("/group");
      } catch (error) {
        console.error("Lỗi khi tạo decision hoặc gửi email:", error);
        toast({
          title: "Lỗi",
          description: "Không thể khởi tạo quyết định hoặc gửi email.",
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
