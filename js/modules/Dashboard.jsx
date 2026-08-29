// ============================================================
// LA CRAFT OS — Dashboard
// ============================================================

const Kpi = ({ icon, tone, label, value, sub }) => {
  const toneVar = {
    teal: ['var(--teal-soft)', 'var(--teal-dark)'], coral: ['var(--coral-soft)', 'var(--coral)'],
    gold: ['var(--gold-soft)', 'var(--gold)'], ok: ['var(--ok-soft)', 'var(--ok)'],
    warn: ['var(--warn-soft)', 'var(--warn)'], danger: ['var(--danger-soft)', 'var(--danger)'],
    info: ['var(--info-soft)', 'var(--info)'], nude: ['var(--bg-deep)', 'var(--muted)'],
  }[tone] || ['var(--teal-soft)', 'var(--teal-dark)'];
  return (
    <div className="kpi">
      <div className="kpi-ico" style={{ background: toneVar[0], color: toneVar[1] }}><Icon name={icon} /></div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
};

const DashboardProductStats = () => {
  const { state } = useLC();
  const agg = {};
  state.orders.forEach((o) => o.items.forEach((i) => { if (o.status !== 'orcamento') agg[i.p] = (agg[i.p] || 0) + i.qtd; }));
  const top = Object.entries(agg).map(([p, qtd]) => ({ p, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  const items = top.map((t) => ({ label: `${EMOJI_BY_CAT[(state.products.find((x) => x.id === t.p) || {}).categoria] || '📦'} ${(state.products.find((x) => x.id === t.p) || {}).nome || t.p}`, valor: t.qtd, cor: 'var(--teal)' }));
  return items.length ? <HBar items={items} /> : <Empty emoji="🛍️" title="Ainda sem vendas" sub="Os produtos mais vendidos aparecem aqui." />;
};

const DashboardView = () => {
  const { state, go, setNewOrderOpen, now } = useLC();
  const d = new Date(TODAY + 'T12:00:00');
  const mth = now.getMonth() + 1;
  const mkey = mth < 10 ? '0' + mth : String(mth);
  const curM = `2026-${mkey}`;

  const entradas = state.tx.filter((t) => t.tipo === 'entrada' && t.status === 'pago' && t.data.slice(0, 7) === curM);
  const saidas = state.tx.filter((t) => t.tipo === 'saida' && t.status === 'pago' && t.data.slice(0, 7) === curM);
  const vendidoMes = entradas.reduce((s, t) => s + t.valor, 0);
  const gastoMes = saidas.reduce((s, t) => s + t.valor, 0);
  const vendidoHoje = entradas.filter((t) => t.data === TODAY).reduce((s, t) => s + t.valor, 0);
  const lucro = vendidoMes - gastoMes;

  const isInProd = (o) => ['pago', 'producao', 'impressao', 'corte', 'encadernacao', 'acabamento'].includes(o.status);
  const emProducao = state.orders.filter(isInProd).length;
  const aguardando = state.orders.filter((o) => o.status === 'aguardando').length;
  const atrasados = state.orders.filter((o) => o.status !== 'entregue' && o.prazo && o.prazo < TODAY).length;
  const prontos = state.orders.filter((o) => o.status === 'pronto').length;
  const entregues = state.orders.filter((o) => o.status === 'entregue').length;

  const metaPct = Math.min(100, Math.round((vendidoMes / state.metas.mensal) * 100));

  const clientSpend = {};
  state.orders.filter((o) => o.status !== 'orcamento').forEach((o) => {
    clientSpend[o.cliente] = (clientSpend[o.cliente] || 0) + o.total;
  });
  const topClients = Object.entries(clientSpend).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, total]) => ({
    label: clientName(id), valor: total, cor: 'var(--gold)',
  }));

  const months = state.meses.slice(-6).map((m) => ({
    label: monthName(m.m.slice(5, 7)).slice(0, 3),
    valor: m.m === curM ? Math.round(vendidoMes) : m.valor,
  }));

  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      <div className="dash-head">
        <h1 className="font-display dash-title">{greeting}, Lays ✨</h1>
        <div className="dash-sub">Resumo de hoje — aqui vive o coração da La Craft. Tudo conectado.</div>
        <Btn variant="primary" className="btn-orc" onClick={() => go('orcamento')}><Icon name="orcamento" /> Orçamento Inteligente</Btn>
      </div>

      <div className="alert-banner banner-meta mb16">
        <Icon name="spark" />
        <b>Meta da semana: {currency(state.metas.semanal)}</b>
        <span className="grow" />
        <span>★ Central da La Craft atualizada</span>
      </div>

      <div className="grid cols-4 dash-grid mb16">
        <Kpi icon="$" tone="ok" label="Vendido hoje" value={currency(vendidoHoje)} sub={<><span className="trend-up">▲ {currency(entradas.filter(t => t.data === TODAY).length)} vendas</span> hoje</>} />
        <Kpi icon="up" tone="teal" label="Vendido no mês" value={currency(vendidoMes)} sub={<>{entradas.length} vendas em {monthName(mth)}</>} />
        <Kpi icon="heart" tone="coral" label="Lucro estimado" value={currency(lucro)} sub={<span>margem {verdge(lucro, vendidoMes)}%</span>} />
        <Kpi icon="spark" tone="gold" label="Meta mensal" value={`${metaPct}%`} sub={<div className="progress gold" style={{ width: 120 }}><span style={{ width: `${metaPct}%` }} /></div>} />
        <Kpi icon="producao" tone="teal" label="Em produção" value={emProducao} sub={<span>pedidos na bancada</span>} />
        <Kpi icon="card" tone="warn" label="Aguard. pagamento" value={aguardando} sub={<span>enviar lembrete</span>} />
        <Kpi icon="alert" tone="danger" label="Atrasados" value={atrasados} sub={<span>priorize na fila</span>} />
        <Kpi icon={prontos > 0 ? 'truck' : 'check'} tone={prontos > 0 ? 'info' : 'ok'} label="Prontos p/ entrega" value={prontos} sub={<span>+{entregues} entregues</span>} />
      </div>

      <div className="grid cols-2 mt16">
        <div className="card">
          <SectionHead title="Faturamento por mês" sub="últimos 6 meses">
            <Badge tone="teal">{currency(vendidoMes)}</Badge>
          </SectionHead>
          <VBars data={months} fmt={(x) => (x >= 1000 ? `${Math.round(x / 100) / 10}k` : x)} />
        </div>
        <div className="card">
          <SectionHead title="Origem das vendas" sub="agosto">
            <Badge tone="nude">{currency(vendidoMes)}</Badge>
          </SectionHead>
          <div className="flex gap16" style={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
            <Donut data={state.origem} label="38%" />
            <div style={{ display: 'grid', gap: 9, flex: 1 }}>
              {state.origem.map((o) => (
                <div key={o.label} className="flex gap8 small" style={{ fontWeight: 700 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: o.cor, display: 'inline-block' }} />
                  <span>{o.label}</span><span className="grow" /><span>{o.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid cols-2 mt16">
        <div className="card">
          <SectionHead title="Produtos mais vendidos" sub="por quantidade">
            <Btn sm className="mr4" onClick={() => go('relatorios')}>Ver relatório <Icon name="chevR" size={13} /></Btn>
          </SectionHead>
          <DashboardProductStats />
        </div>
        <div className="card">
          <SectionHead title="Clientes que mais compram" sub="por valor gasto">
            <Btn sm onClick={() => go('clientes')}>Ver clientes <Icon name="chevR" size={13} /></Btn>
          </SectionHead>
          <HBar items={topClients} fmt={currency} />
        </div>
      </div>

      <div className="grid cols-4 dash-grid mt16">
        {[
          { ic: 'plus', tone: 'teal', t: 'Novo Pedido', s: 'criar na hora', f: () => { setNewOrderOpen(true); go('pedidos'); } },
          { ic: 'catalog', tone: 'coral', t: 'Ver Catálogo', s: 'produtos e preços', f: () => go('catalogo') },
          { ic: 'producao', tone: 'gold', t: 'Kanban de Produção', s: `${emProducao} em bancada`, f: () => go('pedidos') },
          { ic: 'financeiro', tone: 'info', t: 'Lançar no Financeiro', s: 'receita / despesa', f: () => go('financeiro') },
        ].map((c, i) => (
          <div key={i} className="card hov" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={c.f}>
            <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: `var(--${c.tone}-soft)`, color: `var(--${c.tone})` }}><Icon name={c.ic} /></div>
            <div><b style={{ fontSize: 13.5 }}>{c.t}</b><div className="muted tiny">{c.s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};
const verdge = (lucro, rev) => (rev > 0 ? Math.round((lucro / rev) * 100) : 0);
const Dashboard = DashboardView;