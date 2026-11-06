const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme ---------- */
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = store.get("theme") || (prefersDark ? "dark" : "light");

document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  store.set("theme", next);
});

/* ---------- Mobile menu ---------- */
const burger = document.getElementById("burger");
const links = document.getElementById("links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
  burger.textContent = open ? "✕" : "☰";
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    burger.textContent = "☰";
    burger.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Scroll: progress bar + sticky header ---------- */
const progress = document.getElementById("progress");
const header = document.getElementById("header");
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  header.classList.toggle("scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Reveal on scroll (staggered) ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.transitionDelay = siblings.indexOf(el) * 90 + "ms";
  revealObserver.observe(el);
});

/* ---------- Active nav link ---------- */
const navLinks = [...document.querySelectorAll(".links a")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle("active", a.dataset.section === entry.target.id));
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Typing effect ---------- */
const typed = document.getElementById("typed");
const words = ["clean websites", "smart systems", "useful tools", "ideas into code"];
if (reduceMotion) {
  typed.textContent = words[0];
} else {
  let w = 0, i = 0, deleting = false;
  (function tick() {
    const word = words[w];
    typed.textContent = word.slice(0, i);
    if (!deleting && i === word.length) { deleting = true; return setTimeout(tick, 1400); }
    if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; }
    i += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 40 : 85);
  })();
}

/* ---------- Animated counters ---------- */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 1400;
      (function step(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-target]").forEach((el) => counterObserver.observe(el));

/* ---------- Card spotlight + 3D tilt ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    card.style.setProperty("--mx", x + "px");
    card.style.setProperty("--my", y + "px");
    if (!reduceMotion && card.classList.contains("project")) {
      const rx = ((y / r.height) - 0.5) * -8;
      const ry = ((x / r.width) - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

/* ---------- Cursor glow ---------- */
const glow = document.getElementById("glow");
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
