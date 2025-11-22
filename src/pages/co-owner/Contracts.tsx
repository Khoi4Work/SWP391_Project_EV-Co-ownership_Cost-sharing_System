import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  Users,
  Car,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axiosClient from "@/api/axiosClient.ts";
import { useEffect } from "react";
import html2pdf from "html2pdf.js";
interface ContractSigner {
  id: number;

  user: {
    id: number;
    name: string;
  };
  signature: string;
  decision: string;
  signedAt?: string;
}
interface RenderContractRes {
  ownerMember: GroupMember;
  coOwnerMembers: GroupMember[];
  vehicle: Vehicle;
  contracts: ContractSigner[];
}
interface Vehicle {
  brand?: string;
  model?: string;
  plateNo?: string;
  color?: string;
  batteryCapacity?: number;
}
interface GroupMember {
  id: number;
  roleInGroup: string;
  status: string;
  ownershipPercentage: number;
  users: {
    id: number;
    hovaTen: string;
    email?: string;
    cccd: string;
  };
}
async function generateStamps(contractSigners: ContractSigner[], contractHtml: string) {
  const stamps: Record<number, string> = {};
  for (const signer of contractSigners) {
    if (!signer.signature) continue;
    const hash = await sha256(signer.signature + contractHtml);
    const canvas = createStampCanvas(hash);
    stamps[signer.id] = canvas.toDataURL("image/png");
  }
  return stamps;
}
export function generateContractHTML(data: any, stamps: Record<number, string>): string {
  const { ownerMember, coOwnerMembers, vehicle, contracts } = data;

  return `
    <div style="font-family: 'Times New Roman', Times, serif; line-height: 1.8; color: #333; max-width: 800px; margin: 2rem auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; background-color: #fafafa;">
    <style>
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
      }
      p, h1, h2, h3 {
          margin: 0 0 0.5em 0;
          padding: 0;
          word-break: break-word; /* tránh chữ tràn / cắt */
      }
    </style>  
      <!-- Logo + Tiêu đề -->
      <div style="position: relative; margin-bottom: 1rem;">
        <img src="/logo.png" alt="Logo" style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 50px; object-fit: contain;" />
        <h1 style="text-align: center; text-transform: uppercase; margin: 0; margin-left: 50px;">THỎA THUẬN ĐỒNG SỞ HỮU XE</h1>
      </div>

      <!-- Bên A -->
      <section style="margin-bottom: 1.5rem;">
        <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">1. Chủ sở hữu chính - Bên A</h2>
        <p><strong>Họ tên:</strong> ${ownerMember.users.hovaTen}</p>
        <p><strong>Email:</strong> ${ownerMember.users.email || ""}</p>
        <p><strong>CCCD:</strong> ${ownerMember.users.cccd || ""}</p>
        <p><strong>Tỷ lệ sở hữu:</strong> ${ownerMember.ownershipPercentage || 0}%</p>
      </section>

      <!-- Bên B -->
      <section style="margin-bottom: 1.5rem;">
        <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">2. Các đồng sở hữu khác - Bên B</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-left: 0;">
          ${coOwnerMembers.map(owner => `
            <div style="border: 1px solid #ddd; border-radius: 6px; padding: 0.8rem; background-color: #fff;">
              <p><strong>Tên đồng sở hữu:</strong> ${owner.users.hovaTen}</p>
              <p><strong>Email:</strong> ${owner.users.email || ""}</p>
              <p><strong>CCCD:</strong> ${owner.users.cccd || ""}</p>
              <p><strong>Tỷ lệ sở hữu:</strong> ${owner.ownershipPercentage || 0}%</p>
            </div>
          `).join("")}
        </div>
      </section>

      <!-- Thông tin xe -->
      <section style="margin-bottom: 1.5rem;">
        <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">3. Thông tin xe sở hữu</h2>
        <p><strong>Hãng sản xuất:</strong> ${vehicle.brand || ""}</p>
        <p><strong>Model:</strong> ${vehicle.model || ""}</p>
        <p><strong>Biển số đăng ký:</strong> ${vehicle.plateNo || ""}</p>
        <p><strong>Màu:</strong> ${vehicle.color || ""}</p>
        <p><strong>Dung tích pin:</strong> ${vehicle.batteryCapacity || ""} kWh</p>
      </section>

      <!-- Quyền và nghĩa vụ (Điều 1-4) -->
      <section style="margin-bottom: 1.5rem;">
        <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">A. Quyền và nghĩa vụ của các đồng sở hữu (Bên A)</h2>
        <div style="margin-top: 0.8rem; padding: 0.8rem; border: 1px solid #e0e0e0; background: #fff;">
          
          <!-- Điều 1 -->
          <p><strong>Điều 1. Quản lý quyền sở hữu & thành viên</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Mỗi thành viên phải có CCCD/CMND và Giấy phép lái xe hợp lệ trước khi được thêm vào nhóm đồng sở hữu.</p>
            <p><strong>b)</strong> Mọi thay đổi về tỷ lệ sở hữu chỉ có hiệu lực khi tất cả các thành viên ký lại e-contract.</p>
            <p><strong>c)</strong> Chỉ admin nhóm có quyền thêm, xóa hoặc điều chỉnh tỷ lệ sở hữu của các thành viên.</p>
            <p><strong>d)</strong> Nhóm tối đa 5 thành viên, trong đó tỷ lệ sở hữu tối thiểu cho mỗi thành viên là 15%.</p>
          </div>

          <!-- Điều 2 -->
          <p><strong>Điều 2. Đặt lịch & sử dụng xe</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Việc đặt xe tuân theo nguyên tắc “ai đặt trước, ưu tiên trước”.</p>
            <p><strong>b)</strong> Nếu lịch trùng, hệ thống ưu tiên theo thứ tự: tỷ lệ sở hữu, lịch sử sử dụng, thời gian đăng ký.</p>
            <p><strong>c)</strong> Mỗi thành viên được sử dụng xe tối đa 14 ngày liên tục (7 ngày dịp lễ, Tết).</p>
            <p><strong>d)</strong> Đặt lịch phải xác nhận ít nhất 2 giờ trước khi sử dụng. Hủy hoặc đến muộn quá 15 phút sẽ bị trừ tối đa 3 giờ quyền sử dụng.</p>
            <p><strong>e)</strong> Nếu trùng lịch >5 lần/tháng, giảm 50% quyền ưu tiên 30 ngày tiếp theo.</p>
          </div>

          <!-- Điều 3 -->
          <p><strong>Điều 3. Nghĩa vụ tài chính & thanh toán</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Chi phí chung được chia theo tỷ lệ sở hữu mặc định, trừ khi có thỏa thuận khác.</p>
            <p><strong>b)</strong> Thanh toán trực tuyến qua e-wallet hoặc chuyển khoản. Trễ 15 ngày bị khóa quyền đặt lịch, phạt 50.000 VNĐ/ngày.</p>
            <p><strong>c)</strong> Mọi khoản chi phí, thanh toán và vi phạm được ghi nhận tự động trên nền tảng EcoShare.</p>
          </div>

          <!-- Điều 4 -->
          <p><strong>Điều 4. Trách nhiệm bảo quản & xử lý hư hỏng</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Thành viên phải sử dụng xe đúng mục đích, tuân thủ luật giao thông và hướng dẫn kỹ thuật.</p>
            <p><strong>b)</strong> Nếu gây hư hỏng do lỗi sử dụng, chịu chi phí sửa chữa và bị phạt 500.000 VNĐ.</p>
            <p><strong>c)</strong> Nghiêm cấm cho thuê lại xe, vi phạm nghiêm trọng sẽ bị loại khỏi nhóm và tịch thu tỷ lệ sở hữu.</p>
            <p><strong>d)</strong> Báo hư hỏng/sự cố trong vòng 48 giờ để hỗ trợ và xác minh trách nhiệm.</p>
          </div>

        </div>
      </section>

      <!-- Giám sát & tranh chấp (Điều 5-6) -->
      <section style="margin-bottom: 1.5rem;">
        <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">B. Giám sát, tranh chấp & xử lý vi phạm</h2>
        <div style="margin-top: 0.8rem; padding: 0.8rem; border: 1px solid #e0e0e0; background: #fff;">
          
          <!-- Điều 5 -->
          <p><strong>Điều 5. Giám sát & ghi nhận hệ thống</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Mọi hoạt động đặt lịch, thanh toán, hủy chuyến hoặc vi phạm đều được ghi log và không thể chỉnh sửa.</p>
            <p><strong>b)</strong> Lịch sử sử dụng và hành vi vi phạm là căn cứ đánh giá quyền ưu tiên hoặc xử lý tranh chấp.</p>
          </div>

          <!-- Điều 6 -->
          <p><strong>Điều 6. Giải quyết tranh chấp</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Tranh chấp nhỏ được hòa giải qua nền tảng EcoShare với sự hỗ trợ của Staff.</p>
            <p><strong>b)</strong> Nếu không đạt thỏa thuận, EcoShare Admin đưa ra quyết định cuối cùng.</p>
            <p><strong>c)</strong> Mọi kết luận, cảnh cáo, phạt hành chính hoặc khóa quyền sử dụng đều thông báo chính thức.</p>
          </div>

        </div>
      </section>

      <!-- Hiệu lực hợp đồng (Điều 7) -->
      <section style="margin-bottom: 1.5rem;">
        <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">C. Hiệu lực hợp đồng & chấm dứt</h2>
        <div style="margin-top: 0.8rem; padding: 0.8rem; border: 1px solid #e0e0e0; background: #fff;">
          <p><strong>Điều 7. Hiệu lực và chấm dứt</strong></p>
          <div style="margin-left: 1rem; line-height: 1.6;">
            <p><strong>a)</strong> Hợp đồng có hiệu lực kể từ ngày các bên ký điện tử và có giá trị vô thời hạn.</p>
            <p><strong>b)</strong> Hợp đồng chấm dứt khi: (i) đồng thuận; (ii) vi phạm nghiêm trọng; (iii) chuyển nhượng toàn bộ quyền sở hữu.</p>
            <p><strong>c)</strong> Sau khi chấm dứt, mọi nghĩa vụ tài chính và quyền sử dụng xe phải thanh toán, xác nhận và cập nhật trên EcoShare.</p>
          </div>
        </div>
      </section>

      <!-- Xác nhận -->
      <section style="margin-top: 2rem;">
  <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;">5. Xác nhận</h2>
  <div style="display: flex; flex-wrap: wrap; gap: 2rem; margin-top: 1rem;">
  ${[ownerMember, ...coOwnerMembers]
      .map((signer: any, idx) => {
        const signerData = contracts.find(s => s.user.id === signer.users.id);
        const hasSigned = signerData?.signature;
        return `
      <div style="border: 1px solid #cfd8dc; background: #f9fafb; border-radius: 8px; padding: 1rem; text-align: center; width: 150px; display: flex;flex-direction: column; align-items: center;justify-content: center;">
        ${hasSigned ? `<img src="${stamps[signerData.id]}" alt="Dấu mộc" style="width: 80px; height: 80px; margin: 0 auto 0.5rem auto;display: block;" />` : `<div style="width: 80px; height: 80px; margin: 0 auto 0.5rem auto; display:flex; align-items:center; justify-content:center; color:#999; border:1px dashed #ccc;">Chưa ký</div>`}
        <p style="font-size: 0.875rem; font-weight: 600; margin: 0 0 0.5rem 0;">
          ${idx === 0 ? "Bên A" : "Bên B"}
        </p>
        <p style="font-size: 0.75rem; color: #555; margin: 0 0 0.25rem 0;">
          Ngày ký: ${hasSigned ? new Date(signerData.signedAt).toLocaleDateString() : "-"}
        </p>
        <p style="font-size: 0.875rem; font-weight: 500; margin: 0.25rem 0 0 0;">
          Người ký: ${signer.users.hovaTen}
        </p>
      </div>
      `;
      }).join('')}
</div>
</section>

    </div>
  `;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
async function renderContractWithStamps(container: HTMLElement, stamps: Record<string, string>) {
  const signerIds = Object.keys(stamps);
  const totalSigners = signerIds.length;

  // Giới hạn số dấu mộc tối đa trên 1 page
  const maxPerPage = 5;
  const stampSizeBase = 100; // kích thước cơ bản
  const gap = 20; // khoảng cách giữa các dấu mộc

  signerIds.forEach((id, idx) => {
    const img = document.createElement("img");
    img.src = stamps[id];

    // Giảm kích thước nếu nhiều signer
    let stampSize = stampSizeBase;
    if (totalSigners > maxPerPage) {
      stampSize = stampSizeBase - (totalSigners - maxPerPage) * 10; // giảm 10px mỗi signer vượt max
      if (stampSize < 50) stampSize = 50; // không nhỏ hơn 50px
    }

    img.style.position = "absolute";
    img.style.width = `${stampSize}px`;
    img.style.height = `${stampSize}px`;

    // Tính toán vị trí bottom
    const bottomStart = 50;
    const bottom = bottomStart + (idx % maxPerPage) * (stampSize + gap);
    img.style.bottom = `${bottom}px`;

    // Nếu có nhiều hơn maxPerPage, sang trang mới
    const pageOffset = Math.floor(idx / maxPerPage) * 297; // 297mm ~ height A4
    img.style.bottom = `${bottom + pageOffset}px`;

    img.style.right = "50px";
    container.appendChild(img);
  });
}
function createStampCanvas(hash: string, size: number = 80): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không lấy được context canvas");

  // 1. Vẽ vòng tròn đỏ
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 5, 0, 2 * Math.PI);
  ctx.fill();

  // 2. Vẽ chữ hash trắng bên trong
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `${size / 10}px sans-serif`; // font tỉ lệ với canvas
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(hash.slice(0, 8), size / 2, size / 2); // chỉ lấy 8 ký tự đầu

  // 3. Optional: vẽ các vòng tròn nhỏ làm họa tiết
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 15, 0, 2 * Math.PI);
  ctx.stroke();

  return canvas;
}
export default function Contracts() {
  const [contractData, setContractData] = useState(null);
  const [contractHtmlBE, setContractHtmlBE] = useState<string>("");
  const [contractSigners, setContractSigners] = useState<ContractSigner[]>([]);
  const [stamps, setStamps] = useState<Record<string, string>>({}); // { signerId: base64 image }
  const [loadingContract, setLoadingContract] = useState<boolean>(true);
  const [errorContract, setErrorContract] = useState<string>("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const PREVIEW_PATH = import.meta.env.VITE_CONTRACT_PREVIEW_PATH;
  const ALL_CONTRACTS = import.meta.env.VITE_GET_ALL_CONTRACTS;
  const fetchContractFromBE = async (contractId: string) => {
    setLoadingContract(true);
    setErrorContract("");

    try {
      const res = await axiosClient.get(PREVIEW_PATH, { params: { contractId } });

      const newStamps: Record<string, string> = {};
      await Promise.all(res.data.contracts.map(async (signer) => {
        if (!signer.signature) return;
        const hash = await sha256(signer.signature + res.data.contractHtml);
        const canvas = createStampCanvas(hash);
        newStamps[signer.id] = canvas.toDataURL("image/png");
      }));

      const htmlString = generateContractHTML({
        ownerMember: res.data.ownerMember,
        coOwnerMembers: res.data.coOwnerMembers,
        vehicle: res.data.vehicle,
        contracts: res.data.contracts
      }, newStamps);

      // Set state
      setContractData(res.data);
      setContractSigners(res.data.contracts);
      setStamps(newStamps);
      setContractHtmlBE(htmlString);

      // **Trả về kết quả để dùng ngay**
      return { htmlString, stamps: newStamps };
    } catch (err: any) {
      console.error("Lỗi khi lấy contract từ BE:", err);
      setErrorContract(err?.response?.data?.message || "Không lấy được contract");
      return null;
    } finally {
      setLoadingContract(false);
    }
  };
  const viewContractInNewTab = async (contractId: string) => {
    const result = await fetchContractFromBE(contractId);
    if (!result) return;

    // Tạo container PDF
    const container = document.createElement("div");
    container.innerHTML = result.htmlString;
    container.style.position = "relative";
    const pdfBlob = await html2pdf()
      .from(container)
      .set({
        margin: 10,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .outputPdf("blob");

    // Mở PDF ở tab mới
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };
  const downloadContract = async (contractId: string) => {
    try {
      // 1️⃣ Lấy HTML và dữ liệu dấu mộc từ backend
      const result = await fetchContractFromBE(contractId);
      if (!result) return;

      // 2️⃣ Tạo container tạm (không append vào DOM để không hiển thị preview)
      const container = document.createElement("div");
      container.innerHTML = result.htmlString;
      container.style.position = "relative";
      container.style.width = "800px";
      container.style.padding = "10px";
      // 4️⃣ Tạo PDF và download trực tiếp
      await html2pdf()
        .from(container as any) // ép kiểu cho TS
        .set({
          filename: `HopDong_${contractId}.pdf`,
          margin: 10,
          html2canvas: { scale: 2 }, // tăng scale để nét hơn
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save(); // 🔹 chỉ download, không append vào DOM
    } catch (err) {
      console.error("Tải hợp đồng thất bại", err);
    }
  };

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axiosClient.get(ALL_CONTRACTS);

        // Nếu backend không trả về hoặc trả rỗng thì set mảng trống
        if (!res || !res.data || !Array.isArray(res.data)) {
          setContracts([]);
        } else {
          setContracts(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải hợp đồng:", error);
        setContracts([]); // Đảm bảo vẫn có giao diện
      }
    };

    fetchContracts();
  }, []);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "default";
      case "DECLINED": return "destructive";
      case "PENDING_REVIEW": return "secondary";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "Hiệu lực";
      case "DECLINED": return "Hết hạn";
      case "PENDING_REVIEW": return "Chờ ký";
      default: return "Không xác định";
    }
  };

  // Filter contracts based on search term
  const filteredContracts = contracts.filter((contract) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      contract.vehicleName?.toLowerCase().includes(searchLower) ||
      contract.contractId?.toString().includes(searchTerm)
    );
  });
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-white p-4 shadow-glow">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/co-owner/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Quản lý hợp đồng</h1>
                <p className="text-sm opacity-90">Xem và tải xuống tất cả hợp đồng đồng sở hữu</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto p-6 space-y-6">
        <Card className="shadow-elegant w-full max-w-sm">
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>{contracts.length}</CardTitle>
            <CardDescription>Tổng số hợp đồng</CardDescription>
          </CardHeader>
        </Card>

        {/* Contracts List */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Danh sách hợp đồng</CardTitle>
            <CardDescription>
              Tất cả hợp đồng đồng sở hữu mà bạn đã tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên xe hoặc mã hợp đồng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <div
                    key={contract.contractId}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      {/* Thông tin bên trái */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Hợp đồng - {contract.vehicleName}
                          </h3>
                          <Badge variant={getStatusColor(contract.status)}>
                            {getStatusText(contract.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Ngày ký: {contract.signedAt}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Sở hữu: {contract.ownership}%</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Xe: {contract.vehicleName}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">Mã hợp đồng:</span>{" "}
                          {contract.contractId}
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          className="flex items-center space-x-2"
                          onClick={() => downloadContract(contract.contractId)}
                        >
                          <Download className="h-4 w-4" />
                          <span>Tải xuống</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => viewContractInNewTab(contract.contractId)}
                        >
                          Xem hợp đồng
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm.trim() ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy hợp đồng nào phù hợp với "{searchTerm}".</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-4"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không có hợp đồng nào.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}