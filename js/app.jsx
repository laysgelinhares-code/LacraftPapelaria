// ============================================================
// LA CRAFT OS — App shell (context, navegação, tema, persistência)
// ============================================================

/* ---------- navigation ---------- */
const NAV = [
  {
    t: 'Menu Principal', items: [
      { k: 'dashboard', label: 'Dashboard', icon: 'dash' },
      { k: 'pedidos', label: 'Pedidos', icon: 'orders' },
      { k: 'clientes', label: 'Clientes', icon: 'users' },
      { k: 'producao', label: 'Produção', icon: 'producao' },
      { k: 'financeiro', label: 'Financeiro', icon: 'financeiro' },
      { k: 'agenda', label: 'Agenda', icon: 'agenda' },
      { k: 'central', label: 'Central da La Craft', icon: 'central' },
    ],
  },
  {
    t: 'Marketing', items: [
      { k: 'marketing', label: 'Marketing', icon: 'marketing' },
      { k: 'biblioteca', label: 'Biblioteca de Artes', icon: 'artes' },
    ],
  },
  {
    t: 'Análises', items: [
      { k: 'relatorios', label: 'Relatórios', icon: 'relatorios' },
      { k: 'custos', label: 'Calculadora de Custos', icon: 'custos' },
    ],
  },
  {
    t: 'Operação', items: [
      { k: 'orcamento', label: 'Orçamento Inteligente', icon: 'orcamento' },
      { k: 'catalogo', label: 'Catálogo de Produtos', icon: 'catalog' },
      { k: 'estoque', label: 'Estoque de Insumos', icon: 'estoque' },
      { k: 'impressao', label: 'Impressão', icon: 'impressao' },
      { k: 'silhouette', label: 'Corte Silhouette', icon: 'corte' },
      { k: 'admin', label: 'Área Administrativa', icon: 'admin' },
    ],
  },
  {
    t: 'Configurações', items: [
      { k: 'configuracoes', label: 'Configurações', icon: 'settings' },
      { k: 'backup', label: 'Backup', icon: 'download' },
      { k: 'perfil', label: 'Perfil', icon: 'user' },
      { k: 'logout', label: 'Sair', icon: 'logout', action: 'logout' },
    ],
  },
];
const ALL_NAV = NAV.flatMap((g) => g.items);
const navTitle = (k) => (ALL_NAV.find((n) => n.k === k) || {}).label || 'La Craft OS';

/* ---------- notifications builders ---------- */
const buildNotifications = (state) => {
  const list = [];
  state.orders.forEach((o) => {
    if (o.status !== 'entregue' && o.prazo && o.prazo < TODAY) {
      list.push({ key: 'late:' + o.id, icon: 'alert', tone: 'danger', title: `${o.id} está atrasado`, msg: `${o.cliente ? clientName(o.cliente) : ''} · previsto p/ ${fmtDate(o.prazo)}` });
    }
    if (o.status !== 'entregue' && o.prazo === TODAY) {
      list.push({ key: 'today:' + o.id, icon: 'agenda', tone: 'teal', title: `Entrega hoje · ${o.id}`, msg: `${o.cliente ? clientName(o.cliente) : ''} · ${currency(o.total)}` });
    }
    if (o.status === 'aguardando') {
      list.push({ key: 'pay:' + o.id, icon: 'card', tone: 'gold', title: `Pagamento pendente · ${o.id}`, msg: `${o.cliente ? clientName(o.cliente) : ''} · ${currency(o.total)}` });
    }
  });
  state.stock.forEach((s) => {
    if (s.qtd <= s.min) list.push({ key: 'stock:' + s.id, icon: 'estoque', tone: 'warn', title: `${s.nome} em falta`, msg: `Restam ${s.qtd} ${s.un} · mínimo ${s.min}` });
  });
  const mth = String(new Date(TODAY + 'T12:00:00').getMonth() + 1).padStart(2, '0');
  state.clients.forEach((c) => {
    if (c.aniversario && c.aniversario.slice(5, 7) === mth) {
      list.push({ key: 'birth:' + c.id, icon: 'heart', tone: 'coral', title: `Aniversário: ${c.nome}`, msg: `Não esqueça a lembrancinha 🤍` });
    }
  });
  return list;
};

