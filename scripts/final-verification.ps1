$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$clientDir = Join-Path $repoRoot 'emotional-aquarium-client'
$serverDir = Join-Path $repoRoot 'emotional-aquarium-server'

Write-Host '[1/3] Client checks' -ForegroundColor Cyan
Push-Location $clientDir
npm run typecheck
npm run lint
npm run test:coverage
Pop-Location

Write-Host '[2/3] Server checks' -ForegroundColor Cyan
Push-Location $serverDir
npm run typecheck
npm run lint
npm run test:coverage

Write-Host '[3/3] Server E2E checks' -ForegroundColor Cyan
npm run test:e2e
Pop-Location

Write-Host 'Final verification completed successfully.' -ForegroundColor Green
