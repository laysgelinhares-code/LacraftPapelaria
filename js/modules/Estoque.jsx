// ============================================================
// LA CRAFT OS — Estoque de Insumos
// ============================================================

const EstoqueView = () => {
  const { state, set, q, setQ, log, toast } = useLC();
  const [cat, setCat] = React.useState('all');
  const [form, setForm] = React.useState(null);
  const [move, setMove] = React.useState(null);
  const comprar = state.stock.filter((s) => s.qtd <= s.min);
  const valorEstoque = state.stock.reduce((s, x) => s + x.qtd * x.custo, 0);

  const list = state.stock.filter((s) =>
    (cat === 'all' || s.cat === cat) &&
    (!q || s.nome.toLowerCase().includes(q.toLowerCase().trim()))
  );

  const saveItem = (f) => {
    if (form) {
      set('stock', (a) => a.map((s) => (s.id === form.id ? { ...s, ...f } : s)));
      toast('Insumo atualizado');
    } else {
      set('stock', (a) => [...a, { ...f, id: uid('S') }]);
      log(`Novo insumo: ${f.nome}`);
      toast('Insumo adicionado ✨');
    }
    setForm(null);
  };

  const doMove = (s, tipo, howmuch) => {
    const v = Math.max(0, tipo === 'saida' ? s.qtd - howmuch : s.qtd + howmuch);
    set('stock', (a) => a.map((x) => (x.id === s.id ? { ...x, qtd: v } : x)));
    set('movs', (m) => [{ id: uid('MV'), data: TODAY, item: s.nome, tipo, qtd: howmuch, user: 'Lays' }, ...m]);
    log(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} de estoque: ${s.nome} (${howmuch} ${s.un})`);
    toast(`${tipo === 'entrada' ? '☑' : '↘'} ${s.nome}: ${howmuch} ${s.un} ${tipo === 'entrada' ? 'adicionados' : 'retirados'}`);
  };

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar insumo..." />
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Novo insumo</Btn>
      </div>

      <div className="grid cols-4 mb16">
        <div className="card"><div className="kpi-label">Itens cadastrados</div><div className="kpi-value">{state.stock.length}</div></div>
        <div className="card" style={{ borderColor: comprar.length ? 'color-mix(in srgb, var(--coral) 40%, var(--border))' : undefined }}>
          <div className="kpi-label">⚠ Em falta</div>
          <div className="kpi-value" style={{ color: 'var(--coral)' }}>{comprar.length}</div>
          {comprar.length ? <div className="kpi-sub">fazer pedido ao fornecedor</div> : null}
        </div>
        <div className="card"><div className="kpi-label">Valor do estoque</div><div className="kpi-value">{currency(valorEstoque)}</div></div>
        <div className="card"><div className="kpi-label">Baixa automática</div><div className="kpi-value" style={{ fontSize: 18 }}>ligada ✅</div><div className="kpi-sub">pedidos consomem insumos</div></div>
      </div>

      {comprar.length ? (
        <div className="alert-banner mb16 wrap">
          <Icon name="alert" />
          <b>Comprar: </b>
          {comprar.map((s) => `${s.nome} (restam ${s.qtd} ${s.un})`).join(' · ')}
          <span className="grow" />
          <Btn sm variant="gold" onClick={() => { toast('Pedido de compra anotado no diário ✍️'); }}>Anotar compra</Btn>
        </div>
      ) : null}

      <div className="flex gap6 wrap mb12 no-print">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>Todos</Chip>
        <Chip active={cat === 'Papel'} onClick={() => setCat('Papel')}>📄 Papel</Chip>
        <Chip active={cat === 'Material'} onClick={() => setCat('Material')}>🧵 Materiais</Chip>
      </div>

      <div className="table-wrap">
        <table className="lc">
          <thead>
            <tr><th>Insumo</th><th>Tipo</th><th>Estoque</th><th>Mínimo</th><th>Situação</th><th>Custo/un</th><th>Fornecedor</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const low = s.qtd <= s.min * 0.6, mid = s.qtd <= s.min;
              return (
                <tr key={s.id}>
                  <td><b>{s.nome}</b></td>
                  <td><Badge tone={s.cat === 'Papel' ? 'info' : 'teal'}>{s.cat}</Badge></td>
                  <td className="font-display" style={{ fontWeight: 700 }}>{s.qtd} <span className="muted tiny">{s.un}</span></td>
                  <td className="muted">{s.min} {s.un}</td>
                  <td>{low ? <Badge tone="danger">crítico</Badge> : mid ? <Badge tone="warn">baixo</Badge> : <Badge tone="ok">ok</Badge>}</td>
                  <td>{currency(s.custo)}</td>
                  <td className="muted small">{s.forn}</td>
                  <td>
                    <Btn sm onClick={() => setMove(s)}><Icon name="edit" size={12} /> mover</Btn>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 ? (
              <tr><td colSpan={8}><Empty emoji="📦" title="Nenhum insumo" sub="Adicione papéis e materiais para controlar o estoque." /></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="grid cols-2 mt16">
        <div className="card">
          <SectionHead title="Movimentações recentes" sub="entradas e saídas" />
          <div className="timeline">
            {state.movs.slice(0, 8).map((m) => (
              <div key={m.id} className={`tl-item ${m.tipo === 'entrada' ? 'gold' : 'coral'}`}>
                <div className="tt">{m.tipo === 'entrada' ? '☑ Entrada' : '↘ Saída'} · {m.item}</div>
                <div className="tsub">{m.qtd} un — {fmtDate(m.data)} · {m.user}</div>
              </div>
            ))}
            {state.movs.length === 0 ? <Empty emoji="🗂️" title="Sem movimentações manuais" sub="Baixas automáticas de pedidos não aparecem aqui (vão no diário)." /> : null}
          </div>
        </div>
        <div className="card">
          <SectionHead title="Como funciona a baixa automática" />
          <div className="small muted" style={{ lineHeight: 1.7 }}>
            Quando um pedido <b>entra em produção</b> (etapa Em produção ou seguintes), o sistema consome os insumos
            cadastrados nos <b>materiais</b> de cada produto do catálogo. Ex.: uma <b>Agenda 2027</b> usa 1 folha de
            papelão, 0,5 m de elástico, dentro outros. Assim o estoque reflete a bancada de verdade.
            <div className="mt12"><Badge tone="gold">Dica:</Badge> mantenha o <b>mínimo</b> atualizado para receber alertas a tempo de comprar.</div>
          </div>
        </div>
      </div>

      {form ? (
        <Modal title={form.id ? 'Editar insumo' : 'Novo insumo'} onClose={() => setForm(null)}
          footer={<><Btn onClick={() => setForm(null)}>Cancelar</Btn><Btn variant="primary" onClick={() => saveItem({ ...form, qtd: n(form.qtd || 0), min: n(form.min || 0), custo: n(form.custo || 0) })}><Icon name="check" /> Salvar</Btn></>}>
          <div className="grid cols-2">
            <Field label="Nome"><Input value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
            <Field label="Tipo">
              <Select value={form.cat || 'Papel'} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                <option>Papel</option><option>Material</option>
              </Select>
            </Field>
            <Field label="Quantidade"><Input type="number" value={form.qtd || 0} onChange={(e) => setForm({ ...form, qtd: e.target.value })} /></Field>
            <Field label="Unidade"><Input value={form.un || 'un'} onChange={(e) => setForm({ ...form, un: e.target.value })} /></Field>
            <Field label="Mínimo (alerta)"><Input type="number" value={form.min || 0} onChange={(e) => setForm({ ...form, min: e.target.value })} /></Field>
            <Field label="Custo por unidade (R$)"><Input value={form.custo || 0} onChange={(e) => setForm({ ...form, custo: e.target.value })} /></Field>
          </div>
          <Field label="Fornecedor"><Input value={form.forn || ''} onChange={(e) => setForm({ ...form, forn: e.target.value })} /></Field>
        </Modal>
      ) : null}

      {move ? (
        <MoveModal s={state.stock.find((x) => x.id === move.id)} onClose={() => setMove(null)} onDo={doMove} />
      ) : null}
    </div>
  );
};

const MoveModal = ({ s, onClose, onDo }) => {
  const [tipo, setTipo] = React.useState('entrada');
  const [qtd, setQtd] = React.useState(1);
  if (!s) return null;
  return (
    <Modal title={`Movimentar · ${s.nome}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => { onDo(s, tipo, qtd); onClose(); }}><Icon name="check" /> Confirmar</Btn></>}>
      <div className="flex gap8 mb12">
        <Chip active={tipo === 'entrada'} onClick={() => setTipo('entrada')}>☑ Entrada (comprar)</Chip>
        <Chip active={tipo === 'saida'} onClick={() => setTipo('saida')}>↘ Saída (usar)</Chip>
      </div>
      <Field label={`Quantidade (${s.un})`}><Input type="number" min={1} value={qtd} onChange={(e) => setQtd(Math.max(1, parseInt(e.target.value) || 1))} /></Field>
      <div className="kv">
        <div><div className="k">Atual</div><div className="v sm">{s.qtd} {s.un}</div></div>
        <div><div className="k">Depois</div><div className="v sm">{Math.max(0, tipo === 'entrada' ? s.qtd + qtd : s.qtd - qtd)} {s.un}</div></div>
        <div><div className="k">Mínimo</div><div className="v sm">{s.min} {s.un}</div></div>
      </div>
    </Modal>
  );
};