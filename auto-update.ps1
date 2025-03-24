# PowerShell script to auto-update from GitHub and rebuild Docker container

# Change to your project directory
Set-Location -Path "C:\Users\jkolt\Desktop\growth_crm-main"

# Store current commit hash
$CurrentHash = git rev-parse HEAD

# Pull the latest changes
git pull

# Get new commit hash
$NewHash = git rev-parse HEAD

# If there are changes, rebuild and restart the container
if ($CurrentHash -ne $NewHash) {
    Write-Host "Changes detected, updating Docker container..."
    docker-compose down
    docker-compose build
    docker-compose up -d
    Write-Host "Update completed at $(Get-Date)"
} else {
    Write-Host "No changes detected at $(Get-Date)"
}