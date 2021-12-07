# Stage 1 - Build the SPA web app
FROM node:14 as build-deps
WORKDIR /usr/src/app/
COPY ./src/ui/package.json ./src/ui/package-lock.json ./
RUN ls -l
RUN npm i -g npm
RUN npm i
COPY ./src/ui/ ./
RUN npm run build

# Stage 2 - Build the pipeline
FROM python:3.7-slim

RUN apt-get update && apt-get install -y --no-install-recommends libsm6 libxext6 libxrender1 libglib2.0-bin \
    && apt-get clean \
    && apt-get install ffmpeg libsm6 libxext6  -y \
    && rm -rf /var/lib/apt/lists/* 
    
RUN python -m pip install --upgrade --no-cache-dir \
    opencv-python

RUN python3 -m pip install --upgrade darcyai-engine
RUN python3 -m pip install --upgrade darcyai-coral
RUN python3 -m pip install --upgrade flask_cors

WORKDIR /src

COPY --from=build-deps /usr/src/app/build ./ui/build/
COPY src/pipeline ./pipeline/
COPY src/main.py ./main.py

ENTRYPOINT ["python3", "-u", "./main.py"]