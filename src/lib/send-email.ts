import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";

interface sendEmailProps {
    to: string,
    subject: string,
    text?: string,
    html?: string,
    react?: ReactElement
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, text, html, react }: sendEmailProps) {
    const htmlFromReact = react ? await render(react) : undefined;
    const textFromReact = react ? await render(react, { plainText: true }) : undefined;
    const payloadHtml = html ?? htmlFromReact ?? "";
    const payloadText = text ?? textFromReact ?? "";

    const { error } = await resend.emails.send({
        from: "no-reply@pivote.de",
        subject: subject,
        to: to,
        html: payloadHtml,
        text: payloadText,
    });
    if (error) {
        throw new Error(error.message || "E-Mail konnte nicht gesendet werden.");
    }
}