document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica del menú lateral interactivo
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.site-sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // 2. Determinar en qué página estamos
  const practiceGrid = document.getElementById('practice-grid');
  const practicaRoot = document.getElementById('practica-root');
  
  // Variable para ajustar las rutas según si estamos en la raíz o en /practicas
  const isDetailPage = !!practicaRoot;
  const basePath = isDetailPage ? '../' : '';

  // 3. Renderizar el menú lateral
  renderSidebar(basePath);

  // 4. Renderizar el contenido principal
  if (practiceGrid) {
    // Estamos en el index.html
    renderGrid();
    setupFilters();
  } else if (practicaRoot) {
    // Estamos en practicas/practica.html
    renderDetail();
  }
});

// --- FUNCIONES DE RENDERIZADO ---

function renderSidebar(basePath) {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  // Comprobamos que el archivo de datos haya cargado
  if (typeof practicasData === 'undefined') {
    sidebarNav.innerHTML = '<div style="padding: 15px; color: red;">Error: No se encontraron datos.</div>';
    return;
  }

  let html = `<a href="${basePath}index.html" class="sidebar-home-link"><span class="prompt">~</span>/home</a>`;

  // Agrupamos por categorías
  const categories = [...new Set(practicasData.map(p => p.category))];

  categories.forEach(cat => {
    html += `<div class="sidebar-cat-title">${cat}</div>`;
    const items = practicasData.filter(p => p.category === cat);
    items.forEach(item => {
      html += `<a href="${basePath}practicas/practica.html?id=${item.id}" class="sidebar-item-link">${item.id}.md</a>`;
    });
  });

  sidebarNav.innerHTML = html;
}

function renderGrid(filter = 'todas') {
  const grid = document.getElementById('practice-grid');
  if (!grid || typeof practicasData === 'undefined') return;

  grid.innerHTML = ''; // Limpiar el "cargando..."

  // Filtrar los datos
  const filteredData = filter === 'todas' 
    ? practicasData 
    : practicasData.filter(p => p.categoryId === filter);

  if (filteredData.length === 0) {
    grid.innerHTML = '<div class="loading-state">No hay prácticas en esta categoría...</div>';
    return;
  }

  // Generar tarjetas
  let html = '';
  filteredData.forEach(p => {
    const tagsHtml = p.tags.map(t => `<span>${t}</span>`).join('');
    html += `
      <a href="practicas/practica.html?id=${p.id}" class="practice-card">
        <div class="card-bar">
          <span class="tb-dot r"></span><span class="tb-dot y"></span><span class="tb-dot g"></span>
          <span class="card-filename">${p.id}.sh</span>
        </div>
        <div class="card-body">
          <div class="card-category">${p.category}</div>
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.shortDesc}</p>
          <div class="card-tags">${tagsHtml}</div>
          <div class="card-link">cat README.md <span class="arrow">→</span></div>
        </div>
      </a>
    `;
  });

  grid.innerHTML = html;
}

function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Quitar clase active a todos
      buttons.forEach(b => b.classList.remove('active'));
      // Ponerla al clicado
      e.target.classList.add('active');
      // Renderizar grid con el filtro
      const filter = e.target.getAttribute('data-filter');
      renderGrid(filter);
    });
  });
}

function renderDetail() {
  const root = document.getElementById('practica-root');
  if (!root || typeof practicasData === 'undefined') return;

  // Sacar la ID de la URL (?id=lo-que-sea)
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const practica = practicasData.find(p => p.id === id);

  if (!practica) {
    root.innerHTML = `<div class="wrap"><div class="error-state">Error 404: Práctica no encontrada en el sistema.</div></div>`;
    return;
  }

  const tagsHtml = practica.tags.map(t => `<span>${t}</span>`).join('');

  // Generar HTML del artículo
  const html = `
    <div class="wrap detail-header">
      <div class="breadcrumb">
        <a href="../index.html">~</a>
        <span class="sep">/</span>
        <a href="../index.html#practicas">practicas</a>
        <span class="sep">/</span>
        <span class="current">${practica.id}</span>
      </div>
      <div class="detail-category">${practica.category}</div>
      <h1 class="detail-title">${practica.title}</h1>
      <div class="detail-meta">
        ${tagsHtml}
      </div>
      <hr class="detail-divider">
    </div>
    <div class="wrap detail-body">
      ${practica.content}
    </div>
  `;

  root.innerHTML = html;

  // INICIALIZAMOS LOS BOTONES DE COPIAR UNA VEZ EL HTML ESTÁ PINTADO
  initCopyButtons();
}

// --- LÓGICA DEL BOTÓN DE COPIAR ---

function initCopyButtons() {
  const codeBlocks = document.querySelectorAll('.detail-body pre');

  codeBlocks.forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return;

    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerText = 'Copiar';

    button.addEventListener('click', () => {
      const code = pre.querySelector('code');
      const textToCopy = code ? code.innerText : pre.innerText;

      navigator.clipboard.writeText(textToCopy).then(() => {
        button.innerText = '¡Copiado!';
        button.classList.add('copied');

        setTimeout(() => {
          button.innerText = 'Copiar';
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Error al copiar: ', err);
      });
    });

    pre.appendChild(button);
  });
}
