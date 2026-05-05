/* global React, ReactDOM */
const { useEffect, useRef, useState, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  "preset": "nebula",
  "speed": 1.0,
  "intensity": 6,
  "hueShift": 0,
  "grain": 0.04,
  "mouseStrength": 0.35,
  "brightness": 1.6,
  "showContent": true
} /*EDITMODE-END*/;

// Color presets — each is {colA (deep void), colB (mid), colC (highlight), colD (accent)}
// Stored as 0..1 RGB triplets for direct shader upload.
// `gradient` is the CSS for the "Morrison" shimmer — palette-matched, no magenta.
const PRESETS = {
  nebula: {
    label: "Nebula",
    colA: [0.008, 0.014, 0.025],
    colB: [0.02, 0.08, 0.11],
    colC: [0.10, 0.28, 0.32],
    colD: [0.06, 0.18, 0.24],
    gradient: "linear-gradient(100deg, oklch(0.96 0.005 240) 0%, oklch(0.82 0.10 220) 35%, oklch(0.78 0.12 200) 75%, oklch(0.96 0.005 240) 100%)",
  },
  aurora: {
    label: "Aurora",
    colA: [0.008, 0.018, 0.028],
    colB: [0.025, 0.12, 0.13],
    colC: [0.14, 0.36, 0.28],
    colD: [0.10, 0.14, 0.30],
    gradient: "linear-gradient(100deg, oklch(0.96 0.005 240) 0%, oklch(0.85 0.13 165) 35%, oklch(0.80 0.14 200) 75%, oklch(0.96 0.005 240) 100%)",
  },
  void: {
    label: "Void",
    colA: [0.004, 0.006, 0.014],
    colB: [0.02, 0.04, 0.10],
    colC: [0.10, 0.16, 0.32],
    colD: [0.12, 0.12, 0.26],
    gradient: "linear-gradient(100deg, oklch(0.96 0.005 240) 0%, oklch(0.78 0.13 255) 35%, oklch(0.72 0.10 270) 75%, oklch(0.96 0.005 240) 100%)",
  },
  ember: {
    label: "Ember",
    colA: [0.018, 0.010, 0.020],
    colB: [0.07, 0.035, 0.09],
    colC: [0.28, 0.16, 0.20],
    colD: [0.10, 0.20, 0.28],
    gradient: "linear-gradient(100deg, oklch(0.96 0.005 240) 0%, oklch(0.80 0.14 35) 35%, oklch(0.74 0.13 20) 75%, oklch(0.96 0.005 240) 100%)",
  },
};
const PRESET_KEYS = Object.keys(PRESETS);

