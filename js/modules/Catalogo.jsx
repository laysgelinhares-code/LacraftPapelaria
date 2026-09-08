// ============================================================
// LA CRAFT OS — Catálogo de Produtos
// ============================================================

const ProductDrawer = ({ p, onClose, onEdit }) => {
  const { state, saveOrder, go } = useLC();
  const ordered = state.orders.filter((o) => o.items.some((i) => i.p === p.id));
  const totalUn = ordered.reduce((s, o) => s + o.items.filter((i) => i.p === p.id).reduce((a, i) => a + i.qtd, 0), 0);
  const pp = state.precoParams || PRECO_PARAMS;
  const cv = n(p.cv);
  const calc = cv ? calcCorpPreco(cv, n(p.tempoH), pp) : null;
  const mg = p.valor && calc ? margemPct(n(p.valor), calc.ct) : null;
  const low = p.valor && calc && n(p.valor) < calc.sugerido;
  return (
    <Drawer title={p.nome} subtitle={EMOJI_BY_CAT[p.categoria] + ' ' + CATEGORIAS.find(([k]) => k === p.categoria)?.[1]} onClose={onClose}>
      <div className="art-tile" style={{ aspectRatio: '16/9' }}>
        <span style={{ fontSize: 54 }}>{p.foto || '📦'}</span>
      </div>
      <div className="kv mt16">
        <div><div className="k">Preço</div><div className="v">{currency(p.valor)}</div></div>
        <div><div className="k">Tempo médio</div><div className="v">{p.tempo} dias</div></div>
        <div><div className="k">Vezes pedido</div><div className="v sm">{ordered.length} pedido(s)</div></div>
        <div><div className="k">Unidades vendidas</div><div className="v">{totalUn}</div></div>
        {calc ? (
          <>
            <div><div className="k">Custo variável</div><div className="v sm">{currency(cv)} · {n(p.tempoH)}h prod.</div></div>
            <div><div className="k">Custo total</div><div className="v">{currency(calc.ct)}</div></div>
            <div><div className="k">Preço sugerido</div><div className="v" style={{ color: 'var(--teal-dark)' }}>{currency(calc.sugerido)}</div></div>
            <div><div className="k">Sua margem</div><div className="v">{mg !== null ? <Badge tone={low ? 'danger' : 'ok'}>{mg}%</Badge> : '—'}{low ? <span className="badge danger" style={{ marginLeft: 6 }}>abaixo do sugerido</span> : null}</div></div>
          </>
        ) : null}
      </div>
      <p className="mt12">{p.desc}</p>
      {p.materiais?.length ? (
        <div className="mt12">
          <SectionHead title="Insumos utilizados" sub="baixa automática no estoque" />
          <div style={{ display: 'grid', gap: 6 }}>
            {p.materiais.map((m, k) => {
              const st = state.stock.find((x) => x.id === m.i);
              return <div key={k} className="list-row"><span className="badge warn">{m.q}</span><b className="small grow">{st?.nome || m.i}</b><span className="muted tiny">{st ? `${st.qtd} ${st.un} restantes` : ''}</span></div>;
            })}
          </div>
        </div>
      ) : null}
      {p.categoria === 'empresa' ? <div className="alert-banner mt12" style={{ borderColor: 'var(--teal)', background: 'var(--teal-soft)', color: 'var(--teal-dark)' }}>💼 Este item é configurado por contrato — use a Calculadora de Custos para precificar.</div> : null}
      <div className="mt16 flex gap8 wrap">
        <Btn variant="primary" onClick={() => { window.__preSelProduct = p.id; go('pedidos'); onClose(); toast('Produto pré-selecionado no novo pedido'); }}><Icon name="plus" /> Novo pedido com este produto</Btn>
        <Btn onClick={() => { go('orcamento'); onClose(); }}><Icon name="orcamento" /> Orçar agora</Btn>
        <Btn onClick={onEdit}><Icon name="edit" /> Editar produto</Btn>
      </div>
    </Drawer>
  );
};

