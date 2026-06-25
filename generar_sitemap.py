import os
from datetime import datetime

def generar_sitemap(base_url, archivo_salida="sitemap.xml"):
    # Buscaremos todos los archivos .html de forma dinámica
    paginas_html = []
    
    for raiz, directorios, archivos in os.walk("."):
        # Saltamos carpetas ocultas o de configuración de Git
        if any(parte.startswith('.') for parte in raiz.split(os.sep)):
            continue
            
        for archivo in archivos:
            if archivo.endswith(".html"):
                # Conseguimos la ruta relativa al directorio raíz
                ruta_relativa = os.path.relpath(os.path.join(raiz, archivo), ".")
                # Normalizamos las barras para entornos web (foward slashes)
                ruta_url = ruta_relativa.replace(os.sep, "/")
                
                # Si es el index, la ruta base es suficiente
                if ruta_url == "index.html":
                    paginas_html.append("")
                else:
                    paginas_html.append(ruta_url)

    # Ordenamos la lista para que el XML quede limpio y estructurado
    paginas_html.sort()

    # Fecha actual en formato ISO (AAAA-MM-DD) requerido por buscadores
    fecha_hoy = datetime.now().strftime("%Y-%m-%d")

    # Cabecera estándar del protocolo Sitemap
    xml_contenido = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_contenido += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for pagina in paginas_html:
        url_completa = f"{base_url}{pagina}"
        
        # Asignación inteligente de prioridades y frecuencias según el tipo de página
        if pagina == "":
            prioridad = "1.0"
            frecuencia = "weekly"
        elif "sobre-mi" in pagina:
            prioridad = "0.8"
            frecuencia = "monthly"
        elif "contacto" in pagina:
            prioridad = "0.5"
            frecuencia = "yearly"
        elif "practicas" in pagina:
            prioridad = "0.7"
            frecuencia = "monthly"
        else:
            prioridad = "0.6"
            frecuencia = "monthly"

        xml_content_bloque = (
            "  <url>\n"
            f"    <loc>{url_completa}</loc>\n"
            f"    <lastmod>{fecha_hoy}</lastmod>\n"
            f"    <changefreq>{frecuencia}</changefreq>\n"
            f"    <priority>{prioridad}</priority>\n"
            "  </url>\n"
        )
        xml_contenido += xml_content_bloque

    xml_contenido += "</urlset>\n"

    # Escritura del archivo final con codificación UTF-8
    with open(archivo_salida, "w", encoding="utf-8") as f:
        f.write(xml_contenido)
    
    print(f"[OK] Sitemap generado con éxito con {len(paginas_html)} URLs en '{archivo_salida}'.")

if __name__ == "__main__":
    # Configuración de tu dominio profesional con HTTPS activo
    DOMINIO_BASE = "https://www.lasectasir.com/"
    generar_sitemap(DOMINIO_BASE)