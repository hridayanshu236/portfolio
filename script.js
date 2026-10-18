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

function getSavedTheme() {
  try {
    const saved = localStorage.getItem('portfolio-theme');
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch (error) {
    return null;
  }
}

setTheme(document.documentElement.dataset.theme || 'dark');

themeToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme, true);
  });
});

// Follow the system appearance until the visitor picks a theme with the toggle.
const lightSchemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
if (lightSchemeQuery && lightSchemeQuery.addEventListener) {
  lightSchemeQuery.addEventListener('change', event => {
    if (!getSavedTheme()) setTheme(event.matches ? 'light' : 'dark');
  });
}

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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* COPY EMAIL TO CLIPBOARD */
const copyEmailBtn = document.getElementById('copy-email-btn');
const copyFeedback = document.getElementById('copy-feedback');

if (copyEmailBtn && copyFeedback) {
  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.dataset.email;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch (err) {
      const temp = document.createElement('textarea');
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      try {
        copied = document.execCommand('copy');
      } catch (execError) {
        copied = false;
      }
      document.body.removeChild(temp);
    }
    // Changing the text is what makes the status region announce it.
    copyFeedback.textContent = copied ? 'copied to clipboard' : 'couldn\'t copy, select the address instead';
    copyFeedback.classList.add('show');
    clearTimeout(copyEmailBtn._feedbackTimer);
    copyEmailBtn._feedbackTimer = setTimeout(() => {
      copyFeedback.classList.remove('show');
      copyFeedback.textContent = '';
    }, 2500);
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
      showResponse('→ 400 Bad Request: write a message first', true);
      messageInput.setAttribute('aria-invalid', 'true');
      messageInput.focus();
      return;
    }

    messageInput.removeAttribute('aria-invalid');
    const subject = encodeURIComponent(`Portfolio contact${name ? ' from ' + name : ''}`);
    const bodyLines = [message, '', name ? `— ${name}` : ''].join('\n');
    const body = encodeURIComponent(bodyLines);
    const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    // A mailto: link can't report whether a mail app opened, so don't claim success.
    showResponse(`→ opening your mail app… nothing opened? email ${EMAIL}`, false);
    window.location.href = mailto;
  });

  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) messageInput.removeAttribute('aria-invalid');
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
  let lastFocused = null;

  function go(hash) {
    close({ restoreFocus: false });
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    // Move keyboard focus to the section so Tab continues from there.
    const heading = target.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
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
      input.removeAttribute('aria-activedescendant');
      const empty = document.createElement('li');
      empty.className = 'cmdk-empty';
      empty.textContent = 'no matching command';
      list.appendChild(empty);
      return;
    }
    filtered.forEach((cmd, i) => {
      const item = document.createElement('li');
      item.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
      item.id = `cmdk-option-${i}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(i === activeIndex));
      item.innerHTML = `<span class="cmdk-item-label">${cmd.label}</span><span class="cmdk-item-hint">${cmd.hint}</span>`;
      item.addEventListener('mouseenter', () => { activeIndex = i; render(); });
      item.addEventListener('click', () => cmd.action());
      list.appendChild(item);
    });
    input.setAttribute('aria-activedescendant', `cmdk-option-${activeIndex}`);
  }

  function filterCommands(query) {
    const q = query.trim().toLowerCase();
    filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q)) : commands.slice();
    activeIndex = 0;
    render();
  }

  function open() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    input.value = '';
    filterCommands('');
    setTimeout(() => input.focus(), 10);
    document.body.style.overflow = 'hidden';
  }

  function close({ restoreFocus = true } = {}) {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
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
    } else if (e.key === 'Tab') {
      // The input is the palette's only focusable control: keep focus inside the dialog.
      e.preventDefault();
    }
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });
})();


/* LIVE CLOCK — Kathmandu local time (hours and minutes; ticking seconds is peripheral motion) */
const clockEls = document.querySelectorAll('.js-clock');

function updateClock() {
  if (!clockEls.length) return;
  let time;
  try {
    time = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  clockEls.forEach(el => {
    if (el.textContent !== time) el.textContent = time;
  });
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  onScroll();
  updateClock();
  setInterval(updateClock, 15000);
});

/* FILE EXPLORER README MATCHER */
(function setupFileExplorer() {
  const folders = document.querySelectorAll('.folder-btn');
  const readmeContent = document.getElementById('readme-content');
  const readmePath = document.getElementById('readme-path');
  const readmeRepoLink = document.getElementById('readme-repo-link');
  const readerPane = document.querySelector('.projects-terminal');
  const singleColumn = window.matchMedia('(max-width: 800px)');

  if (!folders.length || !readmeContent) return;

  // Relative = not a scheme (http:, mailto:, data:...), not protocol-relative, not an in-page anchor.
  const isRelativeUrl = url => !!url && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

  function renderReadme(markdownHtml, rawBase, githubBase) {
    const template = document.createElement('template');
    template.innerHTML = DOMPurify.sanitize(markdownHtml);
    const content = template.content;

    content.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (isRelativeUrl(src)) img.setAttribute('src', rawBase + src.replace(/^\.?\//, ''));
      img.setAttribute('loading', 'lazy');
    });

    content.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (isRelativeUrl(href)) link.setAttribute('href', githubBase + href.replace(/^\.?\//, ''));
      if (!href.startsWith('#')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // The pane sits under the "Work" h2, so README headings start at h3.
    // md-hN keeps the original level for styling.
    content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      const level = Number(heading.tagName[1]);
      const demoted = document.createElement(`h${Math.min(level + 2, 6)}`);
      demoted.className = `md-h${level}`;
      demoted.append(...heading.childNodes);
      heading.replaceWith(demoted);
    });

    return content;
  }

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

  async function loadReadme(btnEl) {
    const repo = btnEl.getAttribute('data-repo');
    const owner = btnEl.getAttribute('data-owner') || 'hridayanshu236';
    const readmeFile = btnEl.getAttribute('data-readme') || 'README.md';

    folders.forEach(btn => {
      btn.classList.remove('active');
      btn.removeAttribute('aria-current');
    });
    btnEl.classList.add('active');
    btnEl.setAttribute('aria-current', 'true');

    readmePath.title = `~/hridayanshu/work/${repo}/${readmeFile}`;
    readmePath.innerHTML = `<span class="path-desktop">~/hridayanshu</span><span class="path-mobile">~</span>/work/${repo}/${readmeFile}`;
    readmeRepoLink.href = `https://github.com/${owner}/${repo}`;

    readmeContent.innerHTML = '<div class="readme-loading"><span class="cursor" aria-hidden="true">_</span> fetching README...</div>';

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

      readmeContent.innerHTML = buildProjectSummary(btnEl);

      // README HTML comes from other people's repos: only insert it sanitized.
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branchUsed}/`;
        const githubBase = `https://github.com/${owner}/${repo}/blob/${branchUsed}/`;
        readmeContent.appendChild(renderReadme(await marked.parse(markdown), rawBase, githubBase));
      } else {
        const pre = document.createElement('pre');
        pre.textContent = markdown;
        readmeContent.appendChild(pre);
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
      loadReadme(btn);
      // In one column the reader sits below the list; bring it into view.
      if (readerPane && singleColumn.matches) {
        readerPane.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  loadReadme(folders[0]);
})();

