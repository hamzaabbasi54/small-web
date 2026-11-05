import { sanitizeSiteHtml } from './html-sanitizer';

// One test per threat the sanitizer is responsible for.
describe('sanitizeSiteHtml', () => {
  it('removes <script> and keeps the text around it', () => {
    const { safeHtml } = sanitizeSiteHtml('<p>before</p><script>alert(1)</script><p>after</p>');
    expect(safeHtml).toBe('<p>before</p><p>after</p>');
  });

  it('removes event handler attributes', () => {
    const { safeHtml } = sanitizeSiteHtml('<p onclick="steal()" onerror="steal()">hi</p>');
    expect(safeHtml).toBe('<p>hi</p>');
  });

  it('turns a javascript: link into inert data', () => {
    const { safeHtml } = sanitizeSiteHtml('<a href="javascript:alert(1)">x</a>');
    expect(safeHtml).toBe('<a href="#" data-addr="javascript:alert(1)">x</a>');
  });

  it('turns an address link into data the browser can follow', () => {
    const { safeHtml } = sanitizeSiteHtml('<a href="lighthouse.zz">the lighthouse</a>');
    expect(safeHtml).toBe('<a href="#" data-addr="lighthouse.zz">the lighthouse</a>');
  });

  it('removes iframe, form, img, meta, base and link', () => {
    const { safeHtml } = sanitizeSiteHtml(
      '<iframe src="x"></iframe><form><input></form><img src="x">' +
        '<meta http-equiv="refresh" content="0"><base href="x"><link rel="stylesheet" href="x">' +
        '<p>kept</p>',
    );
    expect(safeHtml).toBe('<p>kept</p>');
  });

  it('keeps <style> blocks and style attributes', () => {
    const { safeHtml } = sanitizeSiteHtml(
      '<style>h1 { color: teal; }</style><h1 style="font-size: 2em">Tide</h1>',
    );
    expect(safeHtml).toBe('<style>h1 { color: teal; }</style><h1 style="font-size:2em">Tide</h1>');
  });

  it('extracts plain text with no tags and collapsed whitespace', () => {
    const { text } = sanitizeSiteHtml(
      '<style>p { color: red; }</style><h1>Tide</h1>\n\n<p>Low   tide,\n rock pools.</p>',
    );
    expect(text).toBe('Tide Low tide, rock pools.');
  });
});
