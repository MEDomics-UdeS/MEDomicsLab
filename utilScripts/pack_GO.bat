cd go_server
go build main.go
cd ..
echo F | xcopy /y /i go_server\main.exe go_executables\server_go_win32.exe