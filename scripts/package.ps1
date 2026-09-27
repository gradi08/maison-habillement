# Prépare le fichier à envoyer sur l'hébergeur : franck-arnault-deploy.zip
#
# Utilisation (PowerShell, dans le dossier du projet) :
#   powershell -ExecutionPolicy Bypass -File scripts\package.ps1
#
# Contenu du zip : le code enregistré dans Git (dernier commit) + public/build (fichiers compilés).
# Jamais inclus : .env, vendor, node_modules, photos déjà envoyées depuis l'admin.

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

$zip = Join-Path (Get-Location) 'franck-arnault-deploy.zip'

# Des modifications non enregistrées dans Git ne partiraient pas : on prévient.
$pending = git status --porcelain
if ($pending) {
    Write-Warning "Des modifications ne sont pas enregistrées dans Git (commit) : elles NE seront PAS dans le zip."
    Write-Warning "Faites d'abord :  git add -A ; git commit -m `"Mise à jour`""
    $answer = Read-Host "Continuer quand même ? (o/n)"
    if ($answer -ne 'o') { exit 1 }
}

Write-Host "1/3  Compilation du front (npm run build)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "La compilation a échoué." }

Write-Host "2/3  Création du zip à partir du dernier commit..." -ForegroundColor Cyan
if (Test-Path $zip) { Remove-Item $zip -Force }
git archive --format=zip -o $zip HEAD
if ($LASTEXITCODE -ne 0) { throw "git archive a échoué." }

Write-Host "3/3  Ajout de public/build..." -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($zip, 'Update')
try {
    $root = (Resolve-Path 'public\build').Path
    Get-ChildItem $root -Recurse -File | ForEach-Object {
        # Chemins avec des « / » : indispensable pour que le serveur Linux les décompresse correctement.
        $relative = 'public/build/' + $_.FullName.Substring($root.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative) | Out-Null
    }
} finally {
    $archive.Dispose()
}

$size = [math]::Round((Get-Item $zip).Length / 1MB, 1)
Write-Host ""
Write-Host "Prêt : franck-arnault-deploy.zip ($size Mo)" -ForegroundColor Green
Write-Host "Étape suivante : envoyez-le sur le serveur (voir docs/HEBERGEMENT-ALWAYSDATA.md, étape 6)."
