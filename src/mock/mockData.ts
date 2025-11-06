// Re-export groups and related functions from mockGroups
export { groups, getGroupById, CURRENT_USER_ID } from "@/data/mockGroups";
export type { Group, GroupUser, Vehicle, Transaction } from "@/data/mockGroups";

// Re-export monthly fees and related functions from mockMonthlyFees
export { 
    mockMonthlyFees, 
    getMonthlyFeesByGroupId, 
    payMonthlyFee 
} from "@/data/mockMonthlyFees";
export type { GroupFeeResponse, FundFeeResponse } from "@/data/mockMonthlyFees";

// Mock current user data
export const mockCurrentUser = {
    id: 2,
    hovaTen: "Nguyễn Văn A",
    email: "test@example.com",
    role: "co-owner"
};

// Mock groups for MyGroups page (formatted for BE response structure)
export const mockGroups = [
    {
        id: 1,
        name: "Nhóm Tesla Model 3",
        description: "Nhóm chia sẻ xe Tesla Model 3 2023",
        memberCount: 3,
        vehicles: [
            {
                id: 1,
                name: "Tesla Model 3",
                licensePlate: "51F-123.45",
                status: "available"
            }
        ]
    },
    {
        id: 2,
        name: "Nhóm VinFast VF8",
        description: "Nhóm chia sẻ xe VinFast VF8 2023",
        memberCount: 4,
        vehicles: [
            {
                id: 2,
                name: "VinFast VF8",
                licensePlate: "51F-678.90",
                status: "available"
            }
        ]
    }
];

// Mock dashboard data
export const mockDashboardData = {
    totalGroups: 2,
    totalVehicles: 2,
    upcomingBookings: [
        {
            id: 1,
            vehicle: "Tesla Model 3",
            date: "2023-11-07",
            time: "09:00 - 17:00"
        }
    ],
    recentActivities: [
        {
            id: 1,
            type: "booking",
            description: "Đặt xe Tesla Model 3",
            date: "2023-11-06"
        }
    ]
};
