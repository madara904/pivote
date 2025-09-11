import { Resend } from 'resend';

interface sendEmailProps {
    to: string,
    subject: string,
    text: string
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail( {to, subject, text}: sendEmailProps)
{
    const { data, error } = await resend.emails.send({
        from: "no-reply@pivote.de",
        subject: subject,
        html: text,
        to: to
    })
}