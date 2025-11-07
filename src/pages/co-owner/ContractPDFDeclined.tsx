import React, { useState, forwardRef } from "react";
import { toast } from "../../components/ui/use-toast";
export interface OwnerInfo {
    name: string;
    email?: string;
    idNumber?: string;
    ownership?: number;
    // thêm các trường khác nếu cần
}

export interface CoOwners {
    name: string;
    email?: string;
    idNumber?: string;
    ownership?: number;
}

export interface VehicleData {
    vehicleType?: string;
    brand?: string;
    model?: string;
    plateNo?: string;
    color?: string;
    batteryCapacity?: number | string;
}

export interface ContractViewProps {
    ownerInfo: OwnerInfo;
    coOwners: CoOwners[];
    vehicleData: VehicleData;
    status: number | null;
    setStatus: (val: number) => void;
    // nếu muốn, bạn có thể truyền vào callback khi lưu:
    onSavePrivateKey?: (key: string) => void;
    readonly?: boolean;
}
const ContractView = forwardRef<HTMLDivElement, ContractViewProps>(
    ({ ownerInfo, coOwners, vehicleData, status, setStatus, onSavePrivateKey, readonly }, ref) => {
        const [privateKey, setPrivateKey] = useState<string>("");
        const [saving, setSaving] = useState<boolean>(false);

        const handleClear = () => setPrivateKey("");

        const handleSave = () => {
            const trimmed = privateKey.trim();
            if (!trimmed) {
                toast({ title: "Lỗi", description: "Vui lòng nhập private key.", variant: "destructive" });
                return;
            }
            onSavePrivateKey?.(trimmed);
            setSaving(true);
            setTimeout(() => setSaving(false), 400);
        };
        return (
            <div
                style={{
                    maxWidth: "800px",
                    margin: "2rem auto",
                    padding: "2rem",
                    fontFamily: "'Times New Roman', Times, serif",
                    lineHeight: 1.8,
                    color: "#333",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                }}
            >
                <div ref={ref}>
                    {/* Logo + Tiêu đề */}
                    <div style={{ position: "relative", marginBottom: "1rem" }}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                position: "absolute",
                                left: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: "50px",
                                objectFit: "contain",
                            }}
                        />
                        <h1
                            style={{
                                textAlign: "center",
                                textTransform: "uppercase",
                                margin: 0,
                                marginLeft: "50px",
                            }}
                        >
                            THỎA THUẬN ĐỒNG SỞ HỮU XE (DỰA TRÊN HỢP ĐỒNG BÊN NGOÀI)
                        </h1>
                    </div>
                    <hr style={{ marginBottom: "1.5rem", borderColor: "#999" }} />
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            1. Chủ sở hữu chính - Bên A
                        </h2>
                        <p><strong>Họ tên:</strong> {ownerInfo.name}</p>
                        <p><strong>Email:</strong> {ownerInfo.email}</p>
                        <p><strong>CCCD:</strong> {ownerInfo.idNumber}</p>
                        <p><strong>Tỷ lệ sở hữu:</strong> {ownerInfo.ownership}%</p>
                    </section>
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            Bên B - Các đồng sở hữu
                        </h2>
                        {coOwners.length > 0 ? (
                            <>
                                <p><strong>Các đồng sở hữu khác:</strong></p>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "1rem",
                                        paddingLeft: 0,
                                    }}
                                >
                                    {coOwners.map((co, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: "6px",
                                                background: "#fff",
                                                padding: "0.8rem",
                                            }}
                                        >
                                            <p><strong>Tên đồng sở hữu:</strong> {co.name}</p>
                                            <p><strong>Email:</strong> {co.email}</p>
                                            <p><strong>CCCD:</strong> {co.idNumber}</p>
                                            <p><strong>Tỷ lệ sở hữu:</strong> {co.ownership}%</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p>Không có đồng sở hữu khác</p>
                        )}
                    </section>

                    {/* ✅ Thông tin xe */}
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            3. Thông tin xe sở hữu
                        </h2>

                        <p>
                            <strong>Loại phương tiện:</strong> {vehicleData.vehicleType}
                        </p>
                        <p>
                            <strong>Hãng sản xuất:</strong> {vehicleData.brand}
                        </p>
                        <p>
                            <strong>Model:</strong> {vehicleData.model}
                        </p>
                        <p>
                            <strong>Biển số đăng ký:</strong> {vehicleData.plateNo}
                        </p>
                        <p>
                            <strong>Màu sắc:</strong> {vehicleData.color}
                        </p>
                        <p>
                            <strong>Dung tích pin:</strong> {vehicleData.batteryCapacity} kWh
                        </p>
                    </section>

                    {/* ✅ A. Quyền và nghĩa vụ */}
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            A. Quyền và nghĩa vụ của các đồng sở hữu (Bên A)
                        </h2>

                        <div
                            style={{
                                marginTop: "0.8rem",
                                padding: "0.8rem",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                            }}
                        >
                            {/* Điều 1 */}
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 1. Quản lý quyền sở hữu & thành viên</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Mỗi thành viên phải có CCCD/CMND và Giấy phép lái xe hợp lệ trước khi được thêm vào nhóm đồng sở hữu.
                                </p>
                                <p>
                                    <strong>b)</strong> Mọi thay đổi về tỷ lệ sở hữu chỉ có hiệu lực khi tất cả các thành viên ký lại e-contract.
                                </p>
                                <p>
                                    <strong>c)</strong> Chỉ admin nhóm có quyền thêm, xóa hoặc điều chỉnh tỷ lệ sở hữu của các thành viên.
                                </p>
                                <p>
                                    <strong>d)</strong> Nhóm tối đa 5 thành viên, trong đó tỷ lệ sở hữu tối thiểu cho mỗi thành viên là 15%.
                                </p>
                            </div>

                            {/* Điều 2 */}
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 2. Đặt lịch & sử dụng xe</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Việc đặt xe tuân theo nguyên tắc “ai đặt trước, ưu tiên trước”. Hệ thống ghi nhận thời gian đăng ký để xác định thứ tự ưu tiên.
                                </p>
                                <p>
                                    <strong>b)</strong> Nếu lịch trùng, hệ thống ưu tiên theo thứ tự: (i) tỷ lệ sở hữu cao hơn; (ii) lịch sử sử dụng ít hơn; (iii) thời gian đăng ký sớm hơn.
                                </p>
                                <p>
                                    <strong>c)</strong> Mỗi thành viên được sử dụng xe tối đa 14 ngày liên tục (giảm còn 7 ngày trong các dịp lễ, Tết).
                                </p>
                                <p>
                                    <strong>d)</strong> Đặt lịch phải được xác nhận ít nhất 2 giờ trước khi sử dụng. Hủy hoặc đến muộn quá 15 phút không báo trước sẽ bị trừ tối đa 3 giờ quyền sử dụng.
                                </p>
                                <p>
                                    <strong>e)</strong> Nếu một thành viên đặt lịch trùng lặp trên 5 lần/tháng, hệ thống tự động giảm 50% quyền ưu tiên trong 30 ngày tiếp theo.
                                </p>
                            </div>

                            {/* Điều 3 */}
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 3. Nghĩa vụ tài chính & thanh toán</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Tất cả chi phí chung (bảo dưỡng, sạc, bảo hiểm, thuế, phí đăng kiểm…) được chia theo tỷ lệ sở hữu mặc định, trừ khi có thỏa thuận khác.
                                </p>
                                <p>
                                    <strong>b)</strong> Thanh toán thực hiện trực tuyến qua e-wallet hoặc chuyển khoản. Thành viên chậm thanh toán sẽ bị phạt 50.000 VNĐ/ngày và tạm khóa quyền đặt lịch sau 15 ngày trễ hạn.
                                </p>
                                <p>
                                    <strong>c)</strong> Mọi khoản chi phí, thanh toán và vi phạm được ghi nhận tự động trên nền tảng EcoShare, làm căn cứ khi tính quyền sử dụng hoặc phân chia chi phí sau này.
                                </p>
                            </div>

                            {/* Điều 4 */}
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 4. Trách nhiệm bảo quản & xử lý hư hỏng</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Thành viên phải sử dụng xe đúng mục đích, tuân thủ quy định giao thông và hướng dẫn kỹ thuật.
                                </p>
                                <p>
                                    <strong>b)</strong> Nếu gây hư hỏng xe do lỗi sử dụng, người đó phải chịu chi phí sửa chữa và bị phạt thêm 500.000 VNĐ.
                                </p>
                                <p>
                                    <strong>c)</strong> Nghiêm cấm cho thuê lại xe, sử dụng sai mục đích hoặc vi phạm nghiêm trọng khác. Trường hợp vi phạm, thành viên bị loại khỏi nhóm và tịch thu toàn bộ tỷ lệ sở hữu.
                                </p>
                                <p>
                                    <strong>d)</strong> Mọi hư hỏng hoặc sự cố phải được báo trong vòng 48 giờ kể từ khi phát sinh để được hỗ trợ và xác minh trách nhiệm.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ✅ B. Giám sát & tranh chấp */}
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            B. Giám sát, tranh chấp & xử lý vi phạm
                        </h2>

                        <div
                            style={{
                                marginTop: "0.8rem",
                                padding: "0.8rem",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                            }}
                        >
                            {/* Điều 5 */}
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 5. Giám sát & ghi nhận hệ thống</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Mọi hoạt động đặt lịch, thanh toán, hủy chuyến hoặc vi phạm đều được hệ thống ghi log và không thể chỉnh sửa.
                                </p>
                                <p>
                                    <strong>b)</strong> Lịch sử sử dụng và hành vi vi phạm là căn cứ để đánh giá quyền ưu tiên hoặc xử lý tranh chấp.
                                </p>
                            </div>

                            {/* Điều 6 */}
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 6. Giải quyết tranh chấp</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Tranh chấp nhỏ giữa các thành viên sẽ được hòa giải qua nền tảng EcoShare với sự hỗ trợ của Staff.
                                </p>
                                <p>
                                    <strong>b)</strong> Nếu không đạt thỏa thuận, EcoShare Admin có quyền kiểm tra log, đưa ra quyết định cuối cùng có giá trị bắt buộc.
                                </p>
                                <p>
                                    <strong>c)</strong> Mọi kết luận, cảnh cáo, phạt hành chính hoặc khóa quyền sử dụng đều được thông báo chính thức qua hệ thống.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ✅ C. Hiệu lực hợp đồng */}
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            C. Hiệu lực hợp đồng & chấm dứt
                        </h2>

                        <div
                            style={{
                                marginTop: "0.8rem",
                                padding: "0.8rem",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                            }}
                        >
                            <p style={{ margin: "0 0 0.6rem 0" }}>
                                <strong>Điều 7. Hiệu lực và chấm dứt</strong>
                            </p>
                            <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                                <p>
                                    <strong>a)</strong> Hợp đồng có hiệu lực kể từ ngày các bên ký điện tử và có giá trị vô thời hạn, trừ khi được sửa đổi hoặc chấm dứt bằng văn bản.
                                </p>
                                <p>
                                    <strong>b)</strong> Hợp đồng có thể chấm dứt khi: (i) các bên đồng thuận; (ii) một bên vi phạm nghiêm trọng và không khắc phục trong 30 ngày; (iii) chuyển nhượng toàn bộ quyền sở hữu.
                                </p>
                                <p>
                                    <strong>c)</strong> Sau khi chấm dứt, mọi nghĩa vụ tài chính và quyền sử dụng xe phải được thanh toán, xác nhận và cập nhật trên nền tảng EcoShare.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
                {/* Xác nhận section */}
                {!readonly && (
                    <section style={{ marginTop: "2rem" }}>
                        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
                            5. Xác nhận
                        </h2>
                        <p>Vui lòng xác nhận đồng ý hoặc không đồng ý với các điều khoản trong hợp đồng:</p>

                        <div
                            style={{
                                border: "1px solid #cfd8dc",
                                background: "#f9fcff",
                                padding: "1rem 1.2rem",
                                borderRadius: "8px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                        >
                            <label style={{ display: "block", margin: "0.5rem 0", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="agreement"
                                    checked={status === 1}
                                    onChange={() => setStatus(1)}
                                />{" "}
                                Tôi <strong>đồng ý</strong> với toàn bộ điều khoản
                            </label>

                            <label style={{ display: "block", margin: "0.5rem 0", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="agreement"
                                    checked={status === 0}
                                    onChange={() => setStatus(0)}
                                />{" "}
                                Tôi <strong>không đồng ý</strong> với các điều khoản
                            </label>
                        </div>

                        <p
                            style={{
                                marginTop: "1.5rem",
                                padding: "0.75rem 1rem",
                                background: "#e3f2fd",
                                borderLeft: "4px solid #2196f3",
                                borderRadius: "6px",
                                fontSize: "1rem",
                                color: "#0d47a1",
                                fontWeight: 500,
                            }}
                        >
                            ⚠️ <strong>Lưu ý:</strong> Khi tick <em>"Đồng ý"</em>, bạn xác nhận đã đọc và chấp thuận tất cả các điều
                            khoản nêu trong hợp đồng này.
                        </p>

                        {status === 1 && (
                            <div
                                style={{
                                    marginTop: "2rem",
                                    background: "#f9fafb",
                                    border: "1px solid #cfd8dc",
                                    borderRadius: "10px",
                                    padding: "1.5rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    maxWidth: "800px",
                                }}
                            >
                                <h3
                                    style={{
                                        borderBottom: "2px solid #1976d2",
                                        paddingBottom: "0.5rem",
                                        color: "#0d47a1",
                                        fontSize: "1.25rem",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    🔐 6. Xác nhận bằng Private Key
                                </h3>

                                <p style={{ marginTop: "0.8rem", fontSize: "1rem", color: "#333" }}>
                                    Vui lòng nhập <strong>Private Key</strong> của bạn để hoàn tất quá trình xác nhận hợp đồng.
                                </p>

                                <div style={{ marginTop: "1.2rem" }}>
                                    <label
                                        htmlFor="privateKeyArea"
                                        style={{
                                            display: "block",
                                            marginBottom: "0.5rem",
                                            fontWeight: 500,
                                            color: "#444",
                                        }}
                                    >
                                        Private Key
                                    </label>

                                    <textarea
                                        id="privateKeyArea"
                                        rows={6}
                                        value={privateKey}
                                        onChange={(e) => setPrivateKey(e.target.value)}
                                        style={{
                                            width: "100%",
                                            maxWidth: "700px",
                                            border: "1.5px solid #90a4ae",
                                            padding: "0.75rem",
                                            borderRadius: "6px",
                                            boxSizing: "border-box",
                                            fontFamily: "monospace",
                                            background: "#fff",
                                        }}
                                        placeholder="Dán private key của bạn tại đây"
                                    />

                                    <div
                                        style={{
                                            marginTop: "0.8rem",
                                            display: "flex",
                                            gap: "0.6rem",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            style={{
                                                padding: "0.55rem 1.2rem",
                                                border: "1px solid #bbb",
                                                borderRadius: "6px",
                                                background: "#fafafa",
                                                cursor: "pointer",
                                            }}
                                        >
                                            🧹 Xóa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={saving}
                                            style={{
                                                padding: "0.55rem 1.2rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: saving ? "#90caf9" : "#1976d2",
                                                color: "white",
                                                fontWeight: 500,
                                                cursor: saving ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            {saving ? "⏳ Đang lưu..." : "💾 Lưu"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div >
        );
    }
);
export default ContractView;
