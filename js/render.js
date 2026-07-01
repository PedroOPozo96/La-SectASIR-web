document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  renderSidebar();
  setupSearch(); // <-- Módulo de búsqueda con Easter Eggs e Historial persistente (.bash_history)
  setupGenericCloseButtons(); // <-- Cierra terminales en páginas sueltas

  const urlParams = new URLSearchParams(window.location.search);
  const idPractica = urlParams.get('id');
  const catPractica = urlParams.get('cat'); 

  if (idPractica) {
    renderSinglePractica(idPractica);
  } else {
    updateFolderIcons(); 
    setupNavigation();
    
    if (catPractica) {
      openDirectory(catPractica.toLowerCase()); 
    }
  }
});

/* ==========================================================================
   LÓGICA DEL BUSCADOR (COMMAND PALETTE), EASTER EGGS Y .BASH_HISTORY
   ========================================================================== */

function setupSearch() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  
  // 1. Inyectar botón sin romper el body
  if (sidebarToggle && !document.getElementById('search-toggle')) {
    const searchBtn = document.createElement('div');
    searchBtn.id = 'search-toggle';
    searchBtn.title = "Buscar fichero (Ctrl+K)";
    searchBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
    
    sidebarToggle.parentNode.insertBefore(searchBtn, sidebarToggle);
  }

  // 2. Inyectar el Modal de Búsqueda
  if (!document.getElementById('search-modal')) {
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.className = 'search-modal';
    modal.innerHTML = `
      <div class="search-container">
        <div class="search-header">
          <span style="color: #4ade80;">pedrooliver@asir</span>:<span style="color: #60a5fa;">~</span>$ find . -name
          <input type="text" id="search-input" placeholder='"termino_a_buscar"...' autocomplete="off">
        </div>
        <div id="search-results" class="search-results"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchToggle = document.getElementById('search-toggle');

  // --- PERSISTENCIA ESTILO .bash_history ---
  // Cargamos el historial de LocalStorage o creamos uno vacío
  let searchHistory = JSON.parse(localStorage.getItem('bash_history')) || [];
  let historyIndex = searchHistory.length;

  const openSearch = () => {
    searchModal.classList.add('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
    // Reseteamos el índice al final del historial cada vez que abrimos
    historyIndex = searchHistory.length; 
    setTimeout(() => searchInput.focus(), 100);
  };

  const closeSearch = () => {
    searchModal.classList.remove('active');
    searchInput.blur();
  };

  if (searchToggle) searchToggle.addEventListener('click', openSearch);
  
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  // Atajos globales para abrir/cerrar
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  // --- LÓGICA DE TECLADO INTERNO (Enter, Flechas) ---
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = searchInput.value.trim();
      
      // Guardar en el historial si no está vacío y no es igual al último comando
      if (val && searchHistory[searchHistory.length - 1] !== val) {
        searchHistory.push(val);
        // Limitamos el historial a 50 comandos para no llenar la caché
        if (searchHistory.length > 50) {
          searchHistory.shift();
        }
        // Guardamos físicamente en el navegador
        localStorage.setItem('bash_history', JSON.stringify(searchHistory));
      }
      historyIndex = searchHistory.length;

      // Hacer clic automático en el primer resultado
      const firstResult = searchResults.querySelector('a');
      if (firstResult) {
        firstResult.click();
      }
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault(); 
      if (searchHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        searchInput.value = searchHistory[historyIndex];
        searchInput.dispatchEvent(new Event('input')); // Dispara la búsqueda visual
      }
    } 
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < searchHistory.length - 1) {
        historyIndex++;
        searchInput.value = searchHistory[historyIndex];
        searchInput.dispatchEvent(new Event('input')); 
      } else if (historyIndex === searchHistory.length - 1) {
        // Al llegar al final, limpiamos la línea
        historyIndex++;
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  });

  // 3. Lógica de filtrado dinámico y Easter Eggs
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    /* ---------------------------------------------------
       EASTER EGG: ORACLE DBA
       --------------------------------------------------- */
    if (query === 'sqlplus sys as sysdba' || query === 'sqlplus / as sysdba') {
      closeSearch(); 
      
      const isInsidePracticas = window.location.pathname.includes('/practicas/');
      if (isInsidePracticas) {
        window.location.href = '../index.html?cat=gbdd#practicas';
      } else {
        openDirectory('gbdd');
        setTimeout(() => {
          const pathPrompt = document.getElementById('path-prompt');
          if (pathPrompt) {
            pathPrompt.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">SQL></span> Connected to Oracle Database 21c Express Edition Release 21.0.0.0.0 - Production`;
          }
        }, 50);
      }
      return;
    }
    /* --------------------------------------------------- */

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    let html = '';
    const isInsidePracticas = window.location.pathname.includes('/practicas/');
    const pathPrefix = isInsidePracticas ? '' : 'practicas/';
    const homePath = isInsidePracticas ? '../index.html' : 'index.html';

    const categoriasNombres = Object.keys(CATEGORIAS_LABEL);
    const matchesCat = categoriasNombres.filter(c => 
      c.includes(query) || CATEGORIAS_LABEL[c].toLowerCase().includes(query)
    );

    matchesCat.forEach(cat => {
      html += `
        <a href="${homePath}?cat=${cat}#practicas" class="search-result-item" onclick="setTimeout(()=>window.location.reload(), 50)">
          <svg class="search-result-icon" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="#3b82f6"/></svg>
          <div class="search-result-info">
            <span class="search-result-title">Directorio: ${CATEGORIAS_LABEL[cat]}</span>
            <span class="search-result-path">cd ~/${cat}</span>
          </div>
        </a>
      `;
    });

    const matchesPrac = PRACTICAS.filter(p => 
      p.titulo.toLowerCase().includes(query) || 
      (p.resumen && p.resumen.toLowerCase().includes(query)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
    );

    matchesPrac.forEach(p => {
      const extension = p.extension || '.pdf';
      const nombreArchivo = p.filename || p.id;
      html += `
        <a href="${pathPrefix}practica.html?id=${p.id}" class="search-result-item">
          <svg class="search-result-icon" viewBox="0 0 24 24" fill="#cbd5e1"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          <div class="search-result-info">
            <span class="search-result-title">${p.titulo}</span>
            <span class="search-result-path">~/${p.categoria}/${nombreArchivo}${extension}</span>
          </div>
        </a>
      `;
    });

    if (html === '') {
      html = '<div style="padding: 20px; color: #64748b; text-align: center; font-family: var(--mono);">0 coincidencias encontradas en el sistema.</div>';
    }

    searchResults.innerHTML = html;
  });
}

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

    const closeSidebarBtn = sidebar.querySelector('.terminal-titlebar .tb-dot.r');
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebar.classList.remove('active');
      });
    }
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
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="#3b82f6" opacity="0.6"/>
          <path d="M15 8H7v10h10V10l-2-2z" fill="#e2e8f0"/>
          <path d="M9 11h5v1H9zm0 2h6v1H9zm0 2h4v1H9z" fill="#94a3b8"/>
          <path d="M2.01 19.5c0 .83.67 1.5 1.5 1.5h15.07c.64 0 1.19-.4 1.39-.99l2.88-8.52c.18-.53-.21-1.09-.76-1.09H4.17c-.64 0-1.19.4-1.39.99L2.01 19.5z" fill="#60a5fa"/>
        </svg>
        <span style="color: #f8fafc;">${spanText}</span>
      `;
    } else {
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

    filesView.classList.remove('folder-anim');
    void filesView.offsetWidth; 
    filesView.classList.add('folder-anim');

    const dirName = categoria === 'todas' ? '' : `/${categoria.toLowerCase()}`;
    document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas${dirName}$ ls -la`;

    renderGrid(categoria);
  }
}

