import React from "react";

interface ContractPreviewProps {
  ownerInfo: any;
  coOwners: any[];
  vehicleData: any;
  status: number | null; // 1 = đồng ý, 0 = không đồng ý
  setStatus: (val: number) => void;
}

export default function ContractPreview({ ownerInfo, coOwners, vehicleData, status, setStatus }: ContractPreviewProps) {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", lineHeight: 1.6 }}>
      <h1 style={{ textAlign: "center" }}>HỢP ĐỒNG ĐỒNG SỞ HỮU XE</h1>
      <hr />

      <h3>Bên A (Chủ sở hữu chính)</h3>
      <p>Họ tên: {ownerInfo.name}</p>
      <p>Email: {ownerInfo.email}</p>
      <p>Tỷ lệ sở hữu: {ownerInfo.ownership}%</p>

      <h3>Xe sở hữu</h3>
      <p>Model: {vehicleData.model}</p>
      <p>Biển số: {vehicleData.plateNo}</p>

      <h3>Đồng sở hữu khác</h3>
      {coOwners.length > 0 ? coOwners.map((co, i) => (
        <p key={i}>{co.name} - {co.ownership}%</p>
      )) : <p>Không có đồng sở hữu khác</p>}

      <h3>Xác nhận</h3>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        <input
          type="radio"
          name="agreement"
          value="1"
          checked={status === 1}
          onChange={() => setStatus(1)}
        /> Đồng ý
      </label>
      <label style={{ display: "block" }}>
        <input
          type="radio"
          name="agreement"
          value="0"
          checked={status === 0}
          onChange={() => setStatus(0)}
        /> Không đồng ý
      </label>
    </div>
  );
}
