/**
 * Mock results summary data — Pronunciation Coach
 *
 * Scenario-specific pronunciation notes and improvement areas,
 * aligned with shadowing-by-scenario.ts phrases.
 */
import type { PronunciationNote, ImprovementArea, ScenarioType } from "../../../types";

/* ─── Sentiments ─── */

const SENTIMENTS: Record<string, string> = {
  sales: "Mejora constante en autoridad vocal. Tu fluidez mejoro notablemente del primer al ultimo intento.",
  interview: "Buena progresion en claridad. Tu tono proyecta cada vez mas confianza y preparacion.",
  csuite: "Excelente evolucion en presencia ejecutiva. Tu ritmo y entonacion reflejan dominio del tema.",
  negotiation: "Mejora solida en firmeza vocal. Tu pronunciacion transmite seguridad en cada posicion.",
  networking: "Gran progreso en naturalidad. Tu ritmo conversacional se siente autentico y memorable.",
};

/* ─── Pronunciation Notes ─── */

const PRONUNCIATION_NOTES_BY_SCENARIO: Record<string, PronunciationNote[]> = {
  sales: [
    {
      word: "evaluating",
      phonetic: "/ɪˈvæljueɪtɪŋ/",
      tip: "Enfatiza la segunda silaba: e-VAL-u-ating. Cuando la primera silaba roba el peso, suena inseguro. Piensa: 'e-VAL' como 'valor'.",
      category: "Claridad",
    },
    {
      word: "differentiator",
      phonetic: "/ˌdɪfəˈrenʃieɪtər/",
      tip: "Cuatro silabas claras: dif-fer-EN-shi-ator. La tercera silaba lleva el enfasis. Baja la voz al final para proyectar certeza, no pregunta.",
      category: "Entonación",
    },
    {
      word: "specifically",
      phonetic: "/spəˈsɪfɪkli/",
      tip: "Haz una micro-pausa despues de esta palabra para darle peso estrategico. No la corras — dale espacio y tu audiencia la recuerda.",
      category: "Ritmo",
    },
  ],
  interview: [
    {
      word: "cross-functional",
      phonetic: "/krɔːs ˈfʌŋkʃənəl/",
      tip: "Enfatiza la primera silaba de 'functional': FUNC-tional. Es una palabra clave en entrevistas de liderazgo — pronunciala con autoridad.",
      category: "Claridad",
    },
    {
      word: "prioritize",
      phonetic: "/praɪˈɒrɪtaɪz/",
      tip: "Cuatro silabas claras: pry-OR-i-tize. La segunda silaba lleva el enfasis principal. No digas 'pri-o-ri-TIZE' — suena como traduccion directa.",
      category: "Entonación",
    },
    {
      word: "specifically",
      phonetic: "/spəˈsɪfɪkli/",
      tip: "Pausa ligeramente despues de 'specifically' para dar peso a lo que sigue. En una entrevista, la especificidad es tu arma.",
      category: "Ritmo",
    },
  ],
  csuite: [
    {
      word: "recommendation",
      phonetic: "/ˌrekəmenˈdeɪʃən/",
      tip: "Cinco silabas: rec-o-men-DAY-tion. Pronunciala con autoridad — es tu palabra de poder ante el C-Suite. No la apresures.",
      category: "Claridad",
    },
    {
      word: "scenarios",
      phonetic: "/sɪˈnɛərioʊz/",
      tip: "Tres silabas: si-NAIR-ee-ohs. No digas 'es-cenarios' — suena como traduccion directa del espanol.",
      category: "Entonación",
    },
    {
      word: "approximately",
      phonetic: "/əˈprɒksɪmətli/",
      tip: "Cuatro silabas: a-PROX-i-mate-ly. Usala antes de numeros para sonar preciso pero no rigido. La pausa despues refuerza el dato.",
      category: "Ritmo",
    },
  ],
  negotiation: [
    {
      word: "between",
      phonetic: "/bɪˈtwiːn/",
      tip: "Enfatiza ligeramente 'between' cuando presentas un rango — ancla ambos extremos con confianza. No lo digas rapido.",
      category: "Claridad",
    },
    {
      word: "flexible",
      phonetic: "/ˈfleksəbəl/",
      tip: "FLEX-i-ble. Pronunciala con calma — la flexibilidad se demuestra con tono relajado, no con prisa.",
      category: "Entonación",
    },
    {
      word: "transparent",
      phonetic: "/trænsˈpærənt/",
      tip: "trans-PAR-ent. La honestidad estrategica requiere pronunciacion clara y directa. Manten el volumen hasta el final.",
      category: "Ritmo",
    },
  ],
  networking: [
    {
      word: "communication",
      phonetic: "/kəˌmjuːnɪˈkeɪʃən/",
      tip: "Cinco silabas: co-myu-ni-KAY-shun. La cuarta silaba lleva el enfasis. Es tu palabra de marca — dale peso.",
      category: "Claridad",
    },
    {
      word: "collaborate",
      phonetic: "/kəˈlæbəreɪt/",
      tip: "co-LAB-o-rate. La segunda silaba lleva el enfasis. Suena mas profesional que 'work together'.",
      category: "Entonación",
    },
    {
      word: "follow up",
      phonetic: "/ˈfɒloʊ ʌp/",
      tip: "FOL-low up. Dos palabras separadas, enfasis en FOL. El follow-up concreto es lo que convierte un contacto en una conexion.",
      category: "Ritmo",
    },
  ],
};

