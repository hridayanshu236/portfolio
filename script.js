/* THEME */
const themeToggles = document.querySelectorAll('[data-theme-toggle]');

function updateThemeControls(theme) {
  const isDark = theme === 'dark';
  themeToggles.forEach(toggle => {
    const nextTheme = isDark ? 'light' : 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  });
}

function setTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  updateThemeControls(theme);
  if (!persist) return;
  try {
    localStorage.setItem('portfolio-theme', theme);
  } catch (error) {
    // The theme still applies when storage is unavailable.
  }
}

setTheme(document.documentElement.dataset.theme || 'dark');

themeToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme, true);
  });
});

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
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
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

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !navLinksContainer.classList.contains('open')) return;
  navLinksContainer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.focus();
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* HERO ROLE TYPEWRITER */
const roleEl = document.getElementById('hero-role');
const roles = ['AI/ML Engineer', 'GenAI Developer', 'Full-Stack AI Developer'];
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

/* COMMAND PALETTE */
(function commandPalette() {
  const overlay = document.getElementById('cmdk-overlay');
  const input = document.getElementById('cmdk-input');
  const list = document.getElementById('cmdk-list');
  const trigger = document.getElementById('cmdk-trigger');
  if (!overlay || !input || !list) return;

  const commands = [
    { label: 'about', hint: 'about.md', action: () => go('#about') },
    { label: 'experience', hint: 'experience.log', action: () => go('#experience') },
    { label: 'stack', hint: 'stack.json', action: () => go('#skills') },
    { label: 'projects', hint: 'log/', action: () => go('#projects') },
    { label: 'work', hint: 'log/', action: () => go('#projects') },
    { label: 'certifications', hint: 'certs.log', action: () => go('#certifications') },
    { label: 'certs', hint: 'certs.log', action: () => go('#certifications') },
    { label: 'contact', hint: 'contact.sh', action: () => go('#contact') },
    { label: 'home', hint: 'profile.md', action: () => go('#home') },
    { label: 'resume', hint: 'download', action: () => triggerDownload() },
    { label: 'github', hint: 'external ↗', action: () => openLink('https://github.com/hridayanshu236') },
    { label: 'linkedin', hint: 'external ↗', action: () => openLink('https://linkedin.com/in/hridayanshu23') },
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

/* FILE EXPLORER README MATCHER */
(function setupFileExplorer() {
  const folders = document.querySelectorAll('.folder-btn');
  const readmeContent = document.getElementById('readme-content');
  const readmePath = document.getElementById('readme-path');
  const readmeRepoLink = document.getElementById('readme-repo-link');

  if (!folders.length || !readmeContent) return;

  function buildProjectSummary(btnEl) {
    const desc = btnEl.getAttribute('data-desc');
    if (!desc) return '';

    const tag = btnEl.getAttribute('data-tag');
    return `<div class="project-summary">
      <div class="project-summary-head">
        <span>Project overview</span>
        ${tag ? `<span class="project-summary-role">// Role: ${tag}</span>` : ''}
      </div>
      <p>${desc}</p>
    </div>`;
  }

  async function loadReadme(repo, owner, branch, readmeFile, btnEl) {
    folders.forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');

    readmePath.title = `~/hridayanshu/work/${repo}/${readmeFile}`;
    readmePath.innerHTML = `<span class="path-desktop">~/hridayanshu</span><span class="path-mobile">~</span>/work/${repo}/${readmeFile}`;
    readmeRepoLink.href = `https://github.com/${owner}/${repo}`;

    readmeContent.innerHTML = '<div class="readme-loading"><span class="cursor">_</span> fetching README...</div>';

    try {
      let rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${readmeFile}`;
      let branchUsed = 'main';
      let response = await fetch(rawUrl);

      if (!response.ok) {
        rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${readmeFile}`;
        branchUsed = 'master';
        response = await fetch(rawUrl);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();

      if (typeof marked !== 'undefined') {
        let html = await marked.parse(markdown);

        const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branchUsed}/`;
        const githubBase = `https://github.com/${owner}/${repo}/blob/${branchUsed}/`;

        html = html.replace(/src="(?!http|\/\/|data:)([^"]+)"/g, (match, path) => {
          const cleanPath = path.replace(/^\.\//, '');
          return `src="${rawBase}${cleanPath}"`;
        });

        html = html.replace(/href="(?!http|\/\/|data:|mailto:|#)([^"]+)"/g, (match, path) => {
          const cleanPath = path.replace(/^\.\//, '');
          return `href="${githubBase}${cleanPath}"`;
        });

        html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');

        html = buildProjectSummary(btnEl) + html;

        readmeContent.innerHTML = html;
      } else {
        readmeContent.innerHTML = `<pre>${markdown}</pre>`;
      }
    } catch (error) {
      console.error("Failed to load README:", error);

      const errorHtml = `<div class="readme-error">[!] Failed to load ${readmeFile} for ${repo}. It might not exist or the repository is private.</div>`;
      const html = buildProjectSummary(btnEl) + errorHtml;

      readmeContent.innerHTML = html;
    }
  }

  folders.forEach(btn => {
    btn.addEventListener('click', () => {
      const repo = btn.getAttribute('data-repo');
      const owner = btn.getAttribute('data-owner') || 'hridayanshu236';
      const branch = btn.getAttribute('data-branch') || 'main';
      const readmeFile = btn.getAttribute('data-readme') || 'README.md';
      loadReadme(repo, owner, branch, readmeFile, btn);
    });
  });

  const firstBtn = folders[0];
  if (firstBtn) {
    const repo = firstBtn.getAttribute('data-repo');
    const owner = firstBtn.getAttribute('data-owner') || 'hridayanshu236';
    const branch = firstBtn.getAttribute('data-branch') || 'main';
    const readmeFile = firstBtn.getAttribute('data-readme') || 'README.md';
    loadReadme(repo, owner, branch, readmeFile, firstBtn);
  }
})();

