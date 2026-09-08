// ============================================================
// LA CRAFT OS — Data layer: helpers + seed data
// (scripts load in order; top-level lets are shared globally)
// ============================================================

/* ---------------- helpers ---------------- */
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const currency = (v) => BRL.format(Number(v || 0));
const n = (s) => (parseFloat(String(s).replace(',', '.')) || 0);
let UID = 100;
const uid = (p) => `${p || ''}${Date.now().toString(36).slice(-5)}${(UID++).toString(36).toUpperCase()}`;
const TODAY = '2026-08-29';
const yearNow = 2026;
const todayISO = () => TODAY;
const iso = (d, m) => `${yearNow}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const fmtDate = (isoStr) => { if (!isoStr) return ''; const [y, m, d] = isoStr.split('-'); return `${d}/${m}`; };
const fmtDateFull = (isoStr) => { if (!isoStr) return ''; const [y, m, d] = isoStr.split('-'); return `${d}/${m}/${y}`; };
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const monthName = (m) => MONTHS[Number(m) - 1] || MONTHS[Number(m)];
const weekDay = (isoStr) => { const d = new Date(isoStr + 'T12:00:00'); return ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]; };
const pad = (x) => String(x).padStart(2, '0');
const daysInMonth = (m) => new Date(yearNow, m, 0).getDate();
const waLink = (phone, text) => `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
const fadeEmoji = (p) => p || '0';

/* ---------------- react context (needs React, loaded before this) ---------------- */
const LC = React.createContext(null);
const useLC = () => React.useContext(LC);
const clientById = (id) => (window.__clients || []).find((x) => x.id === id) || null;
const clientName = (id) => { const c = clientById(id); return c ? c.nome : 'Cliente'; };
const prodById = (pid) => (window.__products || []).find((p) => p.id === pid) || null;
const prodName = (pid) => (prodById(pid) || {}).nome || pid;

/* ---------------- statuses / workflow ---------------- */
const STATUSES = [
  { key: 'orcamento',    label: 'Orçamento',           color: '#C2A15E',  tone: 'gold' },
  { key: 'aguardando',   label: 'Aguard. pagamento',   color: '#CE8A2B',  tone: 'warn' },
  { key: 'pago',         label: 'Pago',                color: '#4E7FB0',  tone: 'info' },
  { key: 'producao',     label: 'Em produção',         color: '#3F8288',  tone: 'teal' },
  { key: 'impressao',    label: 'Impressão',           color: '#7A5FB8',  tone: 'info' },
  { key: 'corte',        label: 'Corte',               color: '#C07BA0',  tone: 'coral' },
  { key: 'encadernacao', label: 'Encadernação',        color: '#C46A6A',  tone: 'coral' },
  { key: 'acabamento',   label: 'Acabamento',          color: '#5E9E7E',  tone: 'ok' },
  { key: 'pronto',       label: 'Pronto',              color: '#C2A15E',  tone: 'gold' },
  { key: 'entregue',     label: 'Entregue',            color: '#5E9E7E',  tone: 'ok' },
];
const statusIdx = (key) => STATUSES.findIndex((s) => s.key === key);

const PRODUCT_STEPS = {
  'Agenda':            ['Impressão','Vinco','Corte','Laminação','Montagem da capa','Furação','Wire-o','Embalagem'],
  'Caderno':           ['Impressão','Vinco','Corte','Laminação','Papelão','Encadernação','Acabamento','Embalagem'],
  'Planner':           ['Impressão','Vinco','Corte','Laminação','Encadernação','Embalagem'],
  'Devocional':        ['Impressão','Vinco','Corte','Laminação','Encadernação','Embalagem'],
  'Caderneta':         ['Impressão','Vinco','Corte','Laminação','Encadernação','Embalagem'],
  'Cardápio':          ['Impressão','Corte','Plastificação','Vinco','Embalagem'],
  'Impressos':         ['Impressão','Corte','Vinco','Embalagem'],
  'Cartões':           ['Impressão','Corte','Vinco','Embalagem'],
  'Tags':              ['Impressão','Corte','Vinco','Embalagem'],
  'Etiquetas':         ['Impressão','Corte','Embalagem'],
  'Bloquinhos':        ['Impressão','Corte','Encadernação','Embalagem'],
  'Adesivos':          ['Impressão','Corte','Acabamento','Embalagem'],
  'Topo de bolo':      ['Impressão','Corte','Montagem','Embalagem'],
  'Lembrancinhas':     ['Impressão','Corte','Montagem','Embalagem'],
};
const DEFAULT_STEPS = ['Impressão','Corte','Acabamento','Embalagem'];

/* ---------------- catalog categories ---------------- */
const CATEGORIAS = [
  ['agenda', 'Agendas'], ['caderno', 'Cadernos'], ['devocional', 'Devocionais'],
  ['planner', 'Planner'], ['caderneta', 'Cadernetas'], ['bloquinho', 'Bloquinhos'],
  ['tag', 'Tags'], ['cartao', 'Cartões'], ['etiqueta', 'Etiquetas'],
  ['lembranca', 'Lembrancinhas'], ['topo', 'Topos de bolo'], ['encadernacao', 'Encadernação'],
  ['impresso', 'Impressos'], ['empresa', 'Papelaria p/ Empresas'],
];
const EMOJI_BY_CAT = {
  agenda: '📅', caderno: '📓', devocional: '📖', planner: '🗓️', caderneta: '💉',
  bloquinho: '📝', tag: '🏷️', cartao: '💌', etiqueta: '🔖', lembranca: '🎁',
  topo: '🎂', encadernacao: '🔗', impresso: '🖨️', empresa: '💼',
};