function App() {
  const canvasRef = useRef(null);
  const shaderRef = useRef(null);
  // useTweaks is provided by tweaks-panel.jsx in dev — it persists changes back
  // to disk via postMessage. In prod (no tweaks bundle) it's not loaded; fall
  // back to plain React state so the in-page controls (preset cycler, etc.)
  // still work, just without persistence.
  const [prodTweaks, setProdTweaks] = useState(TWEAK_DEFAULTS);
  const setProdTweak = (keyOrEdits, val) => {
    const edits = typeof keyOrEdits === "object" ? keyOrEdits : { [keyOrEdits]: val };
    setProdTweaks((prev) => ({ ...prev, ...edits }));
  };
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [prodTweaks, setProdTweak];
  const tweaksRef = useRef(tweaks);
  tweaksRef.current = tweaks;

  // Build params getter for the shader (reads latest tweaks every frame)
  useEffect(() => {
    const canvas = canvasRef.current;
    const getParams = () => {
      const t = tweaksRef.current;
      const preset = PRESETS[t.preset] || PRESETS.nebula;
      return {
        speed: t.speed,
        intensity: t.intensity,
        hueShift: (t.hueShift / 180) * Math.PI,
        grain: t.grain,
        mouseStrength: t.mouseStrength,
        brightness: t.brightness,
        colA: preset.colA,
        colB: preset.colB,
        colC: preset.colC,
        colD: preset.colD,
      };
    };
    shaderRef.current = window.initNebulaShader(canvas, getParams);
    return () => shaderRef.current && shaderRef.current.destroy();
  }, []);

  const time = useClock();

  return (
    <>
      <canvas ref={canvasRef} className="bg-canvas" />
      {tweaks.showContent && (
        <SiteContent
          time={time}
          preset={tweaks.preset}
          onCyclePreset={() => {
            const i = PRESET_KEYS.indexOf(tweaks.preset);
            const next = PRESET_KEYS[(i + 1) % PRESET_KEYS.length];
            setTweak("preset", next);
          }}
        />
      )}
      {window.TweaksPanel && <NebulaTweaks tweaks={tweaks} setTweak={setTweak} />}
    </>
  );
}

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function formatTime(d) {
  return d
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
function formatDate(d) {
  return d
    .toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

function SiteContent({ time, preset, onCyclePreset }) {
  const presetDef = PRESETS[preset] || PRESETS.nebula;
  const heroStyle = { backgroundImage: presetDef.gradient };
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutBtnRef = useRef(null);

  return (
    <main className="content">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
              <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
            </svg>
          </div>
          <span className="brand-text">rm</span>
        </div>
        {/* Nav hidden for now — keeping markup ready for when sections exist.
            Toggle SHOW_NAV to true to bring it back. */}
        {false && (
          <nav className="nav">
            <a href="#about">about</a>
            <a href="#work">work</a>
            <a href="#writing">writing</a>
            <a href="#contact">contact</a>
          </nav>
        )}
      </header>

      <section className="hero">
        <div className="hero-eyebrow">
          <span className="dot" /> online · establishing uplink
        </div>
        <h1 className="hero-title">
          Ryan
          <br />
          <em style={heroStyle}>Morrison.</em>
        </h1>
        <p className="hero-role">
          Senior Software <span className="amp">/</span> DevOps Engineer
        </p>
        <p className="hero-blurb">
          Building resilient infrastructure and the developer tools that make
          production feel quiet. Currently based on Earth, working in&nbsp;the&nbsp;cloud.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            aria-expanded={contactOpen}
            aria-controls="contact-panel"
            onClick={() => setContactOpen((v) => !v)}
          >
            <span>{contactOpen ? "close" : "find me"}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" className={contactOpen ? "chev open" : "chev"}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            ref={aboutBtnRef}
            type="button"
            className="btn btn-ghost"
            aria-expanded={aboutOpen}
            aria-controls="about-panel"
            onClick={() => setAboutOpen(true)}
          >
            <span>more about me</span>
            <svg viewBox="0 0 16 16" width="14" height="14" className="chev">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div id="contact-panel" className={contactOpen ? "contact open" : "contact"} aria-hidden={!contactOpen}>
          <div className="contact-inner-wrap">
            <div className="contact-inner">
              <div className="contact-links">
                <a href="https://github.com/rmmorrison" target="_blank" rel="noopener noreferrer" className="contact-link">
                  github<span className="contact-handle">/rmmorrison</span><i />
                </a>
                <a href="https://bsky.app/profile/ryanmorrison.ca" target="_blank" rel="noopener noreferrer" className="contact-link">
                  bluesky<span className="contact-handle">/ryanmorrison.ca</span><i />
                </a>
                <a href="https://www.linkedin.com/in/ryanmorrison04/" target="_blank" rel="noopener noreferrer" className="contact-link">
                  linkedin<span className="contact-handle">/ryanmorrison04</span><i />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="botbar">
        <div className="meta">
          <span className="meta-label">SIGNAL</span>
          <span className="meta-value">{formatDate(time)}</span>
          <span className="meta-sep">·</span>
          <span className="meta-value">{formatTime(time)} UTC{getTzOffset()}</span>
        </div>
        <div className="hint">
          <span className="hint-verbs">
            <span className="hint-drag-clause">
              <span className="kbd">drag</span> to warp
              <span className="meta-sep">·</span>
            </span>
            <span className="kbd hint-click-verb">click</span>
            <span className="kbd hint-tap-verb">tap</span>
            <span className="hint-ripple-text"> for ripple</span>
            <span className="meta-sep">·</span>
          </span>
          <span className="hint-preset">
            <button
              type="button"
              className="kbd kbd-btn"
              onClick={onCyclePreset}
              title="Cycle wallpaper preset"
            >
              {presetDef.label.toLowerCase()}
            </button>
            <span className="hint-suffix">preset</span>
          </span>
        </div>
      </footer>

      <AboutOverlay
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          // return focus to the trigger
          requestAnimationFrame(() => aboutBtnRef.current && aboutBtnRef.current.focus());
        }}
      />
    </main>
  );
}

function getTzOffset() {
  const m = -new Date().getTimezoneOffset();
  const h = Math.floor(Math.abs(m) / 60);
  const sign = m >= 0 ? "+" : "−";
  return `${sign}${String(h).padStart(2, "0")}`;
}

