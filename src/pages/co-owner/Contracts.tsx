import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Search,
  ArrowLeft,
  Calendar,
  Users,
  Car
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axiosClient from "@/api/axiosClient.ts";
import { useEffect } from "react";
export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const PREVIEW_PATH = import.meta.env.VITE_CONTRACT_PREVIEW_PATH;
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axiosClient.get("/contract/history");

        // Lọc các contract status = active
        const activeContracts = res.data;
        setContracts(activeContracts);
      } catch (error) {
        console.error("Lỗi khi tải hợp đồng:", error);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);
  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "expired": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Hiệu lực";
      case "expired": return "Hết hạn";
      case "pending": return "Chờ ký";
      default: return "Không xác định";
    }
  };
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
        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Tìm kiếm hợp đồng</CardTitle>
                <CardDescription>
                  Tra cứu hợp đồng theo tên nhóm hoặc mã hợp đồng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập tên nhóm hoặc mã hợp đồng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>{contracts.length}</CardTitle>
              <CardDescription>Tổng số hợp đồng</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Contracts List */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Danh sách hợp đồng</CardTitle>
            <CardDescription>
              Tất cả hợp đồng đồng sở hữu mà bạn đã tham gia
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {contracts.length > 0 ? (
                contracts.map((contract) => (
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
                            <span>Sở hữu: {contract.ownership}</span>
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
                        <Button size="sm" className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Tải xuống</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            window.open(
                              `/contract/preview.pdf/${contract.contractId}`,
                              "_blank"
                            )
                          }
                        >
                          Xem hợp đồng
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
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