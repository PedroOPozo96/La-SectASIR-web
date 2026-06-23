document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica del menú lateral interactivo
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.site-sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // -------------------------------------------------------------
  // 2. ¡IMPORTANTE! AQUÍ VA TU CÓDIGO ACTUAL DE RENDERIZADO
  // Pega aquí todo el código que ya tienes en tu js/render.js
  // que se encarga de leer practicas-data.js y generar el HTML
  // de las tarjetas o del interior del artículo.
  // -------------------------------------------------------------
  
  
  
  // -------------------------------------------------------------
  // 3. Inicializar los botones de copiar
  // Llama a esta función justo DESPUÉS de haber generado
  // e insertado el HTML de tu artículo en el DOM.
  // -------------------------------------------------------------
  initCopyButtons();
});

// Función para añadir los botones de copiar al código
function initCopyButtons() {
  // Buscamos todas las cajas de código del artículo
  const codeBlocks = document.querySelectorAll('.detail-body pre');

  codeBlocks.forEach((pre) => {
    // Si ya tiene botón (por si acaso se ejecuta dos veces), lo saltamos
    if (pre.querySelector('.copy-btn')) return;

    // Creamos el botón
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerText = 'Copiar';

    // Le damos la funcionalidad de copiar
    button.addEventListener('click', () => {
      // Pillamos el texto puro, sin etiquetas HTML
      const code = pre.querySelector('code');
      const textToCopy = code ? code.innerText : pre.innerText;

      // Usamos la API del portapapeles del navegador
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Feedback visual
        button.innerText = '¡Copiado!';
        button.classList.add('copied');

        // Lo devolvemos a la normalidad a los 2 segundos
        setTimeout(() => {
          button.innerText = 'Copiar';
          button.classList.remove('copied');
        }, 2000);
      });
    });

    // Añadimos el botón dentro de la caja <pre>
    pre.appendChild(button);
  });
}
