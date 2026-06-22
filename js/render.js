/**
 * ============================================================
 *  RENDER — La SectASIR
 *  Pinta las prácticas (desde practicas-data.js) en index.html
 *  y en practica.html. No necesitas tocar este archivo para
 *  añadir prácticas nuevas: eso se hace en practicas-data.js
 * ============================================================
 */

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- HOME: tarjetas + filtros ---------- */
function renderHomeGrid() {
  const grid = document.getElementById('practice-grid');
  if (!grid) return;

  grid.innerHTML = PRACTICAS.map(p => `
    <article class="practice-card" data-category="${p.categoria}">
      <div class="card-bar">
        <span class="tb-dot r"></span><span class="tb-dot y"></span><span class="tb-dot g"></span>
        <span class="card-filename">${escapeHTML(p.filename)}</span>
      </div>
      <div class="card-body">
        <div class="card-category">${escapeHTML(p.categoria)}</div>
        <h3 class="card-title">${escapeHTML(p.titulo)}</h3>
        <p class="card-desc">${escapeHTML(p.resumen)}</p>
        <div class="card-tags">${p.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div>
        <a href="practicas/practica.html?id=${encodeURIComponent(p.id)}" class="card-link">ver práctica <span class="arrow">→</span></a>
      </div>
    </article>
  `).join('');

  setupFilters();

  // si llegamos aquí con un filtro en la URL (?filtro=xxx), aplicarlo
  const params = new URLSearchParams(window.location.search);
  const filtroInicial = params.get('filtro');
  if (filtroInicial) {
    const target = document.querySelector(`[data-filter="${filtroInicial}"]`);
    if (target) target.click();
  }
}

/* ---------- ÍNDICE LATERAL: visible en todas las páginas ---------- */
function renderSidebarIndex() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  const total = PRACTICAS.length;
  const conteos = {};
  PRACTICAS.forEach(p => { conteos[p.categoria] = (conteos[p.categoria] || 0) + 1; });

  const categoriasOrdenadas = Object.keys(CATEGORIAS_LABEL);
  const hayGridLocal = !!document.getElementById('practice-grid');

  // en la home (con grid) usamos <button data-filter>; en otras páginas
  // usamos enlaces <a> que llevan a la home con el filtro en la URL.
  // la ruta hacia index.html depende de la profundidad de la página actual,
  // indicada en el atributo data-root del propio <aside>.
  const aside = document.querySelector('.site-sidebar');
  const root = (aside && aside.dataset.root) || '';

  function enlace(filtro, contenidoInterno) {
    if (hayGridLocal) {
      return `<button class="sidebar-link${filtro === 'todas' ? ' active' : ''}" data-filter="${filtro}">${contenidoInterno}</button>`;
    }
    const destino = filtro === 'todas' ? `${root}index.html#practicas` : `${root}index.html?filtro=${encodeURIComponent(filtro)}#practicas`;
    return `<a class="sidebar-link" href="${destino}">${contenidoInterno}</a>`;
  }

  let html = enlace('todas', `<span>--all</span><span class="count">${total}</span>`);

  categoriasOrdenadas.forEach(cat => {
    const n = conteos[cat] || 0;
    html += enlace(cat, `<span>${escapeHTML(CATEGORIAS_LABEL[cat])}</span><span class="count">${n}</span>`);
  });

  sidebarNav.innerHTML = html;
}

function setupFilters() {
  // botones de filtro (arriba del grid) + enlaces del índice lateral
  // comparten el mismo atributo data-filter y se mantienen sincronizados
  const filterEls = document.querySelectorAll('.filter-btn, .sidebar-link[data-filter]');
  const cards = document.querySelectorAll('.practice-card');

  function applyFilter(filter) {
    filterEls.forEach(el => {
      el.classList.toggle('active', el.dataset.filter === filter);
    });
    cards.forEach(card => {
      const show = filter === 'todas' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
    });
  }

  filterEls.forEach(el => {
    el.addEventListener('click', () => applyFilter(el.dataset.filter));
  });
}

/* ---------- DETALLE: página individual de práctica ---------- */
function renderPracticaDetail() {
  const root = document.getElementById('practica-root');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const practica = getPracticaById(id);

  if (!practica) {
    root.innerHTML = `
      <div class="error-state">
        practica.html: error — no se encontró ninguna práctica con id "${escapeHTML(id || '')}"<br><br>
        <a href="../index.html" style="color:var(--accent)">← volver al índice</a>
      </div>`;
    document.title = "Práctica no encontrada — La SectASIR";
    return;
  }

  document.title = `${practica.titulo} — La SectASIR`;

  // navegación entre práctica anterior / siguiente
  const idx = PRACTICAS.findIndex(p => p.id === practica.id);
  const prev = PRACTICAS[idx - 1];
  const next = PRACTICAS[idx + 1];

  root.innerHTML = `
    <div class="detail-header wrap">
      <div class="breadcrumb">
        <a href="../index.html">~</a>
        <span class="sep">/</span>
        <a href="../index.html#practicas">practicas</a>
        <span class="sep">/</span>
        <span class="current">${escapeHTML(practica.id)}</span>
      </div>

      <div class="detail-category">${escapeHTML(CATEGORIAS_LABEL[practica.categoria] || practica.categoria)}</div>
      <h1 class="detail-title">${escapeHTML(practica.titulo)}</h1>
      <div class="detail-meta">
        ${practica.fecha ? `<span>${escapeHTML(practica.fecha)}</span>` : ''}
        ${practica.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}
      </div>
      <hr class="detail-divider">
    </div>

    <div class="wrap">
      <div class="detail-body">
        ${practica.contenidoHTML}
      </div>

      <div class="detail-nav">
        ${prev ? `<a href="practica.html?id=${encodeURIComponent(prev.id)}">← ${escapeHTML(prev.titulo)}</a>` : `<span></span>`}
        <a href="../index.html#practicas" class="to-index">índice</a>
        ${next ? `<a href="practica.html?id=${encodeURIComponent(next.id)}">${escapeHTML(next.titulo)} →</a>` : `<span></span>`}
      </div>
    </div>
  `;
}

/* ---------- auto-ejecución según la página ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarIndex();    // se ejecuta en cualquier página que tenga #sidebar-nav
  renderHomeGrid();        // no hace nada si no existe #practice-grid
  renderPracticaDetail();  // no hace nada si no existe #practica-root
});
