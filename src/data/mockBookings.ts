export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface VehicleBooking {
    id: string;
    groupId: string;
    vehicleId: string;
    userId: string;
    startAt: string; // ISO datetime
    endAt: string;   // ISO datetime
    status: BookingStatus;
    createdAt: string; // ISO datetime
}

// In-memory mock database for bookings
const bookings: VehicleBooking[] = [
    {
        id: "b-001",
        groupId: "g-hcm-q1",
        vehicleId: "v-01",
        userId: "u-01",
        startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1h
        endAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // +3h
        status: "confirmed",
        createdAt: new Date().toISOString(),
    },
    {
        id: "b-002",
        groupId: "g-hcm-q3",
        vehicleId: "v-05",
        userId: "u-08",
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 day
        endAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
    },
];

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && bStart < aEnd;
}

export function listBookingsByGroup(groupId: string): VehicleBooking[] {
    return bookings
        .filter(b => b.groupId === groupId)
        .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function listBookingsByVehicle(vehicleId: string): VehicleBooking[] {
    return bookings
        .filter(b => b.vehicleId === vehicleId)
        .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function isVehicleAvailable(vehicleId: string, startAtISO: string, endAtISO: string): boolean {
    const startAt = new Date(startAtISO);
    const endAt = new Date(endAtISO);
    if (!(startAt instanceof Date) || !(endAt instanceof Date) || isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
        return false;
    }
    if (endAt <= startAt) return false;
    return bookings
        .filter(b => b.vehicleId === vehicleId && b.status !== "cancelled")
        .every(b => !overlaps(startAt, endAt, new Date(b.startAt), new Date(b.endAt)));
}

export function createBooking(input: {
    groupId: string;
    vehicleId: string;
    userId: string;
    startAt: string;
    endAt: string;
    status?: BookingStatus;
}): { ok: true; booking: VehicleBooking } | { ok: false; error: string } {
    const { groupId, vehicleId, userId, startAt, endAt } = input;
    if (!groupId || !vehicleId || !userId) return { ok: false, error: "Thiếu thông tin bắt buộc" };
    if (!isVehicleAvailable(vehicleId, startAt, endAt)) return { ok: false, error: "Xe đã được đặt trong khoảng thời gian này" };

    const booking: VehicleBooking = {
        id: `b-${Math.random().toString(36).slice(2, 8)}`,
        groupId,
        vehicleId,
        userId,
        startAt,
        endAt,
        status: input.status ?? "confirmed",
        createdAt: new Date().toISOString(),
    };
    bookings.push(booking);
    return { ok: true, booking };
}

export function cancelBooking(bookingId: string): boolean {
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;
    bookings[idx] = { ...bookings[idx], status: "cancelled" };
    return true;
}

export function getAllBookings(): VehicleBooking[] {
    return [...bookings];
}


