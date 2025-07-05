import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RiskIt - Pouring...",
  description: "Enjoy the pour.",
};

export default function PourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
