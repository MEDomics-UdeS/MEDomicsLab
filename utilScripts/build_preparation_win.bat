
powershell -Command "(Get-Content -Path 'medomics.dev.js') -replace 'runServerAutomatically: false', 'runServerAutomatically: false' | Set-Content -Path 'medomics.dev.js'"

%~dp0pack_GO.bat