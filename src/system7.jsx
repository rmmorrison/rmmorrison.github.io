/* global React */
/*
 * System 7 Mode — a black-and-white desktop UI inspired by classic Mac
 * System 7 (1991). Same content as the main site, presented as files on a
 * virtual desktop that open into draggable text-editor windows.
 *
 * Original design — not a reproduction of any specific Apple software.
 * Wrapped in an IIFE so locals don't collide with app.jsx at script scope.
 */

(function () {
const { useEffect, useState, useRef, useCallback } = React;

const DESKTOP_FILES = [
  { id: "readme",  name: "Read Me",     kind: "doc" },
  { id: "work",    name: "Work",        kind: "doc" },
  { id: "patents", name: "Patents",     kind: "doc" },
  { id: "contact", name: "Contact",     kind: "doc" },
];

let windowZ = 10;

function System7Mode({ onExit, content }) {
  const [openWindows, setOpenWindows] = useState([]);   // [{id, z, x, y}]
  const [selected, setSelected] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const desktopRef = useRef(null);

  // Boot splash holds full-screen (no desktop chrome) for a beat,
  // then dismisses to reveal the desktop and About window.
  useEffect(() => {
    const t1 = setTimeout(() => setBooting(false), 1800);
    const t2 = setTimeout(() => setAboutOpen(true), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const openFile = useCallback((id) => {
    setOpenWindows((ws) => {
      const existing = ws.find((w) => w.id === id);
      if (existing) {
        // Bring to front
        return ws.map((w) => (w.id === id ? { ...w, z: ++windowZ } : w));
      }
      // Cascade new windows
      const i = ws.length;
      return [
        ...ws,
        {
          id,
          z: ++windowZ,
          x: 80 + i * 26,
          y: 70 + i * 22,
          w: id === "contact" ? 380 : 460,
          h: id === "readme" ? 360 : 320,
        },
      ];
    });
  }, []);

  const closeWindow = useCallback((id) => {
    setOpenWindows((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id) => {
    setOpenWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++windowZ } : w)));
  }, []);

  const updatePos = useCallback((id, x, y) => {
    setOpenWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const updateSize = useCallback((id, w, h) => {
    setOpenWindows((ws) => ws.map((win) => (win.id === id ? { ...win, w, h } : win)));
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (aboutOpen) { setAboutOpen(false); return; }
        if (openWindows.length > 0) {
          // Close top-most window
          const top = openWindows.reduce((a, b) => (a.z > b.z ? a : b));
          closeWindow(top.id);
        } else {
          onExit();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen, openWindows, closeWindow, onExit]);

  // While booting, render JUST the splash on the dithered background.
  if (booting) {
    return (
      <div className="sys7 sys7-booting">
        <Sys7Boot />
      </div>
    );
  }

  return (
    <div className="sys7" ref={desktopRef} onMouseDown={() => { setSelected(null); setAppleMenuOpen(false); }}>
      <Sys7MenuBar
        appleMenuOpen={appleMenuOpen}
        onApple={(e) => { e.stopPropagation(); setAppleMenuOpen((v) => !v); }}
        onAboutClick={() => { setAppleMenuOpen(false); setAboutOpen(true); }}
        onExit={onExit}
      />

      <div className="sys7-desktop">
        {/* Hard drive — Macintosh tradition puts the boot disk first */}
        <DesktopIcon
          file={{ id: "hd", name: "Ryan's HD", kind: "disk" }}
          selected={selected === "hd"}
          onSelect={(e) => { e.stopPropagation(); setSelected("hd"); }}
          onOpen={() => {}}
          style={{ top: 20, right: 20 }}
        />

        {DESKTOP_FILES.map((f, i) => (
          <DesktopIcon
            key={f.id}
            file={f}
            selected={selected === f.id}
            onSelect={(e) => { e.stopPropagation(); setSelected(f.id); }}
            onOpen={() => openFile(f.id)}
            style={{ top: 20 + 80 + i * 104, right: 20 }}
          />
        ))}

        {/* Trash */}
        <DesktopIcon
          file={{ id: "trash", name: "Trash", kind: "trash" }}
          selected={selected === "trash"}
          onSelect={(e) => { e.stopPropagation(); setSelected("trash"); }}
          onOpen={() => {}}
          style={{ bottom: 28, right: 24 }}
        />

        {openWindows.map((w) => (
          <Sys7Window
            key={w.id}
            win={w}
            onClose={() => closeWindow(w.id)}
            onFocus={() => focusWindow(w.id)}
            onMove={(x, y) => updatePos(w.id, x, y)}
            onResize={(width, height) => updateSize(w.id, width, height)}
            content={content}
          />
        ))}

        {aboutOpen && (
          <AboutThisWebsite
            onClose={() => setAboutOpen(false)}
            zIndex={++windowZ}
            openWindows={openWindows}
          />
        )}
      </div>
    </div>
  );
}

function Sys7Boot() {
  return (
    <div className="sys7-boot">
      <div className="sys7-boot-banner">
        <SmilingMac />
        <div className="sys7-boot-text">Welcome to Macintosh.</div>
      </div>
    </div>
  );
}

function SmilingMac() {
  // 1-bit boot Mac — original interpretation, drawn as crisp pixels.
  // Includes the small power-cable detail at lower-left.
  return (
    <svg className="sys7-boot-mac" viewBox="0 0 36 36" shapeRendering="crispEdges" aria-hidden="true">
      {/* CRT body */}
      <rect x="9"  y="3"  width="22" height="20" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* screen */}
      <rect x="12" y="6"  width="16" height="11" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* eyes */}
      <rect x="16" y="9"  width="2" height="2" fill="#000" />
      <rect x="22" y="9"  width="2" height="2" fill="#000" />
      {/* smile */}
      <rect x="17" y="13" width="6" height="1" fill="#000" />
      <rect x="16" y="12" width="1" height="1" fill="#000" />
      <rect x="23" y="12" width="1" height="1" fill="#000" />
      {/* disk slot */}
      <rect x="14" y="19" width="12" height="1" fill="#000" />
      {/* base */}
      <rect x="11" y="23" width="18" height="3" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* keyboard */}
      <rect x="6"  y="27" width="26" height="3" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* cord curling left */}
      <rect x="5"  y="30" width="1" height="1" fill="#000" />
      <rect x="4"  y="31" width="1" height="1" fill="#000" />
      <rect x="3"  y="32" width="1" height="1" fill="#000" />
      <rect x="2"  y="33" width="1" height="1" fill="#000" />
      <rect x="3"  y="34" width="1" height="1" fill="#000" />
      <rect x="4"  y="34" width="1" height="1" fill="#000" />
      {/* tiny apple-ish blob at end of cord */}
      <rect x="5"  y="33" width="2" height="2" fill="#000" />
    </svg>
  );
}

function AppleGlyph() {
  // Use the reference image directly — sized to fit the 28px menu bar.
  return (
    <img
      src="apple-glyph.png"
      alt=""
      aria-hidden="true"
      style={{
        width: 16,
        height: "auto",
        display: "block",
        imageRendering: "pixelated",
      }}
      draggable={false}
    />
  );
}

function Sys7MenuBar({ appleMenuOpen, onApple, onAboutClick, onExit }) {
  return (
    <div className="sys7-menubar" onMouseDown={(e) => e.stopPropagation()}>
      <div className="sys7-menu sys7-menu-apple" onClick={onApple}>
        <AppleGlyph />
        {appleMenuOpen && (
          <div className="sys7-dropdown sys7-apple-dropdown">
            <button type="button" className="sys7-dropdown-item" onClick={(e) => { e.stopPropagation(); onAboutClick(); }}>About This Website…</button>
            <div className="sys7-dropdown-sep" />
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Alarm Clock</button>
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Calculator</button>
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Chooser</button>
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Control Panels</button>
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Key Caps</button>
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Note Pad</button>
            <button type="button" className="sys7-dropdown-item sys7-dropdown-disabled">Scrapbook</button>
          </div>
        )}
      </div>
      <span className="sys7-menu">File</span>
      <span className="sys7-menu">Edit</span>
      <span className="sys7-menu sys7-menu-disabled">View</span>
      <span className="sys7-menu sys7-menu-disabled">Label</span>
      <span className="sys7-menu">Special</span>
      <span className="sys7-menu-spacer" />
      <button type="button" className="sys7-menu sys7-menu-help" onClick={onExit} title="Return to modern UI">
        Return to Modern UI
      </button>
    </div>
  );
}

function DesktopIcon({ file, selected, onSelect, onOpen, style }) {
  const lastClick = useRef(0);
  const handleClick = (e) => {
    onSelect(e);
    const now = Date.now();
    if (now - lastClick.current < 400) {
      onOpen();
    }
    lastClick.current = now;
  };
  return (
    <div className={"sys7-icon" + (selected ? " selected" : "")} style={style} onMouseDown={handleClick} onDoubleClick={onOpen}>
      <div className="sys7-icon-glyph">
        {file.kind === "doc" && <DocIcon />}
        {file.kind === "disk" && <DiskIcon />}
        {file.kind === "trash" && <TrashIcon />}
      </div>
      <div className="sys7-icon-label">{file.name}</div>
    </div>
  );
}

// — pixel-style icons drawn with SVG. Black 1-bit aesthetic.
function DocIcon() {
  return (
    <svg viewBox="0 0 32 40" width="32" height="40" shapeRendering="crispEdges">
      {/* page outline with folded corner */}
      <path d="M2 2 H22 L30 10 V38 H2 Z" fill="#fff" stroke="#000" strokeWidth="1" />
      <path d="M22 2 V10 H30" fill="none" stroke="#000" strokeWidth="1" />
      {/* text lines */}
      <rect x="6"  y="16" width="20" height="1" fill="#000" />
      <rect x="6"  y="20" width="20" height="1" fill="#000" />
      <rect x="6"  y="24" width="16" height="1" fill="#000" />
      <rect x="6"  y="28" width="20" height="1" fill="#000" />
      <rect x="6"  y="32" width="12" height="1" fill="#000" />
    </svg>
  );
}
function DiskIcon() {
  // Classic System 7 internal HD: wide, thin white rectangle (roughly the
  // width of the label below) with a small indicator light on the
  // lower-left. 1-bit, crisp pixels.
  return (
    <svg viewBox="0 0 44 16" width="44" height="16" shapeRendering="crispEdges">
      {/* outer body */}
      <rect x="1" y="1" width="40" height="12" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* drop shadow on right + bottom (one-pixel offset, classic Mac style) */}
      <rect x="41" y="2" width="1" height="12" fill="#000" />
      <rect x="2" y="13" width="40" height="1" fill="#000" />
      {/* indicator light: small line, lower-left */}
      <rect x="5" y="9" width="3" height="1" fill="#000" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 32 36" width="32" height="36" shapeRendering="crispEdges">
      {/* lid */}
      <rect x="3" y="4" width="26" height="3" fill="#fff" stroke="#000" strokeWidth="1" />
      <rect x="13" y="2" width="6" height="2" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* bin */}
      <path d="M5 8 H27 L25 34 H7 Z" fill="#fff" stroke="#000" strokeWidth="1" />
      <line x1="11" y1="11" x2="11" y2="31" stroke="#000" strokeWidth="1" />
      <line x1="16" y1="11" x2="16" y2="31" stroke="#000" strokeWidth="1" />
      <line x1="21" y1="11" x2="21" y2="31" stroke="#000" strokeWidth="1" />
    </svg>
  );
}

