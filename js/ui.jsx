// ============================================================
// LA CRAFT OS — UI kit (shared components + icons)
// ============================================================

/* ---------- icons ---------- */
const P = {
  dash: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  wallet: <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>,
  orders: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 12h6" /><path d="M9 16h4" /></>,
  catalog: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  orcamento: <><path d="M3 3h18v18H3z" /><path d="M7 8 17 16" /><circle cx="8.5" cy="15.5" r="1.2" /><circle cx="15.5" cy="8.5" r="1.2" /></>,
  producao: <><path d="m12 2 8.5 4.5L12 11 3.5 6.5 12 2z" /><path d="m3.5 11.5 8.5 4.5 8.5-4.5" /><path d="m3.5 17.5 8.5 4.5 8.5-4.5" /></>,
  estoque: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.3 7 12 12 20.7 7" /><line x1="12" y1="22" x2="12" y2="12" /></>,
  financeiro: <><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>,
  custos: <><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M16 14h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /><path d="M16 18h.01" /></>,
  impressao: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  corte: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.1" y2="15.9" /><line x1="14.5" y1="14.5" x2="20" y2="20" /><line x1="8.1" y1="8.1" x2="12" y2="12" /></>,
  agenda: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  relatorios: <><line x1="6" y1="20" x2="6" y2="13" /><line x1="12" y1="20" x2="12" y2="6" /><line x1="18" y1="20" x2="18" y2="10" /></>,
  marketing: <><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>,
  artes: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></>,
  central: <><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" /></>,
  admin: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.6" y2="16.6" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />,
  menu: <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  right: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  left: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  edit: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  print: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  up: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
  down: <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></>,
  card: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
  truck: <><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.3a4 4 0 0 0-1.2-2.9L19 9h-5" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
  alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  wa: <path d="M17.5 14.4c-.3-.1-1.8-.9-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.3-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.4-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 .9-1 2.4s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4zm-5.4 7.4h-.01a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 .9-3.6-.2-.4a9.9 9.9 0 0 1-1.5-5.3C2.3 7.6 6.7 3.2 12.1 3.2c2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.4 9.9-9.9 9.9zm8.4-18.3A11.8 11.8 0 0 0 12.1 0C5.5 0 0.2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.4h.01c6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z" />,
  insta: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="3.5" /><line x1="17.3" y1="6.7" x2="17.31" y2="6.7" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.7z" />,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  chevR: <polyline points="9 18 15 12 9 6" />,
  chevL: <polyline points="15 18 9 12 15 6" />,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" /></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  pin: <><path d="M12 17v5" /><path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.8a2 2 0 0 0-1.1-1.7l-1.8-.9a2 2 0 0 1-1.1-1.8V6a1 1 0 0 0 0-2 1 1 0 0 0 0-2H9a1 1 0 0 0 0 2 1 1 0 0 0 0 2z" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  $: <><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  spark: <><path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" /><path d="M5 3v4M3 5h4" /></>,
  grad: <><path d="M12 2v8" /><path d="M12 22v-8" /><path d="M7 5h10" /><path d="M7 19h10" /><circle cx="12" cy="11" r="5" /></>,
  settings: <><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
};
const FILL = { central: 1, star: 1, heart: 1, wa: 1, play: 1 };
const Icon = ({ name, size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={FILL[name] ? 'currentColor' : 'none'} stroke={FILL[name] ? 'none' : 'currentColor'}
    strokeWidth={name === 'wa' ? 0 : 2} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {P[name]}
  </svg>
);

/* ---------- primitives ---------- */
const Btn = ({ children, variant = 'ghost', className = '', ...rest }) => (
  <button className={`btn ${variant !== 'ghost' ? variant : ''} ${className}`} {...rest}>{children}</button>
);
const Chip = ({ active, children, className = '', ...rest }) => (
  <button className={`chip ${active ? 'active' : ''} ${className}`} {...rest}>{children}</button>
);
const Badge = ({ tone = 'teal', children }) => <span className={`badge ${tone}`}>{children}</span>;
const Field = ({ label, hint, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
    {hint ? <small> {hint}</small> : null}
  </div>
);
const Input = (props) => <input className="input" {...props} />;
const Select = ({ children, ...props }) => <select className="select" {...props}>{children}</select>;
const Textarea = (props) => <textarea className="textarea" {...props}></textarea>;
const SearchInput = ({ value, onChange, placeholder = 'Buscar...' }) => (
  <div className="search-row" style={{ width: '100%', maxWidth: 280 }}>
    <Icon name="search" />
    <input className="input" value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);
const Progress = ({ value = 0, max = 100, tone = '' }) => {
  const v = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div className={`progress ${tone}`}><span style={{ width: `${v}%` }} /></div>;
};
const Empty = ({ emoji = '🪄', title, sub, children }) => (
  <div className="empty"><div className="big">{emoji}</div><b>{title}</b><div>{sub}</div>{children}</div>
);
const SectionHead = ({ title, sub, children }) => (
  <div className="section-head"><h3>{title}</h3>{sub ? <span className="sub">{sub}</span> : null}<span className="grow" />{children}</div>
);
const Tabs = ({ tabs, active, onChange, className = '' }) => (
  <div className={`tabs ${className}`}>
    {tabs.map((t) => (
      <button key={t.k} className={`tab ${active === t.k ? 'active' : ''}`} onClick={() => onChange(t.k)}>{t.label}</button>
    ))}
  </div>
);

/* ---------- status badges ---------- */
const StatusBadge = ({ status, labelOnly }) => {
  const st = STATUSES.find((s) => s.key === status);
  if (!st) return null;
  return <Badge tone={st.tone}>{st.label}</Badge>;
};

/* ---------- modal / drawer ---------- */
const Modal = ({ title, onClose, children, footer, wide, xl }) => (
  <div className="overlay no-print" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`modal ${wide ? 'wide' : ''} ${xl ? 'xl' : ''}`}>
      <div className="modal-head">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer ? <div className="modal-foot">{footer}</div> : null}
    </div>
  </div>
);
const Drawer = ({ title, subtitle, onClose, children, footer, wide }) => (
  <div className="overlay no-print" style={{ alignItems: 'stretch', padding: 0, justifyContent: 'flex-end', background: 'rgba(28,32,30,.35)' }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`drawer ${wide ? 'wide' : ''}`}>
      <div className="drawer-head">
        <h3>{title}</h3>
        {subtitle ? <span className="muted small">{subtitle}</span> : null}
        <span className="grow" />
        <button className="icon-btn" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="drawer-body">{children}</div>
      {footer ? <div className="drawer-foot">{footer}</div> : null}
    </div>
  </div>
);

