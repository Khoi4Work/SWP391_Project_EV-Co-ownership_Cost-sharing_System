import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Car, Leaf, Users, Shield, ArrowRight, FileText, Scale, Calendar, DollarSign, UserCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EcoShare</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-primary hover:shadow-glow">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Tương lai xe điện<br/>
            <span className="text-yellow-300">Đồng sở hữu thông minh</span>
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Kết nối những người có cùng tầm nhìn để sở hữu xe điện một cách thông minh, 
            tiết kiệm và bền vững cho tương lai xanh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn EcoShare?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tiết kiệm chi phí</h3>
              <p className="text-muted-foreground">
                Chia sẻ chi phí mua xe và bảo dưỡng với các thành viên khác
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Thân thiện môi trường</h3>
              <p className="text-muted-foreground">
                Giảm lượng khí thải và bảo vệ môi trường với xe điện
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cộng đồng chia sẻ</h3>
              <p className="text-muted-foreground">
                Kết nối với những người có cùng tư duy bền vững
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bảo đảm pháp lý</h3>
              <p className="text-muted-foreground">
                Hợp đồng điện tử minh bạch và đảm bảo quyền lợi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl font-bold">Quy định sử dụng EcoShare</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="bg-destructive hover:bg-destructive/90">
                    <Shield className="mr-2 h-4 w-4" />
                    Vi phạm
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-4">
                      Mức phạt vi phạm
                    </DialogTitle>
                    <p className="text-muted-foreground text-center">
                      Hệ thống phạt minh bạch cho các vi phạm quy định, nhấp vào từng mục để xem chi tiết
                    </p>
                  </DialogHeader>
                  
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
                            Đặt lịch trùng lặp thường xuyên (trên 5 lần/tháng)
                          </p>
                          <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                            <p className="text-sm font-medium text-destructive">
                              Mức phạt: Giảm 50% quyền ưu tiên trong 30 ngày
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Penalty 4 - Vehicle Damage */}
                    <AccordionItem value="penalty-4" className="mb-4">
                      <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div className="bg-destructive/10 rounded-full p-2">
                              <Car className="h-5 w-5 text-destructive" />
                            </div>
                            <span className="text-lg font-semibold">Gây hư hỏng xe</span>
                          </div>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 2.1</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Hư hỏng xe do sử dụng không đúng cách
                          </p>
                          <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                            <p className="text-sm font-medium text-destructive">
                              Mức phạt: Chi phí sửa chữa + phạt 500,000 VNĐ
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Penalty 5 - Serious Violations */}
                    <AccordionItem value="penalty-5" className="mb-4">
                      <AccordionTrigger className="bg-gradient-card rounded-lg px-6 py-4 shadow-elegant hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div className="bg-destructive/10 rounded-full p-2">
                              <Shield className="h-5 w-5 text-destructive" />
                            </div>
                            <span className="text-lg font-semibold">Vi phạm nghiêm trọng</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 1.2</span>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Quy định 4.1</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Cho thuê lại xe, sử dụng sai mục đích, hoặc vi phạm nghiêm trọng khác
                          </p>
                          <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                            <p className="text-sm font-medium text-destructive">
                              Mức phạt: Loại khỏi nhóm và tịch thu tỷ lệ sở hữu
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tìm hiểu các quy định và nguyên tắc hoạt động để có trải nghiệm tốt nhất khi sử dụng dịch vụ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rule 1 - Ownership Management */}
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">1. Quản lý quyền sở hữu & thành viên</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">1.1:</span> Mỗi thành viên phải có CCCD/CMND và Giấy phép lái xe hợp lệ trước khi được thêm vào nhóm đồng sở hữu.</p>
                  <p><span className="font-medium">1.2:</span> Mọi thay đổi về tỷ lệ sở hữu phải được tất cả các thành viên hiện tại kí số e-contract mới có hiệu lực.</p>
                  <p><span className="font-medium">1.3:</span> Chỉ admin nhóm có quyền thêm/xóa thành viên hoặc thay đổi tỷ lệ sở hữu.</p>
                </div>
              </CardContent>
            </Card>

            {/* Rule 2 - Scheduling */}
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">2. Đặt lịch & sử dụng xe</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">2.1:</span> Thời gian đặt lịch được xác định theo nguyên tắc "ai đặt trước thì ưu tiên trước".</p>
                  <p><span className="font-medium">2.2:</span> Nếu có xung đột lịch, hệ thống sẽ ưu tiên theo thứ tự: tỷ lệ sở hữu cao nhất → lịch sử sử dụng ít nhất → thời gian đăng ký sớm nhất.</p>
                  <p><span className="font-medium">2.3:</span> Mỗi thành viên chỉ được sử dụng xe tối đa 14 ngày liên tục. Trong các mùa cao điểm (lễ, tết), giới hạn giảm xuống còn 7 ngày liên tục.</p>
                  <p><span className="font-medium">2.4:</span> Đặt lịch phải được xác nhận ít nhất 2 giờ trước khi sử dụng.</p>
                  <p><span className="font-medium">2.5:</span> Hệ thống sẽ cảnh báo thành viên "có thể bị hạn chế ưu tiên nếu đặt trùng thường xuyên" khi phát hiện đặt lịch xung đột nhiều lần.</p>
                </div>
              </CardContent>
            </Card>

            {/* Rule 3 - Costs */}
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">3. Chi phí & thanh toán</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">3.1:</span> Các chi phí chung sẽ được chia theo tỷ lệ sở hữu mặc định.</p>
                  <p><span className="font-medium">3.2:</span> Nhóm có thể lựa chọn chia chi phí theo mức độ sử dụng xe.</p>
                  <p><span className="font-medium">3.3:</span> Thanh toán chi phí phải thực hiện qua phương thức trực tuyến (e-wallet, banking).</p>
                  <p><span className="font-medium">3.4:</span> Thành viên có nợ quá hạn &gt; 15 ngày sẽ bị tạm khóa quyền đặt lịch.</p>
                </div>
              </CardContent>
            </Card>

            {/* Rule 4 - Group Decisions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">4. Nhóm đồng sở hữu & quyết định chung</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">4.1:</span> Nhóm tối đa 5 người đồng sở hữu, tối thiểu tỷ lệ sở hữu là 15%.</p>
                  <p><span className="font-medium">4.2:</span> Các quyết định quan trọng cần tối thiểu 70% tổng tỷ lệ sở hữu đồng ý để thông qua.</p>
                  <p><span className="font-medium">4.3:</span> Quỹ chung được quản lý minh bạch với biên lai điện tử.</p>
                  <p><span className="font-medium">4.4:</span> AI gợi ý lịch sử dụng chỉ mang tính tham khảo, không bắt buộc áp dụng.</p>
                  <p><span className="font-medium">4.5:</span> Trường hợp khẩn cấp, đột xuất có thể bỏ qua quy trình bỏ phiếu nhưng phải cung cấp bằng chứng chứng minh tính cấp thiết và được staff xác nhận.</p>
                </div>
              </CardContent>
            </Card>

            {/* Rule 5 - Disputes */}
            <Card className="shadow-elegant lg:col-span-2">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">5. Tranh chấp & giám sát</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">5.1:</span> Mọi hành động đặt lịch, thanh toán, bỏ phiếu đều được ghi log không thể chỉnh sửa.</p>
                  <p><span className="font-medium">5.2:</span> Trong trường hợp tranh chấp, Staff có quyền kiểm tra log và đưa ra quyết định.</p>
                  <p><span className="font-medium">5.3:</span> Nếu tranh chấp không thể giải quyết ở mức Staff, Admin hệ thống sẽ can thiệp và quyết định cuối cùng là bắt buộc.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-gradient-primary hover:shadow-glow">
                  <FileText className="mr-2 h-4 w-4" />
                  Đăng ký và đồng ý điều khoản
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">
                  Đã có tài khoản? Đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình xanh?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cộng đồng EcoShare ngay hôm nay và trở thành một phần của cuộc cách mạng giao thông bền vững.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
              Đăng ký miễn phí
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
