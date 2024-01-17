cd go_server
go build main.go
cd ..
echo F | cp -p go_server/main renderer/public/server_go_linux
echo F | cp -p go_server/main go_executables/server_go_linux
chmod +x go_executables/server_go_linux
