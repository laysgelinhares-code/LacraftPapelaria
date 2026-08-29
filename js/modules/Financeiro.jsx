// ============================================================
// LA CRAFT OS — Financeiro
// ============================================================

const CAT_SAIDA = ['Material', 'Tinta', 'Energia', 'Taxas', 'Embalagens', 'Marketing', 'Equipamentos', 'Transporte', 'Outros'];
const CAT_ENTRADA = ['Cliente', 'Instagram', 'WhatsApp', 'Shopee', 'Mercado Pago', 'Loja Física', 'Feira', 'Evento', 'Outros'];

const TxForm = ({ onClose }) => {
  const { set, log, toast } = useLC();
  const [f, setF] = React.useState({ tipo: 'entrada', cat: 'Cliente', meta: 'Pix', valor: '', data: TODAY, desc: '', status: 'pago' });
  const save = () => {
    if (!f.valor) { toast('Informe o valor', 'warn'); return; }
    set('tx', (t) => [{ id: uid('TX'), ...f, valor: n(f.valor) }, ...t]);
    log(`Lançamento (${f.tipo}): ${f.desc || f.cat} ${currency(f.valor)}`);
    toast('Lançamento registrado ✓');
    onClose();
  };
  return (
    <Modal title="Novo lançamento" onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Icon name="check" /> Lançar</Btn></>}>
      <div className="flex gap8 mb12">
        <Chip active={f.tipo === 'entrada'} onClick={() => setF({ ...f, tipo: 'entrada', cat: 'Cliente' })}>⬆ Entrada</Chip>
        <Chip active={f.tipo === 'saida'} onClick={() => setF({ ...f, tipo: 'saida', cat: 'Material' })}>⬇ Saída</Chip>
      </div>
      <div className="grid cols-2">
        <Field label="Categoria">
          <Select value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>
            {(f.tipo === 'entrada' ? CAT_ENTRADA : CAT_SAIDA).map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Valor (R$)"><Input value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></Field>
        <Field label="Data"><Input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></Field>
        <Field label="Método">
          <Select value={f.meta} onChange={(e) => setF({ ...f, meta: e.target.value })}>
            <option>Pix</option><option>Cartão</option><option>Dinheiro</option><option>Boleto</option><option>Shopee</option><option>Dedução (taxa)</option>
          </Select>
        </Field>
      </div>
      <Field label="Status">
        <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="pago">Pago / Recebido</option><option value="pendente">Pendente</option>
        </Select>
      </Field>
      <Field label="Descrição"><Input value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></Field>
    </Modal>
  );
};

