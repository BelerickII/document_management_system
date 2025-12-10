import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer'

@Injectable()
export class emailService {
    private transporter: nodemailer.Transporter;
    private logger = new Logger('emailService');

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: user ? { user, pass }: undefined,
        });

        this.transporter.verify().catch((err) => {
            this.logger.warn('SMTP verify failed (check config): ' + err?.message);
        });
    }

    async sendRejectionEmail(toEmail: string, studentName: string, comment: string, documentName: string) {
        const subject = 'DOCUMENT REJECTED';
        const html = `
            <h2>DOCUMENT REJECTED!</h2>
            <p> Hi ${studentName || 'Student'},</p>
            <p>Your ${documentName} document was rejected by our staff for the following reason:</p>
            <blockquote>${comment}</blockquote>
            <p>Please re-upload the document after making the necessary changes.</p>
        `;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: toEmail,
            subject,
            html,
        };

        return this.transporter.sendMail(mailOptions);
    }
}