
!macro customInstall
  ; Add your custom installation steps here
  !system "echo 'test' > ${BUILD_RESOURCES_DIR}/customInstall"
  ExecWait '"$INSTDIR\create_conda_env_win.bat"'
  ExecWait '"${BUILD_RESOURCES_DIR}\create_conda_env_win.bat"'
  !system '"$INSTDIR\create_conda_env_win.bat"'
  !system '"${BUILD_RESOURCES_DIR}\create_conda_env_win.bat"'

!macroend

Section
  ; Call the custom installation macro
  !insertmacro customInstall
SectionEnd
