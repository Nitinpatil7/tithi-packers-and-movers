const ALLOWED_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'span']);
const ALLOWED_ATTRIBUTES = {
  a: new Set(['href', 'title', 'target', 'rel']),
  span: new Set(['class']),
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const decodeHtmlEntities = (value = '') => {
  const input = String(value || '');
  if (typeof window === 'undefined' || !/[&][a-zA-Z#0-9]+;/.test(input)) return input;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
};

export const htmlFromPlainText = (value = '') => String(value || '')
  .split(/\n{2,}|\r?\n/)
  .map((paragraph) => paragraph.trim())
  .filter(Boolean)
  .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
  .join('');

export const sanitizeAdminHtml = (value = '') => {
  const decoded = decodeHtmlEntities(value);
  const html = /<\/?[a-z][\s\S]*>/i.test(decoded) ? decoded : htmlFromPlainText(decoded);
  if (typeof window === 'undefined' || !window.DOMParser) return htmlFromPlainText(decoded);

  const documentNode = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = documentNode.body.firstElementChild;

  const cleanNode = (node) => {
    if (node.nodeType === window.Node.TEXT_NODE) return documentNode.createTextNode(node.textContent || '');
    if (node.nodeType !== window.Node.ELEMENT_NODE) return documentNode.createTextNode('');

    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = documentNode.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => fragment.appendChild(cleanNode(child)));
      return fragment;
    }

    const clean = documentNode.createElement(tag);
    const allowedAttributes = ALLOWED_ATTRIBUTES[tag] || new Set();
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const attrValue = attribute.value || '';
      if (!allowedAttributes.has(name)) return;
      if (name === 'href' && /^(javascript:|data:)/i.test(attrValue.trim())) return;
      clean.setAttribute(name, attrValue);
    });

    if (tag === 'a') {
      clean.setAttribute('rel', 'noopener noreferrer');
      if (clean.getAttribute('target') === '_blank') clean.setAttribute('target', '_blank');
    }

    Array.from(node.childNodes).forEach((child) => clean.appendChild(cleanNode(child)));
    return clean;
  };

  const container = documentNode.createElement('div');
  Array.from(root?.childNodes || []).forEach((child) => container.appendChild(cleanNode(child)));
  return container.innerHTML;
};
