import React from "react";

interface ContractPreviewProps {
  ownerInfo: any;       // Người có tỷ lệ sở hữu cao nhất (hiển thị riêng)
  coOwners: any[];      // Các đồng sở hữu còn lại
  vehicleData: any;
  status: number | null;
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
      <h1
        style={{
          textAlign: "center",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        HỢP ĐỒNG ĐỒNG SỞ HỮU XE
      </h1>
      <hr style={{ marginBottom: "1.5rem", borderColor: "#999" }} />

      {/* ✅ BÊN A - Các đồng sở hữu */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          1. Bên A - Các đồng sở hữu
        </h2>

        {/* Đồng sở hữu chính */}
        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>Đồng sở hữu chính:</strong> {ownerInfo.name}
          </p>
          <p>
            <strong>Email:</strong> {ownerInfo.email}
          </p>
          <p>
            <strong>CCCD: </strong> {ownerInfo.idNumber}
          </p>
          <p>
            <strong>Tỷ lệ sở hữu:</strong> {ownerInfo.ownership}%
          </p>
        </div>

        {/* Các đồng sở hữu còn lại */}
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
                    padding: "0.8rem",
                    backgroundColor: "#fff",
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

      {/* ✅ BÊN B - Nền tảng EcoShare */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          2. Bên B - EcoShare Platform
        </h2>
        <p>
          <strong>Tên đơn vị:</strong> EcoShare Platform
        </p>
        <p>
          <strong>Email:</strong> support@ecoshare.vn
        </p>
        <p>
          <strong>Vai trò:</strong> Cung cấp hệ thống và hỗ trợ quản lý đồng sở hữu phương tiện
        </p>
      </section>

      {/* Thông tin xe */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          3. Thông tin xe sở hữu
        </h2>
        <p>
          <strong>Model:</strong> {vehicleData.model}
        </p>
        <p>
          <strong>Biển số:</strong> {vehicleData.plateNo}
        </p>
      </section>

      {/* Xác nhận */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          4. Xác nhận
        </h2>
        <p>
          Vui lòng xác nhận đồng ý hoặc không đồng ý với các điều khoản trong hợp đồng:
        </p>

        <label
          style={{ display: "block", margin: "0.5rem 0", cursor: "pointer" }}
        >
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

        <label
          style={{ display: "block", margin: "0.5rem 0", cursor: "pointer" }}
        >
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

      <p
        style={{
          marginTop: "2rem",
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: "#555",
        }}
      >
        Lưu ý: Khi tick "Đồng ý", bạn đồng ý với tất cả các điều khoản nêu trong hợp đồng này.
      </p>
    </div>
  );
}
