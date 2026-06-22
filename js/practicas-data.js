/**
 * ============================================================
 *  DATOS DE LAS PRÁCTICAS — La SectASIR
 * ============================================================
 *
 *  Para añadir una práctica nueva, copia uno de los bloques de
 *  abajo y pégalo dentro del array PRACTICAS, cambiando los
 *  valores. No hace falta tocar ningún otro archivo: tanto la
 *  página principal (index.html) como la página de detalle
 *  (practica.html) leen este archivo automáticamente.
 *
 *  CAMPOS:
 *  - id            -> identificador único, sin espacios ni acentos.
 *                     Se usa en la URL: practica.html?id=ESTE_VALOR
 *  - titulo        -> título de la práctica
 *  - categoria     -> una de: redes | servicios | iaw | infraestructura | bbdd
 *                     (corresponden a las asignaturas: Redes, Servicios,
 *                     Implantación de Aplicaciones Web, Infraestructura Virtual,
 *                     Base de Datos)
 *  - filename      -> nombre "de archivo" que aparece en la barra de la tarjeta
 *                     (estético, ej: "vlan-config.sh")
 *  - resumen       -> 1-2 frases para la tarjeta de la home
 *  - tags          -> array de tecnologías/herramientas usadas (chips)
 *  - fecha         -> texto libre, ej: "Octubre 2024" (opcional, para mostrar)
 *  - contenidoHTML -> el cuerpo de la página de detalle.
 *                     Puedes usar las clases ya preparadas:
 *                       <h2>Título de sección</h2>
 *                       <p>Texto normal</p>
 *                       <ul><li>...</li></ul>
 *                       <code>comando inline</code>
 *                       <pre><code>bloque de código\nmultilinea</code></pre>
 *                       <div class="detail-callout"><strong>Nota:</strong> texto</div>
 *                       <img class="detail-img" src="img/xxx.png">
 *                       <div class="detail-img-caption">Pie de foto</div>
 *
 * ============================================================
 */

