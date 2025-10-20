import React, { useState } from "react";

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
}

const ContractView: React.FC<ContractViewProps> = ({
  ownerInfo,
  coOwners,
  vehicleData,
  status,
  setStatus,
  onSavePrivateKey,
}) => {
  // agreement: 1 = đồng ý, 0 = không
  const [privateKey, setPrivateKey] = useState<string>("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const handleClear = () => {
    setPrivateKey("");
    setSavedKey(null);
  };

  const handleSave = () => {
    const trimmed = privateKey.trim();
    if (!trimmed) {
      alert("Vui lòng nhập hoặc dán private key trước khi lưu.");
      return;
    }

    // ví dụ: trigger lưu lên parent nếu được truyền callback
    if (onSavePrivateKey) {
      try {
        onSavePrivateKey(trimmed);
      } catch (err) {
        // ignore
      }
    }

    setSaving(true);
    // mô phỏng feedback
    setTimeout(() => {
      setSavedKey(trimmed);
      setSaving(false);
    }, 400);
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

      {/* 1. Bên A */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          1. Bên A - Các đồng sở hữu
        </h2>

        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>Đồng sở hữu chính:</strong> {ownerInfo?.name || ""}
          </p>
          {ownerInfo?.email && (
            <p>
              <strong>Email:</strong> {ownerInfo.email}
            </p>
          )}
          {ownerInfo?.idNumber && (
            <p>
              <strong>CCCD:</strong> {ownerInfo.idNumber}
            </p>
          )}
          {typeof ownerInfo?.ownership !== "undefined" && (
            <p>
              <strong>Tỷ lệ sở hữu:</strong> {ownerInfo.ownership}%
            </p>
          )}
        </div>

        {coOwners && coOwners.length > 0 ? (
          <>
            <p>
              <strong>CÁC ĐỒNG SỞ HỮU KHÁC:</strong>
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                paddingLeft: 0,
              }}
            >
              {coOwners.map((co, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "0.8rem",
                    backgroundColor: "#fff",
                  }}
                >
                  <p>
                    <strong>Tên đồng sở hữu:</strong> {co.name}
                  </p>
                  {co.email && (
                    <p>
                      <strong>Email:</strong> {co.email}
                    </p>
                  )}
                  {co.idNumber && (
                    <p>
                      <strong>CCCD:</strong> {co.idNumber}
                    </p>
                  )}
                  {typeof co.ownership !== "undefined" && (
                    <p>
                      <strong>Tỷ lệ sở hữu:</strong> {co.ownership}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Không có đồng sở hữu khác</p>
        )}
      </section>

      {/* 2. Bên B */}
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
          <strong>Người đại diện:</strong> Nguyễn Đình Nguyên Khôi (trưởng nhóm)
        </p>
        <p>
          <strong>Địa chỉ trụ sở:</strong> Đại Học FPT cơ sở TPHCM
        </p>
      </section>

      {/* 3. Thông tin xe */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          3. Thông tin xe sở hữu
        </h2>

        {vehicleData?.vehicleType && (
          <p>
            <strong>Loại phương tiện:</strong> {vehicleData.vehicleType}
          </p>
        )}
        {vehicleData?.brand && (
          <p>
            <strong>Hãng sản xuất:</strong> {vehicleData.brand}
          </p>
        )}
        {vehicleData?.model && (
          <p>
            <strong>Model:</strong> {vehicleData.model}
          </p>
        )}
        {vehicleData?.plateNo && (
          <p>
            <strong>Biển số đăng ký:</strong> {vehicleData.plateNo}
          </p>
        )}
        {vehicleData?.color && (
          <p>
            <strong>Màu sắc:</strong> {vehicleData.color}
          </p>
        )}
        {typeof vehicleData?.batteryCapacity !== "undefined" && (
          <p>
            <strong>Dung tích pin:</strong> {vehicleData.batteryCapacity} kWh
          </p>
        )}
      </section>

      {/* (Các điều khoản dài...) */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          4. Chính sách và nghĩa vụ các bên liên quan
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          {/* Điều 1 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 1. Quyền sử dụng phương tiện</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Mỗi đồng sở hữu có quyền sử dụng phương tiện phù hợp với tỷ lệ sở hữu và/hoặc theo thỏa thuận nội bộ giữa các đồng sở hữu.</p>
            <p><strong>b)</strong> Việc sử dụng phương tiện phải được đăng ký/đặt lịch (qua ứng dụng hoặc công cụ quản lý do Bên B cung cấp) nếu có quy định về lịch dùng. Trường hợp xung đột lịch, ưu tiên giải quyết theo thứ tự: (i) thỏa thuận trước đó; (ii) quyền ưu tiên do các bên quy định; (iii) nếu không có thỏa thuận thì ưu tiên bên sở hữu tỷ lệ cao hơn.</p>
            <p><strong>c)</strong> Các giới hạn sử dụng (nếu có) — ví dụ: khu vực vận hành, số km tối đa trong một khoảng thời gian, thời gian sử dụng liên tục — phải được thống nhất bằng văn bản giữa các đồng sở hữu và được lưu trữ trên nền tảng của Bên B.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 2 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 2. Nghĩa vụ tài chính</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Mọi chi phí liên quan đến xe (bao gồm nhưng không giới hạn: bảo hiểm, đăng kiểm, bảo dưỡng định kỳ, sửa chữa phát sinh, phí sạc/điện, thuế và các lệ phí khác) được chia theo tỷ lệ sở hữu trừ khi có thỏa thuận khác bằng văn bản.</p>
            <p><strong>b)</strong> Thời hạn thanh toán cho các chi phí định kỳ phải tuân theo lịch thanh toán do các bên thống nhất; mỗi bên có trách nhiệm nộp phần của mình trước hạn. Trễ hạn sẽ chịu lãi/chi phí phạt theo mức đã thỏa thuận hoặc theo quy định tại Điều khoản phạt trong hợp đồng này.</p>
            <p><strong>c)</strong> Trường hợp một đồng sở hữu không thực hiện nghĩa vụ tài chính (không thanh toán phần của mình) quá <em>30 ngày</em> kể từ ngày đến hạn, các bên sẽ áp dụng biện pháp tạm thời: yêu cầu trả góp, phong tỏa quyền sử dụng tương ứng hoặc khởi động quy trình xử lý theo Điều về xử lý vi phạm và rút khỏi hợp đồng.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 3 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 3. Bảo quản & trách nhiệm khi gây hư hỏng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Mỗi đồng sở hữu có trách nhiệm sử dụng và bảo quản phương tiện một cách cẩn trọng, tuân thủ hướng dẫn sử dụng của nhà sản xuất và các quy định giao thông hiện hành.</p>
            <p><strong>b)</strong> Khi có hư hỏng, tai nạn hoặc tổn thất phát sinh trong quá trình sử dụng, người sử dụng có trách nhiệm thông báo ngay cho các đồng sở hữu còn lại và Bên B, cung cấp thông tin, hình ảnh, biên bản (nếu có) trong vòng <em>48 giờ</em>.</p>
            <p><strong>c)</strong> Chi phí sửa chữa do lỗi, sơ suất hoặc vi phạm của người sử dụng sẽ do người đó chịu trách nhiệm thanh toán. Trường hợp phát sinh tranh chấp về nguyên nhân gây hư hỏng, ưu tiên xử lý qua bảo hiểm (nếu có) và sau đó phân chia phần chi phí không được bảo hiểm theo tỷ lệ lỗi/thiệt hại được xác định hoặc theo thỏa thuận chung.</p>
            <p><strong>d)</strong> Không được tự ý thay đổi kết cấu, hệ thống an toàn hoặc phần cốt lõi của phương tiện mà không có sự đồng ý bằng văn bản của tất cả các đồng sở hữu.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 4 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 4. Cơ chế ra quyết định</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Các quyết định thông thường (ví dụ: lịch sử dụng hàng ngày, bảo dưỡng định kỳ thông thường) được thông qua khi đạt <strong>đa số theo tỷ lệ sở hữu</strong> (tổng tỷ lệ thuộc về các bên đồng ý lớn hơn 50%).</p>
            <p><strong>b)</strong> Các quyết định quan trọng (ví dụ: bán hoặc chuyển nhượng toàn bộ phương tiện, thay đổi tỷ lệ sở hữu, thế chấp xe, sửa đổi điều khoản quan trọng của hợp đồng) phải được <strong>đồng thuận tối thiểu X%</strong> của tổng tỷ lệ sở hữu — (gợi ý: 75% hoặc 100% — phần trăm cụ thể cần được các bên thống nhất và ghi vào hợp đồng cuối cùng).</p>
            <p><strong>c)</strong> Người đại diện kỹ thuật để làm việc với bên thứ ba (như đơn vị bảo dưỡng, cơ quan đăng ký, nhà cung cấp bảo hiểm) mặc định là <em>Đồng sở hữu chính</em> trừ khi các bên chỉ định khác bằng văn bản.</p>
            <p><strong>d)</strong> Mọi quyết định phải được ghi nhận bằng văn bản (qua nền tảng của Bên B hoặc văn bản có chữ ký) và có giá trị ràng buộc đối với các bên.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          B. Quy định tài chính & phân chia chi phí
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          {/* Điều 5 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 5. Chi phí mua phương tiện</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Tổng chi phí mua phương tiện sẽ được chia theo tỷ lệ sở hữu đã thỏa thuận. Các đồng sở hữu phải nộp phần góp của mình theo thời hạn đã thống nhất.</p>
            <p><strong>b)</strong> Trường hợp có thay đổi giá mua (tăng/giảm do phí phụ, thuế, hoặc chi phí đăng ký), phần chênh lệch sẽ được phân chia theo tỷ lệ sở hữu tương ứng.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 6 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 6. Chi phí định kỳ và vận hành</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Chi phí định kỳ liên quan đến phương tiện (bảo dưỡng, bảo hiểm, thuế, phí sạc/điện) sẽ được phân chia theo tỷ lệ sở hữu trừ khi có thỏa thuận khác.</p>
            <p><strong>b)</strong> Mỗi đồng sở hữu có trách nhiệm nộp phần của mình trước hạn thanh toán quy định. Việc nộp chậm sẽ chịu lãi/chi phí phạt theo thỏa thuận hoặc quy định tại Điều 2.</p>
            <p><strong>c)</strong> Bên B có quyền thông báo định kỳ về các khoản phí và tổng hợp tình trạng thanh toán của từng đồng sở hữu.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 7 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 7. Cách thanh toán và xử lý vi phạm</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Thanh toán có thể thực hiện qua chuyển khoản ngân hàng, ví điện tử hoặc hệ thống thanh toán do Bên B cung cấp.</p>
            <p><strong>b)</strong> Trường hợp một đồng sở hữu không thực hiện nghĩa vụ thanh toán đúng hạn, các đồng sở hữu còn lại và Bên B sẽ áp dụng các biện pháp sau:</p>
            <ul>
              <li>Yêu cầu thanh toán ngay phần chưa nộp;</li>
              <li>Hạn chế quyền sử dụng phương tiện tương ứng;</li>
              <li>Kích hoạt quy trình xử lý theo Điều 4 phần A (cơ chế ra quyết định) hoặc Điều về xử lý tranh chấp.</li>
            </ul>
            <p><strong>c)</strong> Mọi khoản thanh toán và vi phạm sẽ được ghi nhận trên nền tảng quản lý của Bên B để làm bằng chứng và tham chiếu trong hợp đồng.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          C. Cơ chế xử lý tranh chấp & sửa đổi hợp đồng
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          {/* Điều 8 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 8. Xử lý tranh chấp</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Mọi tranh chấp phát sinh giữa các đồng sở hữu liên quan đến quyền sử dụng, chi phí, bảo quản hoặc các nghĩa vụ khác sẽ được giải quyết ưu tiên thông qua thương lượng và hòa giải nội bộ.</p>
            <p><strong>b)</strong> Trong trường hợp không đạt được thỏa thuận, Bên B (EcoShare Platform) có thể đóng vai trò trung gian hỗ trợ giải quyết tranh chấp bằng việc cung cấp tư vấn, ghi nhận bằng chứng, hoặc đề xuất phương án phân chia hợp lý dựa trên tỷ lệ sở hữu và các quy định hợp đồng.</p>
            <p><strong>c)</strong> Nếu tranh chấp vẫn không được giải quyết sau quá trình trung gian, các bên có quyền đưa vụ việc ra tòa án hoặc trọng tài theo thỏa thuận chung đã ghi trong hợp đồng.</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 9 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 9. Sửa đổi hợp đồng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Mọi sửa đổi, bổ sung hợp đồng phải được lập thành văn bản, được ký bởi tất cả các đồng sở hữu hoặc thông qua nền tảng của Bên B có xác nhận đồng thuận của các bên.</p>
            <p><strong>b)</strong> Việc thay đổi tỷ lệ sở hữu, quyền lợi, nghĩa vụ, hoặc điều kiện quan trọng khác phải được đồng thuận tối thiểu <strong>75% tỷ lệ sở hữu</strong> trừ khi hợp đồng có quy định khác.</p>
            <p><strong>c)</strong> Bất kỳ sửa đổi nào không tuân thủ quy trình này sẽ không có giá trị pháp lý và không ràng buộc các bên.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          D. Thời hạn hợp đồng & chấm dứt
        </h2>

        <div style={{ marginTop: "0.8rem", padding: "0.8rem", border: "1px solid #e0e0e0", background: "#fff" }}>
          {/* Điều 10 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 10. Thời hạn hợp đồng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Hợp đồng này có hiệu lực kể từ ngày ký kết và có thời hạn <em>vô thời hạn</em> trừ khi các bên thỏa thuận khác bằng văn bản.</p>
            <p><strong>b)</strong> Các bên có thể xem xét định kỳ và cập nhật thỏa thuận về quyền sử dụng, chi phí và các điều kiện khác thông qua quá trình sửa đổi hợp đồng (Điều 9).</p>
          </div>

          <hr style={{ margin: "0.8rem 0", borderColor: "#eee" }} />

          {/* Điều 11 */}
          <p style={{ margin: "0 0 0.6rem 0" }}><strong>Điều 11. Chấm dứt hợp đồng</strong></p>
          <div style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
            <p><strong>a)</strong> Hợp đồng có thể chấm dứt trong các trường hợp sau:</p>
            <ul>
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



      {/* Xác nhận section */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
          5. Xác nhận
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
            onChange={() => {
              setStatus(0);
              // xóa phần private key khi không đồng ý
              setPrivateKey("");
              setSavedKey(null);
            }}
            style={{ marginRight: "0.5rem" }}
          />
          Không đồng ý
        </label>

        <p style={{ marginTop: "1.5rem", fontStyle: "italic", fontSize: "0.9rem", color: "#555" }}>
          Lưu ý: Khi tick "Đồng ý", bạn đồng ý với tất cả các điều khoản nêu trong hợp đồng này.
        </p>

        {/* Private key area: chỉ hiện khi user Đồng ý */}
        {status === 1 && (
          <div id="signatureSection" style={{ marginTop: "2rem" }}>
            <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.3rem" }}>
              Xác nhận bằng Private Key
            </h3>
            <p>Vui lòng nhập private key để hoàn tất xác nhận:</p>

            <div id="privateKeyContainer" style={{ marginTop: "1rem" }}>
              <label htmlFor="privateKeyArea" style={{ display: "block", marginBottom: "0.3rem" }}>
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
                  border: "1px solid #aaa",
                  padding: "0.6rem",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
                placeholder="Dán private key ở đây"
              />

              <div
                style={{
                  marginTop: "0.6rem",
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  id="clearKey"
                  type="button"
                  onClick={handleClear}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Xóa
                </button>

                <button
                  id="saveKey"
                  type="button"
                  onClick={handleSave}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>

            <div id="signatureResult" style={{ marginTop: "1.5rem", display: savedKey ? "block" : "none" }}>
              <p>
                <strong>Private key đã xác nhận:</strong>
              </p>
              <div style={{ border: "1px dashed #ccc", padding: "0.8rem", borderRadius: "6px", maxWidth: "700px" }}>
                <p id="maskedKey" style={{ wordBreak: "break-all", fontFamily: "monospace", margin: "0.2rem 0" }}>
                  {savedKey}
                </p>
                <p style={{ margin: "0.5rem 0 0 0" }}>
                  <em>Người xác nhận: {ownerInfo?.name}</em>
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ContractView;
