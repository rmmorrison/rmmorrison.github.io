/* global React */
/*
 * Classic Mode — a retro DOS-style alternate UI.
 * Same content as the main site, presented as a text-mode interface
 * with an 80×25 character grid, blue background, and function-key footer.
 *
 * Inspired by the look-and-feel of late-80s/early-90s text-mode applications
 * (TUI dialogs, ANSI art, BBS interfaces) — original design, not a recreation
 * of any specific product's UI.
 *
 * Wrapped in an IIFE so the React-hook locals don't collide with app.jsx
 * once both files are compiled to plain scripts and loaded together.
 */

(function () {
const { useEffect, useState, useRef, useCallback } = React;

const CLASSIC_SECTIONS = [
  { id: "readme",  key: "1", file: "README  .TXT", label: "README" },
  { id: "work",    key: "2", file: "WORK    .LOG", label: "Work" },
  { id: "patents", key: "3", file: "PATENTS .DAT", label: "Patents" },
  { id: "contact", key: "4", file: "CONTACT .INI", label: "Contact" },
];

function ClassicMode({ onExit, content }) {
  const [section, setSection] = useState("readme");
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const containerRef = useRef(null);

  // Boot sequence — print a few lines, then drop into the menu.
  useEffect(() => {
    const messages = [
      "Starting RM/DOS...",
      "",
      "HIMEM is testing extended memory...done.",
      "",
      "RM/DOS Version 1.04",
      "(C) Copyright Ryan Morrison 1991-2026",
      "",
      "C:\\> SITE.EXE /CLASSIC",
      "Loading personal homepage in compatibility mode...",
      "",
      "Press any key to continue . . .",
    ];
    let i = 0;
    setBootLines([]);
    const tick = () => {
      i += 1;
      setBootLines(messages.slice(0, i));
      if (i < messages.length) {
        setTimeout(tick, 90 + Math.random() * 80);
      }
    };
    tick();
    const onKey = () => setBooting(false);
    const onClick = () => setBooting(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    // Auto-advance after 3.5s if user doesn't press anything
    const auto = setTimeout(() => setBooting(false), 3500);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
      clearTimeout(auto);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (booting) return;
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "F3") {
        e.preventDefault();
        onExit();
        return;
      }
      const match = CLASSIC_SECTIONS.find((s) => s.key === e.key);
      if (match) {
        e.preventDefault();
        setSection(match.id);
      }
      // Tab cycles sections
      if (e.key === "Tab") {
        e.preventDefault();
        const idx = CLASSIC_SECTIONS.findIndex((s) => s.id === section);
        const next = (idx + (e.shiftKey ? -1 : 1) + CLASSIC_SECTIONS.length) % CLASSIC_SECTIONS.length;
        setSection(CLASSIC_SECTIONS[next].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booting, onExit, section]);

  if (booting) {
    return <BootScreen lines={bootLines} />;
  }

  return (
    <div className="dos" ref={containerRef}>
      <div className="dos-screen">
        <TitleBar />
        <MenuBar active={section} onPick={setSection} />
        <Body section={section} content={content} />
        <StatusBar onExit={onExit} />
      </div>
    </div>
  );
}

function BootScreen({ lines }) {
  return (
    <div className="dos dos-boot">
      <div className="dos-screen dos-screen-boot">
        <pre className="dos-boot-text">
          {lines.map((l, i) => (
            <div key={i}>{l}<Cursor on={i === lines.length - 1} /></div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function Cursor({ on = true }) {
  if (!on) return null;
  return <span className="dos-cursor">█</span>;
}

function TitleBar() {
  return (
    <div className="dos-title">
      <span className="dos-title-text">RM Personal Homepage v1.04 — CLASSIC.EXE</span>
    </div>
  );
}

function MenuBar({ active, onPick }) {
  return (
    <div className="dos-menubar">
      {CLASSIC_SECTIONS.map((s) => {
        const isActive = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            className={"dos-menu-item" + (isActive ? " active" : "")}
            onClick={() => onPick(s.id)}
          >
            <span className="dos-menu-key">{s.key}</span>
            <span className="dos-menu-label">{s.label}</span>
          </button>
        );
      })}
      <div className="dos-menu-spacer" />
      <span className="dos-menu-file">{CLASSIC_SECTIONS.find((s) => s.id === active).file}</span>
    </div>
  );
}

function Body({ section, content }) {
  return (
    <div className="dos-body">
      <Window title={CLASSIC_SECTIONS.find((s) => s.id === section).file.replace(/\s+/g, "")}>
        {section === "readme" && <ReadmeBody content={content} />}
        {section === "work" && <WorkBody content={content} />}
        {section === "patents" && <PatentsBody content={content} />}
        {section === "contact" && <ContactBody content={content} />}
      </Window>
    </div>
  );
}

// ASCII-bordered window
function Window({ title, children }) {
  return (
    <div className="dos-window">
      <div className="dos-window-titlebar">
        <span className="dos-window-title">─[ {title} ]─</span>
      </div>
      <div className="dos-window-body">{children}</div>
    </div>
  );
}

function ReadmeBody({ content }) {
  return (
    <div className="dos-doc">
      <h1 className="dos-h1">RYAN MORRISON</h1>
      <div className="dos-subtitle">Senior Software / DevOps Engineer</div>
      <div className="dos-rule">{"═".repeat(64)}</div>
      {content.blurb.map((p, i) => (
        <p key={i} className="dos-p">{p}</p>
      ))}
      <div className="dos-doc-footer">
        <span className="dos-blink">_</span> Press <kbd className="dos-kbd">2</kbd> for WORK.LOG, <kbd className="dos-kbd">3</kbd> for PATENTS.DAT, <kbd className="dos-kbd">4</kbd> for CONTACT.INI
      </div>
    </div>
  );
}

function WorkBody({ content }) {
  return (
    <div className="dos-doc">
      <h1 className="dos-h1">EMPLOYMENT HISTORY</h1>
      <div className="dos-rule">{"═".repeat(64)}</div>
      {content.experience.map((e, i) => (
        <div key={i} className="dos-job">
          <div className="dos-job-head">
            <span className="dos-job-range">[{e.range}]</span>{" "}
            <span className="dos-job-role">{e.role.toUpperCase()}</span>
          </div>
          <div className="dos-job-co">
            └─ {e.company}
            {e.acquisition && e.acquisition.kind === "acquired" && (
              <span className="dos-job-acq">  (acq. {e.acquisition.target}, {e.acquisition.year})</span>
            )}
          </div>
          {e.bullets && (
            <ul className="dos-bullets">
              {e.bullets.map((b, j) => (
                <li key={j}><span className="dos-bullet">►</span> {b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function PatentsBody({ content }) {
  return (
    <div className="dos-doc">
      <h1 className="dos-h1">PATENT REGISTRY</h1>
      <div className="dos-rule">{"═".repeat(64)}</div>
      {content.patents.map((p, i) => (
        <div key={i} className="dos-patent">
          <div className="dos-patent-head">
            [{p.primary.jurisdiction}] <a className="dos-link" href={p.primary.url} target="_blank" rel="noopener noreferrer">{p.primary.number}</a>
            {"  "}<span className="dos-dim">· filed {p.primary.filed} · granted {p.primary.year}</span>
          </div>
          <div className="dos-patent-title">"{p.title}"</div>
          {p.counterpart && (
            <div className="dos-patent-cp">
              └─ [{p.counterpart.jurisdiction}] <a className="dos-link" href={p.counterpart.url} target="_blank" rel="noopener noreferrer">{p.counterpart.number}</a>
              {"  "}<span className="dos-dim">· filed {p.counterpart.filed} · granted {p.counterpart.year} · counterpart</span>
            </div>
          )}
          {p.inventors && (
            <div className="dos-patent-inventors">
              INVENTORS: {p.inventors.map((n, j) => (
                <span key={j} className={n === content.me ? "dos-me" : ""}>
                  {j > 0 && <span className="dos-dim">, </span>}
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ContactBody({ content }) {
  const links = [
    { label: "GITHUB  ", handle: "rmmorrison", url: "https://github.com/rmmorrison" },
    { label: "BLUESKY ", handle: "ryanmorrison.ca", url: "https://bsky.app/profile/ryanmorrison.ca" },
    { label: "LINKEDIN", handle: "ryanmorrison04", url: "https://www.linkedin.com/in/ryanmorrison04/" },
  ];
  return (
    <div className="dos-doc">
      <h1 className="dos-h1">CONTACT.INI</h1>
      <div className="dos-rule">{"═".repeat(64)}</div>
      <pre className="dos-ini">
{`[location]
region    = Kitchener-Waterloo, Ontario, Canada
timezone  = America/Toronto
status    = online

[handles]`}
      </pre>
      {links.map((l, i) => (
        <div key={i} className="dos-contact-row">
          <span className="dos-contact-key">{l.label}</span>
          <span className="dos-contact-eq">=</span>
          <a className="dos-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.handle}</a>
        </div>
      ))}
      <div className="dos-doc-footer" style={{ marginTop: 18 }}>
        <span className="dos-blink">_</span> Save changes? (Y/N)
      </div>
    </div>
  );
}

function StatusBar({ onExit }) {
  return (
    <div className="dos-status">
      <span className="dos-status-key"><b>1-4</b>=Section</span>
      <span className="dos-status-key"><b>TAB</b>=Cycle</span>
      <span className="dos-status-key"><b>F3</b>=Exit</span>
      <span className="dos-status-key">
        <button type="button" className="dos-exit-btn" onClick={onExit}>
          <b>ESC</b>=Return to Modern UI
        </button>
      </span>
      <span className="dos-status-spacer" />
      <span className="dos-status-clock"><Clock /></span>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return <span>{t}</span>;
}

window.ClassicMode = ClassicMode;
})();
