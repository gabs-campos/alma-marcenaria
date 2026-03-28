export const metadata = {
  title: "Quem Somos",
  description: "Conheça a história e o processo da Alma Marcenaria.",
};

export default function QuemSomosPage() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Quem Somos</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          A Alma Marcenaria nasce do encontro entre desenho, função e matéria.
          Criamos peças com presença, feitas para durar e para contar história.
        </p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-alma-700">
            Processo
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Do briefing ao desenho técnico, da escolha da madeira ao acabamento,
            cada etapa é feita com cuidado. O objetivo é traduzir o seu espaço
            em uma peça que tenha proporção, textura e conforto visual.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Em breve vamos enriquecer esta página com fotos e detalhes do
            ateliê, mantendo uma navegação limpa e rápida.
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-alma-700">
            Materiais
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Trabalhamos com madeiras, lâminas e acabamentos selecionados,
            priorizando durabilidade e estética natural.
          </p>
        </div>
      </section>
    </div>
  );
}

