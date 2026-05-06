/**
* ══════════════════════════════════════════════════════════════
*  MasteryTalk PRO — Landing Page i18n
*  All pre-login UI copy lives here for easy maintenance.
*  v4 — Direct, colloquial tone for LATAM professionals
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
    cta: string;
  };
  /* ── Hero ── */
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
  };
  /* ── Practice Widget ── */
  widget: {
    instruction: string;
    microcopy: string;
    interviewLabel: string;
    interviewHook: string;
    meetingLabel: string;
    meetingHook: string;
    presentationLabel: string;
    presentationHook: string;
    cardCta: string;
  };
  /* ── How It Works ── */
  howItWorks: {
    sectionTitle: string;
    steps: { title: string; desc: string }[];
  };
  /* ── How It Works Screens (mockup UI text — used by HowItWorksTabs) ── */
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
  /* ── Differentiators ── */
  differentiators: {
    sectionTitle: string;
    items: { title: string; desc: string }[];
  };
  /* ── For You / Benefits ── */
  benefits: {
    sectionTitle: string;
    yesList: string[];
    noList: string[];
  };
  /* ── Before & After ── */
  beforeAfter: {
    sectionTitle: string;
    withoutTitle: string;
    withoutList: string[];
    withTitle: string;
    withList: string[];
  };
  /* ── Session Takeaways (replaces Impact) ── */
  sessionTakeaways: {
    sectionTitle: string;
    items: { metric: string; desc: string }[];
  };
  /* ── Routes ── */
  routes: {
    sectionTitle: string;
    subtitle: string;
    items: { name: string; hook: string }[];
  };
  /* ── El Programa / Program Arc ── */
  programa: {
    sectionTitle: string;
    subtitle: string;
    blocks: { phase: string; duration: string; title: string; desc: string }[];
    warRoom: { label: string; desc: string };
  };
  /* ── Pricing ── */
  pricing: {
    sectionTitle: string;
    headline: string;
    subtitle: string;
    launchBadge: string;       // shown on both cards when EB active
    slotsLeft: string;         // "{{count}} spots left at this price"
    slotsGone: string;         // shown when EB exhausted
    saveBadge: string;         // quarterly badge, e.g. "Save 20%"
    monthly: {
      label: string;
      period: string;
      features: string[];
    };
    quarterly: {
      label: string;
      period: string;
      perMonth: string;        // "{{price}}/mo equivalent"
      features: string[];
    };
    modal: {
      headline: string;
      subtitle: string;
      cta: string;
      ctaProcessing: string;
      legal: string;
    };
    demoLine: string;
    anchorLine: string;  // external price anchor above cards
    roiLine: string;     // ROI framing below quarterly price
    cancelLine: string;  // cancel-anytime co-located with scarcity
  };
  /* ── FAQ ── */
  faq: {
    sectionTitle: string;
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
      termsNotice: string;
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
    cta: "Probar gratis",
  },
  hero: {
    badge: "✶ El programa de comunicación profesional en inglés para nearshoring.",
    headline: "90 días para comunicarte con autoridad en inglés profesional.",
    subheadline: "Un programa estructurado con IA. Practica las conversaciones que importan, recibe feedback real y avanza nivel por nivel. Para el profesional que ya sabe inglés pero no está al nivel que quiere.",
  },
  widget: {
    instruction: "Elige la conversación que quieres ganar.",
    microcopy: "Gratis · Sin tarjeta · Sin suscripción",
    interviewLabel: "Entrevista de trabajo",
    interviewHook: "Consigue el trabajo. Defiende tu valor. Sin titubear.",
    meetingLabel: "Reuniones remotas",
    meetingHook: "Participa, lidera y cierra. No solo estés presente.",
    presentationLabel: "Presentaciones",
    presentationHook: "Que te escuchen, no solo que te entiendan.",
    cardCta: "Empezar →",
  },
  howItWorks: {
    sectionTitle: "Tres pasos. Una conversación que ya no te preocupa.",
    steps: [
      { title: "Recibe tu brief. Entra con estructura.", desc: "Antes de hablar recibes el framework, ejemplos reales de respuestas débiles vs. fuertes y tu plantilla de anclaje. No improvisas — llegas preparado." },
      { title: "Habla. Con alguien que no te perdona.", desc: "La IA asume el rol que tú defines — entrevistador, cliente, líder de equipo. Responde como lo haría en la vida real. Te cuestiona, te presiona, no valida todo lo que dices." },
      { title: "Feedback real. PDF listo para usar.", desc: "Sabrás dónde perdiste fluidez, qué pronunciación corregir y qué frases reemplazar. Con ejemplos de cómo debería sonar. Descárgalo y tenlo a mano antes de la conversación real." },
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
  differentiators: {
    sectionTitle: "No es un curso de inglés. Es práctica conversacional profesional.",
    items: [
      { title: "Aprendes frameworks reales practicando, no estudiando.", desc: "Cada sesión incluye un brief con técnicas de comunicación profesional y correcciones en contexto — no en un examen. Con cada sesión, tu inglés profesional se vuelve más preciso, más fluido, más tuyo." },
      { title: "Tu contexto, tu conversación.", desc: "Tú defines el escenario — tu rol, tu industria, tu situación. La IA construye la sesión alrededor de eso. No un guión genérico. Tu conversación." },
      { title: "Feedback de fluidez y pronunciación — en PDF descargable.", desc: "Sabrás exactamente dónde te trabaste y qué pronunciación corregir. Con ejemplos de cómo debería sonar. Descárgalo. Tenlo abierto antes de tu próxima conversación real." },
      { title: "El amigo que te daría el mejor feedback no siempre está disponible.", desc: "MasteryTalk.pro sí. A las 2am antes de tu entrevista, una hora antes de tu presentación, o el domingo antes de esa reunión del lunes. Sin agendar. Sin depender de nadie." },
    ],
  },
  benefits: {
    sectionTitle: "Para el que usa inglés en su trabajo — o quiere hacerlo.",
    yesList: [
      "Tienes entrevistas con empresas que pagan en USD",
      "Participas o lideras reuniones con equipos internacionales",
      "Presentas proyectos a clientes en inglés",
      "Buscas trabajo y no quieres que tu comunicación te reste puntos",
      "Sabes inglés pero en conversaciones reales no te expresas al nivel que eres",
    ],
    noList: [
      "Aprendes inglés desde cero",
      "Buscas un curso de gramática o vocabulario",
      "No usas ni planeas usar inglés en tu carrera",
    ],
  },
  beforeAfter: {
    sectionTitle: "Practicar existe. Practicar bien, es otra cosa.",
    withoutTitle: "Práctica pasiva",
    withoutList: [
      "Practicas en el espejo. Nadie te cuestiona.",
      "Tu amigo dice \"estuvo bien\" y ya",
      "No sabes dónde falló tu fluidez ni qué frases sonaron débiles",
      "Llegas a la conversación real sin haber sentido presión",
    ],
    withTitle: "Con MasteryTalk.pro",
    withList: [
      "El interlocutor te cuestiona, te presiona, no te da respuestas fáciles",
      "Sabes qué decir cuando silencian la sala",
      "Feedback de fluidez y pronunciación con ejemplos concretos",
      "Entras pensando en ganar, no en sobrevivir",
    ],
  },
  sessionTakeaways: {
    sectionTitle: "Lo que te llevas de cada sesión.",
    items: [
      { metric: "Fluidez", desc: "Sabes dónde te trabaste y cómo no volver a hacerlo." },
      { metric: "Pronunciación", desc: "Qué corregir y cómo debería sonar." },
      { metric: "PDF", desc: "Tu informe descargable para estudiar o tener a mano." },
    ],
  },
  routes: {
    sectionTitle: "Elige la ruta que necesitas ahora.",
    subtitle: "Tú eliges tu Primary Path al suscribirte. Al completarlo, desbloqueas el siguiente — una ruta a la vez.",
    items: [
      { name: "Entrevista de trabajo", hook: "Consigue el trabajo. Defiende tu valor. Sin titubear." },
      { name: "Reuniones remotas", hook: "Participa, lidera y cierra. No solo estés presente." },
      { name: "Presentaciones", hook: "Que te escuchen, no solo que te entiendan." },
    ],
  },
  pricing: {
    sectionTitle: "El Programa",
    headline: "Únete al programa.",
    subtitle: "Los primeros 25 suscriptores se convierten en Founding Members — precio bloqueado para siempre a $59 por 3 meses.",
    launchBadge: "⭐ Founding Member",
    slotsLeft: "{{count}} slots Founding Member disponibles",
    slotsGone: "Founding Member agotado — precio regular activo",
    saveBadge: "Ahorra $18 vs mensual",
    monthly: {
      label: "Acceso mensual",
      period: "/mes",
      features: [
        "Tu Primary Path (6 niveles)",
        "War Room — 5 sesiones/mes",
        "WhatsApp SR Coach diario",
        "Lessons Library completa",
        "Cancela cuando quieras",
      ],
    },
    quarterly: {
      label: "El Programa",
      period: "/ 3 meses",
      perMonth: "{{price}}/mes equivalente",
      features: [
        "Tu Primary Path + rutas progresivas",
        "War Room — 5 sesiones/mes",
        "WhatsApp SR Coach diario",
        "Lessons Library completa",
        "Ahorra $18 vs pago mensual",
      ],
    },
    modal: {
      headline: "Únete al Programa",
      subtitle: "Tu Primary Path desde el día 1. War Room para urgencias. Feedback de IA en cada sesión.",
      cta: "Comenzar programa",
      ctaProcessing: "Redirigiendo a Stripe...",
      legal: "Pago seguro con Stripe · Cancela desde tu cuenta · Sin costos ocultos",
    },
    demoLine: "Tu primera sesión de auto-presentación es completamente gratis — sin tarjeta, sin compromiso.",
    anchorLine: "Menos que una hora con un tutor de inglés. Resultados en 90 días.",
    roiLine: "Se paga solo con tu primer aumento.",
    cancelLine: "Cancela en un clic. Sin App Store, sin sorpresas.",
  },
  faq: {
    sectionTitle: "Preguntas Frecuentes",
    items: [
      { q: "¿Esto es diferente a Duolingo o un curso de inglés?", a: "No es un curso de gramática. Aprendes comunicación profesional practicando conversaciones reales — con frameworks, con correcciones en contexto. Si ya sabes inglés pero en conversaciones reales no llegas al nivel que eres, esto es para ti." },
      { q: "¿Hay suscripción o cobro mensual?", a: "Sí. MasteryTalk es un programa de suscripción — mensual ($49/mes) o trimestral ($129/3 meses). Los primeros 25 suscriptores quedan bloqueados en $59/3 meses para siempre como Founding Members. No hay compras por sesión ni por ruta individual." },
      { q: "¿Qué pasa después de 90 días?", a: "Tu programa se renueva automáticamente al siguiente bloque. Al completar tu Primary Path desbloqueas una nueva ruta — tú eliges cuál. El dashboard muestra 'Día X de 90' y siempre hay un siguiente nivel que alcanzar." },
      { q: "¿Puedo practicar un escenario urgente si tengo una entrevista mañana?", a: "Sí. El War Room te da acceso inmediato a cualquier escenario — sin importar en qué path estés. Incluye 5 sesiones por mes. Es el valve de urgencia del programa: si tienes una entrevista en 3 días, úsalo." },
      { q: "¿La conversación se adapta a mi industria o rol?", a: "Sí. Tú defines el contexto — tu rol, tu empresa, la situación. La IA construye la sesión alrededor de eso. No un escenario genérico. El tuyo." },
    ],
  },
  finalCta: {
    headline1: "Tu próxima conversación importante",
    headline2: "puede cambiar todo.",
    subline: "Una sesión a la vez. Un nivel más cada vez.",
    button: "Practica tu primera conversación gratis",
    badges: ["Sin tarjeta", "Primera sesión gratis", "25 slots Founding Member"],
  },
  programa: {
    sectionTitle: "Un programa de 3 meses. No una app.",
    subtitle: "Cada bloque te lleva más lejos. No hay 'terminar' — siempre hay un siguiente nivel.",
    blocks: [
      { phase: "Foundation", duration: "Mes 1–3", title: "Tu Primary Path", desc: "Practica el escenario que más necesitas ahora. 6 niveles, dificultad progresiva, feedback de IA en cada sesión." },
      { phase: "Advanced", duration: "Mes 4–6", title: "Elige tu siguiente ruta", desc: "Al completar tu Primary Path, desbloqueas una nueva ruta. Tú eliges la que sigue según tus metas." },
      { phase: "Mastery", duration: "Mes 7+", title: "Dominio cruzado", desc: "Practica todos los escenarios. Cada ruta completada desbloquea la siguiente. No hay techo." },
    ],
    warRoom: {
      label: "War Room incluido desde el día 1",
      desc: "¿Entrevista mañana pero estás en el path de Cultura? Usa el War Room — acceso inmediato a cualquier escenario, 5 veces por mes.",
    },
  },
  footer: {
    tagline: "El coach de comunicación profesional con IA para líderes latinoamericanos.",
    columns: [
      { title: "Producto", items: ["Cómo funciona", "Funcionalidades", "Precios"] },
      { title: "Empresa", items: ["Sobre nosotros", "Blog", "Contacto"] },
      { title: "Legal", items: ["Privacidad", "Términos", "Cookies", "Transparencia IA"] },
    ],
    copyright: "© 2026 MasteryTalk.pro. Todos los derechos reservados.",
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
      title: "Crea tu cuenta gratuita",
      subtitle: "Solo Google. Sin tarjeta de crédito.",
      google: "Registrarse con Google",
      divider: "Registro seguro en un clic",
      toggle: "¿Ya tienes cuenta?",
      toggleAction: "Inicia sesión",
      trust: "1ª sesión gratis · Sin tarjeta · Sin suscripción",
      termsNotice: "Al registrarte, aceptas los Términos de Servicio y la Política de Privacidad.",
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
    subtitleEmpty: "Completa tu primera práctica para ver tu progreso",
    history: "Historial de sesiones",
    proficiency: {
      title: "Proficiencia en inglés",
      descWithData: "Tu nivel de inglés ha mejorado significativamente",
      descEmpty: "Completa tu primera práctica para medir tu nivel",
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
      descEmpty: "Practica tu primera sesión para ver tus habilidades",
    },
    progress: {
      title: "Progreso",
      descMultiple: "Has completado múltiples sesiones",
      descSingle: "Has completado una sesión",
      descEmpty: "Tu progreso aparecerá aquí después de tu primera práctica",
      emptyOneSessions: "Completa tu primera práctica para ver tu progreso",
      emptyNoSessions: "Completa prácticas para ver tu progreso",
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
      startSession: "Comenzar práctica",
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
    cta: "Experimentar grátis",
  },
  hero: {
    badge: "✶ O programa de comunicação profissional em inglês para nearshoring.",
    headline: "90 dias para se comunicar com autoridade em inglês profissional.",
    subheadline: "Um programa estruturado com IA. Pratique as conversas que importam, receba feedback real e avance nível por nível. Para o profissional que já sabe inglês mas não está no nível que quer.",
  },
  widget: {
    instruction: "Escolha a conversa que você quer vencer.",
    microcopy: "Grátis · Sem cartão · Sem assinatura",
    interviewLabel: "Entrevista de emprego",
    interviewHook: "Conquiste a vaga. Defenda seu valor. Sem hesitar.",
    meetingLabel: "Reuniões remotas",
    meetingHook: "Participe, lidere e feche. Não fique só de presença.",
    presentationLabel: "Apresentações",
    presentationHook: "Que te ouçam, não apenas que te entendam.",
    cardCta: "Começar →",
  },
  howItWorks: {
    sectionTitle: "Três passos. Uma conversa que não te preocupa mais.",
    steps: [
      { title: "Receba seu brief. Entre com estrutura.", desc: "Antes de falar, você recebe o framework, exemplos reais de respostas fracas vs. fortes e seu template de ancoragem. Não improvisa — chega preparado." },
      { title: "Fale. Com alguém que não te perdoa.", desc: "A IA assume o papel que você define — entrevistador, cliente, líder de equipe. Responde como faria na vida real. Te questiona, te pressiona, não valida tudo." },
      { title: "Feedback real. PDF pronto para usar.", desc: "Vai saber onde perdeu fluência, qual pronúncia corrigir e quais frases substituir. Com exemplos de como deveria soar. Baixe e tenha em mãos antes da conversa real." },
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
  differentiators: {
    sectionTitle: "Não é um curso de inglês. É prática conversacional profissional.",
    items: [
      { title: "Aprenda frameworks reais praticando, não estudando.", desc: "Cada sessão inclui um brief com técnicas de comunicação profissional e correções em contexto — não em uma prova. A cada sessão, seu inglês profissional fica mais preciso, mais fluido, mais seu." },
      { title: "Seu contexto, sua conversa.", desc: "Você define o cenário — seu cargo, sua indústria, sua situação. A IA constrói a sessão ao redor disso. Não um roteiro genérico. Sua conversa." },
      { title: "Feedback de fluência e pronúncia — em PDF para baixar.", desc: "Vai saber exatamente onde travou e qual pronúncia corrigir. Com exemplos de como deveria soar. Baixe. Tenha aberto antes da sua próxima conversa real." },
      { title: "O amigo que te daria o melhor feedback nem sempre está disponível.", desc: "MasteryTalk.pro sim. Às 2h da manhã antes da entrevista, uma hora antes da apresentação, ou no domingo antes daquela reunião de segunda. Sem agendar. Sem depender de ninguém." },
    ],
  },
  benefits: {
    sectionTitle: "Para quem usa inglês no trabalho — ou quer usar.",
    yesList: [
      "Tem entrevistas com empresas que pagam em USD",
      "Participa ou lidera reuniões com equipes internacionais",
      "Apresenta projetos a clientes em inglês",
      "Busca trabalho e não quer que sua comunicação tire pontos",
      "Sabe inglês mas em conversas reais não se expressa no nível que é",
    ],
    noList: [
      "Está aprendendo inglês do zero",
      "Busca um curso de gramática ou vocabulário",
      "Não usa nem planeja usar inglês na carreira",
    ],
  },
  beforeAfter: {
    sectionTitle: "Praticar existe. Praticar bem, é outra coisa.",
    withoutTitle: "Prática passiva",
    withoutList: [
      "Pratica no espelho. Ninguém te questiona.",
      "Seu amigo diz \"foi bem\" e pronto",
      "Não sabe onde falhou a fluência nem quais frases soaram fracas",
      "Chega na conversa real sem ter sentido pressão",
    ],
    withTitle: "Com MasteryTalk.pro",
    withList: [
      "O interlocutor te questiona, te pressiona, não te dá respostas fáceis",
      "Sabe o que dizer quando silenciam a sala",
      "Feedback de fluência e pronúncia com exemplos concretos",
      "Entra pensando em vencer, não em sobreviver",
    ],
  },
  sessionTakeaways: {
    sectionTitle: "O que você leva de cada sessão.",
    items: [
      { metric: "Fluência", desc: "Sabe onde travou e como não repetir." },
      { metric: "Pronúncia", desc: "O que corrigir e como deveria soar." },
      { metric: "PDF", desc: "Seu relatório para baixar e ter em mãos." },
    ],
  },
  routes: {
    sectionTitle: "Escolha a rota que precisa agora.",
    subtitle: "Você escolhe seu Primary Path ao assinar. Ao completá-lo, desbloqueia o seguinte — uma rota de cada vez.",
    items: [
      { name: "Entrevista de emprego", hook: "Conquiste a vaga. Defenda seu valor. Sem hesitar." },
      { name: "Reuniões remotas", hook: "Participe, lidere e feche. Não fique só de presença." },
      { name: "Apresentações", hook: "Que te ouçam, não apenas que te entendam." },
    ],
  },
  pricing: {
    sectionTitle: "O Programa",
    headline: "Junte-se ao programa.",
    subtitle: "Os primeiros 25 assinantes se tornam Founding Members — preço bloqueado para sempre em $59 por 3 meses.",
    launchBadge: "⭐ Founding Member",
    slotsLeft: "{{count}} slots Founding Member disponíveis",
    slotsGone: "Founding Member esgotado — preço regular ativo",
    saveBadge: "Economize $18 vs mensal",
    monthly: {
      label: "Acesso mensal",
      period: "/mês",
      features: [
        "Seu Primary Path (6 níveis)",
        "War Room — 5 sessões/mês",
        "WhatsApp SR Coach diário",
        "Lessons Library completa",
        "Cancele quando quiser",
      ],
    },
    quarterly: {
      label: "O Programa",
      period: "/ 3 meses",
      perMonth: "{{price}}/mês equivalente",
      features: [
        "Primary Path + rotas progressivas",
        "War Room — 5 sessões/mês",
        "WhatsApp SR Coach diário",
        "Lessons Library completa",
        "Economize $18 vs pagamento mensal",
      ],
    },
    modal: {
      headline: "Junte-se ao Programa",
      subtitle: "Seu Primary Path desde o dia 1. War Room para urgências. Feedback de IA em cada sessão.",
      cta: "Começar programa",
      ctaProcessing: "Redirecionando para o Stripe...",
      legal: "Pagamento seguro com Stripe · Cancele pela sua conta · Sem custos ocultos",
    },
    demoLine: "Sua primeira sessão de auto-apresentação é completamente grátis — sem cartão, sem compromisso.",
    anchorLine: "Menos que uma hora com um tutor de inglês. Resultados em 90 dias.",
    roiLine: "Se paga com a sua primeira promoção.",
    cancelLine: "Cancele em um clique. Sem App Store, sem surpresas.",
  },
  faq: {
    sectionTitle: "Perguntas Frequentes",
    items: [
      { q: "Isso é diferente do Duolingo ou de um curso de inglês?", a: "Não é um curso de gramática. Você aprende comunicação profissional praticando conversas reais — com frameworks, com correções em contexto. Se já sabe inglês mas em conversas reais não chega ao nível que é, isto é para você." },
      { q: "Tem assinatura ou cobrança mensal?", a: "Sim. O MasteryTalk é um programa de assinatura — mensal ($49/mês) ou trimestral ($129/3 meses). Os primeiros 25 assinantes ficam bloqueados em $59/3 meses para sempre como Founding Members. Não há compras por sessão nem por rota individual." },
      { q: "O que acontece depois de 90 dias?", a: "Seu programa se renova automaticamente para o próximo bloco. Ao completar seu Primary Path você desbloqueia uma nova rota — você escolhe qual. O dashboard mostra 'Dia X de 90' e sempre há um próximo nível a alcançar." },
      { q: "Posso praticar um cenário urgente se tenho uma entrevista amanhã?", a: "Sim. O War Room te dá acesso imediato a qualquer cenário — independentemente de qual path você está. Inclui 5 sessões por mês. É a válvula de urgência do programa: se tem entrevista em 3 dias, use." },
      { q: "A conversa se adapta à minha indústria ou cargo?", a: "Sim. Você define o contexto — seu cargo, sua empresa, a situação. A IA constrói a sessão ao redor disso. Não um cenário genérico. O seu." },
    ],
  },
  finalCta: {
    headline1: "Sua próxima conversa importante",
    headline2: "pode mudar tudo.",
    subline: "Uma sessão de cada vez. Um nível a mais cada vez.",
    button: "Pratique sua primeira conversa grátis",
    badges: ["Sem cartão", "Primeira sessão grátis", "25 slots Founding Member"],
  },
  programa: {
    sectionTitle: "Um programa de 3 meses. Não um app.",
    subtitle: "Cada bloco te leva mais longe. Não há 'terminar' — sempre há um próximo nível.",
    blocks: [
      { phase: "Foundation", duration: "Mês 1–3", title: "Seu Primary Path", desc: "Pratique o cenário que mais precisa agora. 6 níveis, dificuldade progressiva, feedback de IA em cada sessão." },
      { phase: "Advanced", duration: "Mês 4–6", title: "Escolha sua próxima rota", desc: "Ao completar seu Primary Path, você desbloqueia uma nova rota. Você escolhe a que vem a seguir." },
      { phase: "Mastery", duration: "Mês 7+", title: "Domínio cruzado", desc: "Pratique todos os cenários. Cada rota completada desbloqueia a próxima. Não há teto." },
    ],
    warRoom: {
      label: "War Room incluído desde o dia 1",
      desc: "Entrevista amanhã mas está no path de Cultura? Use o War Room — acesso imediato a qualquer cenário, 5 vezes por mês.",
    },
  },
  footer: {
    tagline: "O coach de comunicação profissional com IA para líderes latino-americanos.",
    columns: [
      { title: "Produto", items: ["Como funciona", "Funcionalidades", "Preços"] },
      { title: "Empresa", items: ["Sobre nós", "Blog", "Contato"] },
      { title: "Legal", items: ["Privacidade", "Termos", "Cookies", "Transparência IA"] },
    ],
    copyright: "© 2026 MasteryTalk.pro. Todos os direitos reservados.",
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
      title: "Crie sua conta gratuita",
      subtitle: "Só Google. Sem cartão de crédito.",
      google: "Registrar com Google",
      divider: "Registro seguro em um clique",
      toggle: "Já tem conta?",
      toggleAction: "Entrar",
      trust: "1ª sessão grátis · Sem cartão · Sem assinatura",
      termsNotice: "Ao se registrar, você aceita os Termos de Serviço e a Política de Privacidade.",
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
    subtitleEmpty: "Complete sua primeira prática para ver seu progresso",
    history: "Histórico de sessões",
    proficiency: {
      title: "Proficiência em inglês",
      descWithData: "O seu nível de inglês melhorou significativamente",
      descEmpty: "Complete sua primeira prática para medir seu nível",
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
      descEmpty: "Pratique sua primeira sessão para ver suas habilidades",
    },
    progress: {
      title: "Progresso",
      descMultiple: "Você concluiu várias sessões",
      descSingle: "Você concluiu uma sessão",
      descEmpty: "Seu progresso aparecerá aqui após sua primeira prática",
      emptyOneSessions: "Complete sua primeira prática para ver seu progresso",
      emptyNoSessions: "Complete práticas para ver seu progresso",
    },
    quickStart: {
      title: "Começar rápido",
      salesLabel: "Pitch de vendas",
      salesDesc: "Pratique como apresentar seu produto ou serviço a um cliente potencial",
      interviewLabel: "Entrevista de emprego",
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
      empty: "Sem sessões recentes",
    },
    recommended: {
      title: "Recomendações",
      aiBadge: "AI",
      focusHint: "Foque em",
      defaultHint: "Pratique mais",
      firstHint: "Comece com",
      startSession: "Começar prática",
      descFocus: "Seu {pillar} está em {score}% — vamos fortalecê-lo com uma sessão focada.",
      descPracticed: "Com base nas suas sessões, recomendamos focar em pronúncia e gramática.",
      descNew: "Comece com um cenário popular para profissionais de nearshoring na LATAM.",
      scenarioInterview: "Entrevista de emprego",
      scenarioSales: "Pitch de vendas SaaS B2B",
      scenarioInterviewDesc: "Pratique respostas STAR e fortaleça seu posicionamento profissional em inglês.",
      scenarioSalesDesc: "Pratique um pitch convincente em inglês para o mercado US.",
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
    cta: "Try free",
  },
  hero: {
    badge: "✶ The professional English communication program for nearshoring.",
    headline: "90 days to communicate with authority in professional English.",
    subheadline: "A structured program powered by AI. Practice the conversations that matter, get real feedback, and advance level by level. For the professional who already knows English but isn't at the level they want.",
  },
  widget: {
    instruction: "Choose the conversation you want to win.",
    microcopy: "Free · No credit card · No subscription",
    interviewLabel: "Job Interview",
    interviewHook: "Get the job. Defend your value. No hesitation.",
    meetingLabel: "Remote Meetings",
    meetingHook: "Participate, lead, and close. Don't just show up.",
    presentationLabel: "Presentations",
    presentationHook: "Be heard, not just understood.",
    cardCta: "Start →",
  },
  howItWorks: {
    sectionTitle: "Three steps. One conversation you no longer dread.",
    steps: [
      { title: "Get your brief. Walk in with structure.", desc: "Before you speak, you get the framework, real examples of weak vs. strong answers, and your anchoring template. No improvising — you arrive prepared." },
      { title: "Speak. With someone who won't go easy.", desc: "The AI takes on the role you define — interviewer, client, team lead. It responds like it would in real life. It challenges you, pushes back, doesn't validate everything." },
      { title: "Real feedback. PDF ready to use.", desc: "You'll know where you lost fluency, what pronunciation to fix, and which phrases to replace. With examples of how it should sound. Download it and keep it handy before the real conversation." },
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
  differentiators: {
    sectionTitle: "It's not an English course. It's professional conversational practice.",
    items: [
      { title: "Learn real frameworks by practicing, not studying.", desc: "Every session includes a brief with professional communication techniques and corrections in context — not on an exam. With each session, your professional English gets sharper, more fluent, more yours." },
      { title: "Your context, your conversation.", desc: "You define the scenario — your role, your industry, your situation. The AI builds the session around that. Not a generic script. Your conversation." },
      { title: "Fluency and pronunciation feedback — in a downloadable PDF.", desc: "You'll know exactly where you stumbled and what pronunciation to fix. With examples of how it should sound. Download it. Have it open before your next real conversation." },
      { title: "The friend who'd give you the best feedback isn't always available.", desc: "MasteryTalk.pro is. At 2am before your interview, an hour before your presentation, or Sunday night before Monday's meeting. No scheduling. No depending on anyone." },
    ],
  },
  benefits: {
    sectionTitle: "For those who use English at work — or want to.",
    yesList: [
      "You have interviews with companies that pay in USD",
      "You participate in or lead meetings with international teams",
      "You present projects to clients in English",
      "You're job hunting and don't want communication holding you back",
      "You know English but in real conversations you don't express yourself at your level",
    ],
    noList: [
      "You're learning English from scratch",
      "You're looking for a grammar or vocabulary course",
      "You don't use and don't plan to use English in your career",
    ],
  },
  beforeAfter: {
    sectionTitle: "Practicing exists. Practicing well is something else.",
    withoutTitle: "Passive practice",
    withoutList: [
      "You practice in the mirror. Nobody challenges you.",
      "Your friend says \"it was fine\" and that's it",
      "You don't know where fluency failed or which phrases sounded weak",
      "You walk into the real conversation without having felt pressure",
    ],
    withTitle: "With MasteryTalk.pro",
    withList: [
      "The counterpart challenges you, pushes back, doesn't give easy answers",
      "You know what to say when the room goes silent",
      "Fluency and pronunciation feedback with concrete examples",
      "You walk in thinking about winning, not surviving",
    ],
  },
  sessionTakeaways: {
    sectionTitle: "What you take from every session.",
    items: [
      { metric: "Fluency", desc: "Know where you stumbled and how to not do it again." },
      { metric: "Pronunciation", desc: "What to fix and how it should sound." },
      { metric: "PDF", desc: "Your downloadable report to study or keep handy." },
    ],
  },
  routes: {
    sectionTitle: "Choose the path you need right now.",
    subtitle: "You choose your Primary Path when you subscribe. Complete it, unlock the next — one path at a time.",
    items: [
      { name: "Job Interview", hook: "Get the job. Defend your value. No hesitation." },
      { name: "Remote Meetings", hook: "Participate, lead, and close. Don't just show up." },
      { name: "Presentations", hook: "Be heard, not just understood." },
    ],
  },
  pricing: {
    sectionTitle: "The Program",
    headline: "Join the program.",
    subtitle: "The first 25 subscribers become Founding Members — price locked forever at $59 per 3 months.",
    launchBadge: "⭐ Founding Member",
    slotsLeft: "{{count}} Founding Member slots left",
    slotsGone: "Founding Member slots exhausted — regular pricing active",
    saveBadge: "Save $18 vs monthly",
    monthly: {
      label: "Monthly access",
      period: "/month",
      features: [
        "Your Primary Path (6 levels)",
        "War Room — 5 sessions/month",
        "Daily WhatsApp SR Coach",
        "Full Lessons Library",
        "Cancel anytime",
      ],
    },
    quarterly: {
      label: "The Program",
      period: "/ 3 months",
      perMonth: "{{price}}/mo equivalent",
      features: [
        "Primary Path + progressive paths",
        "War Room — 5 sessions/month",
        "Daily WhatsApp SR Coach",
        "Full Lessons Library",
        "Save $18 vs monthly billing",
      ],
    },
    modal: {
      headline: "Join the Program",
      subtitle: "Your Primary Path from day 1. War Room for urgent needs. AI feedback on every session.",
      cta: "Start program",
      ctaProcessing: "Redirecting to Stripe...",
      legal: "Secure payment with Stripe · Cancel anytime from your account · No hidden fees",
    },
    demoLine: "Your first self-introduction session is completely free — no credit card, no commitment.",
    anchorLine: "Less than one hour with an English tutor. Results in 90 days.",
    roiLine: "Pays for itself with your first raise.",
    cancelLine: "Cancel in one click. No App Store, no surprises.",
  },
  faq: {
    sectionTitle: "Frequently Asked Questions",
    items: [
      { q: "Is this different from Duolingo or an English course?", a: "It's not a grammar course. You learn professional communication by practicing real conversations — with frameworks, corrections in context. If you already know English but in real conversations you don't reach your level, this is for you." },
      { q: "Is there a subscription or monthly charge?", a: "Yes. MasteryTalk is a subscription program — monthly ($49/mo) or quarterly ($129/3 months). The first 25 subscribers are locked in at $59/3 months forever as Founding Members. There are no per-session or per-path purchases." },
      { q: "What happens after 90 days?", a: "Your program renews automatically into the next block. Once you complete your Primary Path you unlock a new one — you choose which. The dashboard shows 'Day X of 90' and there's always a next level to reach." },
      { q: "Can I practice an urgent scenario if I have an interview tomorrow?", a: "Yes. The War Room gives you immediate access to any scenario — regardless of which path you're on. Includes 5 sessions per month. It's the urgency valve of the program: interview in 3 days? Use it." },
      { q: "Does the conversation adapt to my industry or role?", a: "Yes. You define the context — your role, your company, the situation. The AI builds the session around that. Not a generic scenario. Yours." },
    ],
  },
  finalCta: {
    headline1: "Your next important conversation",
    headline2: "could change everything.",
    subline: "One session at a time. One level up each time.",
    button: "Practice your first conversation free",
    badges: ["No credit card", "First session free", "25 Founding Member slots"],
  },
  programa: {
    sectionTitle: "A 3-month program. Not an app.",
    subtitle: "Each block takes you further. There's no 'finishing' — there's always a next level.",
    blocks: [
      { phase: "Foundation", duration: "Month 1–3", title: "Your Primary Path", desc: "Practice the scenario you need most right now. 6 levels, progressive difficulty, AI feedback on every session." },
      { phase: "Advanced", duration: "Month 4–6", title: "Choose your next path", desc: "Once you complete your Primary Path, you unlock a new one. You choose what comes next based on your goals." },
      { phase: "Mastery", duration: "Month 7+", title: "Cross-path mastery", desc: "Practice all scenarios. Every completed path unlocks the next. No ceiling." },
    ],
    warRoom: {
      label: "War Room included from day 1",
      desc: "Interview tomorrow but you're on the Culture path? Use War Room — immediate access to any scenario, 5 times a month.",
    },
  },
  footer: {
    tagline: "The AI-powered professional communication coach for ambitious leaders.",
    columns: [
      { title: "Product", items: ["How It Works", "Features", "Pricing"] },
      { title: "Company", items: ["About Us", "Blog", "Contact"] },
      { title: "Legal", items: ["Privacy", "Terms", "Cookies", "AI Transparency"] },
    ],
    copyright: "© 2026 MasteryTalk.pro. All rights reserved.",
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
      title: "Create your free account",
      subtitle: "Google only. No credit card.",
      google: "Sign up with Google",
      divider: "Secure one-click registration",
      toggle: "Already have an account?",
      toggleAction: "Sign in",
      trust: "1st session free · No credit card · No subscription",
      termsNotice: "By signing up, you agree to our Terms of Service and Privacy Policy.",
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
    subtitleEmpty: "Complete your first practice to see your progress",
    history: "Session history",
    proficiency: {
      title: "English proficiency",
      descWithData: "Your English level has improved significantly",
      descEmpty: "Complete your first practice to measure your level",
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
      descEmpty: "Practice your first session to see your skills",
    },
    progress: {
      title: "Progress",
      descMultiple: "You've completed multiple sessions",
      descSingle: "You've completed one session",
      descEmpty: "Your progress will appear here after your first practice",
      emptyOneSessions: "Complete your first practice to see your progress",
      emptyNoSessions: "Complete practices to see your progress",
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
      descFocus: "Your {pillar} is at {score}% — let's strengthen it with a focused session.",
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