/* CERT PREVIEW POSITIONING (Desktop only; disabled on mobile) */
(function setupCertPreviews() {
  const rows = document.querySelectorAll('.cert-row');
  const certList = document.querySelector('.cert-list');

  rows.forEach(row => {
    const preview = row.querySelector('.cert-preview');
    if (!preview) return;

    // Move preview to body to escape overflow clipping contexts
    document.body.appendChild(preview);

    function showPreview() {
      // Disabled in mobile view
      if (window.innerWidth <= 768) return;

      // Close all others first
      document.querySelectorAll('.cert-preview.active').forEach(p => {
        if (p !== preview) p.classList.remove('active');
      });

      const rect = row.getBoundingClientRect();
      const previewHeight = preview.offsetHeight || 300;
      const previewWidth = preview.offsetWidth || 500;
      const gap = 10;
      const above = rect.top - previewHeight - gap;
      const below = rect.bottom + gap;

      let top;
      if (above >= gap) top = above;
      else if (below + previewHeight <= window.innerHeight - gap) top = below;
      else top = Math.max(gap, (window.innerHeight - previewHeight) / 2);

      preview.style.top = top + 'px';

      const maxLeft = Math.max(gap, window.innerWidth - previewWidth - gap);
      preview.style.left = Math.min(Math.max(gap, rect.left), maxLeft) + 'px';
      preview.style.setProperty('--preview-x', '0');

      preview.classList.add('active');
    }

    function hidePreview() {
      preview.classList.remove('active');
    }

    // Desktop hover & keyboard accessibility only
    row.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) showPreview();
    });
    row.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) hidePreview();
    });
    row.addEventListener('focusin', () => {
      if (window.innerWidth > 768) showPreview();
    });
    row.addEventListener('focusout', event => {
      if (!row.contains(event.relatedTarget)) hidePreview();
    });
    row.addEventListener('keydown', event => {
      if (event.key === 'Escape') hidePreview();
      if ((event.key === 'Enter' || event.key === ' ') && window.innerWidth > 768) {
        if (!event.target.closest('.cert-verify')) {
          event.preventDefault();
          if (preview.classList.contains('active')) hidePreview();
          else showPreview();
        }
      }
    });

    // Desktop click toggle
    row.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) return;
      if (e.target.closest('.cert-verify')) return;

      if (preview.classList.contains('active')) {
        hidePreview();
      } else {
        showPreview();
      }
    });
  });

  // Automatically dismiss active preview when scrolling cert-list or window
  if (certList) {
    certList.addEventListener('scroll', () => {
      document.querySelectorAll('.cert-preview.active').forEach(p => p.classList.remove('active'));
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    document.querySelectorAll('.cert-preview.active').forEach(p => p.classList.remove('active'));
  }, { passive: true });

  // Close preview when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cert-row') && !e.target.closest('.cert-preview')) {
      document.querySelectorAll('.cert-preview.active').forEach(p => p.classList.remove('active'));
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      document.querySelectorAll('.cert-preview.active').forEach(p => p.classList.remove('active'));
    }
  }, { passive: true });
})();
