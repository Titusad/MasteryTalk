# Plan de Implementación: Interview End-to-End MVP

## Objetivo
Finalizar el flujo completo de la sesión de práctica (escenario "Interview") reemplazando todos los datos mock con llamadas reales a Gemini 1.5 Flash para el Feedback y el Reporte Final. Validar que los fixes recientes de audio y UI sean estables.

## Tareas

### 1. Validación de Fixes Críticos (P0)
- **Audio-text sync (`ttsTargetMsgRef`)**: Validar que el texto se ilumina sincronizado con el habla de ElevenLabs.
- **Evitar multi-clics (`isSubmittingRef`)**: Asegurarse de que el usuario no pueda disparar peticiones dobles al presionar el micrófono rápidamente.
- **Sugerencias de frase rotativas (`getTrySaying`)**: Validar si el hash basado en el turno provee frases aleatorias de forma consistente.

### 2. Integración de Endpoint `/analyze-feedback` (P1)
- **Backend (`supabase/functions/server/index.tsx`)**: 
  - Crear ruta `POST /analyze-feedback`.
  - Recibir el historial de la sesión (`HistoryItem[]`) y el contexto.
  - Generar contenido usando `buildFeedbackAnalystPrompt` a través de la API de Gemini (requiere `GEMINI_API_KEY`).
  - Formatear la respuesta usando Structured Outputs (JSON) para coincidir en forma estricta con la estructura de `feedback-data.ts` (`strengths` y `opportunities`).
- **Frontend (`ConversationFeedback.tsx`)**:
  - Reemplazar constantes de `MOCK_STRENGTHS` y `MOCK_OPPORTUNITIES` con datos reales solicitados a la Edge Function usando `useServiceCall`.
  - Crear el adaptador supabase correspondiente en `/adapters/supabase/conversation.supabase.ts` si no existe la función `analyzeFeedback`.

### 3. Integración de Endpoint `/generate-results-summary` (P2)
- **Backend (`supabase/functions/server/index.tsx`)**:
  - Crear ruta `POST /generate-results-summary`.
  - Invocar a Gemini usando `buildResultsSummaryPrompt`.
  - Forzar esquema JSON que coincida con `results-summary-data.ts` (`overallSentiment`, `pronunciationNotes`, `improvementAreas`).
- **Frontend (`SessionReport.tsx`)**:
  - Solicitar los datos al backend y renderizar. (Podemos usar un placeholder dummy para los azure word details temporalmente, hasta enganchar con shadowing real o calcular del STT previo).

### 4. Configuración
- Verificar o solicitar inyección de `GEMINI_API_KEY` en el entorno global del proyecto (Supabase Secrets / `.env.local`).

## Verificación a Realizar
1. **Prueba End-to-End Manual**: Correr una sesión completa de "Interview" validando desde que se introduce el contexto hasta llegar al Reporte final.
2. Verificar que no se vean mocks hardcodeados en el paso 6 y 8.
