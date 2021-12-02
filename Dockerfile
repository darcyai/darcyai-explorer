# Stage 1 - Build the SPA web app
FROM node:14 as build-deps
WORKDIR /usr/src/app/
COPY ./src/ui/package.json ./src/ui/package-lock.json ./
RUN ls -l
RUN npm i
COPY ./src/ui/ ./
RUN npm run build

# Stage 2 - Build the pipeline
FROM edgeworx/darcy-ai-coral-armv7l:dev

RUN python3 -m pip install --upgrade darcyai-engine
RUN python3 -m pip install --upgrade darcyai-coral
RUN python3 -m pip install --upgrade flask_cors

WORKDIR /src

COPY --from=build-deps /usr/src/app/build ./ui/build/
COPY src/pipeline ./pipeline/
COPY src/main.py ./main.py

ENTRYPOINT ["python3", "-u", "./main.py"]