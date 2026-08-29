// ============================================================
// LA CRAFT OS — Configurações
// ============================================================

const ConfiguracoesView = () => {
  const { state, set, theme, toggleTheme, zeroOperational } = useLC();
  const cfg = state.config || {};
  const setFlag = (k, v) => set('config', { ...(state.config || {}), [k]: v });
  const reset = () => {
    if (window.confirm('Restaurar os dados originais? Todos os dados atuais (pedidos, clientes, estoque, financeiro...) serão apagados.')) {
      localStorage.removeItem('lacraft_os_state_v1');
      location.reload();
    }
  };
  const zero = () => {
    if (window.confirm(
      'Zerar a empresa para começar do zero?\n\n' +
      'SERÁ APAGADO: clientes, pedidos, financeiro, agenda e diário, e logs de atividade.\n' +
      'SERÁ MANTIDO: catálogo de produtos, estoque, modos de impressão/corte, marketing, artes, custos, metas e configurações.\n\n' +
      'Para desfazer, faça um Backup antes.'
    )) {
      zeroOperational();
    }
  };
  return (
    <div>
      <div className="mb16">
        <h1 className="font-display" style={{ fontSize: 26 }}>Configurações</h1>
        <div className="muted small">Personalize a La Craft OS.</div>
      </div>
      <div className="grid cols-2">
        <div className="card">
          <SectionHead title="Aparência" sub="tema do sistema">
            <Badge tone="teal">{theme === 'light' ? 'Claro' : 'Escuro'}</Badge>
          </SectionHead>
          <div className="flex gap10 wrap">
            <Btn className={theme === 'light' ? 'primary' : ''} onClick={() => { if (theme !== 'light') toggleTheme(); }}><Icon name="sun" size={15} /> Claro</Btn>
            <Btn className={theme === 'dark' ? 'primary' : ''} onClick={() => { if (theme !== 'dark') toggleTheme(); }}><Icon name="moon" size={15} /> Escuro</Btn>
          </div>
        </div>
        <div className="card">
          <SectionHead title="Lembretes" sub="avisos e notificações" />
          <div className="flex gap10 wrap">
            <Chip className={cfg.lembretes === false ? '' : 'active'} onClick={() => setFlag('lembretes', cfg.lembretes === false)}>Aniversários</Chip>
            <Chip className={cfg.estoqueBaixo === false ? '' : 'active'} onClick={() => setFlag('estoqueBaixo', cfg.estoqueBaixo === false)}>Estoque baixo</Chip>
            <Chip className={cfg.pagamentos === false ? '' : 'active'} onClick={() => setFlag('pagamentos', cfg.pagamentos === false)}>Pagamentos pendentes</Chip>
          </div>
          <div className="muted tiny mt12">Alterações ficam lembradas neste navegador.</div>
        </div>
        <div className="card">
          <SectionHead title="Dados" sub="guardados neste navegador" />
          <div className="small muted mb12" style={{ lineHeight: 1.7 }}>
            A La Craft OS salva automaticamente tudo no <b>localStorage</b>. O backup manual fica na aba <b>Backup</b>.
          </div>
          <div className="flex gap10 wrap">
            <Btn variant="danger" onClick={reset}><Icon name="trash" size={15} /> Restaurar dados originais</Btn>
            <Btn onClick={zero}><Icon name="spark" size={15} /> Zerar empresa (começar do zero)</Btn>
          </div>
          <div className="muted tiny mt12">Zerar mantém catálogo, estoque, modos, marketing, artes, custos e metas.</div>
        </div>
        <div className="card">
          <SectionHead title="Sobre" sub="La Craft OS" />
          <div className="small" style={{ lineHeight: 1.7 }}>
            <b>La Craft OS v2.0</b><br />
            Sistema de gestão da <b>La Craft Papelaria Personalizada</b>.<br />
            Feito com carinho para Lays Gonçalves 💛
          </div>
        </div>
      </div>
    </div>
  );
};