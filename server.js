// server.js (nâng cấp debug + rõ ràng hơn)
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();
const {
  MAILTRAP_USER,
  MAILTRAP_PASS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  PORT = 5000,
} = process.env;
console.log("🔍 ENV check:", {
  hasMail: !!MAILTRAP_USER,
  hasTwilioSid: !!TWILIO_ACCOUNT_SID,
  hasTwilioToken: !!TWILIO_AUTH_TOKEN,
  twilioPhone: TWILIO_PHONE,
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

// --- Twilio setup ---
const twilioClient =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
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

    // --- SMS ---
    if (method === "sms") {
      if (!twilioClient) {
        console.error("❌ [/send-otp] Twilio client not configured");
        return res
          .status(500)
          .json({ success: false, error: "Twilio not configured on server" });
      }

      const to = normalizeE164(destination);
      if (!to) {
        console.error("❌ [/send-otp] Invalid phone format:", destination);
        return res.status(400).json({
          success: false,
          error: "Invalid destination phone format. Use E.164 or leading 0 for VN.",
        });
      }

      console.log("📲 [/send-otp] Sending SMS", {
        from: TWILIO_PHONE,
        to,
        otp,
      });

      try {
        const result = await twilioClient.messages.create({
          body: `EcoShare OTP: ${otp}`,
          from: TWILIO_PHONE,
          to,
        });
        console.log("✅ [/send-otp] Twilio result:", {
          sid: result.sid,
          status: result.status,
        });
        return res.json({
          success: true,
          channel: "sms",
          sid: result.sid,
          status: result.status,
        });
      } catch (twilioErr) {
        console.error("❌ [/send-otp] Twilio error (full):", twilioErr);
        return res.status(500).json({
          success: false,
          error: "Twilio error",
          twilio: {
            message: twilioErr.message,
            code: twilioErr.code,
            moreInfo: twilioErr.moreInfo,
            status: twilioErr.status,
          },
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
