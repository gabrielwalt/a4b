import { getMetadata } from '../../scripts/aem.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer fragment; default to a sibling of the current page so it
  // resolves both locally (e.g. /content/footer) and in production (e.g. /footer)
  const footerMeta = getMetadata('footer');
  const dir = window.location.pathname.replace(/[^/]+$/, '');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `${dir}footer`;
  const resp = await fetch(`${footerPath}.plain.html`);
  if (!resp.ok) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = await resp.text();

  // resolve fragment-relative media paths against the fragment base (matches loadFragment)
  const resetBase = (tag, attr) => {
    fragment.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((el) => {
      el[attr] = new URL(el.getAttribute(attr), new URL(footerPath, window.location)).href;
    });
  };
  resetBase('img', 'src');
  resetBase('source', 'srcset');

  // the section containing the social/legal content is the bottom bar;
  // everything before it forms the link columns (grouped by heading)
  const groups = [...fragment.children];
  const legal = groups.pop();

  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  // each heading begins a column group; collect the heading and following content
  const groupEls = [];
  groups.forEach((group) => {
    let current = null;
    [...group.children].forEach((el) => {
      if (el.tagName === 'H3') {
        current = document.createElement('div');
        current.className = 'footer-column';
        groupEls.push(current);
      }
      if (current) current.append(el);
    });
  });
  // the first two heading groups (Contact us + Our solutions) share one column
  if (groupEls.length > 5) {
    const [first, second] = groupEls;
    while (second.firstChild) first.append(second.firstChild);
    second.remove();
    groupEls.splice(1, 1);
  }
  groupEls.forEach((col) => columns.append(col));

  if (legal) {
    legal.classList.add('footer-legal');
    const lists = legal.querySelectorAll('ul');
    if (lists[0]) lists[0].classList.add('footer-social');
    if (lists[1]) lists[1].classList.add('footer-legal-links');
    legal.querySelectorAll(':scope > p').forEach((p) => {
      if (p.querySelector('img')) p.classList.add('footer-brand');
      else if (p.querySelector('a')) p.classList.add('footer-locale');
      else p.classList.add('footer-copyright');
    });
  }

  const footer = document.createElement('div');
  footer.append(columns);
  if (legal) footer.append(legal);

  block.textContent = '';
  block.append(footer);
}