function NebulaTweaks({ tweaks, setTweak }) {
  const { TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakSelect } = window;
  const presetOptions = Object.entries(PRESETS).map(([v, p]) => ({ value: v, label: p.label }));
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Wallpaper">
        <TweakSelect
          label="Preset"
          value={tweaks.preset}
          options={presetOptions}
          onChange={(v) => setTweak("preset", v)}
        />
        <TweakSlider
          label="Speed"
          value={tweaks.speed}
          min={0}
          max={3}
          step={0.05}
          onChange={(v) => setTweak("speed", v)}
        />
        <TweakSlider
          label="Intensity"
          value={tweaks.intensity}
          min={1}
          max={10}
          step={0.5}
          onChange={(v) => setTweak("intensity", v)}
        />
        <TweakSlider
          label="Hue shift"
          value={tweaks.hueShift}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={(v) => setTweak("hueShift", v)}
        />
      </TweakSection>
      <TweakSection label="Feel">
        <TweakSlider
          label="Brightness"
          value={tweaks.brightness}
          min={0.5}
          max={2}
          step={0.02}
          onChange={(v) => setTweak("brightness", v)}
        />
        <TweakSlider
          label="Mouse pull"
          value={tweaks.mouseStrength}
          min={0}
          max={3}
          step={0.05}
          onChange={(v) => setTweak("mouseStrength", v)}
        />
        <TweakSlider
          label="Grain"
          value={tweaks.grain}
          min={0}
          max={0.15}
          step={0.005}
          onChange={(v) => setTweak("grain", v)}
        />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakToggle
          label="Show site content"
          value={tweaks.showContent}
          onChange={(v) => setTweak("showContent", v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// ───────────────────────── About overlay ─────────────────────────

const ABOUT_TABS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Work" },
  { id: "patents", label: "Patents" },
];

const ABOUT_CONTENT = {
  blurb: [
    "I'm a software and DevOps engineer. For the past decade I've worked on a single product — a media-services platform that started life at a small Toronto company called UXP Systems, was acquired by Amdocs in 2017, and now runs as SaaS on Kubernetes serving customers around the world. I've been there for most of that journey, in different shapes: API developer, then platform engineer, now the person who keeps the build and deploy pipelines healthy.",
    "The work I'm proudest of is rarely the work that's most visible. A clean cutover from on-prem to SaaS that customers don't notice. A build pipeline that doesn't wake anyone up. A multi-tenant architecture that lets the next ten customers onboard without a meeting. I think the best infrastructure is invisible, and the best engineering is the kind that future-me — or the next person on call — will thank you for.",
    "Based in the Kitchener-Waterloo area. When I'm not at a keyboard you'll find me playing video games or, given a sunny day, outside taking advantage of it.",
  ],
};

const EXPERIENCE = [
  {
    range: "2024 — Present",
    role: "DevOps Engineer",
    company: "Amdocs",
    bullets: [
      "Maintain Jenkins CI/CD across the platform — build, test, and release pipelines that ship to production monthly.",
      "Own Helm charts and Kubernetes manifests for the SaaS deployment; keep upgrades quiet.",
      "Cut build times and reduced flakiness so the team spends less time waiting on red builds.",
    ],
  },
  {
    range: "2017 — 2024",
    role: "Software Development Specialist",
    company: "Amdocs",
    acquisition: { kind: "acquired", target: "UXP Systems", year: 2017 },
    bullets: [
      "Delivered multiple major versions of the platform to customers.",
      "Led the transformation from on-premise software to SaaS on AWS and Kubernetes.",
      "Implemented multi-tenancy and tuned the application to handle high-throughput workloads.",
    ],
  },
  {
    range: "2013 — 2017",
    role: "Software Developer",
    company: "UXP Systems Inc.",
    bullets: [
      "Designed and built APIs for live TV and pay-per-view integrations.",
      "Helped re-architect the platform around service discovery so it could grow into new device categories — set-top boxes, embedded devices.",
      "Built an internal analytics system and the integrations that fed user-behaviour data to third-party recommendation engines.",
    ],
  },
];

const ME = "Ryan Morrison";

const PATENTS = [
  {
    title:
      "System and method for delegating service entitlements across multiple media services",
    primary: {
      jurisdiction: "US",
      number: "10,757,165 B2",
      year: 2020,
      filed: 2016,
      url: "https://patents.google.com/patent/US10757165B2/en",
    },
    counterpart: {
      jurisdiction: "CA",
      number: "2,932,695",
      year: 2024,
      filed: 2016,
      url: "https://patents.google.com/patent/CA2932695A1/en",
    },
    inventors: [
      "Praveen Gangadharan",
      "Gemini Waghmare",
      "Jay Deen",
      "Jingyu Wang",
      "Ryan Morrison",
    ],
  },
];

// Renders the active tab's content, cross-faded with a slight horizontal slide.
// Direction comes from the parent: +1 = swipe content to the left as we move forward
// through the tab order; -1 = the reverse. The previous tab is kept mounted for one
// transition cycle so its exit animates instead of snapping out.
function TabPanel({ tabId, direction }) {
  // [active, previous] — previous is rendered with data-state="leave" until its
  // animation finishes, then dropped from the DOM.
  const [stack, setStack] = useState(() => [{ id: tabId, key: 0 }]);
  const keyRef = useRef(0);
  const prevIdRef = useRef(tabId);

  useEffect(() => {
    if (prevIdRef.current === tabId) return;
    keyRef.current += 1;
    setStack((s) => [
      { id: tabId, key: keyRef.current },                // entering
      { id: prevIdRef.current, key: s[0].key, leaving: true }, // leaving (was prev active)
    ]);
    prevIdRef.current = tabId;
    // Drop the leaving panel after the transition completes.
    const t = setTimeout(() => {
      setStack((s) => s.filter((p) => !p.leaving));
    }, 320);
    return () => clearTimeout(t);
  }, [tabId]);

  const renderById = (id) => {
    if (id === "about") return <AboutSection />;
    if (id === "experience") return <ExperienceSection />;
    if (id === "patents") return <PatentsSection />;
    return null;
  };

  return (
    <div className="tab-stage" data-direction={direction >= 0 ? "fwd" : "back"}>
      {stack.map((p) => (
        <div
          key={p.key}
          className="tab-panel"
          data-state={p.leaving ? "leave" : "enter"}
        >
          {renderById(p.id)}
        </div>
      ))}
    </div>
  );
}


function AboutOverlay({ open, onClose }) {
  const [tab, setTab] = useState("about");
  const dialogRef = useRef(null);
  const tabsRef = useRef(null);

  // Mount/unmount transition: keep node mounted during exit, then drop.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      // next frame so transition runs from .enter to .enter.shown
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Body-scroll lock + overlay flag (used to dim the wallpaper canvas)
  useEffect(() => {
    if (!mounted) return;
    document.body.dataset.overlayOpen = "true";
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      delete document.body.dataset.overlayOpen;
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the dialog on open (not the active tab) — focusing the tab button
  // makes browsers' :focus-visible heuristics paint a ring on the just-clicked
  // tab, which looks like a stuck selection.
  useEffect(() => {
    if (open && shown && dialogRef.current) {
      dialogRef.current.focus({ preventScroll: true });
    }
  }, [open, shown]);

  // Move to the next/previous tab — used by both keyboard and swipe handlers.
  const stepTab = (delta) => {
    const idx = ABOUT_TABS.findIndex((t) => t.id === tab);
    const next = (idx + delta + ABOUT_TABS.length) % ABOUT_TABS.length;
    setTab(ABOUT_TABS[next].id);
  };

  // Track the previous tab so we know which direction to slide on change.
  const prevTabRef = useRef(tab);
  const [direction, setDirection] = useState(0);  // -1 = back, +1 = fwd, 0 = first paint
  useEffect(() => {
    if (prevTabRef.current === tab) return;
    const prevIdx = ABOUT_TABS.findIndex((t) => t.id === prevTabRef.current);
    const nextIdx = ABOUT_TABS.findIndex((t) => t.id === tab);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    prevTabRef.current = tab;
  }, [tab]);

  // Arrow-key tab navigation — bound to the dialog (where focus lives) so
  // it works regardless of which child element initiated the keypress.
  const onTabKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepTab(+1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepTab(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setTab(ABOUT_TABS[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      setTab(ABOUT_TABS[ABOUT_TABS.length - 1].id);
    }
  };

  // Swipe-to-switch on touch. Threshold = 50px horizontal; ignore the gesture
  // if vertical motion dominates (so the body can scroll normally).
  const swipeRef = useRef({ x: 0, y: 0, t: 0 });
  const onSwipeStart = (e) => {
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onSwipeEnd = (e) => {
    const start = swipeRef.current;
    const end = e.changedTouches[0];
    if (!end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    const dt = Date.now() - start.t;
    if (dt > 600) return;                       // too slow — not a swipe
    if (Math.abs(dx) < 50) return;              // not far enough
    if (Math.abs(dy) > Math.abs(dx) * 0.6) return; // mostly vertical — let scroll win
    stepTab(dx < 0 ? +1 : -1);
  };

  if (!mounted) return null;

  return (
    <div
      id="about-panel"
      className={"about-overlay" + (shown ? " shown" : "")}
      role="presentation"
      onMouseDown={(e) => {
        // click on the backdrop (not the dialog) closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={onTabKeyDown}
        // stop bubbled mousedowns so backdrop close doesn't fire
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="about-titlebar">
          <div className="about-tlights">
            <button
              type="button"
              className="about-tlight about-tlight-close"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <svg viewBox="0 0 8 8" width="6" height="6" aria-hidden="true">
                <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="about-tlight about-tlight-min" aria-hidden="true" />
            <span className="about-tlight about-tlight-max" aria-hidden="true" />
          </div>
          <div className="about-breadcrumb" id="about-title">
            ~/about/ryan-morrison <span className="about-breadcrumb-meta">· readonly</span>
          </div>
          <button
            type="button"
            className="about-close"
            onClick={onClose}
            aria-label="Close"
            title="Close (Esc)"
          >
            <span className="about-close-kbd">esc</span>
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div
          className="about-tabs"
          role="tablist"
          aria-label="Sections"
          ref={tabsRef}
        >
          {ABOUT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`about-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`about-panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className={"about-tab" + (tab === t.id ? " active" : "")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className="about-body"
          onTouchStart={onSwipeStart}
          onTouchEnd={onSwipeEnd}
        >
          <TabPanel tabId={tab} direction={direction} />
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <section
      role="tabpanel"
      id="about-panel-about"
      aria-labelledby="about-tab-about"
      className="about-section about-section-about"
      tabIndex={0}
    >
      {ABOUT_CONTENT.blurb.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </section>
  );
}

function ExperienceSection() {
  return (
    <section
      role="tabpanel"
      id="about-panel-experience"
      aria-labelledby="about-tab-experience"
      className="about-section about-section-experience"
      tabIndex={0}
    >
      <ol className="exp-list">
        {EXPERIENCE.map((e, i) => (
          <li key={i} className="exp-item">
            <div className="exp-range">{e.range}</div>
            <div className="exp-body">
              <h3 className="exp-role">{e.role}</h3>
              <div className="exp-company">
                <span className="exp-company-name">{e.company}</span>
                {e.acquisition && e.acquisition.kind === "acquired" && (
                  <span
                    className="exp-acq"
                    title={`${e.company} acquired ${e.acquisition.target} in ${e.acquisition.year}`}
                  >
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                      <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    acquired <strong>{e.acquisition.target}</strong> · {e.acquisition.year}
                  </span>
                )}
              </div>
              {e.bullets && (
                <ul className="exp-bullets">
                  {e.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PatentsSection() {
  return (
    <section
      role="tabpanel"
      id="about-panel-patents"
      aria-labelledby="about-tab-patents"
      className="about-section about-section-patents"
      tabIndex={0}
    >
      <ol className="pat-list">
        {PATENTS.map((p, i) => (
          <li key={i} className="pat-item">
            <div className="pat-primary">
              <span className="pat-jur">{p.primary.jurisdiction}</span>
              <a
                className="pat-num"
                href={p.primary.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.primary.number}
              </a>
              <span className="pat-sep">·</span>
              <span className="pat-year">{p.primary.year}</span>
              {p.primary.filed && (
                <span className="pat-filed">filed {p.primary.filed}</span>
              )}
            </div>
            <div className="pat-title">&ldquo;{p.title}&rdquo;</div>
            {p.counterpart && (
              <div className="pat-counterpart">
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" className="pat-counterpart-arrow">
                  <path d="M3 2v5a2 2 0 002 2h5M8 6l3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="pat-jur">{p.counterpart.jurisdiction}</span>
                <a
                  className="pat-num"
                  href={p.counterpart.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.counterpart.number}
                </a>
                <span className="pat-sep">·</span>
                <span className="pat-year">{p.counterpart.year}</span>
                {p.counterpart.filed && (
                  <span className="pat-filed">filed {p.counterpart.filed}</span>
                )}
                <span className="pat-counterpart-note">counterpart</span>
              </div>
            )}
            {p.inventors && (
              <div className="pat-inventors">
                <span className="pat-inventors-label">Inventors</span>
                <span className="pat-inventors-list">
                  {p.inventors.map((name, j) => {
                    const isMe = name === ME;
                    return (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="pat-inventors-sep"> · </span>}
                        <span className={isMe ? "pat-inventor-me" : "pat-inventor"}>
                          {name}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