/* CERT PREVIEW POSITIONING (Desktop only; disabled on mobile) */
(function setupCertPreviews() {
  const rows = document.querySelectorAll('.cert-row');

  rows.forEach(row => {
    const preview = row.querySelector('.cert-preview');
    if (!preview) return;
    const frame = preview.querySelector('iframe[data-src]');

    // Move preview to body to escape overflow clipping contexts
    document.body.appendChild(preview);

    function showPreview() {
      // Disabled in mobile view
      if (window.innerWidth <= 768) return;

      // Fetch the PDF on first preview only, not on page load.
      if (frame && !frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);

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

      preview.classList.add('active');
    }

    function hidePreview() {
      preview.classList.remove('active');
    }

    // Desktop hover & keyboard accessibility only (showPreview ignores narrow screens)
    row.addEventListener('mouseenter', showPreview);
    row.addEventListener('mouseleave', hidePreview);
    row.addEventListener('focusin', showPreview);
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

  // Automatically dismiss active preview when the page scrolls
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
// Mobile scroll chaining prevention for the README reader, the one remaining inner scroll area
(function setupScrollContainment() {
  const containers = document.querySelectorAll('.projects-terminal .terminal-body');
  containers.forEach(el => {
    el.addEventListener('touchstart', () => {
      const top = el.scrollTop;
      const totalScroll = el.scrollHeight;
      const currentScroll = top + el.offsetHeight;

      if (top === 0) {
        el.scrollTop = 1;
      } else if (currentScroll >= totalScroll) {
        el.scrollTop = top - 1;
      }
    }, { passive: true });
  });
})();
