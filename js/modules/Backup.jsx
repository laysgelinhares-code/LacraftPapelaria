// ============================================================
// LA CRAFT OS — Backup
// ============================================================

const BackupView = () => {
  const { state, log } = useLC();
  const fileRef = React.useRef();
  const doExport = () => {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem('lacraft_os_state_v1') || 'null'); } catch (e) { }
    exportJSON(`lacraft-os-backup-${TODAY}.json`, raw || state);
    toast('Backup exportado com sucesso 🗂️');
    log('Exportou backup manual');
  };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result);
        if (!data.orders || !data.clients) throw new Error('inválido');
        localStorage.setItem('lacraft_os_state_v1', JSON.stringify(data));
        toast('Backup restaurado! Recarregando...', 'warn');
        setTimeout(() => location.reload(), 900);
      } catch (err) {
        toast('Arquivo de backup inválido', 'error');
      }
    };
    rd.readAsText(f);
    e.target.value = '';
  };
  return (
    <div>
      <div className="mb16">
        <h1 className="font-display" style={{ fontSize: 26 }}>Backup</h1>
        <div className="muted small">Exporte e restaure seus dados — em qualquer navegador.</div>
      </div>
      <div className="grid cols-2">
        <div className="card">
          <SectionHead title="Exportar backup" sub="arquivo .json completo">
            <Icon name="download" size={16} />
          </SectionHead>
          <p className="small muted" style={{ lineHeight: 1.7 }}>
            Baixa um arquivo com <b>todos</b> os dados atuais: pedidos, clientes, estoque, financeiro, agenda, marketing e árvore de artes.
          </p>
          <Btn variant="primary" onClick={doExport}><Icon name="download" size={15} /> Exportar agora</Btn>
        </div>
        <div className="card">
          <SectionHead title="Restaurar backup" sub="voltar de outro computador">
            <Icon name="upload" size={16} />
          </SectionHead>
          <p className="small muted" style={{ lineHeight: 1.7 }}>
            Escolha um arquivo .json exportado antes. Os dados atuais serão substituídos após a restauração.
          </p>
          <Btn onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" size={15} /> Selecionar arquivo...</Btn>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={onFile} aria-label="Selecionar arquivo de backup" />
        </div>
        <div className="card">
          <SectionHead title="Backup automático" sub="sempre ligado">
            <Icon name="shield" size={16} />
          </SectionHead>
          <p className="small muted" style={{ lineHeight: 1.7 }}>
            Tudo é salvo automaticamente no <b>localStorage</b> a cada alteração. Nada se perde enquanto você usar o mesmo navegador neste computador.
          </p>
        </div>
        <div className="card">
          <SectionHead title="Rotina de segurança" sub="recomendação">
            <Icon name="spark" size={16} />
          </SectionHead>
          <p className="small muted" style={{ lineHeight: 1.7 }}>
            Exporte um backup no fim de cada semana. Para migrar de máquina: exporte aqui, abra em outro navegador e restaure — tudo volta exatamente como estava.
          </p>
        </div>
      </div>
    </div>
  );
};