# Navigate to your project directory
cd C:\Users\jkolt\Desktop\growth_crm-main

# Check if .git directory exists
if (Test-Path -Path ".git") {
    Write-Host "Git repository exists."
    
    # Check remote configuration
    $remotes = git remote -v
    Write-Host "Current remote configuration:"
    Write-Host $remotes
    
    # Check current branch
    $branch = git branch --show-current
    Write-Host "Current branch: $branch"
    
    # Check repository status
    Write-Host "`nRepository status:"
    git status
} else {
    Write-Host "No Git repository found at this location."
    Write-Host "Would you like to initialize a Git repository? (y/n)"
    $answer = Read-Host
    
    if ($answer -eq "y") {
        Write-Host "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit"
        
        Write-Host "`nPlease enter your GitHub repository URL:"
        $repoUrl = Read-Host
        
        git remote add origin $repoUrl
        Write-Host "Remote added. You can now push with: git push -u origin main"
    }
}