const articleMenuButton = document.querySelector('.article-page .burger');
const articleMenu = document.querySelector('.article-page .nav-links');

if (articleMenuButton && articleMenu) {
  articleMenuButton.addEventListener('click', () => {
    const isOpen = articleMenu.classList.toggle('open');
    articleMenuButton.classList.toggle('active', isOpen);
    articleMenuButton.setAttribute('aria-expanded', String(isOpen));
    articleMenuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  articleMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      articleMenu.classList.remove('open');
      articleMenuButton.classList.remove('active');
      articleMenuButton.setAttribute('aria-expanded', 'false');
      articleMenuButton.setAttribute('aria-label', 'Open menu');
    });
  });
}