/* ---------- charts ---------- */
const Donut = ({ data, size = 150, label }) => {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const total = data.reduce((s, d) => s + d.pct, 0) || 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-deep)" strokeWidth={13} />
        {data.map((d, i) => {
          const dash = (d.pct / total) * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.cor} strokeWidth={13} strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-acc} strokeLinecap="butt" />
          );
          acc += dash;
          return el;
        })}
      </g>
      {label ? (
        <text x="50%" y="52%" textAnchor="middle" fill="var(--ink)" fontWeight="700" fontFamily="var(--font-display)" fontSize="16">{label}</text>
      ) : null}
    </svg>
  );
};
const HBar = ({ items, max, fmt, cor = 'var(--teal)' }) => {
  const m = max || Math.max(...items.map((i) => i.valor), 1);
  return (
    <div style={{ display: 'grid', gap: 11 }}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex gap8 mb8" style={{ justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ fontWeight: 700 }}>{it.label}</span>
            <span style={{ fontWeight: 800 }}>{fmt ? fmt(it.valor) : it.valor}</span>
          </div>
          <div className="progress" style={{ background: 'var(--bg-deep)' }}>
            <span style={{ width: `${(it.valor / m) * 100}%`, background: it.cor || cor, height: '100%', display: 'block', borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
};
const VBars = ({ data, height = 170, fmt = (x) => x }) => {
  const m = Math.max(...data.map((d) => d.valor), 1);
  return (
    <div className="flex" style={{ alignItems: 'flex-end', gap: 10, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-soft)' }}>{fmt(d.valor)}</div>
          <div style={{
            width: '100%', maxWidth: 44, borderRadius: '8px 8px 4px 4px', height: `${Math.max(4, (d.valor / m) * 100)}%`,
            background: i === data.length - 1 ? 'linear-gradient(180deg, var(--teal), var(--teal-dark))' : 'var(--border)',
          }} title={`${d.label}: ${d.valor}`} />
          <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------- toast + persist helpers ---------- */
const toast = (msg, type = 'ok') => window.dispatchEvent(new CustomEvent('lc:toast', { detail: { msg, type } }));
const ToastHost = () => {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    const h = (e) => {
      const id = uid('T');
      setItems((p) => [...p, { id, ...e.detail }]);
      setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3200);
    };
    window.addEventListener('lc:toast', h);
    return () => window.removeEventListener('lc:toast', h);
  }, []);
  return (
    <div className="toasts no-print">
      {items.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  );
};

const downloadFile = (name, content, mime) => {
  const blob = new Blob(['\ufeff' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
const csvEscape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
const exportCSV = (filename, headers, rows) => {
  const lines = rows.map((r) => headers.map((h, i) => csvEscape(r[i])).join(';'));
  downloadFile(filename, [headers.map((h) => csvEscape(h)).join(';'), ...lines].join('\n'), 'text/csv;charset=utf-8');
};
const exportJSON = (filename, obj) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
const printPage = () => window.print();