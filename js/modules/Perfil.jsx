// ============================================================
// LA CRAFT OS — Perfil
// ============================================================

const PerfilView = () => {
  const { state, set, toast, user } = useLC();
  const [ns, setNs] = React.useState('');
  const me = user || state.users[0] || { id: 'U01', nome: 'Lays Gonçalves', papel: 'Administradora', cor: '#1D5C63', login: 'lays@lacraft' };
  const initials = me.nome.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const entregues = state.orders.filter((o) => o.status === 'entregue').length;
  const andamento = state.orders.filter((o) => o.status !== 'entregue').length;
  const orcamentos = state.orders.filter((o) => o.status === 'orcamento').length;
  const mudarSenha = () => {
    if (!ns) { toast('Digite a nova senha', 'warn'); return; }
    set('users', (a) => a.map((u) => (u.id === me.id ? { ...u, senha: ns } : u)));
    toast('Senha alterada com sucesso 🔒');
    setNs('');
  };
  return (
    <div>
      <div className="mb16">
        <h1 className="font-display" style={{ fontSize: 26 }}>Perfil</h1>
        <div className="muted small">Sua identidade na La Craft OS.</div>
      </div>
      <div className="grid cols-2">
        <div className="card" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div className="avatar" style={{ width: 74, height: 74, fontSize: 26, background: me.cor || 'linear-gradient(135deg, var(--teal), var(--teal-dark))' }}>{initials}</div>
          <div>
            <h3 className="font-display" style={{ fontSize: 22 }}>{me.nome}</h3>
            <div className="muted small">{me.papel}</div>
            <div className="mt8"><Badge tone="teal">{me.login}</Badge></div>
          </div>
        </div>
        <div className="card">
          <SectionHead title="Resumo" sub="números da loja">
            <Icon name="spark" size={16} />
          </SectionHead>
          <div className="kv">
            <div><div className="k">Pedidos entregues</div><div className="v">{entregues}</div></div>
            <div><div className="k">Em andamento</div><div className="v">{andamento}</div></div>
            <div><div className="k">Orçamentos abertos</div><div className="v">{orcamentos}</div></div>
            <div><div className="k">Equipe</div><div className="v">{state.users.length}</div></div>
          </div>
        </div>
        <div className="card">
          <SectionHead title="Segurança" sub="senha de acesso ao sistema">
            <Icon name="lock" size={16} />
          </SectionHead>
          <div className="flex gap10">
            <Input type="password" value={ns} onChange={(e) => setNs(e.target.value)} placeholder="Nova senha" aria-label="Nova senha" />
            <Btn variant="primary" onClick={mudarSenha}><Icon name="check" /> Salvar</Btn>
          </div>
          <div className="muted tiny mt12">A senha é usada na tela de login. Só você pode alterar a sua.</div>
        </div>
        <div className="card">
          <SectionHead title="Meu acesso" sub="o que estou liberado a ver">
            <Icon name="shield" size={16} />
          </SectionHead>
          <div className="flex gap8 wrap">
            {me.acessos === '_all' ? <Badge tone="coral">todas as áreas (administradora)</Badge> : (me.acessos || []).map((k) => (
              <Badge key={k} tone="nude">{MODULES.find((m) => m.k === k) ? MODULES.find((m) => m.k === k).label : k}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};