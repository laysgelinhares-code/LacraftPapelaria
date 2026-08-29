// ============================================================
// LA CRAFT OS — Produção (fila, checklist e cronômetro)
// ============================================================

const PROD_KEYS = ['pago', 'producao', 'impressao', 'corte', 'encadernacao', 'acabamento'];

const ProdRow = ({ o }) => {
  const { state, saveOrder, now } = useLC();
  const [open, setOpen] = React.useState(false);
  const steps = computeSteps(o);
  const done = o.prodDone || [];
  const client = clientById(o.cliente);
  const late = o.prazo < TODAY;
  const timerSec = elapsed(o, now);
  const running = !!(o.timer && o.timer.start);
  const curStep = done.length;

  return (
    <div className="card mb12" style={{ padding: 14 }}>
      <div className="flex gap10 wrap">
        <div className="art-tile" style={{ width: 46, aspectRatio: '1', borderRadius: 11 }} onClick={() => { setOpen(!open); }}>
          <span style={{ fontSize: 20 }}>{(state.products.find((p) => p.id === o.items[0]?.p) || {}).foto || '📦'}</span>
        </div>
        <div className="grow">
          <div className="flex gap8 wrap">
            <b style={{ color: 'var(--teal-dark)', fontFamily: 'var(--font-display)' }}>{o.id}</b>
            {late ? <Badge tone="danger">atrasado</Badge> : <Badge tone="teal">{fmtDate(o.prazo)}</Badge>}
            <StatusBadge status={o.status} />
          </div>
          <div className="small" style={{ fontWeight: 700 }}>{o.items.map((i) => prodName(i.p)).join(' · ')}</div>
          <div className="tiny muted">{client?.nome} · responsável: {o.responsavel} · {o.items[0]?.qtd || 1} un</div>
        </div>
        <div className="flex gap8" style={{ alignItems: 'center' }}>
          <div className="kpi-label">Checklist</div>
          <b className="font-display" style={{ fontSize: 18 }}>{Math.round((done.filter(Boolean).length / steps.length) * 100)}%</b>
          <div style={{ width: 110 }}><Progress value={done.filter(Boolean).length} max={steps.length} tone="coral" /></div>
        </div>
        <div className="flex gap8">
          <div style={{ textAlign: 'right' }}>
            <div className="kpi-label">Timer</div>
            <div className="font-display" style={{ fontSize: 17, fontVariantNumeric: 'tabular-nums' }}>{fmtTimer(timerSec)}</div>
          </div>
          <Btn sm variant="soft" title="cronômetro" onClick={() => saveOrder(o.id, { timer: running ? { acc: timerSec, start: null } : { acc: o.timer?.acc || 0, start: Date.now() } })}>
            <Icon name={running ? 'pause' : 'play'} size={13} />
          </Btn>
        </div>
      </div>
      {open ? (
        <div className="mt12">
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {steps.map((s, k) => (
              <label key={k} className="list-row" style={{ padding: '7px 10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!done[k]} onChange={() => { const d = [...done]; d[k] = !d[k]; saveOrder(o.id, { prodDone: d }); }} style={{ accentColor: 'var(--coral)' }} />
                <span className="tiny grow" style={{ fontWeight: 700 }}>{s}</span>
                {done[k] ? <Icon name="check" size={13} style={{ color: 'var(--ok)' }} /> : null}
              </label>
            ))}
          </div>
          <div className="flex gap8 mt10">
            <Btn sm onClick={() => saveOrder(o.id, { prodDone: steps.map(() => true) })}><Icon name="check" size={14} /> Concluir todas</Btn>
            <Btn sm variant="primary" onClick={() => { const i = Math.min(STATUSES.length - 1, statusIdx(o.status) + 1); saveOrder(o.id, { status: STATUSES[i].key }); }}><Icon name="right" size={14} /> Avançar etapa</Btn>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ProducaoView = () => {
  const { state } = useLC();
  const [tab, setTab] = React.useState('fila');
  const prods = state.orders.filter((o) => PROD_KEYS.includes(o.status));
  const atrasados = prods.filter((o) => o.prazo < TODAY);
  const hoje = prods.filter((o) => o.prazo === TODAY);
  const amanha = prods.filter((o) => o.prazo === iso(dayAfter(), 8));
  const proximos = prods.filter((o) => o.prazo > TODAY && o.prazo !== amanha);

  // grid dos próximos 7 dias
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(TODAY + 'T12:00:00'); d.setDate(d.getDate() + i); const is = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; return is; });

  return (
    <div>
      <div className="tabs no-print">
        <button className={`tab ${tab === 'fila' ? 'active' : ''}`} onClick={() => setTab('fila')}>Fila de hoje</button>
        <button className={`tab ${tab === 'semana' ? 'active' : ''}`} onClick={() => setTab('semana')}>Semana</button>
        <button className={`tab ${tab === 'todas' ? 'active' : ''}`} onClick={() => setTab('todas')}>Todas em produção ({prods.length})</button>
      </div>

      {tab === 'fila' ? (
        <div>
          <div className="grid cols-3 mb16">
            <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--coral) 30%, var(--border))' }}>
              <Badge tone="danger">atrasados</Badge>
              <div className="font-display" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{atrasados.length}</div>
              <div className="muted tiny">priorize agora</div>
            </div>
            <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--teal) 30%, var(--border))' }}>
              <Badge tone="teal">entrega hoje</Badge>
              <div className="font-display" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{hoje.length}</div>
              <div className="muted tiny">contas hoje</div>
            </div>
            <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--gold) 35%, var(--border))' }}>
              <Badge tone="gold">amanhã</Badge>
              <div className="font-display" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{amanha.length}</div>
              <div className="muted tiny">prepare a fila</div>
            </div>
          </div>

          {atrasados.length ? <div className="mb12"><h3 className="font-display mb8" style={{ color: 'var(--danger)' }}>⚠ Atrasados</h3>{atrasados.map((o) => <ProdRow key={o.id} o={o} />)}</div> : null}
          <div className="mb12"><h3 className="font-display mb8">💛 Hoje ({hoje.length})</h3>{hoje.map((o) => <ProdRow key={o.id} o={o} />)}{!hoje.length ? <Empty emoji="🎉" title="Tudo em dia por hoje" sub="Nenhuma entrega marcada para hoje." /> : null}</div>
          <div className="mb12"><h3 className="font-display mb8">🌤 Amanhã ({amanha.length})</h3>{amanha.map((o) => <ProdRow key={o.id} o={o} />)}{!amanha.length ? <Empty emoji="🗓️" title="Sem entregas amanhã" /> : null}</div>
          <div className="mb12"><h3 className="font-display mb8">Próximos ({proximos.length})</h3>{proximos.map((o) => <ProdRow key={o.id} o={o} />)}{!proximos.length ? <Empty emoji="💆" title="Fila limpa" sub="Aproveite para organizar o ateliê!" /> : null}</div>
        </div>
      ) : null}

      {tab === 'semana' ? (
        <div>
          <div className="grid cols-4 mb16">
            <div className="card"><div className="kpi-label">Total na produção</div><div className="kpi-value">{prods.length}</div></div>
            <div className="card"><div className="kpi-label">Prontos p/ hoje</div><div className="kpi-value">{hoje.length}</div></div>
            <div className="card"><div className="kpi-label">Rush (alta)</div><div className="kpi-value">{prods.filter((o) => o.prioridade === 'alta').length}</div></div>
            <div className="card"><div className="kpi-label">Responsável</div><div className="kpi-value" style={{ fontSize: 19 }}>Lays · Ana</div></div>
          </div>
          <div className="grid cols-4">
            {days.map((d) => {
              const dayProds = prods.filter((o) => o.prazo === d);
              return (
                <div key={d} className={`card ${d === TODAY ? '' : ''}`} style={{ borderColor: d === TODAY ? 'var(--teal)' : undefined }}>
                  <div className="flex gap8 mb8"><b className="font-display">{weekDay(d)}</b><span className="badge nude">{fmtDate(d)}</span></div>
                  {dayProds.map((o) => (
                    <div key={o.id} className="list-row mb8" style={{ padding: '8px 10px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: 50, background: o.prioridade === 'alta' ? 'var(--coral)' : 'var(--teal)' }} />
                      <b className="tiny">{o.id}</b>
                      <span className="grow tiny muted">{clientName(o.cliente).split(' ')[0]}</span>
                    </div>
                  ))}
                  {!dayProds.length ? <div className="tiny muted">sem produção</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === 'todas' ? (
        <div>{prods.map((o) => <ProdRow key={o.id} o={o} />)}{prods.length === 0 ? <Empty emoji="🌿" title="Nenhum pedido em produção" sub="Os pedidos aparecem aqui ao avançarem no kanban." /> : null}</div>
      ) : null}
    </div>
  );
};

const dayAfter = () => { const d = new Date(TODAY + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.getDate(); };