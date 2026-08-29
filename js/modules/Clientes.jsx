// ============================================================
// LA CRAFT OS — Clientes
// ============================================================

const initials = (n) => n.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
const PAPEL_TONE = { vip: 'gold', recorrente: 'teal', comum: 'nude' };

const ClientForm = ({ onSave, onClose, initial }) => {
  const [f, setF] = React.useState(initial || { nome: '', tel: '', instagram: '', aniversario: '', cidade: '', obs: '', papel: 'comum' });
  return (
    <Modal title={initial ? 'Editar cliente' : 'Nova cliente'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => onSave(f)}><Icon name="check" /> Salvar</Btn></>}>
      <div className="grid cols-2">
        <Field label="Nome completo"><Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="WhatsApp (com DDD)"><Input value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} placeholder="5511999999999" /></Field>
        <Field label="Instagram"><Input value={f.instagram} onChange={(e) => setF({ ...f, instagram: e.target.value })} placeholder="@usuario" /></Field>
        <Field label="Aniversário"><Input type="date" value={f.aniversario} onChange={(e) => setF({ ...f, aniversario: e.target.value })} /></Field>
        <Field label="Cidade"><Input value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} /></Field>
        <Field label="Perfil">
          <Select value={f.papel} onChange={(e) => setF({ ...f, papel: e.target.value })}>
            <option value="comum">Comum</option><option value="recorrente">Recorrente</option><option value="vip">VIP</option>
          </Select>
        </Field>
      </div>
      <Field label="Observações"><Textarea value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} /></Field>
    </Modal>
  );
};

