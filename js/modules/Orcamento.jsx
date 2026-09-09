// ============================================================
// LA CRAFT OS — Calculadora de Preços (motor da planilha)
// Custo Variavel + Custo Fixo/h + Lucro (markup) + Taxa plataforma
// ============================================================

const OrcamentoView = () => {
  const { state, set, log, toast } = useLC();
  const ps = state.precoParams || PRECO_PARAMS;

  const [pix, setPix] = React.useState(0);
  const [par, setPar] = React.useState({ ...ps });
  const [dirty, setDirty] = React.useState(false);
  const sel = state.preco[pix] || state.preco[0];

  const [f, setF] = React.useState(() => {
    const r = sel || {};
    return { nome: r.nome || '', cv: n(r.cv), tempoH: n(r.tempoH), venda: n(r.venda), mode: r.mode || 'cv', ficha: (r.ficha || []) };
  });

  const pick = (i) => {
    setPix(i);
    const r = state.preco[i] || {};
    setF({ nome: r.nome || '', cv: n(r.cv), tempoH: n(r.tempoH), venda: n(r.venda), mode: r.mode || 'cv', ficha: (r.ficha || []).map((x) => ({ ...x })) });
  };

  const cvFicha = f.ficha.reduce((s, r) => s + ((state.stock.find((x) => x.id === r.i) || {}).custo || 0) * n(r.q), 0);
  const cv = f.mode === 'ficha' ? round2(cvFicha) : n(f.cv);
  const calc = calcCorpPreco(cv, n(f.tempoH), par);
  const margem = margemPct(n(f.venda), calc.ct);
  const abaixo = n(f.venda) > 0 && n(f.venda) < calc.sugerido;
  const horaReal = round2(par.cfixo_mensal / Math.max(1, par.horas_mes));

  const saveProd = () => {
    if (!f.nome) { toast('Dê um nome ao produto', 'warn'); return; }
    const novoCV = f.mode === 'ficha' ? round2(cvFicha) : n(f.cv);
    set('preco', (a) => a.map((r) => (r.sku === (sel || {}).sku ? { ...r, nome: f.nome, cv: novoCV, tempoH: n(f.tempoH), venda: n(f.venda), mode: f.mode, ficha: f.ficha } : r)));
    set('products', (a) => a.map((p) => (p.sku === (sel || {}).sku ? { ...p, nome: f.nome, cv: novoCV, tempoH: n(f.tempoH), venda: n(f.venda), valor: n(f.venda) > 0 ? n(f.venda) : p.valor, mode: f.mode, ficha: f.ficha } : p)));
    log(`Preço atualizado: ${f.nome} (${currency(calc.sugerido)})`);
    toast('Preço salvo ✓');
  };

  const saveParams = () => {
    set('precoParams', { ...par });
    log('Parâmetros da calculadora atualizados');
    toast('Parâmetros salvos ✓');
    setDirty(false);
  };

  const addRow = () => {
    const len = (state.preco || []).length + 1;
    const sku = `#${yearNow}100${String(len).padStart(2, '0')}`;
    set('preco', (a) => [...a, { sku, nome: '', cv: 0, tempoH: 0.5, venda: 0 }]);
    set('products', (a) => [{ id: uid('P'), categoria: 'caderno', nome: 'Produto novo', desc: '', valor: 0, tempo: 2, foto: '📦', sku, cv: 0, tempoH: 0.5, venda: 0, mode: 'cv', ficha: [] }, ...a]);
    setPix(state.preco.length);
    setF({ nome: '', cv: 0, tempoH: 0.5, venda: 0, mode: 'cv', ficha: [] });
  };

  const delRow = () => {
    if (!sel) return;
    if (!window.confirm(`Remover ${sel.sku} · ${sel.nome || 'sem nome'}?`)) return;
    let idx = pix;
    set('preco', (a) => a.filter((r) => r.sku !== sel.sku));
    set('products', (a) => a.filter((p) => p.sku !== sel.sku));
    idx = Math.min(idx, state.preco.length - 2);
    if (idx < 0) idx = 0;
    pick(idx);
    toast('Produto removido da tabela');
  };

  const waTexto = [
    `*La Craft · Preço de ${f.nome || (sel ? sel.sku : '')}*`,
    `Custo variável: ${currency(cv)}`,
    `Custo total (${n(f.tempoH)}h): ${currency(calc.ct)}`,
    `Preço sugerido: *${currency(calc.sugerido)}*`,
    f.venda ? `Venda atual: ${currency(n(f.venda))} (margem ${margem}%)` : 'Venda atual: ainda sem preço definido',
  ].join('\n');

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <span className="stat-pill"><Icon name="orcamento" /> Calculadora de preços (planilha)</span>
        <span className="stat-pill"><Icon name="spark" /> custo variável + hora + lucro + taxas</span>
        <span className="grow" />
        <Btn onClick={addRow}><Icon name="plus" /> Novo produto</Btn>
        {sel ? <Btn onClick={delRow}><Icon name="trash" size={14} /> Remover</Btn> : null}
      </div>

      <div className="grid cols-2">
        {/* -------- LEFT: editor -------- */}
        <div>
          <div className="card">
            <SectionHead title="Parâmetros globais" sub="valores da planilha (P3:P5)">
              <Badge tone="info">{par.cvhora}/h</Badge>
            </SectionHead>
            <div className="grid cols-2">
              <Field label="Custo fixo por hora (R$)"><Input type="number" step="0.01" min={0} value={par.cvhora} onChange={(e) => { setPar({ ...par, cvhora: n(e.target.value) }); setDirty(true); }} /></Field>
              <Field label="Expectativa de lucro"><Input type="number" step="0.1" min={0} value={par.markup} onChange={(e) => { setPar({ ...par, markup: n(e.target.value) }); setDirty(true); }} /></Field>
              <Field label="Taxa da plataforma (%)" hint={`${n(par.tx_plataforma) * 100}%`}><Input type="number" step="0.001" min={0} value={par.tx_plataforma} onChange={(e) => { setPar({ ...par, tx_plataforma: n(e.target.value) }); setDirty(true); }} /></Field>
              <Field label="Taxa do cartão (%)" hint={`${n(par.tx_cartao) * 100}%`}><Input type="number" step="0.001" min={0} value={par.tx_cartao} onChange={(e) => { setPar({ ...par, tx_cartao: n(e.target.value) }); setDirty(true); }} /></Field>
            </div>
            <div className="alert-banner mt12" style={{ borderColor: 'var(--info)', background: 'var(--info-soft)', color: 'var(--info-dark)' }}>
              <Icon name="alert" />
              <span>Base real: custos fixos de {currency(par.cfixo_mensal)} por {par.horas_mes}h = <b>{currency(horaReal)}/h</b>. A planilha considera R$ 10/h.
                <a href="#" onClick={(e) => { e.preventDefault(); setPar({ ...par, cvhora: horaReal }); setDirty(true); }} style={{ color: 'inherit', fontWeight: 700 }}> Usar valor real →</a>
              </span>
            </div>
            <div className="mt12 flex gap8 wrap"><Btn sm onClick={saveParams} disabled={!dirty} variant={dirty ? 'primary' : ''}><Icon name="check" size={13} /> Salvar parâmetros</Btn>{dirty ? <span className="badge warn">alterações pendentes</span> : null}</div>
          </div>

          <div className="card mt16">
            <SectionHead title="1 · Produto" sub="selecione na tabela abaixo ou edite aqui">
              <span className="badge teal">{sel ? sel.sku : '—'}</span>
            </SectionHead>
            <Field label="Nome do produto"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
            <div className="grid cols-2">
              <Field label="Tempo de produção (h)"><Input type="number" step="0.01" min={0} value={f.tempoH} onChange={(e) => setF({ ...f, tempoH: e.target.value })} /></Field>
              <Field label="Preço de venda (R$)"><Input type="number" step="0.01" min={0} value={f.venda} onChange={(e) => setF({ ...f, venda: e.target.value })} /></Field>
            </div>
          </div>

          <div className="card mt16">
            <SectionHead title="2 · Custo variável" sub="manual ou pela ficha técnica (insumos)">
              <Chip active={f.mode !== 'ficha'} onClick={() => setF({ ...f, mode: 'cv' })}>Manual</Chip>
              <Chip active={f.mode === 'ficha'} onClick={() => setF({ ...f, mode: 'ficha' })}>Ficha técnica</Chip>
            </SectionHead>
            {f.mode === 'ficha' ? (
              <div>
                {f.ficha.length === 0 ? <div className="muted small mb8">Clique em "Adicionar insumo" e use os materiais do estoque.</div> : null}
                {f.ficha.map((r, i) => {
                  const st = state.stock.find((x) => x.id === r.i);
                  return (
                    <div key={i} className="flex gap8 mb8" style={{ alignItems: 'center' }}>
                      <Select value={r.i || ''} style={{ flex: 2 }} onChange={(e) => { const rr = [...f.ficha]; rr[i] = { i: e.target.value, q: rr[i].q }; setF({ ...f, ficha: rr }); }}>
                        <option value="">— insumo —</option>
                        {state.stock.map((s) => <option key={s.id} value={s.id}>{s.nome} ({currency(s.custo)}/{s.un})</option>)}
                      </Select>
                      <Input type="number" step="0.01" min={0} value={r.q} style={{ width: 90 }} onChange={(e) => { const rr = [...f.ficha]; rr[i] = { ...rr[i], q: e.target.value }; setF({ ...f, ficha: rr }); }} />
                      <span className="muted tiny">{st ? currency((st.custo || 0) * n(r.q)) : '—'}</span>
                      <Btn sm onClick={() => setF({ ...f, ficha: f.ficha.filter((_, k) => k !== i) })}><Icon name="trash" size={12} /></Btn>
                    </div>
                  );
                })}
                <Btn sm onClick={() => setF({ ...f, ficha: [...f.ficha, { i: '', q: 1 }] })}><Icon name="plus" size={13} /> Adicionar insumo</Btn>
                <div className="flex mt12"><span className="muted small">Soma dos insumos</span><span className="grow" /><b>{currency(cvFicha)}</b></div>
              </div>
            ) : (
              <Field label="Custo variável por unidade (R$)" hint="valor colado da planilha ou somado na ficha">
                <Input type="number" step="0.01" min={0} value={f.cv} onChange={(e) => setF({ ...f, cv: e.target.value })} />
              </Field>
            )}
            <div className="mt12 flex gap8 wrap">
              <Btn variant="primary" onClick={saveProd}><Icon name="check" /> Salvar produto</Btn>
              <a className="btn" style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(waTexto)}`}><Icon name="wa" /> Enviar no WhatsApp</a>
            </div>
          </div>
        </div>

        {/* -------- RIGHT: resultado + tabela -------- */}
        <div>
          <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--teal) 40%, var(--border))' }}>
            <SectionHead title="3 · Resultado" sub={`${f.nome || 'produto'} · ${n(f.tempoH)}h de produção`} />
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="flex"><span className="muted small">Custo variável</span><span className="grow" /><b>{currency(cv)}</b></div>
              <div className="flex"><span className="muted small">Custo fixo ({par.cvhora}/h × {n(f.tempoH)}h)</span><span className="grow" /><b>{currency(calc.cf)}</b></div>
              <div className="flex" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}><b>Custo total</b><span className="grow" /><b>{currency(calc.ct)}</b></div>
              <div className="flex"><span className="muted small">Lucro ({n(par.markup) * 100}% markup)</span><span className="grow" /><b>{currency(round2(calc.comLucro - calc.ct))}</b></div>
              <div className="flex"><span className="muted small">Taxa plataforma ({n(par.tx_plataforma) * 100}%)</span><span className="grow" /><b>{currency(round2(calc.sugerido - calc.comLucro))}</b></div>
              <div className="flex" style={{ alignItems: 'flex-end' }}>
                <div>
                  <div className="kpi-label">Preço sugerido</div>
                  <div className="font-display" style={{ fontSize: 34, fontWeight: 700, color: 'var(--teal-dark)' }}>{currency(calc.sugerido)}</div>
                  <div className="muted tiny">cartão: {currency(cartaoPct(calc.sugerido, par.tx_cartao))}</div>
                </div>
                <span className="grow" />
                <div style={{ textAlign: 'right' }}>
                  <div className="kpi-label">Seu preço · margem</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: abaixo && f.venda ? 'var(--coral)' : 'var(--ok)' }}>{f.venda ? `${currency(n(f.venda))} · ${pct(margem)}%` : '—'}</div>
                  <Badge tone={abaixo ? 'danger' : f.venda ? 'ok' : 'nude'}>{abaixo ? 'abaixo do sugerido' : f.venda ? 'ok' : 'sem preço'}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt16">
            <SectionHead title="Tabela de preços" sub="clique em um produto para editar">
              <Badge tone="nude">{state.preco.length} itens</Badge>
            </SectionHead>
            <div className="table-wrap" style={{ maxHeight: 480, overflowY: 'auto' }}>
              <table className="lc">
                <thead><tr><th>SKU</th><th>Produto</th><th>CV</th><th>H</th><th>Custo</th><th>Sugerido</th><th>Venda</th><th>Margem</th><th></th></tr></thead>
                <tbody>
                  {state.preco.map((r, i) => {
                    const c = calcCorpPreco(n(r.cv), n(r.tempoH), ps);
                    const m = margemPct(n(r.venda), c.ct);
                    const low = n(r.venda) > 0 && n(r.venda) < c.sugerido;
                    return (
                      <tr key={r.sku} style={{ cursor: 'pointer' }} className={i === pix ? 'row-active' : ''} onClick={() => pick(i)}>
                        <td className="muted tiny">{r.sku}</td>
                        <td><b className="small">{r.nome || '—'}</b></td>
                        <td className="tiny">{currency(r.cv)}</td>
                        <td className="muted tiny">{r.tempoH}h</td>
                        <td className="tiny">{currency(c.ct)}</td>
                        <td className="tiny"><b>{currency(c.sugerido)}</b></td>
                        <td className="tiny">{n(r.venda) ? currency(r.venda) : '—'}</td>
                        <td className="tiny">{n(r.venda) ? <Badge tone={low ? 'danger' : m < 45 ? 'warn' : 'ok'}>{pct(m)}%</Badge> : '—'}{low ? <span className="badge danger" title="vendendo abaixo do sugerido">⚠️</span> : null}</td>
                        <td className="tiny no-print"><Btn sm onClick={(e) => { e.stopPropagation(); pick(i); }}><Icon name="edit" size={12} /></Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};