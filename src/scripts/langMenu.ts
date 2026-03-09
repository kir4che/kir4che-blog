(() => {
  const root = '[data-lang-menu]';
  const toggle = '[data-lang-menu-toggle]';
  const list = '[data-lang-menu-list]';
  const item = '[data-lang-menu-item]';
  const hoverAttr = 'data-lang-menu-hover';

  const initMenu = (menu: HTMLElement & { __langMenuBound?: boolean }) => {
    // 同一 menu 只初始化一次
    if (menu.__langMenuBound) return;
    menu.__langMenuBound = true;

    const btn = menu.querySelector<HTMLElement>(toggle);
    const panel = menu.querySelector<HTMLElement>(list);
    if (!btn || !panel) return;

    let isOpen = false;

    const open = () => {
      isOpen = true;
      panel.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      isOpen = false;
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen ? close() : open();
    });

    if (menu.hasAttribute(hoverAttr)) {
      let timer: number | undefined;
      const scheduleClose = () => {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(close, 120); // 延遲關閉避免滑鼠誤點
      };
      const cancelClose = () => {
        if (timer) window.clearTimeout(timer);
      };

      btn.addEventListener('mouseenter', open);
      btn.addEventListener('mouseleave', scheduleClose);
      panel.addEventListener('mouseenter', cancelClose);
      panel.addEventListener('mouseleave', scheduleClose);
    }

    menu.querySelectorAll<HTMLElement>(item).forEach((el) => el.addEventListener('click', close));
  };

  // 關閉頁面上所有 menu
  const closeAll = () => {
    document.querySelectorAll<HTMLElement>(list).forEach((el) => el.classList.add('hidden'));
    document
      .querySelectorAll<HTMLElement>(toggle)
      .forEach((el) => el.setAttribute('aria-expanded', 'false'));
  };

  // 初始化頁面上所有 menu
  const initMenus = () => {
    document.querySelectorAll<HTMLElement>(root).forEach(initMenu);
  };

  const win = window as Window & { __langMenuInit?: boolean };
  if (!win.__langMenuInit) {
    // 避免重複綁定全域事件
    win.__langMenuInit = true;

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      // 點擊 menu 外部時，關閉所有 menu。
      if (!target.closest(root)) closeAll();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });

    // 首次載入時初始化
    if (document.readyState !== 'loading') initMenus();
    else document.addEventListener('DOMContentLoaded', initMenus, { once: true });

    // Astro 換頁後，初始化新頁面的 menu。
    document.addEventListener('astro:page-load', initMenus);
  } else initMenus();
})();