function Sys7Window({ win, onClose, onFocus, onMove, onResize, content }) {
  const [drag, setDrag] = useState(null);
  const [resize, setResize] = useState(null);

  const onTitleMouseDown = (e) => {
    if (e.target.closest(".sys7-close")) return;
    onFocus();
    setDrag({
      offsetX: e.clientX - win.x,
      offsetY: e.clientY - win.y,
    });
    e.preventDefault();
  };

  const onResizeMouseDown = (e) => {
    e.stopPropagation();
    onFocus();
    setResize({
      startX: e.clientX,
      startY: e.clientY,
      startW: win.w,
      startH: win.h,
    });
    e.preventDefault();
  };

  useEffect(() => {
    if (!drag) return;
    const onMove2 = (e) => {
      onMove(
        Math.max(0, e.clientX - drag.offsetX),
        Math.max(20, e.clientY - drag.offsetY),
      );
    };
    const onUp = () => setDrag(null);
    window.addEventListener("mousemove", onMove2);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove2);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, onMove]);

  useEffect(() => {
    if (!resize) return;
    const MIN_W = 260;
    const MIN_H = 160;
    const onMove2 = (e) => {
      const dx = e.clientX - resize.startX;
      const dy = e.clientY - resize.startY;
      onResize(
        Math.max(MIN_W, resize.startW + dx),
        Math.max(MIN_H, resize.startH + dy),
      );
    };
    const onUp = () => setResize(null);
    window.addEventListener("mousemove", onMove2);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove2);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resize, onResize]);

  const titleByID = {
    readme:  "Read Me",
    work:    "Work History",
    patents: "Patents",
    contact: "Contact",
  };

  return (
    <div
      className="sys7-window"
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onMouseDown={(e) => { e.stopPropagation(); onFocus(); }}
    >
      <div className="sys7-titlebar" onMouseDown={onTitleMouseDown}>
        <button type="button" className="sys7-close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close" />
        <div className="sys7-title-pinstripe">
          <span className="sys7-title-text">{titleByID[win.id] || win.id}</span>
        </div>
        <div className="sys7-title-zoom" />
      </div>
      <div className="sys7-window-body">
        {win.id === "readme"  && <Sys7Readme content={content} />}
        {win.id === "work"    && <Sys7Work content={content} />}
        {win.id === "patents" && <Sys7Patents content={content} />}
        {win.id === "contact" && <Sys7Contact content={content} />}
      </div>
      <div
        className="sys7-size-box"
        onMouseDown={onResizeMouseDown}
        aria-label="Resize"
      >
        <div className="sys7-size-box-inner" />
      </div>
    </div>
  );
}

