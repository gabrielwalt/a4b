export default function decorate(block) {
  // a cta with an image becomes a two-column split layout
  const hasImage = !!block.querySelector('picture');
  if (hasImage) {
    block.classList.add('cta-split');
    [...block.querySelectorAll(':scope > div > div')].forEach((col) => {
      if (col.children.length === 1 && col.querySelector('picture')) {
        col.classList.add('cta-image');
      } else {
        col.classList.add('cta-text');
      }
    });
  } else {
    block.classList.add('cta-centered');
  }
}
