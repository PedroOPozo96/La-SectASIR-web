document.addEventListener('DOMContentLoaded', () => {
  // 1. Cargamos el menú lateral (índice) en todas las páginas
  setupSidebar();
  renderSidebar();

  // 2. ENRUTADOR: Detectamos en qué página estamos leyendo los parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idPractica = urlParams.get('id');
  const catPractica = urlParams.get('cat'); 

  if (idPractica) {
    // Si hay una ID en la URL, estamos en practicas/practica.html
    renderSinglePractica(idPractica);
  } else {
    // Si no hay ID, estamos en la portada (index.html)
    setupNavigation();
    
    // Si venimos rebotados de una práctica, abrimos su carpeta directamente
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

  // Calculamos rutas dependiendo de si estamos en la raíz o dentro de /practicas
  const isInsidePracticas = window.location.pathname.includes('/practicas/');
  const pathPrefix = isInsidePracticas ? '' : 'practicas/';
  const homePath = isInsidePracticas ? '../index.html' : 'index.html';

  // 1. Añadimos el enlace para volver al inicio siempre arriba
  let html = `
    <div class="line" style="margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
      <a href="${homePath}" style="color: #60a5fa; text-decoration: none; font-family: var(--mono); font-size: 0.9rem; font-weight: bold;" onmouseover="this.style.color='#93c5fd'" onmouseout="this.style.color='#60a5fa'">
        cd ~/la_sectasir (inicio)
      </a>
    </div>
  `;

  // 2. Agrupamos las prácticas por categoría (normalizando a minúsculas)
  const categorias = {};
  PRACTICAS.forEach(p => {
    const cat = p.categoria ? p.categoria.toLowerCase() : 'otras';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(p);
  });

  // SINCRONIZACIÓN DE SYSADMIN: Orden exacto y alias en mayúsculas para las etiquetas "cd"
  const ordenCategorias = ['gbdd', 'redes', 'servicios', 'iaw', 'infraestructura'];
  const nombreVisible = {
    'gbdd': 'GBDD',
    'redes': 'REDES',
    'servicios': 'SERVICIOS',
    'iaw': 'IAW',
    'infraestructura': 'IV',
    'otras': 'OTRAS'
  };

  // 3. Renderizamos cada grupo siguiendo rigurosamente el nuevo orden establecido
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

  // Bucle de seguridad por si en el futuro introduces una categoría fuera del mapa de asignaturas
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
