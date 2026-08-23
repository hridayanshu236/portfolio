/* =============================================
   NAVBAR SCROLL + ACTIVE LINK
   ============================================= */
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
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollMid >= top && scrollMid < bottom);
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

/* =============================================
   HAMBURGER MENU
   ============================================= */
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

/* =============================================
   SCROLL REVEAL — IntersectionObserver
   ============================================= */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =============================================
   HERO ROLE TYPEWRITER
   ============================================= */
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

/* =============================================
   COPY EMAIL TO CLIPBOARD
   ============================================= */
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

/* =============================================
   HOVER SPOTLIGHT — tracks cursor position
   on project entries and certificate rows
   ============================================= */
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

/* =============================================
   LIVE CLOCK — Kathmandu local time
   ============================================= */
const clockEl = document.getElementById('clock-time');

function updateClock() {
  if (!clockEl) return;
  try {
    const time = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    clockEl.textContent = time;
  } catch (err) {
    clockEl.textContent = new Date().toLocaleTimeString();
  }
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  onScroll();
  typewriter();
  updateClock();
  setInterval(updateClock, 1000);
});