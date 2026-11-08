import type { Metadata } from "next";
import InitWizard from "./InitWizard";

export const metadata: Metadata = {
  title: "Forum Installation",
  description: "Configure your forum and administrator account.",
};

export default function InitPage() {
  return <InitWizard />;
}
