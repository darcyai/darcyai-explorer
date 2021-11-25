all: build run


.PHONY: build
build:
	sudo docker build -t darcy-ai-explorer:0.0.0-dev .

.PHONY: run
run:
	sudo docker run --privileged -p 3456:3456 -p 8080:8080 -v /dev:/dev darcy-ai-explorer:0.0.0-dev