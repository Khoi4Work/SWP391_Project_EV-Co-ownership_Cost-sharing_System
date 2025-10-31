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

async function getWithFallback<T>(paths: string[]) {
    let lastError: any = null;
    for (const path of paths) {
        try {
            const res = await axiosClient.get<T>(path);
            return res.data as T;
        } catch (err: any) {
            lastError = err;
            if (err?.response?.status && err.response.status !== 404) break;
        }
    }
    throw lastError || new Error("All endpoints failed");
}

export async function fetchUsageHistoryList(userId: number, groupId: number) {
    // BE mới: /booking/schedules/group/{groupId}/booked (không cần userId)
    // Giữ lại các route cũ để tương thích môi trường trước đó
    return await getWithFallback<UsageHistoryListItem[]>([
        `/booking/schedules/group/${groupId}/booked`,
        `/api/usage-history/booking/${userId}/${groupId}`,
        `/usage-history/booking/${userId}/${groupId}`,
    ]);
}

export async function fetchUsageHistoryDetail(scheduleId: number) {
    // BE mới: /booking/detail/{scheduleId}
    return await getWithFallback<UsageHistoryDetail>([
        `/booking/detail/${scheduleId}`,
        `/api/usage-history/booking/detail/${scheduleId}`,
        `/usage-history/booking/detail/${scheduleId}`,
    ]);
}


