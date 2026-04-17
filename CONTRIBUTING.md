# MasteryTalk PRO — Cómo Trabajamos

> Hub central de reglas de trabajo. Lee este documento al inicio de cada sesión.
>
> Last updated: 2026-04-17

---

## Flujo de Trabajo (Spec-Driven Development)

```
ROADMAP.md → PRODUCT_SPEC.md → DESIGN_SYSTEM.md → Código → Git
```

**Regla fundamental:** Nunca se escribe código sin antes verificar que el cambio es consistente con la spec del producto y el design system.

### Antes de cualquier tarea

| Paso | Documento | Pregunta |
|------|-----------|----------|
| 1 | `docs/ROADMAP.md` | ¿En qué fase estamos? ¿Esta tarea está priorizada? |
| 2 | `docs/PRODUCT_SPEC.md` | ¿Es consistente con la spec? ¿Necesita actualización? |
| 3 | `docs/DESIGN_SYSTEM.md` | ¿Cumple con las reglas de diseño? |
| 4 | `docs/SYSTEM_PROMPTS.md` | (Solo si se tocan prompts) ¿Sigue la arquitectura de 7 bloques? |

### Si la spec necesita cambiar

1. Actualizar `PRODUCT_SPEC.md` PRIMERO
2. Obtener aprobación del usuario
3. ENTONCES escribir código

---

## Arquitectura FSD (Feature-Sliced Design)

```
app → pages → widgets → features → entities → shared
```

### Reglas de importación

- Las capas superiores importan de las inferiores. **Nunca al revés.**
- `features/` nunca importa de otros `features/`.
- `shared/` tiene **cero** dependencias de capas superiores.

### Regla de oro para migraciones

> **Nunca mover un archivo Y cambiar su contenido en el mismo paso.**
> Mover primero → verificar que compila → luego refactorizar.

### Estructura actual del proyecto

```
src/
├── app/           ← Coordinación global (App.tsx, routing, hooks)
├── pages/         ← Páginas completas
├── widgets/       ← Componentes compuestos (SessionReport, etc.)
├── features/      ← Lógica de negocio (practice-session, arena, etc.)
├── entities/      ← Tipos y modelos de dominio
├── shared/        ← UI compartida, utilidades puras
├── services/      ← Adaptadores de servicios (Supabase, mocks)
└── imports/       ← Barrel exports
```

---

## Convenciones de Git

### Commits

Formato: **Conventional Commits** en inglés.

```
<type>(<scope>): <description>

feat(landing): add pricing section
fix(arena): correct phase transition logic
docs(spec): update pricing model to one-time purchases
refactor(shared): extract AppModal to separate file
chore(deps): update motion/react to 12.x
```

| Prefix | Uso |
|--------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `refactor` | Cambio de código sin cambiar comportamiento |
| `chore` | Tareas de mantenimiento |
| `style` | Formato, espacios (no afecta lógica) |
| `perf` | Mejora de rendimiento |

### Branching

- **Actualmente:** Todo en `main` (single developer workflow).
- Push directo a `main` tras verificar que compila.

### Flujo de push

```bash
pnpm run dev          # Verificar que compila
git add .
git commit -m "feat(scope): description"
git push
```

---

## Convenciones de Código

### Stack

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 | Hash-based routing (NO React Router) |
| Animaciones | `motion/react` | Import como `motion`. NUNCA `framer-motion` |
| Iconos | `lucide-react` | Única librería permitida |
| Backend | Supabase Edge Functions (Deno + Hono) | |
| Package manager | pnpm | NUNCA modificar `pnpm-lock.yaml` |

### Archivos protegidos (NUNCA modificar)

```
src/app/components/figma/ImageWithFallback.tsx
supabase/functions/server/kv_store.tsx
utils/supabase/info.tsx
pnpm-lock.yaml
```

### Componentes canónicos (usar ANTES de crear nuevos)

Antes de crear cualquier componente estructural, verificar si ya existe en el [Design System](docs/DESIGN_SYSTEM.md) §6.

---

## Mapa de Documentación

| Documento | Propósito | Cuándo consultarlo |
|-----------|-----------|-------------------|
| [ROADMAP.md](docs/ROADMAP.md) | Qué hacer y en qué orden | Al inicio de cada sesión |
| [PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Qué es el producto, reglas de negocio | Antes de cualquier feature |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Cómo se ve: colores, tipografía, componentes | Antes de cualquier cambio UI |
| [SYSTEM_PROMPTS.md](docs/SYSTEM_PROMPTS.md) | Cómo piensa la AI del producto | Antes de tocar prompts o Edge Functions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo trabajamos (este documento) | Referencia permanente |

---

## Protocolo de Sesión AI-Developer

### Al inicio de cada sesión

1. Leer `CONTRIBUTING.md` (este doc)
2. Revisar `ROADMAP.md` → identificar la próxima tarea
3. Presentar plan de cambios antes de escribir código

### Antes de CUALQUIER cambio de código

```
📋 PLAN DE CAMBIOS

Archivos a modificar:
  - src/path/archivo.tsx — [descripción del cambio]

Archivos a crear:
  - src/path/nuevo.tsx — [descripción]

Archivos a eliminar:
  - (ninguno) o [lista]

Impacto en otros componentes:
  - [qué otros archivos podrían verse afectados]

¿Procedo con estos cambios?
```

Esperar confirmación explícita antes de proceder.

### Al finalizar una tarea

1. Verificar que compila (`pnpm run dev`)
2. Preguntar por autorización para proceder con git
3. Commit con Conventional Commits
4. Push a main
5. Actualizar `ROADMAP.md` si se completó un item

---

## Changelog

| Date | Change |
|------|--------|
| 2026-04-17 | Initial — working rules established |
