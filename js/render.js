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

  const params = new URLSearchParams(window.location.search);
  const filtroInicial = params.get('filtro');
  if (filtroInicial) {
    const target = document.querySelector(`[data-filter="${filtroInicial}"]`);
    if (target) target.click();
  }
}

/* ---------- ÍNDICE LATERAL INTERACTIVO (árbol de terminal) ---------- */
function renderSidebarIndex() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  const aside = document.querySelector('.site-sidebar');
  const root = (aside && aside.dataset.root) || '';
  const hayGridLocal = !!document.getElementById('practice-grid');

  // Agrupar prácticas por categoría
  const porCategoria = {};
  PRACTICAS.forEach(p => {
    if (!porCategoria[p.categoria]) porCategoria[p.categoria] = [];
    porCategoria[p.categoria].push(p);
  });

  const totalPracticas = PRACTICAS.length;
  const categoriasOrdenadas = Object.keys(CATEGORIAS_LABEL);

  let html = '';

  // Cabecera: comando ls simulado
  html += `
    <div class="tree-cmd">
      <span class="tree-prompt">$</span> ls practicas/
    </div>
  `;

  // Ítem "todas" — enlace/botón global
  const allDest = hayGridLocal
    ? ''
    : `${root}index.html#practicas`;
  html += `
    <div class="tree-item tree-all${hayGridLocal ? '' : ''}">
      ${hayGridLocal
        ? `<button class="tree-all-btn sidebar-link active" data-filter="todas"><span class="tree-icon">❯</span><span class="tree-all-label">--all</span><span class="count">${totalPracticas}</span></button>`
        : `<a class="tree-all-btn sidebar-link" href="${allDest}"><span class="tree-icon">❯</span><span class="tree-all-label">--all</span><span class="count">${totalPracticas}</span></a>`
      }
    </div>
  `;

  // Separador
  html += `<div class="tree-sep"></div>`;

  // Árbol de categorías
  categoriasOrdenadas.forEach((cat, catIdx) => {
    const practicasCat = porCategoria[cat] || [];
    const count = practicasCat.length;
    const isLast = catIdx === categoriasOrdenadas.length - 1;
    const catLabel = CATEGORIAS_LABEL[cat];

    // Estado inicial: expandir si hay prácticas
    const hasItems = count > 0;
    const catId = `tree-cat-${cat}`;

    if (hayGridLocal) {
      html += `
        <div class="tree-category-row" data-cat="${escapeHTML(cat)}">
          <button
            class="tree-cat-toggle sidebar-link"
            data-filter="${escapeHTML(cat)}"
            data-cat-id="${catId}"
            aria-expanded="${hasItems ? 'true' : 'false'}"
          >
            <span class="tree-connector">${isLast ? '└─' : '├─'}</span>
            <span class="tree-folder-icon" aria-hidden="true">${hasItems ? '📂' : '📁'}</span>
            <span class="tree-cat-name">${escapeHTML(catLabel)}</span>
            <span class="count">${count}</span>
          </button>
          ${hasItems ? `
          <ul class="tree-children" id="${catId}">
            ${practicasCat.map((p, pIdx) => {
              const pIsLast = pIdx === practicasCat.length - 1;
              const href = `practicas/practica.html?id=${encodeURIComponent(p.id)}`;
              return `
                <li class="tree-leaf">
                  <span class="tree-leaf-connector">${pIsLast ? '   └─' : '   ├─'}</span>
                  <a class="tree-leaf-link" href="${href}" title="${escapeHTML(p.titulo)}">
                    <span class="tree-file-icon">📄</span>
                    <span class="tree-leaf-name">${escapeHTML(p.filename)}</span>
                  </a>
                </li>
              `;
            }).join('')}
          </ul>` : ''}
        </div>
      `;
    } else {
      // En páginas de detalle, los enlaces van a la home con filtro
      const destino = `${root}index.html?filtro=${encodeURIComponent(cat)}#practicas`;
      html += `
        <div class="tree-category-row" data-cat="${escapeHTML(cat)}">
          <button
            class="tree-cat-toggle sidebar-link"
            data-cat-id="${catId}"
            aria-expanded="${hasItems ? 'true' : 'false'}"
          >
            <span class="tree-connector">${isLast ? '└─' : '├─'}</span>
            <span class="tree-folder-icon" aria-hidden="true">${hasItems ? '📂' : '📁'}</span>
            <span class="tree-cat-name">${escapeHTML(catLabel)}</span>
            <span class="count">${count}</span>
          </button>
          ${hasItems ? `
          <ul class="tree-children" id="${catId}">
            ${practicasCat.map((p, pIdx) => {
              const pIsLast = pIdx === practicasCat.length - 1;
              const href = `${root}practicas/practica.html?id=${encodeURIComponent(p.id)}`;
              return `
                <li class="tree-leaf">
                  <span class="tree-leaf-connector">${pIsLast ? '   └─' : '   ├─'}</span>
                  <a class="tree-leaf-link" href="${href}" title="${escapeHTML(p.titulo)}">
                    <span class="tree-file-icon">📄</span>
                    <span class="tree-leaf-name">${escapeHTML(p.filename)}</span>
                  </a>
                </li>
              `;
            }).join('')}
          </ul>` : ''}
        </div>
      `;
    }
  });

  // Pie: prompt vacío animado
  html += `
    <div class="tree-footer">
      <span class="tree-prompt">$</span><span class="tree-cursor"></span>
    </div>
  `;

  sidebarNav.innerHTML = html;

  // Comportamiento acordeón: toggle expand/collapse
  sidebarNav.querySelectorAll('.tree-cat-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catId = btn.dataset.catId;
      const children = catId ? document.getElementById(catId) : null;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      if (children) {
        btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        children.classList.toggle('tree-collapsed', isExpanded);
        // cambiar icono de carpeta
        const folderIcon = btn.querySelector('.tree-folder-icon');
        if (folderIcon) folderIcon.textContent = isExpanded ? '📁' : '📂';
      }
    });
  });
}

function setupFilters() {
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

  // Resaltar la práctica activa en el sidebar
  const sidebarLinks = document.querySelectorAll('.tree-leaf-link');
  sidebarLinks.forEach(link => {
    const url = new URL(link.href);
    if (url.searchParams.get('id') === id) {
      link.classList.add('active');
      // expandir la categoría padre si está colapsada
      const children = link.closest('.tree-children');
      const toggle = children && document.querySelector(`[data-cat-id="${children.id}"]`);
      if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
        toggle.click();
      }
    }
  });
}

/* ---------- auto-ejecución según la página ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarIndex();
  renderHomeGrid();
  renderPracticaDetail();
  setupSidebarToggle();
});

/* ---------- Botón toggle del sidebar en pantallas medianas ---------- */
function setupSidebarToggle() {
  const btn     = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('site-sidebar');
  if (!btn || !sidebar) return;

  function applyBreakpoint() {
    if (window.innerWidth > 1320) {
      sidebar.classList.remove('sidebar-hidden');
      btn.style.display = 'none';
    } else {
      btn.style.display = 'flex';
    }
  }

  applyBreakpoint();

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
    const isHidden = sidebar.classList.contains('sidebar-hidden');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.querySelector('.toggle-label').textContent = isHidden ? 'índice' : 'cerrar';
  });

  window.addEventListener('resize', applyBreakpoint);
}
