from pipeline import ExplorerPipeline
from flask import Flask, request, send_from_directory, jsonify, stream_with_context, Response
import requests
from flask_cors import CORS
import os
import threading
import os
import base64
import cv2
import numpy as np

#----------------------------------------------------------------------------#
# Configure and run SPA API
#----------------------------------------------------------------------------#
absolutepath = os.path.dirname(os.path.abspath(__file__))
ui_build_path = os.path.join(absolutepath, 'ui/build')
swagger_path = 'usr/local/lib/python3.9/site-packages/darcyai_engine/swagger'
app = Flask(
  'API',
  static_folder=os.path.join(swagger_path, 'static'),
  template_folder=os.path.join(swagger_path, 'templates')
)
CORS(app)

eventStore = {}

def store_latest_event(event_name):
  def event_handler(event_data):
    if event_name not in eventStore:
      eventStore[event_name] = [event_data]
    else:
      eventStore[event_name].append(event_data)
      eventStore[event_name] = eventStore[event_name][-20:]
    return None
  return event_handler

pipeline_instance = ExplorerPipeline(app, store_latest_event)


@app.route('/events')
def get_all_events():
  return jsonify(eventStore)

@app.route('/pom')
def get_all_pom():
  return jsonify(pipeline_instance.get_pom().serialize())

@app.route('/events/<string:event_name>')
def get_events(event_name):
  if event_name in eventStore:
    return jsonify(eventStore[event_name])
  else:
    return jsonify([])

@app.route('/current_pulse')
def get_current_pulse():
  return jsonify({ 'currentPulseNumber': pipeline_instance.get_current_pulse_number() })

@app.route('/pulse/<int:pulse_number>')
def get_historical_pulse(pulse_number):
  latest_pulse = pipeline_instance.get_current_pulse_number()
  if pulse_number > latest_pulse:
    pulse_number = latest_pulse
  if pulse_number < latest_pulse - 49:
    pulse_number = 0
  # input = pipeline_instance.get_historical_input(pulse_number)
  # pom = pipeline_instance.get_historical_pom(pulse_number)
  input = pipeline_instance.get_latest_input()
  pom = pipeline_instance.get_pom()

  # Convert input to base64 image
  encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 100]
  img_encode = cv2.imencode(".jpg", input.data.copy(), encode_param)[1]
  frame = np.array(img_encode).tobytes()
  return jsonify({
    'data': {
      'frame': base64.b64encode(frame).decode('utf-8'),
      'timestamp': input.timestamp
    },
    'pom': pom.serialize(),
    'pulseNumber': pulse_number
  })

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
  try:
    return send_from_directory(ui_build_path, path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

def runAPI():
  port = int(os.environ.get('PORT', 5000))
  app.run(host='0.0.0.0', port=port, threaded=True)

def main():
  threading.Thread(target=runAPI, daemon=True).start()
  pipeline_instance.run()

if __name__ == "__main__":
    main()