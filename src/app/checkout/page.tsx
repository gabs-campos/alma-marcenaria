import { CheckoutClient } from "@/components/store/CheckoutClient";

export const metadata = {
  title: "Checkout / Contato",
  description:
    "Finalize seu pedido ou solicite orçamento: informe CEP, e-mail e WhatsApp.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

