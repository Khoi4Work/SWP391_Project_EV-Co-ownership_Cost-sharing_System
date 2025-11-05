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
            const idContract = localStorage.getItem(key);
            if (!idContract) {
                toast({
                    title: "Lỗi",
                    description: "Không tìm thấy contract ID!",
                    variant: "destructive",
                });
                return;
            }

            const accessToken = localStorage.getItem("accessToken");

            // ✅ 2. Tạo FormData gửi BE
            const formData = new FormData();
            formData.append("idContract", idContract.toString());
            formData.append("idUser", user.id.toString());
            formData.append("idChoice", status.toString());
            formData.append("contract_signature", savedPrivateKey);

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
                description: "Hợp đồng của bạn đã được xác nhận!",
            });

            // ✅ 3. Lấy contractId từ response (ContractSigner)
            const contractId = res.data?.contract?.contractId;
            if (!contractId) {
                toast({
                    title: "Lỗi",
                    description: "Không lấy được contractId từ phản hồi BE!",
                    variant: "destructive",
                });
                return;
            }

            // ✅ 4. Lấy lại contract chi tiết để kiểm tra signer
            const contractRes = await axiosClient.get(`/contract/${contractId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (contractRes.status === 200) {
                const contract = contractRes.data;
                console.log("📜 Contract chi tiết:", contract);

                const signerList = contract.signerList || [];

                if (!signerList.length) {
                    toast({
                        title: "Không có signer nào",
                        description: "Không thể kiểm tra trạng thái ký hợp đồng.",
                        variant: "destructive",
                    });
                    return;
                }

                const allSigned = signerList.every((s: any) => s.decision === "SIGNED");

                if (allSigned) {
                    console.log("✅ Tất cả signer đã ký — tiến hành tạo group...");

                    // =========================
                    // SỬA Ở ĐÂY: build ownership map
                    // =========================
                    // map theo user id (nếu có), fallback theo email
                    const ownershipMap: Record<string | number, number> = {};

                    // chủ sở hữu chính (ownerInfo)
                    if (ownerInfo?.id) {
                        ownershipMap[ownerInfo.id] = Number(ownerInfo.ownership) || 0;
                    } else if (ownerInfo?.email) {
                        ownershipMap[ownerInfo.email] = Number(ownerInfo.ownership) || 0;
                    }

                    // các đồng sở hữu
                    coOwners.forEach(co => {
                        if (co.id) ownershipMap[co.id] = Number(co.ownership) || 0;
                        else if (co.email) ownershipMap[co.email] = Number(co.ownership) || 0;
                    });

                    // Tạo members đúng thứ tự từ signerList, lấy ownership từ map
                    const membersForGroup = signerList.map((s: any) => {
                        const userId = s.user?.id;
                        const userEmail = s.user?.email;
                        let ownershipPercentage = undefined as number | undefined;

                        if (userId !== undefined && ownershipMap[userId] !== undefined) {
                            ownershipPercentage = ownershipMap[userId];
                        } else if (userEmail && ownershipMap[userEmail] !== undefined) {
                            ownershipPercentage = ownershipMap[userEmail];
                        }

                        // fallback: nếu không tìm được ownership, chia đều
                        if (ownershipPercentage === undefined) {
                            console.warn(`Không tìm thấy ownership cho user ${userId || userEmail}, sẽ chia đều (fallback).`);
                            ownershipPercentage = Math.round((100 / signerList.length) * 100) / 100; // 2 chữ số
                        }

                        return {
                            coOwnerId: s.user?.id,
                            ownershipPercentage,
                            roleInGroup: s.user?.id === ownerInfo?.id ? "MAIN_OWNER" : "MEMBER",
                        };
                    });

                    // debug log
                    console.log("Members payload (with ownership):", membersForGroup);

                    // =========================
                    // Gọi /group/create
                    // =========================
                    const groupPayload = {
                        vehicleId: contract.vehicle?.vehicleId ?? 1,
                        contractId: contract.contractId,
                        documentUrl: contract.urlConfirmedContract ?? fileUrl,
                        members: membersForGroup,
                    };

                    const groupRes = await axiosClient.post("/group/create", groupPayload, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    if (groupRes.status === 201) {
                        toast({
                            title: "🎉 Nhóm đã được tạo thành công!",
                            description: `Xe ${groupRes.data.plateNo || ""} đã được đăng ký nhóm mới.`,
                        });
                        console.log("🎯 Group tạo thành công:", groupRes.data);
                    }
                } else {
                    // ⏳ Chưa đủ người ký
                    const signedCount = signerList.filter((s: any) => s.decision === "SIGNED")
                        .length;
                    toast({
                        title: "Đang chờ thành viên khác ký...",
                        description: `${signedCount}/${signerList.length} người đã ký.`,
                    });
                    console.log("⏳ Chưa đủ người ký:", signedCount, "/", signerList.length);
                }
            }
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
