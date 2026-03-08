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

interface PasswordResetProps {
  resetUrl: string
  email: string
}

export function PasswordResetTemplate({ resetUrl, email }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your ScoopCraft password</Preview>
      <Body style={{ backgroundColor: "#FDF8F4", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 16px rgba(45,36,32,0.07)" }}>
            <Heading style={{ color: "#2D2420", fontSize: "28px", fontWeight: "bold", textAlign: "center", marginBottom: "8px" }}>
              Reset Your Password
            </Heading>
            <Text style={{ color: "#6B5D52", textAlign: "center", fontSize: "16px", marginBottom: "32px" }}>
              We received a request to reset the password for your ScoopCraft account. Click the button below to choose a new password.
            </Text>
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Button
                href={resetUrl}
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
                Reset Password
              </Button>
            </Section>
            <Text style={{ color: "#8C7B6B", fontSize: "13px", textAlign: "center" }}>
              This link expires in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email — your password will not change.
            </Text>
            <Text style={{ color: "#8C7B6B", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
              Account: {email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default PasswordResetTemplate
