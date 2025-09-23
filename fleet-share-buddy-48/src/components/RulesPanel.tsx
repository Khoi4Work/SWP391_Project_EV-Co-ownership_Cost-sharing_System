import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Calendar, DollarSign, Clock, AlertTriangle, Users } from "lucide-react";

export function RulesPanel() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/10">
          <Shield className="h-4 w-4 mr-2" />
          Quy định & Vi phạm
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Quy định sử dụng EcoShare & Mức phạt vi phạm
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Tất cả quy định và hệ thống phạt minh bạch cho các vi phạm, nhấp vào từng mục để xem chi tiết
          </p>
        </DialogHeader>
        
        {/* Basic Rules Section */}
        <div className="mt-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">📋 Quy định cơ bản</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rule 1 - Ownership Management */}
            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">1. Quản lý quyền sở hữu & thành viên</h4>
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">1.1:</span> Mỗi thành viên phải có CCCD/CMND và Giấy phép lái xe hợp lệ trước khi được thêm vào nhóm đồng sở hữu.</p>
                <p><span className="font-medium">1.2:</span> Mọi thay đổi về tỷ lệ sở hữu phải được tất cả các thành viên hiện tại kí số e-contract mới có hiệu lực.</p>
                <p><span className="font-medium">1.3:</span> Chỉ admin nhóm có quyền thêm/xóa thành viên hoặc thay đổi tỷ lệ sở hữu.</p>
              </div>
            </div>

            {/* Rule 2 - Scheduling */}
            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">2. Đặt lịch & sử dụng xe</h4>
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">2.1:</span> Thời gian đặt lịch được xác định theo nguyên tắc "ai đặt trước thì ưu tiên trước".</p>
                <p><span className="font-medium">2.2:</span> Nếu có xung đột lịch, hệ thống sẽ ưu tiên theo thứ tự: tỷ lệ sở hữu cao nhất → lịch sử sử dụng ít nhất → thời gian đăng ký sớm nhất.</p>
                <p><span className="font-medium">2.3:</span> Mỗi thành viên chỉ được sử dụng xe tối đa 14 ngày liên tục. Trong các mùa cao điểm (lễ, tết), giới hạn giảm xuống còn 7 ngày liên tục.</p>
                <p><span className="font-medium">2.4:</span> Đặt lịch phải được xác nhận ít nhất 2 giờ trước khi sử dụng.</p>
                <p><span className="font-medium">2.5:</span> Hệ thống sẽ cảnh báo thành viên "có thể bị hạn chế ưu tiên nếu đặt trùng thường xuyên" khi phát hiện đặt lịch xung đột nhiều lần.</p>
              </div>
            </div>

            {/* Rule 3 - Costs */}
            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">3. Chi phí & thanh toán</h4>
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">3.1:</span> Các chi phí chung sẽ được chia theo tỷ lệ sở hữu mặc định.</p>
                <p><span className="font-medium">3.2:</span> Nhóm có thể lựa chọn chia chi phí theo mức độ sử dụng xe.</p>
                <p><span className="font-medium">3.3:</span> Thanh toán chi phí phải thực hiện qua phương thức trực tuyến (e-wallet, banking).</p>
                <p><span className="font-medium">3.4:</span> Thành viên có nợ quá hạn &gt; 15 ngày sẽ bị tạm khóa quyền đặt lịch.</p>
              </div>
            </div>

            {/* Rule 4 - Group Decisions */}
            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">4. Nhóm đồng sở hữu & quyết định chung</h4>
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">4.1:</span> Nhóm tối đa 5 người đồng sở hữu, tối thiểu tỷ lệ sở hữu là 15%.</p>
                <p><span className="font-medium">4.2:</span> Các quyết định quan trọng cần tối thiểu 70% tổng tỷ lệ sở hữu đồng ý để thông qua.</p>
                <p><span className="font-medium">4.3:</span> Quỹ chung được quản lý minh bạch với biên lai điện tử.</p>
                <p><span className="font-medium">4.4:</span> AI gợi ý lịch sử dụng chỉ mang tính tham khảo, không bắt buộc áp dụng.</p>
                <p><span className="font-medium">4.5:</span> Trường hợp khẩn cấp, đột xuất có thể bỏ qua quy trình bỏ phiếu nhưng phải cung cấp bằng chứng chứng minh tính cấp thiết và được staff xác nhận.</p>
              </div>
            </div>

            {/* Rule 5 - Disputes */}
            <div className="p-4 bg-primary/5 rounded-lg border lg:col-span-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">5. Tranh chấp & giám sát</h4>
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">5.1:</span> Mọi hành động đặt lịch, thanh toán, bỏ phiếu đều được ghi log không thể chỉnh sửa.</p>
                <p><span className="font-medium">5.2:</span> Trong trường hợp tranh chấp, Staff có quyền kiểm tra log và đưa ra quyết định.</p>
                <p><span className="font-medium">5.3:</span> Nếu tranh chấp không thể giải quyết ở mức Staff, Admin hệ thống sẽ can thiệp và quyết định cuối cùng là bắt buộc.</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4 text-center text-destructive">⚠️ Mức phạt vi phạm</h3>
        
        <Accordion type="single" collapsible className="w-full mt-6">
          {/* Penalty 1 - Schedule Violations */}
          <AccordionItem value="penalty-1" className="mb-4">
            <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-destructive/10 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-lg font-semibold">Vi phạm lịch sử dụng</span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 2.3</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 2.4</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Sử dụng xe quá thời hạn hoặc không trả xe đúng giờ
                </p>
                <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                  <p className="text-sm font-medium text-destructive">
                    Mức phạt: Cảnh cáo lần 1, phạt 200,000 VNĐ từ lần 2
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Penalty 2 - Payment Delays */}
          <AccordionItem value="penalty-2" className="mb-4">
            <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-destructive/10 rounded-full p-2">
                    <DollarSign className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-lg font-semibold">Thanh toán chậm trễ</span>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 3.4</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Không thanh toán chi phí trong thời hạn quy định
                </p>
                <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                  <p className="text-sm font-medium text-destructive">
                    Mức phạt: 50,000 VNĐ/ngày + tạm khóa quyền đặt lịch
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Penalty 3 - Schedule Conflicts */}
          <AccordionItem value="penalty-3" className="mb-4">
            <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-destructive/10 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-lg font-semibold">Đặt lịch xung đột</span>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 2.5</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Đặt lịch trùng với thành viên khác hoặc không hủy đúng hạn
                </p>
                <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                  <p className="text-sm font-medium text-destructive">
                    Mức phạt: 100,000 VNĐ và mất ưu tiên đặt lịch 30 ngày
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Penalty 4 - Ownership Requirements */}
          <AccordionItem value="penalty-4" className="mb-4">
            <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-destructive/10 rounded-full p-2">
                    <Users className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-lg font-semibold">Vi phạm tỷ lệ sở hữu</span>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 1.2</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Không đáp ứng yêu cầu tỷ lệ sở hữu tối thiểu hoặc chậm xác minh
                </p>
                <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                  <p className="text-sm font-medium text-destructive">
                    Mức phạt: Tạm khóa tài khoản đến khi hoàn thành xác minh
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Penalty 5 - Emergency Bypass */}
          <AccordionItem value="penalty-5" className="mb-4">
            <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-destructive/10 rounded-full p-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-lg font-semibold">Lạm dụng quyết định khẩn cấp</span>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 4.7</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Sử dụng quyết định khẩn cấp không đúng mục đích hoặc thiếu bằng chứng
                </p>
                <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                  <p className="text-sm font-medium text-destructive">
                    Mức phạt: 500,000 VNĐ và mất quyền đưa ra quyết định khẩn cấp 90 ngày
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}