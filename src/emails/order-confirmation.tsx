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

interface OrderConfirmationProps {
  orderId: number
  orderUrl: string
}

export function OrderConfirmationTemplate({ orderId, orderUrl }: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Your ScoopCraft order #${orderId} is confirmed! 🍦`}</Preview>
      <Body style={{ backgroundColor: "#FDF8F4", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 16px rgba(45,36,32,0.07)" }}>
            <Heading style={{ color: "#2D2420", fontSize: "28px", fontWeight: "bold", textAlign: "center", marginBottom: "8px" }}>
              Order Confirmed! 🎉
            </Heading>
            <Text style={{ color: "#6B5D52", textAlign: "center", fontSize: "16px", marginBottom: "16px" }}>
              Your ScoopCraft order #{orderId} has been confirmed and is being prepared with love.
            </Text>
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Button
                href={orderUrl}
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
                View Your Order
              </Button>
            </Section>
            <Text style={{ color: "#8C7B6B", fontSize: "13px", textAlign: "center" }}>
              Thank you for choosing ScoopCraft. We&apos;ll notify you when your order is ready.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationTemplate
