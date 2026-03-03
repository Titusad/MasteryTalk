/**
 * ══════════════════════════════════════════════════════════════
 *  Landing Page i18n — ES (Spanish) and PT (Portuguese)
 *  All pre-login UI copy lives here for easy maintenance.
 * ══════════════════════════════════════════════════════════════
 */

export type LandingLang = "es" | "pt";

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
      whoLabel: string;
      pills: string[];
      objectiveLabel: string;
      objectives: string[];
      contextLabel: string;
      contextBody: string;
      contextHint: string;
      aiHint: string;
      cta: string;
      tabWrite: string;
      tabUrl: string;
    };
    script: {
      title: string;
      subtitle: string;
      pillar1: string;
      pillar1Body: string;
      pillar2: string;
      pillar2Body: string;
      tipsTitle: string;
      tips: string[];
      cta: string;
    };
    chat: {
      role: string;
      live: string;
    };
    feedback: {
      subline: string;
      keyCorrection: string;
      reportAvailable: string;
      viewReport: string;
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
      linkedin: string;
      divider: string;
      toggle: string;
      toggleAction: string;
    };
    register: {
      title: string;
      subtitle: string;
      google: string;
      linkedin: string;
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
    stepLabels: [string, string, string];
    titles: { interlocutor: string; context: string; ready: string };
    subtitles: { interlocutor: string; context: string; ready: string };
    interlocutors: { client: string; clientSub: string; manager: string; managerSub: string; recruiter: string; recruiterSub: string; peer: string; peerSub: string };
    autoSelected: string;
    next: string;
    back: string;
    contextReady: string;
    contextNeeded: string;
    previewTitle: string;
    previewBody: string;
    previewBlurred: string;
    continueGoogle: string;
    continueLinkedin: string;
    trustLine: string;
    scenarioLabels: { sales: string; interview: string };
    guidedFields: {
      interview: { role: string; rolePlaceholder: string; strength: string; strengthPlaceholder: string };
      sales: { product: string; productPlaceholder: string; problem: string; problemPlaceholder: string };
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
      { title: "Arma tu estrategia", desc: "Elige escenario, define contexto, construye tus pilares de valor profesional." },
      { title: "Recibe tu guión", desc: "La IA genera tu guión personalizado + tips clave antes de la práctica." },
      { title: "Practica la conversación", desc: "Simula tu conversación con IA que asume un rol realista." },
      { title: "Recibe feedback accionable", desc: "Análisis en 3 dimensiones + informe de sesión completo y puntos de mejora." },
    ],
  },
  screens: {
    setup: {
      whoLabel: "¿Con quién vas a hablar?",
      pills: ["👤 Cliente potencial", "🎯 Reclutador", "📊 Tu jefe", "💼 Inversionista", "🤝 Partner"],
      objectiveLabel: "Objetivo de la conversación",
      objectives: ["Vender un servicio", "Negociar términos", "Presentar resultados"],
      contextLabel: "Contexto de la conversación",
      contextBody: "Tengo una llamada con un cliente de EE.UU. para presentar nuestra propuesta de servicios de desarrollo. Es el CTO de una startup Series A. Necesito explicar nuestro approach técnico, timelines y pricing model. El cliente ya evaluó otras agencias, así que debo diferenciarnos.",
      contextHint: "238 caracteres · Se recomienda mínimo 100",
      aiHint: "La IA usará este contexto para simular un interlocutor realista",
      cta: "Comenzar práctica",
      tabWrite: "Escribir",
      tabUrl: "Pegar URL",
    },
    script: {
      title: "Tu guión personalizado",
      subtitle: "Generado por IA con base en tu contexto",
      pillar1: "Pilar 1: Diferenciación técnica",
      pillar1Body: "Enfatiza tu experiencia en plataformas SaaS escalables y tu stack tecnológico moderno — esto te diferencia de agencias genéricas.",
      pillar2: "Pilar 2: Proof points",
      pillar2Body: "Usa datos concretos: 50+ proyectos enterprise, 98% de retención de clientes, y casos de éxito con startups Series A similares.",
      tipsTitle: "Tips clave",
      tips: [
        "Abre con una pregunta sobre sus pain points antes de presentar.",
        "Usa 'we delivered' en vez de 'we can do' — habla en pasado.",
        "Prepara una respuesta para la objeción de zona horaria.",
      ],
      cta: "Comenzar práctica",
    },
    chat: {
      role: "Cliente potencial · Startup Series A",
      live: "En vivo",
    },
    feedback: {
      subline: "3 dimensiones analizadas",
      keyCorrection: "Corrección clave",
      reportAvailable: "Informe completo disponible",
      viewReport: "Ver informe",
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
      "Estás aprendiendo inglés desde cero",
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
      "Ya lo practicaste 10 veces",
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
      features: ["Simulación completa con IA", "Feedback + Guión personalizado", "Informe de sesión detallado", "Sin tarjeta de crédito"],
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
      linkedin: "Continuar con LinkedIn",
      divider: "Usa la misma cuenta con la que te registraste",
      toggle: "¿No tienes cuenta?",
      toggleAction: "Regístrate",
    },
    register: {
      title: "Crea tu cuenta",
      subtitle: "Comienza tu entrenamiento profesional en inglés",
      google: "Registrarse con Google",
      linkedin: "Registrarse con LinkedIn",
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
    stepLabels: ["Interlocutor", "Contexto", "Listo"],
    titles: { interlocutor: "Configura tu práctica", context: "Agrega contexto", ready: "¡Todo Listo!" },
    subtitles: { interlocutor: "Elige con quién vas a practicar", context: "Describe la situación para una simulación más realista", ready: "Inicia sesión para finalizar tu práctica" },
    interlocutors: {
      client: "Cliente", clientSub: "VP / Tomador de decisiones",
      manager: "Manager", managerSub: "Director / VP",
      recruiter: "Reclutador", recruiterSub: "Gerente de contratación",
      peer: "Colega", peerSub: "Contacto de industria",
    },
    autoSelected: "Auto-seleccionado por tu escenario — puedes cambiarlo",
    next: "Siguiente",
    back: "Atrás",
    contextReady: "Tu contexto está listo — avanza al último paso",
    contextNeeded: "Completa al menos un campo de contexto para continuar",
    previewTitle: "PREVIEW DE TU ESTRATEGIA",
    previewBody: "Basándome en tu contexto, prepararé una estrategia con 3 pilares de valor personalizados, un guión de conversación, y una simulación con IA adaptada a tu",
    previewBlurred: "Incluyendo power phrases para nearshoring, manejo de objeciones culturales...",
    continueGoogle: "Continuar con Google",
    continueLinkedin: "Continuar con LinkedIn",
    trustLine: "1ª sesión gratis · Sin tarjeta · Sin suscripción",
    scenarioLabels: { sales: "ventas", interview: "entrevista" },
    guidedFields: {
      interview: { role: "Puesto al que aplicas", rolePlaceholder: "Ej: Senior Product Manager en fintech", strength: "Tu fortaleza más relevante", strengthPlaceholder: "Ej: 5 años liderando equipos de producto en LATAM" },
      sales: { product: "¿Qué producto o servicio presentas?", productPlaceholder: "Ej: Plataforma de marketing automation B2B", problem: "¿Qué problema resuelve para tu cliente?", problemPlaceholder: "Ej: Reduce el tiempo de onboarding de leads en un 40%" },
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
      { title: "Monte sua estratégia", desc: "Escolha cenário, defina contexto, construa seus pilares de valor profissional." },
      { title: "Receba seu roteiro", desc: "A IA gera seu roteiro personalizado + dicas-chave antes da prática." },
      { title: "Pratique a conversa", desc: "Simule sua conversa com IA que assume um papel realista." },
      { title: "Receba feedback acionável", desc: "Análise em 3 dimensões + relatório de sessão completo e pontos de melhoria." },
    ],
  },
  screens: {
    setup: {
      whoLabel: "Com quem você vai falar?",
      pills: ["👤 Cliente potencial", "🎯 Recrutador", "📊 Seu chefe", "💼 Investidor", "🤝 Parceiro"],
      objectiveLabel: "Objetivo da conversa",
      objectives: ["Vender um serviço", "Negociar termos", "Apresentar resultados"],
      contextLabel: "Contexto da conversa",
      contextBody: "Tenho uma call com um cliente dos EUA para apresentar nossa proposta de serviços de desenvolvimento. É o CTO de uma startup Series A. Preciso explicar nossa abordagem técnica, timelines e pricing model. O cliente já avaliou outras agências, então preciso nos diferenciar.",
      contextHint: "238 caracteres · Recomendado mínimo 100",
      aiHint: "A IA usará este contexto para simular um interlocutor realista",
      cta: "Começar prática",
      tabWrite: "Escrever",
      tabUrl: "Colar URL",
    },
    script: {
      title: "Seu roteiro personalizado",
      subtitle: "Gerado por IA com base no seu contexto",
      pillar1: "Pilar 1: Diferenciação técnica",
      pillar1Body: "Enfatize sua experiência em plataformas SaaS escaláveis e seu stack tecnológico moderno — isso te diferencia de agências genéricas.",
      pillar2: "Pilar 2: Proof points",
      pillar2Body: "Use dados concretos: 50+ projetos enterprise, 98% de retenção de clientes, e cases de sucesso com startups Series A similares.",
      tipsTitle: "Dicas-chave",
      tips: [
        "Abra com uma pergunta sobre os pain points antes de apresentar.",
        "Use 'we delivered' em vez de 'we can do' — fale no passado.",
        "Prepare uma resposta para a objeção de fuso horário.",
      ],
      cta: "Começar prática",
    },
    chat: {
      role: "Cliente potencial · Startup Series A",
      live: "Ao vivo",
    },
    feedback: {
      subline: "3 dimensões analisadas",
      keyCorrection: "Correção-chave",
      reportAvailable: "Relatório completo disponível",
      viewReport: "Ver relatório",
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
      "Está aprendendo inglês do zero",
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
      features: ["Simulação completa com IA", "Feedback + Roteiro personalizado", "Relatório detalhado da sessão", "Sem cartão de crédito"],
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
      linkedin: "Continuar com LinkedIn",
      divider: "Use a mesma conta com a qual se registrou",
      toggle: "Não tem conta?",
      toggleAction: "Registre-se",
    },
    register: {
      title: "Crie sua conta",
      subtitle: "Comece seu treinamento profissional em inglês",
      google: "Registrar com Google",
      linkedin: "Registrar com LinkedIn",
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
    stepLabels: ["Interlocutor", "Contexto", "Pronto"],
    titles: { interlocutor: "Configure sua prática", context: "Adicione contexto", ready: "Tudo Pronto!" },
    subtitles: { interlocutor: "Escolha com quem você vai praticar", context: "Descreva a situação para uma simulação mais realista", ready: "Entre para finalizar sua prática" },
    interlocutors: {
      client: "Cliente", clientSub: "VP / Tomador de decisão",
      manager: "Gerente", managerSub: "Diretor / VP",
      recruiter: "Recrutador", recruiterSub: "Gerente de contratação",
      peer: "Colega", peerSub: "Contato da indústria",
    },
    autoSelected: "Auto-selecionado pelo seu cenário — pode alterar",
    next: "Próximo",
    back: "Voltar",
    contextReady: "Seu contexto está pronto — avance para o último passo",
    contextNeeded: "Complete pelo menos um campo de contexto para continuar",
    previewTitle: "PREVIEW DA SUA ESTRATÉGIA",
    previewBody: "Com base no seu contexto, prepararei uma estratégia com 3 pilares de valor personalizados, um roteiro de conversa e uma simulação com IA adaptada ao seu",
    previewBlurred: "Incluindo power phrases para nearshoring, manejo de objeções culturais...",
    continueGoogle: "Continuar com Google",
    continueLinkedin: "Continuar com LinkedIn",
    trustLine: "1ª sessão grátis · Sem cartão · Sem assinatura",
    scenarioLabels: { sales: "vendas", interview: "entrevista" },
    guidedFields: {
      interview: { role: "Cargo para o qual se candidata", rolePlaceholder: "Ex: Senior Product Manager em fintech", strength: "Sua principal fortaleza", strengthPlaceholder: "Ex: 5 anos liderando equipes de produto na América Latina" },
      sales: { product: "Qual produto ou serviço você apresenta?", productPlaceholder: "Ex: Plataforma de marketing automation B2B", problem: "Que problema resolve para seu cliente?", problemPlaceholder: "Ex: Reduz o tempo de onboarding de leads em 40%" },
    },
  },
};

export const LANDING_COPIES: Record<LandingLang, LandingCopy> = { es: ES, pt: PT };