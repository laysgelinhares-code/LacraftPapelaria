// ============================================================
// LA CRAFT OS — Área Administrativa
// ============================================================

const UserForm = ({ onClose, initial }) => {
  const { set, toast } = useLC();
  const [f, setF] = React.useState(initial || { nome: '', papel: 'Atendimento', login: '', senha: '', cor: '#3F8288', acessos: [...DEFAULT_ACESSOS] });
  const isAdminRole = f.papel === 'Administradora';
  const toggleAcesso = (k) => {
    const cur = isAdminRole ? [] : (f.acessos || []);
    setF({ ...f, acessos: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] });
  };
  const save = () => {
    if (!f.nome) { toast('Preencha o nome', 'warn'); return; }
    if (!f.login) { toast('Preencha o login', 'warn'); return; }
    const next = {
      ...f,
      senha: f.senha ? f.senha : (initial ? initial.senha : 'lacraft'),
      acessos: isAdminRole ? '_all' : (f.acessos && f.acessos.length ? f.acessos : DEFAULT_ACESSOS),
    };
    if (initial) {
      set('users', (a) => a.map((u) => (u.id === initial.id ? { ...u, ...next } : u)));
      toast('Usuário atualizado');
    } else {
      set('users', (a) => [...a, { ...next, id: uid('U') }]);
      toast('Usuário criado ✨');
    }
    onClose();
  };
  return (
    <Modal title={initial ? 'Editar usuário' : 'Novo usuário'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Icon name="check" /> Salvar</Btn></>}>
      <div className="grid cols-2">
        <Field label="Nome"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="Login"><Input value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} placeholder="ex.: maria@lacraft" /></Field>
        <Field label="Senha" hint={initial ? 'deixe vazio para manter a atual' : 'padrão: lacraft'}>
          <Input type="password" value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} placeholder="••••••" />
        </Field>
        <Field label="Permissão">
          <Select value={f.papel} onChange={(e) => setF({ ...f, papel: e.target.value, acessos: e.target.value === 'Administradora' ? '_all' : (f.acessos === '_all' ? [...DEFAULT_ACESSOS] : f.acessos) })}>
            <option>Administradora</option><option>Produção</option><option>Atendimento</option><option>Financeiro</option>
          </Select>
        </Field>
      </div>
      <Field label="Cor"><Input type="color" value={f.cor} onChange={(e) => setF({ ...f, cor: e.target.value })} /></Field>
      <div className="mt12">
        <div className="flex gap10 mb8">
          <b className="small" style={{ flex: 1 }}>Módulos que este funcionário pode acessar</b>
          {isAdminRole ? <Badge tone="coral">acesso total</Badge> : <Btn sm onClick={() => setF({ ...f, acessos: ALL_MODULES.map((m) => m[0]) })}><Icon name="check" size={13} /> Liberar tudo</Btn>}
        </div>
        {isAdminRole ? (
          <div className="muted small">Administradora tem acesso a todas as áreas, incluindo a Área Administrativa.</div>
        ) : (
          <div className="flex gap8 wrap">
            {ALL_MODULES.map(([k, label]) => {
              const on = (f.acessos || []).includes(k);
              return <Chip key={k} active={on} onClick={() => toggleAcesso(k)}>{`${on ? '✓ ' : ''}${label}`}</Chip>;
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

const AdminView = () => {
  const { state, set, toast, log, session, user } = useLC();
  const [form, setForm] = React.useState(null);
  const [tip, setTip] = React.useState('usuarios');

  const backup = () => {
    exportJSON(`lacraft-os-backup-${TODAY}.json`, {
      versao: '2.0', data: TODAY, ...state,
    });
    toast('Backup exportado (arquivo JSON) 📦');
    log('Backup manual exportado');
  };

  const restore = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        const allowed = ['orders', 'clients', 'products', 'stock', 'tx', 'costs', 'metas', 'users', 'customPrices', 'planner', 'legendas', 'reels', 'arts', 'diary', 'ideas'];
        const clean = {};
        allowed.forEach((k) => { if (obj[k]) clean[k] = obj[k]; });
        Object.keys(clean).forEach((k) => set(k, clean[k]));
        toast('Backup restaurado com sucesso ✅');
        log('Backup restaurado no sistema');
      } catch (e) { toast('Arquivo inválido', 'error'); }
    };
    reader.readAsText(file);
  };

  const removeUser = (u) => {
    if (u.id === session) { toast('Você não pode remover a si mesma', 'warn'); return; }
    const admins = state.users.filter((x) => x.papel === 'Administradora');
    if (u.papel === 'Administradora' && admins.length <= 1) { toast('Precisa de pelo menos uma administradora', 'warn'); return; }
    if (window.confirm(`Remover ${u.nome} do sistema? Essa ação não pode ser desfeita.`)) {
      set('users', (a) => a.filter((x) => x.id !== u.id));
      toast(`${u.nome} removida da equipe`);
      log(`Usuária removida: ${u.nome}`);
    }
  };

  const PERM_TONE = { Administradora: 'coral', Produção: 'teal', Atendimento: 'gold', Financeiro: 'info' };

  return (
    <div>
      <div className="grid cols-4 mb16">
        <div className="card"><div className="kpi-label">Pedidos ativos</div><div className="kpi-value" style={{ fontSize: 20 }}>{state.orders.filter((o) => o.status !== 'entregue').length}</div></div>
        <div className="card"><div className="kpi-label">Clientes</div><div className="kpi-value" style={{ fontSize: 20 }}>{state.clients.length}</div></div>
        <div className="card"><div className="kpi-label">Produtos</div><div className="kpi-value" style={{ fontSize: 20 }}>{state.products.length}</div></div>
        <div className="card"><div className="kpi-label">Insumos</div><div className="kpi-value" style={{ fontSize: 20 }}>{state.stock.length}</div></div>
      </div>

      <div className="tabs no-print">
        <button className={`tab ${tip === 'usuarios' ? 'active' : ''}`} onClick={() => setTip('usuarios')}>Equipe</button>
        <button className={`tab ${tip === 'atividades' ? 'active' : ''}`} onClick={() => setTip('atividades')}>Registro de atividades</button>
        <button className={`tab ${tip === 'backup' ? 'active' : ''}`} onClick={() => setTip('backup')}>Backup & restore</button>
      </div>

      {tip === 'usuarios' ? (
        <div>
          <div className="flex no-print mb12"><span className="grow" /><Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Novo usuário</Btn></div>
          <div className="table-wrap">
            <table className="lc">
              <thead><tr><th>Usuário</th><th>Login</th><th>Permissão</th><th>Senha</th><th>Acessos</th><th></th></tr></thead>
              <tbody>
                {state.users.map((u) => (
                  <tr key={u.id}>
                    <td><div className="flex gap10"><span className="avatar-sm" style={{ background: u.cor }}>{initials(u.nome)}</span><b>{u.nome}</b>{u.id === session ? <Badge tone="teal">você</Badge> : null}</div></td>
                    <td className="muted">{u.login}</td>
                    <td><Badge tone={PERM_TONE[u.papel] || 'nude'}>{u.papel}</Badge></td>
                    <td className="muted tiny">{u.id === session ? '••••••' : '(configurar)'}</td>
                    <td className="muted tiny">{u.acessos === '_all' ? 'todas as áreas' : `${(u.acessos || []).length} módulos`}</td>
                    <td className="no-print" style={{ whiteSpace: 'nowrap' }}>
                      <Btn sm onClick={() => setForm(u)}><Icon name="edit" size={13} /></Btn>
                      <Btn sm onClick={() => removeUser(u)} title="Remover usuário"><Icon name="trash" size={13} /></Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="muted tiny mt8">Clique no lápis para editar (nome, senha e acessos). "você" é a sessão atual.</div>
        </div>
      ) : null}

      {tip === 'atividades' ? (
        <div className="card">
          <SectionHead title="Registro de atividades" sub="tudo que acontece no sistema">
            <Badge tone="nude">{state.activity.length} eventos</Badge>
          </SectionHead>
          <div className="timeline">
            {state.activity.slice(0, 30).map((a) => (
              <div key={a.id} className="tl-item">
                <div className="tt">{a.msg}</div>
                <div className="tsub">{fmtDateFull(a.data.slice(0, 10))} {a.data.slice(11, 16)} · {a.user}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tip === 'backup' ? (
        <div className="grid cols-2">
          <div className="card">
            <SectionHead title="Backup" sub="seus dados em JSON" />
            <p className="small muted">O La Craft OS salva automaticamente tudo no seu navegador (localStorage). Faça backups periódicos para manter segurança.</p>
            <Btn variant="primary" onClick={backup}><Icon name="download" size={15} /> Exportar backup</Btn>
            <div className="kv mt16">
              <div><div className="k">Última cópia</div><div className="v sm">{fmtDateFull(TODAY)}</div></div>
              <div><div className="k">Autosave</div><div className="v sm">ativo ✅</div></div>
            </div>
          </div>
          <div className="card">
            <SectionHead title="Restaurar" sub="importe um backup anterior" />
            <label className="btn" style={{ cursor: 'pointer' }}>
              <Icon name="download" size={15} /> Escolher arquivo .json
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) restore(e.target.files[0]); e.target.value = ''; }} />
            </label>
            <div className="alert-banner mt12" style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)', color: 'var(--warn)' }}>
              <Icon name="alert" /> Restaurar substitui os dados atuais pelos do arquivo.
            </div>
          </div>
        </div>
      ) : null}

      {form ? <UserForm initial={form.id ? form : null} onClose={() => setForm(null)} /> : null}
    </div>
  );
};