const ClientDrawer = ({ c, onClose }) => {
  const { state, go } = useLC();
  const orders = state.orders.filter((o) => o.cliente === c.id && o.status !== 'orcamento');
  const total = orders.reduce((s, o) => s + o.total, 0);
  const favs = {};
  orders.forEach((o) => o.items.forEach((i) => { favs[i.p] = (favs[i.p] || 0) + i.qtd; }));
  const fav = Object.entries(favs).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const last = orders.sort((a, b) => (a.prazo > b.prazo ? -1 : 1))[0];
  const nextBirth = c.aniversario ? new Date(TODAY.slice(0, 4) + c.aniversario.slice(4) + 'T12:00:00') : null;

  return (
    <Drawer title={c.nome} subtitle={c.cidade} onClose={onClose}>
      <div className="flex gap12 mb16 wrap">
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 19 }}>{initials(c.nome)}</div>
        <div className="grow">
          <div className="flex gap8">
            <Badge tone={PAPEL_TONE[c.papel] || 'nude'}>{c.papel === 'vip' ? '⭐ VIP' : c.papel === 'recorrente' ? '🔄 Recorrente' : 'Cliente'}</Badge>
            {c.instagram ? <a className="badge info" style={{ textDecoration: 'none' }} href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"><Icon name="insta" size={11} /> {c.instagram}</a> : null}
          </div>
          <div className="muted tiny mt8"><Icon name="phone" size={12} /> {c.tel} {c.instagram}</div>
        </div>
        <a className="btn-wa" style={{ fontSize: 13, padding: '9px 14px' }} href={waLink(c.tel, `Olá ${c.nome.split(' ')[0]}! Tudo bem? Aqui é a La Craft 💌`)} target="_blank" rel="noreferrer"><Icon name="wa" size={15} /> Chamar no WhatsApp</a>
      </div>

      <div className="kv">
        <div><div className="k">Total gasto</div><div className="v">{currency(total)}</div></div>
        <div><div className="k">Pedidos</div><div className="v">{orders.length}</div></div>
        <div><div className="k">Last serviço</div><div className="v sm">{last ? fmtDate(last.prazo) : '—'}</div></div>
        <div><div className="k">Próx. aniversário</div><div className="v sm">{c.aniversario ? fmtDateFull(c.aniversario) : '—'}</div></div>
      </div>

      {fav.length ? (
        <div className="mt16">
          <SectionHead title="Produtos favoritos" sub="mais pedidos" />
          <div className="grid cols-2">
            {fav.map(([p, qtd]) => (
              <div key={p} className="list-row">
                <span className="badge teal"><Icon name="heart" size={12} /> {qtd}x</span>
                <b className="small">{state.products.find((x) => x.id === p)?.nome || p}</b>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt16">
        <SectionHead title="Histórico de pedidos" sub={`${orders.length} pedido(s)`}>
          <Btn sm onClick={() => { go('pedidos'); onClose(); }}>Ver kanban <Icon name="chevR" size={13} /></Btn>
        </SectionHead>
        <div style={{ display: 'grid', gap: 8 }}>
          {orders.slice(0, 6).map((o) => (
            <div key={o.id} className="list-row row-click" onClick={() => { go('pedidos'); onClose(); setTimeout(() => document.dispatchEvent(new CustomEvent('lc:openorder', { detail: { id: o.id } })), 300); }}>
              <b style={{ color: 'var(--teal-dark)', fontFamily: 'var(--font-display)' }}>{o.id}</b>
              <span className="grow tiny muted">{o.items.map((i) => prodName(i.p)).join(' · ')}</span>
              <b>{currency(o.total)}</b>
              <StatusBadge status={o.status} />
            </div>
          ))}
          {orders.length === 0 ? <Empty emoji="🛍️" title="Sem pedidos ainda" sub="Os pedidos desta cliente aparecerão aqui." /> : null}
        </div>
      </div>

      {c.obs ? (
        <div className="mt16 card" style={{ background: 'var(--gold-soft)' }}>
          <b className="small">📌 Observações</b><p className="small" style={{ margin: '6px 0 0' }}>{c.obs}</p>
        </div>
      ) : null}
    </Drawer>
  );
};

const ClientesView = () => {
  const { state, set, q, setQ, log, toast } = useLC();
  const [openId, setOpenId] = React.useState(null);
  const [form, setForm] = React.useState(null);

  React.useEffect(() => {
    const h = (e) => setOpenId(e.detail.id);
    window.addEventListener('lc:openclient', h);
    return () => window.removeEventListener('lc:openclient', h);
  }, []);

  const client = state.clients.find((c) => c.id === openId);
  const filt = state.clients.filter((c) => !q || (c.nome + ' ' + (c.cidade || '') + ' ' + (c.instagram || '') + ' ' + (c.tel || '')).toLowerCase().includes(q.toLowerCase().trim()));

  const save = (f) => {
    if (form) {
      set('clients', (a) => a.map((c) => (c.id === form.id ? { ...c, ...f } : c)));
      log(`Cliente atualizada: ${f.nome}`);
      toast('Cliente atualizada');
    } else {
      const id = uid('C');
      set('clients', (a) => [...a, { ...f, id }]);
      log(`Nova cliente cadastrada: ${f.nome}`);
      toast('Cliente cadastrada ✨');
    }
    setForm(null);
  };

  return (
    <div>
      <div className="flex gap10 wrap mb12 no-print">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente..." />
        <span className="grow" />
        <Btn variant="primary" onClick={() => setForm({})}><Icon name="plus" /> Nova cliente</Btn>
      </div>

      <div className="table-wrap">
        <table className="lc">
          <thead>
            <tr><th>Cliente</th><th>Papel social</th><th>Cidade</th><th>WhatsApp</th><th>Pedidos</th><th>Total gasto</th><th></th></tr>
          </thead>
          <tbody>
            {filt.map((c) => {
              const orders = state.orders.filter((o) => o.cliente === c.id && o.status !== 'orcamento');
              return (
                <tr key={c.id} className="row-click" onClick={() => setOpenId(c.id)}>
                  <td>
                    <div className="flex gap10">
                      <span className="avatar-sm" style={{ background: `hsl(${(c.nome.length * 37) % 360}, 55%, 62%)` }}>{initials(c.nome)}</span>
                      <div><b>{c.nome}</b><div className="tiny muted">{c.instagram || ''}</div></div>
                    </div>
                  </td>
                  <td><Badge tone={PAPEL_TONE[c.papel] || 'nude'}>{c.papel === 'vip' ? 'VIP' : c.papel === 'recorrente' ? 'Recorrente' : '—'}</Badge></td>
                  <td className="muted">{c.cidade || '—'}</td>
                  <td>
                    {c.tel ? <span className="tiny">{c.tel}</span> : '—'}
                  </td>
                  <td><b>{orders.length}</b></td>
                  <td><b>{currency(orders.reduce((s, o) => s + o.total, 0))}</b></td>
                  <td><a className="btn-wa" style={{ pointerEvents: 'auto' }} href={waLink(c.tel, `Olá ${c.nome.split(' ')[0]}! 💌`)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><Icon name="wa" size={12} /></a></td>
                </tr>
              );
            })}
            {filt.length === 0 ? (
              <tr><td colSpan={7}><Empty emoji="🔍" title="Nenhuma cliente encontrada" sub="Ajuste a busca ou cadastre uma nova cliente." /></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {client ? <ClientDrawer c={client} onClose={() => setOpenId(null)} /> : null}
      {form ? <ClientForm initial={form.id ? state.clients.find((c) => c.id === form.id) : null} onSave={save} onClose={() => setForm(null)} /> : null}
    </div>
  );
};