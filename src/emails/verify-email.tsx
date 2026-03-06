import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface VerifyEmailProps {
  verifyUrl: string
  email: string
}

export function VerifyEmailTemplate({ verifyUrl, email }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to start scooping 🍦</Preview>
      <Body style={{ backgroundColor: "#FDF8F4", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 16px rgba(45,36,32,0.07)" }}>
            <Heading style={{ color: "#2D2420", fontSize: "28px", fontWeight: "bold", textAlign: "center", marginBottom: "8px" }}>
              Welcome to ScoopCraft! 🍦
            </Heading>
            <Text style={{ color: "#6B5D52", textAlign: "center", fontSize: "16px", marginBottom: "32px" }}>
              You&apos;re almost ready to start building your perfect scoops. Verify your email to activate your account.
            </Text>
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Button
                href={verifyUrl}
                style={{
                  backgroundColor: "#D4536A",
                  color: "#ffffff",
                  padding: "14px 32px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Verify Email Address
              </Button>
            </Section>
            <Text style={{ color: "#8C7B6B", fontSize: "13px", textAlign: "center" }}>
              This link expires in 24 hours. If you didn&apos;t create an account with ScoopCraft, you can safely ignore this email.
            </Text>
            <Text style={{ color: "#8C7B6B", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
              Verifying for: {email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default VerifyEmailTemplate
