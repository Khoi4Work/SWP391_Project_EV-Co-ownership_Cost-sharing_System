import { useFormik, FormikProvider, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CoOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  ownership: number;
}

interface Props {
  coOwner: CoOwner;
  index: number;
  updateCoOwner: (id: string, field: keyof CoOwner, value: any) => void;
  removeCoOwner: (id: string) => void;
  getOwnershipAmount: (ownership: number) => number;
  selectedVehicle: string | null;
  fetchUserByEmail: (email: string) => Promise<Partial<CoOwner> | null>;
  mainOwnership: number;
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
}: Props) {
  const formik = useFormik<CoOwner>({
    initialValues: coOwner,
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
        .min(15, "Tỷ lệ sở hữu tối thiểu là 15%")
        .max(90, "Tỷ lệ sở hữu tối đa là 90%")
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
          {/* Họ và tên */}
          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Field name="name">
              {({ field }: any) => <Input {...field} placeholder="Nhập họ và tên" />}
            </Field>
            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Field name="email">
              {({ field }: any) => (
                <Input
                  {...field}
                  placeholder="Nhập email"
                  onBlur={async (e) => {
                    field.onBlur(e);
                    const emailValue = e.target.value.trim();
                    if (!emailValue) return;

                    const user = await fetchUserByEmail(emailValue);
                    if (user) {
                      formik.setValues({
                        ...formik.values,
                        ...user,
                        email: user.email ?? formik.values.email,
                      });
                    }
                  }}
                />
              )}
            </Field>
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Field name="phone">
              {({ field }: any) => <Input {...field} placeholder="Nhập số điện thoại" />}
            </Field>
            <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
          </div>

          {/* CCCD */}
          <div className="space-y-2">
            <Label>CCCD/CMND</Label>
            <Field name="idNumber">
              {({ field }: any) => <Input {...field} placeholder="Nhập số CCCD/CMND" />}
            </Field>
            <ErrorMessage name="idNumber" component="div" className="text-red-500 text-sm" />
          </div>

          {/* Ownership */}
          <div className="space-y-2">
            <Label>Tỷ lệ sở hữu (%)</Label>
            <div className="flex items-center space-x-2">
              <Field name="ownership">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    min={15}
                    max={90}
                    className="flex-1"
                    onBlur={(e) => {
                      updateCoOwner(coOwner.id, "ownership", Number(e.target.value)); // cập nhật parent state
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

          {/* Địa chỉ */}
          <div className="space-y-2 md:col-span-2">
            <Label>Địa chỉ</Label>
            <Field as={Textarea} name="address" placeholder="Nhập địa chỉ" />
            <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
}
