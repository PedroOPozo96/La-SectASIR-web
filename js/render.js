document.addEventListener('DOMContentLoaded', () => {
  // Al entrar, solo activamos la navegación de las carpetas, NO mostramos los archivos.
  setupNavigation();
});

function setupNavigation() {
  const folders = document.querySelectorAll('.folder-btn');
  const btnBack = document.getElementById('btn-back');

  folders.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Nos aseguramos de capturar el clic en el botón, aunque se pulse en el icono SVG
      const botonClicado = e.target.closest('.folder-btn');
      if (!botonClicado) return;
      
      const category = botonClicado.getAttribute('data-target');
      openDirectory(category);
    });
  });

  if (btnBack) {
    // Al darle al botón "cd .." volvemos a la vista principal
    btnBack.addEventListener('click', closeDirectory);
  }
}

function openDirectory(categoria) {
  // Ocultamos la vista de carpetas y mostramos la vista de ficheros
  document.getElementById('gui-folders').style.display = 'none';
  document.getElementById('files-view').style.display = 'block';

  // Actualizamos el prompt de la terminal para que parezca que hemos navegado a la ruta
  const dirName = categoria === 'todas' ? '' : `/${categoria}`;
  document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas${dirName}$ ls -la`;

  // Renderizamos los archivos que tocan
  renderGrid(categoria);
}

function closeDirectory() {
  // Ocultamos ficheros y volvemos a mostrar carpetas
  document.getElementById('gui-folders').style.display = 'flex';
  document.getElementById('files-view').style.display = 'none';
  
  // Restauramos el prompt a la carpeta base
  document.getElementById('path-prompt').innerText = `pedrooliver@asir:~/la_sectasir/practicas$ ls -la`;
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
