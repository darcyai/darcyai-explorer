all: build run


.PHONY: build
build:
	sudo docker build -t darcy-ai-explorer:0.0.0-dev .

.PHONY: build
build-bundled:
	sudo docker build -t darcy-ai-explorer:0.0.0-dev -f Dockerfile.bundled .

.PHONY: run
run:
	sudo docker run --privileged -p 3456:3456 -p 8080:8080 -p 5000:5000 -v /dev:/dev darcy-ai-explorer:0.0.0-dev

