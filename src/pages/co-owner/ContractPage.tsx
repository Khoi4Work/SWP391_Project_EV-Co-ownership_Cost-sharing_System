import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ContractPreview from "./ContractPDFPreview";
import { Button } from "@/components/ui/button"; // nếu bạn dùng ShadCN button
import axiosClient from "@/api/axiosClient";

export default function ContractPreviewPage() {
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
    console.log("Contract ID:", id);
    console.log("Token từ query string:", token);
    useEffect(() => {
        if (!token) {
            setError("Token không hợp lệ");
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get("/auth/current", {
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
            alert("Vui lòng chọn Đồng ý hoặc Không đồng ý trước khi xác nhận.");
            return;
        }

        try {
            console.log(user.id)
            const key = 'contractId_' + user.id;
            console.log(key)
            const idContract = localStorage.getItem(key);
            console.log(idContract)
            if (!idContract) {
                alert("Không có contract id");
                return;
            }

            if (!user || !user.id) {
                alert("Không tìm thấy thông tin người dùng");
                return;
            }

            const payload = {
                idContract,
                idUser: user.id,
                idChoice: status,
            };

            const res = await axiosClient.post("/contract/set", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Payload gửi đi:", payload);
            alert("Gửi quyết định thành công!");
        } catch (err) {
            console.error("Lỗi khi gửi quyết định:", err);
            alert("Gửi thất bại, vui lòng thử lại.");
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
                    ownerInfo={ownerInfo}
                    coOwners={coOwners}
                    vehicleData={vehicleData}
                    status={status}
                    setStatus={setStatus}
                />
            </div>

            <div className="flex gap-4">
                <Button onClick={handleConfirm} disabled={status === null}>
                    Xác nhận hợp đồng
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
