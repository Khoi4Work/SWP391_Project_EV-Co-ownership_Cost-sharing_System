import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import ContractPreview from "./ContractPDFPreview";
import { Button } from "@/components/ui/button"; // nếu bạn dùng ShadCN button
import axiosClient from "@/api/axiosClient";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import html2pdf from "html2pdf.js";
interface ContractPreviewPageProps {
    readonly?: boolean;
}

export default function ContractPreviewPage({ readonly = false }: ContractPreviewPageProps) {
    const [isPrivateKey, setIsPrivateKey] = useState(false);
    const [savedPrivateKey, setSavedPrivateKey] = useState("");
    const AUTH_CURRENT_PATH = import.meta.env.VITE_AUTH_CURRENT;
    const { toast } = useToast();
    const location = useLocation();
    const { id } = useParams(); // lấy id tạm từ URL
    const [ownerInfo, setOwnerInfo] = useState<any>(null);
    const [coOwners, setCoOwners] = useState<any[]>([]);
    const [vehicleData, setVehicleData] = useState<any>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const BASE_URL = import.meta.env.VITE_API_URL;
    const contractRef = useRef<HTMLDivElement>(null);
    console.log("Contract ID:", id);
    console.log("Token từ query string:", token);
    const handleSavePrivateKey = (key: string) => {
        setSavedPrivateKey(key);
        setIsPrivateKey(true);   // <-- Lưu lại để dùng khi gọi API
    };
    useEffect(() => {
        if (!token) {
            setError("Token không hợp lệ");
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}${AUTH_CURRENT_PATH}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(res.data);
            } catch (err: any) {
                console.error("Lỗi khi tải thông tin user:", err);
                setError("Không thể lấy thông tin user.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);
    const generatePDF = async () => {
        const element = contractRef.current;
        if (!element) {
            alert("Không tìm thấy vùng hợp đồng để xuất PDF!");
            return null;
        }

        const oldStatus = status;
        setStatus(null);

        const opt = {
            margin: 10,
            filename: `HopDong_${id}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        const pdf = await html2pdf().set(opt as any).from(element).toPdf().get("pdf");
        const blob = pdf.output("blob");
        const fileUrl = URL.createObjectURL(blob);
        setStatus(oldStatus);
        return { blob, fileUrl };
    };
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob); // chuyển sang base64 dạng data:application/pdf;base64,...
        });
    };
    useEffect(() => {
        // TODO: Lấy dữ liệu từ localStorage hoặc state chung
        const savedOwner = JSON.parse(localStorage.getItem("ownerInfo") || "{}");
        const savedCoOwners = JSON.parse(localStorage.getItem("coOwners") || "[]");
        const savedVehicle = JSON.parse(localStorage.getItem("selectedVehicle") || "{}");

        setOwnerInfo(savedOwner);
        setCoOwners(savedCoOwners);
        setVehicleData(savedVehicle);
    }, [id]);

    const handleConfirm = async () => {
        console.log("ownerInfo", ownerInfo)
        const members = [
            {
                email: ownerInfo.email,
                ownershipPercentage: ownerInfo.ownership,
            },
            ...coOwners.map(co => ({
                email: co.email,
                ownershipPercentage: co.ownership,
            })),
        ];

        if (status === null) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn Đồng ý hoặc Không đồng ý trước khi xác nhận.",
                variant: "destructive",
            });
            return;
        }

        try {
            // ✅ 1. Tạo file PDF hợp đồng
            const pdfResult: any = await generatePDF();
            if (!pdfResult) {
                toast({
                    title: "Lỗi",
                    description: "Không thể tạo file PDF hợp đồng!",
                    variant: "destructive",
                });
                return;
            }

            const { blob, fileUrl } = pdfResult;
            const key = "contractId_" + user.id;

            const accessToken = localStorage.getItem("accessToken");

            // ✅ 2. Tạo FormData gửi BE
            const formData = new FormData();
            console.log(id)
            formData.append("idContract", id.toString());
            formData.append("idUser", user.id.toString());
            formData.append("idChoice", status.toString());
            formData.append("contract_signature", savedPrivateKey.trim());

            const pdfFile = new File([blob], `HopDong_${id}.pdf`, {
                type: "application/pdf",
            });
            formData.append("contractContent", pdfFile);

            const SET_CONTRACT = import.meta.env.VITE_SET_CONTRACT_PATH;
            const res = await axiosClient.post(SET_CONTRACT, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status !== 200 && res.status !== 201) {
                toast({
                    title: "Lỗi",
                    description: `Gửi quyết định thất bại: HTTP ${res.status}`,
                    variant: "destructive",
                });
                return;
            }

            // BE trả ContractSigner (theo mapping bạn cho). Thử lấy contract từ response:
            const contract = res.data?.contract ?? res.data;
            if (!contract) {
                toast({
                    title: "Lỗi",
                    description: "Phản hồi từ server không chứa thông tin contract.",
                    variant: "destructive",
                });
                return;
            }

            // 3) Kiểm tra trạng thái contract (BE phải cung cấp contract.status)
            // BE dùng "CONFIRMED" khi hợp đồng đã được xác nhận (theo bạn)
            if (String(contract.status).toUpperCase() !== "CONFIRMED") {
                // Nếu chưa CONFIRMED -> thông báo và dừng (BE sẽ quản lý tiếp)
                toast({
                    title: "Đang chờ xác nhận",
                    description: "Hợp đồng chưa được xác nhận đầy đủ (chưa ở trạng thái CONFIRMED).",
                    variant: "default",
                });
                return;
            }

            // 4) Chuẩn bị payload /group/create theo GroupCreateReq
            // BE yêu cầu members: List<CoOwner_Info> với coOwnerId (int), ownershipPercentage (Float), roleInGroup (String)
            // Kiểm tra ownerInfo.id & coOwners[].id tồn tại (nếu không có, bạn cần lookup user để lấy id trước khi gửi)
            if (!ownerInfo?.id) {
                toast({
                    title: "Thiếu dữ liệu",
                    description: "Không có ownerInfo.id — FE cần có user id để tạo nhóm.",
                    variant: "destructive",
                });
                return;
            }
            const missingId = coOwners.some((c: any) => !c?.id);
            if (missingId) {
                toast({
                    title: "Thiếu dữ liệu đồng sở hữu",
                    description: "Một hoặc vài đồng sở hữu chưa có user id. Vui lòng lấy user id từ email trước khi tạo nhóm.",
                    variant: "destructive",
                });
                return;
            }

            // build members array
            const members = [
                {
                    coOwnerId: Number(ownerInfo.id),
                    ownershipPercentage: parseFloat(String(ownerInfo.ownership ?? 0)),
                    roleInGroup: "OWNER",
                },
                ...coOwners.map((co: any) => ({
                    coOwnerId: Number(co.id),
                    ownershipPercentage: parseFloat(String(co.ownership ?? 0)),
                    roleInGroup: "CO_OWNER",
                })),
            ];
            console.log(members);
            // optional: validate ownership sum >= 100? (BE có thể check)
            const groupPayload = {
                contractId: Number(contract.contractId ?? contract.id ?? id),
                documentUrl: contract.urlConfirmedContract ?? contract.documentUrl ?? fileUrl,
                members,
            };

            // 5) Gọi create group
            const groupRes = await axiosClient.post("/group/create", groupPayload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (groupRes.status === 201) {
                toast({
                    title: "🎉 Nhóm đã được tạo",
                    description: `Nhóm tạo thành công — Biển số: ${groupRes.data?.plateNo ?? "N/A"}`,
                });
                console.log("Group created:", groupRes.data);
            } else {
                // lỗi từ BE khi tạo group
                const errText = (groupRes.data && JSON.stringify(groupRes.data)) || `HTTP ${groupRes.status}`;
                toast({
                    title: "Tạo nhóm thất bại",
                    description: errText,
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error("Chi tiết lỗi:", err?.response || err);
            toast({
                title: "Lỗi hệ thống",
                description: err?.response?.data?.message || "Không thể hoàn tất yêu cầu. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };
    if (loading) return <div>Đang tải thông tin user...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!ownerInfo || !vehicleData) return <p>Đang tải dữ liệu hợp đồng...</p>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Xem hợp đồng đồng sở hữu</h1>
            <div id="contract-area" className="border p-4 mb-4">
                <ContractPreview
                    ref={contractRef}
                    ownerInfo={ownerInfo}
                    coOwners={coOwners}
                    vehicleData={vehicleData}
                    status={status}
                    setStatus={setStatus}
                    onSavePrivateKey={handleSavePrivateKey}
                    readonly={readonly}
                />
            </div>

            <div className="flex gap-4">
                <Button onClick={handleConfirm} disabled={status === null || (status === 1 && !isPrivateKey)}>
                    Xác nhận hợp đồng
                </Button>
                <Button
                    onClick={() => {
                        if (contractRef.current) {
                            generatePDF();
                        } else {
                            alert("Không tìm thấy nội dung hợp đồng để xuất PDF!");
                        }
                    }}
                    variant="secondary"
                >
                    Xuất PDF
                </Button>
                {status !== null && (
                    <p className={status === 1 ? "text-green-600" : "text-red-600"}>
                        Bạn đã chọn: {status === 1 ? "Đồng ý" : "Không đồng ý"}
                    </p>
                )}
            </div>
        </div>
    );
}