const PRACTICAS = [

  {
    id: "vlan-config",
    titulo: "Configuración de VLANs en switch Cisco",
    categoria: "redes",
    filename: "vlan-config.sh",
    resumen: "Segmentación de una red de oficina en VLANs por departamento, con enrutamiento inter-VLAN y pruebas de conectividad.",
    tags: ["Cisco IOS", "Packet Tracer"],
    fecha: "Octubre 2024",
    contenidoHTML: `
      <h2>Objetivo</h2>
      <p>Segmentar la red de una oficina simulada en varias VLANs según departamento (Administración, Ventas y Dirección), de forma que cada departamento esté aislado a nivel de difusión (broadcast) pero pueda comunicarse con los demás a través de un router.</p>

      <h2>Entorno</h2>
      <p>Práctica realizada en <strong>Packet Tracer</strong> con un switch Cisco Catalyst configurado mediante línea de comandos (CLI), un router para el enrutamiento inter-VLAN y varios PCs de prueba.</p>

      <h2>Pasos realizados</h2>
      <ul>
        <li>Creación de las VLANs 10 (Administración), 20 (Ventas) y 30 (Dirección) en el switch.</li>
        <li>Asignación de los puertos de acceso a cada VLAN según el departamento.</li>
        <li>Configuración de un puerto troncal (trunk) entre el switch y el router.</li>
        <li>Configuración de subinterfaces en el router (router-on-a-stick) para permitir el enrutamiento entre VLANs.</li>
        <li>Pruebas de conectividad con <code>ping</code> entre equipos de la misma VLAN y de VLANs distintas.</li>
      </ul>

      <div class="detail-callout"><strong>Nota:</strong> antes de aplicar el trunking, ningún PC de una VLAN podía hacer ping a los de otra, confirmando el aislamiento correcto a nivel 2.</div>

      <h2>Comandos clave</h2>
      <pre><code>Switch(config)# vlan 10
Switch(config-vlan)# name ADMINISTRACION
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10</code></pre>

      <h2>Conclusiones</h2>
      <p>La segmentación por VLANs reduce el tráfico de broadcast y mejora la seguridad al aislar departamentos. El punto que más me costó entender fue el enrutamiento inter-VLAN con subinterfaces, pero una vez visto el concepto de "router-on-a-stick" quedó claro por qué se necesita un único enlace troncal hacia el router.</p>
    `
  },

  {
    id: "ad-deploy",
    titulo: "Despliegue de Active Directory",
    categoria: "servicios",
    filename: "ad-deploy.ps1",
    resumen: "Instalación de un controlador de dominio, creación de unidades organizativas, usuarios y políticas de grupo (GPO).",
    tags: ["Windows Server", "AD DS", "GPO"],
    fecha: "Noviembre 2024",
    contenidoHTML: `
      <h2>Objetivo</h2>
      <p>Montar un controlador de dominio desde cero en <strong>Windows Server</strong>, estructurar la organización en Unidades Organizativas (OUs) y aplicar políticas de grupo para restringir el comportamiento de los equipos cliente.</p>

      <h2>Entorno</h2>
      <p>Una máquina virtual con Windows Server haciendo de controlador de dominio, y un cliente Windows 10 unido al dominio para probar las políticas.</p>

      <h2>Pasos realizados</h2>
      <ul>
        <li>Instalación del rol <em>Active Directory Domain Services</em>.</li>
        <li>Promoción del servidor a controlador de dominio, creando el dominio <code>sectasir.local</code>.</li>
        <li>Creación de OUs para separar Alumnado, Profesorado y Equipos.</li>
        <li>Creación de usuarios y grupos de seguridad dentro de cada OU.</li>
        <li>Unión de un cliente Windows al dominio.</li>
        <li>Creación de una GPO para bloquear el acceso al Panel de Control en los equipos de la OU Alumnado.</li>
      </ul>

      <h2>Conclusiones</h2>
      <p>Entender la jerarquía de OUs fue la parte más importante: una buena estructura organizativa hace que aplicar políticas después sea mucho más sencillo y ordenado, en vez de tener que aplicar permisos usuario a usuario.</p>
    `
  },

  {
    id: "firewall-rules",
    titulo: "Firewall perimetral con iptables",
    categoria: "servicios",
    filename: "firewall-rules.conf",
    resumen: "Definición de reglas de filtrado, NAT y registro de tráfico sospechoso en un servidor Linux expuesto a internet.",
    tags: ["iptables", "Linux"],
    fecha: "Diciembre 2024",
    contenidoHTML: `
      <h2>Objetivo</h2>
      <p>Configurar un firewall perimetral en un servidor Linux usando <code>iptables</code>, permitiendo únicamente el tráfico necesario (SSH, HTTP/HTTPS) y registrando los intentos de conexión sospechosos.</p>

      <h2>Pasos realizados</h2>
      <ul>
        <li>Definición de una política por defecto restrictiva: <code>DROP</code> en INPUT.</li>
        <li>Apertura de los puertos 22 (SSH), 80 (HTTP) y 443 (HTTPS).</li>
        <li>Permiso de tráfico de retorno de conexiones ya establecidas (<code>ESTABLISHED,RELATED</code>).</li>
        <li>Configuración de NAT para redirigir tráfico hacia una máquina interna.</li>
        <li>Registro (log) de paquetes descartados para su posterior análisis.</li>
      </ul>

      <h2>Reglas principales</h2>
      <pre><code>iptables -P INPUT DROP
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j LOG --log-prefix "DROPPED: "</code></pre>

      <div class="detail-callout"><strong>Nota:</strong> es importante permitir el tráfico de loopback (<code>lo</code>) antes de aplicar la política restrictiva, o muchos servicios locales dejan de funcionar.</div>

      <h2>Conclusiones</h2>
      <p>Trabajar con una política por defecto de "denegar todo" y abrir solo lo necesario es mucho más seguro que al revés. Lo más delicado fue no bloquear mi propia conexión SSH mientras probaba las reglas en remoto.</p>
    `
  },

  {
    id: "ghost-blog-docker",
    titulo: "Despliegue de Ghost Blog con Docker Compose y migración a VPS",
    categoria: "infraestructura",
    filename: "docker-compose.yaml",
    resumen: "Instalación de Ghost Blog con MySQL 8.0 en Docker Compose, persistencia con bind mounts, y migración a un VPS con Nginx como proxy inverso y HTTPS mediante Let's Encrypt.",
    tags: ["Docker Compose", "Ghost", "MySQL", "Nginx", "Let's Encrypt"],
    fecha: "2025",
    contenidoHTML: `
      <h2>Objetivo</h2>
      <p>Instalar la plataforma de blogging <strong>Ghost</strong> junto con una base de datos <strong>MySQL 8.0</strong> usando Docker Compose, garantizando la persistencia de los datos mediante bind mounts. Después, migrar todo el proyecto a un VPS, exponerlo con <strong>Nginx</strong> como proxy inverso y asegurar el acceso con un certificado SSL de <strong>Let's Encrypt</strong>.</p>

      <h2>Entorno</h2>
      <p>La práctica se divide en cuatro fases: instalación en local con Docker Compose, prueba de persistencia de datos, migración del proyecto a un VPS, y configuración de Nginx + HTTPS en producción.</p>

      <h2>Parte 1 — Instalación local con Docker Compose</h2>
      <p>Se crea la estructura de carpetas y el archivo <code>docker-compose.yaml</code> con dos servicios: uno para MySQL y otro para Ghost, comunicados mediante una red interna de Docker (<code>ghost-net</code>).</p>
      <pre><code>mkdir ~/ghost-blog
cd ~/ghost-blog
mkdir ghost-data
mkdir mysql-data
nano docker-compose.yaml</code></pre>

      <pre><code>services:
  mysql:
    image: mysql:8.0
    container_name: ghost-mysql
    environment:
      MYSQL_ROOT_PASSWORD: tu_password_root_segura
      MYSQL_DATABASE: ghost
      MYSQL_USER: ghostuser
      MYSQL_PASSWORD: tu_password_segura
    volumes:
      - ./mysql-data:/var/lib/mysql
    networks:
      - ghost-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  ghost:
    image: ghost:latest
    container_name: ghost-blog
    ports:
      - "3001:2368"
    environment:
      database__client: mysql
      database__connection__host: mysql
      database__connection__user: ghostuser
      database__connection__password: tu_password_segura
      database__connection__database: ghost
      url: http://localhost:3001
    volumes:
      - ./ghost-data:/var/lib/ghost/content
    networks:
      - ghost-net
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

networks:
  ghost-net:
    driver: bridge</code></pre>

      <div class="detail-callout"><strong>Nota:</strong> la condición <code>service_healthy</code> en <code>depends_on</code> obliga a Ghost a esperar hasta que el healthcheck de MySQL confirme que la base de datos está realmente lista para aceptar conexiones, no solo que el contenedor se haya iniciado.</div>

      <p>Al levantar el proyecto con <code>docker compose up -d</code>, ambos contenedores arrancan correctamente y Ghost queda accesible en <code>http://localhost:3001</code>:</p>
      <pre><code>docker compose up -d
[+] Running 3/3
 ✔ Network ghost-net  Created
 ✔ Container ghost-mysql  Started
 ✔ Container ghost-blog  Started

docker compose ps
NAME          IMAGE          STATUS         PORTS
ghost-blog    ghost:latest   Up             0.0.0.0:3001->2368/tcp
ghost-mysql   mysql:8.0      Up (healthy)   3306/tcp</code></pre>

      <p>Desde el navegador se completa el asistente inicial de Ghost en <code>http://localhost:3001/ghost</code> (título del blog, usuario administrador y contraseña), y se publica un primer post de prueba para verificar que todo funciona en <code>http://localhost:3001</code>.</p>

      <h2>Parte 2 — Comprobación de persistencia con bind mounts</h2>
      <p>El objetivo de esta fase es demostrar que, aunque se eliminen los contenedores, los datos sobreviven porque están guardados fuera de ellos, en las carpetas <code>ghost-data/</code> y <code>mysql-data/</code> del host.</p>
      <pre><code>docker compose down
[+] Running 3/3
 ✔ Container ghost-blog   Removed
 ✔ Container ghost-mysql  Removed
 ✔ Network ghost-net      Removed

ls -lh ghost-data/
ls -lh mysql-data/</code></pre>
      <p>A pesar de que los contenedores ya no existen, ambas carpetas siguen conteniendo los archivos de Ghost y de MySQL. Al volver a levantar el proyecto:</p>
      <pre><code>docker compose up -d
docker compose logs -f ghost | grep "Your site is now available"</code></pre>
      <p>El post creado anteriormente sigue visible en <code>http://localhost:3001</code>, confirmando que la persistencia mediante bind mounts funciona correctamente.</p>

      <h2>Parte 3 — Migración del proyecto a un VPS</h2>
      <p>Con el proyecto funcionando en local, se comprime y se transfiere a un servidor VPS remoto para llevarlo a producción.</p>
      <pre><code># En local: comprimir el proyecto
cd ~
tar -czf ghost-blog-backup.tar.gz ghost-blog/
ls -lh ghost-blog-backup.tar.gz

# Copiar al VPS por SCP
scp ghost-blog-backup.tar.gz usuario@IP_DEL_VPS:/home/usuario/

# Conectarse al VPS y descomprimir
ssh usuario@IP_DEL_VPS
cd /home/usuario
tar -xzf ghost-blog-backup.tar.gz
cd ghost-blog
ls -la</code></pre>
      <p>Antes de levantar los contenedores en el VPS, se edita el <code>docker-compose.yaml</code> para que la variable <code>url</code> de Ghost apunte al dominio real en vez de a <code>localhost</code>:</p>
      <pre><code># De:
url: http://localhost:3001
# A:
url: https://tu-dominio.ejemplo.com</code></pre>
      <pre><code>docker compose up -d
docker compose ps</code></pre>

      <h2>Parte 4 — Nginx como proxy inverso y HTTPS con Let's Encrypt</h2>
      <p>Ghost queda escuchando en el puerto 3001 del VPS, pero no se expone directamente: se configura <strong>Nginx</strong> como proxy inverso para que sirva el sitio en los puertos estándar (80/443) y gestione el HTTPS.</p>
      <pre><code>sudo nano /etc/nginx/sites-available/tu-dominio.ejemplo.com</code></pre>
      <pre><code>server {
    listen 80;
    server_name tu-dominio.ejemplo.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # WebSocket support para Ghost
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 50M;
}</code></pre>
      <pre><code>sudo ln -s /etc/nginx/sites-available/tu-dominio.ejemplo.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx</code></pre>

      <p>Con el DNS del dominio ya apuntando a la IP del VPS, se instala Certbot y se solicita el certificado SSL:</p>
      <pre><code>sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.ejemplo.com</code></pre>
      <p>Certbot verifica el dominio, obtiene el certificado de Let's Encrypt, configura HTTPS automáticamente en Nginx y redirige todo el tráfico HTTP a HTTPS.</p>

      <div class="detail-callout"><strong>Resultado:</strong> al acceder a <code>https://tu-dominio.ejemplo.com</code> el blog carga correctamente con el candado verde de conexión segura, mostrando el mismo post creado en local — confirmando que tanto los datos como la configuración sobrevivieron a toda la migración.</div>

      <h2>Comandos de mantenimiento útiles</h2>
      <pre><code># Iniciar el escenario
docker compose up -d

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Reiniciar
docker compose restart</code></pre>

      <h2>Troubleshooting</h2>
      <p><strong>Ghost no conecta con MySQL:</strong> esperar a que el healthcheck de MySQL marque el contenedor como <code>healthy</code> antes de que Ghost intente conectar; revisar con <code>docker compose logs mysql</code>.</p>
      <p><strong>El dominio no resuelve hacia el VPS:</strong> comprobar la propagación DNS con <code>nslookup tu-dominio.ejemplo.com</code> y confirmar que apunta a la IP correcta.</p>
      <p><strong>Problemas con el certificado SSL:</strong> verificar la sintaxis de Nginx con <code>sudo nginx -t</code>, recargar con <code>sudo systemctl reload nginx</code>, y si hace falta renovar el certificado con <code>sudo certbot renew --force-renewal -d tu-dominio.ejemplo.com</code>.</p>

      <h2>Conclusiones</h2>
      <p>Esta práctica cubre un ciclo completo muy realista en infraestructura: levantar un servicio con contenedores, garantizar que los datos no dependan del ciclo de vida de esos contenedores (bind mounts), y llevar todo a producción de forma segura con proxy inverso y HTTPS. La parte que más me ayudó a entender el "por qué" de las cosas fue comprobar la persistencia borrando y recreando los contenedores: ver que el post seguía ahí hizo que el concepto de bind mount dejara de ser teoría y pasara a ser algo tangible.</p>
    `
  }

];

/**
 * No tocar nada de aquí abajo — son utilidades que usan
 * index.html y practica.html para leer el array de arriba.
 */
const CATEGORIAS_LABEL = {
  redes: "Redes",
  servicios: "Servicios",
  iaw: "Implantación de Aplicaciones Web",
  infraestructura: "Infraestructura Virtual",
  bbdd: "Base de Datos"
};

function getPracticaById(id) {
  return PRACTICAS.find(p => p.id === id);
}
