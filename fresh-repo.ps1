# Create a completely fresh repository without any history
# Navigate to your desktop or another location
cd C:\Users\jkolt\Desktop

# Create a temporary directory for the clean repo
$tempDir = "growth_crm_clean"
New-Item -ItemType Directory -Path $tempDir -Force
cd $tempDir

# Initialize a new git repository
git init

# Create gitignore first to prevent sensitive files from being added
@"
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Sensitive files
config/credentials.json
server/.env

npm-debug.log*
yarn-debug.log*
yarn-error.log*
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

# Copy all files from original repo except .git directory and sensitive files
Write-Host "Copying files from original project (excluding git and sensitive files)..." -ForegroundColor Yellow
Copy-Item -Path "C:\Users\jkolt\Desktop\growth_crm-main\*" -Destination "." -Recurse -Force -Exclude ".git", "config/credentials.json", "server/.env"

# Ensure sensitive directories exist but don't include sensitive files
New-Item -ItemType Directory -Path "config" -Force
New-Item -ItemType Directory -Path "server" -Force

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial clean commit"

# Connect to GitHub repo
git remote add origin https://github.com/AgonyTheNomad/docker-growth-crm.git

# Force push to main
git branch -M main
git push -f origin main

Write-Host "`nClean repository setup complete!" -ForegroundColor Green
Write-Host "The repository has been pushed to GitHub with all sensitive data removed." -ForegroundColor Green
Write-Host "Now you may need to copy your sensitive files back to:" -ForegroundColor Yellow
Write-Host "- $tempDir\config\credentials.json" -ForegroundColor Yellow
Write-Host "- $tempDir\server\.env" -ForegroundColor Yellow
Write-Host "`nConsider using this new clean directory for future development:" -ForegroundColor Cyan
Write-Host "C:\Users\jkolt\Desktop\$tempDir" -ForegroundColor Cyan