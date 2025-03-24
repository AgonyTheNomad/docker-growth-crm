# Navigate to the project directory
cd C:\Users\jkolt\Desktop\growth_crm-main

# Check current branch
$currentBranch = git branch --show-current

# If no branch exists (no commits yet)
if ([string]::IsNullOrEmpty($currentBranch)) {
    Write-Host "No commits yet. Creating initial commit..."
    git add .
    git commit -m "Initial commit"
    
    # Try to push to main
    Write-Host "Pushing to main branch..."
    git push -u origin main
    
    if ($LASTEXITCODE -ne 0) {
<<<<<<< HEAD
        # If main push failed, try master branch
=======
        # If main push failed, try master
>>>>>>> parent of 938953b (Update files)
        Write-Host "Push to main failed, trying master branch..."
        git branch -m master
        git push -u origin master
    }
} else {
    # Branch exists
    Write-Host "Current branch: $currentBranch"
    
    # Add any changes
    git add .
    
    # Check if there are changes to commit
    $status = git status --porcelain
    if (-not [string]::IsNullOrEmpty($status)) {
        git commit -m "Update files"
    }
    
    # Push to the current branch
    Write-Host "Pushing to $currentBranch branch..."
    git push -u origin $currentBranch
}

# Make sure we're on the main branch
git branch -M main

# Add all files (including new ones)
Write-Host "Adding all files to git..."
git add .

# Commit changes
Write-Host "Committing changes..."
git commit -m "Sync all files with local machine"

# Force push to main branch
Write-Host "Force pushing to main branch on GitHub..."
git push -f origin main

Write-Host "Force push completed! GitHub repository now matches your local files."
