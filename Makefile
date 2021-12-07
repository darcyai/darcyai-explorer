all: build

.PHONY: deps
deps:
	sudo apt-get update -y
	sudo apt-get install -y libhdf5-dev libhdf5-serial-dev libatlas-base-dev libjasper-dev  libqtgui4  libqt4-test libilmbase-dev libopenexr-dev libavcodec-dev libswscale-dev
	python3 -m pip install -U numpy
	python3 -m pip install imutils==0.5.4
	python3 -m pip install opencv-python==4.5.3.56
	python3 -m pip install -U darcyai-engine
	python3 -m pip install -U darcyai-coral
	python3 -m pip install -U flask_cors

.PHONY: build
build:
	sudo docker build -t darcy-ai-explorer:0.0.0-dev .

.PHONY: build-ui
build-ui:
	cd src/ui && npm i && npm run build

.PHONY: build-bundled
build-bundled:
	sudo docker build -t darcy-ai-explorer:0.0.0-dev -f Dockerfile.bundled .

.PHONY: run
run:
	sudo docker run --privileged -p 3456:3456 -p 8080:8080 -p 5000:5000 -v /dev:/dev darcy-ai-explorer:0.0.0-dev

dev: build-ui build-bundled run

