require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rate limit: 6 contact submissions per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: { message: "Too many requests, please try later." },
});
app.use("/api/contact", limiter);

// Sanitize helper
function sanitize(str) {
  if (!str) return "";
  return String(str).replace(/<[^>]*>?/gm, "").trim();
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Contact route
app.post("/api/contact", async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const subject = sanitize(req.body.subject || "New message from portfolio");
    const message = sanitize(req.body.message);

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Send email via Resend
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.TO_EMAIL,
      subject: `${subject} — ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.json({ message: "Message delivered. Thank you!" });
  } catch (err) {
    console.error("contact error:", err);
    return res
      .status(500)
      .json({ message: "Unable to send message. Try again later." });
  }
});

// SPA fallback (for direct page reloads)
app.use((req, res) =>
  res.sendFile(path.join(__dirname, "public", "poo.html"))
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
