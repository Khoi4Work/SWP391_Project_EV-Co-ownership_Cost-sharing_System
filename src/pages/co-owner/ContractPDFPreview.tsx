import { useEffect, useRef, useState } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  // 🖋 Xử lý vẽ chữ ký
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startDrawing = () => setIsDrawing(true);
    const stopDrawing = () => {
      setIsDrawing(false);
      ctx.beginPath();
    };

    const draw = (event: MouseEvent) => {
      if (!isDrawing) return;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mousemove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mousemove", draw);
    };
  }, [isDrawing]);

  // 🧹 Xóa chữ ký
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSavedSignature(null);
  };

  // 💾 Lưu chữ ký
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    setSavedSignature(dataURL);
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
          THỎA THUẬN ĐỒNG SỞ HỮU XE
        </h1>
      </div>
      <hr style={{ marginBottom: "1.5rem", borderColor: "#999" }} />
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          Bên A - EcoShare Platform
        </h2>
        <p><strong>Tên đơn vị:</strong> EcoShare Platform</p>
        <p><strong>Email:</strong> support@ecoshare.vn</p>
        <p><strong>Người đại diện:</strong> Nguyễn Đình Nguyên Khôi (trưởng nhóm) </p>
        <p><strong>Địa chỉ trụ sở:</strong> Đại Học FPT cơ sở TPHCM </p>
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Phạm vi trách nhiệm chính của nền tảng:</strong></p>

          <div style={{ marginLeft: "1rem", lineHeight: "1.7" }}>
            <p><strong>1. Cung cấp hệ thống quản lý đồng sở hữu:</strong><br />
              - Xây dựng, cung cấp và đảm bảo nền tảng hoạt động ổn định để các bên đồng sở hữu quản lý thông tin phương
              tiện, tỷ lệ sở hữu và quyền lợi, nghĩa vụ liên quan. <br />
              - Thực hiện bảo trì kỹ thuật, cập nhật hệ thống và xử lý lỗi (nếu phát sinh) nhằm đảm bảo khả năng truy cập
              và sử dụng liên tục.
            </p>

            <p><strong>2. Lưu trữ thông tin và xác thực thành viên:</strong><br />
              - Thu thập, xác minh và lưu trữ thông tin của các đồng sở hữu theo đúng quy trình đã công bố. <br />
              - Đảm bảo dữ liệu được ghi nhận chính xác, có thể truy xuất khi cần thiết, phục vụ mục đích chứng thực thỏa
              thuận giữa các bên.
            </p>

            <p><strong>3. Trung gian hỗ trợ giải quyết tranh chấp:</strong><br />
              - Trong trường hợp giữa các đồng sở hữu xuất hiện mâu thuẫn, Bên B có trách nhiệm cung cấp thông tin lưu
              trữ,
              hỗ trợ kết nối và tạo điều kiện để các bên tự thương lượng, hòa giải. <br />
              - Bên B không đại diện pháp lý cho bất kỳ bên nào, trừ khi có thỏa thuận riêng bằng văn bản.
            </p>

            <p><strong>4. Bảo mật dữ liệu người dùng:</strong><br />
              - Thực hiện các biện pháp quản lý, mã hóa và bảo mật theo quy định pháp luật để bảo vệ thông tin cá nhân,
              hợp đồng và dữ liệu giao dịch của các bên. <br />
              - Không tiết lộ, chia sẻ hoặc cung cấp dữ liệu cho bên thứ ba, trừ khi có sự đồng ý của các đồng sở hữu hoặc
              yêu cầu từ cơ quan nhà nước có thẩm quyền.
            </p>

            <p><strong>5. Cung cấp dịch vụ hỗ trợ liên quan đến phương tiện:</strong><br />
              - Tạo điều kiện để các đồng sở hữu tiếp cận và sử dụng các dịch vụ kèm theo phương tiện như: bảo dưỡng, sửa
              chữa, bảo hiểm, đăng kiểm, gia hạn giấy tờ, hoặc các tiện ích vận hành khác (nếu có hợp tác với đơn vị thứ
              ba). <br />

              - Hỗ trợ kết nối với các đối tác dịch vụ phù hợp, trên nguyên tắc minh bạch về chi phí, quyền lợi và trách
              nhiệm giữa các bên. <br />

              - Việc sử dụng các dịch vụ này là tùy chọn, trừ khi có thỏa thuận riêng được tất cả đồng sở hữu thông qua.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          Bên B - Các đồng sở hữu
        </h2>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#fff",
            padding: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          <p><strong>Đồng sở hữu chính:</strong> {ownerInfo.name}</p>
          <p><strong>Email:</strong> {ownerInfo.email}</p>
          <p><strong>CCCD:</strong> {ownerInfo.idNumber}</p>
          <p><strong>Tỷ lệ sở hữu:</strong> {ownerInfo.ownership}%</p>
        </div>

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

      {/* Thông tin xe */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          3. Thông tin xe sở hữu
        </h2>

        <p><strong>Loại phương tiện:</strong> {vehicleData.vehicleType}</p>
        <p><strong>Hãng sản xuất:</strong> {vehicleData.brand}</p>
        <p><strong>Model:</strong> {vehicleData.model}</p>
        <p><strong>Biển số đăng ký:</strong> {vehicleData.plateNo}</p>
        <p><strong>Màu sắc:</strong> {vehicleData.color}</p>
        <p><strong>Dung tích pin:</strong> {vehicleData.batteryCapacity} kWh</p>
      </section>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          A. Quyền và nghĩa vụ của các đồng sở hữu (Bên A)
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 1. Quyền sử dụng phương tiện</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Mỗi đồng sở hữu có quyền sử dụng phương tiện phù hợp với tỷ lệ sở hữu và/hoặc theo thỏa thuận nội bộ giữa các đồng sở hữu.</p>
            <p><strong>b)</strong> Việc sử dụng phương tiện phải được đăng ký/đặt lịch (qua ứng dụng hoặc công cụ quản lý do Bên B cung cấp) nếu có quy định về lịch dùng. Trường hợp xung đột lịch, ưu tiên giải quyết theo thứ tự: (i) thỏa thuận trước đó; (ii) quyền ưu tiên do các bên quy định; (iii) nếu không có thỏa thuận thì ưu tiên bên sở hữu tỷ lệ cao hơn.</p>
            <p><strong>c)</strong> Các giới hạn sử dụng (nếu có) — ví dụ: khu vực vận hành, số km tối đa trong một khoảng thời gian, thời gian sử dụng liên tục — phải được thống nhất bằng văn bản giữa các đồng sở hữu và được lưu trữ trên nền tảng của Bên B.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 2. Nghĩa vụ tài chính</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Mọi chi phí liên quan đến xe (bao gồm nhưng không giới hạn: bảo hiểm, đăng kiểm, bảo dưỡng định kỳ, sửa chữa phát sinh, phí sạc/điện, thuế và các lệ phí khác) được chia theo tỷ lệ sở hữu trừ khi có thỏa thuận khác bằng văn bản.</p>
            <p><strong>b)</strong> Thời hạn thanh toán cho các chi phí định kỳ phải tuân theo lịch thanh toán do các bên thống nhất; mỗi bên có trách nhiệm nộp phần của mình trước hạn. Trễ hạn sẽ chịu lãi/chi phí phạt theo mức đã thỏa thuận hoặc theo quy định tại Điều khoản phạt trong hợp đồng này.</p>
            <p><strong>c)</strong> Trường hợp một đồng sở hữu không thực hiện nghĩa vụ tài chính (không thanh toán phần của mình) quá <em>30 ngày</em> kể từ ngày đến hạn, các bên sẽ áp dụng biện pháp tạm thời: yêu cầu trả góp, phong tỏa quyền sử dụng tương ứng hoặc khởi động quy trình xử lý theo Điều về xử lý vi phạm và rút khỏi hợp đồng.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 3. Bảo quản & trách nhiệm khi gây hư hỏng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Mỗi đồng sở hữu có trách nhiệm sử dụng và bảo quản phương tiện một cách cẩn trọng, tuân thủ hướng dẫn sử dụng của nhà sản xuất và các quy định giao thông hiện hành.</p>
            <p><strong>b)</strong> Khi có hư hỏng, tai nạn hoặc tổn thất phát sinh trong quá trình sử dụng, người sử dụng có trách nhiệm thông báo ngay cho các đồng sở hữu còn lại và Bên B, cung cấp thông tin, hình ảnh, biên bản (nếu có) trong vòng <em>48 giờ</em>.</p>
            <p><strong>c)</strong> Chi phí sửa chữa do lỗi, sơ suất hoặc vi phạm của người sử dụng sẽ do người đó chịu trách nhiệm thanh toán. Trường hợp phát sinh tranh chấp về nguyên nhân gây hư hỏng, ưu tiên xử lý qua bảo hiểm (nếu có) và sau đó phân chia phần chi phí không được bảo hiểm theo tỷ lệ lỗi/thiệt hại được xác định hoặc theo thỏa thuận chung.</p>
            <p><strong>d)</strong> Không được tự ý thay đổi kết cấu, hệ thống an toàn hoặc phần cốt lõi của phương tiện mà không có sự đồng ý bằng văn bản của tất cả các đồng sở hữu.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 4. Cơ chế ra quyết định</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Các quyết định thông thường (ví dụ: lịch sử dụng hàng ngày, bảo dưỡng định kỳ thông thường) được thông qua khi đạt <strong>đa số theo tỷ lệ sở hữu</strong> (tổng tỷ lệ thuộc về các bên đồng ý lớn hơn 50%).</p>
            <p><strong>b)</strong> Các quyết định quan trọng (ví dụ: bán hoặc chuyển nhượng toàn bộ phương tiện, thay đổi tỷ lệ sở hữu, thế chấp xe, sửa đổi điều khoản quan trọng của hợp đồng) phải được <strong>đồng thuận tối thiểu X%</strong> của tổng tỷ lệ sở hữu — (gợi ý: 75% hoặc 100% — phần trăm cụ thể cần được các bên thống nhất và ghi vào hợp đồng cuối cùng).</p>
            <p><strong>c)</strong> Người đại diện kỹ thuật để làm việc với bên thứ ba (như đơn vị bảo dưỡng, cơ quan đăng ký, nhà cung cấp bảo hiểm) mặc định là <em>Đồng sở hữu chính</em> trừ khi các bên chỉ định khác bằng văn bản.</p>
            <p><strong>d)</strong> Mọi quyết định phải được ghi nhận bằng văn bản (qua nền tảng của Bên B hoặc văn bản có chữ ký) và có giá trị ràng buộc đối với các bên.</p>
          </div>
        </div>
      </section>

      {/* --- B. Quy định tài chính & phân chia chi phí --- */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          B. Quy định tài chính & phân chia chi phí
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 5. Chi phí mua phương tiện</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Tổng chi phí mua phương tiện sẽ được chia theo tỷ lệ sở hữu đã thỏa thuận. Các đồng sở hữu phải nộp phần góp của mình theo thời hạn đã thống nhất.</p>
            <p><strong>b)</strong> Trường hợp có thay đổi giá mua (tăng/giảm do phí phụ, thuế, hoặc chi phí đăng ký), phần chênh lệch sẽ được phân chia theo tỷ lệ sở hữu tương ứng.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 6. Chi phí định kỳ và vận hành</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Chi phí định kỳ liên quan đến phương tiện (bảo dưỡng, bảo hiểm, thuế, phí sạc/điện) sẽ được phân chia theo tỷ lệ sở hữu trừ khi có thỏa thuận khác.</p>
            <p><strong>b)</strong> Mỗi đồng sở hữu có trách nhiệm nộp phần của mình trước hạn thanh toán quy định. Việc nộp chậm sẽ chịu lãi/chi phí phạt theo thỏa thuận hoặc quy định tại Điều 2.</p>
            <p><strong>c)</strong> Bên B có quyền thông báo định kỳ về các khoản phí và tổng hợp tình trạng thanh toán của từng đồng sở hữu.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 7. Cách thanh toán và xử lý vi phạm</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Thanh toán có thể thực hiện qua chuyển khoản ngân hàng, ví điện tử hoặc hệ thống thanh toán do Bên B cung cấp.</p>
            <p><strong>b)</strong> Trường hợp một đồng sở hữu không thực hiện nghĩa vụ thanh toán đúng hạn, các đồng sở hữu còn lại và Bên B sẽ áp dụng các biện pháp sau:</p>
            <ul style={{ marginLeft: "1.5rem" }}>
              <li>Yêu cầu thanh toán ngay phần chưa nộp;</li>
              <li>Hạn chế quyền sử dụng phương tiện tương ứng;</li>
              <li>Kích hoạt quy trình xử lý theo Điều 4 phần A (cơ chế ra quyết định) hoặc Điều về xử lý tranh chấp.</li>
            </ul>
            <p><strong>c)</strong> Mọi khoản thanh toán và vi phạm sẽ được ghi nhận trên nền tảng quản lý của Bên B để làm bằng chứng và tham chiếu trong hợp đồng.</p>
          </div>
        </div>
      </section>

      {/* --- C. Cơ chế xử lý tranh chấp & sửa đổi hợp đồng --- */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          C. Cơ chế xử lý tranh chấp & sửa đổi hợp đồng
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 8. Xử lý tranh chấp</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Mọi tranh chấp phát sinh giữa các đồng sở hữu liên quan đến quyền sử dụng, chi phí, bảo quản hoặc các nghĩa vụ khác sẽ được giải quyết ưu tiên thông qua thương lượng và hòa giải nội bộ.</p>
            <p><strong>b)</strong> Trong trường hợp không đạt được thỏa thuận, Bên B (EcoShare Platform) có thể đóng vai trò trung gian hỗ trợ giải quyết tranh chấp bằng việc cung cấp tư vấn, ghi nhận bằng chứng, hoặc đề xuất phương án phân chia hợp lý dựa trên tỷ lệ sở hữu và các quy định hợp đồng.</p>
            <p><strong>c)</strong> Nếu tranh chấp vẫn không được giải quyết sau quá trình trung gian, các bên có quyền đưa vụ việc ra tòa án hoặc trọng tài theo thỏa thuận chung đã ghi trong hợp đồng.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 9. Sửa đổi hợp đồng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Mọi sửa đổi, bổ sung hợp đồng phải được lập thành văn bản, được ký bởi tất cả các đồng sở hữu hoặc thông qua nền tảng của Bên B có xác nhận đồng thuận của các bên.</p>
            <p><strong>b)</strong> Việc thay đổi tỷ lệ sở hữu, quyền lợi, nghĩa vụ, hoặc điều kiện quan trọng khác phải được đồng thuận tối thiểu <strong>75% tỷ lệ sở hữu</strong> trừ khi hợp đồng có quy định khác.</p>
            <p><strong>c)</strong> Bất kỳ sửa đổi nào không tuân thủ quy trình này sẽ không có giá trị pháp lý và không ràng buộc các bên.</p>
          </div>
        </div>
      </section>

      {/* --- D. Thời hạn hợp đồng & chấm dứt --- */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          D. Thời hạn hợp đồng & chấm dứt
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 10. Thời hạn hợp đồng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Hợp đồng này có hiệu lực kể từ ngày ký kết và có thời hạn <em>vô thời hạn</em> trừ khi các bên thỏa thuận khác bằng văn bản.</p>
            <p><strong>b)</strong> Các bên có thể xem xét định kỳ và cập nhật thỏa thuận về quyền sử dụng, chi phí và các điều kiện khác thông qua quá trình sửa đổi hợp đồng (Điều 9).</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 11. Chấm dứt hợp đồng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: "1.6" }}>
            <p><strong>a)</strong> Hợp đồng có thể chấm dứt trong các trường hợp sau:</p>
            <ul style={{ marginLeft: "1.5rem" }}>
              <li>Tất cả các đồng sở hữu đồng thuận chấm dứt;</li>
              <li>Một bên vi phạm nghĩa vụ nghiêm trọng và không khắc phục trong thời hạn quy định;</li>
              <li>Chuyển nhượng toàn bộ hoặc một phần phương tiện cho bên thứ ba;</li>
              <li>Mất năng lực pháp lý của một đồng sở hữu theo quy định pháp luật.</li>
            </ul>
            <p><strong>b)</strong> Quy trình chấm dứt: thông báo bằng văn bản, thanh toán đầy đủ các khoản chi phí còn tồn đọng, xác nhận quyền sở hữu và bàn giao phương tiện theo thỏa thuận.</p>
            <p><strong>c)</strong> Sau khi chấm dứt hợp đồng, quyền sở hữu, trách nhiệm và các nghĩa vụ tài chính sẽ được kết thúc hoặc điều chỉnh theo thỏa thuận riêng giữa các bên.</p>
          </div>
        </div>
      </section>
      {/* Xác nhận */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          4. Xác nhận
        </h2>
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
      {status === 1 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
            5. Xác nhận chữ ký điện tử
          </h3>
          <p>Vui lòng ký xác nhận vào ô bên dưới để hoàn tất hợp đồng:</p>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              style={{
                border: "1px solid #aaa",
                borderRadius: "4px",
                backgroundColor: "#fff",
              }}
            ></canvas>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={clearSignature} style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}>
                Xóa
              </button>
              <button onClick={saveSignature} style={{ padding: "0.5rem 1rem" }}>
                Lưu chữ ký
              </button>
            </div>
          </div>

          {savedSignature && (
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <p><strong>Chữ ký đã xác nhận:</strong></p>
              <img
                src={savedSignature}
                alt="Chữ ký đã lưu"
                style={{
                  border: "1px solid #ccc",
                  maxWidth: "300px",
                  display: "block",
                  margin: "1rem auto",
                }}
              />
              <p><em>Người ký: {ownerInfo.name}</em></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