/* ---------------- stock (insumos) seed ---------------- */
const SEED_STOCK = [
  { id: 'S01', nome: 'Papel Offset 75g',  cat: 'Papel', qtd: 520, un: 'folhas', min: 120, custo: 0.14, forn: 'Papelaria do Léo' },
  { id: 'S02', nome: 'Papel Offset 90g',  cat: 'Papel', qtd: 380, un: 'folhas', min: 100, custo: 0.18, forn: 'Papelaria do Léo' },
  { id: 'S03', nome: 'Papel Offset 120g', cat: 'Papel', qtd: 240, un: 'folhas', min: 80,  custo: 0.28, forn: 'Papelaria do Léo' },
  { id: 'S04', nome: 'Papel Offset 180g', cat: 'Papel', qtd: 96,  un: 'folhas', min: 40,  custo: 0.42, forn: 'Papelaria do Léo' },
  { id: 'S05', nome: 'Papel Couchê 300g', cat: 'Papel', qtd: 64,  un: 'folhas', min: 30,  custo: 1.30, forn: 'Papelaria do Léo' },
  { id: 'S06', nome: 'Papel Fotográfico', cat: 'Papel', qtd: 35,  un: 'folhas', min: 15,  custo: 1.10, forn: 'Papelaria do Léo' },
  { id: 'S07', nome: 'Papel Vegetal 180g',cat: 'Papel', qtd: 3,   un: 'folhas', min: 8,   custo: 2.40, forn: 'Papelaria do Léo' },
  { id: 'S08', nome: 'Papel Adesivo 115g',cat: 'Papel', qtd: 2,   un: 'folhas', min: 10,  custo: 2.90, forn: 'Papelaria do Léo' },
  { id: 'S09', nome: 'Pelicula p/ Laminação', cat: 'Material', qtd: 12, un: 'm', min: 6, custo: 3.40, forn: 'Casa das películas' },
  { id: 'S10', nome: 'Wire-o (mix)',       cat: 'Material', qtd: 8,   un: 'caixas', min: 4,  custo: 6.90, forn: 'Casa das películas' },
  { id: 'S11', nome: 'Papelão Holler 1mm', cat: 'Material', qtd: 26,  un: 'folhas', min: 10, custo: 4.80, forn: 'Casa das películas' },
  { id: 'S12', nome: 'BOPP adesivo',       cat: 'Material', qtd: 5,   un: 'm', min: 3,   custo: 5.20, forn: 'Casa das películas' },
  { id: 'S13', nome: 'Elástico 3mm',       cat: 'Material', qtd: 18,  un: 'm', min: 8,   custo: 1.60, forn: 'Casa das películas' },
  { id: 'S14', nome: 'Cantoneira "pastor"',cat: 'Material', qtd: 5,   un: 'pares', min: 6, custo: 1.20, forn: 'Casa das películas' },
  { id: 'S15', nome: 'Cola branca 90g',    cat: 'Material', qtd: 7,   un: 'un', min: 3,   custo: 8.50, forn: 'Casa das películas' },
  { id: 'S16', nome: 'Tinta Epson (L4260)',cat: 'Material', qtd: 2,   un: 'jogos', min: 1, custo: 68.00, forn: 'Lojas Ep' },
  { id: 'S17', nome: 'Caixas de papelão',  cat: 'Material', qtd: 22,  un: 'un', min: 8,   custo: 4.30, forn: 'Embalatex' },
  { id: 'S18', nome: 'Sacos plásticos',    cat: 'Material', qtd: 60,  un: 'un', min: 20,  custo: 0.35, forn: 'Embalatex' },
  { id: 'S19', nome: 'Fita washi',         cat: 'Material', qtd: 9,   un: 'rolos', min: 4,  custo: 6.70, forn: 'Embalatex' },
  { id: 'S20', nome: 'Fita Kraft',         cat: 'Material', qtd: 3,   un: 'rolos', min: 2,  custo: 5.90, forn: 'Embalatex' },
];

