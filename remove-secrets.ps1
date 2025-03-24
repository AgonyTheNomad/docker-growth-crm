# Navigate to the project directory
cd C:\Users\jkolt\Desktop\growth_crm-main

# Remove secrets from git tracking but keep them locally
Write-Host "Removing sensitive files from git tracking..." -ForegroundColor Yellow
git rm --cached config/credentials.json
git rm --cached server/.env

# Update .gitignore to exclude these files
$gitignoreContent = Get-Content .gitignore -Raw
$updatedGitignore = $gitignoreContent

# Add credentials.json to .gitignore if not already there
if (-not ($gitignoreContent -match "config/credentials\.json")) {
    $updatedGitignore += "`n# Exclude sensitive credential files`nconfig/credentials.json`n"
}

# Add server/.env to .gitignore if not already there
if (-not ($gitignoreContent -match "server/\.env")) {
    $updatedGitignore += "server/.env`n"
}

# Write the updated .gitignore
Set-Content -Path .gitignore -Value $updatedGitignore

# Create a new commit without the sensitive files
Write-Host "Creating new commit without sensitive files..." -ForegroundColor Green
git add .gitignore
git commit -m "Remove sensitive files and update .gitignore"

# Force push to main (only use force when necessary to overwrite security issues)
Write-Host "Force pushing to GitHub..." -ForegroundColor Cyan
git push -f origin main

Write-Host "`nSecurity fix completed!" -ForegroundColor Green
Write-Host "The sensitive files remain on your local machine but are no longer tracked by Git." -ForegroundColor Green
Write-Host "Future commits will not include these files." -ForegroundColor Green