/* ---------- app ---------- */
const SEED_STATE = () => ({
  orders: SEED_ORDERS,
  clients: SEED_CLIENTS,
  products: SEED_PRODUCTS,
  stock: SEED_STOCK,
  tx: SEED_TX,
  origem: SEED_ORIGEM,
  meses: SEED_MESES,
  printProfiles: SEED_PRINT,
  cutProfiles: SEED_CUT,
  comemorativas: SEED_COMEMORATIVAS,
  planner: SEED_PLANNER,
  legendas: SEED_LEGENDAS,
  reels: SEED_REELS,
  arts: SEED_ARTS,
  diary: SEED_DAIRY,
  ideas: SEED_IDEAS,
  customPrices: SEED_CUSTOM_PRICES,
  costs: SEED_COSTS,
  metas: METAS,
  users: SEED_USERS,
  activity: SEED_ACTIVITY,
  movs: [],
  printLog: [],
  cutLog: [],
  notifyRead: [],
  q: '',
});

const LS_KEY = 'lacraft_os_state_v1';
const ZERO_GEN_KEY = 'lacraft_os_gen';
const SESSION_KEY = 'lacraft_session';
let GEN = Number(localStorage.getItem(ZERO_GEN_KEY) || 0);

const normalizeUsers = (arr) => (arr && arr.length ? arr.map((u) => ({
  ...u,
  senha: u.senha || 'lacraft',
  acessos: u.acessos || (u.papel === 'Administradora' ? '_all' : DEFAULT_ACESSOS),
})) : arr);

const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = { ...SEED_STATE(), ...JSON.parse(raw) };
      s.users = normalizeUsers(s.users);
      return s;
    }
  } catch (e) { }
  const s = SEED_STATE();
  s.users = normalizeUsers(s.users);
  return s;
};

const MODULES = ALL_NAV.filter((n) => !n.action && n.k !== 'admin').map((n) => ({ k: n.k, label: n.label }));

