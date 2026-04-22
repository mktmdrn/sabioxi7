import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const subjects = [
  {
    name: "Planificación y Administración de Redes",
    lessonTitle: "Conceptos Básicos de Redes",
    questions: [
      {
        question: "¿Qué capa del modelo OSI se encarga del enrutamiento de paquetes?",
        correctAnswer: "Capa de Red (3)",
        wrongAnswers: ["Capa de Enlace (2)", "Capa de Transporte (4)", "Capa Física (1)"]
      },
      {
        question: "¿Cuál es la máscara de subred por defecto para una red de Clase C?",
        correctAnswer: "255.255.255.0",
        wrongAnswers: ["255.255.0.0", "255.0.0.0", "255.255.255.255"]
      },
      {
        question: "¿Qué protocolo se usa para asignar IPs de forma automática?",
        correctAnswer: "DHCP",
        wrongAnswers: ["DNS", "HTTP", "FTP"]
      }
    ]
  },
  {
    name: "Fundamentos de Hardware",
    lessonTitle: "Componentes del Ordenador",
    questions: [
      {
        question: "¿Qué componente realiza las operaciones aritméticas y lógicas?",
        correctAnswer: "CPU",
        wrongAnswers: ["Memoria RAM", "Tarjeta Gráfica", "Placa Base"]
      },
      {
        question: "¿Cuál de estos es un dispositivo de almacenamiento volátil?",
        correctAnswer: "Memoria RAM",
        wrongAnswers: ["Disco SSD", "Disco HDD", "Memoria Flash"]
      },
      {
        question: "¿Qué puerto se usa habitualmente para conectar periféricos como ratones o teclados modernos?",
        correctAnswer: "USB",
        wrongAnswers: ["VGA", "SATA", "PCIe"]
      }
    ]
  },
  {
    name: "Gestión de Bases de Datos",
    lessonTitle: "Introducción al Modelo Relacional",
    questions: [
      {
        question: "¿Qué significa SQL?",
        correctAnswer: "Structured Query Language",
        wrongAnswers: ["Simple Query Language", "Standard Query Level", "System Quality Language"]
      },
      {
        question: "¿Qué es una 'Primary Key'?",
        correctAnswer: "Un identificador único para cada registro",
        wrongAnswers: ["Una contraseña de acceso", "Un campo que puede ser nulo", "Una clave para encriptar datos"]
      },
      {
        question: "¿Qué comando se usa para insertar datos en una tabla?",
        correctAnswer: "INSERT INTO",
        wrongAnswers: ["ADD DATA", "UPDATE TABLE", "CREATE RECORD"]
      }
    ]
  },
  {
    name: "Lenguajes de Marcas",
    lessonTitle: "Sintaxis XML y HTML",
    questions: [
      {
        question: "¿Cuál es la función de CSS en una página web?",
        correctAnswer: "Definir el diseño y estilo visual",
        wrongAnswers: ["Estructurar el contenido", "Programar la lógica del servidor", "Gestionar la base de datos"]
      },
      {
        question: "¿Qué etiqueta se usa para insertar una imagen en HTML?",
        correctAnswer: "<img>",
        wrongAnswers: ["<image>", "<picture>", "<src>"]
      },
      {
        question: "¿Qué significa que XML sea un lenguaje extensible?",
        correctAnswer: "Que permite definir etiquetas personalizadas",
        wrongAnswers: ["Que el archivo puede ocupar mucho espacio", "Que solo funciona en Windows", "Que es más rápido que HTML"]
      }
    ]
  },
  {
    name: "Servicios de Red e Internet",
    lessonTitle: "Configuración de Servidores Web",
    questions: [
      {
        question: "¿En qué puerto escucha por defecto el servicio HTTPS?",
        correctAnswer: "443",
        wrongAnswers: ["80", "21", "22"]
      },
      {
        question: "¿Qué protocolo se utiliza para la transferencia de archivos de forma segura?",
        correctAnswer: "SFTP",
        wrongAnswers: ["HTTP", "UDP", "Telnet"]
      },
      {
        question: "¿Qué hace un servidor DNS?",
        correctAnswer: "Traduce nombres de dominio a direcciones IP",
        wrongAnswers: ["Almacena páginas web", "Envía correos electrónicos", "Filtra el tráfico de red"]
      }
    ]
  },
  {
    name: "Seguridad y Alta Disponibilidad",
    lessonTitle: "Criptografía y Seguridad",
    questions: [
      {
        question: "¿Qué es el 'phishing'?",
        correctAnswer: "Una técnica de ingeniería social para robar credenciales",
        wrongAnswers: ["Un tipo de antivirus", "Un método de encriptación rápida", "Una copia de seguridad en la nube"]
      },
      {
        question: "¿Para qué sirve un cortafuegos (Firewall)?",
        correctAnswer: "Filtrar y controlar el tráfico de red",
        wrongAnswers: ["Aumentar la velocidad de Internet", "Desinfectar archivos con virus", "Limpiar el polvo del hardware"]
      },
      {
        question: "¿Qué diferencia a la criptografía asimétrica de la simétrica?",
        correctAnswer: "Usa un par de claves (pública y privada)",
        wrongAnswers: ["Es mucho más lenta", "Solo funciona en Linux", "No necesita claves"]
      }
    ]
  },
  {
    name: "Administración de Sistemas Operativos",
    lessonTitle: "Administración de Usuarios y Grupos",
    questions: [
      {
        question: "¿Qué comando se usa en Linux para cambiar los permisos de un archivo?",
        correctAnswer: "chmod",
        wrongAnswers: ["chown", "ls", "pwd"]
      },
      {
        question: "¿En qué archivo se guardan las contraseñas cifradas en Linux?",
        correctAnswer: "/etc/shadow",
        wrongAnswers: ["/etc/passwd", "/etc/config", "/etc/users"]
      },
      {
        question: "¿Qué herramienta se usa en Windows Server para gestionar usuarios de forma centralizada?",
        correctAnswer: "Active Directory",
        wrongAnswers: ["Task Manager", "Control Panel", "Device Manager"]
      }
    ]
  },
  {
    name: "Implantación de Aplicaciones Web",
    lessonTitle: "Arquitecturas Web",
    questions: [
      {
        question: "¿Qué significa que una aplicación web sea 'Frontend'?",
        correctAnswer: "Que se ejecuta en el navegador del cliente",
        wrongAnswers: ["Que se ejecuta en el servidor", "Que gestiona la base de datos", "Que es solo para móviles"]
      },
      {
        question: "¿Qué es un CMS?",
        correctAnswer: "Content Management System",
        wrongAnswers: ["Computer Main System", "Central Monitoring Software", "Client Media Server"]
      },
      {
        question: "¿Cuál de estos es un CMS muy popular?",
        correctAnswer: "WordPress",
        wrongAnswers: ["Photoshop", "Excel", "Spotify"]
      }
    ]
  }
];

