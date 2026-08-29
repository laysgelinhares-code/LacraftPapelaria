// ============================================================
// LA CRAFT OS — Impressão (perfil Epson + fila de impressão)
// ============================================================

const EPSONS = ['Epson WF-C5810', 'Epson L4260'];

const PrintForm = ({ onClose, initial, imp }) => {
  const { set, log, toast } = useLC();
  const [f, setF] = React.useState(initial || { imp, nome: '', papel: 'Offset 90g', qualidade: 'Alta', duplaFace: 'Sim', cores: 'Colorido' });
  const save = () => {
    if (!f.nome) { toast('Dê um nome ao perfil', 'warn'); return; }
    if (initial) {
      set('printProfiles', (a) => a.map((p) => (p.id === initial.id ? { ...p, ...f } : p)));
      toast('Perfil atualizado');
    } else {
      set('printProfiles', (a) => [...a, { ...f, id: uid('PR') }]);
      log(`Perfil de impressão criado: ${f.nome}`);
      toast('Perfil salvo 🖨️');
    }
    onClose();
  };
  return (
    <Modal title={initial ? 'Editar perfil de impressão' : `Novo perfil · ${imp}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Icon name="check" /> Salvar</Btn></>}>
      <div className="grid cols-2">
        <Field label="Nome do perfil"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="Papel">
          <Select value={f.papel} onChange={(e) => setF({ ...f, papel: e.target.value })}>
            <option>Offset 75g</option><option>Offset 90g</option><option>Offset 120g</option><option>Offset 180g</option><option>Couchê 300g</option><option>Fotográfico</option><option>Vegetal 180g</option><option>Adesivo</option>
          </Select>
        </Field>
        <Field label="Qualidade">
          <Select value={f.qualidade} onChange={(e) => setF({ ...f, qualidade: e.target.value })}>
            <option>Alta</option><option>Normal</option><option>Economia</option>
          </Select>
        </Field>
        <Field label="Frente e verso?">
          <Select value={f.duplaFace} onChange={(e) => setF({ ...f, duplaFace: e.target.value })}><option>Sim</option><option>Não</option></Select>
        </Field>
        <Field label="Cores">
          <Select value={f.cores} onChange={(e) => setF({ ...f, cores: e.target.value })}><option>Colorido</option><option>Preto</option></Select>
        </Field>
      </div>
    </Modal>
  );
};

const ImpressaoView = () => {
  const { state, set, toast, log } = useLC();
  const [imp, setImp] = React.useState('Epson WF-C5810');
  const [form, setForm] = React.useState(null);
  const [arquivo, setArquivo] = React.useState('');
  const profiles = state.printProfiles.filter((p) => p.imp === imp);
  const active = profiles.find((p) => p.ativo) || profiles[0];

  const imprimir = (p) => {
    set('printLog', (l) => [{ id: uid('PL'), data: TODAY, imp, perfil: p.nome, arquivo: arquivo || 'trabalho manual', status: 'ok' }, ...l]);
    log(`Impressão concluída: ${arquivo || 'trabalho'} (${p.nome})`);
    toast(`Imprimindo "${arquivo || 'trabalho'}" em ${imp}... ✓`);
  };

  return (
    <div>
      <div className="flex gap10 wrap no-print mb12">
        <span className="stat-pill"><Icon name="impressao" /> Impressoras Epson</span>
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Novo perfil</Btn>
      </div>

      <div className="flex gap8 wrap mb16 no-print">
        {EPSONS.map((e) => (
          <Chip key={e} active={imp === e} onClick={() => setImp(e)}><Icon name="impressao" size={14} /> {e}</Chip>
        ))}
      </div>

      <div className="grid cols-2 mb16">
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--info-soft), var(--card))' }}>
          <div className="flex gap10">
            <div style={{ width: 46, height: 46, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'var(--info)', color: '#fff' }}><Icon name="impressao" size={22} /></div>
            <div className="grow">
              <b className="font-display" style={{ fontSize: 17 }}>{imp}</b>
              <div className="tiny muted">cabeçotes ✓ · status: <Badge tone="ok">pronta</Badge></div>
            </div>
            <div className="tiny muted" style={{ textAlign: 'right' }}>tinta <Badge tone="warn">70%</Badge></div>
          </div>
        </div>
        <div className="card">
          <Field label="Arquivo para imprimir (simulação)">
            <div className="flex gap8">
              <Input value={arquivo} onChange={(e) => setArquivo(e.target.value)} placeholder="ex.: arte-final.pdf" />
              <Btn onClick={() => { if (active) { imprimir(active); setArquivo(''); } }}><Icon name="print" /></Btn>
            </div>
          </Field>
        </div>
      </div>

      <div className="grid cols-2 mb16">
        {profiles.map((p, i) => (
          <div key={p.id} className={`card hov ${active?.id === p.id ? '' : ''}`} style={{ cursor: 'pointer', borderColor: active?.id === p.id ? 'var(--info)' : undefined }} onClick={() => set('printProfiles', (a) => a.map((x) => ({ ...x, ativo: x.id === p.id })))}>
            <div className="flex gap8">
              {active?.id === p.id ? <Badge tone="info">em uso</Badge> : <Badge tone="nude">perfil</Badge>}
              <span className="grow" />
              <Btn sm className="no-print" onClick={(e) => { e.stopPropagation(); setForm(p); }}><Icon name="edit" size={13} /></Btn>
            </div>
            <b style={{ fontSize: 14 }}>{p.nome}</b>
            <div className="small mt8">
              <span className="badge nude">{p.papel}</span> <span className="badge teal">{p.qualidade}</span> <span className="badge gold">{p.duplaFace === 'Sim' ? 'frente/verso' : '1 face'}</span> <span className="badge coral">{p.cores}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <SectionHead title="Histórico de impressão" sub="últimas impressões">
          <Badge tone="nude">{state.printLog?.length || 0} jobs</Badge>
        </SectionHead>
        {state.printLog?.slice(0, 10).map((p) => (
          <div key={p.id} className="flex gap8 mb8" style={{ fontSize: 12.5 }}>
            <Icon name="print" size={14} style={{ color: 'var(--teal)' }} />
            <span className="grow"><b>{p.arquivo}</b> <span className="muted tiny">· {p.perfil}</span></span>
            <span className="muted tiny">{fmtDate(p.data)}</span>
            <Badge tone="ok">✓</Badge>
          </div>
        ))}
        {!state.printLog?.length ? <Empty emoji="🖨️" title="Nenhuma impressão registrada" sub="Os trabalhos aparecem aqui ao imprimir um perfil." /> : null}
      </div>

      {form ? <PrintForm imp={imp} initial={form.id ? form : null} onClose={() => setForm(null)} /> : null}
    </div>
  );
};