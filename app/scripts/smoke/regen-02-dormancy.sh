#!/usr/bin/env bash
# REGEN-02 integration smoke — to be filled by Plan 02-02.
#
# Shape:
#   1. curl POST /api/operator/dormancy with {enable:true}
#   2. trigger /api/cron/morning-sheet with $CRON_SECRET
#   3. grep vercel logs for skip_reason:'dormant' (manual verification)
#   4. curl POST /api/operator/dormancy with {enable:false}
#   5. next cron should deliver a sheet
#
# Expected env:
#   BASE_URL         — staging deployment, e.g. https://huma-two.vercel.app
#   OPERATOR_JWT     — Bearer token for the dormancy-toggle call
#   CRON_SECRET      — matches Vercel cron bearer
#
# Exit 0 = smoke passes. Non-zero = failure; log output above for diagnosis.
set -euo pipefail

echo "TODO (Plan 02-02): implement regen-02-dormancy end-to-end smoke"
exit 0
