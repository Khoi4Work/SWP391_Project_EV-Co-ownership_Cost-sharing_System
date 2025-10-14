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
import { groups } from "@/data/mockGroups";
import axiosClient from "@/api/axiosClient.ts";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock contract data based on groups
  const contracts = groups.map(group => ({
    id: `CONTRACT-${group.id}`,
    title: `Hợp đồng đồng sở hữu - ${group.name}`,
    groupName: group.name,
    groupId: group.id,
    signedDate: "2024-01-15",
    status: "active",
    vehicleCount: group.vehicles.length,
    memberCount: group.users.length,
    contractType: "Đồng sở hữu xe điện",
    fileSize: "2.5 MB",
    downloadUrl: "#"
  }));

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
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{contract.title}</h3>
                          <Badge variant={getStatusColor(contract.status) as any}>
                            {getStatusText(contract.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Ngày ký: {contract.signedDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{contract.memberCount} thành viên</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>{contract.vehicleCount} xe điện</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">Mã hợp đồng:</span> {contract.id}
                          <span className="mx-3">•</span>
                          <span className="font-medium">Loại:</span> {contract.contractType}
                          <span className="mx-3">•</span>
                          <span className="font-medium">Kích thước:</span> {contract.fileSize}
                        </div>
                      </div>

                        <div className="flex flex-col space-y-2 ml-4">
                            <Button size="sm" className="flex items-center space-x-2">
                                <Download className="h-4 w-4" />
                                <span>Tải xuống</span>
                            </Button>

                            {/* Nút xem hợp đồng */}
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={async () => {
                                    try {
                                        const res = await axiosClient.get(
                                            `/contract/preview?contractId=1`,
                                            { responseType: "text" } // ⚠️ HTML text
                                        );

                                        const newWindow = window.open("", "_blank");
                                        newWindow!.document.open();
                                        newWindow!.document.write(res.data); // render Thymeleaf HTML
                                        newWindow!.document.close();
                                    } catch (error) {
                                        console.error("Error previewing contract:", error);
                                        alert("Không thể xem hợp đồng. Vui lòng thử lại.");
                                    }
                                }}
                            >
                                Xem hợp đồng
                            </Button>


                            <Link to={`/co-owner/groups/${contract.groupId}`}>
                                <Button size="sm" variant="outline" className="w-full">
                                    Xem nhóm
                                </Button>
                            </Link>
                        </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy hợp đồng nào phù hợp với từ khóa tìm kiếm.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}