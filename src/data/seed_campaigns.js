const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function clearOldLessons(subject) {
  console.log(`Clearing old lessons for [${subject}]...`);
  // Search for lessons that contain the subject in brackets
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .ilike("title", `%[${subject}]%`);
  
  if (lessons && lessons.length > 0) {
    const ids = lessons.map(l => l.id);
    await supabase.from("questions").delete().in("lesson_id", ids);
    await supabase.from("lessons").delete().in("id", ids);
  }
}

async function addLesson(title, subject, type = "lesson") {
  const lessonId = Date.now().toString() + Math.floor(Math.random() * 1000);
  
  const { error: lessonError } = await supabase
    .from("lessons")
    .insert({ 
      id: lessonId, 
      title, 
      type,
      created_at: Date.now() 
    });

  if (lessonError) {
    console.error(`Error creating ${title}:`, lessonError.message);
    return;
  }

  // Add dummy questions relevant to the subject
  const questions = [
    {
      lesson_id: lessonId,
      question: `¿Cuál es el concepto clave en ${title}?`,
      correct_answer: `Dominar los fundamentos de ${subject}`,
      wrong_answers: ["Ignorar las especificaciones", "Usar valores aleatorios", "No realizar pruebas"],
    },
    {
      lesson_id: lessonId,
      question: `En el contexto de ${subject}, ¿qué es lo más importante?`,
      correct_answer: "La precisión y el diseño correcto",
      wrong_answers: ["La velocidad sin control", "La estética solamente", "El azar"],
    }
  ];

  await supabase.from("questions").insert(questions);
  console.log(`✅ Created: ${title}`);
}

