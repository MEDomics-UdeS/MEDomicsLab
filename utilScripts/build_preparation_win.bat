
powershell -Command "(Get-Content -Path 'medomics.dev.js') -replace 'runServerAutomatically: false', 'runServerAutomatically: true' | Set-Content -Path 'medomics.dev.js'"

%~dp0pack_GO.bat