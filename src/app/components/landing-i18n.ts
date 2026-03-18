/**
 * ══════════════════════════════════════════════════════════════
 *  Landing Page i18n — ES (Spanish) and PT (Portuguese)
 *  All pre-login UI copy lives here for easy maintenance.
 * ══════════════════════════════════════════════════════════════
 */

export type LandingLang = "es" | "pt" | "en";

export interface LandingCopy {
  /* ── Header Nav ── */
  nav: {
    howItWorks: string;
    benefits: string;
    pricing: string;
    login: string;
    register: string;
  };
  /* ── Hero ── */
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    trustBadges: string[];
    socialProof: string;
    socialProofHighlight: string;
  };
  /* ── Practice Widget ── */
  widget: {
    heading: string;
    subheading: string;
    salesLabel: string;
    salesDesc: string;
    interviewLabel: string;
    interviewDesc: string;
  };
  /* ── How It Works ── */
  howItWorks: {
    sectionTitle: string;
    steps: { title: string; desc: string }[];
  };
  /* ── How It Works Screens (mockup UI text) ── */
  screens: {
    setup: {
      title: string;
      subtitle: string;
      narrativeLabel: string;
      narrativeStructure: string;
      strategyTitle: string;
      pillars: string[];
      scriptSectionTitle: string;
      scriptExcerpt: string;
      highlightPhrase: string;
      highlightTooltip: string;
      legendStructure: string;
      legendImpact: string;
      legendEngagement: string;
      cta: string;
    };
    chat: {
      role: string;
      live: string;
    };
    feedback: {
      subline: string;
      workedWell: string;
      strength1: string;
      strength2: string;
      keyImprovements: string;
      powerPhrases: string;
      phrase1: string;
      phrase1ctx: string;
      powerQuestions: string;
      question1: string;
      questionTiming: string;
      cta: string;
    };
  };
  /* ── For You / Benefits ── */
  benefits: {
    sectionTitle: string;
    sectionSubtitle: string;
    yesTitle: string;
    yesList: string[];
    noTitle: string;
    noList: string[];
    levelLabel: string;
    levelDesc: string;
  };
  /* ── Before & After ── */
  beforeAfter: {
    sectionTitle: string;
    sectionSubtitle: string;
    withTitle: string;
    withList: string[];
    withoutTitle: string;
    withoutList: string[];
  };
  /* ── Impact ── */
  impact: {
    sectionTitle: string;
    sectionSubtitle: string;
    cards: { stat: string; label: string; desc: string }[];
  };
  /* ── Pricing ── */
  pricing: {
    sectionTitle: string;
    sectionSubtitle: string;
    freeSession: {
      title: string;
      desc: string;
      features: string[];
      button: string;
    };
    packs: {
      name: string;
      sessions: number;
      price: string;
      perSession: string;
      discount?: string;
      featured?: boolean;
      button: string;
      features: string[];
    }[];
    freeTrialNote: string;
    perSessionLabel: string;
    savingsLabel: string;
    statsBar: { value: string; desc: string }[];
  };
  /* ── FAQ ── */
  faq: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: { q: string; a: string }[];
  };
  /* ── Final CTA ── */
  finalCta: {
    headline1: string;
    headline2: string;
    subline: string;
    button: string;
    badges: string[];
  };
  /* ── Footer ── */
  footer: {
    tagline: string;
    columns: { title: string; items: string[] }[];
    copyright: string;
    dashboardLink: string;
  };
  /* ── Auth Modal ── */
  auth: {
    login: {
      title: string;
      subtitle: string;
      google: string;
      divider: string;
      toggle: string;
      toggleAction: string;
    };
    register: {
      title: string;
      subtitle: string;
      google: string;
      divider: string;
      toggle: string;
      toggleAction: string;
      trust: string;
    };
    ctaRegister: {
      title: string;
      subtitle: string;
    };
    errorFallback: string;
  };
  /* ── Practice Setup Modal ── */
  setupModal: {
    stepLabels: [string, string];
    titles: { context: string; ready: string };
    subtitles: { context: string; ready: string };
    next: string;
    back: string;
    contextReady: string;
    contextNeeded: string;
    previewTitle: string;
    previewBody: string;
    previewBlurred: string;
    continueGoogle: string;
    trustLine: string;
    scenarioLabels: { sales: string; interview: string };
    guidedFields: {
      interview: { role: string; rolePlaceholder: string; company: string; companyPlaceholder: string };
      sales: { product: string; productPlaceholder: string; problem: string; problemPlaceholder: string };
    };
  };
  /* ── Dashboard ── */
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    subtitleWithData: string;
    subtitleEmpty: string;
    history: string;
    proficiency: {
      title: string;
      descWithData: string;
      descEmpty: string;
      cefrTitle: string;
      cefrDisclaimer: string;
    };
    stats: {
      sessions: string;
      biggestGain: string;
      focusArea: string;
      streak: string;
    };
    radar: {
      title: string;
      descWithData: string;
      descEmpty: string;
    };
    progress: {
      title: string;
      descMultiple: string;
      descSingle: string;
      descEmpty: string;
      emptyOneSessions: string;
      emptyNoSessions: string;
    };
    quickStart: {
      title: string;
      salesLabel: string;
      salesDesc: string;
      interviewLabel: string;
      interviewDesc: string;
    };
    improvement: {
      title: string;
      youSaid: string;
      proVersion: string;
      technique: string;
    };
    recentSessions: {
      title: string;
      viewAll: string;
      empty: string;
    };
    recommended: {
      title: string;
      aiBadge: string;
      focusHint: string;
      defaultHint: string;
      firstHint: string;
      startSession: string;
      descFocus: string;
      descPracticed: string;
      descNew: string;
      scenarioInterview: string;
      scenarioSales: string;
      scenarioInterviewDesc: string;
      scenarioSalesDesc: string;
      tagInterview: string;
      tagSales: string;
      duration: string;
    };
  };
}