/* ---------------- products seed ---------------- */
const SEED_PRODUCTS = [
  { id: 'P01', categoria: 'agenda', nome: 'Agenda 2027 Personalizada', desc: 'Capa dura, papel 120g, wire-o e elástico.', valor: 89.90, tempo: 5, foto: '📅', materiais: [{ i: 'S01', q: 24 }, { i: 'S03', q: 40 }, { i: 'S11', q: 1 }, { i: 'S10', q: 1 }, { i: 'S13', q: 0.5 }, { i: 'S09', q: 1.2 }] },
  { id: 'P02', categoria: 'caderno', nome: 'Caderno A5 com Elástico', desc: 'Capa rígida, offset 90g, 5 matérias.', valor: 89.90, tempo: 4, foto: '📓', materiais: [{ i: 'S02', q: 35 }, { i: 'S11', q: 1 }, { i: 'S13', q: 0.4 }, { i: 'S09', q: 1.0 }] },
  { id: 'P03', categoria: 'caderno', nome: 'Caderno A5 Capa Dura', desc: 'Com bolso interno e elástico.', valor: 79.90, tempo: 4, foto: '📔', materiais: [{ i: 'S02', q: 35 }, { i: 'S11', q: 1 }, { i: 'S09', q: 1.0 }] },
  { id: 'P04', categoria: 'devocional', nome: 'Devocional Personalizado', desc: 'A5, 200 páginas, capa dura.', valor: 68.00, tempo: 3, foto: '📖', materiais: [{ i: 'S02', q: 50 }, { i: 'S11', q: 1 }, { i: 'S10', q: 1 }] },
  { id: 'P05', categoria: 'planner', nome: 'Planner Semanal', desc: 'Capa dura com elástico e bolso.', valor: 62.00, tempo: 3, foto: '🗓️', materiais: [{ i: 'S02', q: 30 }, { i: 'S11', q: 1 }, { i: 'S13', q: 0.4 }] },
  { id: 'P06', categoria: 'caderneta', nome: 'Caderneta de Vacina', desc: 'Capa dura, 10 folhas, bolso.', valor: 39.00, tempo: 3, foto: '💉', materiais: [{ i: 'S04', q: 12 }, { i: 'S11', q: 1 }] },
  { id: 'P07', categoria: 'cartao', nome: 'Cartões (50 un)', desc: 'Offset 90g, frente e verso.', valor: 85.50, tempo: 2, foto: '💌', materiais: [{ i: 'S02', q: 13 }] },
  { id: 'P08', categoria: 'cartao', nome: 'Cartões (100 un)', desc: 'Offset 90g, frente e verso.', valor: 132.00, tempo: 2, foto: '💌', materiais: [{ i: 'S02', q: 26 }] },
  { id: 'P09', categoria: 'tag', nome: 'Tags personalizadas', desc: 'p/ roupas, 100 un.', valor: 46.00, tempo: 2, foto: '🏷️', materiais: [{ i: 'S04', q: 10 }, { i: 'S13', q: 3 }] },
  { id: 'P10', categoria: 'etiqueta', nome: 'Etiquetas adesivas', desc: 'A4, recorte por fita.', valor: 38.00, tempo: 2, foto: '🔖', materiais: [{ i: 'S08', q: 4 }] },
  { id: 'P11', categoria: 'impresso', nome: 'Impressos A4 (folhas)', desc: 'Pack 50 folhas frente.', valor: 45.50, tempo: 1, foto: '🖨️', materiais: [{ i: 'S01', q: 50 }] },
  { id: 'P12', categoria: 'impresso', nome: 'Cardápios (5 un)', desc: 'Capa couché + bolso A5.', valor: 119.00, tempo: 3, foto: '🍽️', materiais: [{ i: 'S05', q: 6 }, { i: 'S03', q: 10 }, { i: 'S09', q: 1.5 }] },
  { id: 'P13', categoria: 'topo', nome: 'Topo de bolo Personalizado', desc: 'Acrílico-tinta ou papel, haste.', valor: 24.00, tempo: 1, foto: '🎂', materiais: [{ i: 'S04', q: 1 }, { i: 'S08', q: 1 }] },
  { id: 'P14', categoria: 'lembranca', nome: 'Lembrancinha Casamento', desc: 'Kit c/ 10 unidades.', valor: 58.90, tempo: 4, foto: '🎁', materiais: [{ i: 'S04', q: 8 }, { i: 'S19', q: 1 }, { i: 'S17', q: 1 }] },
  { id: 'P15', categoria: 'bloquinho', nome: 'Bloquinho de Recados', desc: '80 folhas, touro p/ wire ou espiral.', valor: 28.90, tempo: 2, foto: '📝', materiais: [{ i: 'S01', q: 16 }, { i: 'S10', q: 1 }] },
  { id: 'P16', categoria: 'lembranca', nome: 'Tag "Papelito" p/ Chá de Bebê', desc: '100 un, com elástico.', valor: 57.80, tempo: 2, foto: '🍼', materiais: [{ i: 'S04', q: 12 }, { i: 'S13', q: 3 }] },
  { id: 'P17', categoria: 'encadernacao', nome: 'Encadernação (serviço)', desc: 'Wire-o, espiral ou brochura rapida.', valor: 12.00, tempo: 1, foto: '🔗' },
  { id: 'P18', categoria: 'empresa', nome: 'Papelaria Empresarial', desc: 'Cartões, papel timbrado e tags c/ logo.', valor: 0.00, tempo: 5, foto: '💼' },
  { id: 'P19', categoria: 'caderno', nome: 'Caderno Divertidamente', desc: 'Personagens, capa dura, 40 folhas.', valor: 39.90, tempo: 3, foto: '😊', materiais: [{ i: 'S02', q: 20 }, { i: 'S11', q: 1 }] },
  { id: 'P20', categoria: 'agenda', nome: 'Agenda 2027 Básica', desc: 'Semana em vista, capa flexível.', valor: 79.00, tempo: 4, foto: '🗒️', materiais: [{ i: 'S02', q: 40 }, { i: 'S03', q: 30 }, { i: 'S10', q: 1 }] },
];

/* ---------------- clients seed ---------------- */
const SEED_CLIENTS = [
  { id: 'C01', nome: 'Bianca Ferreira',   tel: '5511988776655', instagram: '@biancaferreira',  aniversario: '2026-03-14', cidade: 'São Paulo', obs: 'Prefere tons de rosa.', papel: 'vip' },
  { id: 'C02', nome: 'Marina Souza',      tel: '5511987654321', instagram: '@marinasouza',     aniversario: '2026-05-10', cidade: 'São Paulo', obs: 'Costuma pedir em família.', papel: 'vip' },
  { id: 'C03', nome: 'Renata Alves',      tel: '5511998112233', instagram: '@renata_alves',    aniversario: '2026-09-03', cidade: 'Osasco',    obs: '', papel: 'comum' },
  { id: 'C04', nome: 'Camila Rocha',      tel: '5511985123456', instagram: '@camilinha.rocha', aniversario: '2026-08-02', cidade: 'Guarulhos', obs: 'Compra p/ a escola das filhas.', papel: 'recorrente' },
  { id: 'C05', nome: 'Juliana Prado',     tel: '5511983334455', instagram: '@juprado',         aniversario: '2026-11-20', cidade: 'São Paulo', obs: '', papel: 'comum' },
  { id: 'C06', nome: 'Fernanda Lima',     tel: '5511992020303', instagram: '@feh.lima',        aniversario: '2026-12-01', cidade: 'São Paulo', obs: 'Faz eventos de aniversário.', papel: 'recorrente' },
  { id: 'C07', nome: 'Patrícia Nunes',    tel: '5511981002003', instagram: '@patynunes',       aniversario: '2026-07-16', cidade: 'Barueri',   obs: 'Dona de brechó online.', papel: 'vip' },
  { id: 'C08', nome: 'Aline Costa',       tel: '5511985445566', instagram: '@alinecosta',      aniversario: '2026-04-08', cidade: 'São Paulo', obs: '', papel: 'recorrente' },
  { id: 'C09', nome: 'Débora Martins',    tel: '5511996147258', instagram: '@debmartins',      aniversario: '2026-02-22', cidade: 'Osasco', obs: '', papel: 'comum' },
  { id: 'C10', nome: 'Larissa Gomes',     tel: '5511999887766', instagram: '@larigomess',      aniversario: '2026-09-28', cidade: 'São Paulo', obs: 'Compra para a cafeteria.', papel: 'vip' },
  { id: 'C11', nome: 'Vanessa Teixeira',  tel: '5511984142526', instagram: '@vane.teixeira',   aniversario: '2026-06-15', cidade: 'São Paulo', obs: '', papel: 'comum' },
  { id: 'C12', nome: 'Ana Clara Lopes',   tel: '5511981231212', instagram: '@anaclara.art',    aniversario: '2026-10-29', cidade: 'Cotia',     obs: 'Estuda artes visuais.', papel: 'recorrente' },
  { id: 'C13', nome: 'Sofia Ribeiro',     tel: '5511993216543', instagram: '@sofiaribeiro',    aniversario: '2026-01-12', cidade: 'São Paulo', obs: '', papel: 'comum' },
  { id: 'C14', nome: 'Beatriz Castro',    tel: '5511987651122', instagram: '@bia.castro',      aniversario: '2026-08-30', cidade: 'Taboão',    obs: 'Bebe: Maria Alice.', papel: 'recorrente' },
  { id: 'C15', nome: 'Júlia Barros',      tel: '5511989987766', instagram: '@jubarros',        aniversario: '2026-09-12', cidade: 'São Paulo', obs: 'Loja de doces.', papel: 'comum' },
];

