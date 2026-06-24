sed -i 's/  workflow_dispatch:/  workflow_dispatch:\n  schedule:\n    - cron: "0 * * * *"/g' .github/workflows/nextjs.yml
sed -i '/run: ${{ steps.detect-package-manager.outputs.runner }} next build/i \        env:\n          RIOT_API_KEY: ${{ secrets.RIOT_API_KEY }}\n          PLAYER1_ID: ${{ secrets.PLAYER1_ID }}\n          PLAYER2_ID: ${{ secrets.PLAYER2_ID }}' .github/workflows/nextjs.yml
