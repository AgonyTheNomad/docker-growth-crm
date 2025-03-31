# Create and update scripts in the correct directory
# This script will fix directory issues and ensure everything is in the right place

# 1. Determine which directory we're in
$currentDir = Get-Location
$currentDirName = Split-Path $currentDir -Leaf

Write-Host "Current directory: $currentDir" -ForegroundColor Cyan

# 2. Create auto-update script in growth_crm_clean directory
if ($currentDirName -eq "growth_crm-main") {
    # We're in the original directory, need to create script in the new one
    $targetDir = "C:\Users\jkolt\Desktop\growth_crm_clean"
    
    if (-not (Test-Path $targetDir)) {
        Write-Host "Growth CRM clean directory not found. Creating it..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $targetDir -Force
    }
} else {
    # Assume we're already in growth_crm_clean or use current directory
    $targetDir = $currentDir
}

Write-Host "Creating scripts in: $targetDir" -ForegroundColor Green

# 3. Create updated auto-update.ps1 in target directory
@"
# PowerShell script to auto-update from GitHub and rebuild Docker container

# Change to your project directory
Set-Location -Path "$targetDir"

# Store current commit hash
`$CurrentHash = git rev-parse HEAD

# Pull the latest changes
git pull

# Get new commit hash
`$NewHash = git rev-parse HEAD

# If there are changes, rebuild and restart the container
if (`$CurrentHash -ne `$NewHash) {
    Write-Host "Changes detected, updating Docker container..."
    docker-compose down
    docker-compose build
    docker-compose up -d
    Write-Host "Update completed at `$(Get-Date)"
} else {
    Write-Host "No changes detected at `$(Get-Date)"
}
"@ | Out-File -FilePath "$targetDir\auto-update.ps1" -Encoding utf8

# 4. Create test-auto-update.ps1 in target directory
@"
# Test the auto-update functionality
# Navigate to your project directory
Set-Location -Path "$targetDir"

# Store the current Git commit hash
`$currentHash = git rev-parse HEAD
Write-Host "Current commit hash: `$currentHash" -ForegroundColor Cyan

# Check for updates
Write-Host "Checking for updates from GitHub..." -ForegroundColor Yellow
git fetch origin main

# Compare local and remote
`$localRef = git rev-parse HEAD
`$remoteRef = git rev-parse origin/main
Write-Host "Local commit: `$localRef" -ForegroundColor Cyan
Write-Host "Remote commit: `$remoteRef" -ForegroundColor Cyan

if (`$localRef -ne `$remoteRef) {
    Write-Host "Updates available! Would pull and rebuild Docker container." -ForegroundColor Green
    
    # Simulate the auto-update process (in test mode - won't actually do anything)
    Write-Host "`nSimulating auto-update process:" -ForegroundColor Magenta
    Write-Host "1. Would pull latest changes from GitHub" -ForegroundColor Magenta
    Write-Host "2. Would rebuild Docker container" -ForegroundColor Magenta
    Write-Host "3. Would restart services" -ForegroundColor Magenta
    
    # Ask if user wants to actually apply the update
    `$apply = Read-Host -Prompt "`nDo you want to actually apply these updates? (y/n)"
    
    if (`$apply -eq "y") {
        Write-Host "`nApplying updates..." -ForegroundColor Green
        git pull origin main
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        Write-Host "Updates applied and Docker container rebuilt!" -ForegroundColor Green
    }
} else {
    Write-Host "No updates available. Your local code is up-to-date with GitHub." -ForegroundColor Green
}

# Check if Task Scheduler is set up
`$task = Get-ScheduledTask -TaskName "GitHub Docker Auto-Update" -ErrorAction SilentlyContinue

if (`$task) {
    Write-Host "`nAuto-update task is configured in Task Scheduler:" -ForegroundColor Green
    Write-Host "Task Name: `$(`$task.TaskName)" -ForegroundColor Cyan
    Write-Host "Status: `$(`$task.State)" -ForegroundColor Cyan
    Write-Host "Next Run Time: `$(`$task.NextRunTime)" -ForegroundColor Cyan
    
    # Check if task is enabled
    if (`$task.State -eq "Ready") {
        Write-Host "The auto-update task is active and will run on schedule." -ForegroundColor Green
    } else {
        Write-Host "The auto-update task exists but is not in 'Ready' state." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nNo auto-update task found in Task Scheduler." -ForegroundColor Yellow
    Write-Host "Would you like to set up the task now? (y/n)" -ForegroundColor Yellow
    `$setup = Read-Host
    
    if (`$setup -eq "y") {
        Write-Host "Setting up Task Scheduler job..." -ForegroundColor Cyan
        
        `$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$targetDir\auto-update.ps1`""
        `$trigger = New-ScheduledTaskTrigger -Daily -At 3am
        `$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable
        
        Register-ScheduledTask -TaskName "GitHub Docker Auto-Update" -Action `$action -Trigger `$trigger -Settings `$settings -Description "Automatically updates Docker container from GitHub changes"
        
        Write-Host "Task Scheduler job created! The auto-update will run daily at 3:00 AM." -ForegroundColor Green
    }
}
"@ | Out-File -FilePath "$targetDir\test-auto-update.ps1" -Encoding utf8

Write-Host "`nBoth scripts have been created/updated:" -ForegroundColor Green
Write-Host "1. $targetDir\auto-update.ps1" -ForegroundColor Cyan
Write-Host "2. $targetDir\test-auto-update.ps1" -ForegroundColor Cyan
Write-Host "`nTo test auto-update, navigate to the correct directory and run:" -ForegroundColor Yellow
Write-Host "cd $targetDir" -ForegroundColor Yellow
Write-Host ".\test-auto-update.ps1" -ForegroundColor Yellow