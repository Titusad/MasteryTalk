# inFluentia PRO — Checklist de Entrega a Desarrolladores

> **Proposito:** Todo lo que el product owner debe entregar al backend developer
> MAS ALLA del codigo y la documentacion tecnica.
> **Fecha:** 4 marzo 2026 (actualizado v6.0)

---

## 1. Accesos y Credenciales

### 1.1 Para el Backend Developer

| Item | Accion | Notas |
|------|--------|-------|
| **Supabase project** | Crear proyecto en supabase.com, invitar al dev como miembro del org | Rol: Developer (no Owner) |
| **Google Cloud Console** | Crear proyecto GCP, crear OAuth 2.0 Client ID + Secret | Necesita: OAuth credentials para Google Sign-In |
| **LinkedIn Developer Portal** | Crear app con "Sign In with LinkedIn using OpenID Connect" | Scopes: `openid, profile, email` |
| **OpenAI API key** | Crear en platform.openai.com, setear spending limit ($50/mes inicial) | Modelos: gpt-4o + gpt-4o-mini |
| **ElevenLabs API key** | Crear cuenta, compartir API key | Plan Starter ($5/mo) suficiente para dev |
| **Google AI Studio (Gemini)** | Crear API key en aistudio.google.com | Free tier: 60 RPM — suficiente para dev |
| **Azure Speech Services** | Crear recurso en Azure Portal, compartir region + key | Free tier: 5 hrs/mes STT, 500K chars TTS |
| **Cloudflare R2** | Crear cuenta + bucket, compartir access keys | Free tier: 10 GB storage, 10M reads/mes |
| **Mercado Pago sandbox** | Crear app en mercadopago.com.mx/developers, modo sandbox | Access Token sandbox SOLAMENTE |

### 1.2 Compartir credenciales de forma segura

> **NUNCA enviar API keys por email, Slack, o WhatsApp.**

Opciones recomendadas:
- **1Password / Bitwarden** — Vault compartido
- **Supabase Vault** — Para secrets de Edge Functions
- **Doppler / Infisical** — Secrets manager dedicado
- **Minimo:** Mensaje temporal en Signal (auto-borrado)

---

## 2. Repositorio y DevOps

| Item | Accion | Notas |
|------|--------|-------|
| **Repositorio Git** | Crear repo privado, pushear codigo de Figma Make | Agregar dev como collaborator |
| **Branch strategy** | `main` (produccion), `develop` (integracion), feature branches | GitHub Flow para equipo pequeno |
| **CI/CD** (opcional) | GitHub Actions o Vercel para auto-deploy | Puede esperar a post-Fase 1 |
| **Dominio** | Comprar dominio | Para OAuth redirect URLs y produccion |
| **Hosting** | Vercel (recomendado) | Auto-deploy desde GitHub, previews por PR |

---

## 3. Diseno y Assets

| Item | Donde esta | Notas |
|------|-----------|-------|
| Design System completo | `#design-system` en la app | 7 secciones: Colors, Typography, Components, Session, Arena, Patterns, Layouts |
| Color primario | `#0f172b` (navy) | Definido en shared/index.tsx COLORS |
| Verde pastel | `#DBEDDF` | Background cards, badges |
| Background | `#f0f4f8` | Pantallas internas |
| SVG logo paths | `/src/imports/svg-tv6st9nzh5.ts` | BrandLogo y otros |
| Iconografia | lucide-react | Consistente en toda la app |

---

## 4. Documentacion tecnica entregada

| Documento | Que contiene | Prioridad de lectura |
|-----------|-------------|---------------------|
| `MASTER_BLUEPRINT.md` v5.0 | Arquitectura, stack, data model, interfaces, errors, flow (8 steps), credit packs | **1ro** |
| `BACKEND_HANDOFF.md` | Guia especifica para el backend dev: estructura, switching, errores, credit packs | **2do** |
| `PDR_SCREEN_BY_SCREEN.md` v5.0 | Spec de cada pantalla con service calls (8 internal steps) | **3ro** |
| `SYSTEM_PROMPTS.md` | 7 bloques del system prompt, personas, regions, voice map | **4to** |
| `QA_ACCEPTANCE_CRITERIA.md` v4.0 | 116 tests totales, organizados por fase | **5to** |
| `FASE1_MIGRATION.sql` | SQL completo para ejecutar en Supabase | **Fase 1** |
| `FASE1_ONBOARDING_SUPPLEMENT.md` | Instrucciones detalladas dia por dia | **Fase 1** |
| `WORKPLAN_v3.md` v3.1 | Plan de trabajo: 4 fases backend, timeline | **Referencia** |

---

## 5. Estado del frontend

| Aspecto | Estado | Nota |
|---------|--------|------|
| Codigo fuente | Escrito (~45 archivos) | Prototipo funcional como MVP con mock data |
| Production readiness audit | **Completada** | 14+ archivos limpiados: credit packs, i18n, tipos, services |
| ErrorBoundary | **Funcional** | Atrapa errores de render, muestra fallback en vez de blank screen |
| Compilacion | **Funcional** | App renderiza correctamente, flujo E2E funciona |
| i18n | **Completo (ES/PT/EN)** | landing-i18n.ts con 3 idiomas, language switcher con flag emojis |
| Paywall system | **Completo** | useUsageGating hook, CreditUpsellModal, 3 triggers conectados |
| Mock adapters | 7 implementados | Referencia de comportamiento para adapters reales |
| Service interfaces | 7 definidas | Contratos que el backend debe implementar |
| Error handling | Completo | 5 dominios, ~31 error codes (incl CREDITS_EXHAUSTED), UI ya los maneja |
| Prompt engineering | Completo | 7-block assembler reutilizable en Edge Functions |
| Design System | Completo | Pagina de referencia en `#design-system` |
| Credit system | **Implementado** | CreditUpsellModal, useUsageGating validates credits, 3 paywall triggers |
| `services/index.ts` | **100% mock** | ~38 lineas, sin imports de supabase — listo para restaurar auto-detect |

### Importante: antes de que el backend developer empiece

El frontend debe estar **compilando y corriendo** para que el backend developer pueda:
1. Ver el flujo completo con mocks (8 steps)
2. Entender el comportamiento esperado de cada service call
3. Verificar que sus adapters funcionan correctamente en el contexto real
4. Ver el CreditUpsellModal y credit flow en accion

---

## 6. Contexto de negocio para el developer

| Aspecto | Detalle |
|---------|---------|
| **Que es inFluentia PRO** | Simulador de comunicacion ejecutiva en ingles para profesionales LATAM |
| **Target market** | Nearshoring: Mexico y Colombia |
| **Modelo de negocio** | Pay-per-session: 1 sesion gratis, luego credit packs (1/$4.99, 3/$12.99, 5/$19.99) |
| **Pagos LATAM** | Mercado Pago incluye OXXO (Mexico) y Efecty (Colombia) — pagos en efectivo con confirmacion 24-72h |
| **Flujo de usuario** | Landing (i18n ES/PT/EN) → Auth → Language Modal (skip para EN) → Strategy → Practice (Arena 3 fases) → Feedback → Session Report → Dashboard |
| **IA conversacional** | GPT-4o para conversacion (GPT-4o-mini para free session), Gemini Flash para analisis, Azure Speech para pronunciacion |
| **Retencion** | Spaced Repetition automatizado + Power Phrases coleccionables + Dashboard |
| **Idiomas** | Landing: ES/PT/EN. Practica y feedback: EN (inmersion). EN positioning: communication training, not language learning |
| **Paywall triggers** | (1) 3er intento de practica, (2) descarga de PDF, (3) nueva sesion sin creditos |