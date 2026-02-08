import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailText } from "./components/email-layout";

type ConnectionAcceptedProps = {
  forwarderName: string;
  dashboardUrl: string;
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

export function ConnectionAccepted({ forwarderName, dashboardUrl }: ConnectionAcceptedProps) {
  return (
    <EmailLayout
      preview={`${forwarderName} hat die Verbindung angenommen`}
      heading="Verbindung angenommen"
    >
      <Text style={emailText}>
        <strong>{forwarderName}</strong> hat die Verbindung angenommen. Sie können
        nun Anfragen an diesen Spediteur senden.
      </Text>
      <Section>
        <Button href={dashboardUrl} style={buttonStyle}>
          Zum Dashboard
        </Button>
      </Section>
      <Text style={emailText}>
        Falls der Button nicht funktioniert, nutzen Sie diesen Link: {dashboardUrl}
      </Text>
    </EmailLayout>
  );
}
