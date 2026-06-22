/**
 * ============================================================
 * RENDER — La SectASIR
 * Pinta las prácticas (desde practicas-data.js) en index.html
 * y en practica.html. 
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

  const params = new URLSearchParams(window.location.search);
  const filtroInicial = params.get('filtro');
  if (filtroInicial) {
    const target = document.querySelector(`[data-filter="${filtroInicial}"]`);
    if (target) target.click();
  }
}

/* ---------- ÍNDICE LATERAL (INTERACTIVO) ---------- */
function renderSidebarIndex() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  const grouped = {};
  PRACTICAS.forEach(p => {
    if (!grouped[p.categoria]) grouped[p.categoria] = [];
    grouped[p.categoria].push(p);
  });

  const categoriasOrdenadas = Object.keys(CATEGORIAS_LABEL);
  const hayGridLocal = !!document.getElementById('practice-grid');
  
  // Determinamos la ruta base para que el enlace vuelva siempre al inicio correcto
  const rootPath = hayGridLocal ? '' : '../';

  // Añadimos el botón de inicio con estilo de comando
  let html = `<a class="sidebar-home-link" href="${rootPath}index.html"><span class="prompt">$</span> cd ~/inicio</a>`;

  categoriasOrdenadas.forEach(cat => {
    const practicasEnCat = grouped[cat];
    if (practicasEnCat && practicasEnCat.length > 0) {
      html += `<div class="sidebar-cat-title">${escapeHTML(CATEGORIAS_LABEL[cat])}</div>`;
      
      practicasEnCat.forEach(p => {
        const destino = hayGridLocal 
          ? `practicas/practica.html?id=${encodeURIComponent(p.id)}` 
          : `practica.html?id=${encodeURIComponent(p.id)}`;
          
        html += `<a class="sidebar-item-link" href="${destino}" title="${escapeHTML(p.titulo)}">${escapeHTML(p.filename)}</a>`;
      });
    }
  });

  sidebarNav.innerHTML = html;
}

function setupFilters() {
  const filterEls = document.querySelectorAll('.filter-btn');
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
        Error — no se encontró ninguna práctica con id "${escapeHTML(id || '')}"<br><br>
        <a href="../index.html" style="color:var(--accent)">← volver al índice</a>
      </div>`;
    document.title = "Práctica no encontrada";
    return;
  }

  document.title = `${practica.titulo} — La SectASIR`;

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

/* ---------- auto-ejecución y lógica del toggle ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarIndex();    
  renderHomeGrid();        
  renderPracticaDetail();  

  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.site-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(event.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
});