/* ─── Improvement Areas ─── */

const IMPROVEMENT_AREAS_BY_SCENARIO: Record<string, ImprovementArea[]> = {
  sales: [
    {
      category: "Claridad",
      description: "Las palabras de 4+ silabas ('evaluating', 'differentiator') pierden definicion bajo presion. Enfocate en separar silabas de palabras tecnicas.",
    },
    {
      category: "Ritmo",
      description: "Tiendes a acelerar entre frases, especialmente al conectar argumentos de venta. Inserta una pausa despues de cada dato clave.",
    },
    {
      category: "Entonación",
      description: "Tu volumen baja al final de las frases de cierre. Manten el aire para proyectar firmeza cuando pides accion.",
    },
  ],
  interview: [
    {
      category: "Claridad",
      description: "Palabras como 'cross-functional' y 'prioritize' son clave en entrevistas. Practica separar sus silabas para sonar preparado.",
    },
    {
      category: "Ritmo",
      description: "Las respuestas STAR necesitan pausas entre Situacion, Accion y Resultado. Dale a tu entrevistador tiempo de procesar cada parte.",
    },
    {
      category: "Entonación",
      description: "Tu entonacion sube al final de afirmaciones, haciendolas sonar como preguntas. Baja el tono al cerrar cada punto.",
    },
  ],
  csuite: [
    {
      category: "Claridad",
      description: "'Recommendation' y 'approximately' son palabras de poder ante ejecutivos. Pronuncialas con precision para proyectar dominio.",
    },
    {
      category: "Ritmo",
      description: "Los ejecutivos procesan rapido pero necesitan pausas estrategicas. Una pausa de 1 segundo despues de tu cifra clave la hace memorable.",
    },
    {
      category: "Entonación",
      description: "Tu 'ask' final necesita entonacion descendente firme. Un pedido que sube al final suena como permiso, no como decision.",
    },
  ],
  negotiation: [
    {
      category: "Claridad",
      description: "En negociacion, cada palabra tiene peso legal. 'Between', 'flexible' y 'transparent' deben ser cristalinas para no crear ambiguedad.",
    },
    {
      category: "Ritmo",
      description: "El silencio estrategico es tu herramienta mas poderosa. Practica pausar 2 segundos despues de cada oferta o contrapropuesta.",
    },
    {
      category: "Entonación",
      description: "Manten el volumen constante al establecer limites. Un tono que baja transmite inseguridad en tu posicion.",
    },
  ],
  networking: [
    {
      category: "Claridad",
      description: "'Communication' es tu palabra de marca — si no suena clara, tu propuesta de valor se diluye. Practica con enfasis en KAY.",
    },
    {
      category: "Ritmo",
      description: "En networking, el ritmo natural importa mas que la precision. Practica sonar conversacional, no como presentacion formal.",
    },
    {
      category: "Entonación",
      description: "Tu propuesta de follow-up necesita energia ascendente — debe sonar como invitacion entusiasta, no como obligacion.",
    },
  ],
};

/* ─── Accessors ─── */

export function getResultsSentiment(scenarioType?: ScenarioType | string | null): string {
  if (scenarioType && SENTIMENTS[scenarioType]) return SENTIMENTS[scenarioType];
  return SENTIMENTS.sales;
}

export function getPronunciationNotes(scenarioType?: ScenarioType | string | null): PronunciationNote[] {
  if (scenarioType && PRONUNCIATION_NOTES_BY_SCENARIO[scenarioType]) {
    return PRONUNCIATION_NOTES_BY_SCENARIO[scenarioType];
  }
  return PRONUNCIATION_NOTES_BY_SCENARIO.sales;
}

export function getImprovementAreas(scenarioType?: ScenarioType | string | null): ImprovementArea[] {
  if (scenarioType && IMPROVEMENT_AREAS_BY_SCENARIO[scenarioType]) {
    return IMPROVEMENT_AREAS_BY_SCENARIO[scenarioType];
  }
  return IMPROVEMENT_AREAS_BY_SCENARIO.sales;
}

/** Legacy exports for backward compatibility */
export const MOCK_OVERALL_SENTIMENT = SENTIMENTS.sales;
export const MOCK_PRONUNCIATION_NOTES = PRONUNCIATION_NOTES_BY_SCENARIO.sales;
export const MOCK_IMPROVEMENT_AREAS = IMPROVEMENT_AREAS_BY_SCENARIO.sales;
