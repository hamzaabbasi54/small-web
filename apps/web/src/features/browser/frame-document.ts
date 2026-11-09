// Builds the full HTML document that goes into the sandboxed iframe's srcdoc: the site's
// sanitized HTML, our base styles, and one small "bridge" script that is the only script allowed
// to run. Layer 2 of containment (layer 1 is the sanitizer in the API).

export const FRAME_MESSAGE_SOURCE = 'smallweb-frame';

// Scroll is reported once scrolling pauses for this long, not on every frame.
const SCROLL_REPORT_DELAY_MS = 100;

interface FrameDocumentOptions {
  safeHtml: string;
  restoreY: number; // scroll position to return to, 0 for a fresh visit
  nonce: string; // fresh random value per render; only a script carrying it may run
  parentOrigin: string; // our own origin; the bridge only posts messages to it
}

// JSON inside a <script> could close the tag early with "</script>"; escaping "<" prevents that.
function toScriptLiteral(value: string | number): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

// What the bridge does, inside the frame:
// - a click on a link sends { type: 'navigate', address } to the parent instead of following it
//   (every link is href="#" with the destination in data-addr, see the API's html-sanitizer)
// - scrolling sends { type: 'scroll', y } so the parent can restore the position later
// - on load it scrolls back to restoreY, retrying until the frame is tall enough to get there
function bridgeScript(restoreY: number, parentOrigin: string): string {
  return `
(function () {
  var SOURCE = ${toScriptLiteral(FRAME_MESSAGE_SOURCE)};
  var PARENT_ORIGIN = ${toScriptLiteral(parentOrigin)};
  function send(message) {
    message.source = SOURCE;
    window.parent.postMessage(message, PARENT_ORIGIN);
  }
  document.addEventListener('click', function (event) {
    var link = event.target instanceof Element ? event.target.closest('a') : null;
    if (!link) return;
    event.preventDefault();
    send({ type: 'navigate', address: link.getAttribute('data-addr') || '' });
  });
  var scrollTimer = null;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      send({ type: 'scroll', y: window.scrollY });
    }, ${toScriptLiteral(SCROLL_REPORT_DELAY_MS)});
  });
  // When load fires the frame may not have its final size yet, and the browser cuts a scroll past
  // the bottom short (often to 0). So try again on each animation frame until the position holds,
  // giving up after about a second.
  var RESTORE_Y = ${toScriptLiteral(restoreY)};
  var restoreTries = 0;
  function restoreScroll() {
    window.scrollTo(0, RESTORE_Y);
    restoreTries += 1;
    if (Math.abs(window.scrollY - RESTORE_Y) > 1 && restoreTries < 60) {
      requestAnimationFrame(restoreScroll);
    }
  }
  window.addEventListener('load', restoreScroll);
})();`;
}

export function buildFrameDocument({
  safeHtml,
  restoreY,
  nonce,
  parentOrigin,
}: FrameDocumentOptions): string {
  // Content-Security-Policy, the second net under the sanitizer:
  // - default-src 'none': no network at all from the frame (no images, fonts, fetches, CSS url())
  // - style-src 'unsafe-inline': authors keep their <style> blocks and style attributes
  // - script-src 'nonce-…': only our bridge script runs; any <script> that slipped past the
  //   sanitizer has no nonce and is refused
  // - base-uri 'none' / form-action 'none': no <base> link hijacking, no form submissions
  const csp = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    `script-src 'nonce-${nonce}'`,
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>
  body { margin: 0 auto; max-width: 42rem; padding: 2rem 1.5rem; font-family: Georgia, serif;
         line-height: 1.6; color: #1d2329; background: #fff; }
  a { color: #1d5fa8; cursor: pointer; }
</style>
</head>
<body>
${safeHtml}
<script nonce="${nonce}">${bridgeScript(restoreY, parentOrigin)}</script>
</body>
</html>`;
}
