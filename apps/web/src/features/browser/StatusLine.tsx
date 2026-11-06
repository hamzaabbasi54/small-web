interface StatusLineProps {
  text: string;
}

// One line under the chrome saying what the browser is doing: Loading, Shown, Nowhere, …
export function StatusLine({ text }: StatusLineProps) {
  return (
    <p className="status-line" role="status">
      {text}
    </p>
  );
}
