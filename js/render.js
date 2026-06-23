document.addEventListener('DOMContentLoaded', () => {
  renderGrid('todas');
  setupFilters();
});

function renderGrid(filtro = 'todas') {
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

function setupFilters() {
  const botones = document.querySelectorAll('.folder-btn');
  
  botones.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const botonClicado = e.target.closest('.folder-btn');
      
      if (!botonClicado) return;

      botones.forEach(b => b.classList.remove('active'));
      botonClicado.classList.add('active');
      
      const filtro = botonClicado.getAttribute('data-filter');
      renderGrid(filtro);
    });
  });
}
