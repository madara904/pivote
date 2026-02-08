import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailText } from "./components/email-layout";

type ConnectionInviteProps = {
  shipperName: string;
  inviteUrl: string;
};

const buttonStyle = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "12px 18px",
  fontSize: "14px",
  textDecoration: "none",
  display: "inline-block",
};

export function ConnectionInvite({ shipperName, inviteUrl }: ConnectionInviteProps) {
  return (
    <EmailLayout
      preview={`Neue Verbindungsanfrage von ${shipperName}`}
      heading="Neue Verbindungsanfrage"
    >
      <Text style={emailText}>
        Sie wurden von <strong>{shipperName}</strong> eingeladen, eine Verbindung
        aufzubauen.
      </Text>
      <Section>
        <Button href={inviteUrl} style={buttonStyle}>
          Einladung ansehen
        </Button>
      </Section>
      <Text style={emailText}>
        Falls der Button nicht funktioniert, nutzen Sie diesen Link: {inviteUrl}
      </Text>
    </EmailLayout>
  );
}