/* ═══════════════════════ SPANISH ═══════════════════════ */
export const ES: LandingCopy = {
  nav: {
    howItWorks: "Cómo funciona",
    benefits: "Beneficios",
    pricing: "Precio",
    login: "Iniciar sesión",
    register: "Registrarme",
  },
  hero: {
    badge: "Entrenamiento de comunicación profesional en inglés.",
    headline: "Practica tus conversaciones profesionales en inglés.",
    subheadline: "Gana Contratos en USD. Trabaja Remoto. Expande tu alcance.",
    trustBadges: ["1ª sesión gratis", "Sin tarjeta", "Sin suscripción"],
    socialProof: "ya entrenan con inFluentia PRO",
    socialProofHighlight: "500+ profesionales",
  },
  widget: {
    heading: "Empieza ahora:",
    subheading: "Elige el escenario que quieres practicar",
    salesLabel: "Pitch de ventas",
    salesDesc: "Practica cómo presentar tu producto o servicio a un cliente potencial",
    interviewLabel: "Entrevista de trabajo",
    interviewDesc: "Prepárate para responder preguntas clave en tu próxima entrevista",
  },
  howItWorks: {
    sectionTitle: "Cómo funciona",
    steps: [
      { title: "Preparación", desc: "Elige escenario, define contexto y recibe tu guión personalizado con pilares de valor y tips clave." },
      { title: "Práctica", desc: "Simula tu conversación con IA que asume un rol realista mientras hablas por voz." },
      { title: "Feedback", desc: "Análisis en 3 dimensiones, correcciones clave, power phrases y feedback de sesión completo." },
    ],
  },
  screens: {
    setup: {
      title: "Configura tu práctica",
      subtitle: "Define el contexto y recibe un guión personalizado",
      narrativeLabel: "Narrativa",
      narrativeStructure: "Estructura de la narrativa",
      strategyTitle: "Estrategia",
      pillars: ["Pilar 1: Diferenciación técnica", "Pilar 2: Proof points"],
      scriptSectionTitle: "Ejemplo de guión",
      scriptExcerpt: "Enfatiza tu experiencia en plataformas SaaS escalables y tu stack tecnológico moderno — esto te diferencia de agencias genéricas.\nUsa datos concretos: 50+ proyectos enterprise, 98% de retención de clientes, y casos de éxito con startups Series A similares.",
      highlightPhrase: "We've delivered 50+ enterprise platforms",
      highlightTooltip: "Mejor que 'We have a lot of experience'",
      legendStructure: "Estructura",
      legendImpact: "Impacto",
      legendEngagement: "Engagement",
      cta: "Comenzar práctica",
    },
    chat: {
      role: "Cliente potencial · Startup Series A",
      live: "En vivo",
    },
    feedback: {
      subline: "Sales Pitch · Sesión completada",
      workedWell: "Lo que funcionó bien",
      strength1: "Apertura con pregunta de dolor",
      strength2: "Datos concretos como respaldo",
      keyImprovements: "Mejoras clave",
      powerPhrases: "Power Phrases",
      phrase1: "We've delivered 50+ enterprise platforms",
      phrase1ctx: "Mejor que 'We have a lot of experience'",
      powerQuestions: "Power Questions",
      question1: "What does success look like for your team in Q3?",
      questionTiming: "Al inicio",
      cta: "Finalizar y generar informe",
    },
  },
  benefits: {
    sectionTitle: "¿Es inFluentia PRO para ti?",
    sectionSubtitle: "inFluentia PRO no es para todos. Es para profesionales ambiciosos.",
    yesTitle: "Es para ti si...",
    yesList: [
      "Buscas impactar en presentaciones profesionales",
      "Necesitas negociar salarios o contratos",
      "Lideras reuniones con equipos internacionales",
      "Cierras ventas complejas en inglés",
      "Participas en entrevistas",
    ],
    noTitle: "No es para ti si...",
    noList: [
      "Eres un hablante no nativo y estás aprendiendo inglés desde cero",
      "Buscas clases de gramática básica",
      "Prefieres solo leer o escribir en inglés",
      "No tienes escenarios profesionales",
      "No usas inglés en el trabajo",
    ],
    levelLabel: "Nivel recomendado:",
    levelDesc: "B1+ (Intermedio). Ya puedes mantener conversaciones básicas, ahora necesitas dominarlas.",
  },
  beforeAfter: {
    sectionTitle: "Antes y Después",
    sectionSubtitle: "Así transforma inFluentia PRO tus conversaciones profesionales",
    withTitle: "Con inFluentia PRO",
    withList: [
      "Ya lo practicaste 5 veces",
      "Conoces cada pregunta y objeción posible",
      "Hablas con seguridad",
      "Negocias y demuestras lo que vales",
      "Ganas presencia ejecutiva",
    ],
    withoutTitle: "Sin preparación",
    withoutList: [
      "Improvisas tu pitch",
      "Esperas que no te hagan preguntas difíciles",
      "Hablas con inseguridad",
      "Pierdes oportunidad de impactar",
      "Pierdes presencia",
    ],
  },
  impact: {
    sectionTitle: "Impacto Real en tu Carrera",
    sectionSubtitle: "Resultados medibles que transforman trayectorias profesionales",
    cards: [
      { stat: "3x", label: "más oportunidades", desc: "de liderazgo internacional" },
      { stat: "89%", label: "de usuarios sienten más seguridad", desc: "al hablar en situaciones críticas" },
      { stat: "$15K+", label: "incremento salarial promedio", desc: "estimado (Nearshoring 2026)" },
    ],
  },
  pricing: {
    sectionTitle: "Invierte en tu ventaja competitiva",
    sectionSubtitle: "Practica entrevistas y ventas en inglés con IA avanzada.\n1ª sesión gratis. Luego paga solo cuando lo necesitas.",
    freeSession: {
      title: "1ª Sesión Gratis",
      desc: "Experimenta la sesión completa sin compromiso",
      features: ["Simulación completa con IA", "Feedback + Guión personalizado", "Feedback de sesión detallado", "Sin tarjeta de crédito"],
      button: "Empezar gratis",
    },
    packs: [
      { name: "1 Sesión", sessions: 1, price: "$4.99", perSession: "$4.99", button: "Comprar", features: ["Sesión completa con GPT-4o", "Feedback profundo", "Guión optimizado editable", "Shadowing con scoring"] },
      { name: "3 Sesiones", sessions: 3, price: "$12.99", perSession: "$4.33", discount: "13%", button: "Comprar pack", features: ["Todo lo de 1 sesión", "Ahorra $2.00", "Ideal para prepararte a fondo", "Genera SR cards"] },
      { name: "5 Sesiones", sessions: 5, price: "$19.99", perSession: "$4.00", discount: "20%", featured: true, button: "Comprar pack", features: ["Todo lo de 1 sesión", "Ahorra $5.00", "Mejor relación precio-valor", "Genera SR cards"] },
    ],
    freeTrialNote: "Prueba tu primera sesión completamente gratis — sin tarjeta, sin compromiso",
    perSessionLabel: "por sesión",
    savingsLabel: "ahorro",
    statsBar: [
      { value: "10x", desc: "más barato que coaching presencial" },
      { value: "90%", desc: "margen para reinvertir en tu carrera" },
      { value: "24/7", desc: "entrena cuando lo necesites" },
    ],
  },
  faq: {
    sectionTitle: "Preguntas Frecuentes",
    sectionSubtitle: "Todo lo que necesitas saber antes de empezar",
    items: [
      { q: "¿inFluentia PRO es un curso de inglés?", a: "No, cursos y apps de inglés en general ya hay muchos; si necesitas aprender las bases, te recomendamos usar uno de esos. inFluentia PRO es una herramienta que te ayuda a practicar tu comunicación, pronunciación y en general tu discurso para que te prepares antes de una reunión importante." },
      { q: "¿Necesito un nivel mínimo de inglés?", a: "Sí, inFluentia PRO es para profesionales que ya tienen una base (B1+) y necesitan usar el inglés como herramienta de trabajo. No enseñamos a conjugar verbos, enseñamos a cerrar acuerdos." },
      { q: "¿Qué pasa con la privacidad de mis documentos?", a: "Tus notas y presentaciones se procesan de forma segura y privada. Solo se utilizan para configurar tu sesión de práctica y mejorar tu guión." },
      { q: "¿En qué se diferencia de un profesor particular?", a: "Un profesor te corrige el inglés y te cuesta USD $25 por sesión; inFluentia PRO te ayuda a mejorar tu pronunciación y la forma de comunicarte profesionalmente para que eleves tu nivel. Además, estamos disponibles 24/7 para esa reunión de emergencia que surgió de imprevisto." },
      { q: "¿Puedo usarlo para entrevistas de trabajo específicas?", a: "Totalmente. Puedes subir la descripción del puesto (Job Description) y la IA actuará como el reclutador específico de esa empresa." },
      { q: "¿Cuánto tiempo necesito practicar para ver resultados?", a: "La mayoría de usuarios reportan mayor confianza después de 3-5 sesiones. Para consolidar un cambio real en tu comunicación profesional, recomendamos 90 días de práctica regular — incluso 15 minutos al día hacen la diferencia." },
      { q: "¿Puedo cancelar en cualquier momento?", a: "No hay suscripción que cancelar. Compras créditos de sesión y los usas cuando quieras — sin compromisos mensuales, sin cargos recurrentes, sin complicaciones. Tus créditos no expiran." },
    ],
  },
  finalCta: {
    headline1: "Tu próxima conversación importante",
    headline2: "puede cambiar todo.",
    subline: "Entrena. Domina. Gana",
    button: "Probar gratis",
    badges: ["Sin tarjeta de crédito", "1ª sesión gratis", "Sin suscripción"],
  },
  footer: {
    tagline: "El coach de comunicación profesional con IA para líderes latinoamericanos.",
    columns: [
      { title: "Producto", items: ["Cómo funciona", "Funcionalidades", "Precios"] },
      { title: "Empresa", items: ["Sobre nosotros", "Blog", "Contacto"] },
      { title: "Legal", items: ["Privacidad", "Términos", "Cookies"] },
    ],
    copyright: "© 2026 inFluentia PRO. Todos los derechos reservados.",
    dashboardLink: "Ir al dashboard",
  },
  auth: {
    login: {
      title: "Bienvenido de vuelta",
      subtitle: "Inicia sesión para continuar tu entrenamiento",
      google: "Continuar con Google",
      divider: "Usa la misma cuenta con la que te registraste",
      toggle: "¿No tienes cuenta?",
      toggleAction: "Regístrate",
    },
    register: {
      title: "Crea tu cuenta",
      subtitle: "Comienza tu entrenamiento profesional en inglés",
      google: "Registrarse con Google",
      divider: "Registro seguro en un clic",
      toggle: "¿Ya tienes cuenta?",
      toggleAction: "Inicia sesión",
      trust: "1ª sesión gratis · Sin tarjeta · Sin suscripción",
    },
    ctaRegister: {
      title: "Estás a un paso de tu primera práctica",
      subtitle: "Crea tu cuenta y comienza a entrenar hoy",
    },
    errorFallback: "Ocurrió un error inesperado. Intenta de nuevo.",
  },
  setupModal: {
    stepLabels: ["Contexto", "Listo"],
    titles: { context: "Agrega contexto", ready: "¡Todo Listo!" },
    subtitles: { context: "Describe la situación para una simulación más realista", ready: "Inicia sesión para finalizar tu práctica" },
    next: "Siguiente",
    back: "Atrás",
    contextReady: "Tu contexto está listo — avanza al último paso",
    contextNeeded: "Completa al menos un campo de contexto para continuar",
    previewTitle: "PREVIEW DE TU ESTRATEGIA",
    previewBody: "Basándome en tu contexto, prepararé una estrategia con 3 pilares de valor personalizados, un guión de conversación, y una simulación con IA adaptada a tu",
    previewBlurred: "Incluyendo power phrases para nearshoring, manejo de objeciones culturales...",
    continueGoogle: "Continuar con Google",
    trustLine: "1ª sesión gratis · Sin tarjeta · Sin suscripción",
    scenarioLabels: { sales: "ventas", interview: "entrevista" },
    guidedFields: {
      interview: { role: "Puesto al que aplicas", rolePlaceholder: "Ej: Senior Product Manager en fintech", company: "Empresa o tipo de empresa", companyPlaceholder: "Ej: Startup fintech, Consultora Big 4, Empresa de tecnología" },
      sales: { product: "¿Qué producto o servicio presentas?", productPlaceholder: "Ej: Plataforma de marketing automation B2B", problem: "¿Qué problema resuelve para tu cliente?", problemPlaceholder: "Ej: Reduce el tiempo de onboarding de leads en un 40%" },
    },
  },
  dashboard: {
    greetingMorning: "¡Buenos días!",
    greetingAfternoon: "¡Buenas tardes!",
    greetingEvening: "¡Buenas noches!",
    subtitleWithData: "Aquí está tu progreso hasta ahora",
    subtitleEmpty: "Aún no has iniciado ninguna sesión",
    history: "Historial de sesiones",
    proficiency: {
      title: "Proficiencia en inglés",
      descWithData: "Tu nivel de inglés ha mejorado significativamente",
      descEmpty: "Aún no has iniciado ninguna sesión",
      cefrTitle: "Nivel CEFR",
      cefrDisclaimer: "Basado en tu progreso en sesiones",
    },
    stats: {
      sessions: "Sesiones completadas",
      biggestGain: "Mayor mejora",
      focusArea: "Área de enfoque",
      streak: "Racha de sesiones",
    },
    radar: {
      title: "Radar de habilidades",
      descWithData: "Visualiza tus fortalezas y áreas de mejora",
      descEmpty: "Aún no has iniciado ninguna sesión",
    },
    progress: {
      title: "Progreso",
      descMultiple: "Has completado múltiples sesiones",
      descSingle: "Has completado una sesión",
      descEmpty: "Aún no has iniciado ninguna sesión",
      emptyOneSessions: "Inicia tu primera sesión para ver tu progreso",
      emptyNoSessions: "Inicia sesiones para ver tu progreso",
    },
    quickStart: {
      title: "Comenzar rápido",
      salesLabel: "Pitch de ventas",
      salesDesc: "Practica cómo presentar tu producto o servicio a un cliente potencial",
      interviewLabel: "Entrevista de trabajo",
      interviewDesc: "Prepárate para responder preguntas clave en tu próxima entrevista",
    },
    improvement: {
      title: "Mejoras sugeridas",
      youSaid: "Dijiste",
      proVersion: "Versión PRO",
      technique: "Técnica",
    },
    recentSessions: {
      title: "Sesiones recientes",
      viewAll: "Ver todas",
      empty: "No hay sesiones recientes",
    },
    recommended: {
      title: "Recomendaciones",
      aiBadge: "AI",
      focusHint: "Enfócate en",
      defaultHint: "Practica más",
      firstHint: "Comienza con",
      startSession: "Iniciar sesión",
      descFocus: "Tu {pillar} está en {score}% — fortalezcámoslo con una sesión enfocada.",
      descPracticed: "Basándonos en tus sesiones, te recomendamos enfocarte en pronunciación y gramática.",
      descNew: "Comienza con un escenario popular para profesionales de nearshoring en LATAM.",
      scenarioInterview: "Entrevista de trabajo",
      scenarioSales: "Pitch de ventas SaaS B2B",
      scenarioInterviewDesc: "Practica respuestas STAR y fortalece tu posicionamiento profesional en inglés.",
      scenarioSalesDesc: "Practica un pitch convincente en inglés para el mercado US.",
      tagInterview: "Entrevista",
      tagSales: "Ventas",
      duration: "~8 min",
    },
  },
};