// Each window "consumes" a chunk of memory (in K). Sum + system baseline
// drives the "About This Website" memory readout.
const SYSTEM_BASE_K = 977;
const TOTAL_MEMORY_K = 4096;
const WINDOW_COST_K = {
  readme: 312,
  work: 388,
  patents: 446,
  contact: 184,
};

function AboutThisWebsite({ onClose, zIndex, openWindows }) {
  const usedByWindows = openWindows.reduce((sum, w) => sum + (WINDOW_COST_K[w.id] || 240), 0);
  const totalUsed = SYSTEM_BASE_K + usedByWindows;
  const largestUnused = Math.max(0, TOTAL_MEMORY_K - totalUsed);
  const fmt = (n) => n.toLocaleString();
  const sysPct = Math.min(100, (SYSTEM_BASE_K / TOTAL_MEMORY_K) * 100);
  return (
    <div className="sys7-window sys7-about-window" style={{ left: "50%", top: 80, transform: "translateX(-50%)", width: 460, zIndex }}>
      <div className="sys7-titlebar">
        <button type="button" className="sys7-close" onClick={onClose} aria-label="Close" />
        <div className="sys7-title-pinstripe">
          <span className="sys7-title-text">About This Website</span>
        </div>
        <div className="sys7-title-zoom" />
      </div>
      <div className="sys7-window-body sys7-about-body">
        <div className="sys7-about-row">
          <div className="sys7-about-mac">
            <svg viewBox="0 0 36 36" width="40" height="40" shapeRendering="crispEdges">
              <rect x="3" y="3" width="30" height="26" fill="#fff" stroke="#000" strokeWidth="1" />
              <rect x="6" y="6" width="24" height="16" fill="#000" />
              <rect x="11" y="29" width="14" height="3" fill="#fff" stroke="#000" strokeWidth="1" />
              <rect x="9" y="32" width="18" height="2" fill="#fff" stroke="#000" strokeWidth="1" />
            </svg>
          </div>
          <div className="sys7-about-text">
            <div className="sys7-about-bold">Ryan's Personal Computer</div>
            <div className="sys7-about-light">Personal Homepage 7.0.1</div>
            <div className="sys7-about-light">© Ryan Morrison, 1991–2026</div>
          </div>
        </div>
        <div className="sys7-about-mem">
          <div><b>Built-in Memory:</b> {fmt(TOTAL_MEMORY_K)}K</div>
          <div><b>Largest Unused Block:</b> {fmt(largestUnused)}K</div>
        </div>
        <div className="sys7-about-meter">
          <span className="sys7-about-meter-label">System Software</span>
          <span className="sys7-about-meter-size">{fmt(SYSTEM_BASE_K)}K</span>
          <span className="sys7-about-meter-bar"><span className="sys7-about-meter-fill" style={{ width: sysPct + "%" }} /></span>
        </div>
        {openWindows.map((w) => {
          const cost = WINDOW_COST_K[w.id] || 240;
          const pct = Math.min(100, (cost / TOTAL_MEMORY_K) * 100);
          const label = { readme: "Read Me", work: "Work", patents: "Patents", contact: "Contact" }[w.id] || w.id;
          return (
            <div className="sys7-about-meter" key={w.id}>
              <span className="sys7-about-meter-label">{label}</span>
              <span className="sys7-about-meter-size">{fmt(cost)}K</span>
              <span className="sys7-about-meter-bar"><span className="sys7-about-meter-fill" style={{ width: pct + "%" }} /></span>
            </div>
          );
        })}
        <div className="sys7-about-hint">Double-click any document on the desktop to open it.</div>
      </div>
    </div>
  );
}

