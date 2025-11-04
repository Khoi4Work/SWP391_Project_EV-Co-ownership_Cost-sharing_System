import React, { useState, useEffect } from "react";
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
        const element = document.getElementById("contract-area");
        if (!element) {
            alert("Không tìm thấy nội dung hợp đồng để xuất PDF");
            return null;
        }

        const oldStatus = status;
        setStatus(null);

        const opt = {
            margin: 10,
            filename: `HopDong_${id}.pdf`,
            image: {
                type: "jpeg" as const,   // ✅ TS hiểu đúng literal
                quality: 0.98,
            },
            html2canvas: {
                scale: 2,
            },
            jsPDF: {
                unit: "mm" as const,
                format: "a4" as const,
                orientation: "portrait" as const, // ✅ literal type
            },
        };
        return new Promise((resolve) => {
            html2pdf()
                .set(opt)
                .from(element)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    const blob = pdf.output('blob');
                    setStatus(oldStatus);
                    const fileUrl = URL.createObjectURL(blob); // tạm thời tạo link blob
                    resolve({ blob, fileUrl });
                });
        });
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
            })
            return;
        }

        try {
            const pdfResult: any = await generatePDF();
            if (!pdfResult) {
                alert("Không tạo được file PDF!");
                return;
            }

            const { blob, fileUrl } = pdfResult;
            const pdfBase64Full = await blobToBase64(blob);
            const pdfBase64 = pdfBase64Full.split(",")[1]; // cắt bỏ prefix data:application/pdf;base64,
            const key = "contractId_" + user.id;
            const idContract = localStorage.getItem(key);

            if (!idContract) {
                alert("Không có contract id");
                return;
            }

            if (!user || !user.id) {
                alert("Không tìm thấy thông tin người dùng");
                return;
            }

            // --- 🔹 Tạo FormData ---
            const formData = new FormData();
            formData.append("idContract", idContract.toString());
            formData.append("idUser", user.id.toString());
            formData.append("idChoice", status.toString());
            formData.append("contractContent", pdfBase64); // <-- dạng chuỗi Base64
            formData.append("contract_signature", savedPrivateKey);

            const SET_CONTRACT = import.meta.env.VITE_SET_CONTRACT_PATH;

            const res = await axiosClient.post(SET_CONTRACT, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Payload gửi đi:", formData);
            console.log(res.data.contract.status);

            // --- 🔹 Nếu contract được Activated ---
            if (res.data.contract.status === "Activated") {
                if (!ownerInfo?.id || !vehicleData?.id) {
                    alert("Thiếu dữ liệu owner hoặc vehicle!");
                    return;
                }

                const allMembers = [
                    {
                        userId: ownerInfo?.id,
                        ownership: ownerInfo?.ownership || 0,
                    },
                    ...coOwners.map((co) => ({
                        userId: co.id,
                        ownership: co.ownership || 0,
                    })),
                ];

                // 🔹 Tìm admin (người có tỷ lệ lớn nhất)
                let maxRate = -1;
                let adminId = null;
                allMembers.forEach((m) => {
                    if (m.ownership > maxRate) {
                        maxRate = m.ownership;
                        adminId = m.userId;
                    }
                });

                const membersWithRole = allMembers.map((m) => ({
                    coOwnerId: m.userId,
                    roleInGroup: m.userId === adminId ? "admin" : "member",
                    ownershipPercentage: m.ownership,
                }));

                const groupPayload = {
                    contractId: idContract,
                    vehicleId: vehicleData.id,
                    members: membersWithRole,
                    documentUrl: fileUrl,
                };

                console.log("groupPayload gửi đi:", groupPayload);

                const CREATE_GROUP = import.meta.env.VITE_GROUP_CREATE_PATH;
                const resGroup = await axiosClient.post(CREATE_GROUP, groupPayload);
                if (resGroup.status === 200 || resGroup.status === 201) {
                    toast({
                        title: "Đăng ký thành công",
                        description: "Nhóm sở hữu đã được tạo!",
                    });
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Gửi group thất bại!",
                        variant: "destructive",
                    });
                }
            }

            alert("Gửi quyết định thành công!");
        } catch (err: any) {
            console.error("Chi tiết lỗi:", err?.response || err);

            toast({
                title: "Lỗi",
                description: err?.response?.data?.message || "Gửi quyết định thất bại!",
                variant: "destructive",
            });
        }
    }

    if (loading) return <div>Đang tải thông tin user...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!ownerInfo || !vehicleData) return <p>Đang tải dữ liệu hợp đồng...</p>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Xem hợp đồng đồng sở hữu</h1>
            <div id="contract-area" className="border p-4 mb-4">
                <ContractPreview
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
                <Button onClick={generatePDF} variant="secondary">
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