/* ---------------- orders seed ---------------- */
const SEED_ORDERS = [
  { id: 'LC-041', cliente: 'C01', items: [{ p: 'P01', qtd: 1, valor: 89.90 }], total: 89.90, status: 'orcamento', prioridade: 'normal', prazo: '2026-09-02', abertura: '2026-08-25', sinal: 0, metodo: '', responsavel: 'Lays', orig: 'Instagram', arte: [{ nome: 'agenda-bianca-final.png' }], notas: 'Cliente vai confirmar o modelo após verniz.', timer: { acc: 0, start: null } },
  { id: 'LC-042', cliente: 'C02', items: [{ p: 'P12', qtd: 1, valor: 119.00 }], total: 119.00, status: 'pronto', prioridade: 'alta', prazo: '2026-09-02', abertura: '2026-08-24', sinal: 119, metodo: 'Pix', responsavel: 'Lays', orig: 'WhatsApp', arte: [], notas: 'Entrega combinada na sexta.', timer: { acc: 5400, start: null } },
  { id: 'LC-043', cliente: 'C03', items: [{ p: 'P02', qtd: 2, valor: 179.80 }], total: 310.00, prioridade: 'alta', prazo: '2026-08-27', abertura: '2026-08-19', sinal: 310, metodo: 'Pix', status: 'producao', responsavel: 'Lays', orig: 'Instagram', arte: [{ nome: 'caderno-autoral.png' }, { nome: 'cliente-arte.jpeg' }], notas: 'Papel 120g a pedido. Preciso entregar antes do aniversário.', timer: { acc: 12400, start: null } },
  { id: 'LC-044', cliente: 'C04', items: [{ p: 'P03', qtd: 2, valor: 159.80 }], total: 298.00, prioridade: 'normal', prazo: '2026-08-28', abertura: '2026-08-18', sinal: 298, metodo: 'Cartão', status: 'producao', responsavel: 'Lays', orig: 'WhatsApp', arte: [{ nome: 'cadernos-filhas.pdf' }], notas: '2 cores diferentes.', timer: { acc: 3600, start: null } },
  { id: 'LC-045', cliente: 'C05', items: [{ p: 'P11', qtd: 1, valor: 45.50 }], total: 198.00, prioridade: 'normal', prazo: '2026-08-28', abertura: '2026-08-15', sinal: 198, metodo: 'Pix', status: 'entregue', responsavel: 'Lays', orig: 'Loja Física', arte: [], notas: 'Incluiu 3 arquivos de SEO no pacote.', timer: { acc: 1800, start: null } },
  { id: 'LC-046', cliente: 'C06', items: [{ p: 'P07', qtd: 1, valor: 85.50 }], total: 85.50, prioridade: 'alta', prazo: '2026-08-28', abertura: '2026-08-14', sinal: 85.5, metodo: 'Pix', status: 'entregue', responsavel: 'Lays', orig: 'Instagram', arte: [{ nome: 'cartoes-formandos.png' }], notas: 'Cartão p/ formatura do irmão.', timer: { acc: 7200, start: null } },
  { id: 'LC-047', cliente: 'C07', items: [{ p: 'P09', qtd: 1, valor: 46.00 }], total: 46.00, prioridade: 'normal', prazo: '2026-08-27', abertura: '2026-08-12', sinal: 46, metodo: 'Pix', status: 'entregue', responsavel: 'Ana', orig: 'Instagram', arte: [], notas: '', timer: { acc: 0, start: null } },
  { id: 'LC-048', cliente: 'C08', items: [{ p: 'P08', qtd: 1, valor: 132.00 }], total: 132.00, prioridade: 'normal', prazo: '2026-08-26', abertura: '2026-08-11', sinal: 132, metodo: 'Cartão', status: 'entregue', responsavel: 'Ana', orig: 'Shopee', arte: [{ nome: 'cartoes-marrom.pdf' }], notas: '', timer: { acc: 0, start: null } },
  { id: 'LC-049', cliente: 'C09', items: [{ p: 'P03', qtd: 1, valor: 79.90 }], total: 42.00, prioridade: 'alta', prazo: '2026-08-28', abertura: '2026-08-10', sinal: 42, metodo: 'Pix', status: 'producao', responsavel: 'Lays', orig: 'WhatsApp', arte: [{ nome: 'caderno-debora.png' }], notas: 'Desconto p/ data comemorativa.', timer: { acc: 900, start: null } },
  { id: 'LC-050', cliente: 'C10', items: [{ p: 'P16', qtd: 1, valor: 57.80 }], total: 57.80, prioridade: 'normal', prazo: '2026-08-27', abertura: '2026-08-09', sinal: 57.8, metodo: 'Shopee', status: 'entregue', responsavel: 'Ana', orig: 'Shopee', arte: [], notas: '', timer: { acc: 0, start: null } },
  { id: 'LC-051', cliente: 'C11', items: [{ p: 'P05', qtd: 1, valor: 62.00 }], total: 62.00, prioridade: 'normal', prazo: '2026-08-29', abertura: '2026-08-08', sinal: 62, metodo: 'Pix', status: 'entregue', responsavel: 'Lays', orig: 'Instagram', arte: [{ nome: 'planner-vanessa.png' }], notas: '', timer: { acc: 0, start: null } },
  { id: 'LC-052', cliente: 'C12', items: [{ p: 'P04', qtd: 1, valor: 68.00 }], total: 68.00, prioridade: 'normal', prazo: '2026-09-03', abertura: '2026-08-07', sinal: 0, metodo: '', status: 'orcamento', responsavel: 'Lays', orig: 'Instagram', arte: [], notas: 'Enviar prova digital.', timer: { acc: 0, start: null } },
  { id: 'LC-053', cliente: 'C13', items: [{ p: 'P16', qtd: 1, valor: 57.80 }], total: 24.00, prioridade: 'normal', prazo: '2026-09-03', abertura: '2026-08-26', sinal: 0, metodo: 'Pix', status: 'aguardando', responsavel: 'Bia', orig: 'WhatsApp', arte: [{ nome: 'tag-bebe.png' }], notas: 'Sinal 10 reais pendente.', timer: { acc: 0, start: null } },
  { id: 'LC-054', cliente: 'C14', items: [{ p: 'P06', qtd: 1, valor: 39.00 }], total: 39.00, prioridade: 'alta', prazo: '2026-09-04', abertura: '2026-08-26', sinal: 0, metodo: 'Pix', status: 'aguardando', responsavel: 'Bia', orig: 'Instagram', arte: [], notas: 'Entrega até o dia 4 (compromisso).', timer: { acc: 0, start: null } },
  { id: 'LC-055', cliente: 'C15', items: [{ p: 'P10', qtd: 2, valor: 76.00 }], total: 76.00, prioridade: 'normal', prazo: '2026-09-01', abertura: '2026-08-25', sinal: 76, metodo: 'Pix', status: 'impressao', responsavel: 'Ana', orig: 'WhatsApp', arte: [{ nome: 'etiquetas-doces.ai' }], notas: 'Rotular potes de doce.', timer: { acc: 1500, start: null } },
  { id: 'LC-056', cliente: 'C07', items: [{ p: 'P16', qtd: 1, valor: 57.80 }], total: 57.80, prioridade: 'alta', prazo: '2026-09-01', abertura: '2026-08-24', sinal: 57.8, metodo: 'Pix', status: 'corte', responsavel: 'Ana', orig: 'Instagram', arte: [], notas: 'Rush: brechó pediu p/ sábado.', timer: { acc: 2800, start: null } },
  { id: 'LC-057', cliente: 'C06', items: [{ p: 'P02', qtd: 1, valor: 89.90 }], total: 89.90, prioridade: 'normal', prazo: '2026-09-02', abertura: '2026-08-22', sinal: 89.9, metodo: 'Pix', status: 'encadernacao', responsavel: 'Lays', orig: 'WhatsApp', arte: [{ nome: 'caderno-florido.png' }], notas: '', timer: { acc: 6100, start: null } },
  { id: 'LC-058', cliente: 'C10', items: [{ p: 'P14', qtd: 2, valor: 117.80 }], total: 117.80, prioridade: 'normal', prazo: '2026-09-04', abertura: '2026-08-20', sinal: 117.8, metodo: 'Cartão', status: 'acabamento', responsavel: 'Ana', orig: 'Instagram', arte: [], notas: '', timer: { acc: 4400, start: null } },
];

