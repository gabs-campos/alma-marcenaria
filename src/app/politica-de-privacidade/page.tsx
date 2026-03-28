export const metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade da Alma Marcenaria.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="container py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">
        Política de Privacidade
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Este conteúdo é um placeholder inicial. Antes do lançamento, vamos
          detalhar quais dados são coletados (ex: CEP, e-mail, WhatsApp), para
          qual finalidade (orçamento/compra) e como são armazenados.
        </p>
        <p>
          Também vamos incluir informações de contato e direitos do titular de
          dados conforme a LGPD.
        </p>
      </div>
    </div>
  );
}

