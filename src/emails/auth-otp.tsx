import { Section, Text } from "@react-email/components";
import { EmailLayout, emailText } from "./components/email-layout";

type OtpEmailProps = {
  userName?: string | null;
  otp: string;
};

const codeBox = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "6px",
  padding: "14px 18px",
  borderRadius: "12px",
  display: "inline-block",
};

export function OtpEmail({ userName, otp }: OtpEmailProps) {
  return (
    <EmailLayout
      preview="Ihr Sicherheitscode"
      heading="Ihr Sicherheitscode"
    >
      <Text style={emailText}>
        {userName ? `Hallo ${userName},` : "Hallo,"}
      </Text>
      <Text style={emailText}>
        hier ist Ihr Einmal‑Code für die Anmeldung:
      </Text>
      <Section>
        <Text style={codeBox}>{otp}</Text>
      </Section>
      <Text style={emailText}>
        Dieser Code ist 5 Minuten gültig.
      </Text>
    </EmailLayout>
  );
}
