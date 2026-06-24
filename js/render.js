document.addEventListener('DOMContentLoaded', () => {
  // 1. ENRUTADOR: Detectamos en qué página estamos leyendo los parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idPractica = urlParams.get('id');
  const catPractica = urlParams.get('cat'); // Añadido para recordar la carpeta

  if (idPractica) {
    // Si hay una ID en la URL, estamos en practicas/practica.html
    renderSinglePractica(idPractica);
  } else {
    // Si no hay ID, estamos en la portada (index.html)
    setupNavigation();
    
    // Si venimos rebotados de una práctica, abrimos su carpeta directamente
    if (catPractica) {
      openDirectory(catPractica);
    }
  }
});

/* ==========================================================================
   LÓGICA DE LA PORTADA (CARPETAS Y FICHEROS)
   ========================================================================== */

function setupNavigation() {
  const folders = document.querySelectorAll('.folder-btn');
  const btnBack = document.getElementById('btn-back');

  // Si no existen los botones de carpeta (porque no estamos en el index), salimos
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

    const dirName = categoria === 'todas' ? '' : `/${categoria}`;
    document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas${dirName}$ ls -la`;

    renderGrid(categoria);
  }
}

function closeDirectory() {
  document.getElementById('gui-folders').style.display = 'flex';
  document.getElementById('files-view').style.display = 'none';
  
  document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas$ ls -la`;
  
  // Limpiamos la URL para no arrastrar la categoría si recargamos en la raíz
  window.history.pushState({}, document.title, window.location.pathname + '#practicas');
}

function renderGrid(filtro) {
  const grid = document.getElementById('practice-grid');
  if (!grid || typeof PRACTICAS === 'undefined') return;

  grid.innerHTML = ''; 

  const datosFiltrados = filtro === 'todas' 
    ? PRACTICAS 
    : PRACTICAS.filter(p => p.categoria === filtro);

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
  
  // Buscamos la práctica en el array de practicas-data.js
  const practica = PRACTICAS.find(p => p.id === id);
  
  if (!practica) {
    const container = document.querySelector('main') || document.body;
    container.innerHTML = '<div style="text-align:center; padding: 100px 20px;"><h1 style="color:#ef4444;">Error 404</h1><p>El fichero solicitado no existe en el sistema.</p><a href="../index.html" style="color:#60a5fa; text-decoration:none;">cd .. (volver al inicio)</a></div>';
    return;
  }

  // Actualizamos el título de la pestaña del navegador
  document.title = practica.titulo + " — La SectASIR";

  // Inyectamos los datos en los contenedores de practica.html
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

  // MAGIA: Configuramos dinámicamente el botón de volver para que recuerde la categoría
  const urlRetorno = `../index.html?cat=${practica.categoria}#practicas`;
  
  // 1. Modificamos el enlace normal de "cd .."
  const btnBack = document.getElementById('btn-back-to-folder');
  if (btnBack) {
    btnBack.href = urlRetorno;
  }
  
  // 2. Guardamos la variable global para el script de animación del botón rojo
  window.returnToFolderUrl = urlRetorno;
}
