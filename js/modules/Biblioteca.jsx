// ============================================================
// LA CRAFT OS — Biblioteca de Artes
// ============================================================

const ARTE_TYPES = ['PNG', 'PDF', 'SVG', 'AI', 'PSD', 'TTF', 'JPG'];
const TIPO_ICON = { PNG: '🖼️', PDF: '📄', SVG: '🧩', AI: '🎨', PSD: '🖌️', TTF: '🔤', JPG: '🌄' };

const ArtForm = ({ onClose, initial }) => {
  const { set, log, toast } = useLC();
  const [f, setF] = React.useState(initial || { nome: '', cat: 'Decoração', tipo: 'PNG', url: '', tags: '' });
  const save = () => {
    if (!f.nome) { toast('Nomeie o arquivo', 'warn'); return; }
    if (initial) {
      set('arts', (a) => a.map((x) => (x.id === initial.id ? { ...x, ...f } : x)));
      toast('Arquivo atualizado');
    } else {
      set('arts', (a) => [{ id: uid('A'), ...f }, ...a]);
      log(`Arte adicionada à biblioteca: ${f.nome}`);
      toast('Arte salva na biblioteca 🎨');
    }
    onClose();
  };
  return (
    <Modal title={initial ? 'Editar arquivo' : 'Novo arquivo'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Icon name="check" /> Salvar</Btn></>}>
      <div className="grid cols-2">
        <Field label="Nome"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="Categoria">
          <Select value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>
            <option>Decoração</option><option>Logo</option><option>Convites</option><option>Topos</option><option>Fonte</option><option>Agenda</option><option>Caderno</option><option>Fotos</option>
          </Select>
        </Field>
        <Field label="Tipo">
          <Select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
            {ARTE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Link (opcional)"><Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://..." /></Field>
      </div>
      <Field label="Tags" hint="separadas por vírgula"><Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
    </Modal>
  );
};

const BibliotecaView = () => {
  const { state, set, q, setQ, toast, log } = useLC();
  const [openId, setOpenId] = React.useState(null);
  const [form, setForm] = React.useState(null);
  const [catF, setCatF] = React.useState('all');

  const cats = ['all', ...new Set(state.arts.map((a) => a.cat))];
  const list = state.arts.filter((a) =>
    (catF === 'all' || a.cat === catF) &&
    (!q || (a.nome + ' ' + a.tags).toLowerCase().includes(q.toLowerCase().trim()))
  );
  const open = state.arts.find((a) => a.id === openId);

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar arte, tag..." />
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Adicionar arquivo</Btn>
      </div>

      <div className="flex gap6 wrap mb16 no-print">
        {cats.map((c) => <Chip key={c} active={catF === c} onClick={() => setCatF(c)}>{c === 'all' ? 'Todas' : c}</Chip>)}
      </div>

      <div className="grid cols-4">
        {list.map((a) => (
          <div key={a.id} className="card hov" style={{ cursor: 'pointer', padding: 12 }} onClick={() => setOpenId(a.id)}>
            <div className="art-tile">
              <span style={{ fontSize: 30 }}>{TIPO_ICON[a.tipo] || '📁'}</span>
            </div>
            <b className="small" style={{ display: 'block', marginTop: 10 }}>{a.nome}</b>
            <div className="flex gap6 mt8">
              <Badge tone={a.cat === 'Logo' ? 'gold' : 'teal'}>{a.cat}</Badge>
              <Badge tone="nude">{a.tipo}</Badge>
            </div>
          </div>
        ))}
        {list.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}><Empty emoji="🖼️" title="Nenhuma arte aqui" sub="Adicione logotipos, vetores e provas à sua biblioteca." /></div>
        ) : null}
      </div>

      {open ? (
        <Drawer title={open.nome} subtitle={`${open.cat} · ${open.tipo}`} onClose={() => setOpenId(null)}
          footer={
            <>
              <Btn variant="danger" onClick={() => { if (confirm('Excluir este arquivo?')) { set('arts', (a) => a.filter((x) => x.id !== open.id)); toast('Arquivo excluído'); setOpenId(null); } }}><Icon name="trash" size={14} /></Btn>
              <Btn variant="primary" onClick={() => setForm(open)}><Icon name="edit" size={14} /> Editar</Btn>
              {open.url ? <a className="btn" style={{ textDecoration: 'none' }} href={open.url} target="_blank" rel="noreferrer"><Icon name="link" size={14} /> Abrir arquivo</a> : null}
            </>
          }>
          <div className="art-tile" style={{ aspectRatio: '16/9' }}>
            <Icon name="artes" size={40} />
          </div>
          <div className="kv mt16">
            <div><div className="k">Formato</div><div className="v sm">{open.tipo}</div></div>
            <div><div className="k">Categoria</div><div className="v sm">{open.cat}</div></div>
            <div><div className="k">Tags</div><div className="v sm">{open.tags || '—'}</div></div>
          </div>
          <div className="alert-banner mt16" style={{ borderColor: 'var(--teal)', background: 'var(--teal-soft)', color: 'var(--teal-dark)' }}>
            <Icon name="spark" /> Você pode <b>anexar esta arte a um pedido</b> pelo kanban (aba Arte & arquivos) ou criar um novo pedido com ela.
          </div>
        </Drawer>
      ) : null}
      {form ? <ArtForm initial={form.id ? form : null} onClose={() => setForm(null)} /> : null}
    </div>
  );
};