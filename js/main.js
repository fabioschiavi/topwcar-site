/* ═══════════════════════════════════════════════
   TOPWCAR — scroll choreography
   GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─────────── smooth scroll ─────────── */
let lenis = null;
if (!prefersReduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ─────────── preloader + hero intro ─────────── */
const intro = gsap.timeline({
  defaults: { ease: "power3.out" },
  onComplete: () => {
    document.getElementById("preloader").remove();
    ScrollTrigger.refresh();
  },
});

intro
  .to(".preloader-logo span", {
    opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out",
  })
  .to(".preloader-bar i", { x: "0%", duration: 0.55, ease: "power2.inOut" }, "-=0.3")
  .to("#preloader", {
    yPercent: -100, duration: 0.8, ease: "power4.inOut", delay: 0.1,
  })
  /* hero entra */
  .to(".beam", { opacity: 1, duration: 1.4, ease: "power2.out" }, "-=0.45")
  .from(".hero-car-wrap", {
    y: 130, scale: 0.92, opacity: 0, duration: 1.2, ease: "power4.out",
  }, "<")
  .to(".hero-title .line > span", {
    y: 0, duration: 1, stagger: 0.1, ease: "power4.out",
  }, "<0.1")
  .to(".hero .reveal-up", {
    opacity: 1, y: 0, duration: 0.9, stagger: 0.09,
  }, "<0.25")
  .from(".nav", { y: -30, opacity: 0, duration: 0.7 }, "<0.2")
  .from(".scroll-hint", { opacity: 0, duration: 0.8 }, "<0.3");

gsap.set(".hero-title .line > span", { y: 130 });

/* ─────────── nav scrolled state ─────────── */
ScrollTrigger.create({
  start: 60,
  onUpdate: (self) =>
    document.getElementById("nav").classList.toggle("is-scrolled", self.scroll() > 60),
});

/* ─────────── hero parallax exit ─────────── */
gsap.timeline({
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 0.6,
  },
})
  .to(".hero-inner", { y: -110, opacity: 0, ease: "none" }, 0)
  .to(".hero-car-wrap", { y: 60, scale: 1.06, ease: "none" }, 0)
  .to(".beam", { opacity: 0, ease: "none" }, 0)
  .to(".scroll-hint", { opacity: 0, ease: "none" }, 0);

/* ─────────── cinema: a 911 conduz o scroll ─────────── */
const steps = gsap.utils.toArray(".step");
const ghosts = gsap.utils.toArray(".ghost");

function setStep(i) {
  steps.forEach((s, j) => s.classList.toggle("is-active", i === j));
  ghosts.forEach((g, j) => g.classList.toggle("active", i === j));
}

const cine = gsap.timeline({
  scrollTrigger: {
    trigger: ".cinema",
    start: "top top",
    end: "+=4200",
    pin: ".cinema-pin",
    scrub: 1,
    onUpdate: (self) => {
      gsap.set(".cinema-progress .bar", { scaleX: self.progress });
      const idx = Math.min(3, Math.floor(self.progress * 4));
      setStep(idx);
    },
  },
  defaults: { ease: "none" },
});

/* fase 1 → carro entra da direita e assenta */
cine
  .fromTo(".car-a",
    { x: "58vw", scale: 1.1, opacity: 0 },
    { x: 0, scale: 1, opacity: 1, duration: 0.55, ease: "power2.out" }, 0)

  /* fase 2 → envelopamento: a cor muda com o scroll */
  .to(".car-a", {
    keyframes: [
      { filter: "hue-rotate(0deg) saturate(1)" },
      { filter: "hue-rotate(250deg) saturate(1.15)" },
      { filter: "hue-rotate(140deg) saturate(1.1)" },
      { filter: "hue-rotate(40deg) saturate(1.25)" },
    ],
    duration: 1,
  }, 1.05)
  .to(".car-a", { x: "-2vw", duration: 1 }, 1.05)

  /* fase 3 → corte para o detalhe frontal */
  .to(".car-a", { opacity: 0, scale: 0.94, duration: 0.3 }, 2.15)
  .fromTo(".car-b",
    { opacity: 0, scale: 1.18 },
    { opacity: 1, scale: 1, duration: 0.45 }, 2.25)

  /* fase 4 → detalhe traseiro + brilho varrendo */
  .to(".car-b", { opacity: 0, scale: 1.06, duration: 0.3 }, 3.15)
  .fromTo(".car-c",
    { opacity: 0, scale: 1.16, x: "4vw" },
    { opacity: 1, scale: 1, x: 0, duration: 0.45 }, 3.25)
  .fromTo(".shine",
    { x: "-130%" },
    { x: "130%", duration: 0.55, ease: "power1.inOut" }, 3.5)
  .to({}, { duration: 0.25 }); /* respiro final */

/* ─────────── reveal genérico ─────────── */
gsap.utils.toArray(".reveal-up").forEach((el) => {
  if (el.closest(".hero")) return; /* hero tem timeline própria */
  gsap.to(el, {
    opacity: 1, y: 0,
    duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

/* ─────────── galeria horizontal ─────────── */
const track = document.querySelector(".gallery-track");
if (track) {
  const galleryScroll = () => -(track.scrollWidth - window.innerWidth + 60);
  gsap.to(track, {
    x: galleryScroll,
    ease: "none",
    scrollTrigger: {
      trigger: ".gallery",
      start: "top top",
      end: () => "+=" + Math.abs(galleryScroll()),
      pin: ".gallery-pin",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

/* ─────────── quote: palavra por palavra ─────────── */
const quote = document.querySelector(".quote-line");
quote.innerHTML = quote.innerHTML
  .split(/(<em>.*?<\/em>)/g)
  .map((chunk) => {
    if (chunk.startsWith("<em>")) {
      const inner = chunk.replace(/<\/?em>/g, "");
      return inner.split(" ").map((w) => `<em><span class="qw">${w}</span></em>`).join(" ");
    }
    return chunk.split(" ").filter(Boolean).map((w) => `<span class="qw">${w}</span>`).join(" ");
  })
  .join(" ");

gsap.to(".quote-line .qw", {
  opacity: 1,
  stagger: 0.12,
  ease: "none",
  scrollTrigger: {
    trigger: ".quote",
    start: "top 72%",
    end: "top 18%",
    scrub: 0.8,
  },
});

/* ─────────── contadores ─────────── */
gsap.utils.toArray(".count").forEach((el) => {
  const to = +el.dataset.to;
  gsap.fromTo(el,
    { textContent: 0 },
    {
      textContent: to,
      duration: 1.8,
      ease: "power2.out",
      snap: { textContent: 1 },
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
});

/* ─────────── âncoras com Lenis ─────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: "smooth" });
  });
});
