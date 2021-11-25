FROM edgeworx/darcy-ai-coral-armv7l:dev

RUN python3 -m pip install --upgrade darcyai-engine
RUN python3 -m pip install --upgrade darcyai-coral

WORKDIR /src

COPY src/ ./

ENTRYPOINT ["python3", "-u", "./main.py"]