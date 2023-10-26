package utils

import (
	"fmt"
	"math/rand"
	"net"
	"strconv"
	"strings"
	"time"
)

func random(min, max int) int {
	return rand.Intn(max-min) + min
}

func startUDPServer(port string, progress *map[string]string) {
	PORT := ":" + port

	s, err := net.ResolveUDPAddr("udp4", PORT)
	if err != nil {
		fmt.Println(err)
		return
	}

	connection, err := net.ListenUDP("udp4", s)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer connection.Close()
	buffer := make([]byte, 1024)
	rand.Seed(time.Now().Unix())

	for {
		n, addr, err := connection.ReadFromUDP(buffer)
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Print("-> ", string(buffer[0:n-1]))

		if strings.TrimSpace(string(buffer[0:n])) == "STOP" {
			fmt.Println("Exiting UDP server!")
			return
		}

		// updating the progress map with the new progress value from the python script send via UDP
		(*progress)[strconv.Itoa(addr.Port)] = string(buffer[0:n])

	}
}
