# Navigate to your project directory
cd C:\Users\jkolt\Desktop\growth_crm-main

# Check if yarn is installed
$yarnInstalled = $null
try {
    $yarnInstalled = yarn --version
} catch {
    $yarnInstalled = $null
}

if (-not $yarnInstalled) {
    Write-Host "Yarn is not installed. Installing yarn..."
    npm install -g yarn
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install yarn. Please run 'npm install -g yarn' manually."
        exit 1
    }
}

Write-Host "Yarn version: $(yarn --version)"

# Remove node_modules and package-lock.json
Write-Host "Cleaning up npm artifacts..."
if (Test-Path -Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path -Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

# Initialize yarn and install dependencies
Write-Host "Initializing yarn and installing dependencies..."
yarn

Write-Host "Yarn setup complete!"