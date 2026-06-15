export default function decorate(block) {
  const hasPicture = !!block.querySelector('picture');
  if (!hasPicture) {
    block.classList.add('hero-marquee');
    // a paragraph appearing before the heading acts as an eyebrow label
    const content = block.querySelector(':scope > div > div') || block.firstElementChild;
    const heading = content?.querySelector('h1, h2');
    const firstP = content?.querySelector('p');
    if (firstP && heading && heading.previousElementSibling === firstP) {
      firstP.classList.add('hero-eyebrow');
    }
  }
}