async function seed() {
  console.log("Seeding ASIR subjects...");

  for (const subject of subjects) {
    const fullTitle = `[ASIR] [${subject.name}] ${subject.lessonTitle}`;
    
    // Check if exists
    const { data: existing } = await supabase
      .from("lessons")
      .select("id")
      .eq("title", fullTitle)
      .single();

    if (existing) {
      console.log(`Skipping: ${fullTitle} (Already exists)`);
      continue;
    }

    const lessonId = `seed-asir-${subject.name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`;
    
    const { error: lessonError } = await supabase
      .from("lessons")
      .insert({ 
        id: lessonId, 
        title: fullTitle,
        created_at: Date.now()
      });

    if (lessonError) {
      console.error(`Failed to insert lesson ${fullTitle}:`, lessonError.message);
      continue;
    }

    const questionInserts = subject.questions.map((q) => ({
      lesson_id: lessonId,
      question: q.question,
      correct_answer: q.correctAnswer,
      wrong_answers: q.wrongAnswers,
    }));

    const { error: qError } = await supabase
      .from("questions")
      .insert(questionInserts);

    if (qError) {
      console.error(`Failed to insert questions for ${fullTitle}:`, qError.message);
    } else {
      console.log(`✅ Inserted: ${fullTitle}`);
    }
  }

  console.log("Seeding complete!");
}

seed();
