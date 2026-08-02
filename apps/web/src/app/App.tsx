export function App() {
  return (
    <main className="app-placeholder">
      <section>
        <p className="app-placeholder__brand">PapaData</p>

        <h1>Nowy frontend jest gotowy do budowy.</h1>

        <p>
          Repozytorium zawiera czystą aplikację React oraz pełny katalog
          Storybooka. Ekrany produkcyjne nie zostały jeszcze zaimplementowane.
        </p>

        <dl>
          <div>
            <dt>Frontend</dt>
            <dd>pnpm dev:web</dd>
          </div>

          <div>
            <dt>Storybook</dt>
            <dd>pnpm storybook</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
