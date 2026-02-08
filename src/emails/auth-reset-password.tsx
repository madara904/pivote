import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailText } from "./components/email-layout";

type ResetPasswordProps = {
  userName?: string | null;
  resetUrl: string;
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

export function ResetPassword({ userName, resetUrl }: ResetPasswordProps) {
  return (
    <EmailLayout
      preview="Passwort zurücksetzen"
      heading="Passwort zurücksetzen"
    >
      <Text style={emailText}>
        {userName ? `Hallo ${userName},` : "Hallo,"}
      </Text>
      <Text style={emailText}>
        klicken Sie auf den Button, um Ihr Passwort zurückzusetzen.
      </Text>
      <Section>
        <Button href={resetUrl} style={buttonStyle}>
          Passwort zurücksetzen
        </Button>
      </Section>
      <Text style={emailText}>
        Falls der Button nicht funktioniert, nutzen Sie diesen Link: {resetUrl}
      </Text>
    </EmailLayout>
  );
}
