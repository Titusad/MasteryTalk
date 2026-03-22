# Influentia Landing V3 MVP - Context & Rules

# 1. Stack Tecnológico (Vite + Supabase)
- **Bundler/Dev Server:** Vite
- **Lenguaje:** TypeScript
- **Backend-as-a-Service:** Supabase (Revisar carpeta `./supabase` para esquemas)
- **Scripting:** Python (`fix.py` para tareas de mantenimiento)
- **Styles:** PostCSS / CSS Modules o Tailwind (confirmar configuración)

# 2. Instrucciones para Claude CLI (Tú)
- **Contexto de Supabase:** Antes de proponer cambios en modelos de datos, consulta los archivos en `./supabase`.
- **Comandos de Desarrollo:** Usa `npm run dev` para el servidor de Vite.
- **Enfoque:** Prioriza la lógica de integración con Supabase y la performance de Vite. 
- **Scripts:** Si detectas errores repetitivos, considera usar o mejorar `fix.py`.

# 3. Sincronización con Antigravity
- @import ../.agent/rules/project_constitution.md
- **Validación:** Tú construyes la lógica y los hooks; Antigravity valida el renderizado final en el navegador integrado.

# 4. Archivos Clave de Referencia
- Consultar `MIGRATION_NOTES.md` antes de realizar cambios estructurales.
- Seguir el plan definido en `interview-e2e-plan.md` para nuevas funcionalidades.