const nodemailer = require("nodemailer");

const otpStore = {};

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP ERROR:", error.message);
    } else {
        console.log("SMTP READY");
    }
});

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Sistem Kamu" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Kode OTP Verifikasi",
            html: `
                <h2>Kode OTP kamu:</h2>
                <h1>${otp}</h1>
                <p>Berlaku 5 menit</p>
            `
        });
        console.log("📧 OTP terkirim ke:", email);
    } catch (err) {
        console.error("❌ EMAIL ERROR:", err.message);
        throw new Error("Gagal mengirim email");
    }
};

const saveOTP = (email, otp) => {
    otpStore[email] = {
        otp,
        expiredAt: Date.now() + 5 * 60 * 1000
    };
    console.log(`OTP untuk ${email}: ${otp}`); 
};

const verifyOTP = (email, otpInput) => {
    const data = otpStore[email];

    if (!data) return { status: false, message: "OTP tidak ditemukan" };
    if (Date.now() > data.expiredAt) {
        delete otpStore[email];
        return { status: false, message: "OTP expired" };
    }
    if (data.otp !== otpInput) return { status: false, message: "OTP salah" };

    delete otpStore[email];
    return { status: true };
};

module.exports = { generateOTP, sendOTP, saveOTP, verifyOTP };