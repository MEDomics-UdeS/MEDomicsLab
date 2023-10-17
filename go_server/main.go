package main

import (
	"fmt"
	"github.com/rs/cors"
	Learning "go_module/blueprints/learning"
	Utils "go_module/utils"
	"net/http"
)

func main() {
	Learning.AddHandleFunc()
	c := cors.Default()
	handler := c.Handler(http.DefaultServeMux)
	port := Utils.GetDotEnvVariable("PORT")
	fmt.Println("Server is listening on :" + port + "...")
	err := http.ListenAndServe(":"+port, handler)
	if err != nil {
		return
	}
}
