<# 
.SYNOPSIS
  Installs Docker Desktop on Windows using winget.

.DESCRIPTION
  This script installs Docker Desktop via the Windows Package Manager (winget).
  It must be run from an elevated PowerShell session. After installation,
  a logout/login or reboot is recommended so Docker Desktop can complete setup.

.NOTES
  - Requires Windows 10 21H2 or later with virtualization enabled.
  - Winget must be available (ships with modern Windows; otherwise install the App Installer package from Microsoft Store).
  - Docker Desktop setup may still prompt to enable WSL2 or Hyper-V if not already configured.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info {
    param([string]$Message)
    Write-Host "[install-docker] $Message"
}

function Ensure-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Info "This script must be run from an elevated PowerShell session (Run as Administrator)."
        exit 1
    }
}

function Ensure-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Info "winget is not available. Install the 'App Installer' from the Microsoft Store and re-run."
        exit 1
    }
}

function Docker-AlreadyInstalled {
    $dockerPath = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Info "Docker Desktop already appears to be installed at: $dockerPath"
        Write-Info "Launch Docker Desktop from the Start menu to finish configuration if needed."
        return $true
    }
    return $false
}

function Install-DockerDesktop {
    Write-Info "Installing Docker Desktop via winget..."
    winget install --exact --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements
    Write-Info "Docker Desktop installation command completed."
}

function Post-Install-Guidance {
    Write-Info "If prompted, enable WSL2 or Hyper-V during Docker Desktop setup."
    Write-Info "Log out or reboot after installation so Docker Desktop can start correctly."
}

Ensure-Administrator
Ensure-Winget
if (-not (Docker-AlreadyInstalled)) {
    Install-DockerDesktop
}
Post-Install-Guidance
