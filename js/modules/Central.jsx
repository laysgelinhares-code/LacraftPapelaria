// ============================================================
// LA CRAFT OS — Central da La Craft (diário, ideias, preços, metas, VIP)
// ============================================================

const CentralView = () => {
  const { state, set, log, toast } = useLC();
  const [tab, setTab] = React.useState('diario');
  const [d, setD] = React.useState({ texto: '', tempoMin: '', foto: '', tags: '' });
  const [idea, setIdea] = React.useState({ titulo: '', desc: '', tags: '', link: '' });
  const [preco, setPreco] = React.useState({ tag: '', base: '', frente: '', verso: '', qtd: 1, desconto: 0 });
  const [metaF, setMetaF] = React.useState({ ...state.metas });

  const entradasMes = state.tx.filter((t) => t.tipo === 'entrada' && t.status === 'pago' && t.data.slice(0, 7) === TODAY.slice(0, 7));
  const vendidoMes = entradasMes.reduce((s, t) => s + t.valor, 0);
  const vendidoHoje = entradasMes.filter((t) => t.data === TODAY).reduce((s, t) => s + t.valor, 0);

  const addDiary = () => {
    if (!d.texto) { toast('Escreva o registro do dia', 'warn'); return; }
    set('diary', (a) => [{ id: uid('D'), data: TODAY, texto: d.texto, tempoMin: n(d.tempoMin) || 0, foto: d.foto, tags: d.tags }, ...a]);
    log('Diário da produção atualizado ✍️');
    toast('Registro adicionado ao diário ✍️');
    setD({ texto: '', tempoMin: '', foto: '', tags: '' });
  };
  const addIdea = () => {
    if (!idea.titulo) { toast('Dê um título à ideia', 'warn'); return; }
    set('ideas', (a) => [{ id: uid('I'), ...idea }, ...a]);
    toast('Ideia salva 💡');
    setIdea({ titulo: '', desc: '', tags: '', link: '' });
  };
  const addPreco = () => {
    if (!preco.tag) { toast('Nomeie o produto', 'warn'); return; }
    set('customPrices', (a) => [...a, { id: uid('CP'), ...preco, base: n(preco.base), frente: n(preco.frente), verso: n(preco.verso), qtd: Math.max(1, n(preco.qtd) || 1), desconto: n(preco.desconto) || 0 }]);
    toast('Regra de preço salva 💰');
    setPreco({ tag: '', base: '', frente: '', verso: '', qtd: 1, desconto: 0 });
  };

  const calcule = (r) => {
    const un = r.base + r.frente + (r.verso ? r.verso : 0);
    return un * r.qtd * (1 - (r.desconto || 0) / 100);
  };
  const calculeP = (r) => {
    const un = r.base + (r.frente || 0) + (r.verso || 0);
    return un * Math.max(1, r.qtd || 1) * (1 - (r.desconto || 0) / 100);
  };

  const vips = state.clients.filter((c) => c.papel === 'vip');
  const recorrentes = state.clients.filter((c) => c.papel === 'recorrente');

  return (
    <div>
      <div className="tabs no-print">
        <button className={`tab ${tab === 'diario' ? 'active' : ''}`} onClick={() => setTab('diario')}>✍️ Diário da produção</button>
        <button className={`tab ${tab === 'ideias' ? 'active' : ''}`} onClick={() => setTab('ideias')}>💡 Ideias</button>
        <button className={`tab ${tab === 'precos' ? 'active' : ''}`} onClick={() => setTab('precos')}>💰 Tabela inteligente</button>
        <button className={`tab ${tab === 'metas' ? 'active' : ''}`} onClick={() => setTab('metas')}>🎯 Metas</button>
        <button className={`tab ${tab === 'vip' ? 'active' : ''}`} onClick={() => setTab('vip')}>⭐ Clientes</button>
      </div>

      {tab === 'diario' ? (
        <div className="grid cols-2">
          <div>
            <div className="card mb16" style={{ background: 'var(--gold-soft)' }}>
              <SectionHead title="Registro de hoje" sub="o que rolou na bancada" />
              <Textarea value={d.texto} onChange={(e) => setD({ ...d, texto: e.target.value })} placeholder="Impressões, testes, entregas, aprendizados..." />
              <div className="flex gap8 mt8 wrap">
                <Input type="number" placeholder="Tempo (min)" style={{ width: 120 }} value={d.tempoMin} onChange={(e) => setD({ ...d, tempoMin: e.target.value })} />
                <Input placeholder="Tags (ex.: laminação, teste)" value={d.tags} onChange={(e) => setD({ ...d, tags: e.target.value })} />
                <Btn variant="primary" onClick={addDiary}><Icon name="plus" size={14} /> Registrar</Btn>
              </div>
            </div>
            <div className="card">
              <SectionHead title="Portfólio de ideias" sub="inspirações para testar e lançar">
                <Btn sm onClick={() => setTab('ideias')}>ver todas</Btn>
              </SectionHead>
              {state.ideas.slice(0, 3).map((id) => (
                <div key={id.id} className="list-row mb8">
                  <span style={{ fontSize: 18 }}>💡</span>
                  <div className="grow"><b className="small">{id.titulo}</b><div className="tiny muted">{id.tags}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <SectionHead title="Linha do tempo do ateliê" sub={`${state.diary.length} registros`} />
            <div className="timeline">
              {state.diary.map((e) => (
                <div key={e.id} className="tl-item">
                  <div className="tt">{e.texto.length > 90 ? e.texto.slice(0, 90) + '…' : e.texto}</div>
                  <div className="tsub">{fmtDateFull(e.data)} {e.tempoMin ? `· ${e.tempoMin} min` : ''} {e.tags ? `· ${e.tags}` : ''}</div>
                </div>
              ))}
              {state.diary.length === 0 ? <Empty emoji="🗒️" title="Diário vazio" sub="Registre seu dia para criar um portfólio real." /> : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'ideias' ? (
        <div className="grid cols-2">
          <div>
            <div className="card mb16">
              <SectionHead title="Nova ideia" />
              <Field label="Título"><Input value={idea.titulo} onChange={(e) => setIdea({ ...idea, titulo: e.target.value })} /></Field>
              <Field label="Descrição"><Textarea value={idea.desc} onChange={(e) => setIdea({ ...idea, desc: e.target.value })} /></Field>
              <div className="flex gap8 wrap">
                <Input placeholder="Tags" style={{ flex: 1 }} value={idea.tags} onChange={(e) => setIdea({ ...idea, tags: e.target.value })} />
                <Btn variant="primary" onClick={addIdea}><Icon name="plus" size={14} /> Salvar ideia</Btn>
              </div>
            </div>
          </div>
          <div>
            {state.ideas.map((id) => (
              <div key={id.id} className="card mb12">
                <div className="flex gap8">
                  <span style={{ fontSize: 18 }}>💡</span>
                  <div className="grow"><b>{id.titulo}</b><p className="small muted" style={{ margin: '4px 0 0' }}>{id.desc}</p></div>
                  <Btn sm onClick={() => set('ideas', (a) => a.filter((x) => x.id !== id.id))}><Icon name="trash" size={13} /></Btn>
                </div>
                <div className="flex gap6 mt8"><Badge tone="gold">{id.tags}</Badge></div>
              </div>
            ))}
            {state.ideas.length === 0 ? <Empty emoji="💡" title="Banco de ideias vazio" /> : null}
          </div>
        </div>
      ) : null}

      {tab === 'precos' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Regras de preço" sub="base + frente + verso + qtd + desconto" />
            <div className="table-wrap" style={{ border: 'none' }}>
              <table className="lc">
                <thead><tr><th>Item</th><th>Fórmula</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {state.customPrices.map((r) => (
                    <tr key={r.id}>
                      <td><b>{r.tag}</b></td>
                      <td className="tiny muted">{r.base} + {r.frente} + {r.verso} {r.desconto ? `(des ${r.desconto}%)` : ''}</td>
                      <td><b>{currency(calculeP(r))}</b></td>
                      <td><Btn sm onClick={() => set('customPrices', (a) => a.filter((x) => x.id !== r.id))}><Icon name="trash" size={12} /></Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt12" style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
              <div className="grid cols-3">
                <Field label="Item"><Input value={preco.tag} onChange={(e) => setPreco({ ...preco, tag: e.target.value })} placeholder="ex.: Cartão A6" /></Field>
                <Field label="Base"><Input type="number" value={preco.base} onChange={(e) => setPreco({ ...preco, base: e.target.value })} /></Field>
                <Field label="Frente"><Input type="number" value={preco.frente} onChange={(e) => setPreco({ ...preco, frente: e.target.value })} /></Field>
                <Field label="Verso"><Input type="number" value={preco.verso} onChange={(e) => setPreco({ ...preco, verso: e.target.value })} /></Field>
                <Field label="Qtd"><Input type="number" min={1} value={preco.qtd} onChange={(e) => setPreco({ ...preco, qtd: e.target.value })} /></Field>
                <Field label="Desc. %"><Input type="number" value={preco.desconto} onChange={(e) => setPreco({ ...preco, desconto: e.target.value })} /></Field>
              </div>
              <Btn variant="primary" onClick={addPreco}><Icon name="plus" size={14} /> Salvar regra</Btn>
            </div>
          </div>
          <div className="card">
            <SectionHead title="Calculadora rápida" sub="use uma regra cadastrada" />
            {state.customPrices.length ? <QuickCalc rules={state.customPrices} /> : <Empty emoji="💰" title="Cadastre regras de preço" />}
          </div>
        </div>
      ) : null}

      {tab === 'metas' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Definir metas" />
            <div className="grid cols-3">
              <Field label="Mensal (R$)"><Input type="number" value={metaF.mensal} onChange={(e) => setMetaF({ ...metaF, mensal: n(e.target.value) })} /></Field>
              <Field label="Semanal (R$)"><Input type="number" value={metaF.semanal} onChange={(e) => setMetaF({ ...metaF, semanal: n(e.target.value) })} /></Field>
              <Field label="Diária (R$)"><Input type="number" value={metaF.diaria} onChange={(e) => setMetaF({ ...metaF, diaria: n(e.target.value) })} /></Field>
            </div>
            <Btn variant="primary" onClick={() => { set('metas', metaF); log('Metas atualizadas 🎯'); toast('Metas salvas 🎯'); }}><Icon name="check" size={14} /> Salvar metas</Btn>
          </div>
          <div className="card">
            <SectionHead title="Acompanhamento" sub={monthName(8) + ' de 2026'} />
            <div className="mb16">
              <div className="flex mb8"><b>Meta mensal</b><span className="grow" /><b>{currency(vendidoMes)} <span className="muted">/ {currency(metaF.mensal)}</span></b></div>
              <Progress value={vendidoMes} max={metaF.mensal} tone="gold" />
              <div className="tiny muted mt8">faltam {currency(Math.max(0, metaF.mensal - vendidoMes))} para bater a meta</div>
            </div>
            <div className="grid cols-2">
              <div>
                <div className="flex mb8"><b className="tiny">Meta semanal</b><span className="grow" /><b className="tiny">{currency(state.metas.semanal)}</b></div>
                <Progress value={(vendidoMes / (state.metas.mensal / 4)) > 1 ? 100 : (vendidoMes / (state.metas.mensal / 4)) * 100} tone="coral" />
              </div>
              <div>
                <div className="flex mb8"><b className="tiny">Hoje</b><span className="grow" /><b className="tiny">{currency(vendidoHoje)} / {currency(metaF.diaria)}</b></div>
                <Progress value={vendidoHoje} max={metaF.diaria} />
              </div>
            </div>
            <div className="alert-banner mt16 wrap" style={{ borderColor: 'var(--teal)', background: 'var(--teal-soft)', color: 'var(--teal-dark)' }}>
              <Icon name="spark" /> {vendidoMes >= metaF.mensal ? <b>Meta batida! 🎉</b> : <b>{Math.round((vendidoMes / metaF.mensal) * 100)}% da meta mensal atingida</b>}
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'vip' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Clientes VIP" sub="tratamento especial ⭐" />
            {vips.length ? vips.map((c) => (
              <div key={c.id} className="list-row mb8">
                <span className="avatar-sm" style={{ background: 'linear-gradient(135deg,var(--gold),var(--peach))' }}>{initials(c.nome)}</span>
                <div className="grow"><b className="small">{c.nome}</b><div className="tiny muted">{c.instagram} · {c.cidade}</div></div>
                <Badge tone="gold">VIP</Badge>
                <a className="btn-wa" href={waLink(c.tel, `Oi ${c.nome.split(' ')[0]}! Novidade exclusiva de cliente VIP da La Craft 💌`)} target="_blank" rel="noreferrer"><Icon name="wa" size={12} /></a>
              </div>
            )) : <Empty emoji="⭐" title="Sem VIPs ainda" />}
          </div>
          <div className="card">
            <SectionHead title="Recorrentes" sub="clientes que voltam" />
            {recorrentes.length ? recorrentes.map((c) => (
              <div key={c.id} className="list-row mb8">
                <span className="avatar-sm" style={{ background: 'var(--teal)' }}>{initials(c.nome)}</span>
                <div className="grow"><b className="small">{c.nome}</b><div className="tiny muted">{state.orders.filter((o) => o.cliente === c.id && o.status !== 'orcamento').length} pedidos</div></div>
                <Badge tone="teal">recorrente</Badge>
              </div>
            )) : <Empty emoji="🔄" title="Sem recorrentes ainda" />}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const QuickCalc = ({ rules }) => {
  const [sel, setSel] = React.useState(rules[0]);
  const [qtd, setQtd] = React.useState(1);
  const [desc, setDesc] = React.useState(0);
  if (!sel) return null;
  const un = sel.base + sel.frente + sel.verso;
  const total = un * qtd * (1 - desc / 100);
  return (
    <div>
      <Field label="Regra">
        <Select value={sel.id} onChange={(e) => setSel(rules.find((r) => r.id === e.target.value))}>
          {rules.map((r) => <option key={r.id} value={r.id}>{r.tag}</option>)}
        </Select>
      </Field>
      <div className="grid cols-2">
        <Field label="Quantidade"><Input type="number" min={1} value={qtd} onChange={(e) => setQtd(Math.max(1, parseInt(e.target.value) || 1))} /></Field>
        <Field label="Desconto (%)"><Input type="number" value={desc} onChange={(e) => setDesc(Math.max(0, parseInt(e.target.value) || 0))} /></Field>
      </div>
      <div className="kv mt8">
        <div><div className="k">Por unidade</div><div className="v sm">{currency(un)}</div></div>
        <div><div className="k">Total</div><div className="v">{currency(total)}</div></div>
      </div>
      <div className="alert-banner mt12" style={{ borderColor: 'var(--gold)', background: 'var(--gold-soft)', color: 'var(--gold)' }}>
        <Icon name="spark" /> Sugestão de resposta: "O valor fica em <b>{currency(total)}</b> por {qtd} unidade(s). Te envio o orçamento por aqui? 💌"
      </div>
    </div>
  );
};