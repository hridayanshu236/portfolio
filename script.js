/* NAVBAR SCROLL + ACTIVE LINK */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');
    const isActive = scrollMid >= top && scrollMid < bottom;
    document.querySelectorAll(`.nav-link[href="#${id}"]`).forEach(link => {
      link.classList.toggle('active', isActive);
    });
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

/* HAMBURGER MENU */
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('nav-links-list');

hamburger.addEventListener('click', () => {
  const isOpen = navLinksContainer.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* SCROLL REVEAL — IntersectionObserver */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* HERO ROLE TYPEWRITER */
const roleEl = document.getElementById('hero-role');
const roles = ['AI/ML Engineer', 'GenAI Developer', 'Agent Builder', 'Full-Stack Developer'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typewriter() {
  if (!roleEl) return;

  if (reduceMotion) {
    roleEl.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 55;
  const DELETE_SPEED = 30;
  const HOLD_TIME = 1600;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      roleEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, HOLD_TIME);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      roleEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, TYPE_SPEED);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  tick();
}

/* COPY EMAIL TO CLIPBOARD */
const emailBtn = document.getElementById('contact-email-link');
const copyFeedback = document.getElementById('copy-feedback');

if (emailBtn) {
  emailBtn.addEventListener('click', async () => {
    const email = emailBtn.textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      const temp = document.createElement('textarea');
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    copyFeedback.classList.add('show');
    clearTimeout(emailBtn._feedbackTimer);
    emailBtn._feedbackTimer = setTimeout(() => {
      copyFeedback.classList.remove('show');
    }, 1800);
  });
}

/* HOVER SPOTLIGHT — tracks cursor position on project entries and certificate rows */
function attachSpotlight(cards, targetSelector) {
  cards.forEach(card => {
    const target = targetSelector ? card.querySelector(targetSelector) : card;
    if (!target) return;
    card.addEventListener('mousemove', e => {
      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty('--mx', `${x}%`);
      target.style.setProperty('--my', `${y}%`);
    });
  });
}

if (!reduceMotion) {
  attachSpotlight(document.querySelectorAll('.log-entry'), '.log-body');
  attachSpotlight(document.querySelectorAll('.cert-row'), null);
}


/* HERO BACKGROUND — ambient agent graph, drifting nodes with occasional message pulses */
(function heroGraph() {
  const canvas = document.getElementById('hero-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rootStyles = getComputedStyle(document.documentElement);
  const colorLine = (rootStyles.getPropertyValue('--border-strong').trim() || '#B4C1CB');
  const colorAccent = (rootStyles.getPropertyValue('--accent').trim() || '#1E6E4A');
  const colorAccent2 = (rootStyles.getPropertyValue('--accent-2').trim() || '#A6421B');

  const LINK_DIST = 170;
  const NODE_AREA = 15000;
  let width = 0, height = 0;
  let nodes = [];
  let pulses = [];
  let rafId = null;

  function hexToRgba(hex, alpha) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function seedNodes() {
    const count = Math.max(9, Math.min(24, Math.round((width * height) / NODE_AREA)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: 1.5 + Math.random() * 1.5,
    }));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
    pulses = [];
  }

  function maybeSpawnPulse(links) {
    if (pulses.length >= 2 || links.length === 0) return;
    if (Math.random() > 0.012) return;
    const link = links[Math.floor(Math.random() * links.length)];
    pulses.push({
      a: link.a,
      b: link.b,
      t: 0,
      color: Math.random() > 0.78 ? colorAccent2 : colorAccent,
    });
  }

  function drawFrame(animated) {
    ctx.clearRect(0, 0, width, height);

    if (animated) {
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x <= 0 || n.x >= width) n.vx *= -1;
        if (n.y <= 0 || n.y >= height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
      });
    }

    const links = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.32;
          ctx.strokeStyle = hexToRgba(colorLine, alpha);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          links.push({ a, b });
        }
      }
    }

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(colorLine, 0.55);
      ctx.fill();
    });

    if (animated) {
      maybeSpawnPulse(links);
      pulses = pulses.filter(p => p.t <= 1);
      pulses.forEach(p => {
        p.t += 0.012;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.beginPath();
        ctx.arc(x, y, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
  }

  function loop() {
    drawFrame(true);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    if (reduceMotion) {
      drawFrame(false);
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      loop();
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 150);
  });

  start();
})();

