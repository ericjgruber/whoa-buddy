const observer = new MutationObserver(() => {
  highlightProductionCards();
});

function highlightProductionCards() {
  const titleLinks = document.querySelectorAll('[data-test-id="env-title"]');

  titleLinks.forEach((link) => {
    const name = link.textContent.toLowerCase();
    const title = (link.title || '').toLowerCase();
    const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();

    const preProdTerms = ['preprod', 'pre-prod', 'pre prod'];
    const containsAny = (str, terms) => terms.some(term => str.includes(term));

    const isPreProd = 
      containsAny(name, preProdTerms) ||
      containsAny(title, preProdTerms) ||
      containsAny(ariaLabel, preProdTerms);

    const isProd = !isPreProd && (
      name.includes('prod') ||
      title.includes('prod') ||
      ariaLabel.includes('prod')
    );
    
    if (isProd) {
      const card = link.closest('dxp-card');
      if (card) {
        card.style.outline = '4px solid red';
        card.style.boxShadow = '0 0 12px rgba(255, 0, 0, 0.6)';
        card.style.position = 'relative';

        if (!card.querySelector('.whoa-buddy-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'whoa-buddy-overlay';
          const prodText = document.createElement('div');
          prodText.textContent = 'PROD';

          const subText = document.createElement('div');
          subText.textContent = '(click to proceed)';
          subText.style.fontSize = '1rem';
          subText.style.marginTop = '0.5rem';

          overlay.appendChild(prodText);
          overlay.appendChild(subText);

          overlay.style.cssText = `
            position: absolute;
            inset: 0;
            background: rgba(255, 0, 0, 0.75);
            color: white;
            font-size: 2rem;
            font-weight: bold;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.4s ease;
          `;

          overlay.addEventListener('click', () => {
            observer.disconnect();
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
              overlay.remove();
            }, 400);
            setTimeout(() => {
              overlay.style.opacity = '0';
              card.appendChild(overlay);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  overlay.style.opacity = '1';
                  overlay.style.pointerEvents = '';
                });
              });
              observer.observe(document.body, { childList: true, subtree: true });
            }, 5000);
          });

          card.appendChild(overlay);
        }
      }
    }

  });
}

highlightProductionCards();

observer.observe(document.body, {
  childList: true,
  subtree: true
});