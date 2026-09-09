// ============================================================
// LA CRAFT OS — Pedidos (Kanban) + produção por etapa
// ============================================================

const computeSteps = (o) => {
  const spec = (o.items || [])[0];
  const prod = spec ? (window.__products || []).find((p) => p.id === spec.p) : null;
  if (prod) {
    const key = Object.keys(PRODUCT_STEPS).find((k) => prod.nome.includes(k) || prod.categoria.includes(k.toLowerCase().slice(0, 5)));
    if (key) return PRODUCT_STEPS[key];
  }
  return DEFAULT_STEPS;
};
const stepProgress = (o) => {
  const steps = computeSteps(o);
  const done = o.prodDone || [];
  return Math.round((done.filter(Boolean).length / steps.length) * 100);
};
const fmtTimer = (sec) => {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
const elapsed = (o, now) => o.timer && o.timer.start ? o.timer.acc + (now - o.timer.start) / 1000 : (o.timer ? o.timer.acc : 0);
const waOrderMsg = (o) => {
  const items = o.items.map((i) => `${i.qtd}x ${prodName(i.p)}`).join(' · ');
  const base = `Olá! Aqui é a La Craft Papelaria 💌 Sobre seu pedido *${o.id}* (${items}):`;
  return { 'orcamento': `${base} Preparei seu orçamento no valor *${currency(o.total)}*. Quando quiser, confirmo para iniciar a produção!`, 'aguardando': `${base} Seu pedido está aguardando o pagamento de *${currency(o.total)}*. Assim que confirmar, já entro na fila de produção 🤍`, 'pronto': `${base} Seu pedido está PRONTO! 🎉 Combinamos a entrega/recolha para ${fmtDate(o.prazo)}.`, 'entregue': `${base} Já foi entregue! Espero que ame. Se puder, me deixe sua avaliação 💕` }[o.status] || `${base} Seu pedido está ${STATUSES.find((s) => s.key === o.status)?.label}. Qualquer dúvida, é só chamar!`;
};
const nextOrderId = (orders) => {
  let mx = 0;
  orders.forEach((o) => { const m = o.id.match(/LC-(\d+)/); if (m) mx = Math.max(mx, parseInt(m[1])); });
  return `LC-${String(mx + 1).padStart(3, '0')}`;
};

/* ---------- order card ---------- */
const OrderCard = ({ o }) => {
  const { state, delOrder } = useLC();
  const st = STATUSES.find((s) => s.key === o.status);
  const late = o.status !== 'entregue' && o.prazo && o.prazo < TODAY;
  const donePct = stepProgress(o);
  const inProd = ['producao', 'impressao', 'corte', 'encadernacao', 'acabamento'].includes(o.status);
  return (
    <div className="kcard" draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', o.id)}
      onClick={() => document.dispatchEvent(new CustomEvent('lc:openorder', { detail: { id: o.id } }))}>
      <div className="k-top">
        <span className="k-id">{o.id}</span>
        <span className="pri-dot" style={{ background: o.prioridade === 'alta' ? 'var(--coral)' : 'var(--muted-2)' }} title={o.prioridade === 'alta' ? 'Prioridade alta' : 'Prioridade normal'} />
        <span className="right" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {o.orig ? <span className="badge nude">{o.orig}</span> : null}
          <button type="button" title="Excluir pedido" className="card-x" onClick={(e) => { e.stopPropagation(); delOrder(o.id); }}>
            <Icon name="x" size={13} />
          </button>
        </span>
      </div>
      <div className="k-name">{o.items.map((i) => prodName(i.p)).join(' · ')}</div>
      <div className="k-cli">{clientName(o.cliente)}</div>
      <div className="k-meta">
        <span className={`${late ? 'late' : ''}`}>{late ? `⚠ ${fmtDate(o.prazo)}` : `📅 ${fmtDate(o.prazo)}`}</span>
        <span className="k-val">{currency(o.total)}</span>
      </div>
      {inProd ? (
        <div className="mt8 flex gap8" style={{ fontSize: 10.5 }}>
          <div className="flex" style={{ flex: 1 }}><Progress value={donePct} tone="coral" /></div>
          <b style={{ color: 'var(--coral)' }}>{donePct}%</b>
        </div>
      ) : null}
      <div className="flex gap8 mt8" style={{ fontSize: 10.5, color: 'var(--muted)' }}>
        <Icon name="user" size={12} /> {o.responsavel}
        {st ? <span className="right" style={{ color: st.color }}>{st.label}</span> : null}
      </div>
    </div>
  );
};

/* ---------- kanban ---------- */
const Kanban = () => {
  const { state, saveOrder, log } = useLC();
  const [dragOver, setDragOver] = React.useState(null);
  return (
    <div className="kanban">
      {STATUSES.filter((st) => st.key !== 'entregue').map((st) => {
        const cards = state.orders.filter((o) => o.status === st.key && (!state.q || (o.id + clientName(o.cliente) + o.items.map((i) => prodName(i.p))).toLowerCase().includes(state.q.toLowerCase().trim())));
        return (
          <div key={st.key} className={`kcol ${dragOver === st.key ? 'drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(st.key); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) { saveOrder(id, { status: st.key }); toast(`${id} → ${st.label}`); log(`${id} movido para ${st.label}`); } }}>
            <div className="kcol-head">
              <span className="ic" style={{ background: st.color }} />
              {st.label}
              <span className="n">{cards.length}</span>
            </div>
            <div className="kcol-body">
              {cards.map((o) => <OrderCard key={o.id} o={o} />)}
              {cards.length === 0 ? <div className="tiny muted" style={{ textAlign: 'center', padding: 14 }}>—</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- new order modal ---------- */
const NewOrderModal = ({ onClose }) => {
  const { state, set, saveOrder, log, prodName, consumeOrderStock } = useLC();
  const [cid, setCid] = React.useState('');
  const [newCl, setNewCl] = React.useState(false);
  const [nv, setNv] = React.useState({ nome: '', tel: '' });
  const [items, setItems] = React.useState([{ p: 'P01', qtd: 1 }]);
  const [prio, setPrio] = React.useState('normal');
  const [prazo, setPrazo] = React.useState(plusDaysISO(5));
  const [metodo, setMetodo] = React.useState('Pix');
  const [resp, setResp] = React.useState('Lays');
  const [orig, setOrig] = React.useState('WhatsApp');
  const [notas, setNotas] = React.useState('');
  const [arte, setArte] = React.useState([{ nome: '' }]);

  React.useEffect(() => {
    if (window.__preSelProduct) {
      setItems([{ p: window.__preSelProduct, qtd: 1 }]);
      window.__preSelProduct = null;
    }
    // eslint-disable-next-line
  }, []);

  const total = items.reduce((s, i) => {
    const p = state.products.find((x) => x.id === i.p);
    return s + (p ? planPrice(state, p) * Math.max(1, i.qtd) : 0);
  }, 0);

  const addItem = () => setItems((a) => [...a, { p: 'P01', qtd: 1 }]);
  const setItem = (k, patch) => setItems((a) => a.map((x, i) => (i === k ? { ...x, ...patch } : x)));

  const save = () => {
    const clientId = newCl
      ? (() => { const id = uid('C'); set('clients', (a) => [...a, { id, nome: nv.nome, tel: nv.tel.replace(/\D/g, ''), instagram: '', aniversario: '', cidade: '', obs: '' }]); return id; })()
      : cid;
    if (!clientId || items.length === 0) { toast('Escolha cliente e pelo menos 1 produto', 'warn'); return; }
    const id = nextOrderId(state.orders);
    const cleanItems = items.map((i) => { const p = state.products.find((x) => x.id === i.p); return { p: i.p, qtd: i.qtd, valor: (p ? planPrice(state, p) : 0) * i.qtd }; });
    set('orders', (a) => [{
      id, cliente: clientId, items: cleanItems, total,
      status: 'orcamento', prioridade: prio, prazo, abertura: TODAY,
      sinal: 0, metodo, responsavel: resp, orig, arte: arte.filter((x) => x.nome), notas,
      timer: { acc: 0, start: null },
    }, ...a]);
    consumeOrderStock(cleanItems);
    log(`Novo pedido criado: ${id}`);
    toast(`${id} criado · ${currency(total)} ✨`);
    if (nv.tel) { window.open(waLink(nv.tel, `Olá! Este é o seu orçamento exclusivo da La Craft 💌 valor ${currency(total)}.`), '_blank'); }
    onClose();
  };

  return (
    <Modal title="Novo Pedido" onClose={onClose} wide
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Icon name="plus" /> Criar Pedido</Btn></>}>
      <div className="grid cols-2">
        <div>
          <Field label="Cliente">
            {newCl ? (
              <div className="flex gap8">
                <Input placeholder="Nome completo" value={nv.nome} onChange={(e) => setNv({ ...nv, nome: e.target.value })} />
                <Input placeholder="WhatsApp (com DDD)" style={{ maxWidth: 180 }} value={nv.tel} onChange={(e) => setNv({ ...nv, tel: e.target.value })} />
              </div>
            ) : (
              <div className="flex gap8">
                <Select value={cid} onChange={(e) => setCid(e.target.value)}>
                  <option value="">Selecionar cliente...</option>
                  {state.clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
                <Btn sm onClick={() => setNewCl(true)}><Icon name="plus" size={13} /> Nova</Btn>
              </div>
            )}
          </Field>
          <Field label="Itens do pedido">
            <div style={{ display: 'grid', gap: 8 }}>
              {items.map((it, k) => (
                <div key={k} className="flex gap8">
                  <div className="grow">
                    <Select value={it.p} onChange={(e) => setItem(k, { p: e.target.value })}>
                      {state.products.map((p) => <option key={p.id} value={p.id}>{EMOJI_BY_CAT[p.categoria] || '📦'} {p.nome} — {currency(planPrice(state, p))}</option>)}
                    </Select>
                  </div>
                  <Input type="number" min={1} value={it.qtd} style={{ width: 70 }} onChange={(e) => setItem(k, { qtd: parseInt(e.target.value) || 1 })} />
                  {items.length > 1 ? <Btn sm className="danger-ghost" onClick={() => setItems((a) => a.filter((x, i) => i !== k))}><Icon name="x" size={13} /></Btn> : null}
                </div>
              ))}
              <Btn sm onClick={addItem}><Icon name="plus" size={13} /> Adicionar produto</Btn>
            </div>
          </Field>
        </div>
        <div>
          <div className="grid cols-2">
            <Field label="Prioridade">
              <Select value={prio} onChange={(e) => setPrio(e.target.value)}>
                <option value="normal">Normal</option><option value="alta">Alta 🔥</option>
              </Select>
            </Field>
            <Field label="Prazo"><Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} /></Field>
            <Field label="Pagamento">
              <Select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                <option>Pix</option><option>Cartão</option><option>Shopee</option><option>Dinheiro</option>
              </Select>
            </Field>
            <Field label="Responsável">
              <Select value={resp} onChange={(e) => setResp(e.target.value)}>
                <option>Lays</option><option>Ana</option><option>Bia</option>
              </Select>
            </Field>
          </div>
          <Field label="Origem da venda">
            <Select value={orig} onChange={(e) => setOrig(e.target.value)}>
              <option>Instagram</option><option>WhatsApp</option><option>Shopee</option><option>Loja Física</option><option>Feira</option>
            </Select>
          </Field>
          <Field label="Arquivo da arte (opcional)">
            <Input placeholder="nome do arquivo (ex.: arte-final.png)" value={arte[0].nome} onChange={(e) => setArte([{ nome: e.target.value }])} />
          </Field>
          <Field label="Observações"><Textarea value={notas} onChange={(e) => setNotas(e.target.value)} /></Field>
          <div className="kv">
            <div><div className="k">Total do pedido</div><div className="v">{currency(total)}</div></div>
            <div><div className="k">ID previsto</div><div className="v sm">{nextOrderId(state.orders)}</div></div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* ---------- detail drawer ---------- */
const OrderDrawer = ({ o, onClose }) => {
  const { state, saveOrder, delOrder, log, now, go } = useLC();
  const client = clientById(o.cliente);
  const st = STATUSES.find((s) => s.key === o.status);
  const idx = statusIdx(o.status);
  const steps = computeSteps(o);
  const done = o.prodDone || [];
  const donePct = stepProgress(o);
  const timerSec = elapsed(o, now);
  const running = !!(o.timer && o.timer.start);
  const [arte, setArte] = React.useState('');

  const toggle = (i) => {
    const d = [...done]; d[i] = !d[i];
    saveOrder(o.id, { prodDone: d });
    if (d.filter(Boolean).length === steps.length) toast(`Etapas concluídas — pedido pronto! 🎉`, 'ok');
    log(`${o.id}: marcou etapa "${steps[i]}"`);
  };
  const advance = (delta) => {
    const to = Math.max(0, Math.min(STATUSES.length - 1, idx + delta));
    if (to !== idx) { saveOrder(o.id, { status: STATUSES[to].key }); }
  };

  return (
    <Drawer title={o.id} subtitle={`${st ? st.label : ''} · aberto em ${fmtDate(o.abertura)}`} onClose={onClose} wide
      footer={
        <>
          <Btn variant="ghost" className="danger" onClick={() => { delOrder(o.id); onClose(); }}><Icon name="x" size={14} /> Excluir</Btn>
          {idx > 0 ? <Btn variant="ghost" onClick={() => advance(-1)}><Icon name="left" /> Etapa anterior</Btn> : null}
          <a className="btn primary" href={client ? waLink(client.tel, waOrderMsg(o)) : '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><Icon name="wa" size={15} /> Responder no WhatsApp</a>
          {idx < STATUSES.length - 1 ? <Btn variant="coral" onClick={() => advance(1)}><Icon name="right" /> Avançar etapa</Btn> : null}
        </>
      }>
      <div className="kv">
        <div><div className="k">Cliente</div><div className="v sm" style={{ cursor: 'pointer' }} onClick={() => { go('clientes'); onClose(); }}>{client?.nome || '—'}</div></div>
        <div><div className="k">Total</div><div className="v">{currency(o.total)}</div></div>
        <div><div className="k">Sinal / Pago</div><div className="v sm">{o.sinal ? currency(o.sinal) : '—'}</div></div>
        <div><div className="k">Prazo</div><div className="v sm">{fmtDateFull(o.prazo)}</div></div>
        <div><div className="k">Origem</div><div className="v sm">{o.orig}</div></div>
        <div><div className="k">Responsável</div><div className="v sm">{o.responsavel}</div></div>
      </div>

      <div className="flex gap12 mt16 wrap">
        <Badge tone={st.tone}>{st.label}</Badge>
        <Badge tone={o.prioridade === 'alta' ? 'danger' : 'nude'}>{o.prioridade === 'alta' ? '🔥 Prioridade alta' : 'Prioridade normal'}</Badge>
        {client ? <a className="btn-wa" href={waLink(client.tel, `Olá ${client.nome.split(' ')[0]}! 💌`)} target="_blank" rel="noreferrer"><Icon name="wa" size={13} /> WhatsApp</a> : null}
      </div>

      <div className="mt16">
        <SectionHead title="Itens" sub={`${o.items.length} produto(s)`} />
        {o.items.map((it, k) => {
          const p = state.products.find((x) => x.id === it.p);
          return (
            <div key={k} className="list-row mb8">
              <span style={{ fontSize: 20 }}>{p?.foto || '📦'}</span>
              <div className="grow"><b>{p?.nome || it.p}</b><div className="muted tiny">{it.qtd} un · tempo médio {p?.tempo || '—'} dias</div></div>
              <b>{currency(it.valor)}</b>
            </div>
          );
        })}
      </div>

      {o.arte?.length > 0 || true ? (
        <div className="mt16">
          <SectionHead title="Arte & arquivos" sub="arquivos anexados">
            <Badge tone="nude">{o.arte?.length || 0}</Badge>
          </SectionHead>
          <div className="grid cols-2 mb12">
            {o.arte?.map((a, k) => (
              <div key={k} className="list-row">
                <div className="art-tile" style={{ width: 54, aspectRatio: '1', borderRadius: 10 }}><Icon name="file" size={20} /></div>
                <div><b className="small">{a.nome}</b><div className="muted tiny">PNG · 300dpi</div></div>
              </div>
            ))}
            {(o.arte || []).length === 0 ? <Empty emoji="🎨" title="Sem arte anexada" sub="Anexe o arquivo de arte do pedido." /> : null}
          </div>
          <div className="flex gap8">
            <Input placeholder="Nome da arte (ex.: arte-final-bianca.png)" value={arte} onChange={(e) => setArte(e.target.value)} />
            <Btn onClick={() => { if (arte) { saveOrder(o.id, { arte: [...(o.arte || []), { nome: arte }] }); setArte(''); toast('Arte anexada'); } }}><Icon name="plus" size={14} /></Btn>
          </div>
        </div>
      ) : null}

      <div className="mt16">
        <SectionHead title="Produção" sub={`${donePct}% concluído`}>
          <Progress value={donePct} tone="coral" style={{ width: 120 }} />
        </SectionHead>
        {steps.map((s, k) => (
          <label key={k} className="list-row mb8" style={{ cursor: 'pointer', opacity: done[k] ? .75 : 1 }}>
            <input type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} style={{ accentColor: 'var(--coral)', width: 17, height: 17 }} />
            <span className="grow" style={{ fontWeight: done[k] ? 600 : 700 }}>{s}</span>
            {done[k] ? <span className="badge ok">concluída</span> : <span className="badge nude">pendente</span>}
          </label>
        ))}
      </div>

      <div className="mt16 card" style={{ background: 'var(--bg-soft)' }}>
        <div className="flex gap12 wrap">
          <div>
            <div className="kpi-label">Tempo de produção</div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtTimer(timerSec)}</div>
          </div>
          <span className="grow" style={{ minWidth: 60 }} />
          <Btn variant="soft" onClick={() => saveOrder(o.id, { timer: running ? { acc: timerSec, start: null } : { acc: o.timer?.acc || 0, start: Date.now() } })}>
            <Icon name={running ? 'pause' : 'play'} size={14} /> {running ? 'Pausar' : 'Iniciar'}
          </Btn>
          <Btn variant="ghost" onClick={() => saveOrder(o.id, { timer: { acc: 0, start: null } })}><Icon name="trash" size={14} /> Zerar</Btn>
        </div>
      </div>

      {o.notas ? (
        <div className="mt16 card" style={{ background: 'var(--gold-soft)' }}>
          <b className="small">📝 Observações</b>
          <p className="small" style={{ margin: '6px 0 0' }}>{o.notas}</p>
        </div>
      ) : null}
      <div className="mt16">
        <SectionHead title="Timeline do pedido" />
        <div className="timeline">
          {state.activity.filter((a) => a.msg && a.msg.includes(o.id)).slice(0, 6).map((a, k) => (
            <div key={k} className={`tl-item ${k % 2 ? 'gold' : ''}`}>
              <div className="tt">{a.msg}</div>
              <div className="tsub">{new Date(a.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · {a.user}</div>
            </div>
          ))}
          {state.activity.filter((a) => a.msg && a.msg.includes(o.id)).length === 0 ? <div className="muted small">Sem registros ainda.</div> : null}
        </div>
      </div>
    </Drawer>
  );
};

/* ---------- main view ---------- */
const PedidosView = () => {
  const { state, newOrderOpen, setNewOrderOpen, delOrder } = useLC();
  const [openId, setOpenId] = React.useState(null);
  const [view, setView] = React.useState('kanban');

  React.useEffect(() => {
    const h = (e) => setOpenId(e.detail.id);
    window.addEventListener('lc:openorder', h);
    return () => window.removeEventListener('lc:openorder', h);
  }, []);

  const open = state.orders.find((o) => o.id === openId);
  const emProducao = state.orders.filter((o) => ['producao', 'impressao', 'corte', 'encadernacao', 'acabamento'].includes(o.status)).length;
  const atrasados = state.orders.filter((o) => o.status !== 'entregue' && o.prazo && o.prazo < TODAY).length;
  const prontos = state.orders.filter((o) => o.status === 'pronto').length;
  const finalizados = state.orders.filter((o) => o.status === 'entregue').sort((a, b) => ((b.finalizadoEm || b.prazo) > (a.finalizadoEm || a.prazo) ? 1 : -1));

  return (
    <div>
      <div className="flex gap10 wrap mb12 no-print" style={{ justifyContent: 'flex-end' }}>
        <span className="stat-pill"><Icon name="producao" /> Em produção: <b>{emProducao}</b></span>
        <span className="stat-pill"><Icon name="alert" style={{ color: 'var(--danger)' }} /> Atrasados: <b style={{ color: 'var(--danger)' }}>{atrasados}</b></span>
        <span className="stat-pill"><Icon name="truck" /> Prontos: <b>{prontos}</b></span>
        <span className="stat-pill" style={{ cursor: 'pointer' }} title="Abrir Serviço Finalizado" onClick={() => setView('finalizados')}><Icon name="check" /> Finalizados: <b style={{ color: 'var(--ok)' }}>{finalizados.length}</b></span>
        <Btn variant="primary" onClick={() => setNewOrderOpen(true)}><Icon name="plus" /> Novo Pedido</Btn>
      </div>

      <div className="tabs no-print mb12">
        <button className={`tab ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>Kanban</button>
        <button className={`tab ${view === 'finalizados' ? 'active' : ''}`} onClick={() => setView('finalizados')}>Serviço Finalizado ({finalizados.length})</button>
      </div>

      {view === 'kanban' ? (
        <>
          <div className="alert-banner mb12 no-print" style={{ display: atrasados ? undefined : 'none' }}>
            <Icon name="alert" /> <b>{atrasados} pedido(s) atrasado(s)</b> — arraste para a frente da fila ou recombine o prazo com a cliente.
          </div>
          <Kanban />
        </>
      ) : (
        <div className="card">
          <SectionHead title="Serviço Finalizado" sub="pedidos entregues — arquivo de serviços concluídos" />
          {finalizados.length ? finalizados.map((o) => {
            const cl = clientById(o.cliente);
            return (
              <div key={o.id} className="list-row mb8" style={{ cursor: 'pointer' }} onClick={() => document.dispatchEvent(new CustomEvent('lc:openorder', { detail: { id: o.id } }))}>
                <b style={{ fontFamily: 'var(--font-display)', color: 'var(--teal-dark)' }}>{o.id}</b>
                <div className="grow">
                  <b>{clientName(o.cliente)}</b>
                  <div className="muted tiny">{prodName(o.items[0].p)}{o.items.length > 1 ? ` +${o.items.length - 1} itens` : ''}</div>
                </div>
                <span className="muted small">✓ {fmtDate(o.finalizadoEm || o.prazo)}</span>
                <b>{currency(o.total)}</b>
                {cl ? <a className="btn-wa" href={waLink(cl.tel, `Olá ${cl.nome.split(' ')[0]}! Relembrando que seu ${o.id} foi entregue 💕`)} target="_blank" rel="noreferrer"><Icon name="wa" size={12} /></a> : null}
                <button type="button" title="Excluir" className="card-x" onClick={(e) => { e.stopPropagation(); delOrder(o.id); }}><Icon name="x" size={13} /></button>
              </div>
            );
          }) : <Empty emoji="✅" title="Nenhum serviço finalizado ainda" sub="Ao marcar como entregue, o pedido aparece aqui e vai para o Financeiro." />}
        </div>
      )}

      {newOrderOpen ? <NewOrderModal onClose={() => setNewOrderOpen(false)} /> : null}
      {open ? <OrderDrawer o={open} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
};