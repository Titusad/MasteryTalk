# MasteryTalk PRO — Cómo Trabajamos

> Protocolo de sesión y convenciones de trabajo.
> Last updated: 2026-05-01

---

## Flujo de trabajo (SDD)

```
ROADMAP.md → PRODUCT_SPEC.md → DESIGN_SYSTEM.md → Código → Git
```

Nunca se escribe código sin verificar consistencia con el spec y el design system.
Si el spec necesita cambiar → actualizar `PRODUCT_SPEC.md` PRIMERO → aprobación → código.

---

## Protocolo de sesión

### Antes de cualquier tarea
1. Leer `docs/PRODUCT_SPEC.md` — source of truth del producto
2. Leer `docs/ROADMAP.md` — qué está live, qué es prioridad
3. Leer el doc específico según el tipo de tarea (ver tabla en `CLAUDE.md`)

### Antes de cualquier cambio de código

```
📋 PLAN DE CAMBIOS
Archivos a modificar: [lista con descripción]
Archivos a crear:     [lista con descripción]
Archivos a eliminar:  [lista o "ninguno"]
Impacto:              [otros archivos afectados]
¿Procedo?
```

Esperar confirmación explícita antes de proceder.

### Al finalizar una tarea

1. Solicitar prueba manual al usuario (especialmente en UI)
2. Marcar tarea como `[x]` en `ROADMAP.md` tras confirmación
3. Verificar que compila sin errores
4. Commit con Conventional Commits + push a `main`

---

## Convenciones de Git

Formato: **Conventional Commits** en inglés.

```
<type>(<scope>): <description>

feat(dashboard): add War Room session counter
fix(tts): swap ElevenLabs to OpenAI as primary
docs(spec): update pricing model v2.8
refactor(shared): extract AppModal to separate file
```

| Prefix | Uso |
|--------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `refactor` | Cambio sin cambiar comportamiento |
| `chore` | Mantenimiento, deps |
| `style` | Formato, espacios (no afecta lógica) |
| `perf` | Mejora de rendimiento |

**Branching:** Todo en `main` (single developer). Push directo tras verificar que compila.

---

## Mapa de documentación

| Documento | Propósito |
|-----------|-----------|
| `docs/PRODUCT_SPEC.md` | Source of truth: producto, precios, KV model, API |
| `docs/ROADMAP.md` | Estado actual, prioridades, backlog |
| `docs/DESIGN_SYSTEM.md` | Colores, tipografía, componentes canónicos |
| `docs/BRAND_VOICE.md` | Voz de marca, copy guidelines |
| `docs/SYSTEM_PROMPTS.md` | Arquitectura de prompts de IA (GPT-4o + Gemini) |
| `docs/LEARNING_METHODOLOGY.md` | Metodología pedagógica, gaps identificados |
| `docs/CEFR_CALIBRATION.md` | Calibración de niveles CEFR |
| `docs/UX_POLISH.md` | Guía de polish UX, sprints completados |
| `docs/JOURNEY.md` | Flujos de usuario detallados |
| `.claude/CLAUDE.md` | Guía operacional para Claude Code |

---

## Regla de oro FSD

> Nunca mover un archivo Y cambiar su contenido en el mismo paso.
> Mover primero → verificar que compila → luego refactorizar.

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-04-17 | Initial — working rules established |
| 2026-05-01 | Limpieza: eliminada duplicación con CLAUDE.md, mapa de docs actualizado con todos los docs activos, protocolo simplificado |
