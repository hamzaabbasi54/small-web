import sanitizeHtml from 'sanitize-html';

// Longest link destination we keep. Anything longer is cut, so a link can't carry a huge payload.
const MAX_LINK_LENGTH = 300;

// Layer 1 of containing HTML we didn't write: an allowlist. Any tag or attribute not listed here
// is removed, which drops script, iframe, object, embed, form, input, button, meta, link, base,
// img, svg, math, video, audio and every on* event handler.
// Layer 2 is the sandboxed iframe on the web side; either layer alone contains the page.
// Cost to authors: structure, text, tables, lists and CSS only. No JavaScript, images or forms.
const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'div',
  'span',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'main',
  'aside',
  'br',
  'hr',
  'blockquote',
  'pre',
  'code',
  'em',
  'strong',
  'b',
  'i',
  'u',
  's',
  'small',
  'sub',
  'sup',
  'mark',
  'abbr',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'figure',
  'figcaption',
  'a',
  'style',
];

const SITE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    '*': ['class', 'id', 'title', 'lang', 'dir', 'style'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    a: ['href', 'data-addr'],
  },
  // <style> counts as "vulnerable" to sanitize-html. We allow it on purpose: its CSS only affects
  // the sandboxed iframe it renders in, and the iframe's CSP blocks any url() it tries to load.
  allowVulnerableTags: true,
  transformTags: {
    // Every link becomes inert data: href="#" goes nowhere, and data-addr holds where the author
    // pointed. The frame asks the browser to go there; the browser validates it as an address.
    // javascript:, https://... and anything else just become addresses that lead to Nowhere.
    a: (_tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        href: '#',
        'data-addr': (attribs.href ?? '').trim().slice(0, MAX_LINK_LENGTH),
      },
    }),
  },
};

// The same input with every tag removed, for search and snippets.
const TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  // Drop the contents of these entirely, so CSS or code never shows up as "text".
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
};

interface SanitizedSite {
  safeHtml: string;
  text: string;
}

export function sanitizeSiteHtml(rawHtml: string): SanitizedSite {
  const safeHtml = sanitizeHtml(rawHtml, SITE_OPTIONS);
  const text = sanitizeHtml(rawHtml, TEXT_OPTIONS).replace(/\s+/g, ' ').trim();
  return { safeHtml, text };
}
