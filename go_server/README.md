# Go Installation and Setup

This guide will walk you through the process of installing Go and setting up your environment to start developing Go applications.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Git
- A text editor of your choice (e.g. Visual Studio Code, Sublime Text, Atom)

## Installing Go

1. Download the latest stable release of Go from the official website: https://golang.org/dl/
2. Follow the [installation instructions](https://go.dev/doc/install) for your operating system.

## Setting up your environment

### Linux and macOS

1. Execute these commands in a terminal:
   - `echo 'export PATH=$PATH:/usr/local/go/bin' >> $HOME/.bashrc`
   - `echo 'export GOPATH=$HOME/go' >> $HOME/.bashrc`
   - `echo 'export PATH=$PATH:$GOPATH/bin' >> $HOME/.bashrc`
2. Now close this terminal

### Windows

1. Execute these commands in a cmd prompt:
   - `setx GOPATH %USERPROFILE%\go`
   - `setx PATH "%PATH%;C:\Go\bin"`
2. Close the command prompt

## Verifying your installation

1. Open a new terminal window.
2. Run the command `go version`.
3. If Go is installed correctly, you should see the version number printed to the console.

## Setup for client side

1. Open a new command prompt and go to the `<repo path>/go_server` directory.
2. Run the command `go run main.go` (on first time, it should download requiered libraries and lunch the server)
3. you can terminate the process by pressing `CTRL + C`
4. Then build the app by running `go build main.go` (It should create an executable file -> that file will be run by the client side javascript so modification to .go files must be followed by a rebuild)
   Congratulations, you're now ready to start developing Go applications!
