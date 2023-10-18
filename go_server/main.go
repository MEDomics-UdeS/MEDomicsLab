package main

import (
	"fmt"
	Learning "go_module/blueprints/learning"
	Utils "go_module/utils"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	// Here is where you add the handle functions to the server
	Learning.AddHandleFunc()

	// Here is where you start the server
	c := cors.Default()
	handler := c.Handler(http.DefaultServeMux)
	port := Utils.GetDotEnvVariable("PORT")
	fmt.Println("Server is listening on :" + port + "...")
	err := http.ListenAndServe(":"+port, handler)
	if err != nil {
		return
	}
}
