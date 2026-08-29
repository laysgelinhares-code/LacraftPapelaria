// ============================================================
// LA CRAFT OS — Relatórios
// ============================================================

const RelatoriosView = () => {
  const { state, toast } = useLC();
  const vendidos = state.orders.filter((o) => o.status !== 'orcamento');
  const pago = state.orders.filter((o) => o.status !== 'orcamento');
  const receita = pago.reduce((s, o) => s + o.total, 0);
  const ticket = pago.length ? receita / pago.length : 0;
  const atrasados = state.orders.filter((o) => o.status !== 'entregue' && o.prazo && o.prazo < TODAY).length;
  const entregues = state.orders.filter((o) => o.status === 'entregue').length;
  const prazoOk = entregues + atrasados > 0 ? Math.round((entregues / (entregues + atrasados)) * 100) : 100;
  const tempoMedio = (() => {
    const list = state.orders.filter((o) => o.status === 'entregue' && o.abertura && o.prazo).map((o) => (new Date(o.prazo + 'T12:00:00') - new Date(o.abertura + 'T12:00:00')) / 86400000);
    return list.length ? (list.reduce((s, x) => s + x, 0) / list.length).toFixed(1) : '—';
  })();

  const prodStats = {};
  vendidos.forEach((o) => o.items.forEach((i) => {
    prodStats[i.p] = prodStats[i.p] || { qtd: 0, rev: 0 };
    prodStats[i.p].qtd += i.qtd;
    prodStats[i.p].rev += i.valor;
  }));
  const prodRows = Object.entries(prodStats).map(([p, st]) => ({ p, ...st })).sort((a, b) => b.rev - a.rev);

  const clientStats = {};
  vendidos.forEach((o) => {
    clientStats[o.cliente] = clientStats[o.cliente] || { pedidos: 0, rev: 0 };
    clientStats[o.cliente].pedidos++;
    clientStats[o.cliente].rev += o.total;
  });
  const cliRows = Object.entries(clientStats).map(([id, st]) => ({ id, ...st })).sort((a, b) => b.rev - a.rev);

  const mesRows = {};
  state.tx.filter((t) => t.status === 'pago' && t.tipo === 'entrada').forEach((t) => {
    mesRows[t.data.slice(0, 7)] = (mesRows[t.data.slice(0, 7)] || 0) + t.valor;
  });

  const exportarProdutos = () => {
    exportCSV('relatorio-produtos.csv',
      ['Produto', 'Unidades', 'Receita (R$)'],
      prodRows.map((r) => [prodName(r.p), r.qtd, r.rev.toFixed(2)]));
    toast('CSV gerado 📄');
  };
  const exportarClientes = () => {
    exportCSV('relatorio-clientes.csv',
      ['Cliente', 'Pedidos', 'Receita (R$)'],
      cliRows.map((r) => [clientName(r.id), r.pedidos, r.rev.toFixed(2)]));
    toast('CSV gerado 📄');
  };
  const exportarMeses = () => {
    exportCSV('relatorio-mensal.csv', ['Mês', 'Receita (R$)'],
      Object.entries(mesRows).sort().map(([m, v]) => [`${monthName(m.slice(5, 7))} ${m.slice(0, 4)}`, v.toFixed(2)]));
    toast('CSV gerado 📄');
  };

  return (
    <div>
      <div className="print-title">La Craft OS — Relatórios</div>
      <div className="flex gap10 wrap no-print mb12">
        <Btn variant="primary" onClick={() => printPage()}><Icon name="print" /> Gerar PDF</Btn>
        <Btn onClick={exportarProdutos}><Icon name="download" /> Excel · Produtos</Btn>
        <Btn onClick={exportarClientes}><Icon name="download" /> Excel · Clientes</Btn>
        <Btn onClick={exportarMeses}><Icon name="download" /> Excel · Mensal</Btn>
      </div>

      <div className="grid cols-5 mb16 no-print">
        <div className="card"><div className="kpi-label">Receita total</div><div className="kpi-value" style={{ fontSize: 20 }}>{currency(receita)}</div></div>
        <div className="card"><div className="kpi-label">Ticket médio</div><div className="kpi-value" style={{ fontSize: 20 }}>{currency(ticket)}</div></div>
        <div className="card"><div className="kpi-label">Prazo cumprido</div><div className="kpi-value" style={{ fontSize: 20, color: prazoOk >= 80 ? 'var(--ok)' : 'var(--coral)' }}>{prazoOk}%</div></div>
        <div className="card"><div className="kpi-label">Tempo médio prod.</div><div className="kpi-value" style={{ fontSize: 20 }}>{tempoMedio}d</div></div>
        <div className="card"><div className="kpi-label">Entregues</div><div className="kpi-value" style={{ fontSize: 20 }}>{entregues}</div></div>
      </div>

      <div className="grid cols-2">
        <div className="card print-keep">
          <SectionHead title="Produtos mais vendidos" sub="por receita">
            <Btn sm className="no-print" onClick={exportarProdutos}><Icon name="download" size={13} /></Btn>
          </SectionHead>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="lc">
              <thead><tr><th>Produto</th><th>Un</th><th>Receita</th><th>%</th></tr></thead>
              <tbody>
                {prodRows.map((r, i) => (
                  <tr key={r.p}>
                    <td><b>{prodName(r.p)}</b></td>
                    <td>{r.qtd}</td>
                    <td>{currency(r.rev)}</td>
                    <td>
                      <div style={{ width: 70 }}><Progress value={(r.rev / (prodRows[0]?.rev || 1)) * 100} tone={i % 2 ? '' : 'gold'} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card print-keep">
          <SectionHead title="Recorrência de clientes" sub="quem mais pede">
            <Btn sm className="no-print" onClick={exportarClientes}><Icon name="download" size={13} /></Btn>
          </SectionHead>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="lc">
              <thead><tr><th>Cliente</th><th>Pedidos</th><th>Receita</th><th>Perfil</th></tr></thead>
              <tbody>
                {cliRows.map((r) => {
                  const c = clientById(r.id);
                  return (
                    <tr key={r.id}>
                      <td><b>{clientName(r.id)}</b></td>
                      <td>{r.pedidos}</td>
                      <td>{currency(r.rev)}</td>
                      <td><Badge tone={c?.papel === 'vip' ? 'gold' : c?.papel === 'recorrente' ? 'teal' : 'nude'}>{c?.papel || 'comum'}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid cols-2 mt16">
        <div className="card print-keep">
          <SectionHead title="Vendas por mês" sub="entradas recebidas">
            <Btn sm className="no-print" onClick={exportarMeses}><Icon name="download" size={13} /></Btn>
          </SectionHead>
          {Object.entries(mesRows).sort().map(([m, v]) => (
            <div key={m} className="flex gap8 mb8" style={{ fontSize: 13 }}>
              <span className="grow"><b>{monthName(m.slice(5, 7))}</b> {m.slice(0, 4)}</span>
              <Progress value={(v / Math.max(...Object.values(mesRows))) * 100} style={{ width: 140 }} />
              <b style={{ width: 90, textAlign: 'right' }}>{currency(v)}</b>
            </div>
          ))}
        </div>

        <div className="card print-keep">
          <SectionHead title="Origem das vendas" sub="canais" />
          <div className="flex gap16 no-print" style={{ justifyContent: 'center' }}>
            <Donut data={state.origem} label="100%" />
            <div style={{ display: 'grid', gap: 10, alignSelf: 'center' }}>
              {state.origem.map((o) => (
                <div key={o.label} className="flex gap8 small" style={{ fontWeight: 700 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: o.cor }} />{o.label}<b style={{ width: 40, textAlign: 'right' }}>{o.pct}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};