function closeDirectory() {
  const foldersView = document.getElementById('gui-folders');
  const filesView = document.getElementById('files-view');
  
  filesView.style.display = 'none';
  foldersView.style.display = 'flex';
  
  foldersView.classList.remove('folder-anim');
  void foldersView.offsetWidth; 
  foldersView.classList.add('folder-anim');
  
  document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas$ ls -la`;
  window.history.pushState({}, document.title, window.location.pathname + '#practicas');
}

window.openFileAnim = function(event, url) {
  event.preventDefault();
  const fileElement = event.currentTarget;
  
  fileElement.style.transform = 'scale(1.5)';
  fileElement.style.opacity = '0';
  fileElement.style.pointerEvents = 'none';
  fileElement.style.transition = 'all 0.25s ease-in-out';
  
  setTimeout(() => {
    window.location.href = url;
  }, 250);
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

  grid.style.display = 'flex';
  grid.style.flexWrap = 'wrap';
  grid.style.gap = '20px';

  let html = '';
  
  datosFiltrados.forEach(p => {
    const nombreArchivo = p.filename || p.id;
    const extension = p.extension || '.pdf'; 
    const tagsHtml = p.tags ? p.tags.map(t => `<span>${t}</span>`).join('') : '';
    const labelAmigable = (typeof CATEGORIAS_LABEL !== 'undefined' && CATEGORIAS_LABEL[p.categoria]) ? CATEGORIAS_LABEL[p.categoria] : p.categoria;
    
    html += `
      <a href="practicas/practica.html?id=${p.id}" class="file-item" onclick="openFileAnim(event, this.href)">
        <svg class="file-icon-svg" viewBox="0 0 24 24" width="64" height="64">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z" fill="#e2e8f0"/>
          <path d="M13 2v6h6L13 2z" fill="#cbd5e1"/>
          <path d="M8 12h8v1H8zm0 3h8v1H8zm0 3h5v1H8z" fill="#94a3b8"/>
        </svg>
        <span class="file-name">${nombreArchivo}${extension}</span>

        <div class="file-preview">
          <div class="preview-cat">${labelAmigable}</div>
          <h4 class="preview-title">${p.titulo}</h4>
          <div class="preview-tags">${tagsHtml}</div>
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

  /* ==========================================================================
     GENERADOR AUTOMÁTICO DE ÍNDICE (BOTÓN FLOTANTE Y PANEL)
     ========================================================================== */
  if (contenidoEl) {
    const titulos = contenidoEl.querySelectorAll('h2');

    if (titulos.length > 0) {
      if (!document.getElementById('estilos-indice-flotante')) {
        const style = document.createElement('style');
        style.id = 'estilos-indice-flotante';
        style.textContent = `
          #btn-indice-interno {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            color: #60a5fa;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          #btn-indice-interno:hover {
            transform: scale(1.1);
            background-color: #0f172a;
            color: #93c5fd;
          }
          #btn-indice-interno.activo {
            transform: rotate(90deg);
            background-color: #0f172a;
            border-color: #60a5fa;
            color: #4ade80;
          }
          #panel-indice-interno {
            position: fixed;
            bottom: 95px;
            right: 30px;
            width: 320px;
            max-height: 65vh;
            background-color: #0f172a; 
            border: 1px solid #334155;
            border-radius: 8px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            transform-origin: bottom right;
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease-in-out;
          }
          #panel-indice-interno.abierto {
            transform: scale(1);
            opacity: 1;
            pointer-events: auto;
          }
          .panel-header {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            background-color: #1e293b;
            border-bottom: 1px solid #334155;
            border-radius: 8px 8px 0 0;
          }
          .dots-container {
            display: flex;
            gap: 8px;
            margin-right: 15px;
          }
          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }
          .dot.red { background-color: #ef4444; cursor: pointer; }
          .dot.yellow { background-color: #f59e0b; }
          .dot.green { background-color: #10b981; }
          .panel-title {
            color: #94a3b8;
            font-family: var(--mono, monospace);
            font-size: 0.9rem;
          }
          .panel-content {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
          }
          .lista-indice-interno {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .item-indice-interno {
            margin-bottom: 12px;
            font-family: var(--mono, monospace);
            font-size: 0.85rem;
          }
          .link-indice-interno {
            color: #60a5fa;
            text-decoration: none;
            transition: color 0.2s;
            display: block;
            padding: 4px 0;
          }
          .link-indice-interno:hover {
            color: #4ade80;
          }
        `;
        document.head.appendChild(style);
      }

      const btnToggle = document.createElement('div');
      btnToggle.id = 'btn-indice-interno';
      btnToggle.title = 'Abrir índice de la práctica';
      btnToggle.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`;
      document.body.appendChild(btnToggle);

      const panel = document.createElement('div');
      panel.id = 'panel-indice-interno';
      
      let enlacesHtml = '';
      titulos.forEach((titulo, index) => {
        if (!titulo.id) titulo.id = 'seccion-auto-' + index;
        enlacesHtml += `
          <li class="item-indice-interno">
            <a href="#${titulo.id}" class="link-indice-interno">📍 ${titulo.textContent}</a>
          </li>
        `;
      });

      panel.innerHTML = `
        <div class="panel-header">
          <div class="dots-container">
            <div class="dot red" id="cerrar-indice-interno" title="Cerrar índice"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
          <span class="panel-title">Índice Local</span>
        </div>
        <div class="panel-content">
          <ul class="lista-indice-interno">
            ${enlacesHtml}
          </ul>
        </div>
      `;
      document.body.appendChild(panel);

      btnToggle.addEventListener('click', () => {
        panel.classList.toggle('abierto');
        btnToggle.classList.toggle('activo');
      });

      document.getElementById('cerrar-indice-interno').addEventListener('click', () => {
        panel.classList.remove('abierto');
        btnToggle.classList.remove('activo');
      });

      panel.querySelectorAll('.link-indice-interno').forEach(enlace => {
        enlace.addEventListener('click', () => {
          panel.classList.remove('abierto');
          btnToggle.classList.remove('activo');
        });
      });

      window.limpiarIndiceFlotante = () => {
        if (btnToggle.parentNode) btnToggle.parentNode.removeChild(btnToggle);
        if (panel.parentNode) panel.parentNode.removeChild(panel);
      };
    }
  }
  /* ========================================================================== */

  if (fechaEl && practica.fecha) fechaEl.innerHTML = practica.fecha;
  
  if (tagsEl && practica.tags) {
    tagsEl.innerHTML = practica.tags.map(t => `<span class="stack-tag">${t}</span>`).join('');
  }

  const safeCategory = practica.categoria ? practica.categoria.toLowerCase() : 'todas';
  const urlRetorno = `../index.html?cat=${safeCategory}#practicas`;
  
  const terminalApp = document.getElementById('main-terminal');
  const closeBtn = document.getElementById('close-terminal-btn');
  const btnBack = document.getElementById('btn-back-to-folder');
  
  if (terminalApp) {
    terminalApp.classList.add('maximize-animation');
  }

  function closePracticaAnim(e) {
    if(e) e.preventDefault();

    if (typeof window.limpiarIndiceFlotante === 'function') {
      window.limpiarIndiceFlotante();
    }

    if (terminalApp) {
      terminalApp.classList.remove('maximize-animation');
      terminalApp.classList.remove('minimize-animation'); 
      terminalApp.classList.add('shrink-back-animation');
      
      setTimeout(() => {
        window.location.href = urlRetorno;
      }, 300);
    } else {
      window.location.href = urlRetorno;
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closePracticaAnim);
  }

  if (btnBack) {
    btnBack.href = urlRetorno;
    btnBack.addEventListener('click', closePracticaAnim);
  }
}

/* ==========================================================================
   BOTONES DE CIERRE GENÉRICOS (Sobre mí, Contacto, y cualquier página suelta)
   ========================================================================== */

function setupGenericCloseButtons() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) return;

  document.querySelectorAll('#close-terminal-btn').forEach(closeBtn => {
    if (closeBtn.dataset.closeBound) return;
    closeBtn.dataset.closeBound = 'true';

    const terminalApp = closeBtn.closest('.terminal-window');
    const isInsidePracticas = window.location.pathname.includes('/practicas/');
    const homePath = isInsidePracticas ? '../index.html' : 'index.html';

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (terminalApp) {
        terminalApp.classList.add('shrink-back-animation');
        setTimeout(() => {
          window.location.href = homePath;
        }, 300);
      } else {
        window.location.href = homePath;
      }
    });
  });
}