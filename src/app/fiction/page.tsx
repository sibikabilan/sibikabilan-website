import type { Metadata } from "next";
import { FictionContent } from "./FictionContent";

export const metadata: Metadata = {
  title: "Fiction",
  description:
    "Stories and worlds by Sibi Kabilan. Fiction writing exploring the human side of technology. Coming soon.",
};

export default function FictionPage() {
  return <FictionContent />;
}
