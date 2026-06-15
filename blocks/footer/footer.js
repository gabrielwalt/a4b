import { getMetadata } from '../../scripts/aem.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  let resp = await fetch(`${footerPath}.plain.html`);
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;

  // resolve fragment-relative image paths against the footer path
  container.querySelectorAll('img[src^="images/"], img[src^="./images/"]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), new URL(footerPath, window.location)).href;
  });

  const sections = [...container.children];
  const [columns, legal] = sections;

  if (columns) {
    columns.classList.add('footer-columns');
    [...columns.children].forEach((col) => col.classList.add('footer-column'));
  }

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

  block.textContent = '';
  block.append(...sections);
}
