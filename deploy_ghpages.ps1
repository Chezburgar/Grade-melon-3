$source = "C:\Users\chase\Grade-melon-3\out"
$deployRoot = "C:\Users\chase\ghpages-deploy"

if (-Not (Test-Path $source)) {
    Write-Error "Source path not found: $source"
    exit 1
}

if (Test-Path $deployRoot) {
    Remove-Item -Recurse -Force $deployRoot
}

New-Item -ItemType Directory -Path $deployRoot | Out-Null
New-Item -ItemType File -Path "$source\.nojekyll" -Force | Out-Null
robocopy "$source" "$deployRoot" /MIR | Out-Null

Set-Location $deployRoot

if (-Not (Test-Path ".git")) {
    git init | Out-Null
}

git config user.name "chase"
git config user.email "chase@users.noreply.github.com"

if (-Not (git remote get-url origin 2>$null)) {
    git remote add origin "https://github.com/Chezburgar/Grade-melon-3.git"
} else {
    git remote set-url origin "https://github.com/Chezburgar/Grade-melon-3.git"
}

git add -A

if (git diff --cached --quiet) {
    Write-Host "No changes to commit"
} else {
    git commit -m "Publish: gh-pages root"
}

git push --force origin HEAD:gh-pages
