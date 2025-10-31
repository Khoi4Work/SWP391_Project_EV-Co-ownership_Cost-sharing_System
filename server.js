// server.js (nâng cấp debug + rõ ràng hơn)
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {Vonage} from "@vonage/server-sdk";

dotenv.config();
const {
    MAILTRAP_USER,
    MAILTRAP_PASS,
    VONAGE_API_KEY,
    VONAGE_API_SECRET,
    VONAGE_BRAND_NAME, // tên hiển thị người gửi
    PORT = 5000,
} = process.env;
console.log("🔍 ENV check:", {
    hasMail: !!MAILTRAP_USER,
    hasVonageKey: !!VONAGE_API_KEY,
    hasVonageSecret: !!VONAGE_API_SECRET,
    vonageBrand: VONAGE_BRAND_NAME,
});


const app = express();
app.use(cors());
app.use(express.json());

// --- Mock DB for usage history ---
const mockUsageSchedules = [
    {
        scheduleId: 101,
        groupId: 1,
        userId: 1,
        date: "2025-10-21",
        vehicleName: "VinFast VF8",
        userName: "Nguyễn Văn A",
        timeRange: "08:00 - 10:00",
        hasCheckIn: true,
        hasCheckOut: true,
        detail: {
            checkInTime: "2025-10-21T08:02:00",
            checkInCondition: "Tốt",
            checkInNotes: "Không trầy xước",
            checkInImages: [
                "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=600&auto=format&fit=crop",
            ],
            checkOutTime: "2025-10-21T09:55:00",
            checkOutCondition: "Bình thường",
            checkOutNotes: "Đã sạc thêm 10%",
            checkOutImages: [
                "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=600&auto=format&fit=crop",
            ],
            vehicleName: "VinFast VF8",
            userName: "Nguyễn Văn A",
            date: "2025-10-21",
        },
    },
    {
        scheduleId: 102,
        groupId: 1,
        userId: 1,
        date: "2025-10-20",
        vehicleName: "VinFast VF9",
        userName: "Nguyễn Văn A",
        timeRange: "15:00 - 17:00",
        hasCheckIn: true,
        hasCheckOut: false,
        detail: {
            checkInTime: "2025-10-20T15:01:00",
            checkInCondition: "Tốt",
            checkInNotes: "Đang sử dụng",
            checkInImages: [],
            checkOutTime: null,
            checkOutCondition: null,
            checkOutNotes: null,
            checkOutImages: [],
            vehicleName: "VinFast VF9",
            userName: "Nguyễn Văn A",
            date: "2025-10-20",
        },
    },
];

// --- Mock data for GroupDetail page ---
const mockGroups = {
    1: {
        members: [
            { id: 1, roleInGroup: "ADMIN", ownershipPercentage: 60, hovaten: "Nguyễn Văn A", userId: 1, groupId: 1 },
            { id: 2, roleInGroup: "MEMBER", ownershipPercentage: 40, hovaten: "Trần Thị B", userId: 2, groupId: 1 },
        ],
        fund: { fundId: 10, balance: 1500000, group: { groupId: 1, groupName: "Nhóm Demo" } },
        fundDetails: [
            { fundDetailId: 1001, transactionType: "deposit", amount: 500000, createdAt: "2025-10-18T10:00:00Z", groupMember: { userId: 1 } },
            { fundDetailId: 1002, transactionType: "deposit", amount: 1000000, createdAt: "2025-10-20T12:00:00Z", groupMember: { userId: 2 } },
        ],
        vehicles: [
            { vehicleId: 501, plateNo: "30G-123.45", brand: "VinFast", model: "VF8", imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80&auto=format&fit=crop" },
        ],
    },
};

// --- Mock endpoints for GroupDetail dependencies ---
app.get("/groupMember/group/:groupId", (req, res) => {
    const groupId = Number(req.params.groupId);
    const g = mockGroups[groupId];
    if (!g) return res.json([]);
    return res.json(g.members);
});

app.get("/api/fund-payment/common-fund/group/:groupId", (req, res) => {
    const groupId = Number(req.params.groupId);
    const g = mockGroups[groupId];
    if (!g) return res.status(404).json({ message: "Fund not found" });
    return res.json(g.fund);
});

app.get("/api/fund-payment/fund-details/:fundId", (req, res) => {
    const fundId = Number(req.params.fundId);
    const g = Object.values(mockGroups).find((x) => x.fund.fundId === fundId);
    if (!g) return res.json([]);
    return res.json(g.fundDetails);
});

app.get("/vehicle/getVehicleByGroupID/:groupId", (req, res) => {
    const groupId = Number(req.params.groupId);
    const g = mockGroups[groupId];
    if (!g) return res.json([]);
    return res.json(g.vehicles);
});

// --- Mock endpoints for usage history ---
app.get("/api/usage-history/booking/:userId/:groupId", (req, res) => {
    const userId = Number(req.params.userId);
    const groupId = Number(req.params.groupId);
    const list = mockUsageSchedules
        .filter((s) => s.userId === userId && s.groupId === groupId)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((s) => ({
            scheduleId: s.scheduleId,
            date: s.date,
            vehicleName: s.vehicleName,
            userName: s.userName,
            timeRange: s.timeRange,
            hasCheckIn: s.hasCheckIn,
            hasCheckOut: s.hasCheckOut,
        }));
    return res.json(list);
});

app.get("/api/usage-history/booking/detail/:scheduleId", (req, res) => {
    const scheduleId = Number(req.params.scheduleId);
    const found = mockUsageSchedules.find((s) => s.scheduleId === scheduleId);
    if (!found) return res.status(404).json({ message: "Schedule not found" });
    const d = found.detail;
    return res.json({
        scheduleId: found.scheduleId,
        date: d.date,
        vehicleName: d.vehicleName,
        userName: d.userName,
        checkInTime: d.checkInTime,
        checkInCondition: d.checkInCondition,
        checkInNotes: d.checkInNotes,
        checkInImages: d.checkInImages,
        checkOutTime: d.checkOutTime,
        checkOutCondition: d.checkOutCondition,
        checkOutNotes: d.checkOutNotes,
        checkOutImages: d.checkOutImages,
    });
});

// --- Mailer setup ---
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS,
    },
});