/* CURL CONTACT BLOCK — builds a prefilled mailto: and "sends" it */
(function curlContact() {
  const sendBtn = document.getElementById('curl-send');
  const nameInput = document.getElementById('curl-name');
  const messageInput = document.getElementById('curl-message');
  const response = document.getElementById('curl-response');
  if (!sendBtn || !nameInput || !messageInput || !response) return;

  const EMAIL = 'hridayanshu23@gmail.com';

  function showResponse(text, isError) {
    response.textContent = text;
    response.classList.toggle('error', !!isError);
    response.classList.add('show');
  }

  sendBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!message) {
      showResponse('→ 400 Bad Request — message can\'t be empty', true);
      messageInput.focus();
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact${name ? ' from ' + name : ''}`);
    const bodyLines = [message, '', name ? `— ${name}` : ''].join('\n');
    const body = encodeURIComponent(bodyLines);
    const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    showResponse('→ 200 OK — opening your mail client...', false);
    window.location.href = mailto;
  });
})();

/* ABOUT STATS — count up once when scrolled into view */
(function statCounters() {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  if (!stats.length) return;

  function animateStat(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

    if (reduceMotion || isNaN(target)) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  stats.forEach(el => statObserver.observe(el));
})();

/* COMMAND PALETTE */
(function commandPalette() {
  const overlay = document.getElementById('cmdk-overlay');
  const input = document.getElementById('cmdk-input');
  const list = document.getElementById('cmdk-list');
  const trigger = document.getElementById('cmdk-trigger');
  if (!overlay || !input || !list) return;

  const commands = [
    { label: 'about', hint: 'about.md', action: () => go('#about') },
    { label: 'stack', hint: 'stack.json', action: () => go('#skills') },
    { label: 'projects', hint: 'log/', action: () => go('#projects') },
    { label: 'work', hint: 'log/', action: () => go('#projects') },
    { label: 'certifications', hint: 'certs.log', action: () => go('#certifications') },
    { label: 'certs', hint: 'certs.log', action: () => go('#certifications') },
    { label: 'contact', hint: 'contact.sh', action: () => go('#contact') },
    { label: 'home', hint: 'profile.md', action: () => go('#home') },
    { label: 'resume', hint: 'download', action: () => triggerDownload() },
    { label: 'github', hint: 'external ↗', action: () => openLink('https://github.com/hridayanshu236') },
    { label: 'linkedin', hint: 'external ↗', action: () => openLink('http://linkedin.com/in/hridayanshu23') },
    { label: 'email', hint: 'mailto', action: () => openLink('mailto:hridayanshu23@gmail.com') },
  ];

  let filtered = commands.slice();
  let activeIndex = 0;

  function go(hash) {
    close();
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function triggerDownload() {
    close();
    const link = document.getElementById('sidebar-resume-link') || document.querySelector('a[download]');
    if (link) link.click();
  }

  function openLink(url) {
    close();
    window.open(url, url.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
  }

  function render() {
    list.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'cmdk-empty';
      empty.textContent = 'no matching command';
      list.appendChild(empty);
      return;
    }
    filtered.forEach((cmd, i) => {
      const item = document.createElement('li');
      item.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
      item.setAttribute('role', 'option');
      item.innerHTML = `<span class="cmdk-item-label">${cmd.label}</span><span class="cmdk-item-hint">${cmd.hint}</span>`;
      item.addEventListener('mouseenter', () => { activeIndex = i; render(); });
      item.addEventListener('click', () => cmd.action());
      list.appendChild(item);
    });
  }

  function filterCommands(query) {
    const q = query.trim().toLowerCase();
    filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q)) : commands.slice();
    activeIndex = 0;
    render();
  }

  function open() {
    overlay.hidden = false;
    input.value = '';
    filterCommands('');
    setTimeout(() => input.focus(), 10);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  if (trigger) trigger.addEventListener('click', open);

  document.addEventListener('keydown', e => {
    const isTypingTarget = /input|textarea/i.test(document.activeElement.tagName);
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    const isSlash = e.key === '/' && !isTypingTarget;

    if (isCmdK || isSlash) {
      e.preventDefault();
      overlay.hidden ? open() : close();
      return;
    }
    if (!overlay.hidden && e.key === 'Escape') {
      close();
    }
  });

  input.addEventListener('input', () => filterCommands(input.value));

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) filtered[activeIndex].action();
    }
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });
})();


/* LIVE CLOCK — Kathmandu local time */
const clockEls = document.querySelectorAll('.js-clock');

function updateClock() {
  if (!clockEls.length) return;
  let time;
  try {
    time = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (err) {
    time = new Date().toLocaleTimeString();
  }
  clockEls.forEach(el => { el.textContent = time; });
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  onScroll();
  typewriter();
  updateClock();
  setInterval(updateClock, 1000);
});
