
powershell -Command "(Get-Content -Path 'medomics.dev.js') -replace 'runServerAutomatically: false', 'runServerAutomatically: true' | Set-Content -Path 'medomics.dev.js'"

.\utilScripts\pack_auto_win.bat