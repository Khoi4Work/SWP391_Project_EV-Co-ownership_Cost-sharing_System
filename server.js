// server.js (nâng cấp debug + rõ ràng hơn)
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Vonage } from "@vonage/server-sdk";

dotenv.config();
const {
  MAILTRAP_USER,
  MAILTRAP_PASS,
  VONAGE_API_KEY,
  VONAGE_API_SECRET,
  VONAGE_BRAND_NAME, // tên hiển thị người gửi
  PORT = 8080,
} = process.env;
console.log("🔍 ENV check:", {
  hasMail: !!MAILTRAP_USER,
  hasVonageKey: !!VONAGE_API_KEY,
  hasVonageSecret: !!VONAGE_API_SECRET,
  vonageBrand: VONAGE_BRAND_NAME,
});


const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

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
  const { method, destination, otp } = req.body;

  if (!method || !destination || !otp) {
    return res
      .status(400)
      .json({ success: false, error: "method, destination, otp are required" });
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
      return res.json({ success: true, channel: "email" });
    }

    if (method === "sms") {
      if (!vonage) {
        console.error("❌ [/send-otp] Vonage client not configured");
        return res
          .status(500)
          .json({ success: false, error: "Vonage not configured on server" });
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
      .json({ success: false, error: "Unsupported method" });
  } catch (err) {
    console.error("❌ [/send-otp] Unexpected error:", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "unknown" });
  }
});

// --- In-memory mock DB for vehicles and bookings ---
// This is reset on server restart. Intended for local testing only.
const mockVehicles = [
  { id: "v1", name: "VinFast VF8", groupName: "Team A" },
  { id: "v2", name: "Tesla Model Y", groupName: "Team B" },
  { id: "v3", name: "Hyundai Ioniq 5", groupName: "Team C" },
];

let mockBookings = [
  {
    id: "1",
    time: "09:00-11:00",
    date: "2024-01-16",
    vehicle: "VinFast VF8",
    bookedBy: "Nguyễn Văn A (60%)",
    ownershipLevel: 60,
    canOverride: false,
  },
  {
    id: "2",
    time: "14:00-17:00",
    date: "2024-01-16",
    vehicle: "Tesla Model Y",
    bookedBy: "Trần Thị B (25%)",
    ownershipLevel: 25,
    canOverride: true,
  },
  {
    id: "3",
    time: "13:00-15:00",
    date: "2024-01-16",
    vehicle: "VinFast VF8",
    bookedBy: "Lê Văn C (40%)",
    ownershipLevel: 40,
    canOverride: false,
  },
];

// Vehicles the current user has access to
app.get("/Vehicles/my", (req, res) => {
  return res.json(mockVehicles);
});

// List bookings (optional filters: date, vehicle)
app.get("/Bookings", (req, res) => {
  const { date, vehicle } = req.query;
  let result = mockBookings;
  if (date) {
    result = result.filter((b) => b.date === String(date));
  }
  if (vehicle) {
    result = result.filter((b) => b.vehicle === String(vehicle));
  }
  return res.json(result);
});

// Create a booking
app.post("/Bookings", (req, res) => {
  const { time, date, vehicle, bookedBy, ownershipLevel } = req.body || {};
  if (!time || !date || !vehicle) {
    return res.status(400).json({ error: "time, date, vehicle are required" });
  }

  // basic overlap prevention on server side
  const overlaps = (a, b) => {
    const toMinutes = (hhmm) => {
      const [hh, mm] = String(hhmm).split(":").map(Number);
      return hh * 60 + mm;
    };
    const [as, ae] = String(a).split("-");
    const [bs, be] = String(b).split("-");
    const ra = { start: toMinutes(as), end: toMinutes(ae) };
    const rb = { start: toMinutes(bs), end: toMinutes(be) };
    return ra.start < rb.end && ra.end > rb.start;
  };

  const conflict = mockBookings.some(
    (b) => b.vehicle === vehicle && b.date === date && overlaps(b.time, time)
  );
  if (conflict) {
    return res.status(409).json({ error: "time range conflicts with existing booking" });
  }

  const newId = (mockBookings.length + 1).toString();
  const booking = {
    id: newId,
    time,
    date,
    vehicle,
    bookedBy: bookedBy || "Bạn (35%)",
    ownershipLevel: typeof ownershipLevel === "number" ? ownershipLevel : 35,
    canOverride: false,
  };
  mockBookings = [booking, ...mockBookings];
  return res.status(201).json(booking);
});

// Update a booking
app.put("/Bookings/:id", (req, res) => {
  const { id } = req.params;
  const { time, date, vehicle } = req.body || {};
  const idx = mockBookings.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });

  const next = { ...mockBookings[idx] };
  if (time) next.time = time;
  if (date) next.date = date;
  if (vehicle) next.vehicle = vehicle;

  // conflict check against others
  const overlaps = (a, b) => {
    const toMinutes = (hhmm) => {
      const [hh, mm] = String(hhmm).split(":").map(Number);
      return hh * 60 + mm;
    };
    const [as, ae] = String(a).split("-");
    const [bs, be] = String(b).split("-");
    const ra = { start: toMinutes(as), end: toMinutes(ae) };
    const rb = { start: toMinutes(bs), end: toMinutes(be) };
    return ra.start < rb.end && ra.end > rb.start;
  };

  const conflict = mockBookings.some(
    (b) => b.id !== id && b.vehicle === next.vehicle && b.date === next.date && overlaps(b.time, next.time)
  );
  if (conflict) {
    return res.status(409).json({ error: "time range conflicts with existing booking" });
  }

  mockBookings[idx] = next;
  return res.json(next);
});

// Delete a booking
app.delete("/Bookings/:id", (req, res) => {
  const { id } = req.params;
  const before = mockBookings.length;
  mockBookings = mockBookings.filter((b) => b.id !== id);
  if (mockBookings.length === before) return res.status(404).json({ error: "not found" });
  return res.json({ success: true });
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
