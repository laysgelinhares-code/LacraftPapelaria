// ============================================================
// LA CRAFT OS — Agenda de Entregas
// ============================================================

const dayISO = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const AgendaView = () => {
  const { state, saveOrder, set, log, toast } = useLC();
  const [ym, setYm] = React.useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() + 1 }; });
  const [sel, setSel] = React.useState(null);
  const Y = ym.y, M = ym.m;
  const firstDow = new Date(Y + '-' + pad(M) + '-01T12:00:00').getDay();
  const dim = daysInMonth(M);

  const eventsOf = (d) => {
    const isoStr = dayISO(Y, M, d);
    const list = [];
    state.comemorativas.filter((c) => c.data === isoStr).forEach((c) => list.push({ kind: 'festa', label: c.nome, tone: c.cor, mark: false }));
    state.orders.filter((o) => o.prazo === isoStr && o.status !== 'entregue').forEach((o) => list.push({
      kind: 'ped', o, label: `${o.id} · ${clientName(o.cliente)}`, tone: o.prioridade === 'alta' ? 'urg' : 'ped', mark: o.prioridade === 'alta',
    }));
    state.orders.filter((o) => o.prazo === isoStr && o.status === 'entregue').forEach((o) => list.push({ kind: 'dev', o, label: `✓ ${o.id} entregue`, tone: 'dev' }));
    return list;
  };

  const cells = [];
  cells.push(...Array(firstDow).fill(null));
  for (let d = 1; d <= dim; d++) cells.push(d);

  const nav = (delta) => {
    let nm = M + delta, ny = Y;
    if (nm > 12) { nm = 1; ny++; } if (nm < 1) { nm = 12; ny--; }
    setYm({ y: ny, m: nm });
  };

  const selISO = sel ? dayISO(Y, M, sel) : null;
  const selEvents = sel ? eventsOf(sel) : [];

  const upcoming = state.orders.filter((o) => o.status !== 'entregue' && o.prazo).sort((a, b) => (a.prazo > b.prazo ? 1 : -1)).slice(0, 8);

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <span className="stat-pill"><Icon name="agenda" /> {monthName(M)} de {Y}</span>
        <span className="stat-pill"><Icon name="truck" /> {state.orders.filter((o) => o.status !== 'entregue' && o.prazo && o.prazo >= TODAY).length} entregas futuras</span>
        <span className="grow" />
        <Btn sm onClick={() => nav(-1)}><Icon name="left" size={14} /></Btn>
        <Btn sm onClick={() => { const t = new Date(); setYm({ y: t.getFullYear(), m: t.getMonth() + 1 }); }}>Hoje</Btn>
        <Btn sm onClick={() => nav(1)}><Icon name="right" size={14} /></Btn>
      </div>

      <div className="grid cols-2">
        <div className="card pad0">
          <div className="cal">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={'x' + i} />;
              const ev = eventsOf(d);
              const isToday = dayISO(Y, M, d) === TODAY;
              return (
                <div key={d} className={`cal-cell ${isToday ? 'today' : ''} ${sel === d ? 'sel' : ''}`} onClick={() => setSel(sel === d ? null : d)}>
                  <div className="d">{d}</div>
                  {ev.slice(0, 3).map((e, k) => (
                    <div key={k} className={`ev ev-${e.tone}`} style={{ ...(e.mark ? { fontWeight: 800 } : {}) }}>
                      {e.mark ? '🔥 ' : ''}{e.label}
                    </div>
                  ))}
                  {ev.length > 3 ? <div className="tiny muted" style={{ marginTop: 2, fontWeight: 700 }}>+{ev.length - 3} mais</div> : null}
                </div>
              );
            })}
          </div>
          <div className="flex gap8 wrap p-12 no-print" style={{ padding: 10 }}>
            <span className="badge teal">■ entrega</span>
            <span className="badge coral">■ festa/data</span>
            <span className="badge gold">■ entregue</span>
            <span className="badge danger">■ urgente</span>
          </div>
        </div>

        <div>
          {selEvents.length ? (
            <div className="card mb16">
              <SectionHead title={`${sel} de ${monthName(M)}`} sub={weekDay(selISO)}>
                <Btn sm className="no-print" onClick={() => setSel(null)}>fechar</Btn>
              </SectionHead>
              {selEvents.map((e, k) => (
                <div key={k} className="list-row mb8">
                  <span className={`badge ${e.tone === 'ped' ? 'teal' : e.tone === 'urg' ? 'danger' : e.tone === 'dev' ? 'gold' : 'coral'}`}>
                    {e.tone === 'ped' ? '🚚' : e.tone === 'urg' ? '🔥' : e.tone === 'dev' ? '✓' : '🎀'} {e.kind === 'festa' ? 'data' : e.kind === 'dev' ? 'feito' : 'entrega'}
                  </span>
                  <b className="small grow">{e.label}</b>
                  {e.o ? (
                    <span className="flex gap6">
                      {clientById(e.o.cliente)?.tel ? <a className="btn-wa" href={waLink(clientById(e.o.cliente).tel, `Olá! Aqui é a La Craft 💌 Seu pedido ${e.o.id} está com entrega prevista para hoje ✨`)} target="_blank" rel="noreferrer"><Icon name="wa" size={12} /> lembrar</a> : null}
                      {e.o.status === 'pronto' ? <Btn sm variant="ok" onClick={() => { saveOrder(e.o.id, { status: 'entregue' }); log(`${e.o.id} entregue no prazo`); }}><Icon name="check" size={13} /></Btn> : null}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="card">
            <SectionHead title="Próximas entregas" sub="fora do mês selecionado">
              <Badge tone="nude">{upcoming.length}</Badge>
            </SectionHead>
            {upcoming.map((o) => {
              const late = o.prazo < TODAY;
              const cl = clientById(o.cliente);
              return (
                <div key={o.id} className="flex gap8 mb8" style={{ fontSize: 12.5, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <span className={`icon-btn`} style={{ width: 28, height: 28, border: 'none', background: 'var(--teal-soft)', color: 'var(--teal-dark)' }}><Icon name="truck" size={14} /></span>
                  <div className="grow">
                    <b>{o.id}</b> · {clientName(o.cliente)}
                    <div className="tiny muted">{o.items.map((i) => prodName(i.p)).join(' · ')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ color: late ? 'var(--danger)' : undefined }}>{late ? `${fmtDate(o.prazo)} ⚠` : fmtDate(o.prazo)}</b>
                    <div className="tiny muted">{currency(o.total)} {cl?.tel ? <a href={waLink(cl.tel, `Olá ${clientName(o.cliente).split(' ')[0]}! Lembrete da La Craft 💌`)} target="_blank" rel="noreferrer"><Icon name="wa" size={11} /></a> : null}</div>
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 ? <Empty emoji="🗓️" title="Sem entregas previstas" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
};