/* ---------------- financial seed ---------------- */
const SEED_TX = [
  // entradas (agosto)
  { id: 'TX01', tipo: 'entrada', cat: 'Instagram',    meta: 'Pix',   valor: 240.00, data: '2026-08-03', desc: 'Venda Instagram', status: 'pago' },
  { id: 'TX02', tipo: 'entrada', cat: 'Mercado Pago', meta: 'MP',    valor: 890.00, data: '2026-08-01', desc: 'Pix Lays (repasse)', status: 'pago' },
  { id: 'TX03', tipo: 'entrada', cat: 'Mercado Pago', meta: 'MP',    valor: 395.00, data: '2026-08-05', desc: 'Venda MP', status: 'pago' },
  { id: 'TX04', tipo: 'entrada', cat: 'WhatsApp',     meta: 'Pix',   valor: 180.00, data: '2026-08-07', desc: 'Orçamento aprovado', status: 'pago' },
  { id: 'TX05', tipo: 'entrada', cat: 'Shopee',       meta: 'Shopee',valor: 154.00, data: '2026-08-10', desc: 'Repasse Shopee', status: 'pago' },
  { id: 'TX06', tipo: 'entrada', cat: 'Loja Física',  meta: 'Pix',   valor: 310.00, data: '2026-08-12', desc: 'Venda balcão', status: 'pago' },
  { id: 'TX07', tipo: 'entrada', cat: 'Mercado Pago', meta: 'MP',    valor: 420.00, data: '2026-08-14', desc: 'Venda MP', status: 'pago' },
  { id: 'TX08', tipo: 'entrada', cat: 'Instagram',    meta: 'Pix',   valor: 265.00, data: '2026-08-17', desc: 'DM Instagram', status: 'pago' },
  { id: 'TX09', tipo: 'entrada', cat: 'WhatsApp',     meta: 'Pix',   valor: 199.00, data: '2026-08-19', desc: 'Cliente recorrente', status: 'pago' },
  { id: 'TX10', tipo: 'entrada', cat: 'Evento',       meta: 'Pix',   valor: 1250.00, data: '2026-08-16', desc: 'Feira Papelaria', status: 'pago' },
  { id: 'TX11', tipo: 'entrada', cat: 'Mercado Pago', meta: 'MP',    valor: 388.00, data: '2026-08-21', desc: 'Venda MP', status: 'pago' },
  { id: 'TX12', tipo: 'entrada', cat: 'WhatsApp',     meta: 'Pix',   valor: 275.00, data: '2026-08-23', desc: 'Kit proposta', status: 'pago' },
  { id: 'TX13', tipo: 'entrada', cat: 'Shopee',       meta: 'Shopee',valor: 220.00, data: '2026-08-25', desc: 'Repasse Shopee', status: 'pago' },
  { id: 'TX14', tipo: 'entrada', cat: 'Cliente',      meta: 'Pix',   valor: 132.00, data: '2026-08-26', desc: 'LC-048 · Cartões', status: 'pago' },
  { id: 'TX15', tipo: 'entrada', cat: 'Cliente',      meta: 'Pix',   valor: 46.00,  data: '2026-08-27', desc: 'LC-047 · Tags', status: 'pago' },
  { id: 'TX16', tipo: 'entrada', cat: 'Cliente',      meta: 'Pix',   valor: 57.80,  data: '2026-08-27', desc: 'LC-050 · Papelito', status: 'pago' },
  { id: 'TX17', tipo: 'entrada', cat: 'Cliente',      meta: 'Pix',   valor: 62.00,  data: '2026-08-27', desc: 'LC-051 · Planner', status: 'pago' },
  { id: 'TX18', tipo: 'entrada', cat: 'Cliente',      meta: 'Pix',   valor: 198.00, data: '2026-08-28', desc: 'LC-045 · Impressos', status: 'pago' },
  { id: 'TX19', tipo: 'entrada', cat: 'Cliente',      meta: 'Pix',   valor: 85.50,  data: '2026-08-28', desc: 'LC-046 · Cartões', status: 'pago' },
  // saídas (agosto)
  { id: 'TX20', tipo: 'saida', cat: 'Material',    meta: 'Pix',   valor: 380.00, data: '2026-08-06', desc: 'Compra de papéis', status: 'pago' },
  { id: 'TX21', tipo: 'saida', cat: 'Taxas',       meta: 'Dedução',valor: 87.40, data: '2026-08-15', desc: 'Taxa Mercado Pago', status: 'pago' },
  { id: 'TX22', tipo: 'saida', cat: 'Taxas',       meta: 'Dedução',valor: 96.00, data: '2026-08-15', desc: 'Taxa Shopee', status: 'pago' },
  { id: 'TX23', tipo: 'saida', cat: 'Taxas',       meta: 'Dedução',valor: 45.00, data: '2026-08-15', desc: 'Taxa InfinitePay', status: 'pago' },
  { id: 'TX24', tipo: 'saida', cat: 'Energia',     meta: 'Boleto', valor: 210.00, data: '2026-08-10', desc: 'Conta de luz', status: 'pago' },
  { id: 'TX25', tipo: 'saida', cat: 'Material',    meta: 'Pix',    valor: 95.00, data: '2026-08-11', desc: 'Pelicula de laminação', status: 'pago' },
  { id: 'TX26', tipo: 'saida', cat: 'Tinta',       meta: 'Pix',    valor: 240.00, data: '2026-08-13', desc: 'Kit tinta Epson', status: 'pago' },
  { id: 'TX27', tipo: 'saida', cat: 'Embalagens',  meta: 'Pix',    valor: 130.00, data: '2026-08-18', desc: 'Caixas e sacolas', status: 'pago' },
  { id: 'TX28', tipo: 'saida', cat: 'Marketing',   meta: 'Pix',    valor: 90.00, data: '2026-08-20', desc: 'Impulsionamento Instagram', status: 'pago' },
  // pendentes
  { id: 'TX29', tipo: 'saida',  cat: 'Material',   meta: 'Boleto', valor: 380.00, data: '2026-09-05', desc: 'Fornecedor papel', status: 'pendente' },
  { id: 'TX30', tipo: 'saida',  cat: 'Energia',    meta: 'Boleto', valor: 210.00, data: '2026-09-10', desc: 'Conta de luz', status: 'pendente' },
];

