from pipeline import ExplorerPipeline
from flask import Flask, send_from_directory
import os
import threading

#----------------------------------------------------------------------------#
# Configure and run SPA API
#----------------------------------------------------------------------------#
app = Flask('API', static_folder='./ui/build')

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