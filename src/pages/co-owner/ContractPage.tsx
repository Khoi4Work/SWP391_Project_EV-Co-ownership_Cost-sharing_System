import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import ContractPreview from "./ContractPDFPreview";
import { Button } from "@/components/ui/button"; // nếu bạn dùng ShadCN button
import axiosClient from "@/api/axiosClient";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import html2pdf from "html2pdf.js";

export default function ContractPreviewPage() {
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
        if (status === null) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn Đồng ý hoặc Không đồng ý trước khi xác nhận.",
                variant: "destructive",
            });
            return;
        }

        try {
            // ✅ Gọi generatePDF() chỉ cho vùng ref này
            const pdfResult: any = await generatePDF();
            if (!pdfResult) {
                alert("Không tạo được file PDF!");
                return;
            }

            const { blob, fileUrl } = pdfResult;
            const key = "contractId_" + user.id;
            const idContract = localStorage.getItem(key);
            if (!idContract) {
                alert("Không có contract id");
                return;
            }

            const accessToken = localStorage.getItem("accessToken");

            // ⚙️ Tạo FormData
            const formData = new FormData();
            formData.append("idContract", idContract.toString());
            formData.append("idUser", user.id.toString());
            formData.append("idChoice", status.toString());
            formData.append("contract_signature", savedPrivateKey);
            const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            console.log(`📄 Dung lượng file PDF: ${fileSizeMB} MB`);

            const pdfFile = new File([blob], `HopDong_${idContract}.pdf`, {
                type: "application/pdf",
            });
            formData.append("contractContent", pdfFile);
            const SET_CONTRACT = import.meta.env.VITE_SET_CONTRACT_PATH;
            const res = await axiosClient.post(SET_CONTRACT, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("✅ Gửi thành công:", res.data);
            toast({
                title: "Thành công",
                description: "Hợp đồng đã được xác nhận!",
            });
        } catch (err: any) {
            console.error("Chi tiết lỗi:", err?.response || err);
            toast({
                title: "Lỗi",
                description:
                    err?.response?.data?.message || "Gửi quyết định thất bại!",
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
