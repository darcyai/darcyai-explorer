from requests.sessions import Request
from pipeline import ExplorerPipeline
from flask import Flask, request, Response, send_from_directory, stream_with_context
import requests
import os
import threading

#----------------------------------------------------------------------------#
# Configure and run SPA API
#----------------------------------------------------------------------------#
app = Flask('API', static_folder='./ui/build')
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


@app.route('/proxy/engine/<path:path>', methods=HTTP_METHODS)
def proxy_engine(*args, **kwargs):
  return _proxy(request.url.replace(request.host_url, 'http://localhost:8080/').replace('/proxy/engine/', '/', 1), *args, **kwargs)

@app.route('/output/live', methods=['GET'])
def proxy_live_view(*args, **kwargs):
    req = requests.get('http://localhost:3456/', stream = True)
    return Response(stream_with_context(req.iter_content()), content_type = req.headers['content-type'])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
  try:
    return send_from_directory('./ui/build', path)
  except BaseException:
    return app.send_static_file('index.html')

def runAPI():
  port = int(os.environ.get('PORT', 5000))
  app.run(host='0.0.0.0', port=port)


def main():
  x = threading.Thread(target=runAPI, daemon=True)
  x.start()

  #----------------------------------------------------------------------------#
  # Configure and run Darcy AI pipeline
  #----------------------------------------------------------------------------#
  pipeline_instance = ExplorerPipeline()
  pipeline_instance.run()


if __name__ == "__main__":
    main()