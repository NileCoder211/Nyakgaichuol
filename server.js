require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");

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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.TO_EMAIL || process.env.GMAIL_USER,
      subject: `${subject} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, "<br>")}</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "Message delivered. Thank you!" });
  } catch (err) {
    console.error("contact error", err.message ,err);
    return res.status(500).json({ message: "Unable to send message. Try again later." });
  }
});

// SPA fallback
app.use((req, res) =>
  res.sendFile(path.join(__dirname, "public", "poo.html"))
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
