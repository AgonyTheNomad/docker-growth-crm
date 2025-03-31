# Test the auto-update functionality
# Navigate to your project directory
Set-Location -Path "C:\Users\jkolt\Desktop\growth_crm_clean"

# Store the current Git commit hash
$currentHash = git rev-parse HEAD
Write-Host "Current commit hash: $currentHash" -ForegroundColor Cyan

# Check for updates
Write-Host "Checking for updates from GitHub..." -ForegroundColor Yellow
git fetch origin main

# Compare local and remote
$localRef = git rev-parse HEAD
$remoteRef = git rev-parse origin/main
Write-Host "Local commit: $localRef" -ForegroundColor Cyan
Write-Host "Remote commit: $remoteRef" -ForegroundColor Cyan

if ($localRef -ne $remoteRef) {
    Write-Host "Updates available! Would pull and rebuild Docker container." -ForegroundColor Green
    
    # Simulate the auto-update process (in test mode - won't actually do anything)
    Write-Host "
Simulating auto-update process:" -ForegroundColor Magenta
    Write-Host "1. Would pull latest changes from GitHub" -ForegroundColor Magenta
    Write-Host "2. Would rebuild Docker container" -ForegroundColor Magenta
    Write-Host "3. Would restart services" -ForegroundColor Magenta
    
    # Ask if user wants to actually apply the update
    $apply = Read-Host -Prompt "
Do you want to actually apply these updates? (y/n)"
    
    if ($apply -eq "y") {
        Write-Host "
Applying updates..." -ForegroundColor Green
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
$task = Get-ScheduledTask -TaskName "GitHub Docker Auto-Update" -ErrorAction SilentlyContinue

if ($task) {
    Write-Host "
Auto-update task is configured in Task Scheduler:" -ForegroundColor Green
    Write-Host "Task Name: $($task.TaskName)" -ForegroundColor Cyan
    Write-Host "Status: $($task.State)" -ForegroundColor Cyan
    Write-Host "Next Run Time: $($task.NextRunTime)" -ForegroundColor Cyan
    
    # Check if task is enabled
    if ($task.State -eq "Ready") {
        Write-Host "The auto-update task is active and will run on schedule." -ForegroundColor Green
    } else {
        Write-Host "The auto-update task exists but is not in 'Ready' state." -ForegroundColor Yellow
    }
} else {
    Write-Host "
No auto-update task found in Task Scheduler." -ForegroundColor Yellow
    Write-Host "Would you like to set up the task now? (y/n)" -ForegroundColor Yellow
    $setup = Read-Host
    
    if ($setup -eq "y") {
        Write-Host "Setting up Task Scheduler job..." -ForegroundColor Cyan
        
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File "C:\Users\jkolt\Desktop\growth_crm_clean\auto-update.ps1""
        $trigger = New-ScheduledTaskTrigger -Daily -At 3am
        $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable
        
        Register-ScheduledTask -TaskName "GitHub Docker Auto-Update" -Action $action -Trigger $trigger -Settings $settings -Description "Automatically updates Docker container from GitHub changes"
        
        Write-Host "Task Scheduler job created! The auto-update will run daily at 3:00 AM." -ForegroundColor Green
    }
}