const SEED_ORIGEM = [
  { label: 'Instagram',   pct: 38, cor: '#C07BA0' },
  { label: 'WhatsApp',    pct: 30, cor: '#3F8288' },
  { label: 'Shopee',      pct: 18, cor: '#CE8A2B' },
  { label: 'Loja Física', pct: 14, cor: '#5E9E7E' },
];
const SEED_MESES = [
  { m: '2026-03', valor: 3120 }, { m: '2026-04', valor: 3480 },
  { m: '2026-05', valor: 4210 }, { m: '2026-06', valor: 3960 },
  { m: '2026-07', valor: 5340 }, { m: '2026-08', valor: 6480 },
];

/* ---------------- operacional seeds ---------------- */
const SEED_PRINT = [
  { id: 'PR1', imp: 'Epson WF-C5810', nome: 'Padrão – frente e verso', papel: 'Offset 120g', qualidade: 'Alta', duplaFace: 'Sim', cores: 'Colorido' },
  { id: 'PR2', imp: 'Epson WF-C5810', nome: 'Economia',                papel: 'Offset 75g',  qualidade: 'Normal', duplaFace: 'Sim', cores: 'Colorido' },
  { id: 'PR3', imp: 'Epson L4260',    nome: 'Fotográfico',             papel: 'Fotográfico', qualidade: 'Alta', duplaFace: 'Não', cores: 'Colorido' },
  { id: 'PR4', imp: 'Epson L4260',    nome: 'Preto p/ provas',         papel: 'Offset 90g',  qualidade: 'Normal', duplaFace: 'Não', cores: 'Preto' },
];
const SEED_CUT = [
  { id: 'CU1', nome: 'Vegetal 180g',  lamina: 'Livro',   forca: 10, vel: 5, passadas: 2, obs: 'Corte limpo' },
  { id: 'CU2', nome: 'Couchê 300g',   lamina: 'Rato',    forca: 12, vel: 4, passadas: 3, obs: 'Aumentar pressão' },
  { id: 'CU3', nome: 'Adesivo 115g',  lamina: 'Livro',   forca: 8,  vel: 6, passadas: 1, obs: '' },
];