/* ═══════════════════════ PORTUGUESE ═══════════════════════ */
export const PT: LandingCopy = {
  nav: {
    howItWorks: "Como funciona",
    benefits: "Benefícios",
    pricing: "Preço",
    login: "Entrar",
    register: "Criar conta",
  },
  hero: {
    badge: "Treinamento de comunicação profissional em inglês.",
    headline: "Pratique suas conversas profissionais em inglês.",
    subheadline: "Ganhe Contratos em USD. Trabalhe Remoto. Expanda seu alcance.",
    trustBadges: ["1ª sessão grátis", "Sem cartão", "Sem assinatura"],
    socialProof: "já treinam com inFluentia PRO",
    socialProofHighlight: "500+ profissionais",
  },
  widget: {
    heading: "Comece agora:",
    subheading: "Escolha o cenário que deseja praticar",
    salesLabel: "Pitch de vendas",
    salesDesc: "Pratique como apresentar seu produto ou serviço a um cliente potencial",
    interviewLabel: "Entrevista de emprego",
    interviewDesc: "Prepare-se para responder perguntas-chave na sua próxima entrevista",
  },
  howItWorks: {
    sectionTitle: "Como funciona",
    steps: [
      { title: "Preparação", desc: "Escolha cenário, defina contexto e receba seu roteiro personalizado com pilares de valor e dicas-chave." },
      { title: "Prática", desc: "Simule sua conversa com IA que assume um papel realista enquanto você fala por voz." },
      { title: "Feedback", desc: "Análise em 3 dimensões, correções-chave, power phrases e feedback de sessão completo." },
    ],
  },
  screens: {
    setup: {
      title: "Configure sua prática",
      subtitle: "Defina o contexto e receba um roteiro personalizado",
      narrativeLabel: "Narrativa",
      narrativeStructure: "Estrutura da narrativa",
      strategyTitle: "Estratégia",
      pillars: ["Pilar 1: Diferenciação técnica", "Pilar 2: Proof points"],
      scriptSectionTitle: "Exemplo de roteiro",
      scriptExcerpt: "Enfatize sua experiência em plataformas SaaS escaláveis e seu stack tecnológico moderno — isso te diferencia de agências genéricas.\nUse dados concretos: 50+ projetos enterprise, 98% de retenção de clientes, e cases de sucesso com startups Series A similares.",
      highlightPhrase: "We've delivered 50+ enterprise platforms",
      highlightTooltip: "Melhor que 'We have a lot of experience'",
      legendStructure: "Estrutura",
      legendImpact: "Impacto",
      legendEngagement: "Engagement",
      cta: "Começar prática",
    },
    chat: {
      role: "Cliente potencial · Startup Series A",
      live: "Ao vivo",
    },
    feedback: {
      subline: "Sales Pitch · Sessão completada",
      workedWell: "O que funcionou bem",
      strength1: "Abertura com pergunta de dor",
      strength2: "Dados concretos como respaldo",
      keyImprovements: "Melhorias-chave",
      powerPhrases: "Power Phrases",
      phrase1: "We've delivered 50+ enterprise platforms",
      phrase1ctx: "Melhor que 'We have a lot of experience'",
      powerQuestions: "Perguntas poderosas",
      question1: "What does success look like for your team in Q3?",
      questionTiming: "No início",
      cta: "Finalizar e gerar relatório",
    },
  },
  benefits: {
    sectionTitle: "O inFluentia PRO é para você?",
    sectionSubtitle: "inFluentia PRO não é para todos. É para profissionais ambiciosos.",
    yesTitle: "É para você se...",
    yesList: [
      "Quer impactar em apresentações profissionais",
      "Precisa negociar salários ou contratos",
      "Lidera reuniões com equipes internacionais",
      "Fecha vendas complexas em inglês",
      "Participa de entrevistas",
    ],
    noTitle: "Não é para você se...",
    noList: [
      "Você é um falante não nativo e está aprendendo inglês do zero",
      "Busca aulas de gramática básica",
      "Prefere apenas ler ou escrever em inglês",
      "Não tem cenários profissionais",
      "Não usa inglês no trabalho",
    ],
    levelLabel: "Nível recomendado:",
    levelDesc: "B1+ (Intermediário). Você já consegue manter conversas básicas, agora precisa dominá-las.",
  },
  beforeAfter: {
    sectionTitle: "Antes e Depois",
    sectionSubtitle: "Assim o inFluentia PRO transforma suas conversas profissionais",
    withTitle: "Com inFluentia PRO",
    withList: [
      "Você já praticou 10 vezes",
      "Conhece cada pergunta e objeção possível",
      "Fala com segurança",
      "Negocia e demonstra seu valor",
      "Ganha presença executiva",
    ],
    withoutTitle: "Sem preparação",
    withoutList: [
      "Improvisa seu pitch",
      "Torce para não receberem perguntas difíceis",
      "Fala com insegurança",
      "Perde oportunidade de impactar",
      "Perde presença",
    ],
  },
  impact: {
    sectionTitle: "Impacto Real na sua Carreira",
    sectionSubtitle: "Resultados mensuráveis que transformam trajetórias profissionais",
    cards: [
      { stat: "3x", label: "mais oportunidades", desc: "de liderança internacional" },
      { stat: "89%", label: "dos usuários sentem mais segurança", desc: "ao falar em situações críticas" },
      { stat: "$15K+", label: "aumento salarial médio", desc: "estimado (Nearshoring 2026)" },
    ],
  },
  pricing: {
    sectionTitle: "Invista na sua vantagem competitiva",
    sectionSubtitle: "Pratique entrevistas e vendas em inglês com IA avançada.\n1ª sessão grátis. Depois pague só quando precisar.",
    freeSession: {
      title: "1ª Sessão Grátis",
      desc: "Experimente a sessão completa sem compromisso",
      features: ["Simulação completa com IA", "Feedback + Roteiro personalizado", "Feedback detalhado da sessão", "Sem cartão de crédito"],
      button: "Começar grátis",
    },
    packs: [
      { name: "1 Sessão", sessions: 1, price: "$4.99", perSession: "$4.99", button: "Comprar", features: ["Sessão completa com GPT-4o", "Feedback profundo", "Roteiro otimizado editável", "Shadowing com scoring"] },
      { name: "3 Sessões", sessions: 3, price: "$12.99", perSession: "$4.33", discount: "13%", button: "Comprar pack", features: ["Tudo da sessão individual", "Economize $2.00", "Ideal para se preparar a fundo", "Gera SR cards"] },
      { name: "5 Sessões", sessions: 5, price: "$19.99", perSession: "$4.00", discount: "20%", featured: true, button: "Comprar pack", features: ["Tudo da sessão individual", "Economize $5.00", "Melhor custo-benefício", "Gera SR cards"] },
    ],
    freeTrialNote: "Experimente sua primeira sessão completamente grátis — sem cartão, sem compromisso",
    perSessionLabel: "por sessão",
    savingsLabel: "economia",
    statsBar: [
      { value: "10x", desc: "mais barato que coaching presencial" },
      { value: "90%", desc: "margem para reinvestir na sua carreira" },
      { value: "24/7", desc: "treine quando precisar" },
    ],
  },
  faq: {
    sectionTitle: "Perguntas Frequentes",
    sectionSubtitle: "Tudo que você precisa saber antes de começar",
    items: [
      { q: "O inFluentia PRO é um curso de inglês?", a: "Não, cursos e apps de inglês já existem muitos; se você precisa aprender as bases, recomendamos usar um desses. O inFluentia PRO é uma ferramenta que ajuda a praticar sua comunicação, pronúncia e discurso profissional para se preparar antes de uma reunião importante." },
      { q: "Preciso de um nível mínimo de inglês?", a: "Sim, o inFluentia PRO é para profissionais que já têm uma base (B1+) e precisam usar o inglês como ferramenta de trabalho. Não ensinamos a conjugar verbos, ensinamos a fechar negócios." },
      { q: "O que acontece com a privacidade dos meus documentos?", a: "Suas notas e apresentações são processadas de forma segura e privada. São utilizadas apenas para configurar sua sessão de prática e melhorar seu roteiro." },
      { q: "Como se diferencia de um professor particular?", a: "Um professor corrige seu inglês e custa USD $25 por sessão; o inFluentia PRO ajuda a melhorar sua pronúncia e forma de se comunicar profissionalmente para elevar seu nível. Além disso, estamos disponíveis 24/7 para aquela reunião de emergência que surgiu de improviso." },
      { q: "Posso usar para entrevistas de trabalho específicas?", a: "Totalmente. Você pode carregar a descrição da vaga (Job Description) e a IA atuará como o recrutador específico daquela empresa." },
      { q: "Quanto tempo preciso praticar para ver resultados?", a: "A maioria dos usuários relata mais confiança após 3-5 sessões. Para consolidar uma mudança real na comunicação profissional, recomendamos 90 dias de prática regular — até 15 minutos por dia fazem diferença." },
      { q: "Posso cancelar a qualquer momento?", a: "Não há assinatura para cancelar. Você compra créditos de sessão e usa quando quiser — sem compromissos mensais, sem cobranças recorrentes, sem complicações. Seus créditos não expiram." },
    ],
  },
  finalCta: {
    headline1: "Sua próxima conversa importante",
    headline2: "pode mudar tudo.",
    subline: "Treine. Domine. Vença",
    button: "Experimentar grátis",
    badges: ["Sem cartão de crédito", "1ª sessão grátis", "Sem assinatura"],
  },
  footer: {
    tagline: "O coach de comunicação profissional com IA para líderes latino-americanos.",
    columns: [
      { title: "Produto", items: ["Como funciona", "Funcionalidades", "Preços"] },
      { title: "Empresa", items: ["Sobre nós", "Blog", "Contato"] },
      { title: "Legal", items: ["Privacidade", "Termos", "Cookies"] },
    ],
    copyright: "© 2026 inFluentia PRO. Todos os direitos reservados.",
    dashboardLink: "Ir ao dashboard",
  },
  auth: {
    login: {
      title: "Bem-vindo de volta",
      subtitle: "Entre para continuar seu treinamento",
      google: "Continuar com Google",
      divider: "Use a mesma conta com a qual se registrou",
      toggle: "Não tem conta?",
      toggleAction: "Registre-se",
    },
    register: {
      title: "Crie sua conta",
      subtitle: "Comece seu treinamento profissional em inglês",
      google: "Registrar com Google",
      divider: "Registro seguro em um clique",
      toggle: "Já tem conta?",
      toggleAction: "Entrar",
      trust: "1ª sessão grátis · Sem cartão · Sem assinatura",
    },
    ctaRegister: {
      title: "Você está a um passo da sua primeira prática",
      subtitle: "Crie sua conta e comece a treinar hoje",
    },
    errorFallback: "Ocorreu um erro inesperado. Tente novamente.",
  },
  setupModal: {
    stepLabels: ["Contexto", "Pronto"],
    titles: { context: "Adicione contexto", ready: "Tudo Pronto!" },
    subtitles: { context: "Descreva a situação para uma simulação mais realista", ready: "Entre para finalizar sua prática" },
    next: "Próximo",
    back: "Voltar",
    contextReady: "Seu contexto está pronto — avance para o último passo",
    contextNeeded: "Complete pelo menos um campo de contexto para continuar",
    previewTitle: "PREVIEW DA SUA ESTRATÉGIA",
    previewBody: "Com base no seu contexto, prepararei uma estratégia com 3 pilares de valor personalizados, um roteiro de conversa e uma simulação com IA adaptada ao seu",
    previewBlurred: "Incluindo power phrases para nearshoring, manejo de objeções culturais...",
    continueGoogle: "Continuar com Google",
    trustLine: "1ª sessão grátis · Sem cartão · Sem assinatura",
    scenarioLabels: { sales: "vendas", interview: "entrevista" },
    guidedFields: {
      interview: { role: "Cargo que você está se candidatando", rolePlaceholder: "Ex: Senior Product Manager em fintech", company: "Empresa ou tipo de empresa", companyPlaceholder: "Ex: Startup fintech, Consultoria Big 4, Empresa de tecnologia" },
      sales: { product: "Qual produto ou serviço você apresenta?", productPlaceholder: "Ex: Plataforma de marketing automation B2B", problem: "Que problema resolve para seu cliente?", problemPlaceholder: "Ex: Reduz o tempo de onboarding de leads em 40%" },
    },
  },
  dashboard: {
    greetingMorning: "Bom dia!",
    greetingAfternoon: "Boa tarde!",
    greetingEvening: "Boa noite!",
    subtitleWithData: "Aqui está o seu progresso até agora",
    subtitleEmpty: "Você ainda não iniciou nenhuma sessão",
    history: "Histórico de sessões",
    proficiency: {
      title: "Proficiência em inglês",
      descWithData: "O seu nível de inglês melhorou significativamente",
      descEmpty: "Você ainda não iniciou nenhuma sessão",
      cefrTitle: "Nível CEFR",
      cefrDisclaimer: "Baseado no seu progresso em sessões",
    },
    stats: {
      sessions: "Sessões concluídas",
      biggestGain: "Maior melhoria",
      focusArea: "Área de foco",
      streak: "Racha de sessões",
    },
    radar: {
      title: "Radar de habilidades",
      descWithData: "Visualize suas forças e áreas de melhoria",
      descEmpty: "Você ainda não iniciou nenhuma sessão",
    },
    progress: {
      title: "Progresso",
      descMultiple: "Você concluiu várias sessões",
      descSingle: "Você concluiu uma sessão",
      descEmpty: "Você ainda não iniciou nenhuma sessão",
      emptyOneSessions: "Inicie sua primeira sessão para ver seu progresso",
      emptyNoSessions: "Inicie sessões para ver seu progresso",
    },
    quickStart: {
      title: "Início rápido",
      salesLabel: "Pitch de vendas",
      salesDesc: "Pratique como apresentar seu produto ou serviço a um cliente potencial",
      interviewLabel: "Entrevista de trabalho",
      interviewDesc: "Prepare-se para responder perguntas-chave na sua próxima entrevista",
    },
    improvement: {
      title: "Melhorias sugeridas",
      youSaid: "Você disse",
      proVersion: "Versão PRO",
      technique: "Técnica",
    },
    recentSessions: {
      title: "Sessões recentes",
      viewAll: "Ver todas",
      empty: "Não há sessões recentes",
    },
    recommended: {
      title: "Recomendações",
      aiBadge: "AI",
      focusHint: "Foque em",
      defaultHint: "Pratique mais",
      firstHint: "Comece com",
      startSession: "Iniciar sessão",
      descFocus: "Seu {pillar} está em {score}% — vamos fortalecê-lo com uma sessão focada.",
      descPracticed: "Com base nas suas sessões, recomendamos focar em pronúncia e gramática.",
      descNew: "Comece com um cenário popular para profissionais de nearshoring na América Latina.",
      scenarioInterview: "Entrevista de emprego",
      scenarioSales: "Pitch de vendas SaaS B2B",
      scenarioInterviewDesc: "Pratique respostas STAR e fortaleça seu posicionamento profissional em inglês.",
      scenarioSalesDesc: "Pratique um pitch convincente em inglês para o mercado americano.",
      tagInterview: "Entrevista",
      tagSales: "Vendas",
      duration: "~8 min",
    },
  },
};