const DATA = {
  "Planificación y administración de redes": [
    "Intro a Redes y Modelos OSI/TCP-IP",
    "Cableado Estructurado y Medios",
    "Direccionamiento IPv4 y Subnetting",
    "Configuración de Switches y VLANs",
    "Enrutamiento Estático y Dinámico",
    "Servicios de Red (DHCP, DNS)",
    "Redes Inalámbricas y Seguridad WiFi",
    "Listas de Control de Acceso (ACL)",
    "Traducción de Direcciones (NAT/PAT)",
    "Monitorización y Troubleshooting"
  ],
  "Implantación de sistemas operativos": [
    "Arquitectura de SO y Virtualización",
    "Instalación de Windows y Linux",
    "Gestión de Usuarios y Grupos",
    "Sistemas de Archivos y Permisos",
    "Automatización con Scripting",
    "Gestión de Procesos y Memoria",
    "Configuración de Red en el SO",
    "Servicios de Directorio (AD/LDAP)",
    "Copias de Seguridad y Recuperación",
    "Seguridad y Bastionado del SO"
  ],
  "Gestión de bases de datos": [
    "Modelo Entidad-Relación",
    "El Modelo Relacional y Normalización",
    "SQL: Definición de Datos (DDL)",
    "SQL: Manipulación de Datos (DML)",
    "Consultas Complejas y Subconsultas",
    "Vistas, Índices y Transacciones",
    "Programación: Procedimientos y Triggers",
    "Seguridad y Gestión de Privilegios",
    "BD NoSQL y Nuevas Tendencias",
    "Administración de Servidores de BD"
  ],
  "Programación": [
    "Variables y Estructuras de Control",
    "Funciones y Modularidad",
    "POO: Clases y Objetos",
    "POO: Herencia y Polimorfismo",
    "Gestión de Excepciones",
    "Colecciones y Estructuras de Datos",
    "Entrada/Salida y Ficheros",
    "Acceso a Datos (JDBC/ORM)",
    "Desarrollo de Interfaces Gráficas",
    "Pruebas Unitarias y Depuración"
  ],
  "Bases de Datos": [
    "Fundamentos de Almacenamiento",
    "Diseño Lógico de Bases de Datos",
    "Consultas Básicas SQL",
    "Funciones de Agregación",
    "Uniones y Relaciones",
    "Diseño Físico y Optimización",
    "Integridad de Datos",
    "Exportación e Importación",
    "Lenguajes de Consulta Avanzados",
    "Casos Prácticos de Aplicación"
  ],
  "Sistemas informáticos": [
    "Hardware y Componentes",
    "Arquitectura de Computadores",
    "Gestión de Almacenamiento",
    "Periféricos y Conectividad",
    "Sistemas Operativos Propietarios",
    "Sistemas Operativos Libres",
    "Redes de Área Local",
    "Servicios de Red Básicos",
    "Seguridad Informática",
    "Ética y Legislación"
  ],
  "Seguridad y Alta Disponibilidad": [
    "Principios de Seguridad",
    "Criptografía y Certificados",
    "Seguridad Perimetral",
    "Firewalls y Proxies",
    "Sistemas de Detección de Intrusos",
    "Alta Disponibilidad y Cluster",
    "Balanceo de Carga",
    "Seguridad en Aplicaciones",
    "Auditoría y Normativa",
    "Planes de Contingencia"
  ],
  "Servicios de Red e Internet": [
    "Protocolos de Aplicación",
    "Configuración de Servidores Web",
    "Servidores de Correo Electrónico",
    "Transferencia de Ficheros (FTP)",
    "Servicios de Audio y Video",
    "Configuración de Proxies",
    "Servidores de Nombres (DNS)",
    "Configuración de DHCP",
    "Seguridad en Servicios de Red",
    "Monitorización de Servicios"
  ],
  "Implantación de Aplicaciones Web": [
    "Arquitectura de Aplicaciones Web",
    "Servidores de Aplicaciones",
    "Instalación de CMS",
    "Configuración de PHP/Python/Node",
    "Seguridad en Aplicaciones Web",
    "Despliegue de Aplicaciones",
    "Optimización y Caché",
    "Integración con BD",
    "Pruebas y QA",
    "Documentación Técnica"
  ],
  "Entornos de Desarrollo": [
    "IDEs y Herramientas",
    "Control de Versiones (Git)",
    "Pruebas de Software",
    "Optimización de Código",
    "Refactorización",
    "Diagramas de Clase y UML",
    "Metodologías Ágiles",
    "Gestión de Dependencias",
    "Documentación de Código",
    "Entornos de Despliegue"
  ],
  "Desarrollo Web en Entorno Cliente": [
    "Fundamentos de JavaScript",
    "DOM y Eventos",
    "AJAX y Fetch API",
    "Frameworks Modernos",
    "Gestión de Estado",
    "Componentes y Reutilización",
    "Diseño Responsivo",
    "Accesibilidad Web",
    "Animaciones y Gráficos",
    "Pruebas en Cliente"
  ],
  "Desarrollo Web en Entorno Servidor": [
    "Lógica de Servidor",
    "Gestión de Peticiones HTTP",
    "Autenticación y Sesiones",
    "APIs RESTful",
    "Middleware y Seguridad",
    "Acceso a Datos desde Servidor",
    "Validación de Formularios",
    "Generación de Vistas",
    "Servicios Web y SOAP",
    "Escalabilidad"
  ],
  "Despliegue de Aplicaciones Web": [
    "Contenedores (Docker)",
    "Orquestación (Kubernetes)",
    "CI/CD Pipelines",
    "Servicios Cloud (AWS/Azure)",
    "Configuración de Nginx/Apache",
    "Seguridad en Despliegue",
    "Monitorización y Logs",
    "Estrategias de Rollout",
    "Gestión de Secretos",
    "Infraestructura como Código"
  ],
  "Diseño de Interfaces Web": [
    "Principios de UX/UI",
    "Teoría del Color y Tipografía",
    "Maquetación con CSS Grid/Flexbox",
    "Prototipado (Figma)",
    "Usabilidad y Ergonometría",
    "Diseño Adaptativo",
    "Componentes de Interfaz",
    "Iconografía y Multimedia",
    "Estándares W3C",
    "Pruebas de Usuario"
  ]
};

async function seedCampaigns() {
  for (const subject in DATA) {
    await clearOldLessons(subject);
    
    const topics = DATA[subject];
    for (let i = 0; i < topics.length; i++) {
      const title = `Lección ${i + 1}: [${subject}] ${topics[i]}`;
      await addLesson(title, subject);
    }

    // Add one exam per subject
    await addLesson(`EXAMEN FINAL: [${subject}]`, subject, "exam");
  }

  console.log("🚀 Seeding finished successfully with real topics!");
}

seedCampaigns().catch(console.error);
