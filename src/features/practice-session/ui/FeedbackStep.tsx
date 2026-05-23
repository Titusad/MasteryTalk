import { FeedbackScreen } from "@/features/practice-session/ui/FeedbackScreen";
import { PathRecommendationCard } from "@/features/practice-session/ui/PathRecommendationCard";
import { WhatsAppActivationCard } from "@/features/dashboard/ui/WhatsAppActivationCard";
import { DeepDiveCard } from "@/features/practice-session/ui/DeepDiveCard";
import { ScenarioDeltaCard } from "@/features/practice-session/ui/ScenarioDeltaCard";
import { recommendPath } from "@/features/dashboard/model/path-recommendation";
import { getRecommendedLessons } from "@/services/microLessons";
import { downloadSessionReportPdf } from "@/shared/lib/cheatSheetPdf";
import { setNarrationMuted } from "@/shared/lib/useNarrationPreference";
import { getAuthToken } from "@/services/supabase";
import { projectId, publicAnonKey } from "@/../utils/supabase/info";
import { FEEDBACK_URLS } from "@/features/practice-session/model/narrator-audio";
import type { ScenarioType, SessionSummary, OnboardingProfile } from "@/services/types";
import type { RealFeedbackData } from "@/entities/feedback";
import type { PathId } from "@/entities/progression";
import type { TurnPronunciationData, ScriptSection, InterviewBriefingData } from "@/services/types";
import type { PaywallReason } from "@/shared/hooks/useUsageGating";
import type { MicroLesson } from "@/services/microLessons";
import type { CVMatchResult } from "@/services/cvMatchService";

export interface FeedbackStepProps {
  // Session context
  scenarioType?: ScenarioType;
  isSelfIntro: boolean;
  progressionPathId?: PathId;
  progressionLevelId?: string;
  effectiveScenario: string;
  effectiveInterlocutor: string;

  // Feedback data
  realFeedback: RealFeedbackData | null;
  sessionPronData: TurnPronunciationData[];
  sessionSummary: SessionSummary | null;

  // Script data
  interviewBriefing: InterviewBriefingData | null;
  cvMatchStatus: "idle" | "loading" | "success" | "error";
  cvMatchData: CVMatchResult | null;
  improvedScript: ScriptSection[] | null;

  // User
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  userDrafts: Record<number, string>;

  // Repeat
  canRepeat: boolean;
  onPracticeAgain: () => void;

  // Timing ref
  sessionStartRef: React.MutableRefObject<number>;

  // Navigation
  onFinish: () => void;
  onPaywallTriggered: (reason: PaywallReason) => void;

  // Deep dive setters (handed up to page for modal)
  setDeepDiveLessons: (l: MicroLesson[]) => void;
  setDeepDiveLessonIndex: (i: number) => void;
  setDeepDiveLessonOpen: (v: boolean) => void;

  // Paywall override
  setRecommendedPathOverride: (s: ScenarioType | null) => void;
}

