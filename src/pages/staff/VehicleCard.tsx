import axiosClient from "@/api/axiosClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Car, UserCircle } from "lucide-react";
import React, { useEffect } from "react";
import { useState } from "react";
const VehicleCard = ({ vehicle }: any) => {
  const [groupMembers, setGroupMembers] = useState([]);
  useEffect(() => {
    const getGroupMembers = () => {
      const groupId = vehicle.group?.groupId;
      console.log("Group ID:", groupId);
      axiosClient.get(`/groupMember/members/${groupId}`).then((res) => {
        setGroupMembers(res.data);
      })
    }
    getGroupMembers();
  }, []);
  return (
    <Card className="shadow-md rounded-xl border p-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5" />
          <span>Thông tin xe</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Thông tin xe */}
        <div className="flex space-x-4">
          {/* Ảnh xe */}
          <div className="w-40 h-28 rounded-lg overflow-hidden border">
            <img
              src={vehicle.imageUrl}
              alt="Vehicle"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Chi tiết xe */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><strong>ID:</strong> {vehicle.vehicleId}</p>
            <p><strong>Biển số:</strong> {vehicle.plateNo}</p>
            <p><strong>Hãng:</strong> {vehicle.brand}</p>
            <p><strong>Model:</strong> {vehicle.model}</p>
            <p><strong>Màu:</strong> {vehicle.color}</p>
            <p><strong>Dung lượng pin:</strong> {vehicle.batteryCapacity} kWh</p>
            <p><strong>Giá thuê:</strong> {vehicle.price} VND</p>
          </div>
        </div>

        {/* Thông tin nhóm */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2 flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Nhóm của xe</span>
          </h3>

          {vehicle.group ? (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-sm">
                <strong>Tên nhóm:</strong> {vehicle.group.groupName}
              </p>

              {/* Danh sách thành viên */}
              <div className="mt-3">
                <p className="font-medium text-sm mb-1">Thành viên trong nhóm:</p>

                <div className="space-y-2">
                  {groupMembers?.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-start p-2 bg-white border rounded-md"
                    >
                      <UserCircle className="h-5 w-5 mr-2 text-gray-600" />

                      <div className="text-sm">
                        <p><strong>Họ và tên:</strong> {member.users?.hovaTen}</p>
                        <p><strong>Vai trò:</strong> {member.roleInGroup}</p>
                        <p><strong>Tỷ lệ sở hữu:</strong> {member.ownershipPercentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">Xe chưa thuộc nhóm nào.</p>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default VehicleCard;