// --- Vonage setup ---
const vonage =
    VONAGE_API_KEY && VONAGE_API_SECRET
        ? new Vonage({
                apiKey: VONAGE_API_KEY,
                apiSecret: VONAGE_API_SECRET,
            },
            {
                apiHost: "https://api.nexmo.com",
            })
        : null;

function normalizeE164(phone) {
    if (!phone) return null;
    const s = String(phone).trim();
    if (s.startsWith("+")) return s;
    if (s.startsWith("0")) return "+84" + s.slice(1); // VN number
    if (/^84\d+/.test(s)) return "+" + s;
    return null; // unknown
}

app.post("/send-otp", async (req, res) => {
    console.log("➡️ [/send-otp] body:", req.body);
    const {method, destination, otp} = req.body;

    if (!method || !destination || !otp) {
        return res
            .status(400)
            .json({success: false, error: "method, destination, otp are required"});
    }

    try {
        // --- Email ---
        if (method === "email") {
            await transporter.sendMail({
                from: '"EcoShare App" <noreply@ecoshare.com>',
                to: destination,
                subject: "Mã OTP xác thực EcoShare",
                text: `Mã OTP của bạn là: ${otp}`,
                html: `<h2>Xin chào</h2><p>Mã OTP của bạn là: <b>${otp}</b></p>`,
            });
            console.log("✅ [/send-otp] Email sent to", destination);
            return res.json({success: true, channel: "email"});
        }

        if (method === "sms") {
            if (!vonage) {
                console.error("❌ [/send-otp] Vonage client not configured");
                return res
                    .status(500)
                    .json({success: false, error: "Vonage not configured on server"});
            }

            const to = normalizeE164(destination);
            if (!to) {
                console.error("❌ [/send-otp] Invalid phone format:", destination);
                return res.status(400).json({
                    success: false,
                    error: "Invalid destination phone format. Use E.164 or leading 0 for VN.",
                });
            }

            console.log("📲 [/send-otp] Sending SMS via Vonage", {
                from: VONAGE_BRAND_NAME || "84926711233",
                to,
                otp,
            });

            try {
                const response = await vonage.sms.send({
                    to,
                    from: VONAGE_BRAND_NAME || "84926711233",
                    text: `Vonage OTP: ${otp}`,
                });

                console.log("✅ [/send-otp] Vonage result:", response);
                return res.json({
                    success: true,
                    channel: "sms",
                    response,
                });
            } catch (vonageErr) {
                console.error("❌ [/send-otp] Vonage error (full):", vonageErr);
                return res.status(500).json({
                    success: false,
                    error: "Vonage error",
                    details: vonageErr,
                });
            }
        }

        return res
            .status(400)
            .json({success: false, error: "Unsupported method"});
    } catch (err) {
        console.error("❌ [/send-otp] Unexpected error:", err);
        return res
            .status(500)
            .json({success: false, error: err.message || "unknown"});
    }
});

app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