const LaCraftOS = () => {
  const [state, setState] = React.useState(loadState);
  const [session, setSession] = React.useState(() => {
    const id = localStorage.getItem(SESSION_KEY);
    return state.users && state.users.some((u) => u.id === id) ? id : null;
  });
  const user = (state.users || []).find((u) => u.id === session) || null;
  const allowAll = !!user && user.acessos === '_all';
  const allowedSet = React.useMemo(() => {
    if (!user) return new Set();
    return allowAll ? new Set(ALL_NAV.map((n) => n.k)) : new Set(user.acessos || []);
  }, [user]);
  const can = (k) => (k === 'logout' ? true : allowedSet.has(k));
  const [theme, setTheme] = React.useState(() => localStorage.getItem('lacraft_theme') || 'light');
  const [tab, setTab] = React.useState(() => {
    const h = (location.hash || '').replace(/^#\/?/, '');
    const it = ALL_NAV.find((n) => n.k === h);
    return it && !it.action ? h : 'dashboard';
  });
  const ORIG_HASH = location.hash || '';
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [now, setNow] = React.useState(new Date());
  const [notifyOpen, setNotifyOpen] = React.useState(false);
  const [newOrderOpen, setNewOrderOpen] = React.useState(false);

  window.__clients = state.clients;
  window.__products = state.products;

  React.useEffect(() => {
    if (Number(localStorage.getItem(ZERO_GEN_KEY) || 0) === GEN) {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }, [state]);
  React.useEffect(() => {
    localStorage.setItem('lacraft_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    history.replaceState(null, '', '#' + tab);
  }, [tab]);
  React.useEffect(() => {
    if (ORIG_HASH.replace(/^#\/?/, '') === 'zerar') {
      zeroOperational();
      history.replaceState(null, '', '#dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (session && !state.users.some((u) => u.id === session)) {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, state.users]);
  React.useEffect(() => {
    if (user && tab !== 'logout' && !can(tab)) {
      const first = MODULES.find((m) => can(m.k));
      setTab(first ? first.k : 'dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (key, fn) => setState((s) => {
    const next = typeof fn === 'function' ? fn(s[key]) : fn;
    return { ...s, [key]: next };
  });

  const log = (msg, user = 'Lays') =>
    set('activity', (a) => [{ id: uid('AC'), data: TODAY + 'T' + new Date().toTimeString().slice(0, 8), user, msg }, ...a]);

  const zeroOperational = () => {
    const next = {
      ...state,
      orders: [],
      clients: [],
      tx: [],
      origem: [],
      meses: [],
      diary: [],
      activity: [],
      movs: [],
      printLog: [],
      cutLog: [],
    };
    GEN++;
    localStorage.setItem(ZERO_GEN_KEY, String(GEN));
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setState(next);
    toast('Empresa zerada — começando do zero 🎉');
  };

  /* ---- core order action ---- */
  const prodName = (pid) => (state.products.find((p) => p.id === pid) || {}).nome || pid;
  const prodLabel = (o) => o.items.map((i) => `${i.qtd}x ${prodName(i.p)}`).join(' + ');

  const consumeStock = (order) => {
    order.items.forEach((it) => {
      const prod = state.products.find((p) => p.id === it.p);
      (prod?.materiais || []).forEach((mat) => {
        set('stock', (arr) => arr.map((st) =>
          st.id === mat.i ? { ...st, qtd: Math.max(0, n(st.qtd) - n(mat.q) * it.qtd) } : st
        ));
      });
    });
  };

  const saveOrder = (id, patch) => {
    const o = state.orders.find((x) => x.id === id);
    if (!o) return;
    const next = { ...o, ...patch, timer: { ...(o.timer || {}) } };
    let sideName = '';
    if (patch.status && patch.status !== o.status) {
      const from = statusIdx(o.status), to = statusIdx(patch.status);
      sideName = `${next.id} → ${STATUSES[to].label}`;
      if (to > from) {
        if (from < 2 && to >= 2 && !o.sinal) {
          next.sinal = next.total;
          set('tx', (t) => [{
            id: uid('TX'), tipo: 'entrada', cat: 'Cliente', meta: next.metodo || 'Pix',
            valor: next.total, data: TODAY, desc: `${next.id} · ${prodLabel(next)}`, status: 'pago',
          }, ...t]);
          toast(`${next.id} pago · ${currency(next.total)} 💰`);
          log(`Pagamento recebido · ${prodLabel(next)} (${next.id})`);
        }
        if (from < 3 && to >= 3) consumeStock(next);
        if (to === statusIdx('entregue')) toast(`${next.id} entregue com sucesso 🎉`);
      }
      log(`Status: ${sideName}`);
    }
    set('orders', (arr) => arr.map((x) => (x.id === id ? next : x)));
  };

  const notifications = React.useMemo(() => buildNotifications(state), [state]);

  const go = (k) => {
    if (!can(k)) { toast('Você não tem acesso a esta área', 'warn'); return; }
    setTab(k); setMenuOpen(false);
  };
  const loginAs = (id, nome) => {
    localStorage.setItem(SESSION_KEY, id);
    setSession(id);
    toast(`Bem-vinda, ${nome} 💛`);
  };
  const logout = () => {
    if (window.confirm('Encerrar a sessão? Os dados continuam salvos neste navegador.')) {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
      setMenuOpen(false);
    }
  };

  const ctx = {
    state, set, now,
    theme, toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    tab, go,
    menuOpen, setMenuOpen,
    saveOrder, prodName, prodLabel, log, toast,
    clientName, clientById,
    notifications, notifyOpen, setNotifyOpen,
    newOrderOpen, setNewOrderOpen,
    markRead: (k) => set('notifyRead', (r) => (r.includes(k) ? r : [...r, k])),
    q: state.q, setQ: (q) => set('q', q),
    zeroOperational,
    user, session, loginAs, logout, can,
  };

  const unread = notifications.filter((n) => !(state.notifyRead || []).includes(n.key));

  if (!user) {
    return (
      <LC.Provider value={ctx}>
        <LoginScreen users={state.users || []} onLogin={(id, nome) => loginAs(id, nome)} />
        <ToastHost />
      </LC.Provider>
    );
  }

  return (
    <LC.Provider value={ctx}>
      <div className="app">
        <Sidebar tab={tab} go={go} unreadLate={unread.length} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
        {menuOpen ? <div className="nav-overlay no-print" onClick={() => setMenuOpen(false)} /> : null}
        <div className="main">
          <Topbar />
          <div className="content">
            <RenderTab tab={tab} />
          </div>
        </div>
        <ToastHost />
      </div>
    </LC.Provider>
  );
};

/* ---------- sidebar ---------- */
const Sidebar = ({ tab, go, unreadLate, open, onClose, onLogout }) => {
  const { state, user, can } = useLC();
  const openOrders = () => state.orders.filter((o) => o.status !== 'entregue').length;
  const lowStock = () => state.stock.filter((s) => s.qtd <= s.min).length;
  const counts = { pedidos: openOrders(), estoque: lowStock() };
  const tone = { pedidos: 'coral', estoque: 'gold' };
  return (
    <aside className={`sidebar no-print ${open ? 'open' : ''}`} aria-label="Menu principal">
      <div className="side-logo">
        <img src="assets/logo.png" alt="La Craft" className="logo-img" />
      </div>
      <div className="side-user">
        <div className="avatar" style={{ background: user.cor || 'var(--teal)' }}>{initials(user.nome)}</div>
        <div>
          <b>{user.nome}</b>
          <span className="hand">{user.papel}</span>
        </div>
      </div>
      <nav className="side-nav">
        {NAV.map((g, gi) => {
          const items = g.items.filter((it) => can(it.k));
          if (!items.length) return null;
          return (
            <div key={gi}>
              <div className="side-section">{g.t}</div>
              {items.map((it) => (
                <button key={it.k} type="button" className={`nav-item ${!it.action && tab === it.k ? 'active' : ''} ${it.action ? 'is-action' : ''}`}
                  aria-current={!it.action && tab === it.k ? 'page' : undefined}
                  onClick={() => (it.action === 'logout' ? onLogout() : (go(it.k), onClose()))}>
                  <Icon name={it.icon} size={18} />
                  <span>{it.label}</span>
                  {!it.action && counts[it.k] ? <span className={`count ${tone[it.k]}`}>{counts[it.k]}</span> : null}
                  {it.k === 'pedidos' && !it.action && unreadLate > 0 ? <span className="count">{unreadLate}</span> : null}
                </button>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="side-foot">La Craft OS v2.0<br />backup automático ativo</div>
    </aside>
  );
};

/* ---------- topbar ---------- */
const Topbar = () => {
  const { tab, theme, toggleTheme, notifications, notifyOpen, setNotifyOpen, markRead, state, q, setQ, go, clientById, setMenuOpen, user } = useLC();
  const [sel, setSel] = React.useState(null);
  const d = new Date(TODAY + 'T12:00:00');
  const dateTxt = `${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const unread = notifications.filter((n) => !(state.notifyRead || []).includes(n.key));
  const suggest = q.trim().length > 0 || sel;
  return (
    <header className="topbar no-print">
      <div className="topbar-left">
        <button className="icon-btn burger" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
        <div className="tb-title">
          {navTitle(tab)}
          <small>{dateTxt}</small>
        </div>
      </div>
      <div className="topbar-search">
        <div className="search-box">
          <Icon name="search" size={15} />
          <input placeholder="Buscar pedido, cliente..." value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setSel(true)} onBlur={() => setTimeout(() => setSel(false), 150)} aria-label="Buscar pedido ou cliente" />
        </div>
        {suggest ? (
          <div className="pop" style={{ right: 'auto', left: 0, top: 46, width: 380 }}>
            <div className="small muted" style={{ padding: '6px 10px' }}>Clientes</div>
            {state.clients.filter((c) => c.nome.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((c) => (
              <div key={c.id} className="pop-item" onMouseDown={() => { setQ(''); go('clientes'); setTimeout(() => document.dispatchEvent(new CustomEvent('lc:openclient', { detail: { id: c.id } })), 300); }}>
                <span className="badge teal"><Icon name="users" size={12} /> {c.nome}</span>
                <span className="grow" /><span className="muted tiny">{c.cidade}</span>
              </div>
            ))}
            <div className="small muted" style={{ padding: '6px 10px' }}>Pedidos</div>
            {state.orders.filter((o) => o.id.toLowerCase().includes(q.toLowerCase()) || (o.cliente && clientName(o.cliente).toLowerCase().includes(q.toLowerCase()))).slice(0, 4).map((o) => (
              <div key={o.id} className="pop-item" onMouseDown={() => { setQ(''); go('pedidos'); setTimeout(() => document.dispatchEvent(new CustomEvent('lc:openorder', { detail: { id: o.id } })), 300); }}>
                <span className="pi-ico" style={{ background: 'var(--teal-soft)', color: 'var(--teal-dark)' }}><Icon name="orders" size={14} /></span>
                <div><b>{o.id}</b><span>{o.cliente ? clientName(o.cliente) : ''} · {currency(o.total)}</span></div>
                <StatusBadge status={o.status} />
              </div>
            ))}
            {q && state.clients.filter((c) => c.nome.toLowerCase().includes(q.toLowerCase())).length === 0 && state.orders.filter((o) => o.id.toLowerCase().includes(q.toLowerCase())).length === 0 ? (
              <div className="empty" style={{ padding: 14 }}>Nada encontrado para "{q}"</div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="topbar-right">
        <button className="icon-btn" onClick={toggleTheme} title="Alternar tema" aria-label="Alternar tema claro e escuro">
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setNotifyOpen(!notifyOpen)} title="Notificações" aria-label="Notificações">
            <Icon name="bell" />
            {unread.length ? <span className="dot" /> : null}
          </button>
          {notifyOpen ? (
            <div className="pop">
              {notifications.length === 0 ? <div className="empty" style={{ padding: 16 }}>Tudo em dia 💛</div> : null}
              {notifications.map((n) => {
                const isRead = (state.notifyRead || []).includes(n.key);
                return (
                  <div key={n.key} className={`pop-item ${isRead ? '' : 'unread'}`} onClick={() => { markRead(n.key); setNotifyOpen(false); if (n.orderId) go('pedidos'); if (n.stockId) go('estoque'); }}>
                    <span className="pi-ico" style={{ background: `var(--${n.tone}-soft)`, color: `var(--${n.tone})` }}><Icon name={n.icon} size={14} /></span>
                    <div><b>{n.title}</b><span>{n.msg}</span></div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        <button className="top-avatar" onClick={() => go('perfil')} title={user.nome} aria-label="Abrir perfil" style={{ background: user.cor || 'var(--teal)' }}>
          {initials(user.nome)}
        </button>
      </div>
    </header>
  );
};

/* ---------- tab router ---------- */
const RenderTab = ({ tab }) => {
  const { user, can } = useLC();
  if (user && tab !== 'logout' && !can(tab)) {
    return React.createElement('div', { className: 'empty', style: { marginTop: 48 } },
      '🔒 Sem permissão para acessar esta área.',
      React.createElement('br'),
      React.createElement('span', { className: 'muted small' }, 'Peça ao administrador para liberar seu acesso.'));
  }
  switch (tab) {
    case 'dashboard': return React.createElement(Dashboard);
    case 'pedidos': return React.createElement(PedidosView);
    case 'orcamento': return React.createElement(OrcamentoView);
    case 'clientes': return React.createElement(ClientesView);
    case 'catalogo': return React.createElement(CatalogoView);
    case 'producao': return React.createElement(ProducaoView);
    case 'estoque': return React.createElement(EstoqueView);
    case 'impressao': return React.createElement(ImpressaoView);
    case 'silhouette': return React.createElement(SilhouetteView);
    case 'agenda': return React.createElement(AgendaView);
    case 'financeiro': return React.createElement(FinanceiroView);
    case 'custos': return React.createElement(CustosView);
    case 'relatorios': return React.createElement(RelatoriosView);
    case 'marketing': return React.createElement(MarketingView);
    case 'biblioteca': return React.createElement(BibliotecaView);
    case 'central': return React.createElement(CentralView);
    case 'admin': return React.createElement(AdminView);
    case 'configuracoes': return React.createElement(ConfiguracoesView);
    case 'backup': return React.createElement(BackupView);
    case 'perfil': return React.createElement(PerfilView);
    default: return null;
  }
};

/* ---------- login screen ---------- */
const LoginScreen = ({ users, onLogin }) => {
  const [u, setU] = React.useState('');
  const [p, setP] = React.useState('');
  const sub = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const f = users.find((x) => String(x.login || '').toLowerCase() === u.trim().toLowerCase());
    if (f && f.senha === p) onLogin(f.id, f.nome);
    else toast('Login ou senha incorretos', 'error');
  };
  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={sub}>
        <img src="assets/logo.png" alt="La Craft" className="login-logo" />
        <h1 className="font-display">La Craft OS</h1>
        <p className="muted small">Entre com seu login e senha para acessar o sistema.</p>
        <Field label="Login">
          <Input value={u} onChange={(e) => setU(e.target.value)} placeholder="ex.: lays@lacraft" autoFocus />
        </Field>
        <Field label="Senha">
          <Input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••" />
        </Field>
        <Btn variant="primary" block type="submit">Entrar</Btn>
        <div className="muted tiny mt16" style={{ lineHeight: 1.6 }}>
          Primeiro acesso: senha padrão <b>lacraft</b>. Para trocar, entre e altere no menu <b>Perfil</b>.
        </div>
      </form>
    </div>
  );
};

/* ---------- mount ---------- */
const __root = document.getElementById('root');
if (__root && !__root.childNodes.length) {
  ReactDOM.createRoot(__root).render(<LaCraftOS />);
}