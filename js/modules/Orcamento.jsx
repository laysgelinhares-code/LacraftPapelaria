// ============================================================
// LA CRAFT OS — Orçamento Inteligente
// ============================================================

const ORC_OPTIONS = [
  { k: 'verso', label: 'Verso impresso', plus: 12, hint: 'por unidade' },
  { k: 'wire', label: 'Wire-o', plus: 15, hint: 'encadernação' },
  { k: 'espiral', label: 'Espiral', plus: 8, hint: 'encadernação' },
  { k: 'lamina', label: 'Laminação', plus: 5, hint: 'proteção' },
  { k: 'canto', label: 'Cantoneira', plus: 6, hint: 'pastor' },
  { k: 'bolso', label: 'Bolso interno', plus: 3, hint: 'acabamento' },
  { k: 'elastico', label: 'Elástico', plus: 2, hint: 'fechamento' },
  { k: 'envelope', label: 'Envelope', plus: 2, hint: 'embalagem' },
];

const OrcamentoView = () => {
  const { state, set, go, log, toast } = useLC();
  const [pid, setPid] = React.useState('P01');
  const [qtd, setQtd] = React.useState(1);
  const [opts, setOpts] = React.useState({});
  const [margem, setMargem] = React.useState(40);
  const [cid, setCid] = React.useState('');
  const [notas, setNotas] = React.useState('');

  const prod = state.products.find((p) => p.id === pid) || state.products[0];
  const base = prod ? prod.valor : 0;
  const optSum = ORC_OPTIONS.reduce((s, o) => s + (opts[o.k] ? o.plus : 0), 0);
  const unit = base + optSum;
  const desconto = qtd >= 10 ? 0.1 : qtd >= 5 ? 0.05 : 0;
  const subTotal = unit * qtd * (1 - desconto);
  const custoEst = subTotal * 0.45;
  const precoFinal = margem >= 1 ? subTotal / (1 - margem / 100) : subTotal;
  const lucro = precoFinal - custoEst;

  const texto = [
    `*ORÇAMENTO LA CRAFT* 💌`,
    `Produto: ${prod ? prod.nome : ''} (${qtd} un)`,
    ...ORC_OPTIONS.filter((o) => opts[o.k]).map((o) => `• ${o.label} +${currency(o.plus)}`),
    desconto ? `Desconto por quantidade: ${Math.round(desconto * 100)}%` : null,
    `Valor final: *${currency(precoFinal)}*`,
    `Prazo médio: ${prod ? prod.tempo : '—'} dias`,
    notas ? `Obs: ${notas}` : null,
  ].filter(Boolean).join('\n');

  const salvarPedido = () => {
    const clientId = cid;
    const id = nextOrderId(state.orders);
    set('orders', (a) => [{
      id, cliente: clientId, items: [{ p: prod.id, qtd, valor: Math.round(precoFinal * 100) / 100 }],
      total: Math.round(precoFinal * 100) / 100, status: 'orcamento', prioridade: 'normal',
      prazo: iso(5, 9), abertura: TODAY, sinal: 0, metodo: 'Pix', responsavel: 'Lays', orig: 'WhatsApp',
      arte: [], notas: `Orçamento inteligente · margem ${margem}%`, timer: { acc: 0, start: null },
    }, ...a]);
    log(`Orçamento ${id} gerado (${prod.nome})`);
    toast(`${id} salvo como orçamento ✨`);
    if (clientId) window.open(waLink(clientById(clientId)?.tel, texto), '_blank');
    go('pedidos');
  };

  return (
    <div>
      <div className="flex gap10 wrap mb12">
        <span className="stat-pill"><Icon name="orcamento" /> Precificação automática em segundos</span>
        <span className="stat-pill"><Icon name="wa" /> Envio direto no WhatsApp</span>
        <span className="grow" />
        <Btn onClick={() => go('pedidos')}><Icon name="orders" /> Ver pedidos</Btn>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <SectionHead title="1 · Configure o pedido" sub="preencha as opções da cliente" />
          <Field label="Produto">
            <Select value={pid} onChange={(e) => setPid(e.target.value)}>
              {state.products.map((p) => <option key={p.id} value={p.id}>{EMOJI_BY_CAT[p.categoria]} {p.nome} — {currency(p.valor)}</option>)}
            </Select>
          </Field>
          <Field label="Quantidade">
            <div className="flex gap8">
              <Input type="number" min={1} value={qtd} style={{ width: 120 }} onChange={(e) => setQtd(Math.max(1, parseInt(e.target.value) || 1))} />
              <span className="badge warn" style={{ alignSelf: 'center' }}>{qtd >= 10 ? '10% off' : qtd >= 5 ? '5% off' : '—'}</span>
            </div>
          </Field>
          <Field label="Acabamentos & recursos">
            <div className="flex gap6 wrap">
              {ORC_OPTIONS.map((o) => (
                <Chip key={o.k} active={opts[o.k]} onClick={() => setOpts({ ...opts, [o.k]: !opts[o.k] })} title={o.hint}>
                  {opts[o.k] ? '✓ ' : '+ '}{o.label} <b style={{ opacity: .8 }}>({currency(o.plus)})</b>
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Margem de lucro" hint={`definida em ${margem}%`}>
            <input type="range" min={20} max={80} value={margem} onChange={(e) => setMargem(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--coral)' }} />
          </Field>
          <Field label="Cliente (opcional) para envio">
            <Select value={cid} onChange={(e) => setCid(e.target.value)}>
              <option value="">— apenas gerar orçamento —</option>
              {state.clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </Field>
          <Field label="Observações">
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Prazos, brinde, detalhe..." />
          </Field>
        </div>

        <div>
          <div className="card">
            <SectionHead title="2 · Valor calculado" sub="quebra detalhada" />
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="flex"><span className="muted small">Produto base ({qtd} un)</span><span className="grow" /><b>{currency(unit * qtd)}</b></div>
              <div className="flex"><span className="muted small">Custo estimado (45%)</span><span className="grow" /><b>{currency(custoEst)}</b></div>
              <div className="flex"><span className="muted small">Desconto qtde</span><span className="grow" /><Badge tone={desconto ? 'ok' : 'nude'}>{desconto ? `${Math.round(desconto * 100)}% (−${currency(subTotal * (desconto / (1 - desconto)))})` : '—'}</Badge></div>
              <div className="flex" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}><b className="small">Subtotal</b><span className="grow" /><b>{currency(subTotal)}</b></div>
              <div className="flex"><span className="muted small">Margem aplicada</span><span className="grow" /><Badge tone="gold">{margem}%</Badge></div>
              <div className="flex" style={{ alignItems: 'flex-end' }}>
                <div><div className="kpi-label">Valor final sugerido</div><div className="font-display" style={{ fontSize: 34, fontWeight: 700, color: 'var(--teal-dark)' }}>{currency(precoFinal)}</div></div>
                <span className="grow" />
                <div style={{ textAlign: 'right' }}>
                  <div className="kpi-label">Lucro estimado</div>
                  <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ok)' }}>+ {currency(lucro)}</div>
                </div>
              </div>
            </div>
            <div className="mt16 flex gap8 wrap">
              <a className="btn coral" style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer"
                href={cid ? waLink(clientById(cid)?.tel, texto) : `https://wa.me/?text=${encodeURIComponent(texto)}`}>
                <Icon name="wa" /> Enviar no WhatsApp
              </a>
              <Btn onClick={() => navigator.clipboard.writeText(texto).then(() => toast('Texto copiado'))}><Icon name="copy" /> Copiar texto</Btn>
              <Btn variant="primary" onClick={salvarPedido}><Icon name="plus" /> Salvar como pedido</Btn>
            </div>
          </div>

          <div className="card mt16">
            <SectionHead title="Referência rápida" sub="preços base do catálogo">
              <Btn sm onClick={() => go('catalogo')}>ver catálogo</Btn>
            </SectionHead>
            <div style={{ display: 'grid', gap: 8 }}>
              {state.products.slice(0, 6).map((p) => (
                <div key={p.id} className="flex gap8" style={{ fontSize: 12.5 }}>
                  <b className="grow">{p.foto} {p.nome}</b>
                  <span className="badge teal">{currency(p.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};