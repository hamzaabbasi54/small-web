interface NowherePageProps {
  address: string;
}

// Shown when no site lives at an address: a broken link, a typo, or something that never existed.
// This is a normal page state, not an error.
export function NowherePage({ address }: NowherePageProps) {
  return (
    <section className="nowhere">
      <h1>Nowhere</h1>
      <p>
        Nothing lives at <code>{address}</code>.
      </p>
      <p>Check the address for typos, or search for what you were looking for.</p>
    </section>
  );
}
