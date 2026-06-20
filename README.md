# La SectASIR — Portfolio de prácticas ASIR

## Estructura del proyecto

```
la-sectasir/
├── index.html              ← página principal (home)
├── css/
│   └── styles.css          ← todos los estilos (compartidos por home y detalle)
├── js/
│   ├── practicas-data.js   ← AQUÍ se añaden las prácticas nuevas
│   └── render.js           ← lógica que pinta las tarjetas y el detalle (no tocar)
├── practicas/
│   └── practica.html       ← plantilla ÚNICA para TODAS las prácticas
└── img/                     ← aquí van las capturas de pantalla
```

## Cómo añadir una práctica nueva

1. Abre `js/practicas-data.js`
2. Copia uno de los bloques `{ ... }` del array `PRACTICAS`
3. Pégalo y cambia los valores (id, título, categoría, tags, contenido...)
4. Guarda. Listo — aparecerá automáticamente en la home y tendrá su propia
   página en `practicas/practica.html?id=tu-id`

No hace falta crear ningún archivo HTML nuevo ni tocar `render.js` ni `index.html`.

### Categorías disponibles
`redes` · `servicios` · `iaw` · `infraestructura` · `bbdd`

(Si quieres añadir una categoría nueva, hay que añadir también un botón de
filtro en `index.html` dentro de `<div class="filters">` y una entrada en
`CATEGORIAS_LABEL` en `practicas-data.js`.)

### Añadir imágenes a una práctica
1. Guarda la imagen en la carpeta `img/`
2. En el campo `contenidoHTML` de la práctica, añade:
```html
<img class="detail-img" src="../img/nombre-de-tu-imagen.png">
<div class="detail-img-caption">Texto descriptivo de la imagen</div>
```

## Cómo probarlo en local

Como la web carga los datos con JavaScript, abrir el `index.html` con
doble clic (protocolo `file://`) puede dar problemas en algunos navegadores.
Para verlo bien en tu ordenador antes de publicar, levanta un mini-servidor:

**Si tienes Python instalado** (casi seguro que sí, viene en muchas distros Linux):
```bash
cd la-sectasir
python3 -m http.server 8000
```
Luego abre `http://localhost:8000` en el navegador.

**Si tienes Node.js instalado**, alternativa:
```bash
npx serve la-sectasir
```

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio en GitHub (puede ser el que ya tenías en mente)
2. Sube todos estos archivos a la rama `main` (manteniendo la estructura de carpetas)
3. Ve a **Settings → Pages** en el repositorio
4. En "Source", elige la rama `main` y la carpeta `/ (root)`
5. Guarda. En 1-2 minutos tu web estará en:
   `https://tu-usuario.github.io/nombre-del-repo/`

A partir de ahí, cada vez que hagas `git push` con cambios (por ejemplo,
una práctica nueva en `practicas-data.js`), la web se actualiza sola.
