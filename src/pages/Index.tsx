import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Link} from "react-router-dom";
import {Car, Leaf, Users, Shield, ArrowRight, FileText, Scale, Calendar, DollarSign, UserCheck} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Car className="h-8 w-8 text-primary"/>
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
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline"
                                    className="bg-white text-primary hover:bg-white/90 shadow-glow">
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
                            <div
                                className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-primary"/>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Tiết kiệm chi phí</h3>
                            <p className="text-muted-foreground">
                                Chia sẻ chi phí mua xe và bảo dưỡng với các thành viên khác
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
                            <div
                                className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Leaf className="h-8 w-8 text-primary"/>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Thân thiện môi trường</h3>
                            <p className="text-muted-foreground">
                                Giảm lượng khí thải và bảo vệ môi trường với xe điện
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
                            <div
                                className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Users className="h-8 w-8 text-primary"/>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Cộng đồng chia sẻ</h3>
                            <p className="text-muted-foreground">
                                Kết nối với những người có cùng tư duy bền vững
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-lg bg-gradient-card shadow-elegant">
                            <div
                                className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-primary"/>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Bảo đảm pháp lý</h3>
                            <p className="text-muted-foreground">
                                Hợp đồng điện tử minh bạch và đảm bảo quyền lợi
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Statistics Section */}
            <section className="py-16 bg-gradient-card">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Tác động tích cực của EcoShare</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Những con số ấn tượng cho thấy sức mạnh của việc đồng sở hữu xe điện thông minh
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {/* Cost Savings */}
                        <div className="text-center p-6 rounded-lg bg-gradient-primary/10 shadow-elegant">
                            <div
                                className="bg-primary/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <DollarSign className="h-8 w-8 text-primary"/>
                            </div>
                            <div className="text-3xl font-bold text-primary mb-2">65%</div>
                            <p className="text-sm text-muted-foreground">Tiết kiệm chi phí so với mua xe riêng</p>
                        </div>

                        {/* Environmental Impact */}
                        <div className="text-center p-6 rounded-lg bg-gradient-primary/10 shadow-elegant">
                            <div
                                className="bg-primary/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Leaf className="h-8 w-8 text-primary"/>
                            </div>
                            <div className="text-3xl font-bold text-primary mb-2">3.2 tấn</div>
                            <p className="text-sm text-muted-foreground">CO₂ tiết kiệm/năm/nhóm</p>
                        </div>

                        {/* Active Users */}
                        <div className="text-center p-6 rounded-lg bg-gradient-primary/10 shadow-elegant">
                            <div
                                className="bg-primary/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Users className="h-8 w-8 text-primary"/>
                            </div>
                            <div className="text-3xl font-bold text-primary mb-2">2,450+</div>
                            <p className="text-sm text-muted-foreground">Thành viên đang hoạt động</p>
                        </div>

                        {/* Active Vehicles */}
                        <div className="text-center p-6 rounded-lg bg-gradient-primary/10 shadow-elegant">
                            <div
                                className="bg-primary/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Car className="h-8 w-8 text-primary"/>
                            </div>
                            <div className="text-3xl font-bold text-primary mb-2">180+</div>
                            <p className="text-sm text-muted-foreground">Xe điện đang chia sẻ</p>
                        </div>
                    </div>

                    {/* Detailed Impact Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Financial Benefits */}
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary/10 rounded-full p-2">
                                        <DollarSign className="h-5 w-5 text-primary"/>
                                    </div>
                                    <CardTitle className="text-lg">Lợi ích tài chính</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Chi phí mua xe</span>
                                    <span className="font-semibold">↓ 60-80%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Bảo dưỡng định kỳ</span>
                                    <span className="font-semibold">↓ 65%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Bảo hiểm xe</span>
                                    <span className="font-semibold">↓ 70%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Khấu hao giá trị</span>
                                    <span className="font-semibold">↓ 75%</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Environmental Impact */}
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary/10 rounded-full p-2">
                                        <Leaf className="h-5 w-5 text-primary"/>
                                    </div>
                                    <CardTitle className="text-lg">Tác động môi trường</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Giảm khí thải CO₂</span>
                                    <span className="font-semibold text-green-600">-85%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Tối ưu tài nguyên</span>
                                    <span className="font-semibold text-green-600">+300%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Giảm ô nhiễm không khí</span>
                                    <span className="font-semibold text-green-600">-92%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Tiết kiệm năng lượng</span>
                                    <span className="font-semibold text-green-600">+45%</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Satisfaction */}
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary/10 rounded-full p-2">
                                        <Shield className="h-5 w-5 text-primary"/>
                                    </div>
                                    <CardTitle className="text-lg">Hài lòng người dùng</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Tỷ lệ hài lòng chung</span>
                                    <span className="font-semibold text-blue-600">96.8%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Sẽ giới thiệu bạn bè</span>
                                    <span className="font-semibold text-blue-600">94.2%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Dịch vụ khách hàng</span>
                                    <span className="font-semibold text-blue-600">4.9/5⭐</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Tỷ lệ gia hạn hợp đồng</span>
                                    <span className="font-semibold text-blue-600">89.5%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Removed duplicated call-to-action block */}
                </div>
            </section>


            {/* Call to Action */}
            <section className="bg-gradient-primary text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Sẵn sàng bắt đầu hành trình xanh?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Tham gia cộng đồng EcoShare ngay hôm nay và trở thành một phần của cuộc cách mạng giao thông bền
                        vững.
                    </p>
                    <Link to="/register">
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
                            Đăng ký miễn phí
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Index;