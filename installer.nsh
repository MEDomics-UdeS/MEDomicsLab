
!macro customInstall
  ; Add your custom installation steps here
  !system "echo 'test' > ${BUILD_RESOURCES_DIR}/customInstall"  ; this works
  
  ; execute the bat file to create the conda environment
  ; ExecWait '"${INSTDIR}\create_conda_env_win.bat"'              ; this does not work
  ; !system '"${INSTDIR}\create_conda_env_win.bat"'               ; this does not work
  ; !system '"${BUILD_RESOURCES_DIR}\create_conda_env_win.bat"'   ; this does not work
  ; ExecWait '"${BUILD_RESOURCES_DIR}\create_conda_env_win.bat"'  ; this does not work

!macroend

Section
  ; Call the custom installation macro
  !insertmacro customInstall
SectionEnd
