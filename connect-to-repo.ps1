# Connect to the specific GitHub repository
# Navigate to the project directory
cd C:\Users\jkolt\Desktop\growth_crm-main

# 1. Remove existing Git repository
Write-Host "Removing existing Git repository..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -Path ".git" -ErrorAction SilentlyContinue

# 2. Initialize a new Git repository
Write-Host "Initializing new Git repository..." -ForegroundColor Green
git init

# 3. Add all files to Git
Write-Host "Adding all files to Git..." -ForegroundColor Green
git add .

# 4. Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit"

# 5. Set up remote repository
$repoUrl = "https://github.com/AgonyTheNomad/docker-growth-crm.git"
Write-Host "Adding remote repository: $repoUrl" -ForegroundColor Green
git remote add origin $repoUrl

# 6. Create main branch and push
Write-Host "Creating main branch and pushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "`nRepository connection complete!" -ForegroundColor Cyan
Write-Host "Your local code is now connected to: https://github.com/AgonyTheNomad/docker-growth-crm" -ForegroundColor Green