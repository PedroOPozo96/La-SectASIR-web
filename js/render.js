document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica del menú lateral interactivo (Sidebar)
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.site-sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // 2. Determinar en qué página del sistema nos encontramos
  const practiceGrid = document.getElementById('practice-grid');
  const practicaRoot = document.getElementById('practica-root');
  
  const isDetailPage = !!practicaRoot;
  const basePath = isDetailPage ? '../' : '';

  // 3. Renderizar el índice del menú lateral
  renderSidebar(basePath);

  // 4. Renderizar el bloque de contenido principal según la vista
  if (practiceGrid) {
    // Estamos en la raíz (index.html)
    renderGrid();
    setupFilters();
  } else if (practicaRoot) {
    // Estamos dentro de un artículo (practicas/practica.html)
    renderDetail();
  }
});

// --- FUNCIONES DE RENDERIZADO ---

function renderSidebar(basePath) {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  // Verificación de seguridad del array global del usuario
  if (typeof PRACTICAS === 'undefined') {
    sidebarNav.innerHTML = '<div style="padding: 15px; color: var(--red); font-family: var(--mono);">[ERROR]: Estructura PRACTICAS no detectada.</div>';
    return;
  }

  let html = `<a href="${basePath}index.html" class="sidebar-home-link"><span class="prompt">~</span>/home</a>`;

  // Extraemos las categorías únicas presentes en tus datos
  const categoriasUnicas = [...new Set(PRACTICAS.map(p => p.categoria))];

  categoriasUnicas.forEach(cat => {
    // Buscamos el nombre amigable en tu objeto CATEGORIAS_LABEL
    const labelAmigable = (typeof CATEGORIAS_LABEL !== 'undefined' && CATEGORIAS_LABEL[cat]) ? CATEGORIAS_LABEL[cat] : cat;
    
    html += `<div class="sidebar-cat-title">${labelAmigable}</div>`;
    
    // Filtramos los artículos que pertenecen a este módulo educativo
    const items = PRACTICAS.filter(p => p.categoria === cat);
    items.forEach(item => {
      html += `<a href="${basePath}practicas/practica.html?id=${item.id}" class="sidebar-item-link">${item.id}.md</a>`;
    });
  });

  sidebarNav.innerHTML = html;
}

function renderGrid(filtro = 'todas') {
  const grid = document.getElementById('practice-grid');
  if (!grid || typeof PRACTICAS === 'undefined') return;

  grid.innerHTML = ''; // Limpiamos el texto estático de "cargando..."

  // Aplicamos el filtro de la barra de comandos de la web
  const datosFiltrados = filtro === 'todas' 
    ? PRACTICAS 
    : PRACTICAS.filter(p => p.categoria === filtro);

  if (datosFiltrados.length === 0) {
    grid.innerHTML = '<div class="loading-state">No se encontraron prácticas en este directorio...</div>';
    return;
  }

  // Mapeado y construcción de las tarjetas del portfolio
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
          <div class="card-link">cat README.md <span class="arrow">→</span></div>
        </div>
      </a>
    `;
  });

  grid.innerHTML = html;
}

function setupFilters() {
  const botones = document.querySelectorAll('.filter-btn');
  botones.forEach(btn => {
    btn.addEventListener('click', (e) => {
      botones.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const filtro = e.target.getAttribute('data-filter');
      renderGrid(filtro);
    });
  });
}

function renderDetail() {
  const root = document.getElementById('practica-root');
  if (!root || typeof PRACTICAS === 'undefined') return;

  // Capturamos el parámetro ID de la barra de direcciones (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const practica = PRACTICAS.find(p => p.id === id);

  if (!practica) {
    root.innerHTML = `
      <div class="wrap">
        <div class="error-state" style="font-family: var(--mono); padding: 40px 0;">
          [ERROR 404]: El recurso solicitado '${id}' no existe en el volumen del sistema.
        </div>
      </div>`;
    return;
  }

  const tagsHtml = practica.tags.map(t => `<span>${t}</span>`).join('');
  const labelAmigable = (typeof CATEGORIAS_LABEL !== 'undefined' && CATEGORIAS_LABEL[practica.categoria]) ? CATEGORIAS_LABEL[practica.categoria] : practica.categoria;

  // Inyección del diseño del artículo detallado
  const html = `
    <div class="wrap detail-header">
      <div class="breadcrumb">
        <a href="../index.html">~</a>
        <span class="sep">/</span>
        <a href="../index.html#practicas">practicas</a>
        <span class="sep">/</span>
        <span class="current">${practica.id}</span>
      </div>
      <div class="detail-category">${labelAmigable}</div>
      <h1 class="detail-title">${practica.titulo}</h1>
      <div class="detail-meta">
        ${tagsHtml}
      </div>
      <hr class="detail-divider">
    </div>
    <div class="wrap detail-body">
      ${practica.contenidoHTML}
    </div>
  `;

  root.innerHTML = html;

  // ACTIVAMOS LOS BOTONES DE COPIAR AUTOMÁTICAMENTE TRAS INYECTAR EL CONTENIDO
  initCopyButtons();
}

// --- LÓGICA DEL BOTÓN DE COPIAR (CLIPBOARD API) ---

function initCopyButtons() {
  const bloquesCodigo = document.querySelectorAll('.detail-body pre');

  bloquesCodigo.forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return;

    const boton = document.createElement('button');
    button.className = 'copy-btn';
    button.innerText = 'Copiar';

    boton.addEventListener('click', () => {
      const etiquetaCode = pre.querySelector('code');
      const textoACopiar = etiquetaCode ? etiquetaCode.innerText : pre.innerText;

      navigator.clipboard.writeText(textoACopiar).then(() => {
        boton.innerText = '¡Copiado!';
        boton.classList.add('copied');

        setTimeout(() => {
          boton.innerText = 'Copiar';
          boton.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Error al acceder al portapapeles: ', err);
      });
    });

    pre.appendChild(boton);
  });
}
