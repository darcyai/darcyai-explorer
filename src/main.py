from requests.sessions import Request
from pipeline import ExplorerPipeline
from flask import Flask, request, Response, send_from_directory, stream_with_context
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import requests
import os
import threading
from datetime import datetime
import os

#----------------------------------------------------------------------------#
# Configure and run SPA API
#----------------------------------------------------------------------------#
absolutepath = os.path.dirname(os.path.abspath(__file__))
ui_build_path = os.path.join(absolutepath, 'ui/build')
app = Flask('API', static_folder=ui_build_path)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

wsSIDs = []

HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']

def _proxy(url, *args, **kwargs):
  resp = requests.request(
      method=request.method,
      url=url,
      headers={key: value for (key, value) in request.headers if key != 'Host'},
      data=request.get_data(),
      cookies=request.cookies,
      allow_redirects=False)

  excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
  headers = [(name, value) for (name, value) in resp.raw.headers.items()
              if name.lower() not in excluded_headers]

  response = Response(resp.iter_content(chunk_size=10*1024), resp.status_code, headers, content_type=resp.headers['Content-Type'])
  return response

@socketio.on('connect')
def ws_connect():
  wsSIDs.append(request.sid)
  emit('connected', {'data': 'Connected'})
  print('Client connected: ' + request.sid)
  return True

@socketio.on('disconnect')
def ws_disconnect():
  wsSIDs.remove(request.sid)
  print('Client disconnected: ' + request.sid)
  return True

@app.route('/proxy/engine/<path:path>', methods=HTTP_METHODS)
def proxy_engine(*args, **kwargs):
  return _proxy(request.url.replace(request.host_url, 'http://localhost:8080/').replace('/proxy/engine/', '/', 1), *args, **kwargs)

@app.route('/output/live', methods=['GET'])
def proxy_live_view(*args, **kwargs):
  req = requests.get('http://localhost:3456/', stream = True)
  return Response(stream_with_context(req.iter_content(chunk_size=1024)), content_type = req.headers['content-type'])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
  try:
    return send_from_directory(ui_build_path, path)
  except BaseException:
    return app.send_static_file('index.html')

def runAPI():
  port = int(os.environ.get('PORT', 5000))
  socketio.run(app, host='0.0.0.0', port=port)

def send_frame(pom, input_data):
  with app.test_request_context('/'):
    for clientSID in wsSIDs:
      print('Emitting to client: ' + clientSID)
      socketio.emit('frame', {'pom': { 'time' : datetime.utcnow().strftime('%H:%M:%S') }}, room=clientSID)
  return input_data.data.copy()

def main():
  pipeline_instance = ExplorerPipeline(send_frame)
  threading.Thread(target=runAPI, daemon=True).start()
  pipeline_instance.run()

if __name__ == "__main__":
    main()