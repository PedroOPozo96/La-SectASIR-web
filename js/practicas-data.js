/**
 * ============================================================
 * DATOS DE LAS PRÁCTICAS — La SectASIR
 * ============================================================
 */

const PRACTICAS = [

  /**
   * ============================================================
   * 1. PRÁCTICA: GHOST BLOG CON DOCKER
   * ============================================================
   */
  {
    id: "ghost-blog-docker",
    titulo: "Despliegue de Ghost Blog con Docker Compose y migración a VPS",
    categoria: "infraestructura",
    filename: "ghost-blog-docker",
    extension: ".pdf",
    resumen: "Instalación de Ghost Blog con MySQL 8.0 en Docker Compose, persistencia con bind mounts, y migración a un VPS con Nginx como proxy inverso y HTTPS mediante Let's Encrypt.",
    tags: ["Docker Compose", "Ghost", "MySQL", "Nginx", "Let's Encrypt"],
    fecha: "Junio 2026",
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
NAME          IMAGE          STATUS          PORTS
ghost-blog    ghost:latest   Up              0.0.0.0:3001->2368/tcp
ghost-mysql   mysql:8.0      Up (healthy)    3306/tcp</code></pre>

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
  },

  /**
   * ============================================================
   * 2. PRÁCTICA: INSTALACIÓN MARIADB
   * ============================================================
   */
  {
    id: "mariadb-debian13",
    titulo: "Instalación, configuración y uso de MariaDB en Debian 13",
    categoria: "gbdd",
    filename: "install-mariadb",
    extension: ".pdf",
    resumen: "Guía completa: desde la actualización del sistema y la instalación de MariaDB-server, hasta la fortificación con mysql_secure_installation y la gestión de usuarios.",
    tags: ["MariaDB", "Debian 13", "SQL", "Seguridad", "Usuarios"],
    fecha: "Junio 2026",
    contenidoHTML: `
      <h2>1. Instalación de MariaDB</h2>
      <p>Paso 1: Vamos a abrir el terminal y vamos a ejecutar los siguientes comandos:</p>
      
      <pre><code>sudo apt update
sudo apt upgrade
sudo apt install mariadb-server</code></pre>
      <ul>
        <li><code>sudo apt update</code> -> Vemos los paquetes que hay por actualizar en el sistema.</li>
        <li><code>sudo apt upgrade</code> -> En caso de que hubiera algún paquete lo actualizamos.</li>
        <li><code>sudo apt install mariadb-server</code> -> Con este vamos a instalar mariadb-server.</li>
      </ul>

      <p>Cuando hemos instalado <code>mariadb-server</code>, vamos a iniciar y habilitar el servicio:</p>
      <pre><code>sudo systemctl start mariadb
sudo systemctl enable mariadb</code></pre>

      <p>Y utilizando <code>sudo systemctl status mariadb</code>, podemos comprobar si el servicio está funcionando correctamente:</p>
      
      <img src="../img/mariadb/mariadb-1-status.png" alt="Estado del servicio MariaDB" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h2>Configuración inicial de seguridad</h2>
      <p>Paso 2: Una vez que hemos instalado e iniciado MariaDB vamos a realizar una configuración inicial ejecutando:</p>
      <pre><code>sudo mariadb-secure-installation</code></pre>
      <p>Sirve para aplicar configuraciones básicas de seguridad en MariaDB tras la instalación.</p>

      <h3>1. Configurar contraseña de root</h3>
      <p>Permite asignar o cambiar la contraseña del usuario administrador (root) de MariaDB. En Debian, normalmente root usa autenticación <code>unix_socket</code> (sin contraseña, solo accesible con sudo), pero aquí puedes forzar el uso de contraseña. En la contraseña ponemos lo que queramos pero yo siempre pongo <strong>root</strong> que es fácil de recordar.</p>

      <img src="../img/mariadb/mariadb-2-pass.png" alt="Configurar contraseña root" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>2. Eliminar usuarios anónimos</h3>
      <p>Borra las cuentas de MariaDB sin nombre de usuario, que permiten entrar sin credenciales. Mejora la seguridad, ya que nadie podrá conectarse "de invitado".</p>

      <img src="../img/mariadb/mariadb-3-anon.png" alt="Eliminar usuarios anónimos" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>3. Restringir acceso remoto al root</h3>
      <p>Evita que el usuario root se conecte desde otras máquinas por la red. Solo podrá conectarse desde localhost, es decir, desde el propio servidor. Reduce el riesgo de ataques externos.</p>

      <img src="../img/mariadb/mariadb-4-remote.png" alt="Deshabilitar login remoto root" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>4. Eliminar la base de datos de prueba</h3>
      <p>MariaDB trae por defecto una base de datos de pruebas (<code>test</code>) accesible para cualquiera. El script la elimina y también borra sus permisos. Esto evita que se use con fines indebidos.</p>

      <img src="../img/mariadb/mariadb-5-test.png" alt="Eliminar test db" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>5. Recargar privilegios</h3>
      <p>Refresca las tablas de permisos para aplicar de inmediato todos los cambios anteriores.</p>

      <img src="../img/mariadb/mariadb-6-reload.png" alt="Recargar privilegios" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h2>2. Creación de usuarios, base de datos y permisos.</h2>
      <p>En primer lugar vamos a entrar a MariaDB en el modo root para entrar como administradores, podemos hacerlo de dos formas:</p>
      
      <pre><code>sudo mysql -u root -p</code></pre>
      <p>Con <code>-u</code> le indicamos el usuario y con <code>-p</code> nos pedirá la contraseña. También podemos entrar sin usar la opción <code>-p</code> y nos permitirá entrar igual (por el socket de unix).</p>

      <h3>2.1. Crear usuario</h3>
      <p>Ahora una vez dentro del usuario root vamos a crear un usuario nuevo que no sea administrador al cual llamaremos <strong>SCOTT</strong> que es con el que trabajamos en clase y de contraseña le ponemos <strong>TIGGER</strong>.</p>
      <pre><code>CREATE USER 'SCOTT'@'localhost' IDENTIFIED BY 'TIGGER';</code></pre>

      <h3>2.2. Creación de la base de datos</h3>
      <p>A continuación vamos a crear una base de datos que asignaremos al usuario SCOTT la cual vamos a llamarle <strong>empresa</strong>.</p>
      <pre><code>CREATE DATABASE empresa;</code></pre>

      <img src="../img/mariadb/mariadb-7-createdb.png" alt="Creación de base de datos empresa" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>2.3. Dar permisos al usuario y la base de datos.</h3>
      <pre><code>GRANT ALL PRIVILEGES ON empresa.* TO 'SCOTT'@'localhost';</code></pre>

      <img src="../img/mariadb/mariadb-8-grant.png" alt="Otorgar privilegios a SCOTT" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>2.4. Acceso al usuario nuevo y la Base de datos.</h3>
      <p>Una vez hemos hecho todo lo anterior ya podemos salir del usuario root y vamos a entrar con SCOTT aquí si es importante poner <code>-p</code> porque no es un usuario administrador y nos pedirá la contraseña obligatoriamente.</p>
      <pre><code>mysql -u SCOTT -p</code></pre>

      <img src="../img/mariadb/mariadb-9-login.png" alt="Login con el usuario SCOTT" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
    `
  },

  /**
   * ============================================================
   * 3. PRÁCTICA: INSTALACIÓN POSTGRESQL
   * ============================================================
   */
  {
    id: "postgresql-debian13",
    titulo: "Instalación, configuración y uso de PostgreSQL en Debian 13",
    categoria: "gbdd",
    filename: "install-postgresql",
    extension: ".pdf",
    resumen: "Guía de instalación de PostgreSQL, creación de roles y bases de datos, y resolución del error de autenticación Peer configurando el fichero pg_hba.conf.",
    tags: ["PostgreSQL", "Debian 13", "SQL", "pg_hba.conf", "Seguridad"],
    fecha: "Junio 2026",
    contenidoHTML: `
      <h2>1. Instalación de PostgreSQL</h2>
      <p>Vamos a abrir el terminal y ejecutar los siguientes comandos para actualizar el sistema e instalar el servidor junto con sus contribuciones adicionales:</p>
      
      <pre><code>sudo apt update
sudo apt upgrade
sudo apt install postgresql postgresql-contrib</code></pre>

      <p>Antes de comenzar la instalación nos sale el paquete que se va a instalar y más abajo todas las librerías o dependencias necesarias. Pulsamos "S" y damos a enter para continuar.</p>
      
      <img src="../img/postgresql/postgres-1-install.png" alt="Instalación de dependencias de PostgreSQL" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>Una vez que termine la instalación, podemos ver si el servicio está activo ejecutando:</p>
      <pre><code>sudo systemctl status postgresql</code></pre>

      <img src="../img/postgresql/postgres-2-status.png" alt="Estado del servicio PostgreSQL" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h2>2. Creación de usuarios, base de datos y configuración</h2>
      <p>A diferencia de MariaDB, en PostgreSQL el usuario administrador por defecto se llama <code>postgres</code> y utiliza autenticación del sistema (Peer). Accedemos a la consola de PostgreSQL así:</p>
      
      <pre><code>sudo -u postgres psql</code></pre>

      <img src="../img/postgresql/postgres-3-login-root.png" alt="Login con el usuario postgres" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>2.1. Creación del Usuario</h3>
      <p>A continuación vamos a crear el usuario <strong>scott</strong> y de contraseña le ponemos <em>tigger</em>, igual que hicimos en MariaDB.</p>
      
      <pre><code>CREATE USER scott WITH PASSWORD 'tigger';</code></pre>

      <img src="../img/postgresql/postgres-4-create-user.png" alt="Creación de rol scott" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <div class="detail-callout"><strong>Nota:</strong> Una cosa buena que tiene PostgreSQL es que cuando vamos añadiendo comandos, si le damos al tabulador nos autocompleta lo que queremos escribir. Además, es recomendable crear los usuarios siempre en minúsculas para evitar problemas de conexión.</div>

      <h3>2.2. Creación de la Base de Datos</h3>
      <p>Crearemos la base de datos asignándola al usuario que acabamos de crear de la siguiente forma:</p>
      
      <pre><code>CREATE DATABASE empresa OWNER scott;</code></pre>

      <img src="../img/postgresql/postgres-5-create-db.png" alt="Creación de la base de datos empresa" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>2.3. Asignación de permisos</h3>
      <p>Por último le vamos a añadir los permisos a la base de datos empresa sobre el usuario scott:</p>

      <pre><code>GRANT ALL PRIVILEGES ON DATABASE empresa TO scott;</code></pre>

      <img src="../img/postgresql/postgres-6-grant.png" alt="Asignación de privilegios" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>2.4. Error de Autenticación</h3>
      <p>Ya podemos salir del usuario administrador e intentar entrar al usuario y la base de datos que hemos creado, pero nos encontraremos con un problema:</p>
      
      <pre><code>psql -U scott -d empresa</code></pre>
      
      <img src="../img/postgresql/postgres-7-error-peer.png" alt="Error de autenticación Peer" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>Este error ocurre porque tiene una autenticación <strong>peer</strong>, lo que significa que intenta buscar el usuario scott como un usuario que exista en nuestro sistema operativo Debian, lo cual no es nuestro caso.</p>

      <h2>3. Solución: Fichero de configuración pg_hba.conf</h2>
      <p>Una de las soluciones sería crear en nuestro Debian un usuario scott, pero cargaríamos el Sistema Operativo con usuarios que solo vamos a usar para la BD. Existe otro método: entrar en el fichero de configuración <code>pg_hba.conf</code> y cambiar el tipo de autenticación.</p>
      
      <pre><code>sudo nano /etc/postgresql/17/main/pg_hba.conf</code></pre>

      <img src="../img/postgresql/postgres-8-nano-open.png" alt="Abriendo el archivo pg_hba.conf" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>Método 1: Autenticación MD5 global</h3>
      <p>Bajaremos hasta abajo del todo. Sustituimos <code>postgresql</code> por <code>all</code> y <code>peer</code> por <code>md5</code>. Con esto estamos diciendo que todos los usuarios entrarán con todas sus bases de datos con autenticación md5.</p>

      <img src="../img/postgresql/postgres-9-nano-md5.png" alt="Cambiando peer por md5 globalmente" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>Método 2: Otro método arreglándolo con una regla específica</h3>
      <p>Existe otro método que sería dejar la línea que hemos tocado tal y como está y añadir nosotros debajo nuestra database "empresa" y usuario "scott" con autenticación md5:</p>
      
      <pre><code># TYPE  DATABASE   USER    ADDRESS    METHOD
local   empresa    scott              md5</code></pre>

      <img src="../img/postgresql/postgres-10-nano-specific.png" alt="Añadiendo regla específica en pg_hba" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h2>4. Aplicar cambios y comprobar acceso</h2>
      <p>Le damos a <code>CTRL + X</code>, luego <code>Y</code> y <code>Enter</code> para guardar los cambios. Después reiniciamos el servicio:</p>
      
      <pre><code>sudo systemctl restart postgresql</code></pre>

      <p>Ahora sí, volvemos a ejecutar el comando con el que entramos al usuario scott con la base de datos empresa. Nos pedirá la contraseña y entraremos directamente.</p>

      <pre><code>psql -U scott -d empresa</code></pre>

      <img src="../img/postgresql/postgres-11-success.png" alt="Login exitoso en PostgreSQL" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
      
      <p>Y hasta aquí estaría todo instalado y configurado correctamente.</p>
    `
  },

  /**
   * ============================================================
   * 4. PRÁCTICA: INSTALACIÓN ORACLE 21c
   * ============================================================
   */
  {
    id: "instalacion-oracle-21c-debian13",
    filename: "install-oracle21c",
    extension: ".pdf",
    titulo: "Instalación, configuración y uso de Oracle 21c EE en Debian 13",
    resumen: "Guía completa para instalar Oracle 21c Enterprise Edition en Debian 13, resolviendo problemas de dependencias y configurando PL/SQL.",
    fecha: "Junio 2026",
    categoria: "gbdd",
    tags: ["Oracle 21c", "Debian 13", "PL/SQL", "Bases de Datos"],
    contenidoHTML: `
      <h2>Objetivo</h2>
      <p>Instalación paso a paso de Oracle 21c Enterprise Edition en un entorno virtualizado con Debian 13, resolviendo los problemas de dependencias actuales y configurando el entorno de forma persistente para el desarrollo con PL/SQL.</p>
      
      <h3>1. Requisitos y Dependencias Previas</h3>
      <p>Antes de realizar la instalación en una máquina real, mi recomendación es hacer la instalación en una máquina virtual ya sea en Proxmox, VMware, Virtualbox o Virtmanager. Y con esto evitar cualquier error en la máquina física y en especial en nuestra máquina de clase.</p>
      <p>Cualquiera es válida pero yo personalmente voy a utilizar Virtmanager donde tengo una máquina con Debian 13 la cual solo usaré para Oracle.</p>
      
      <img src="../img/oracle/oracle-1-virtmanager.png" alt="Gestor de máquinas virtuales" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
      
      <p>El mínimo puede ser 4 o 6 GB de RAM pero lo recomendado son 8GB, por lo que sé la mayoría de ordenadores de clase cuentan con 16 GB de RAM así que creo podremos ponerle 8 sin problema.</p>

      <img src="../img/oracle/oracle-2-memoria.png" alt="Configuración de memoria de la máquina virtual" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>En primer lugar vamos a realizar un <code>sudo apt update</code> y luego instalaremos los paquetes necesarios. En Debian 13, el antiguo paquete <code>libaio1</code> ha cambiado a <code>libaiolt64</code>, lo que requiere crear un enlace simbólico para que el instalador de Oracle lo reconozca.</p>
      <pre><code>sudo apt update
sudo apt install rlwrap libaiolt64 libaio-dev unixodbc wget -y
sudo ln -s /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1</code></pre>

      <img src="../img/oracle/oracle-3-deps.png" alt="Instalación de dependencias libaio" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
      
      <div class="detail-callout">
        <strong>NOTA IMPORTANTE:</strong> Hay que tener cuidado con no olvidar esta parte, me ha pasado varias veces que se me olvidó y los errores que se generan al continuar con los pasos posteriores son difíciles de arreglar y muy confusos, por eso mejor hacerlo en máquinas virtuales que podamos eliminar sin problemas.
      </div>

      <h3>2. Descarga e Instalación de Oracle</h3>
      <p>Con el comando <code>wget</code> descargamos el fichero de instalación, esto puede tardar un rato dependiendo de la conexión a Internet que tengamos.</p>
      <pre><code>wget https://files.diegovargas.es/deb/oracle-database-ee-21c_1.0-2_amd64.deb</code></pre>
      
      <img src="../img/oracle/oracle-4-wget.png" alt="Descarga de Oracle con wget" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
      
      <p>Ahora con el comando <code>dpkg</code> instalaremos el paquete. Ignoren el mensaje que sale de "fallo al crear el enlace simbólico '/bin/awk': El fichero ya existe", la instalación continuará sin problema.</p>
      <pre><code>sudo dpkg -i oracle-database-ee-21c_1.0-2_amd64.deb</code></pre>

      <img src="../img/oracle/oracle-5-dpkg.png" alt="Instalación del paquete deb de Oracle" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>3. Configuración de Oracle</h3>
      <p>Este comando lo usamos para añadir una IP al host para alguna funciones que tiene Oracle:</p>
      <pre><code>echo "$(hostname -I | awk '{print $1}') $(hostname)" | sudo tee -a /etc/hosts</code></pre>

      <img src="../img/oracle/oracle-6-hosts-cmd.png" alt="Comando echo hosts" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
      <img src="../img/oracle/oracle-7-hosts-nano.png" alt="Archivo hosts modificado en nano" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>A continuación vamos a ejecutar un comando que completará las configuraciones que Oracle necesita:</p>
      <pre><code>sudo /etc/init.d/oracledb_ORCLCDB-21c configure</code></pre>

      <img src="../img/oracle/oracle-8-config-cmd.png" alt="Comando de configuración" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>Veremos el progreso de la configuración hasta llegar al 100% y crear la base de datos:</p>
      <img src="../img/oracle/oracle-9-config-output.png" alt="Salida del comando configure" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>Utilizamos este comando para añadir nuestro usuario al grupo dba para que Oracle lo reconozca y nos permita entrar al administrador, y añadimos los alias que va a utilizar Oracle:</p>
      <pre><code>sudo usermod -aG dba $USER
echo 'export ORACLE_HOME=/opt/oracle/product/21c/dbhome_1' >> ~/.bashrc
echo 'export ORACLE_SID=ORCLCDB' >> ~/.bashrc
echo 'export NLS_LANG=SPANISH_SPAIN.AL32UTF8' >> ~/.bashrc
echo 'export ORACLE_BASE=/opt/oracle' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=$ORACLE_HOME/lib:$LD_LIBRARY_PATH' >> ~/.bashrc
echo 'export PATH=$ORACLE_HOME/bin:$PATH' >> ~/.bashrc
echo "alias sqlplus='rlwrap sqlplus'" >> ~/.bashrc
source ~/.bashrc</code></pre>

      <h3>4. Uso de Oracle y Persistencia del Servicio</h3>
      <p>Entramos en Oracle con el comando <code>sqlplus / as sysdba</code>. En un primer momento podemos ver el mensaje de "Conectado a una instancia inactiva". Salimos de Oracle ejecutando un <code>exit</code> y volvemos a la consola normal de Debian.</p>
      <p>Vamos a ejecutar <code>sudo crontab -e</code> y pegaremos esta línea al final para que el servicio de Oracle se active cada vez que iniciemos la máquina virtual:</p>
      <pre><code>@reboot sudo systemctl restart oracledb_ORCLCDB-21c.service</code></pre>

      <img src="../img/oracle/oracle-10-crontab.png" alt="Añadiendo servicio a crontab" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>5. Configuración de sesión y creación de usuario</h3>
      <p>Por otro lado hay un comando que deberemos poner cada vez que queramos crear un usuario nuevo y es: <code>ALTER SESSION SET "_ORACLE_SCRIPT"=true;</code>.</p>
      <pre><code>sqlplus / as sysdba
ALTER SESSION SET "_ORACLE_SCRIPT"=true;</code></pre>

      <img src="../img/oracle/oracle-11-altersession.png" alt="Alter session en Oracle" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <p>Visto esto ahora podemos crear el usuario Scott aquí en oracle, una cosa que distingue a Oracle de MariaDB y Postgresql es que aquí no se crean database aquí solo crearemos el usuario y le daremos los permisos.</p>
      <pre><code>CREATE USER Scott IDENTIFIED BY Tiger;
GRANT ALL PRIVILEGES TO Scott;
Conn Scott; --> este es para conectarnos al usuario una vez lo hemos creado y le damos los permisos.</code></pre>

      <img src="../img/oracle/oracle-12-createuser.png" alt="Creación de usuario Scott" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
      <img src="../img/oracle/oracle-13-conn.png" alt="Conexión con el usuario Scott" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h3>6. Habilitar comando de forma permanente para PLSQL</h3>
      <p>Vamos a habilitar esta opción en Oracle para realizar procedimientos y funciones con PLSQL sin tener que poner el comando <code>SET SERVEROUTPUT ON</code> cada vez que los creemos. Este método es válido tanto para Oracle 21c XE como para Oracle 21c EE.</p>
      
      <h4>6.1. Editamos el fichero de inicio de sesión de Oracle</h4>
      <p>Lo que tenemos que hacer es buscar el fichero <code>glogin.sql</code> fichero que se genera automáticamente cuando lo hemos instalado, el cuál suele utilizar Oracle cada vez que inicia sesión.</p>
      <pre><code>sudo nano /opt/oracle/product/21c/dbhome_1/sqlplus/admin/glogin.sql
# Añadir al final del archivo:
SET SERVEROUTPUT ON
PROMPT *** Pedro Bienvenido a ORACLE ***</code></pre>
      
      <img src="../img/oracle/oracle-14-glogin.png" alt="Configuración de glogin.sql" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

      <h4>6.2. Le damos permisos a ese fichero</h4>
      <p>Por si acaso no los tuviera ya le daremos los siguientes permisos al fichero y le cambiamos la propiedad:</p>
      <pre><code>sudo chmod 644 /opt/oracle/product/21c/dbhome_1/sqlplus/admin/glogin.sql
sudo chown oracle:oinstall /opt/oracle/product/21c/dbhome_1/sqlplus/admin/glogin.sql</code></pre>

      <h4>6.3. Pruebas para verificarlo y procedimientos</h4>
      <p>Y aquí tenemos los resultados de las pruebas utilizando el esquema recién creado y verificando la funcionalidad de PL/SQL:</p>

      <img src="../img/oracle/oracle-15-test.png" alt="Pruebas de conexión y PL/SQL" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

    `
  },

/**
     * ============================================================
     * 5. PRÁCTICA: LOS JUEGOS DEL HAMBRE (ENRUTAMIENTO, ACL, DHCP)
     * ============================================================
     */
    {
      id: "acl-dhcp-juegos-del-hambre",
      titulo: "Los Juegos del Hambre: Enrutamiento, ACL y DHCP.",
      categoria: "redes",
      filename: "juegos-del-hambre",
      extension: ".pdf",
      resumen: "Simulación de una red con 5 routers y varios distritos enfrentados, resolviendo enrutamiento estático, ACL estándar y extendidas, DHCP y un servidor web restringido por ACL.",
      tags: ["Cisco IOS", "GNS3", "ACL", "DHCP", "Routing estático", "Apache"],
      fecha: "Julio 2025",
      contenidoHTML: `
        <img src="../img/redes11/portada.png" alt="Portada Los Juegos del Hambre" style="width: 100%; max-width: 800px; border-radius: 8px; border: 1px solid var(--border); margin: 0 auto 40px auto; display: block;">

        <audio autoplay style="display: none;">
            <source src="../audio/sinsajo.mp3" type="audio/mpeg">
        </audio>


        <h2>Objetivo</h2>
        <p>Simular una red inspirada en <strong>Los Juegos del Hambre</strong>: cada "distrito" es una red distinta conectada mediante 5 routers, con personajes de la saga representando los hosts. La práctica cubre enrutamiento estático entre todas las redes, control de tráfico mediante ACL estándar y extendidas según las relaciones (y enemistades) entre personajes, un servidor DHCP, y un servidor web accesible solo para ciertos distritos.</p>

        <h2 id="escenario">Escenario</h2>

        <div style="text-align: center; margin: 40px 0; font-family: var(--mono, monospace);">
            <p style="color: #94a3b8; margin-bottom: 20px; font-size: 0.9rem;">> Esperando inicialización del entorno GNS3...</p>
            
            <button onclick="
                const mapa = document.getElementById('gns3-escenario');
                const btn = this;
                const textoStatus = document.getElementById('gns3-status-text');
                
                if (mapa.style.maxHeight === '0px' || !mapa.style.maxHeight) {
                    // ENCIENDE EL MAPA
                    mapa.style.maxHeight = '1500px';
                    mapa.style.opacity = '1';
                    mapa.style.marginTop = '20px';
                    btn.style.animation = 'none';
                    btn.style.filter = 'brightness(0.6)';
                    textoStatus.innerText = '> ENTORNO DE SIMULACIÓN ACTIVO. ENRUTAMIENTO OK.';
                    textoStatus.style.color = '#4ade80';
                } else {
                    // APAGA EL MAPA
                    mapa.style.maxHeight = '0px';
                    mapa.style.opacity = '0';
                    mapa.style.marginTop = '0px';
                    btn.style.animation = 'gns3-pulse 1.5s infinite';
                    btn.style.filter = 'brightness(1)';
                    textoStatus.innerText = '> Esperando inicialización del entorno GNS3...';
                    textoStatus.style.color = '#94a3b8';
                }
            " style="
                background: transparent;
                border: none;
                cursor: pointer;
                border-radius: 50%;
                padding: 0;
                animation: gns3-pulse 1.5s infinite;
                transition: all 0.3s ease;
            ">
                <img src="../img/redes11/gns3-logo.png" alt="Iniciar GNS3" width="100" style="border-radius: 50%;">
            </button>
            <p id="gns3-status-text" style="color: #94a3b8; margin-top: 15px; font-size: 0.85rem; transition: color 0.3s;">> RUN SIMULATION</p>

            <div id="gns3-escenario" style="
                max-height: 0px;
                opacity: 0;
                overflow: hidden;
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid #334155;
                border-radius: 8px;
                background-color: #0f172a;
                padding: 0;
                margin-top: 0px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            ">
                <div style="background-color: #1e293b; padding: 10px 15px; text-align: left; border-bottom: 1px solid #334155; font-size: 0.8rem; color: #4ade80; display: flex; align-items: center; gap: 8px;">
                    <div style="width: 10px; height: 10px; background-color: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80;"></div>
                    [GNS3 SERVER]: Topología cargada y enlaces operativos.
                </div>
                
                <img src="../img/redes11/p11-01-topologia.png" alt="Escenario GNS3" style="width: 100%; display: block; padding: 15px; box-sizing: border-box;">
            </div>
        </div>

        <style>
            @keyframes gns3-pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8); transform: scale(1); }
                70% { box-shadow: 0 0 0 25px rgba(59, 130, 246, 0); transform: scale(1.05); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1); }
            }
        </style>

        <p>Cinco routers conectan los distintos distritos: el Distrito 1 ("Superpijos"), Distrito 2 ("Pijos"), Distrito 11 ("Pobres"), Distrito 12 ("Indigentes") y el Distrito 13, que alberga el servidor web. Cada distrito tiene sus propios hosts identificados con nombres de personajes de la saga.</p>

        <h3>Distrito 1 — Superpijos</h3>
  <div style="margin-bottom: 40px; clear: both; width: 100%;">
      <img src="../img/redes11/distrito-1.png" alt="Escudo Distrito 1" style="max-width: 400px; border-radius: 8px; border: 1px solid var(--border); display: block;">
  </div>
        <p><strong>Marvel</strong></p>
        <img src="../img/redes11/marvel.png" alt="Marvel" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>NAME    : Marvel_P.O.P[1]
  IP/MASK : 10.0.1.2/24
  GATEWAY : 10.0.1.1</code></pre>

        <p><strong>Glimmer</strong></p>
        <img src="../img/redes11/glimmer.png" alt="Glimmer" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>NAME    : GlimmerP.O.P[1]
  IP/MASK : 10.0.1.3/24
  GATEWAY : 10.0.1.1</code></pre>

        <h3>Distrito 2 — Pijos</h3>
  <div style="margin-bottom: 40px; clear: both; width: 100%;">
      <img src="../img/redes11/distrito-2.png" alt="Escudo Distrito 2" style="max-width: 400px; border-radius: 8px; border: 1px solid var(--border); display: block;">
  </div>
        <p><strong>Cato</strong></p>
        <img src="../img/redes11/cato.png" alt="Cato" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>NAME    : Cato_P.O.P[1]
  IP/MASK : 10.0.2.2/24
  GATEWAY : 10.0.2.1</code></pre>

        <p><strong>Clove</strong></p>
        <img src="../img/redes11/clove.png" alt="Clove" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>Clover_P.O.P> sh ip
  NAME    : Clover_P.O.P[1]
  IP/MASK : 10.0.2.3/24
  GATEWAY : 10.0.2.1</code></pre>

        <h3>Distrito 11 — Pobres</h3>
  <div style="margin-bottom: 40px; clear: both; width: 100%;">
      <img src="../img/redes11/distrito-11.png" alt="Escudo Distrito 11" style="max-width: 400px; border-radius: 8px; border: 1px solid var(--border); display: block;">
  </div>

        <p><strong>Thresh</strong></p>
        <img src="../img/redes11/thresh.png" alt="Thresh" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>Thresh_P.O.P> sh ip
  NAME    : Thresh_P.O.P[1]
  IP/MASK : 10.0.11.2/24
  GATEWAY : 10.0.11.1</code></pre>

        <p><strong>Rue</strong></p>
        <img src="../img/redes11/rue.png" alt="Rue" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>Rue_P.O.P> sh ip
  NAME    : Rue_P.O.P[1]
  IP/MASK : 10.0.11.3/24
  GATEWAY : 10.0.11.1</code></pre>

        <h3>Distrito 12 — Indigentes</h3>
  <div style="margin-bottom: 40px; clear: both; width: 100%;">
      <img src="../img/redes11/distrito-12.png" alt="Escudo Distrito 12" style="max-width: 400px; border-radius: 8px; border: 1px solid var(--border); display: block;">
  </div>
        <p><strong>Peeta</strong></p>
        <img src="../img/redes11/peeta.png" alt="Peeta" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>Peeta_P.O.P> sh ip
  NAME    : Peeta_P.O.P[1]
  IP/MASK : 10.0.12.2/24
  GATEWAY : 10.0.12.1</code></pre>

        <p><strong>Katniss</strong></p>
        <img src="../img/redes11/katniss.png" alt="Katniss" style="max-width: 180px; border-radius: 8px; border: 1px solid var(--border); margin: 10px 0;">
        <pre><code>KatnisPOP> sh ip
  NAME    : KatnisPOP[1]
  IP/MASK : 10.0.12.3/24
  GATEWAY : 10.0.12.1</code></pre>

        <h3>Distrito 13 — Servidor Web</h3>
        <p>Para instalar el servidor se conecta el Distrito 13 a la nube NAT, se habilita el servicio DHCP y se reinicia. Después se instala Apache con <code>apt install apache2</code>, aunque no se usará hasta el último ejercicio de la práctica.</p>


        <h2>Preparación del Escenario: Asignación de IPs en Routers</h2>
        <p>Antes de empezar con el enrutamiento, es fundamental levantar las interfaces físicas y asignarles su direccionamiento correspondiente en los routers Cisco de la topología. Aquí se muestra la configuración y comprobación del estado de las interfaces de los cinco routers:</p>

        <pre><code><span class="prompt">R1-POP#</span> sh ip int br
Interface              IP-Address      OK? Method Status
FastEthernet0/0        10.0.1.1        YES NVRAM  up
FastEthernet0/1        172.23.0.1      YES NVRAM  up
FastEthernet1/0        192.168.1.2     YES NVRAM  up

<span class="prompt">R2-POP#</span> sh ip int br
Interface              IP-Address      OK? Method Status
FastEthernet0/0        10.0.11.1       YES manual up
FastEthernet0/1        172.23.0.2      YES NVRAM  up
FastEthernet1/0        172.24.0.1      YES NVRAM  up
FastEthernet1/1        192.168.11.2    YES NVRAM  up

<span class="prompt">R3-POP#</span> sh ip int br
Interface              IP-Address      OK? Method Status
FastEthernet0/0        10.0.2.1        YES NVRAM  up
FastEthernet0/1        172.25.0.1      YES NVRAM  up
FastEthernet1/0        192.168.2.2     YES NVRAM  up

<span class="prompt">R4-POP#</span> sh ip int br
Interface              IP-Address      OK? Method Status
FastEthernet0/0        10.0.12.1       YES manual up
FastEthernet0/1        172.24.0.2      YES manual up
FastEthernet1/0        192.168.12.2    YES manual up
FastEthernet1/1        172.25.0.2      YES manual up

<span class="prompt">R5-POP#</span> sh ip int br
Interface              IP-Address      OK? Method Status
FastEthernet0/0        192.168.11.1    YES manual up
FastEthernet0/1        192.168.12.1    YES manual up
FastEthernet1/0        192.168.1.1     YES manual up
FastEthernet1/1        192.168.2.1     YES manual up
FastEthernet2/0        10.0.13.1       YES manual up</code></pre>

<h2>Ejercicio 1 — Enrutamiento estático</h2>
        <p>Cada uno de los 5 routers necesita una tabla de enrutamiento que le permita alcanzar todas las redes del escenario, no solo las que tiene conectadas directamente. Se configuraron rutas estáticas en cada router apuntando a las redes de destino a través del siguiente salto correspondiente, incluyendo una ruta por defecto (<code>0.0.0.0 0.0.0.0</code>) hacia el R5 central, que actúa como puerta de enlace de último recurso.</p>

        <pre><code><span class="prompt">R1-POP(config)#</span> ip route 10.0.11.0 255.255.255.0 172.23.0.2
<span class="prompt">R1-POP(config)#</span> ip route 0.0.0.0 0.0.0.0 192.168.1.1

<span class="prompt">R2-POP(config)#</span> ip route 10.0.1.0 255.255.255.0 172.23.0.1
<span class="prompt">R2-POP(config)#</span> ip route 10.0.12.0 255.255.255.0 172.24.0.2
<span class="prompt">R2-POP(config)#</span> ip route 0.0.0.0 0.0.0.0 192.168.11.1

<span class="prompt">R3-POP(config)#</span> ip route 10.0.12.0 255.255.255.0 172.25.0.2
<span class="prompt">R3-POP(config)#</span> ip route 0.0.0.0 0.0.0.0 192.168.2.1

<span class="prompt">R4-POP(config)#</span> ip route 10.0.11.0 255.255.255.0 172.24.0.1
<span class="prompt">R4-POP(config)#</span> ip route 10.0.2.0 255.255.255.0 172.25.0.1
<span class="prompt">R4-POP(config)#</span> ip route 0.0.0.0 0.0.0.0 192.168.12.1

<span class="prompt">R5-POP(config)#</span> ip route 10.0.1.0 255.255.255.0 192.168.1.2
<span class="prompt">R5-POP(config)#</span> ip route 10.0.2.0 255.255.255.0 192.168.2.2
<span class="prompt">R5-POP(config)#</span> ip route 10.0.11.0 255.255.255.0 192.168.11.2
<span class="prompt">R5-POP(config)#</span> ip route 10.0.12.0 255.255.255.0 192.168.12.2</code></pre>

        <div class="detail-callout"><strong>Comprobación:</strong> tras configurar las 5 tablas de enrutamiento, se verificó la comunicación completa entre todos los distritos mediante <code>ping</code> desde un host de cada red hacia el resto, confirmando que el tráfico llega correctamente a través de los saltos intermedios.</div>

        <img src="../img/redes11/p11-02-enrutamiento.png" alt="Confirmación de conectividad" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
     
     
<h2>Ejercicio 2 — ACL estándar según las relaciones entre distritos</h2>

        <h3>2.1 — Los Superpijos cortan toda comunicación</h3>
        <p>El Distrito 1 deja de hablarse con el resto. Se creó una ACL estándar que deniega el tráfico originado en su red, aplicada como filtro de <strong>salida</strong> en las dos interfaces de su router de borde:</p>
        <pre><code>R1-POP(config)#access-list 1 deny 10.0.1.0 0.0.0.255
  R1-POP(config)#int f0/1
  R1-POP(config-if)#ip access-group 1 out
  R1-POP(config-if)#int f1/0
  R1-POP(config-if)#ip access-group 1 out</code></pre>
        <p>Aplicarla como <strong>OUT</strong> en lugar de <strong>IN</strong> evita un conflicto que sí apareció en un intento anterior de esta misma práctica, cuando el servidor DHCP del mismo distrito dejaba de funcionar al bloquear el tráfico de entrada en su propia interfaz.</p>
        
        <div class="detail-callout"><strong>Comprobación:</strong> Al hacer ping desde Marvel (Distrito 1) hacia los distritos 2, 11 y 12, el R1 bloquea el tráfico, devolviendo el mensaje de interrupción administrativa en todos los casos.</div>
        
        <img src="../img/redes11/tu-captura-pings-marvel.png" alt="Comprobación de pings desde Marvel" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

        <h3>2.2 — Indigentes y Pobres, aislados del resto</h3>
        <p>Una segunda ACL estándar deniega todo el tráfico (<code>deny any</code>) en las dos interfaces de salida del router que conecta ambos distritos, dejando que se comuniquen entre ellos pero no con nadie más.</p>
        <pre><code>R4-POP(config)#access-list 1 deny any
  R4-POP(config)#int f1/0
  R4-POP(config-if)#ip access-group 1 out
  R4-POP(config)#int f1/1
  R4-POP(config-if)#ip access-group 1 out</code></pre>

        <div class="detail-callout"><strong>Comprobación:</strong> Katniss (Distrito 12) puede hacer ping a Thresh (Distrito 11) exitosamente, demostrando que la comunicación interna funciona. Sin embargo, al intentar salir hacia Cato (Distrito 2) o Marvel (Distrito 1), el R4 interrumpe la comunicación correctamente.</div>
        
        <img src="../img/redes11/tu-captura-pings-katniss.png" alt="Comprobación de pings desde Katniss" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

        <h3>2.3 — Pobres y Pijos, aliados a través de un único camino</h3>
        <p>Sin necesidad de ACL adicionales: dado que ambos distritos solo tienen un camino de comunicación posible (a través del router central R5), la topología por sí sola ya garantiza esa relación sin tener que forzarla con reglas extra.</p>
       
       
        <h2>Ejercicio 3 — Servidor DHCP</h2>
        <p>El router del Distrito 1 se configuró como servidor DHCP, repartiendo automáticamente direcciones IP a los hosts de su red y reservando la primera dirección para el propio router:</p>
        <pre><code>R1-POP(config)#ip dhcp excluded-address 10.0.1.1
  R1-POP(config)#ip dhcp pool superpijo
  R1-POP(dhcp-config)#network 10.0.1.0 255.255.255.0
  R1-POP(dhcp-config)#default-router 10.0.1.1</code></pre>
        <p>Al solicitar IP desde los hosts del distrito 1 con el comando <code>dhcp</code> o <code>ip dhcp</code>, cada máquina recibe correctamente su dirección dentro del rango esperado junto con la puerta de enlace.</p>

        <img src="../img/redes11/p11-04-dhcp.png" alt="Asignación DHCP correcta en uno de los hosts" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
        <img src="../img/redes11/p11-04-dhcp-2.png" alt="Asignación DHCP correcta en uno de los hosts" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">


<h2>Ejercicio 4 — ACL extendidas entre personajes concretos</h2>
        <p>Antes de continuar fue necesario eliminar la ACL del ejercicio 2.2 con <code>no access-list 1 deny any</code>, ya que el mismo router se reutiliza para reglas más específicas a nivel de host.</p>

        <h3>4.1 — Alianzas cruzadas entre distritos</h3>
        <p>Dos personajes de distritos distintos forman pareja y deben poder hablarse exclusivamente entre ellos, sin que eso abra la comunicación a los demás miembros de sus respectivos distritos. Se resolvió con una única ACL extendida con una regla <code>permit</code> por cada pareja autorizada, aplicada de entrada en la interfaz correspondiente:</p>
        <pre><code>R4-POP(config)#access-list 101 permit ip 10.0.12.2 0.0.0.0 10.0.2.3 0.0.0.0
  R4-POP(config)#access-list 101 permit ip 10.0.12.3 0.0.0.0 10.0.2.2 0.0.0.0
  R4-POP(config)#int f0/0
  R4-POP(config-if)#ip access-group 101 in</code></pre>
        <div class="detail-callout"><strong>Nota sobre interpretación:</strong> el enunciado admitía una segunda lectura — permitir la comunicación entre los cuatro implicados sin restricción cruzada, lo que habría bastado con eliminar la ACL del ejercicio 2 sin añadir nada nuevo. Se optó por la interpretación más restrictiva (cada uno solo con su pareja) por ser la que más se ajustaba al enunciado.</div>

        <div class="detail-callout"><strong>Comprobación:</strong> Verificamos mediante ping que Peeta recibe respuesta de Clove pero es bloqueado al intentar llegar a Cato. De igual forma, Katniss puede comunicarse con Cato pero su tráfico hacia Clove es interrumpido administrativamente.</div>
        
        <img src="../img/redes11/tu-captura-alianzas.png" alt="Comprobación de comunicación cruzada Peeta-Clove y Katniss-Cato" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">
        <img src="../img/redes11/tu-captura-alianzas-2.png" alt="Comprobación de comunicación cruzada Peeta-Clove y Katniss-Cato" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

        <h3>4.3 y 4.4 — Enemistades puntuales entre dos personajes</h3>
        <p>Para una pareja de personajes que deja de hablarse, sin afectar al resto de su distrito, la solución es una ACL extendida con una regla <code>deny</code> específica para esos dos hosts seguida de un <code>permit ip any any</code> que preserva el resto del tráfico:</p>
        
        <p><strong>Bloqueo entre Katniss y Rue (Aplicado en el R4):</strong></p>
        <pre><code>R4-POP(config)#access-list 102 deny ip 10.0.12.3 0.0.0.0 10.0.11.3 0.0.0.0
  R4-POP(config)#access-list 102 permit ip any any
  R4-POP(config)#int f0/0
  R4-POP(config-if)#ip access-group 102 in</code></pre>

        <p>El mismo patrón se repitió en el router R2 para una segunda pareja enfrentada (Thresh y Cato), configurando la ACL correspondiente en su interfaz para asegurar que solo esos dos hosts concretos pierden comunicación entre sí.</p>

        <p><strong>Bloqueo entre Thresh y Cato (Aplicado en el R2):</strong></p>
        <pre><code>R2-POP(config)#access-list 101 deny ip 10.0.11.2 0.0.0.0 10.0.2.2 0.0.0.0
  R2-POP(config)#access-list 101 permit ip any any
  R2-POP(config)#int f0/0
  R2-POP(config-if)#ip access-group 101 in</code></pre>

        <div class="detail-callout"><strong>Comprobación:</strong> Demostramos que Katniss no puede alcanzar a Rue, pero sí a Thresh. Igualmente comprobamos que la comunicación entre Thresh y Cato ha sido denegada correctamente por la ACL del R2, mientras que el resto de su distrito sigue intacto.</div>

        <img src="../img/redes11/tu-captura-enemistades.png" alt="Comprobación de bloqueo de comunicación Katniss-Rue y Thresh-Cato" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

        <p>Por último, verificamos en los routers que las reglas de la ACL extendida se han aplicado correctamente:</p>
        <img src="../img/redes11/p11-05-acl-extendida.png" alt="ACL extendida verificada con sh ip access-list" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">        
        
        <h2>Ejercicio 5 — Servidor web restringido por ACL</h2>
        <p>El Distrito 13 alberga un servidor Apache, accesible únicamente desde los distritos 11 y 12 a través del puerto 80. Se configuró una ACL extendida de tipo TCP limitada a ese puerto:</p>
        <pre><code>R5-POP(config)#access-list 101 permit tcp 10.0.13.2 0.0.0.0 10.0.11.0 0.0.0.0 eq 80
  R5-POP(config)#access-list 101 permit tcp 10.0.13.2 0.0.0.0 10.0.12.0 0.0.0.0 eq 80
  R5-POP(config)#int f1/0
  R5-POP(config-if)#ip access-group 101 out</code></pre>
        <p>Tras sustituir un host de cada distrito autorizado por una máquina con interfaz gráfica y navegador, se accedió correctamente a la página del servidor desde ambos distritos escribiendo la IP del Distrito 13 en el navegador.</p>

        <img src="../img/redes11/p11-06-servidor-web.png" alt="Acceso al servidor web del Distrito 13" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 15px 0;">

        <h2>Conclusiones</h2>
        <p>Esta práctica combina en un solo escenario los tres pilares de control de tráfico en redes Cisco: enrutamiento estático, ACL estándar (por red completa) y ACL extendidas (por host y puerto concreto). Lo más interesante fue decidir <strong>dónde</strong> aplicar cada ACL y en qué sentido (<code>in</code> vs <code>out</code>): la misma regla de filtrado puede generar resultados muy distintos, e incluso bloquear servicios como el DHCP, según la interfaz y el sentido en que se aplique.</p>
      `
    }    
  ]; 

/**
 * ============================================================
 * LÓGICA Y ETIQUETAS
 * ============================================================
 */

const CATEGORIAS_LABEL = {
  redes: "Redes",
  servicios: "Servicios",
  iaw: "Implantación de Aplicaciones Web",
  infraestructura: "Infraestructura Virtual",
  gbdd: "Gestión de Bases de Datos"
};

function getPracticaById(id) {
  return PRACTICAS.find(p => p.id === id);
}