import { Body, Container, Head, Html, Img, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

type EmailLayoutProps = {
  preview: string;
  heading: string;
  children: ReactNode;
};

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  margin: "0 auto",
  padding: "32px 20px 48px",
  maxWidth: "560px",
};

const header = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px",
};

const brandText = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0",
};

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "28px",
};

const title = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 12px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#475569",
  margin: "0 0 16px",
};

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "28px",
};

export function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  const brandLogoUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/favicon.svg`
    : undefined;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {brandLogoUrl && (
              <Img src={brandLogoUrl} width="26" height="26" alt="Pivote" />
            )}
            <Text style={brandText}>Pivote</Text>
          </Section>
          <Section style={card}>
            <Text style={title}>{heading}</Text>
            <Section>{children}</Section>
          </Section>
          <Text style={footer}>
            Diese Nachricht wurde automatisch versendet. Bitte antworten Sie nicht auf diese E-Mail.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const emailText = paragraph;
