export function PlaceholderPage({ title, note }: { title: string; note: string }) {
  return (
    <section className="page">
      <header className="page-header">
        <h2>{title}</h2>
        <p>{note}</p>
      </header>
    </section>
  )
}
