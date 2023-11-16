cd go_server
go build main.go
cd ..
echo F | cp go_server/main renderer/public/server_go