// ───── Document bodies ─────

function Sys7Readme({ content }) {
  return (
    <div className="sys7-doc">
      <h1 className="sys7-doc-h1">Read Me — Ryan Morrison</h1>
      <div className="sys7-doc-sub">Senior Software / DevOps Engineer</div>
      <hr className="sys7-doc-rule" />
      {content.blurb.map((p, i) => <p key={i} className="sys7-doc-p">{p}</p>)}
    </div>
  );
}

function Sys7Work({ content }) {
  return (
    <div className="sys7-doc">
      <h1 className="sys7-doc-h1">Work History</h1>
      <hr className="sys7-doc-rule" />
      {content.experience.map((e, i) => (
        <div key={i} className="sys7-job">
          <div className="sys7-job-head">
            <span className="sys7-job-role"><b>{e.role}</b></span>
            <span className="sys7-job-range"> — {e.range}</span>
          </div>
          <div className="sys7-job-co">{e.company}{e.acquisition && e.acquisition.kind === "acquired" && <span className="sys7-job-acq"> (acquired {e.acquisition.target}, {e.acquisition.year})</span>}</div>
          {e.bullets && (
            <ul className="sys7-bullets">
              {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function Sys7Patents({ content }) {
  return (
    <div className="sys7-doc">
      <h1 className="sys7-doc-h1">Patents</h1>
      <hr className="sys7-doc-rule" />
      {content.patents.map((p, i) => (
        <div key={i} className="sys7-patent">
          <div className="sys7-patent-title"><b>"{p.title}"</b></div>
          <div className="sys7-patent-meta">
            [{p.primary.jurisdiction}] <a className="sys7-link" href={p.primary.url} target="_blank" rel="noopener noreferrer">{p.primary.number}</a> · filed {p.primary.filed} · granted {p.primary.year}
          </div>
          {p.counterpart && (
            <div className="sys7-patent-meta sys7-patent-cp">
              [{p.counterpart.jurisdiction}] <a className="sys7-link" href={p.counterpart.url} target="_blank" rel="noopener noreferrer">{p.counterpart.number}</a> · filed {p.counterpart.filed} · granted {p.counterpart.year} · counterpart
            </div>
          )}
          {p.inventors && (
            <div className="sys7-patent-inv">
              <b>Inventors:</b> {p.inventors.map((n, j) => (
                <span key={j} className={n === content.me ? "sys7-me" : ""}>
                  {j > 0 && ", "}{n}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Sys7Contact({ content }) {
  const links = [
    { label: "GitHub",   handle: "rmmorrison",     url: "https://github.com/rmmorrison" },
    { label: "Bluesky",  handle: "ryanmorrison.ca", url: "https://bsky.app/profile/ryanmorrison.ca" },
    { label: "LinkedIn", handle: "ryanmorrison04",  url: "https://www.linkedin.com/in/ryanmorrison04/" },
  ];
  return (
    <div className="sys7-doc">
      <h1 className="sys7-doc-h1">Contact</h1>
      <hr className="sys7-doc-rule" />
      <p className="sys7-doc-p"><b>Location:</b> Kitchener-Waterloo, Ontario, Canada</p>
      <p className="sys7-doc-p"><b>Time Zone:</b> America/Toronto</p>
      <hr className="sys7-doc-rule" />
      <table className="sys7-contact-table">
        <tbody>
          {links.map((l, i) => (
            <tr key={i}>
              <td className="sys7-contact-key"><b>{l.label}</b></td>
              <td><a className="sys7-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.handle}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

window.System7Mode = System7Mode;
})();