export function FeedbackStep({
  scenarioType, isSelfIntro, progressionPathId, progressionLevelId,
  effectiveScenario, effectiveInterlocutor,
  realFeedback, sessionPronData, sessionSummary,
  interviewBriefing, cvMatchStatus, cvMatchData, improvedScript,
  userProfile, onProfileUpdate, userDrafts,
  canRepeat, onPracticeAgain,
  sessionStartRef,
  onFinish, onPaywallTriggered,
  setDeepDiveLessons, setDeepDiveLessonIndex, setDeepDiveLessonOpen,
  setRecommendedPathOverride,
}: FeedbackStepProps) {

  /* ── Path recommendation (self-intro only) ── */
  const recommendation = isSelfIntro
    ? recommendPath(realFeedback?.pillarScores, undefined, userProfile)
    : null;

  const recommendationSlot = recommendation ? (
    <PathRecommendationCard
      recommendation={recommendation}
      onStartPath={() => {
        setRecommendedPathOverride(recommendation.pathId as ScenarioType);
        onPaywallTriggered("path-required");
      }}
      onExploreAll={onFinish}
    />
  ) : null;

  /* ── WhatsApp card ── */
  const waVerified = !!(userProfile as any)?.whatsapp_verified;
  const waPermanentlyDismissed = !!(userProfile as any)?.wa_card_permanently_dismissed;
  const dismissedAtCount = (userProfile as any)?.wa_dismissed_at_session_count ?? null;
  const currentSessionCount = (userProfile as any)?.stats?.sessions_count ?? 0;
  const sessionsSinceDismiss = dismissedAtCount !== null ? currentSessionCount - dismissedAtCount : null;
  const showWaCard = !waVerified && !waPermanentlyDismissed
    && (dismissedAtCount === null || sessionsSinceDismiss !== null && sessionsSinceDismiss >= 3);
  const dismissCount = dismissedAtCount !== null ? 1 : 0;

  const handleWaDismiss = () => {
    if (dismissCount >= 1) {
      const updated = { ...(userProfile as any), wa_card_permanently_dismissed: true };
      onProfileUpdate?.(updated as any);
      getAuthToken().then((token) => {
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: publicAnonKey },
          body: JSON.stringify({ wa_card_permanently_dismissed: true }),
        }).catch(() => {});
      }).catch(() => {});
    } else {
      const updated = { ...(userProfile as any), wa_dismissed_at_session_count: currentSessionCount };
      onProfileUpdate?.(updated as any);
      getAuthToken().then((token) => {
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: publicAnonKey },
          body: JSON.stringify({ wa_dismissed_at_session_count: currentSessionCount }),
        }).catch(() => {});
      }).catch(() => {});
    }
  };

  const waCardSlot = showWaCard ? (
    <div className="mt-6">
      <WhatsAppActivationCard
        variant="feedback"
        dismissCount={dismissCount}
        onDismiss={handleWaDismiss}
        strongerPhrase={realFeedback?.beforeAfter?.[0]?.professionalVersion ?? null}
      />
    </div>
  ) : null;

  /* ── Deep dive lessons ── */
  const pillarScores = realFeedback?.pillarScores ?? {};
  const radarData = Object.entries(pillarScores).map(([skill, score]) => ({
    skill, score: typeof score === "number" ? score : 0, fullMark: 100,
  }));
  const sessionCtx = {
    pathId: progressionPathId ?? scenarioType ?? undefined,
    levelId: progressionLevelId ?? undefined,
    scenarioType: scenarioType ?? undefined,
  };
  const deepDiveLessonsResult = !isSelfIntro ? getRecommendedLessons(radarData, sessionCtx) : [];
  const deepDiveSlot = deepDiveLessonsResult.length > 0 ? (
    <DeepDiveCard
      lessons={deepDiveLessonsResult}
      onOpenLesson={(lesson) => {
        const idx = deepDiveLessonsResult.indexOf(lesson);
        setDeepDiveLessons(deepDiveLessonsResult);
        setDeepDiveLessonIndex(idx >= 0 ? idx : 0);
        setDeepDiveLessonOpen(true);
      }}
    />
  ) : null;

  /* ── Scenario delta ── */
  const scenarioDeltaSlot = !isSelfIntro && scenarioType && realFeedback?.pillarScores
    && Object.keys(realFeedback.pillarScores).length >= 4 ? (
    <ScenarioDeltaCard
      scenarioType={scenarioType}
      currentPillarScores={realFeedback.pillarScores}
    />
  ) : null;

  const combinedBottomSlot = (waCardSlot || recommendationSlot || scenarioDeltaSlot || deepDiveSlot)
    ? <>{waCardSlot}{recommendationSlot}{scenarioDeltaSlot}{deepDiveSlot}</>
    : null;

  /* ── Render ── */
  return (
    <FeedbackScreen
      scenarioType={scenarioType}
      realFeedback={realFeedback}
      pronunciationData={sessionPronData}
      pronunciationNotes={sessionSummary?.pronunciationNotes ?? []}
      narratorUrl={FEEDBACK_URLS[scenarioType ?? "interview"]}
      onPracticeAgain={canRepeat ? onPracticeAgain : undefined}
      onDownloadPdf={() => {
        downloadSessionReportPdf({
          briefing: scenarioType === "interview" ? interviewBriefing : null,
          interlocutor: effectiveInterlocutor,
          scenario: effectiveScenario,
          scenarioType,
          feedback: realFeedback ? {
            strengths: realFeedback.strengths,
            opportunities: realFeedback.opportunities,
            beforeAfter: realFeedback.beforeAfter,
            pillarScores: realFeedback.pillarScores,
            professionalProficiency: realFeedback.professionalProficiency,
            contentScores: realFeedback.contentScores,
            interviewReadinessScore: realFeedback.interviewReadinessScore,
            preparationUtilization: realFeedback.preparationUtilization,
            contentInsights: realFeedback.contentInsights,
            languageInsights: realFeedback.languageInsights,
          } : null,
          summary: sessionSummary ? {
            overallSentiment: sessionSummary.overallSentiment,
            nextSteps: sessionSummary.nextSteps.map(s => `${s.title}: ${s.desc}`),
            sessionHighlight: sessionSummary.sessionHighlight,
          } : null,
          sessionDuration: `${Math.round((Date.now() - sessionStartRef.current) / 60000)} min`,
          userDrafts: scenarioType === "interview" && Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
          pronunciationData: sessionPronData.length > 0 ? sessionPronData : undefined,
          improvedScript: improvedScript,
          cvMatchData: (cvMatchStatus === "success" && cvMatchData) ? cvMatchData : null,
        }).catch((err) => {
          console.error("[FeedbackStep] PDF generation failed:", err);
        });
      }}
      onFinish={() => {
        if (!userProfile?.narrationCompleted) {
          const updated = { ...(userProfile as any), narrationCompleted: true };
          onProfileUpdate?.(updated);
          getAuthToken().then((token) => {
            fetch(`https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/profile`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: publicAnonKey },
              body: JSON.stringify({ narrationCompleted: true }),
            }).catch(() => {});
          }).catch(() => {});
          setNarrationMuted(true);
        }
        onFinish();
      }}
      canRetryFree={canRepeat}
      bottomSlot={combinedBottomSlot}
    />
  );
}
