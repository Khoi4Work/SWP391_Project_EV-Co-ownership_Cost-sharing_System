export const mockCommonFund = {
    fundId: 1,
    balance: 2500000,
    group: {
        groupId: 1,
        groupName: "Nhóm ảo",
        description: "Mock - Nhóm test FE",
        createdAt: "2025-01-10T10:00:00",
        status: "ACTIVE",
    },
    fundDetails: []
};

export const mockFundDetails = [
    {
        fundDetailId: 1,
        amount: 1000000,
        transactionType: "DEPOSIT",
        status: "SUCCESS",
        createdAt: "2025-01-12T12:11:00",
        groupMember: { groupMemberId: 1, userId: { id: 2, hovaTen: "Nguyễn Văn B" } }
    },
    {
        fundDetailId: 2,
        amount: 200000,
        transactionType: "WITHDRAW",
        status: "SUCCESS",
        createdAt: "2025-01-13T12:11:00",
        groupMember: { groupMemberId: 1, userId: { id: 1, hovaTen: "Nguyễn Văn A" } }
    }
];

export const mockGroupMembers = [
    {
        id: 1,
        groupId: { groupId: 1 },
        userId: { id: "1", hovaTen: "Nguyễn Văn A", email: "a@ex.com", avatar: "" },
        roleInGroup: "admin",
        status: "active",
        createdAt: "2025-01-01T10:00:00",
        ownershipPercentage: 60
    },
    {
        id: 2,
        groupId: { groupId: 1 },
        userId: { id: "2", hovaTen: "Bạn", email: "me@ex.com", avatar: "" },
        roleInGroup: "member",
        status: "active",
        createdAt: "2025-01-02T10:00:00",
        ownershipPercentage: 40
    }
];

export const mockVehicles = [
    {
        vehicleId: 1,
        plateNo: "30A-12345",
        brand: "Vinfast",
        model: "VF8",
        color: "Trắng",
        batteryCapacity: 75,
        createdAt: "2025-01-01T00:00:00",
        price: 800000000,
        imageUrl: ""
    }
];
