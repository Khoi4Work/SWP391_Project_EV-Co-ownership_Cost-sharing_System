export interface FundFeeResponse {
    fundDetailId: number;
    groupMemberId: number;
    userId: number;
    userName: string;
    amount: number;
    monthYear: string; // format: "yyyy-MM"
    status: "PENDING" | "COMPLETED";
    createdAt: string;
    isOverdue: boolean;
    dueDate: string;
}

export interface GroupFeeResponse {
    groupId: number;
    groupName: string;
    monthYear: string;
    totalPending: number;
    pendingCount: number;
    paidCount: number;
    fees: FundFeeResponse[];
}

// Helper để tạo ngày
const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

const getDueDate = (daysFromNow: number = 14) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
};

const getPastDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

const currentMonthYear = getCurrentMonth();

// Mock monthly fees data theo groupId
export const mockMonthlyFees: Record<number, GroupFeeResponse> = {
    1: {
        groupId: 1,
        groupName: "Nhóm du lịch",
        monthYear: currentMonthYear,
        totalPending: 2000000,
        pendingCount: 2,
        paidCount: 2,
        fees: [
            {
                fundDetailId: 101,
                groupMemberId: 1,
                userId: 1,
                userName: "Trần B",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "PENDING",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getDueDate(10)
            },
            {
                fundDetailId: 102,
                groupMemberId: 2,
                userId: 2,
                userName: "Nguyễn Văn A",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "PENDING",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getDueDate(9)
            },
            {
                fundDetailId: 103,
                groupMemberId: 3,
                userId: 3,
                userName: "Lê C",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "COMPLETED",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getPastDate(-5)
            },
            {
                fundDetailId: 104,
                groupMemberId: 4,
                userId: 4,
                userName: "Phạm D",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "COMPLETED",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getPastDate(-3)
            }
        ]
    },
    2: {
        groupId: 2,
        groupName: "Nhóm HCM - Quận 1",
        monthYear: currentMonthYear,
        totalPending: 3000000,
        pendingCount: 3,
        paidCount: 1,
        fees: [
            {
                fundDetailId: 201,
                groupMemberId: 5,
                userId: 1,
                userName: "Trần B",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "PENDING",
                createdAt: getPastDate(5),
                isOverdue: true, // Quá hạn
                dueDate: getPastDate(-5) // Đã quá hạn 5 ngày
            },
            {
                fundDetailId: 202,
                groupMemberId: 6,
                userId: 2,
                userName: "Nguyễn Văn A",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "PENDING",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getDueDate(5)
            },
            {
                fundDetailId: 203,
                groupMemberId: 7,
                userId: 3,
                userName: "Lê C",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "PENDING",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getDueDate(3)
            },
            {
                fundDetailId: 204,
                groupMemberId: 8,
                userId: 4,
                userName: "Phạm D",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "COMPLETED",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getPastDate(-2)
            }
        ]
    },
    3: {
        groupId: 3,
        groupName: "Nhóm HN - Cầu Giấy",
        monthYear: currentMonthYear,
        totalPending: 0,
        pendingCount: 0,
        paidCount: 3,
        fees: [
            {
                fundDetailId: 301,
                groupMemberId: 9,
                userId: 5,
                userName: "Phạm Quốc E",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "COMPLETED",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getPastDate(-10)
            },
            {
                fundDetailId: 302,
                groupMemberId: 10,
                userId: 1,
                userName: "Trần B",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "COMPLETED",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getPastDate(-8)
            },
            {
                fundDetailId: 303,
                groupMemberId: 11,
                userId: 6,
                userName: "Ngô F",
                amount: 1000000,
                monthYear: currentMonthYear,
                status: "COMPLETED",
                createdAt: getPastDate(5),
                isOverdue: false,
                dueDate: getPastDate(-5)
            }
        ]
    }
};

// Function để lấy monthly fees theo groupId
export function getMonthlyFeesByGroupId(groupId: number | string): GroupFeeResponse | null {
    // Convert to number if it's a string (e.g., "1" -> 1)
    const numericId = typeof groupId === 'string' ? Number(groupId) : groupId;
    
    // Try to find by exact match first (by numeric ID)
    if (!isNaN(numericId) && numericId > 0) {
        const exactMatch = mockMonthlyFees[numericId];
        if (exactMatch) {
            return exactMatch;
        }
        
        // If groupId is a number, try using it as index to get fees
        // groupId 1 = first group fees, groupId 2 = second group fees, etc.
        const index = numericId;
        const feeKeys = Object.keys(mockMonthlyFees).map(Number).sort((a, b) => a - b);
        if (index > 0 && index <= feeKeys.length) {
            const key = feeKeys[index - 1];
            const groupFees = mockMonthlyFees[key];
            if (groupFees) {
                // Return a copy with updated groupId
                return {
                    ...groupFees,
                    groupId: numericId,
                    groupName: groupFees.groupName || `Nhóm ${numericId}`,
                };
            }
        }
    }

    // Fallback: return first group's fees or create a default one
    const firstKey = Object.keys(mockMonthlyFees).map(Number).sort((a, b) => a - b)[0];
    if (firstKey && !isNaN(firstKey)) {
        const firstGroup = mockMonthlyFees[firstKey];
        // Create a copy with new groupId
        return {
            ...firstGroup,
            groupId: numericId || firstKey,
            groupName: firstGroup.groupName || `Nhóm ${numericId || firstKey}`,
        };
    }

    // If no mock data exists, return null
    return null;
}

// Function để simulate payment (update status from PENDING to COMPLETED)
export function payMonthlyFee(fundDetailId: number): { success: boolean; updatedFee?: GroupFeeResponse } {
    for (const groupFee of Object.values(mockMonthlyFees)) {
        const fee = groupFee.fees.find(f => f.fundDetailId === fundDetailId);
        if (fee && fee.status === "PENDING") {
            fee.status = "COMPLETED";
            fee.isOverdue = false;
            // Update counts
            groupFee.paidCount += 1;
            groupFee.pendingCount -= 1;
            groupFee.totalPending -= fee.amount;
            
            // Return a deep copy of the updated group fee
            const updatedFee: GroupFeeResponse = {
                ...groupFee,
                fees: groupFee.fees.map(f => ({ ...f }))
            };
            return { success: true, updatedFee };
        }
    }
    return { success: false };
}

