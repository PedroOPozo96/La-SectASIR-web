document.addEventListener('DOMContentLoaded', () => {
  // 1. Cargamos el menú lateral (índice) en todas las páginas
  setupSidebar();
  renderSidebar();

  // 2. ENRUTADOR: Detectamos en qué página estamos leyendo los parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idPractica = urlParams.get('id');
  const catPractica = urlParams.get('cat'); 

  if (idPractica) {
    renderSinglePractica(idPractica);
  } else {
    // Escaneamos las prácticas y actualizamos los iconos ANTES de cargar la navegación
    updateFolderIcons(); 
    setupNavigation();
    
    if (catPractica) {
      openDirectory(catPractica.toLowerCase()); 
    }
  }
});

/* ==========================================================================
   LÓGICA DEL MENÚ LATERAL (ÍNDICE)
   ========================================================================== */

function setupSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.site-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebar.classList.toggle('active');
    });
  }
}

function renderSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav || typeof PRACTICAS === 'undefined') return;

  const isInsidePracticas = window.location.pathname.includes('/practicas/');
  const pathPrefix = isInsidePracticas ? '' : 'practicas/';
  const homePath = isInsidePracticas ? '../index.html' : 'index.html';

  let html = `
    <div class="line" style="margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
      <a href="${homePath}" style="color: #60a5fa; text-decoration: none; font-family: var(--mono); font-size: 0.9rem; font-weight: bold;" onmouseover="this.style.color='#93c5fd'" onmouseout="this.style.color='#60a5fa'">
        cd ~/la_sectasir (inicio)
      </a>
    </div>
  `;

  const categorias = {};
  PRACTICAS.forEach(p => {
    const cat = p.categoria ? p.categoria.toLowerCase() : 'otras';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(p);
  });

  const ordenCategorias = ['gbdd', 'redes', 'servicios', 'iaw', 'infraestructura'];
  const nombreVisible = {
    'gbdd': 'GBDD',
    'redes': 'REDES',
    'servicios': 'SERVICIOS',
    'iaw': 'IAW',
    'infraestructura': 'IV',
    'otras': 'OTRAS'
  };

  ordenCategorias.forEach(cat => {
    if (categorias[cat] && categorias[cat].length > 0) {
      html += `
        <div style="color: #4ade80; margin-top: 16px; margin-bottom: 6px; font-family: var(--mono); font-size: 0.85rem; font-weight: 600;">
          cd /${nombreVisible[cat]}
        </div>
      `;
      
      categorias[cat].forEach(p => {
        const nombreArchivo = p.filename || p.id;
        html += `
          <div class="line" style="margin-bottom: 8px; padding-left: 12px;">
            <a href="${pathPrefix}practica.html?id=${p.id}" style="color: #cbd5e1; text-decoration: none; font-family: var(--mono); font-size: 0.85rem;" onmouseover="this.style.color='#f8fafc'" onmouseout="this.style.color='#cbd5e1'">
              cat ${nombreArchivo}.md
            </a>
          </div>
        `;
      });
    }
  });

  for (const cat in categorias) {
    if (!ordenCategorias.includes(cat)) {
      html += `
        <div style="color: #4ade80; margin-top: 16px; margin-bottom: 6px; font-family: var(--mono); font-size: 0.85rem; font-weight: 600;">
          cd /${cat.toUpperCase()}
        </div>
      `;
      categorias[cat].forEach(p => {
        const nombreArchivo = p.filename || p.id;
        html += `
          <div class="line" style="margin-bottom: 8px; padding-left: 12px;">
            <a href="${pathPrefix}practica.html?id=${p.id}" style="color: #cbd5e1; text-decoration: none; font-family: var(--mono); font-size: 0.85rem;" onmouseover="this.style.color='#f8fafc'" onmouseout="this.style.color='#cbd5e1'">
              cat ${nombreArchivo}.md
            </a>
          </div>
        `;
      });
    }
  }

  sidebarNav.innerHTML = html;
}

/* ==========================================================================
   LÓGICA DE LA PORTADA (CARPETAS Y FICHEROS)
   ========================================================================== */

// Novedad: Función que lee los archivos y cambia el diseño visual de las carpetas
function updateFolderIcons() {
  const folders = document.querySelectorAll('.folder-btn');
  
  folders.forEach(btn => {
    const category = btn.getAttribute('data-target');
    const spanElement = btn.querySelector('span');
    const spanText = spanElement ? spanElement.innerText : category;
    
    let count = 0;
    if (category === 'todas') {
      count = typeof PRACTICAS !== 'undefined' ? PRACTICAS.length : 0;
    } else {
      count = typeof PRACTICAS !== 'undefined' ? PRACTICAS.filter(p => p.categoria && p.categoria.toLowerCase() === category.toLowerCase()).length : 0;
    }

    if (count > 0) {
      // DISEÑO: Carpeta ABIERTA con documentos (Categoría con contenido)
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="64" height="64">
          <!-- Trasera de la carpeta -->
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="#3b82f6" opacity="0.6"/>
          <!-- Documento blanco asomando -->
          <path d="M15 8H7v10h10V10l-2-2z" fill="#e2e8f0"/>
          <!-- Líneas de texto del documento -->
          <path d="M9 11h5v1H9zm0 2h6v1H9zm0 2h4v1H9z" fill="#94a3b8"/>
          <!-- Solapa delantera abierta e inclinada -->
          <path d="M2.01 19.5c0 .83.67 1.5 1.5 1.5h15.07c.64 0 1.19-.4 1.39-.99l2.88-8.52c.18-.53-.21-1.09-.76-1.09H4.17c-.64 0-1.19.4-1.39.99L2.01 19.5z" fill="#60a5fa"/>
        </svg>
        <span style="color: #f8fafc;">${spanText}</span>
      `;
    } else {
      // DISEÑO: Carpeta CERRADA y grisácea (Categoría vacía)
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#475569">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
        <span style="color: #64748b;">${spanText}</span>
      `;
    }
  });
}

