import axiosClient from "./axiosClient";

export interface UsageHistoryListItem {
    scheduleId: number;
    date: string;
    vehicleName: string;
    userName: string;
    timeRange: string;
    hasCheckIn: boolean;
    hasCheckOut: boolean;
}

export interface UsageHistoryDetail {
    scheduleId: number;
    date: string;
    vehicleName: string;
    userName: string;
    checkInTime?: string | null;
    checkInCondition?: string | null;
    checkInNotes?: string | null;
    checkInImages?: string[] | null;
    checkOutTime?: string | null;
    checkOutCondition?: string | null;
    checkOutNotes?: string | null;
    checkOutImages?: string[] | null;
}

export async function fetchUsageHistoryList(userId: number, groupId: number) {
    const res = await axiosClient.get<UsageHistoryListItem[]>(
        `/api/usage-history/booking/${userId}/${groupId}`
    );
    return res.data;
}

export async function fetchUsageHistoryDetail(scheduleId: number) {
    const res = await axiosClient.get<UsageHistoryDetail>(
        `/api/usage-history/booking/detail/${scheduleId}`
    );
    return res.data;
}


