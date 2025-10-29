import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import CoOwnerDashboard from "./pages/co-owner/Dashboard";
import StaffDashboard from "./pages/staff/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import VehicleRegistration from "./pages/co-owner/VehicleRegistration";
import MyGroups from "./pages/co-owner/MyGroups";
import GroupDetail from "./pages/co-owner/GroupDetail";
import Contracts from "./pages/co-owner/Contracts";
import NotFound from "./pages/NotFound";
import Footer from "./components/ui/footnote";
import ContractPreviewPage from "./pages/co-owner/ContractPage";
import PDFContract from "./pages/co-owner/PDFContract";
import PaymentSuccess from "./pages/co-owner/PaymentSuccess";
import PaymentFailed from "./pages/co-owner/PaymentFailed";
import { useEffect } from "react";
const queryClient = new QueryClient();
function TitleUpdater() {
    const location = useLocation();
    useEffect(() => {
        const path = location.pathname;
        let title = "Ecoshare Platform";
        if (path === "/") title = "Trang chủ | Ecoshare Platform";
        else if (path.startsWith("/login")) title = "Đăng nhập | Ecoshare Platform";
        else if (path.startsWith("/register")) title = "Đăng ký | Ecoshare Platform";
        else if (path.startsWith("/co-owner/dashboard")) title = "Màn hình chính | Ecoshare Platform";
        else if (path.startsWith("/co-owner/vehicle-registration")) title = "Đăng ký phương tiện | Ecoshare Platform";
        else if (path.startsWith("/co-owner/groups")) title = "Nhóm của tôi | Ecoshare Platform";
        else if (path.startsWith("/co-owner/contracts")) title = "Hợp đồng của tôi | Ecoshare Platform";
        else if (path.startsWith("/staff/dashboard")) title = "màn hình chính | Ecoshare Platform";
        else if (path.startsWith("/admin/dashboard")) title = "màn hình chính | Ecoshare Platform";
        document.title = title;
    }, [location]);
    return null;
}
const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <TitleUpdater />
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/contract/preview/:id" element={<ContractPreviewPage />} />
                        <Route path="/contract/preview.pdf/:contractId" element={<PDFContract />} />
                        {/* Co-owner routes */}
                        <Route path="/co-owner/dashboard" element={<CoOwnerDashboard />} />
                        <Route path="/co-owner/vehicle-registration" element={<VehicleRegistration />} />
                        <Route path="/co-owner/groups" element={<MyGroups />} />
                        <Route path="/co-owner/groups/:groupId" element={<GroupDetail />} />
                        <Route path="/co-owner/contracts" element={<Contracts />} />
                        {/* Payment return routes */}
                        <Route path="/co-owner/payment-success" element={<PaymentSuccess />} />
                        <Route path="/co-owner/payment-failed" element={<PaymentFailed />} />
                        {/* Staff routes */}
                        <Route path="/staff/dashboard" element={<StaffDashboard />} />

                        {/* Admin routes */}
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
