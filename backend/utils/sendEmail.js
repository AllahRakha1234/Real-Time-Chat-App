import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"SmartTalk" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Email could not be sent");
    }
};
