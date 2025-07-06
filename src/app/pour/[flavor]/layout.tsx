import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immersive Product Experience",
  description: "Enjoy the pour.",
};

export default function PourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
