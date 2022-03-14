all: build

.PHONY: deps
deps:
	echo "deb https://packages.cloud.google.com/apt coral-edgetpu-stable main" | sudo tee /etc/apt/sources.list.d/coral-edgetpu.list
	echo "deb https://packages.cloud.google.com/apt coral-cloud-stable main" | sudo tee /etc/apt/sources.list.d/coral-cloud.list
	curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
	sudo apt-get update -y
	sudo apt-get install -y libzbar0 libedgetpu1-max python3-pycoral libhdf5-dev libhdf5-serial-dev libatlas-base-dev libjasper-dev  libqtgui4  libqt4-test libilmbase-dev libopenexr-dev libavcodec-dev libswscale-dev
	python3 -m pip install -U numpy
	python3 -m pip install imutils==0.5.4
	python3 -m pip install opencv-python==4.5.3.56
	python3 -m pip install -U darcyai
	python3 -m pip install -U flask_cors
	python3 -m pip install -U pyzbar==0.1.8

.PHONY: build
build:
	sudo docker build -t edgeworx/darcy-ai-explorer:0.0.0-dev .

.PHONY: build-ui
build-ui:
	cd src/ui && npm i && npm run build

.PHONY: build-bundled
build-bundled:
	sudo docker build -t edgeworx/darcy-ai-explorer:0.0.0-dev -f Dockerfile.bundled .

.PHONY: run
run:
	sudo docker run --privileged -p 5001:5005 -v /dev:/dev edgeworx/darcy-ai-explorer:0.0.0-dev

dev: build-ui build-bundled run

