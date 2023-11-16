cd go_server
go build main.go
cd ..
echo F | xcopy /y /i go_server/main.exe renderer/public/server_go
