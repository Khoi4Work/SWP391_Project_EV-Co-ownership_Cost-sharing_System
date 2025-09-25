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

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
