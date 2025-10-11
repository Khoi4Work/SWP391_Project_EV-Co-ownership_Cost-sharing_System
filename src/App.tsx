import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/contract/preview/:id" element={<ContractPreviewPage />} />
                    {/* Co-owner routes */}
                    <Route path="/co-owner/dashboard" element={<CoOwnerDashboard />} />
                    <Route path="/co-owner/vehicle-registration" element={<VehicleRegistration />} />
                    <Route path="/co-owner/groups" element={<MyGroups />} />
                    <Route path="/co-owner/groups/:groupId" element={<GroupDetail />} />
                    <Route path="/co-owner/contracts" element={<Contracts />} />
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

export default App;
