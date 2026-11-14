export function ScreenPlaceholder({ title }: { title: string }) {
  return (
    <section className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold tracking-wide">{title}</h1>
      <p className="mt-2 font-mono text-sm text-dim">Not built yet.</p>
    </section>
  )
}
