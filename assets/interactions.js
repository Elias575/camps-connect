(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const app = document.getElementById('app');
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (!reducedMotion.matches && target.animate) {
          target.animate([
            {opacity:0, transform:'translateY(18px)'},
            {opacity:1, transform:'translateY(0)'}
          ], {duration:480, delay:Number(target.dataset.ccDelay || 0), easing:'cubic-bezier(.22,1,.36,1)'});
        }
      });
    }, {threshold:0.08});
  }
  function enhancePage() {
    observer?.disconnect();
    // Search replaces the page at every keystroke; keep its results steady.
    if (document.activeElement?.id !== 'search') {
      app.querySelectorAll('.card,.panel,.introarmador,.detailhero,.fleet .container,.warning,.guide-figure').forEach((element, i) => {
        element.dataset.ccDelay = String((i % 5) * 45);
        observer?.observe(element);
      });
    }
    const check = app.querySelector('.check');
    if (check) {
      const progress = document.createElement('div');
      progress.className = 'cc-check-progress';
      progress.innerHTML = '<span role="status" aria-live="polite"></span><progress aria-label="Progresso do checklist"></progress>';
      check.before(progress);
      updateProgress();
    }
  }
  function updateProgress() {
    const progress = app.querySelector('.cc-check-progress');
    if (!progress) return;
    const checks = app.querySelectorAll('.check input[type="checkbox"]');
    const done = [...checks].filter(input => input.checked).length;
    progress.querySelector('span').textContent = done === checks.length ? 'Conferência concluída!' : `${done} de ${checks.length} itens conferidos`;
    const bar = progress.querySelector('progress');
    bar.max = checks.length;
    bar.value = done;
  }
  if (app) {
    new MutationObserver(enhancePage).observe(app, {childList:true});
    app.addEventListener('change', updateProgress);
    enhancePage();
  }
  const password = document.getElementById('senha');
  if (password) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cc-password-toggle';
    toggle.textContent = 'Mostrar senha';
    toggle.setAttribute('aria-controls', 'senha');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.addEventListener('click', () => {
      const visible = password.type === 'password';
      password.type = visible ? 'text' : 'password';
      toggle.textContent = visible ? 'Ocultar senha' : 'Mostrar senha';
      toggle.setAttribute('aria-pressed', String(visible));
    });
    password.after(toggle);
  }
  const backTop = document.createElement('button');
  backTop.className = 'cc-back-top';
  backTop.type = 'button';
  backTop.textContent = '↑';
  backTop.setAttribute('aria-label', 'Voltar ao topo');
  backTop.hidden = true;
  document.body.append(backTop);
  function updateScroll() { backTop.hidden = window.scrollY < 450 || !document.body.classList.contains('camps-autenticado'); }
  window.addEventListener('scroll', updateScroll, {passive:true});
  backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:reducedMotion.matches ? 'instant' : 'smooth'}));
  document.addEventListener('click', event => {
    if (reducedMotion.matches || !event.detail || !event.target.closest('button,.linkbtn')) return;
    const wave = document.createElement('span');
    wave.className = 'cc-click-wave';
    wave.setAttribute('aria-hidden', 'true');
    wave.style.left = `${event.clientX - 8}px`;
    wave.style.top = `${event.clientY - 8}px`;
    document.body.append(wave);
    wave.addEventListener('animationend', () => wave.remove(), {once:true});
    setTimeout(() => wave.remove(), 600);
  });
})();
