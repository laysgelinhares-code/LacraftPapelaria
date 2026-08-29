// ============================================================
// LA CRAFT OS — Corte na Silhouette Portrait 3
// ============================================================

const LAMINAS = ['Livro', 'Rato', 'Estandard'];

const CutForm = ({ onClose, initial }) => {
  const { set, log, toast } = useLC();
  const [f, setF] = React.useState(initial || { nome: '', lamina: 'Livro', forca: 10, vel: 5, passadas: 2, obs: '' });
  const save = () => {
    if (!f.nome) { toast('Nomeie a configuração de corte', 'warn'); return; }
    if (initial) {
      set('cutProfiles', (a) => a.map((p) => (p.id === initial.id ? { ...p, ...f } : p)));
      toast('Configuração atualizada');
    } else {
      set('cutProfiles', (a) => [...a, { ...f, id: uid('CU') }]);
      log(`Configuração de corte criada: ${f.nome}`);
      toast('Configuração salva ✂️');
    }
    onClose();
  };
  return (
    <Modal title={initial ? 'Editar configuração' : 'Nova configuração de corte'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Icon name="check" /> Salvar</Btn></>}>
      <div className="grid cols-2">
        <Field label="Nome"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="Lâmina">
          <Select value={f.lamina} onChange={(e) => setF({ ...f, lamina: e.target.value })}>
            {LAMINAS.map((l) => <option key={l}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Força (1-20)"><Input type="number" min={1} max={20} value={f.forca} onChange={(e) => setF({ ...f, forca: e.target.value })} /></Field>
        <Field label="Velocidade (1-10)"><Input type="number" min={1} max={10} value={f.vel} onChange={(e) => setF({ ...f, vel: e.target.value })} /></Field>
        <Field label="Passadas"><Input type="number" min={1} value={f.passadas} onChange={(e) => setF({ ...f, passadas: e.target.value })} /></Field>
      </div>
      <Field label="Observações"><Textarea value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} /></Field>
    </Modal>
  );
};

const SilhouetteView = () => {
  const { state, set, toast, log } = useLC();
  const [form, setForm] = React.useState(null);
  const active = state.cutProfiles.find((p) => p.ativo) || state.cutProfiles[0];

  const cortar = (p) => {
    set('cutLog', (l) => [{ id: uid('CL'), data: TODAY, perfil: p.nome, obs: p.obs || p.nome }, ...l]);
    log(`Corte no Silhouette: ${p.nome}`);
    toast(`Corte concluído (${p.nome}) ✂️`);
  };

  return (
    <div>
      <div className="card mb16" style={{ background: 'linear-gradient(135deg, #6b4ea3, #9a7fd0)', color: '#fff', border: 'none' }}>
        <div className="flex gap10">
          <div style={{ width: 46, height: 46, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.2)' }}><Icon name="corte" size={22} /></div>
          <div className="grow">
            <b className="font-display" style={{ fontSize: 17 }}>Silhouette Portrait 3</b>
            <div className="tiny" style={{ opacity: .85 }}>plotter de corte · conectada · lâmina: 1mm</div>
          </div>
          <div className="tiny" style={{ opacity: .85, textAlign: 'right' }}><Icon name="check" size={12} /> firmware atualizado</div>
        </div>
      </div>

      <div className="flex gap10 wrap no-print mb12">
        <span className="stat-pill"><Icon name="corte" /> {state.cutProfiles.length} configurações</span>
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Nova configuração</Btn>
      </div>

      <div className="grid cols-3 mb16">
        {state.cutProfiles.map((p, i) => (
          <div key={p.id} className="card hov" style={{ borderColor: active?.id === p.id ? '#9a7fd0' : undefined, cursor: 'pointer' }} onClick={() => set('cutProfiles', (a) => a.map((x) => ({ ...x, ativo: x.id === p.id })))}>
            <div className="flex gap8 mb8">
              {active?.id === p.id ? <Badge tone="info">em uso</Badge> : <Badge tone="nude">config</Badge>}
              <span className="grow" />
              <Btn sm className="no-print" onClick={(e) => { e.stopPropagation(); setForm(p); }}><Icon name="edit" size={13} /></Btn>
            </div>
            <b>{p.nome}</b>
            <div className="tiny muted mt8">Lâmina {p.lamina} · força {p.forca} · vel {p.vel} · {p.passadas} passada(s)</div>
            <div className="progress mt10" style={{ background: 'var(--bg-deep)' }}><span style={{ width: `${100 - p.forca * 3}%`, background: 'linear-gradient(90deg,#6b4ea3,#9a7fd0)' }} /></div>
            <div className="mt12">
              <Btn sm variant="info" className="no-print" onClick={(e) => { e.stopPropagation(); cortar(p); }}><Icon name="play" size={13} /> Cortar agora</Btn>
            </div>
          </div>
        ))}
        {state.cutProfiles.length === 0 ? <Empty emoji="✂️" title="Sem configurações" /> : null}
      </div>

      <div className="card">
        <SectionHead title="Histórico de cortes" sub="últimas operações">
          <Badge tone="nude">{state.cutLog?.length || 0} cortes</Badge>
        </SectionHead>
        {state.cutLog?.slice(0, 10).map((c) => (
          <div key={c.id} className="flex gap8 mb8" style={{ fontSize: 12.5 }}>
            <Icon name="corte" size={14} style={{ color: '#9a7fd0' }} />
            <span className="grow"><b>{c.perfil}</b> {c.obs ? <span className="muted tiny">· {c.obs}</span> : null}</span>
            <span className="muted tiny">{fmtDate(c.data)}</span>
            <Badge tone="ok">✓</Badge>
          </div>
        ))}
        {!state.cutLog?.length ? <Empty emoji="✂️" title="Nenhum corte registrado" sub="Use 'Cortar agora' em uma configuração." /> : null}
      </div>

      {form ? <CutForm initial={form.id ? form : null} onClose={() => setForm(null)} /> : null}
    </div>
  );
};