/* ---------------- marketing ---------------- */
const SEED_COMEMORATIVAS = [
  { data: '2026-09-07', nome: 'Independência do Brasil', cor: 'teal' },
  { data: '2026-09-10', nome: 'Setembro Amarelo', cor: 'coral' },
  { data: '2026-09-21', nome: 'Dia da Árvore', cor: 'ok' },
  { data: '2026-09-28', nome: 'Dia de São Miguel', cor: 'gold' },
  { data: '2026-10-12', nome: 'Dia das Crianças', cor: 'coral' },
  { data: '2026-10-15', nome: 'Dia do Professor', cor: 'teal' },
  { data: '2026-11-15', nome: 'Proclamação da República', cor: 'teal' },
  { data: '2026-12-01', nome: 'Natal', cor: 'coral' },
  { data: '2026-12-31', nome: 'Ano Novo', cor: 'gold' },
];
const SEED_PLANNER = [
  { id: 'U1', semana: '01–07 set', tema: 'Back to school / retorno',  tipo: 'Carrossel', status: 'feito' },
  { id: 'U2', semana: '08–14 set', tema: 'Setembro Amarelo – pauta sensível', tipo: 'Reel', status: 'agendado' },
  { id: 'U3', semana: '15–21 set', tema: 'Mostre o processo de produção',  tipo: 'Reel', status: 'ideia' },
  { id: 'U4', semana: '22–28 set', tema: 'Clientes favoritos + depoimentos', tipo: 'Carrossel', status: 'ideia' },
  { id: 'U5', semana: '29 set–05 out', tema: 'Dia das Crianças – lembrancinhas', tipo: 'Reel', status: 'ideia' },
  { id: 'U6', semana: '06–12 out', tema: 'Especial Dia das Crianças (stories)', tipo: 'Stories', status: 'ideia' },
];
const SEED_LEGENDAS = [
  'Cada comanda é feita com carinho, do corte ao último vinco 🤍 Você personaliza, a La Craft imprime.',
  'Por trás de cada caderno, uma história começando a ser escrita ✍️✨',
  'Papel que abraça! Encomendas para o mês já abertas no WhatsApp 💌',
  'Transformo sua ideia em detalhe impresso. Me chama na DM que eu te ajudo a escolher.',
  'Você imagina, desenha e eu dou vida. Cadernos autoralizados com muito afeto 🌸',
];
const SEED_REELS = [
  'Timelapse: da folha em branco ao caderno pronto',
  'Como escolher o papel certo para cada projeto',
  'Antes e depois: a evolução de um topo de bolo',
  'Você não vai acreditar nesse acabamento (wire-o)',
  'Encomendas de aniversário: o passo a passo',
  'Tour pela mini ateliê da La Craft',
];

/* ---------------- biblioteca de artes ---------------- */
const SEED_ARTS = [
  { id: 'A01', nome: 'Arte Agenda 2027 — Bianca', cat: 'Agenda', tipo: 'PNG', url: '', tags: 'agenda,capa,wire-o' },
  { id: 'A02', nome: 'Logo La Craft (fundo claro)', cat: 'Logo', tipo: 'PNG', url: '', tags: 'logo,brand' },
  { id: 'A03', nome: 'Vetor Floral delicado', cat: 'Decoração', tipo: 'AI', url: '', tags: 'floral,vector' },
  { id: 'A04', nome: 'Padrão art déco', cat: 'Decoração', tipo: 'SVG', url: '', tags: 'padrão,art,deco' },
  { id: 'A05', nome: 'Cartão de casamento (pré-pronto)', cat: 'Convites', tipo: 'PNG', url: '', tags: 'casamento,convite' },
  { id: 'A06', nome: 'Template Topo de Bolo', cat: 'Topos', tipo: 'PSD', url: '', tags: 'topo,bolo' },
  { id: 'A07', nome: 'Fontes: Chamomile + Lindseys', cat: 'Fonte', tipo: 'TTF', url: '', tags: 'fonte,tipografia' },
  { id: 'A08', nome: 'Arte Caderno Florido', cat: 'Caderno', tipo: 'PNG', url: '', tags: 'caderno,flor' },
];

/* ---------------- central da la craft ---------------- */
const SEED_DAIRY = [
  { id: 'D1', data: '2026-08-28', texto: 'Entreguei o pedido da Fernanda (50 cartões) e ela amou o acabamento fosco. Deixou depoimento p/ Instagram.', tempoMin: 120, foto: '', tags: 'cliente,fosco,portifolio' },
  { id: 'D2', data: '2026-08-27', texto: 'Testei laminação com película jateada no papel végétal: ficou incrível, mas preciso comprar mais película.', tempoMin: 60, foto: '', tags: 'teste,laminação' },
  { id: 'D3', data: '2026-08-26', texto: 'Dia focado em pré-produção: organizei a fila da semana e deixei os arquivos na aba de impressão prontos p/ quarta.', tempoMin: 90, foto: '', tags: 'organização,impressão' },
];
const SEED_IDEAS = [
  { id: 'I1', titulo: 'Caderno do Divertidamente personalizado', desc: 'Capa com cores dos personagens + elástico temático. Fazer post + caixinha de encomendas.', tags: 'caderno,best-seller', link: '' },
  { id: 'I2', titulo: 'Kit "Volta às Aulas" com 3 cadernos', desc: 'Combo com desconto progressivo p/ mães que pedem p/ mais de um filho.', tags: 'combo,volta-as-aulas', link: '' },
  { id: 'I3', titulo: 'Para-corrente ilustrada p/ cozinha', desc: '18 topos de bolo + 3 rotinas + planta da casa. Nicho forte de casas.', tags: 'casa,cozinha', link: '' },
  { id: 'I4', titulo: 'Mês do cliente: replay de fotos reais', desc: 'Coletar fotos de quem já comprou e repostar (com autorização) como prova social.', tags: 'marketing,prova-social', link: '' },
];
const SEED_CUSTOM_PRICES = [
  { id: 'CP1', tag: 'Bloquinho A5',       base: 27.00, frente: 18.00, verso: 12.00, qtd: 1 },
  { id: 'CP2', tag: 'Cartão A6',          base: 24.00, frente: 18.00, verso: 13.00, qtd: 1 },
  { id: 'CP3', tag: 'Tag p/ roupas',      base: 20.00, frente: 16.00, verso: 12.00, qtd: 1 },
  { id: 'CP4', tag: 'Caderno A5 c/ capa', base: 46.00, frente: 22.00, verso: 18.00, qtd: 1 },
  { id: 'CP5', tag: 'Planner semanal',    base: 44.00, frente: 24.00, verso: 19.00, qtd: 1 },
];
const SEED_COSTS = { papel: 38, tinta: 22, lamina: 6, energia: 4, mao: 28, embalagem: 3 };
const METAS = { mensal: 10000, semanal: 2500, diaria: 400 };

