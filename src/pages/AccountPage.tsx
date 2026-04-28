import { useState, useEffect } from "react";
import { User, CreditCard, Settings, LogOut, CheckCircle, AlertTriangle, ShieldAlert, Lock, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter } from "@/shared/ui";
import type { OnboardingProfile, User as AuthUser } from "@/services/types";
import { SUPABASE_URL, getAuthToken } from "@/services/supabase";

const TIER_LABELS: Record<string, string> = {
  early_bird: "Early Bird Plan",
  monthly: "Monthly Pro",
  quarterly: "Quarterly Pro",
};

interface SubscriptionInfo {
  subscription_active: boolean;
  tier?: string;
  plan_status?: string;
  next_billing_date?: string | null;
}

interface AccountPageProps {
  userProfile?: OnboardingProfile | null;
  authUser?: AuthUser | null;
  onLogout: () => void;
}

export function AccountPage({ userProfile, authUser, onLogout }: AccountPageProps) {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    getAuthToken().then(token => {
      if (!token) return;
      fetch(`${SUPABASE_URL}/functions/v1/make-server-08b8658d/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setSubInfo({
            subscription_active: data.subscription_active ?? false,
            tier: data.tier,
            plan_status: data.plan_status,
            next_billing_date: data.next_billing_date,
          });
        })
        .catch(() => {});
    });
  }, []);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/create-portal-session`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setPortalLoading(false);
    }
  };

  // Fallbacks
  const displayName = authUser?.displayName || "Beta User";
  const displayEmail = authUser?.email || "beta.user@example.com";
  const avatarInitials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";
  
  return (
    <div className="w-full min-h-full flex flex-col bg-[#f8fafc] relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <PastelBlobs />

      {/* MAIN CONTENT */}
      <main className="relative w-full max-w-[800px] mx-auto px-4 md:px-8 pt-8 pb-20 flex-1">

        <h1 className="text-3xl md:text-4xl font-light text-[#0f172b] mb-8">
          Mi Cuenta
        </h1>

        <div className="space-y-6">
          {/* PROFILE CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#cad5e2] transition-colors shadow-sm">
            <h2 className="text-lg font-medium text-[#0f172b] mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-[#62748e]" />
              Perfil Personal
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
                <span className="text-white text-2xl font-light">{avatarInitials}</span>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#62748e] mb-1.5">Nombre Completo</label>
                    <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172b] rounded-lg px-4 py-3 text-sm font-medium">
                      {displayName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#62748e] mb-1.5">Correo Electrónico</label>
                    <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] rounded-lg px-4 py-3 text-sm">
                      {displayEmail}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] italic">Miembro desde el 2025.</p>
              </div>
            </div>
          </section>

          {/* SUBSCRIPTION CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#cad5e2] transition-colors shadow-sm">
            <h2 className="text-lg font-medium text-[#0f172b] mb-5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#62748e]" />
              Plan y Uso
            </h2>

            {subInfo?.subscription_active ? (
              /* ── Active subscription ── */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-xl font-semibold text-[#0f172b]">
                        {TIER_LABELS[subInfo.tier ?? ""] ?? "MasteryTalk PRO"}
                      </h3>
                      <span className="bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Activo
                      </span>
                    </div>
                    {subInfo.next_billing_date && (
                      <p className="text-xs text-[#62748e]">
                        Próxima renovación: {new Date(subInfo.next_billing_date).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#0f172b] hover:bg-[#f8fafc] transition-colors shrink-0 disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#0f172b] border-t-transparent animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    {portalLoading ? "Cargando..." : "Manage Subscription"}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[#0f172b]">
                    <CheckCircle className="w-4 h-4 text-[#16a34a]" />
                    Sesiones disponibles
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2 mb-2">
                    <div className="bg-[#00C950] h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-xs text-[#62748e] text-right">Acceso ilimitado a todos los paths</p>
                </div>
              </>
            ) : (
              /* ── Beta / no subscription ── */
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-[#0f172b]">Pionero (Beta)</h3>
                  <span className="bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">Activo</span>
                </div>
                <p className="text-sm text-[#45556c] max-w-sm">Mientras hacemos pruebas con usuarios reales, tienes acceso completo y gratuito a las prácticas de idioma de la plataforma.</p>
                <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[#0f172b]">
                    <CheckCircle className="w-4 h-4 text-[#16a34a]" />
                    Sesiones Disponibles
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2 mb-2">
                    <div className="bg-[#0f172b] h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-xs text-[#62748e] text-right">Uso Ilimitado (Beta test phase)</p>
                </div>
              </>
            )}
          </section>

          {/* SETTINGS CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#cad5e2] transition-colors shadow-sm">
            <h2 className="text-lg font-medium text-[#0f172b] mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#62748e]" />
              Preferencias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#62748e] mb-1.5">Foco de Mercado / Rol</label>
                <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                  <span>{userProfile?.position || userProfile?.role || "LATAM Sales Manager"}</span>
                  <Lock className="w-3.5 h-3.5 text-[#cbd5e1]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#62748e] mb-1.5">Idioma de Interfaz</label>
                <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                  <span>Español (América Latina)</span>
                  <Lock className="w-3.5 h-3.5 text-[#cbd5e1]" />
                </div>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8] mt-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Las preferencias están en modo solo lectura durante el Beta.
            </p>
          </section>

          {/* DANGER ZONE */}
          <section className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-red-600 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Zona de Peligro
            </h2>
            <p className="text-sm text-[#45556c] mb-6">Acciones destructivas que afectan tu sesión o acceso a la plataforma.</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </section>
        </div>
      </main>

      <MiniFooter />

      {/* CONFIRM LOGOUT MODAL */}
      <AnimatePresence>
        {showConfirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowConfirmLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f172b] mb-2">¿Cerrar sesión?</h3>
              <p className="text-[#45556c] text-sm mb-6">Tendrás que volver a ingresar tus credenciales para acceder a tus prácticas.</p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowConfirmLogout(false);
                    onLogout();
                  }}
                  className="w-full py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Sí, cerrar sesión
                </button>
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="w-full py-3 rounded-lg bg-[#f1f5f9] text-[#45556c] hover:bg-[#e2e8f0] transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
