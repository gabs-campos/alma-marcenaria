export const metadata = {
  title: "Termos de Serviço",
  description: "Termos de serviço da Alma Marcenaria.",
};

export default function TermosDeServicoPage() {
  return (
    <div className="container py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Termos de Serviço</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Este conteúdo é um placeholder inicial. Antes do lançamento, vamos
          substituir por termos adequados ao processo de orçamento, prazos,
          pagamentos, entregas e política de trocas/devoluções.
        </p>
        <p>
          Se você já tiver um texto jurídico, podemos inserir aqui mantendo a
          mesma identidade visual e boa legibilidade.
        </p>
      </div>
    </div>
  );
}

