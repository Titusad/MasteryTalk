import sys

fname = 'src/app/components/PracticeSessionPage.tsx'
with open(fname, 'r') as f:
    code = f.read()

# Add import
if 'getAuthToken' not in code:
    code = code.replace(
        'import { projectId, publicAnonKey } from "../../../utils/supabase/info";',
        'import { projectId, publicAnonKey } from "../../../utils/supabase/info";\nimport { getAuthToken } from "../../services/supabase";'
    )

callbacks_to_async = [
    'const fireScriptGeneration = useCallback((',
    'const fireToolkitGeneration = useCallback((',
    'const fireInterviewBriefing = useCallback((',
    'const fireFeedbackAnalysis = useCallback(() => {',
    'const fireSummaryGeneration = useCallback(() => {',
    'const fireImprovedScriptGeneration = useCallback(() => {',
    'const saveSessionToBackend = useCallback((summaryData: import("../../services/types").SessionSummary) => {'
]

for cb in callbacks_to_async:
    async_cb = cb.replace('useCallback((', 'useCallback(async (')
    code = code.replace(cb, async_cb)

# Replace Authorization
code = code.replace('Authorization: `Bearer ${publicAnonKey}`', 'Authorization: `Bearer ${await getAuthToken()}`')

with open(fname, 'w') as f:
    f.write(code)

history_fname = 'src/app/components/PracticeHistoryPage.tsx'
with open(history_fname, 'r') as f:
    hist_code = f.read()

if 'getAuthToken' not in hist_code:
    hist_code = hist_code.replace(
        'import { projectId, publicAnonKey } from "../../../utils/supabase/info";',
        'import { projectId, publicAnonKey } from "../../../utils/supabase/info";\nimport { getAuthToken } from "../../services/supabase";'
    )

hist_code = hist_code.replace('Authorization: `Bearer ${publicAnonKey}`', 'Authorization: `Bearer ${await getAuthToken()}`')

# PracticeHistory uses useEffect, which is NOT async. 
# In PracticeHistoryPage, it's fetch(serverUrl).then(async (res) => ...).
# We can't use await inside useEffect without an async IIFE or inside a function.
# Let's fix PracticeHistory separately.
with open(history_fname, 'w') as f:
    f.write(hist_code)

print("Done")
