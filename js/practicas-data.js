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
