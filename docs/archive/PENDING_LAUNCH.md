# 🚀 Tareas Pendientes para Lanzamiento Público

> Estas tareas deben completarse antes de abrir inFluentia PRO al público.

---

## 📧 Email Service Integration
- [ ] Elegir proveedor (recomendado: **Resend**)
- [ ] Verificar dominio propio para envío (evitar spam)
- [ ] **Welcome email** al registrarse — info de la plataforma, cómo empezar
- [ ] **Resumen post-sesión** — métricas, feedback, próximos pasos
- [ ] **Marketing/nurturing** — secuencia de emails para usuarios inactivos
- [ ] Recordatorio si no practican en X días
- [ ] Cumplir CAN-SPAM/GDPR — link de unsubscribe en todos los emails

## 🔗 Custom Domain para Supabase Auth
- [ ] Adquirir/verificar dominio (ej: `influentiapro.com`)
- [ ] Upgrade a **Supabase Pro** ($25/mes) para custom domains
- [ ] Configurar subdominio `api.influentiapro.com` → Supabase
- [ ] Actualizar DNS (CNAME record)
- [ ] Google OAuth mostrará "Ir a api.influentiapro.com" en vez de `zkury...supabase.co`
- [ ] Actualizar OAuth consent screen name → "inFluentia PRO"

## ⚡ Performance (en progreso)
- [x] Pronunciación non-blocking en PhrasesLayer
- [x] Skip WAV conversion para Whisper
- [ ] ElevenLabs TTS streaming — reducir latencia de generación de voz
- [ ] Non-blocking pronunciation en ShadowingModal y PronunciationTab

## 🛡️ Producción
- [ ] Configurar error monitoring (Sentry o similar)
- [ ] Rate limiting en Edge Functions
- [ ] Política de privacidad y Términos de servicio (páginas legales)
