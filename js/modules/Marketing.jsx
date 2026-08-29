// ============================================================
// LA CRAFT OS — Marketing
// ============================================================

const STATUS_MARK = {
  feito: ['ok', 'feito'], agendado: ['info', 'agendado'], ideia: ['gold', 'ideia'], rascunho: ['nude', 'rascunho'],
};

const MarketingView = () => {
  const { state, set, log, toast } = useLC();
  const [tab, setTab] = React.useState('calendario');
  const [novaData, setNovaData] = React.useState({ data: '2026-09-08', nome: '', cor: 'coral' });
  const [novaPost, setNovaPost] = React.useState({ semana: '', tema: '', tipo: 'Reel', status: 'ideia' });
  const [legenda, setLegenda] = React.useState('');
  const [reel, setReel] = React.useState('');
  const [copied, setCopied] = React.useState(null);

  const addData = () => {
    if (!novaData.nome) { toast('Nome da data', 'warn'); return; }
    set('comemorativas', (a) => [...a, { data: novaData.data, nome: novaData.nome, cor: novaData.cor }]);
    log(`Nova data comemorativa: ${novaData.nome}`);
    toast('Data adicionada ao calendário 🎉');
    setNovaData({ data: '2026-09-08', nome: '', cor: 'coral' });
  };
  const addPost = () => {
    if (!novaPost.tema) { toast('Informe o tema', 'warn'); return; }
    set('planner', (a) => [...a, { id: uid('U'), ...novaPost }]);
    toast('Post planejado');
    setNovaPost({ semana: '', tema: '', tipo: 'Reel', status: 'ideia' });
  };

  const copy = (t, i) => { navigator.clipboard.writeText(t).then(() => { setCopied(i); setTimeout(() => setCopied(null), 1500); toast('Legenda copiada 📋'); }); };

  return (
    <div>
      <div className="grid cols-4 mb16 no-print">
        <div className="card"><div className="kpi-label">Seguidores</div><div className="kpi-value" style={{ fontSize: 20 }}>8.4k<span className="trend-up" style={{ fontSize: 12 }}> +4%</span></div></div>
        <div className="card"><div className="kpi-label">Alcance mensal</div><div className="kpi-value" style={{ fontSize: 20 }}>21k</div></div>
        <div className="card"><div className="kpi-label">Salvamentos</div><div className="kpi-value" style={{ fontSize: 20 }}>1.2k</div></div>
        <div className="card"><div className="kpi-label">Resposta em DM</div><div className="kpi-value" style={{ fontSize: 20 }}>96%</div></div>
      </div>

      <div className="tabs no-print">
        <button className={`tab ${tab === 'calendario' ? 'active' : ''}`} onClick={() => setTab('calendario')}>Calendário</button>
        <button className={`tab ${tab === 'planner' ? 'active' : ''}`} onClick={() => setTab('planner')}>Planner Instagram</button>
        <button className={`tab ${tab === 'legendas' ? 'active' : ''}`} onClick={() => setTab('legendas')}>Legendas</button>
        <button className={`tab ${tab === 'reels' ? 'active' : ''}`} onClick={() => setTab('reels')}>Ideias de Reels</button>
      </div>

      {tab === 'calendario' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Datas comemorativas" sub="alimente o marketing" />
            {state.comemorativas.slice().sort((a, b) => (a.data > b.data ? 1 : -1)).map((c, i) => (
              <div key={i} className="flex gap8 mb8" style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
                <span className={`badge ev-${c.cor}`}>🎀</span>
                <b className="grow small">{c.nome}</b>
                <span className="muted tiny">{fmtDateFull(c.data)}</span>
                <Btn sm onClick={() => set('comemorativas', (a) => a.filter((x) => x !== c))}><Icon name="trash" size={12} /></Btn>
              </div>
            ))}
            <div className="mt12" style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
              <div className="flex gap8 mb8">
                <Input type="date" style={{ width: 150 }} value={novaData.data} onChange={(e) => setNovaData({ ...novaData, data: e.target.value })} />
                <Input placeholder="Nome da data (ex.: Páscoa)" value={novaData.nome} onChange={(e) => setNovaData({ ...novaData, nome: e.target.value })} />
              </div>
              <div className="flex gap8">
                <Select value={novaData.cor} style={{ width: 130 }} onChange={(e) => setNovaData({ ...novaData, cor: e.target.value })}>
                  <option value="coral">coral</option><option value="teal">teal</option><option value="gold">gold</option><option value="ok">verde</option>
                </Select>
                <Btn sm variant="primary" onClick={addData}><Icon name="plus" size={13} /> Adicionar</Btn>
              </div>
            </div>
          </div>
          <div className="card">
            <SectionHead title="Sugestões de conteúdo" sub="prontas para usar" />
            {[
              { ic: '📚', t: 'Back to school', d: 'Combo 3 cadernos com desconto' },
              { ic: '🧘', t: 'Setembro Amarelo', d: 'Pauta de cuidado: pausas e autocuidado' },
              { ic: '🎬', t: 'Reel processo', d: 'Timelapse da furação e wire-o' },
              { ic: '💬', t: 'Prova social', d: 'Relembre depoimentos com fotos reais' },
              { ic: '🎂', t: 'Dia das Crianças', d: 'Topos de bolo e lembrancinhas' },
            ].map((s, i) => (
              <div key={i} className="list-row mb8">
                <span style={{ fontSize: 18 }}>{s.ic}</span>
                <div className="grow"><b className="small">{s.t}</b><div className="tiny muted">{s.d}</div></div>
                <Btn sm onClick={() => { setTab('planner'); toast('Adicione no planner!'); }}><Icon name="plus" size={13} /></Btn>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'planner' ? (
        <div>
          <div className="grid cols-3 mb12">
            <div style={{ gridColumn: '2 / 3' }} className="card">
              <div className="flex gap8">
                <Input placeholder="Semana (ex: 01–07 out)" value={novaPost.semana} style={{ width: 150 }} onChange={(e) => setNovaPost({ ...novaPost, semana: e.target.value })} />
                <Input placeholder="Tema / ação" value={novaPost.tema} onChange={(e) => setNovaPost({ ...novaPost, tema: e.target.value })} />
                <Select style={{ width: 120 }} value={novaPost.tipo} onChange={(e) => setNovaPost({ ...novaPost, tipo: e.target.value })}>
                  <option>Reel</option><option>Carrossel</option><option>Stories</option><option>Feed</option>
                </Select>
                <Btn variant="primary" onClick={addPost}><Icon name="plus" /></Btn>
              </div>
            </div>
          </div>
          <div className="grid cols-3">
            {state.planner.map((p) => (
              <div key={p.id} className="card">
                <div className="flex gap8 mb8">
                  <Badge tone={STATUS_MARK[p.status][0]}>{STATUS_MARK[p.status][1]}</Badge>
                  <span className="badge nude">{p.tipo}</span>
                  <span className="grow" />
                  <Btn sm onClick={() => set('planner', (a) => a.map((x) => (x.id === p.id ? { ...x, status: { feito: 'agendado', agendado: 'ideia', ideia: 'feito' }[x.status] } : x)))}>alterar</Btn>
                </div>
                <b>{p.tema}</b>
                <div className="tiny muted mt8">semana: {p.semana}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'legendas' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Banco de legendas" sub="copie com um clique" />
            {state.legendas.map((l, i) => (
              <div key={i} className="card mb8" style={{ background: 'var(--bg-soft)' }}>
                <p className="small" style={{ margin: 0 }}>{l}</p>
                <div className="flex gap8 mt8">
                  <Btn sm variant="primary" onClick={() => copy(l, i)}><Icon name="copy" size={13} /> {copied === i ? 'Copiada!' : 'Copiar'}</Btn>
                  <Btn sm onClick={() => set('legendas', (a) => a.filter((x, k) => k !== i))}><Icon name="trash" size={13} /></Btn>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <SectionHead title="Nova legenda" />
            <Textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} placeholder="Escreva sua legenda do post..." />
            <div className="flex gap8 mt8">
              <Btn variant="primary" onClick={() => { if (!legenda) { toast('Escreva a legenda', 'warn'); return; } set('legendas', (a) => [legenda, ...a]); setLegenda(''); toast('Legenda salva ✍️'); }}><Icon name="check" size={14} /> Salvar no banco</Btn>
              <Btn onClick={() => copy(legenda, 'nova')}><Icon name="copy" size={14} /></Btn>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'reels' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Ideias de Reels" sub="biblioteca criativa" />
            {state.reels.map((r, i) => (
              <div key={i} className="list-row mb8">
                <span style={{ fontSize: 17 }}>🎬</span>
                <span className="grow small"><b>{r}</b></span>
                <Btn sm onClick={() => { set('reels', (a) => a.filter((x, k) => k !== i)); toast('Ideia removida'); }}><Icon name="trash" size={13} /></Btn>
              </div>
            ))}
          </div>
          <div className="card">
            <SectionHead title="Adicionar ideia" />
            <Textarea value={reel} onChange={(e) => setReel(e.target.value)} placeholder="Nova ideia de Reel..." />
            <div className="mt8"><Btn variant="primary" onClick={() => { if (!reel) { toast('Escreva a ideia', 'warn'); return; } set('reels', (a) => [reel, ...a]); setReel(''); toast('Ideia adicionada 🎬'); }}><Icon name="plus" size={14} /> Salvar</Btn></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};