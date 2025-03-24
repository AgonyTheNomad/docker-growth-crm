# Navigate to the project directory
cd C:\Users\jkolt\Desktop\growth_crm-main

# Get current branch name
$currentBranch = git branch --show-current
Write-Host "Current branch is: $currentBranch"

# Push to a branch of the same name
Write-Host "Pushing to branch $currentBranch on GitHub..."
git push -u origin $currentBranch

Write-Host "Push completed! Future git push commands should work without errors."