const FinanceiroView = () => {
  const { state, saveOrder, log, toast } = useLC();
  const [tab, setTab] = React.useState('fluxo');
  const [form, setForm] = React.useState(false);
  const mkey = TODAY.slice(0, 7);

  const ent = state.tx.filter((t) => t.tipo === 'entrada' && t.data.slice(0, 7) === mkey && t.status === 'pago');
  const sai = state.tx.filter((t) => t.tipo === 'saida' && t.data.slice(0, 7) === mkey && t.status === 'pago');
  const entTotal = ent.reduce((s, t) => s + t.valor, 0);
  const saiTotal = sai.reduce((s, t) => s + t.valor, 0);
  const lucro = entTotal - saiTotal;
  const hojeEnt = ent.filter((t) => t.data === TODAY).reduce((s, t) => s + t.valor, 0);
  const hojeSai = sai.filter((t) => t.data === TODAY).reduce((s, t) => s + t.valor, 0);

  const pagar = state.tx.filter((t) => t.status === 'pendente' && t.tipo === 'saida');
  const aReceberPedidos = state.orders.filter((o) => ['aguardando'].includes(o.status));
  const recDates = [...state.tx.filter((t) => t.status === 'pendente' && t.tipo === 'entrada')];

  const graficoMeses = (() => {
    const map = {};
    state.tx.forEach((t) => { map[t.data.slice(0, 7)] = map[t.data.slice(0, 7)] || { ent: 0, sai: 0 }; if (t.status === 'pago') map[t.data.slice(0, 7)][t.tipo === 'entrada' ? 'ent' : 'sai'] += t.valor; });
    return Object.keys(map).sort().slice(-6).map((m) => ({ label: monthName(m.slice(5, 7)).slice(0, 3), valor: Math.round(map[m].ent - map[m].sai) }));
  })();
  const maxG = Math.max(...graficoMeses.map((m) => Math.abs(m.valor)), 1);

  const markPaid = (id) => set('tx', (a) => a.map((t) => (t.id === id ? { ...t, status: 'pago', data: TODAY } : t)));
  const markOrderPaid = (id) => saveOrder(id, { status: 'pago' });

  const rows = [...state.tx].sort((a, b) => (b.data > a.data ? 1 : -1));

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <span className="stat-pill"><Icon name="wallet" /> Fluxo de caixa</span>
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm(true)}><Icon name="plus" /> Novo lançamento</Btn>
      </div>

      <div className="grid cols-4 mb16">
        <div className="card"><div className="kpi-label">Entradas do mês</div><div className="kpi-value" style={{ color: 'var(--ok)' }}>{currency(entTotal)}</div></div>
        <div className="card"><div className="kpi-label">Saídas do mês</div><div className="kpi-value" style={{ color: 'var(--coral)' }}>{currency(saiTotal)}</div></div>
        <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--teal) 35%, var(--border))' }}>
          <div className="kpi-label">Lucro líquido</div>
          <div className="kpi-value" style={{ color: lucro >= 0 ? 'var(--teal-dark)' : 'var(--coral)' }}>{currency(lucro)}</div>
        </div>
        <div className="card"><div className="kpi-label">Hoje</div><div className="kpi-value" style={{ fontSize: 20 }}>{currency(hojeEnt - hojeSai)}</div><div className="kpi-sub">{currency(hojeEnt)} entr · {currency(hojeSai)} sai</div></div>
      </div>

      <div className="card mb16">
        <SectionHead title="Lucro líquido por mês" sub="entradas − saídas">
          <Badge tone={graficoMeses[graficoMeses.length - 1]?.valor >= 0 ? 'ok' : 'danger'}>{graficoMeses[graficoMeses.length - 1]?.valor >= 0 ? '▲' : '▼'} {currency(graficoMeses[graficoMeses.length - 1]?.valor || 0)}</Badge>
        </SectionHead>
        <div className="flex" style={{ height: 120, alignItems: 'flex-end', gap: 10 }}>
          {graficoMeses.map((m, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: 40, borderRadius: 7, height: `${Math.max(4, (Math.abs(m.valor) / maxG) * 100)}%`, background: m.valor >= 0 ? 'linear-gradient(180deg, var(--teal), var(--teal-dark))' : 'linear-gradient(180deg, var(--coral), var(--peach))' }} />
              <div className="tiny muted" style={{ fontWeight: 700 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs no-print">
        <button className={`tab ${tab === 'fluxo' ? 'active' : ''}`} onClick={() => setTab('fluxo')}>Fluxo completo</button>
        <button className={`tab ${tab === 'pagar' ? 'active' : ''}`} onClick={() => setTab('pagar')}>A pagar ({pagar.length})</button>
        <button className={`tab ${tab === 'receber' ? 'active' : ''}`} onClick={() => setTab('receber')}>A receber ({aReceberPedidos.length})</button>
      </div>

      {tab === 'fluxo' ? (
        <div className="table-wrap">
          <table className="lc">
            <thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Método</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{fmtDate(t.data)}</td>
                  <td>{t.tipo === 'entrada' ? <Badge tone="ok">⬆ entrada</Badge> : <Badge tone="coral">⬇ saída</Badge>}</td>
                  <td>{t.cat}</td>
                  <td className="small muted">{t.desc}</td>
                  <td className="muted small">{t.meta}</td>
                  <td style={{ fontWeight: 800, color: t.tipo === 'entrada' ? 'var(--ok)' : 'var(--coral)' }}>{t.tipo === 'entrada' ? '+' : '−'}{currency(t.valor)}</td>
                  <td><Badge tone={t.status === 'pago' ? 'ok' : 'warn'}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'pagar' ? (
        <div>
          <Empty emoji="🧾" title={pagar.length ? 'Contas a pagar' : 'Nenhuma conta pendente'} sub={pagar.length ? '' : 'Tudo quitado.'} />
          {pagar.map((t) => (
            <div key={t.id} className="list-row mb8">
              <span className="badge warn">Boleto</span>
              <div className="grow"><b>{t.desc}</b><div className="tiny muted">vence {fmtDateFull(t.data)} · {t.cat}</div></div>
              <b>{currency(t.valor)}</b>
              <Btn sm variant="ok" onClick={() => { markPaid(t.id); log(`Pago: ${t.desc}`); toast('Conta marcada como paga'); }}><Icon name="check" size={13} /> Quitar</Btn>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'receber' ? (
        <div>
          <div className="mb12"><SectionHead title="Pedidos aguardando pagamento" sub={`${aReceberPedidos.length} na fila`} />
          {aReceberPedidos.map((o) => (
            <div key={o.id} className="list-row mb8">
              <b style={{ fontFamily: 'var(--font-display)', color: 'var(--teal-dark)' }}>{o.id}</b>
              <span className="grow small">{clientName(o.cliente)}</span>
              <Badge tone="gold">sinal {o.sinal ? currency(o.sinal) : '—'}</Badge>
              <b>{currency(o.total)}</b>
              <Btn sm variant="primary" onClick={() => { markOrderPaid(o.id); toast(`${o.id} marcado como pago 💰`); }}><Icon name="check" size={13} /> Registrar pagamento</Btn>
            </div>
          ))}
          {!aReceberPedidos.length ? <Empty emoji="🎉" title="Nada a receber por agora" sub="Pedidos com pagamento pendente aparecem aqui." /> : null}
          </div>
          <SectionHead title="Taxas / repasses pendentes" />
          {recDates.length ? recDates.map((t) => (
            <div key={t.id} className="list-row mb8">
              <div className="grow"><b>{t.desc || t.cat}</b><div className="tiny muted">{t.cat}</div></div>
              <b>{currency(t.valor)}</b>
              <Btn sm onClick={() => { markPaid(t.id); toast('Recebido ✓'); }}><Icon name="check" size={13} /> Receber</Btn>
            </div>
          )) : <Empty emoji="💤" title="Sem repasses pendentes" />}
        </div>
      ) : null}

      {form ? <TxForm onClose={() => setForm(false)} /> : null}
    </div>
  );
};