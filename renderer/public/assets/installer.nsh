!macro customInstall
   Section "MyApp"
    SetOutPath "$INSTDIR"
    ; Perform installation tasks here
    ; print "Hello World" to the console
    ExecShell "" "cmd.exe" "/c setx TEST_VAR test"
    ; Execute shell script after installation
    ExecShell "" "cmd.exe" "/c ./test.bat"
  SectionEnd
!macroend