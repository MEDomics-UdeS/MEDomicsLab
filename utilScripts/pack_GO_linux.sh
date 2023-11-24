cd go_server
go build main.go
cd ..
echo F | cp go_server/main renderer/public/server_go_linux
echo F | cp go_server/main go_executables/server_go_linux
