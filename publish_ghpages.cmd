@echo off
cd /d C:\Users\chase\ghpages-deploy
git add -A
git commit -m "Publish: gh-pages root"
git push --force origin HEAD:gh-pages
echo EXIT=%errorlevel% > "c:\Users\chase\Grade-melon-3\publish_ghpages_exit.txt"
