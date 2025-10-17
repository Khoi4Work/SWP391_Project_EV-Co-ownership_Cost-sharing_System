import React from "react";

interface ContractPreviewProps {
  ownerInfo: any;
  coOwners: any[];
  vehicleData: any;
  status: number | null; // 1 = đồng ý, 0 = không đồng ý
  setStatus: (val: number) => void;
}

export default function ContractPreview({
  ownerInfo,
  coOwners,
  vehicleData,
  status,
  setStatus,
}: ContractPreviewProps) {
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
      <h1 style={{ textAlign: "center", textTransform: "uppercase", marginBottom: "1rem" }}>
        HỢP ĐỒNG ĐỒNG SỞ HỮU XE
      </h1>
      <hr style={{ marginBottom: "1.5rem", borderColor: "#999" }} />

      {/* Chủ sở hữu chính */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>1. Bên A - Chủ sở hữu chính</h2>
        <p><strong>Họ tên:</strong> {ownerInfo.name}</p>
        <p><strong>Email:</strong> {ownerInfo.email}</p>
        <p><strong>Tỷ lệ sở hữu:</strong> {ownerInfo.ownership}%</p>
      </section>

      {/* Thông tin xe */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>2. Thông tin xe sở hữu</h2>
        <p><strong>Model:</strong> {vehicleData.model}</p>
        <p><strong>Biển số:</strong> {vehicleData.plateNo}</p>
      </section>

      {/* Đồng sở hữu khác */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>3. Đồng sở hữu khác</h2>
        {coOwners.length > 0 ? (
          <ul style={{ paddingLeft: "1.2rem" }}>
            {coOwners.map((co, i) => (
              <li key={i}>
                <strong>{co.name}</strong> - {co.ownership}%
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có đồng sở hữu khác</p>
        )}
      </section>

      {/* Xác nhận */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>4. Xác nhận</h2>
        <p>Vui lòng xác nhận đồng ý hoặc không đồng ý với các điều khoản trong hợp đồng:</p>

        <label style={{ display: "block", margin: "0.5rem 0", cursor: "pointer" }}>
          <input
            type="radio"
            name="agreement"
            value="1"
            checked={status === 1}
            onChange={() => setStatus(1)}
            style={{ marginRight: "0.5rem" }}
          />
          Đồng ý
        </label>

        <label style={{ display: "block", margin: "0.5rem 0", cursor: "pointer" }}>
          <input
            type="radio"
            name="agreement"
            value="0"
            checked={status === 0}
            onChange={() => setStatus(0)}
            style={{ marginRight: "0.5rem" }}
          />
          Không đồng ý
        </label>
      </section>

      <p style={{ marginTop: "2rem", fontStyle: "italic", fontSize: "0.9rem", color: "#555" }}>
        Lưu ý: Khi tick "Đồng ý", bạn đồng ý với tất cả các điều khoản nêu trong hợp đồng này.
      </p>
    </div>
  );
}