/* ---------------- calculadora de precos (planilha de orcamento) ---------------- */
const round2 = (x) => Math.round((Number(x) || 0) * 100) / 100;
const pct = (v) => String(v || 0).replace('.', ',');
const PRECO_PARAMS = {
  cvhora: 10,          // Custo Fixo por Hora (R$)
  markup: 1.0,         // Expectativa de Lucro (100% = dobra o custo)
  tx_plataforma: 0.01, // Taxa da Plataforma (%)
  tx_cartao: 0.1768,   // Taxa do Cartao na venda (%)
  cfixo_mensal: 1858,  // Custo fixo mensal (MEI+Energia+Internet+Agua / salario,13,FGTS,Ferias / aluguel)
  horas_mes: 60,       // Horas trabalhadas declaradas no mes
};
const calcCorpPreco = (cv, tempoH, ps) => {
  const cf = (ps.cvhora || 0) * tempoH;
  const ct = cv + cf;
  const comLucro = ct * (1 + (ps.markup || 0));
  const sugerido = round2(comLucro * (1 + (ps.tx_plataforma || 0)));
  return { cf: round2(cf), ct: round2(ct), comLucro: round2(comLucro), sugerido };
};
const margemPct = (venda, ct) => (venda > 0 ? round2(((venda - ct) / venda) * 100) : 0);
const cartaoPct = (valor, tx) => round2(valor * (1 + (Number(tx) || 0)));
const SEED_PRECO = [
  { sku: '#25010002', nome: 'Caderno A6 80f em branco',   cv: 5.21,  tempoH: 0.17, venda: 15.00 },
  { sku: '#25010003', nome: 'Caderno A5 80f pautado PB',  cv: 11.36, tempoH: 1,    venda: 33.00 },
  { sku: '#25010004', nome: 'Caderneta de vacina nova',   cv: 11.62, tempoH: 1,    venda: 50.00 },
  { sku: '#25010005', nome: 'Caderneta reforma',          cv: 8.86,  tempoH: 0.5,  venda: 35.00 },
  { sku: '#25010006', nome: 'Agenda 2DPP',                cv: 18.42, tempoH: 1,    venda: 65.00 },
  { sku: '#25010007', nome: 'Agenda 1DPP',                cv: 21.84, tempoH: 1,    venda: 75.00 },
  { sku: '#25010008', nome: 'Caderno A5 80f decorado',    cv: 12.43, tempoH: 1,    venda: 40.00 },
  { sku: '#25010009', nome: 'Devocional PB 110f',         cv: 12.82, tempoH: 1,    venda: 49.90 },
  { sku: '#25010010', nome: 'Caderninho A6 grampeado',    cv: 0.86,  tempoH: 0.17, venda: 4.00 },
  { sku: '#25010011', nome: 'Bloquinho espiral capa mole',cv: 3.31,  tempoH: 0.17, venda: 8.00 },
  { sku: '#25010012', nome: 'Bloco colado A6 50f',        cv: 2.95,  tempoH: 0.17, venda: 7.50 },
  { sku: '#25010013', nome: 'Folha adesiva gloss c/ corte',cv: 1.44, tempoH: 0.08, venda: 7.50 },
  { sku: '#25010014', nome: 'Folha adesiva gloss s/ corte',cv: 0.94, tempoH: 0.02, venda: 5.00 },
  { sku: '#25010015', nome: 'Devocional PB 113f',         cv: 18.23, tempoH: 1,    venda: 50.00 },
  { sku: '#25010016', nome: 'Reforma capa de biblia',     cv: 10.30, tempoH: 2,    venda: 50.00 },
  { sku: '#25010017', nome: 'Agenda miolo Lionmix',       cv: 24.35, tempoH: 1,    venda: 75.00 },
  { sku: '#25010018', nome: 'Marca pagina retangular',    cv: 0.29,  tempoH: 0.08, venda: 4.00 },
  { sku: '#25010019', nome: 'Photocard',                  cv: 0.20,  tempoH: 0.08, venda: 4.00 },
  { sku: '#25010020', nome: 'Cone coracao',               cv: 9.98,  tempoH: 0.17, venda: 25.00 },
  { sku: '#25010021', nome: 'Cone simples',               cv: 2.35,  tempoH: 0.17, venda: 10.00 },
  { sku: '#25010022', nome: 'Produto novo (sem nome)',    cv: 7.31,  tempoH: 0.5,  venda: 0.00 },
];

/* ---------------- admin ---------------- */
const DEFAULT_ACESSOS = ['dashboard', 'pedidos', 'clientes', 'agenda', 'perfil'];
const ALL_MODULES = [
  ['dashboard', 'Dashboard'], ['pedidos', 'Pedidos'], ['clientes', 'Clientes'], ['producao', 'Produção'],
  ['financeiro', 'Financeiro'], ['agenda', 'Agenda'], ['central', 'Central da La Craft'],
  ['marketing', 'Marketing'], ['biblioteca', 'Biblioteca de Artes'], ['relatorios', 'Relatórios'],
  ['custos', 'Calculadora de Custos'], ['orcamento', 'Orçamento Inteligente'], ['catalogo', 'Catálogo de Produtos'],
  ['estoque', 'Estoque de Insumos'], ['impressao', 'Impressão'], ['silhouette', 'Corte Silhouette'],
  ['perfil', 'Perfil'], ['configuracoes', 'Configurações'], ['backup', 'Backup'],
];
const SEED_USERS = [
  { id: 'U01', nome: 'Lays Gonçalves', papel: 'Administradora', cor: '#EF7784', login: 'lays@lacraft', senha: 'lacraft', acessos: '_all' },
  { id: 'U02', nome: 'Ana Souza', papel: 'Produção', cor: '#3F8288', login: 'ana@lacraft', senha: 'lacraft', acessos: ['dashboard', 'pedidos', 'producao', 'agenda', 'orcamento', 'catalogo', 'estoque', 'impressao', 'silhouette', 'perfil'] },
  { id: 'U03', nome: 'Beatriz Lima', papel: 'Atendimento', cor: '#C2A15E', login: 'bia@lacraft', senha: 'lacraft', acessos: ['dashboard', 'pedidos', 'clientes', 'agenda', 'orcamento', 'marketing', 'central', 'perfil'] },
];
const SEED_ACTIVITY = [
  { id: 'AC1', data: '2026-08-29T09:12:00', user: 'Lays', msg: 'Aprovou orçamento do LC-041 (Agenda 2027)' },
  { id: 'AC2', data: '2026-08-29T08:40:00', user: 'Ana', msg: 'Iniciou a impressão do LC-055 (Etiquetas)' },
  { id: 'AC3', data: '2026-08-28T18:05:00', user: 'Lays', msg: 'Marcou LC-045 como Entregue' },
];