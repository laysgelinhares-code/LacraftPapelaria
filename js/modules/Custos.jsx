// ============================================================
// LA CRAFT OS — Calculadora de Custos
// ============================================================

const CUST_FIELDS = [
  { k: 'papel', label: 'Papel', icon: '📄' },
  { k: 'tinta', label: 'Tinta', icon: '🖌️' },
  { k: 'lamina', label: 'Laminação', icon: '✨' },
  { k: 'energia', label: 'Energia', icon: '⚡' },
  { k: 'mao', label: 'Mão de obra', icon: '🤲' },
  { k: 'embalagem', label: 'Embalagem', icon: '📦' },
];

const CustosView = () => {
  const { state, set, log, toast } = useLC();
  const [custos, setCustos] = React.useState({ ...state.costs });
  const [custoItem, setCustoItem] = React.useState(12);
  const [margem, setMargem] = React.useState(45);
  const [qtd, setQtd] = React.useState(1);

  const total = custos.papel + custos.tinta + custos.lamina + custos.energia + custos.mao + custos.embalagem;
  const custoReal = total + custoItem;
  const preco = qtd > 1 ? (custoReal * qtd) / (1 - margem / 100) : custoReal / (1 - margem / 100);
  const lucroUn = preco - custoReal;

  const save = () => {
    set('costs', custos);
    log('Configuração de custos atualizada');
    toast('Configuração salva ✓');
  };

  const ps = state.precoParams || PRECO_PARAMS;
  const check = (state.preco || []).map((r) => {
    const c = calcCorpPreco(n(r.cv), n(r.tempoH), ps);
    const v = n(r.venda);
    const m = v > 0 ? margemPct(v, c.ct) : 0;
    const low = v > 0 && v < c.sugerido;
    return { r, c, v, m, low };
  }).sort((a, b) => b.c.sugerido - a.c.sugerido);

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <span className="stat-pill"><Icon name="custos" /> Custo real vs. preço final</span>
        <span className="stat-pill"><Icon name="spark" /> markup automático</span>
        <span className="grow" />
        <Btn variant="primary" onClick={save}><Icon name="check" /> Salvar configuração</Btn>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <SectionHead title="Configuração de custos (por unidade)" sub="valores usados na precificação" />
          <div className="grid cols-2">
            {CUST_FIELDS.map((f) => (
              <Field key={f.k} label={`${f.icon} ${f.label} (R$)`}>
                <Input type="number" value={custos[f.k]} onChange={(e) => setCustos({ ...custos, [f.k]: n(e.target.value) })} />
              </Field>
            ))}
            <Field label="🧮 Material extra / item"><Input type="number" value={custoItem} onChange={(e) => setCustoItem(n(e.target.value))} /></Field>
            <Field label="Margem de lucro (%)">
              <div className="flex gap8"><Input type="range" min={20} max={80} value={margem} onChange={(e) => setMargem(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--coral)' }} /><b style={{ width: 44 }}>{margem}%</b></div>
            </Field>
          </div>
          <Field label="Quantidade no lote" hint="o preço é o total do lote">
            <Input type="number" min={1} value={qtd} style={{ width: 120 }} onChange={(e) => setQtd(Math.max(1, parseInt(e.target.value) || 1))} />
          </Field>
        </div>

        <div>
          <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--teal) 40%, var(--border))' }}>
            <SectionHead title="Resultado" sub="preço sugerido de venda" />
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="flex"><span className="muted small">Custos fixos (papel + tinta + ...)</span><span className="grow" /><b>{currency(total)}</b></div>
              <div className="flex"><span className="muted small">Material extra / item</span><span className="grow" /><b>{currency(custoItem)}</b></div>
              <div className="flex" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}><b>Custo real</b><span className="grow" /><b>{currency(custoReal)}</b></div>
              <div className="flex"><span className="muted small">Margem aplicada</span><span className="grow" /><Badge tone="gold">{margem}% ({qtd} un no lote)</Badge></div>
              <div className="flex" style={{ alignItems: 'flex-end', borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
                <div>
                  <div className="kpi-label">Preço sugerido (lote)</div>
                  <div className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--teal-dark)' }}>{currency(preco)}</div>
                  <div className="muted tiny">por unidade: {currency(preco / qtd)}</div>
                </div>
                <span className="grow" />
                <div style={{ textAlign: 'right' }}>
                  <div className="kpi-label">Lucro (lote)</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ok)' }}>+ {currency(lucroUn * qtd)}</div>
                  <div className="tiny muted">markup {Math.round(10000 / (100 - margem)) / 100}x</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt16">
            <SectionHead title="Check-up da planilha" sub="mesmos preços e fórmula do Orçamento Inteligente">
              <Badge tone="info">{check.length} itens</Badge>
            </SectionHead>
            <div style={{ display: 'grid', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {check.map(({ r, c, v, m, low }) => (
                <div key={r.sku} className="flex gap8" style={{ fontSize: 12.5 }}>
                  <b className="grow">{r.nome || r.sku}</b>
                  {m > 0 ? <Badge tone={low ? 'danger' : m < 45 ? 'warn' : 'ok'}>{pct(m)}%</Badge> : <Badge tone="nude">sem preço</Badge>}
                  {low ? <span className="badge danger" title="vendendo abaixo do sugerido">⚠️</span> : null}
                  <span className="muted tiny">vendendo {currency(v) || '—'} · sugerido {currency(c.sugerido)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};