/* ═══════════════════════ ENGLISH ═══════════════════════ */
export const EN: LandingCopy = {
  nav: {
    howItWorks: "How It Works",
    benefits: "Benefits",
    pricing: "Pricing",
    login: "Sign In",
    register: "Get Started",
  },
  hero: {
    badge: "AI-powered professional communication training.",
    headline: "Rehearse your high-stakes conversations before they happen.",
    subheadline: "Win Contracts. Work Remotely. Expand Your Reach.",
    trustBadges: ["1st session free", "No credit card", "No subscription"],
    socialProof: "already train with inFluentia PRO",
    socialProofHighlight: "500+ professionals",
  },
  widget: {
    heading: "Start now:",
    subheading: "Choose the scenario you want to practice",
    salesLabel: "Sales Pitch",
    salesDesc: "Practice presenting your product or service to a potential client",
    interviewLabel: "Job Interview",
    interviewDesc: "Prepare to answer key questions in your next interview",
  },
  howItWorks: {
    sectionTitle: "How It Works",
    steps: [
      { title: "Preparation", desc: "Choose a scenario, define context, and receive a personalized script with value pillars and key tips." },
      { title: "Practice", desc: "Simulate your conversation with AI that takes on a realistic role while you speak by voice." },
      { title: "Feedback", desc: "3-dimension analysis, key corrections, power phrases, and a complete session feedback." },
    ],
  },
  screens: {
    setup: {
      title: "Set up your practice",
      subtitle: "Define the context and receive a personalized script",
      narrativeLabel: "Narrative",
      narrativeStructure: "Narrative Structure",
      strategyTitle: "Strategy",
      pillars: ["Pillar 1: Technical Differentiation", "Pillar 2: Proof Points"],
      scriptSectionTitle: "Script Example",
      scriptExcerpt: "Emphasize your experience with scalable SaaS platforms and your modern tech stack — this sets you apart from generic agencies.\nUse concrete data: 50+ enterprise projects, 98% client retention, and success stories with similar Series A startups.",
      highlightPhrase: "We've delivered 50+ enterprise platforms",
      highlightTooltip: "Better than 'We have a lot of experience'",
      legendStructure: "Structure",
      legendImpact: "Impact",
      legendEngagement: "Engagement",
      cta: "Start Practice",
    },
    chat: {
      role: "Potential Client · Series A Startup",
      live: "Live",
    },
    feedback: {
      subline: "Sales Pitch · Session Completed",
      workedWell: "What Worked Well",
      strength1: "Opening with a pain-point question",
      strength2: "Concrete data as backup",
      keyImprovements: "Key Improvements",
      powerPhrases: "Power Phrases",
      phrase1: "We've delivered 50+ enterprise platforms",
      phrase1ctx: "Better than 'We have a lot of experience'",
      powerQuestions: "Power Questions",
      question1: "What does success look like for your team in Q3?",
      questionTiming: "At the start",
      cta: "Finish & Generate Report",
    },
  },
  benefits: {
    sectionTitle: "Is inFluentia PRO for you?",
    sectionSubtitle: "inFluentia PRO isn't for everyone. It's for ambitious professionals.",
    yesTitle: "It's for you if...",
    yesList: [
      "You need to make an impact in professional presentations",
      "You negotiate salaries or contracts",
      "You lead meetings with international teams",
      "You close complex deals in English",
      "You're preparing for interviews at global companies",
    ],
    noTitle: "It's not for you if...",
    noList: [
      "You are a non native speaker and you are learning english from scratch",
      "You're looking for basic grammar lessons",
      "You only read or write in English",
      "You don't have professional scenarios to practice",
      "You don't use English at work",
    ],
    levelLabel: "Recommended level:",
    levelDesc: "B1+ (Intermediate). You can hold basic conversations — now you need to command them.",
  },
  beforeAfter: {
    sectionTitle: "Before & After",
    sectionSubtitle: "How inFluentia PRO transforms your professional conversations",
    withTitle: "With inFluentia PRO",
    withList: [
      "You've rehearsed it 10 times",
      "You know every possible question and objection",
      "You speak with confidence",
      "You negotiate and demonstrate your value",
      "You project executive presence",
    ],
    withoutTitle: "Without preparation",
    withoutList: [
      "You improvise your pitch",
      "You hope they won't ask tough questions",
      "You speak with uncertainty",
      "You miss the chance to make an impact",
      "You lose presence",
    ],
  },
  impact: {
    sectionTitle: "Real Career Impact",
    sectionSubtitle: "Measurable results that transform professional trajectories",
    cards: [
      { stat: "3x", label: "more opportunities", desc: "for international leadership roles" },
      { stat: "89%", label: "of users feel more confident", desc: "speaking in high-stakes situations" },
      { stat: "$15K+", label: "average salary increase", desc: "estimated (Nearshoring 2026)" },
    ],
  },
  pricing: {
    sectionTitle: "Invest in your competitive edge",
    sectionSubtitle: "Practice interviews and sales conversations with advanced AI.\n1st session free. Then pay only when you need it.",
    freeSession: {
      title: "1st Session Free",
      desc: "Experience the full session with no commitment",
      features: ["Full AI simulation", "Feedback + Personalized script", "Detailed session feedback", "No credit card required"],
      button: "Start free",
    },
    packs: [
      { name: "1 Session", sessions: 1, price: "$4.99", perSession: "$4.99", button: "Buy", features: ["Full session with GPT-4o", "Deep feedback", "Editable optimized script", "Shadowing with scoring"] },
      { name: "3 Sessions", sessions: 3, price: "$12.99", perSession: "$4.33", discount: "13%", button: "Buy pack", features: ["Everything in 1 session", "Save $2.00", "Ideal for thorough prep", "SR cards generated"] },
      { name: "5 Sessions", sessions: 5, price: "$19.99", perSession: "$4.00", discount: "20%", featured: true, button: "Buy pack", features: ["Everything in 1 session", "Save $5.00", "Best value", "SR cards generated"] },
    ],
    freeTrialNote: "Try your first session completely free — no credit card, no commitment",
    perSessionLabel: "per session",
    savingsLabel: "savings",
    statsBar: [
      { value: "10x", desc: "cheaper than in-person coaching" },
      { value: "90%", desc: "margin to reinvest in your career" },
      { value: "24/7", desc: "train whenever you need" },
    ],
  },
  faq: {
    sectionTitle: "Frequently Asked Questions",
    sectionSubtitle: "Everything you need to know before getting started",
    items: [
      { q: "Is inFluentia PRO an English course?", a: "No. There are plenty of English courses and apps out there; if you need to learn the basics, we recommend using one of those. inFluentia PRO is a communication training tool that helps you rehearse your delivery, pronunciation, and professional discourse before an important meeting." },
      { q: "Do I need a minimum English level?", a: "Yes. inFluentia PRO is built for professionals who already have a solid foundation (B1+) and need English as a work tool. We don't teach verb conjugation — we teach you how to close deals." },
      { q: "What about the privacy of my documents?", a: "Your notes and presentations are processed securely and privately. They are only used to configure your practice session and improve your script." },
      { q: "How is it different from a private tutor?", a: "A tutor corrects your grammar at ~$25/session. inFluentia PRO trains how you communicate professionally — your presence, structure, and persuasion. Plus, we're available 24/7 for that last-minute meeting that just popped up." },
      { q: "Can I use it for specific job interviews?", a: "Absolutely. You can provide the job description and the AI will act as that company's specific recruiter." },
      { q: "How long do I need to practice to see results?", a: "Most users report increased confidence after 3–5 sessions. For lasting change in professional communication, we recommend 90 days of regular practice — even 15 minutes a day makes a difference." },
      { q: "Can I cancel anytime?", a: "There's no subscription to cancel. You buy session credits and use them whenever you want — no monthly commitments, no recurring charges, no hassle. Your credits never expire." },
    ],
  },
  finalCta: {
    headline1: "Your next important conversation",
    headline2: "could change everything.",
    subline: "Train. Command. Win",
    button: "Try free",
    badges: ["No credit card", "1st session free", "No subscription"],
  },
  footer: {
    tagline: "The AI-powered professional communication coach for ambitious leaders.",
    columns: [
      { title: "Product", items: ["How It Works", "Features", "Pricing"] },
      { title: "Company", items: ["About Us", "Blog", "Contact"] },
      { title: "Legal", items: ["Privacy", "Terms", "Cookies"] },
    ],
    copyright: "© 2026 inFluentia PRO. All rights reserved.",
    dashboardLink: "Go to dashboard",
  },
  auth: {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to continue your training",
      google: "Continue with Google",
      divider: "Use the same account you registered with",
      toggle: "Don't have an account?",
      toggleAction: "Sign up",
    },
    register: {
      title: "Create your account",
      subtitle: "Start your professional communication training",
      google: "Sign up with Google",
      divider: "Secure one-click registration",
      toggle: "Already have an account?",
      toggleAction: "Sign in",
      trust: "1st session free · No credit card · No subscription",
    },
    ctaRegister: {
      title: "You're one step away from your first practice",
      subtitle: "Create your account and start training today",
    },
    errorFallback: "An unexpected error occurred. Please try again.",
  },
  setupModal: {
    stepLabels: ["Context", "Ready"],
    titles: { context: "Add context", ready: "All Set!" },
    subtitles: { context: "Describe the situation for a more realistic simulation", ready: "Sign in to finalize your practice" },
    next: "Next",
    back: "Back",
    contextReady: "Your context is ready — proceed to the last step",
    contextNeeded: "Complete at least one context field to continue",
    previewTitle: "STRATEGY PREVIEW",
    previewBody: "Based on your context, I'll prepare a strategy with 3 personalized value pillars, a conversation script, and an AI simulation tailored to your",
    previewBlurred: "Including nearshoring power phrases, cultural objection handling...",
    continueGoogle: "Continue with Google",
    trustLine: "1st session free · No credit card · No subscription",
    scenarioLabels: { sales: "sales", interview: "interview" },
    guidedFields: {
      interview: { role: "Role you're applying for", rolePlaceholder: "e.g. Senior Product Manager at a fintech", company: "Company or company type", companyPlaceholder: "e.g. Fintech startup, Big 4 consulting, Tech company" },
      sales: { product: "What product or service are you presenting?", productPlaceholder: "e.g. B2B marketing automation platform", problem: "What problem does it solve for your client?", problemPlaceholder: "e.g. Reduces lead onboarding time by 40%" },
    },
  },
  dashboard: {
    greetingMorning: "Good morning!",
    greetingAfternoon: "Good afternoon!",
    greetingEvening: "Good evening!",
    subtitleWithData: "Here's your progress so far",
    subtitleEmpty: "You haven't started any sessions yet",
    history: "Session history",
    proficiency: {
      title: "English proficiency",
      descWithData: "Your English level has improved significantly",
      descEmpty: "You haven't started any sessions yet",
      cefrTitle: "CEFR level",
      cefrDisclaimer: "Based on your session progress",
    },
    stats: {
      sessions: "Completed sessions",
      biggestGain: "Biggest gain",
      focusArea: "Focus area",
      streak: "Session streak",
    },
    radar: {
      title: "Skill radar",
      descWithData: "Visualize your strengths and areas for improvement",
      descEmpty: "You haven't started any sessions yet",
    },
    progress: {
      title: "Progress",
      descMultiple: "You've completed multiple sessions",
      descSingle: "You've completed one session",
      descEmpty: "You haven't started any sessions yet",
      emptyOneSessions: "Start your first session to see your progress",
      emptyNoSessions: "Start sessions to see your progress",
    },
    quickStart: {
      title: "Quick start",
      salesLabel: "Sales pitch",
      salesDesc: "Practice presenting your product or service to a potential client",
      interviewLabel: "Job interview",
      interviewDesc: "Prepare to answer key questions in your next interview",
    },
    improvement: {
      title: "Suggested improvements",
      youSaid: "You said",
      proVersion: "Pro version",
      technique: "Technique",
    },
    recentSessions: {
      title: "Recent sessions",
      viewAll: "View all",
      empty: "No recent sessions",
    },
    recommended: {
      title: "Recommendations",
      aiBadge: "AI",
      focusHint: "Focus on",
      defaultHint: "Practice more",
      firstHint: "Start with",
      startSession: "Start session",
      descFocus: "Your {pillar} is at {score}% — let's focus on it with a targeted session.",
      descPracticed: "Based on your sessions, we recommend focusing on pronunciation and grammar.",
      descNew: "Start with a popular scenario for nearshoring professionals in LATAM.",
      scenarioInterview: "Job interview",
      scenarioSales: "Sales pitch SaaS B2B",
      scenarioInterviewDesc: "Practice STAR responses and strengthen your professional positioning in English.",
      scenarioSalesDesc: "Practice a convincing pitch in English for the US market.",
      tagInterview: "Interview",
      tagSales: "Sales",
      duration: "~8 min",
    },
  },
};

export const LANDING_COPIES: Record<LandingLang, LandingCopy> = { es: ES, pt: PT, en: EN };