function setupNavigation() {
  const folders = document.querySelectorAll('.folder-btn');
  const btnBack = document.getElementById('btn-back');

  if (folders.length === 0) return;

  folders.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const botonClicado = e.target.closest('.folder-btn');
      if (!botonClicado) return;
      
      const category = botonClicado.getAttribute('data-target');
      openDirectory(category);
    });
  });

  if (btnBack) {
    btnBack.addEventListener('click', closeDirectory);
  }
}

function openDirectory(categoria) {
  const foldersView = document.getElementById('gui-folders');
  const filesView = document.getElementById('files-view');
  
  if(foldersView && filesView) {
    foldersView.style.display = 'none';
    filesView.style.display = 'block';

    const dirName = categoria === 'todas' ? '' : `/${categoria.toLowerCase()}`;
    document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas${dirName}$ ls -la`;

    renderGrid(categoria);
  }
}

function closeDirectory() {
  document.getElementById('gui-folders').style.display = 'flex';
  document.getElementById('files-view').style.display = 'none';
  
  document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas$ ls -la`;
  window.history.pushState({}, document.title, window.location.pathname + '#practicas');
}

function renderGrid(filtro) {
  const grid = document.getElementById('practice-grid');
  if (!grid || typeof PRACTICAS === 'undefined') return;

  grid.innerHTML = ''; 

  const datosFiltrados = filtro === 'todas' 
    ? PRACTICAS 
    : PRACTICAS.filter(p => p.categoria && p.categoria.toLowerCase() === filtro.toLowerCase());

  if (datosFiltrados.length === 0) {
    grid.innerHTML = '<div class="loading-state">El directorio está vacío...</div>';
    return;
  }

  let html = '';
  datosFiltrados.forEach(p => {
    const tagsHtml = p.tags.map(t => `<span>${t}</span>`).join('');
    const labelAmigable = (typeof CATEGORIAS_LABEL !== 'undefined' && CATEGORIAS_LABEL[p.categoria]) ? CATEGORIAS_LABEL[p.categoria] : p.categoria;
    const nombreArchivo = p.filename || p.id;

    html += `
      <a href="practicas/practica.html?id=${p.id}" class="practice-card">
        <div class="card-bar">
          <span class="tb-dot r"></span><span class="tb-dot y"></span><span class="tb-dot g"></span>
          <span class="card-filename">${nombreArchivo}.sh</span>
        </div>
        <div class="card-body">
          <div class="card-category">${labelAmigable}</div>
          <h3 class="card-title">${p.titulo}</h3>
          <p class="card-desc">${p.resumen}</p>
          <div class="card-tags">${tagsHtml}</div>
          <div class="card-link">cat ${nombreArchivo}.md <span class="arrow">→</span></div>
        </div>
      </a>
    `;
  });

  grid.innerHTML = html;
}

/* ==========================================================================
   LÓGICA DE LA PRÁCTICA INDIVIDUAL (PRACTICA.HTML)
   ========================================================================== */

function renderSinglePractica(id) {
  if (typeof PRACTICAS === 'undefined') return;
  
  const practica = PRACTICAS.find(p => p.id === id);
  
  if (!practica) {
    const container = document.querySelector('main') || document.body;
    container.innerHTML = '<div style="text-align:center; padding: 100px 20px;"><h1 style="color:#ef4444;">Error 404</h1><p>El fichero solicitado no existe en el sistema.</p><a href="../index.html" style="color:#60a5fa; text-decoration:none;">cd .. (volver al inicio)</a></div>';
    return;
  }

  document.title = practica.titulo + " — La SectASIR";

  const tituloEl = document.getElementById('practica-titulo');
  const contenidoEl = document.getElementById('practica-contenido');
  const fechaEl = document.getElementById('practica-fecha');
  const tagsEl = document.getElementById('practica-tags');

  if (tituloEl) tituloEl.innerHTML = practica.titulo;
  if (contenidoEl) contenidoEl.innerHTML = practica.contenidoHTML;
  if (fechaEl && practica.fecha) fechaEl.innerHTML = practica.fecha;
  
  if (tagsEl && practica.tags) {
    tagsEl.innerHTML = practica.tags.map(t => `<span class="stack-tag">${t}</span>`).join('');
  }

  const safeCategory = practica.categoria ? practica.categoria.toLowerCase() : 'todas';
  const urlRetorno = `../index.html?cat=${safeCategory}#practicas`;
  
  const btnBack = document.getElementById('btn-back-to-folder');
  if (btnBack) {
    btnBack.href = urlRetorno;
  }
  
  const closeBtn = document.getElementById('close-terminal-btn');
  const terminalApp = document.getElementById('main-terminal');

  if (closeBtn && terminalApp) {
    closeBtn.addEventListener('click', () => {
      terminalApp.classList.add('minimize-animation');
      setTimeout(() => {
        window.location.href = urlRetorno;
      }, 400);
    });
  }
}
