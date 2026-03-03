/**
 * Mock feedback data — scenario-specific strengths and opportunities
 */
import type { Strength, Opportunity, ScenarioType } from "../../../types";

const STRENGTHS_BY_SCENARIO: Record<string, Strength[]> = {
  sales: [
    {
      title: "Apertura clara y directa",
      desc: "Comenzaste con el beneficio principal sin rodeos. Esto capturo la atencion inmediatamente.",
    },
    {
      title: "Manejo de objeciones",
      desc: "Cuando preguntaron sobre adopcion, no te pusiste a la defensiva. Reposicionaste con el programa de champions.",
    },
    {
      title: "Confianza vocal",
      desc: "Tu ritmo fue pausado y tu volumen constante. Esto proyecta autoridad y preparacion.",
    },
  ],
  interview: [
    {
      title: "Estructura STAR solida",
      desc: "Tus respuestas siguieron un arco claro: situacion, accion y resultado con numeros especificos.",
    },
    {
      title: "Conexion genuina con el rol",
      desc: "Al explicar tu motivacion, fuiste especifico sobre lo que te atrae — no generico.",
    },
    {
      title: "Preguntas estrategicas",
      desc: "Cerraste con preguntas que demuestran pensamiento de liderazgo, no logistica.",
    },
  ],
  csuite: [
    {
      title: "Conclusion primero",
      desc: "Abriste con la recomendacion antes de la evidencia. Esto respeta el tiempo del ejecutivo.",
    },
    {
      title: "Manejo de riesgo proactivo",
      desc: "Anticipaste la objecion del pipeline gap antes de que te la hicieran. Eso genera confianza.",
    },
    {
      title: "Pedido claro de decision",
      desc: "Cerraste con un ask especifico — piloto, monto, timeline. Sin ambiguedad.",
    },
  ],
  negotiation: [
    {
      title: "Anclaje con valor, no precio",
      desc: "En vez de bajar el precio, propusiste mas valor. Eso redefine la conversacion.",
    },
    {
      title: "Concesion condicional",
      desc: "Cada concesion vino atada a un compromiso del otro lado. Trading, no giving.",
    },
    {
      title: "Tono firme pero colaborativo",
      desc: "Mantuviste firmeza sin ser confrontacional. Eso es negociacion ejecutiva.",
    },
  ],
  networking: [
    {
      title: "Propuesta de valor memorable",
      desc: "Tu pitch de 15 segundos fue claro y genero la pregunta de follow-up perfecta.",
    },
    {
      title: "Curiosidad genuina",
      desc: "Preguntaste sobre su trabajo antes de hablar del tuyo. Eso crea rapport natural.",
    },
    {
      title: "Follow-up concreto",
      desc: "Cerraste con dia especifico y recurso especifico. Eso es 10x mas probable que 'stay in touch'.",
    },
  ],
};

const OPPORTUNITIES_BY_SCENARIO: Record<string, Opportunity[]> = {
  sales: [
    {
      title: "Estructura la objecion con frameworks",
      tag: "Alto impacto",
      desc: "Al responder dudas sobre implementacion, podrias usar: 'Great question. Let me break this into three parts: timeline, resources, and support.' Esto da control y claridad.",
    },
    {
      title: "Cierra cada seccion con un micro-compromiso",
      desc: "Despues de explicar un beneficio, pregunta: 'Does this align with what you're looking for?' Mantiene al cliente comprometido.",
    },
  ],
  interview: [
    {
      title: "Cuantifica cada logro",
      tag: "Alto impacto",
      desc: "Cuando mencionas 'mejoramos resultados', agrega: 'We improved retention by 30%, which translated to $1.2M in annual savings.' Los numeros te hacen memorable.",
    },
    {
      title: "Proyectate en el rol",
      desc: "Ademas de hablar de lo que hiciste, describe que harias en los primeros 90 dias. Eso ayuda al entrevistador a verte en el puesto.",
    },
  ],
  csuite: [
    {
      title: "Usa la Regla de Tres",
      tag: "Alto impacto",
      desc: "Presenta tres datos de soporte, tres opciones, o tres prioridades. Tres es el numero magico para retencion ejecutiva.",
    },
    {
      title: "Anticipa la segunda pregunta",
      desc: "Despues de tu recomendacion, prepara la respuesta a '¿Y si no funciona?'. La confianza viene de tener el plan B listo.",
    },
  ],
  negotiation: [
    {
      title: "Usa silencios estrategicos",
      tag: "Alto impacto",
      desc: "Despues de hacer tu oferta, para. Cuenta hasta 5 en tu cabeza. El silencio crea presion positiva sin ser agresivo.",
    },
    {
      title: "Ancla con datos externos",
      desc: "Antes de tu numero, cita un benchmark: 'Based on Gartner data for this category...' Los datos externos son mas creibles que tu opinion.",
    },
  ],
  networking: [
    {
      title: "Tiene un 'gift' preparado",
      tag: "Alto impacto",
      desc: "Ofrece algo de valor antes de pedir algo: un articulo, una intro, un insight. 'I recently read a report on LATAM SaaS that I think you'd find relevant...'",
    },
    {
      title: "Haz preguntas sobre proyectos, no titulos",
      desc: "En vez de '¿A que te dedicas?', pregunta 'What's the most interesting challenge you're working on?' Genera conversaciones reales.",
    },
  ],
};

/* ─── Accessors ─── */

export function getStrengthsForScenario(scenarioType?: ScenarioType | string | null): Strength[] {
  if (scenarioType && STRENGTHS_BY_SCENARIO[scenarioType]) {
    return STRENGTHS_BY_SCENARIO[scenarioType];
  }
  return STRENGTHS_BY_SCENARIO.sales;
}

export function getOpportunitiesForScenario(scenarioType?: ScenarioType | string | null): Opportunity[] {
  if (scenarioType && OPPORTUNITIES_BY_SCENARIO[scenarioType]) {
    return OPPORTUNITIES_BY_SCENARIO[scenarioType];
  }
  return OPPORTUNITIES_BY_SCENARIO.sales;
}

/** Legacy exports */
export const MOCK_STRENGTHS: Strength[] = STRENGTHS_BY_SCENARIO.sales;
export const MOCK_OPPORTUNITIES: Opportunity[] = OPPORTUNITIES_BY_SCENARIO.sales;
