import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailText } from "./components/email-layout";

type VerifyEmailProps = {
  userName?: string | null;
  verifyUrl: string;
};

const buttonStyle = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "12px 18px",
  fontSize: "14px",
  textDecoration: "none",
  display: "inline-block",
};

export function VerifyEmail({ userName, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout
      preview="Bitte bestätigen Sie Ihre E-Mail-Adresse"
      heading="E-Mail-Adresse bestätigen"
    >
      <Text style={emailText}>
        {userName ? `Hallo ${userName},` : "Hallo,"}
      </Text>
      <Text style={emailText}>
        bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
      </Text>
      <Section>
        <Button href={verifyUrl} style={buttonStyle}>
          E-Mail bestätigen
        </Button>
      </Section>
      <Text style={emailText}>
        Falls der Button nicht funktioniert, nutzen Sie diesen Link: {verifyUrl}
      </Text>
    </EmailLayout>
  );
}