const CatalystForm = ({ onSave, initial, onClose }) => {
  const [f, setF] = React.useState(initial || { categoria: 'agenda', nome: '', desc: '', valor: '', tempo: 3, foto: '📦', sku: '', cv: '', tempoH: '' });
  return (
    <Modal title={initial ? 'Editar produto' : 'Novo produto'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => { if (!f.nome || !f.valor) { toast('Preencha nome e preço', 'warn'); return; } onSave({ ...f, valor: n(f.valor), cv: n(f.cv), tempoH: n(f.tempoH) }); }}><Icon name="check" /> Salvar</Btn></>}>
      <div className="grid cols-2">
        <Field label="Nome"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="Categoria">
          <Select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
            {CATEGORIAS.map(([k, l]) => <option key={k} value={k}>{EMOJI_BY_CAT[k]} {l}</option>)}
          </Select>
        </Field>
        <Field label="Preço (R$)"><Input value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></Field>
        <Field label="Tempo médio (dias)"><Input type="number" min={0} value={f.tempo} onChange={(e) => setF({ ...f, tempo: parseInt(e.target.value) || 0 })} /></Field>
        <Field label="SKU" hint="ex.: #25010002"><Input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} /></Field>
        <Field label="Custo variável (R$)" hint="para a calculadora de preços"><Input type="number" step="0.01" min={0} value={f.cv} onChange={(e) => setF({ ...f, cv: e.target.value })} /></Field>
        <Field label="Tempo de produção (h)" hint="usado no cálculo de custo fixo"><Input type="number" step="0.01" min={0} value={f.tempoH} onChange={(e) => setF({ ...f, tempoH: e.target.value })} /></Field>
        <Field label="Ícone" hint="deixe personalizado"><Input value={f.foto} style={{ width: 90 }} onChange={(e) => setF({ ...f, foto: e.target.value })} /></Field>
      </div>
      <Field label="Descrição"><Textarea value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></Field>
    </Modal>
  );
};

const CatalogoView = () => {
  const { state, set, q, setQ, log, toast } = useLC();
  const [cat, setCat] = React.useState('all');
  const [openId, setOpenId] = React.useState(null);
  const [form, setForm] = React.useState(null);
  const open = state.products.find((p) => p.id === openId);

  const list = state.products.filter((p) =>
    (cat === 'all' || p.categoria === cat) &&
    (!q || (p.nome + ' ' + (p.desc || '')).toLowerCase().includes(q.toLowerCase().trim()))
  );

  const save = (f) => {
    if (form) {
      set('products', (a) => a.map((p) => (p.id === form.id ? { ...p, ...f } : p)));
      toast('Produto atualizado');
    } else {
      set('products', (a) => [{ ...f, id: uid('P') }, ...a]);
      log(`Novo produto no catálogo: ${f.nome}`);
      toast('Produto adicionado ✨');
    }
    setForm(null);
  };

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto..." />
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Novo produto</Btn>
        <Btn onClick={() => go('orcamento')}><Icon name="orcamento" /> Tabela de preços inteligente</Btn>
      </div>
      <div className="flex gap6 wrap mb16 no-print">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>Tudo ({state.products.length})</Chip>
        {CATEGORIAS.map(([k, l]) => (
          <Chip key={k} active={cat === k} onClick={() => setCat(k)}>{EMOJI_BY_CAT[k]} {l}</Chip>
        ))}
      </div>

      <div className="grid cols-4">
        {list.map((p) => (
          <div key={p.id} className="card hov" style={{ cursor: 'pointer', padding: 14 }} onClick={() => setOpenId(p.id)}>
            <div className="art-tile" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 40 }}>{p.foto || '📦'}</span>
            </div>
            <div className="flex gap8 mb8"><Badge tone="nude">{EMOJI_BY_CAT[p.categoria]} {CATEGORIAS.find(([k]) => k === p.categoria)?.[1]}</Badge></div>
            <b style={{ fontSize: 13.5 }}>{p.nome}</b>
            <p className="muted tiny" style={{ margin: '4px 0 10px', minHeight: 32 }}>{p.desc}</p>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <b className="font-display" style={{ fontSize: 16 }}>{currency(p.valor)}</b>
              <span className="badge teal"><Icon name="clock" size={11} /> {p.tempo} dias</span>
            </div>
          </div>
        ))}
        {list.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}><Empty emoji="📚" title="Nenhum produto aqui" sub="Adicione produtos a esta categoria pelo botão Novo produto." /></div>
        ) : null}
      </div>

      {open ? <ProductDrawer p={open} onClose={() => setOpenId(null)} onEdit={() => { setForm(open); setOpenId(null); }} /> : null}
      {form ? <CatalystForm initial={form.id ? state.products.find((p) => p.id === form.id) : null} onSave={save} onClose={() => setForm(null)} /> : null}
    </div>
  );
};