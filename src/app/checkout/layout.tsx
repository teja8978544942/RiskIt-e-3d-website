import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - RiskIt",
  description: "Complete your RiskIt order.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
