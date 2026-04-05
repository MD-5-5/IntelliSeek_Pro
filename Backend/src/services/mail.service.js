// mail.service.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.USER,
            to,
            subject,
            html
        });

        if (error) {
            console.error("Email sending failed:", error);
            throw new Error(error.message);
        }

        console.log("Email sent successfully:", data);
        return data;

    } catch (err) {
        console.error("Mail service error:", err);
        throw err;
    }
}