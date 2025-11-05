
(() => {
  const socket = io();

  // ===== Theme toggle (formal SVG icons + persist) =====
  const themeBtn = document.getElementById("themeToggle");
  const ICONS = {
    sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke-width="2"/>
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke-width="2" stroke-linecap="round"/>
          </svg>`,
    moon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
             <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`
  };
  function setThemeIcon(t){ themeBtn.innerHTML = (t === 'light') ? ICONS.sun : ICONS.moon; }
  function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); setThemeIcon(t); localStorage.setItem('wk_theme', t); }
  const saved = localStorage.getItem('wk_theme'); applyTheme(saved || 'dark');
  themeBtn.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(now === 'dark' ? 'light' : 'dark');
  });

  const trackpad = document.getElementById("trackpad");
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  const kbBtn = document.getElementById("kb");
  const contextBtn = document.getElementById("context");
  const hiddenText = document.getElementById("hiddenText");
  const moreBtn = document.getElementById("moreBtn");
  const overlay = document.getElementById("overlay");
  const closeModal = document.getElementById("closeModal");

  // Prevent default context menu on trackpad
  trackpad.addEventListener("contextmenu", e => e.preventDefault());

  // ===== Efficient movement with rAF coalescing =====
  let drag = false, lastX = null, lastY = null;
  let accDX = 0, accDY = 0, moveScheduled = false;

  function flushMove(){
    moveScheduled = false;
    if (accDX || accDY) {
      socket.emit("move", { dx: accDX, dy: accDY });
      accDX = accDY = 0;
    }
  }
  function scheduleMove(dx, dy){
    accDX += dx; accDY += dy;
    if (!moveScheduled) {
      moveScheduled = true;
      requestAnimationFrame(flushMove);
    }
  }

  // Desktop mouse
  trackpad.addEventListener("mousedown", (e) => {
    drag = true; lastX = e.clientX; lastY = e.clientY; e.preventDefault(); trackpad.focus();
  });
  window.addEventListener("mousemove", (e) => {
    if (!drag) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    scheduleMove(dx, dy);
  });
  window.addEventListener("mouseup", () => { drag = false; });

  // Wheel coalescing
  let accScrollY = 0, scrollScheduled = false;
  function flushScroll(){
    scrollScheduled = false;
    if (accScrollY) {
      socket.emit("scroll", { dx: 0, dy: accScrollY });
      accScrollY = 0;
    }
  }
  trackpad.addEventListener("wheel", (e) => {
    const unit = Math.min(3, Math.abs(e.deltaY / 100));
    accScrollY += -Math.sign(e.deltaY) * unit;
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(flushScroll); }
    e.preventDefault();
  }, { passive: false });

  // Touch move + two-finger scroll (coalesced)
  let lastTwo = null;
  trackpad.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]; lastX = t.clientX; lastY = t.clientY;
    } else if (e.touches.length === 2) {
      lastTwo = { y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
    }
    e.preventDefault();
  }, { passive: false });

  trackpad.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - lastX, dy = t.clientY - lastY;
      lastX = t.clientX; lastY = t.clientY;
      scheduleMove(dx, dy);
    } else if (e.touches.length === 2) {
      const y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dy = (lastTwo ? y - lastTwo.y : 0);
      lastTwo = { y };
      accScrollY += (dy < 0 ? 1 : dy > 0 ? -1 : 0);
      if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(flushScroll); }
    }
    e.preventDefault();
  }, { passive: false });

  trackpad.addEventListener("touchend", (e) => {
    lastTwo = null;
    e.preventDefault();
  }, { passive: false });

  // Click buttons
  function click(button="left", count=1){ socket.emit("click", { button, count }); }
  left.addEventListener("click", () => click("left", 1));
  right.addEventListener("click", () => click("right", 1));

  // Keyboard input (text)
  kbBtn.addEventListener("click", () => hiddenText.focus());
  hiddenText.addEventListener("input", () => {
    const txt = hiddenText.value;
    if (txt) {
      socket.emit("type_text", { text: txt });
      hiddenText.value = "";
    }
  });

  // Physical keyboard passthrough
  document.addEventListener("keydown", (e) => {
    if (document.activeElement === hiddenText) return;
    socket.emit("keydown", { key: e.key });
    e.preventDefault();
  });
  document.addEventListener("keyup", (e) => {
    if (document.activeElement === hiddenText) return;
    socket.emit("keyup", { key: e.key });
    e.preventDefault();
  });
  window.addEventListener("blur", () => { drag = false; }); // safety

  // Hotkey grid
  document.querySelectorAll('button[data-key]').forEach(btn => {
    btn.addEventListener('mousedown', () => socket.emit("keydown", { key: btn.dataset.key }));
    btn.addEventListener('mouseup', () => socket.emit("keyup", { key: btn.dataset.key }));
    btn.addEventListener('mouseleave', () => socket.emit("keyup", { key: btn.dataset.key }));
  });

  // Context menu key
  contextBtn.addEventListener("click", () => socket.emit("keydown", { key: "Menu" }));

  // Quick Actions modal
  function openModal(){ overlay.classList.remove("hidden"); }
  function closeModalFn(){ overlay.classList.add("hidden"); }
  moreBtn.addEventListener("click", openModal);
  closeModal.addEventListener("click", closeModalFn);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModalFn(); });

  // Macro buttons
  document.querySelectorAll('.qa[data-macro]').forEach(btn => {
    btn.addEventListener('click', () => socket.emit('macro', { name: btn.dataset.macro }));
  });
  // Modifier holds
  document.querySelectorAll('.qa[data-keydown]').forEach(btn => {
    const kd = btn.dataset.keydown, ku = btn.dataset.keyup || kd;
    btn.addEventListener('mousedown', () => socket.emit("keydown", { key: kd }));
    btn.addEventListener('mouseup', () => socket.emit("keyup", { key: ku }));
    btn.addEventListener('mouseleave', () => socket.emit("keyup", { key: ku }));
  });
})();
