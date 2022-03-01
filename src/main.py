from darcyai.perception_object_model import PerceptionObjectModel
from darcyai.input.camera_stream import CameraStream
from pipeline.explorer_pipeline import ExplorerPipeline
from flask import Flask, send_from_directory, jsonify, stream_with_context, Response, request
from flask_cors import CORS
import os
import threading

from datetime import timezone
import datetime
import base64
import logging
import time
import json
import platform

#----------------------------------------------------------------------------#
# Configure and run SPA API
#----------------------------------------------------------------------------#
absolutepath = os.path.dirname(os.path.abspath(__file__))
ui_build_path = os.path.join(absolutepath, 'ui/build')
swagger_path = 'usr/local/lib/python3.9/site-packages/darcyai/swagger'
app = Flask(
  'API',
  static_folder=os.path.join(swagger_path, 'static'),
  template_folder=os.path.join(swagger_path, 'templates')
)
CORS(app)

eventStore = {}

def utc_now():
  dt = datetime.datetime.now(timezone.utc)
  utc_time = dt.replace(tzinfo=timezone.utc)
  return utc_time.timestamp()

def store_latest_event(perceptor_name, event_name):
  def event_handler(event_data):
    def format_event(event_data):
      timestamp = utc_now()
      return {
        'event_type': event_name,
        'payload': event_data,
        'id': event_name + '_' + str(timestamp),
        'timestamp': timestamp
      }
    logging.debug(json.dumps({ 'perceptor': perceptor_name, 'event_name': event_name, 'data': event_data }))
    if perceptor_name not in eventStore:
      eventStore[perceptor_name] = [format_event(event_data)]
    else:
      eventStore[perceptor_name].insert(0, format_event(event_data))
      eventStore[perceptor_name] = eventStore[perceptor_name][:50]
    return None
  return event_handler

def is_mac_osx():
    return platform.system() == "Darwin"

pipeline_inputs = [
  {
    "id": 1,
    "title": 'Demo video',
    "file": 'video.mp4',
    "thumbnail": 'video.jpg',
    "type": 'video_file',
    "description": 'People checking in at a school',
  },
  # {
  #   "id": 2,
  #   "title": 'Demo video',
  #   "file": 'video_2.mp4',
  #   "thumbnail": 'video_2.jpg',
  #   "type": 'video_file',
  #   "description": 'Spinning earth',
  # },
]

video_inputs = CameraStream.get_video_inputs()
default_video_device = video_inputs[0] if len(video_inputs) > 0 else 0

if len(video_inputs) > 0:
  pipeline_inputs.append({
    "id": 3,
    "title": 'Live video',
    "description": 'Live feed from your source video',
    "type": 'live_feed',
    "video_device": default_video_device,
    "thumbnail": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAABuCAQAAAADz3AYAAAAnUlEQVR42u3QMQEAAAwCoNm/9Er4CRHIUREFIkWKRKRIkSIRKVIkIkWKFIlIkSJFIlKkSESKFCkSkSJFikSkSJGIFClSJCJFikSkSJEiESlSpEhEihSJSJEiRSJSpEiRiBQpEpEiRYpEpEiRIhEpUiQiRYoUiUiRIhEpUqRIRIoUKRKRIkUiUqRIkYgUKVIkIkWKRKRIkSIRKVLkugc1EABvYNjcFAAAAABJRU5ErkJggg==',
  })

current_pipeline_input_id = 1
pipeline_instance = None
pipeline_error = None

def set_video_path(id, video_device=default_video_device):
  if video_device == '':
    return
  for input in pipeline_inputs:
    if input['id'] == id:
      if input['type'] == 'live_feed':
        input["video_device"] = video_device

def get_current_pipeline_input(id):
  for input in pipeline_inputs:
    if input['id'] == id:
      return input
  return None

try:
  pipeline_instance = ExplorerPipeline(app, get_current_pipeline_input(current_pipeline_input_id), store_latest_event)
except Exception as e:
  pipeline_error = e
  logging.error(json.dumps({'message': "Pipeline creation failed with: " + str(e)}))

@app.route('/events')
def get_all_events():
  return jsonify(eventStore)

@app.route('/pom')
def get_all_pom():
  if pipeline_instance is None:
    return jsonify({'message': 'Pipeline not initialized'}), 500
  return jsonify(pipeline_instance.get_pom().serialize())

@app.route('/events/<string:perceptor_name>')
def get_events(perceptor_name):
  if perceptor_name in eventStore:
    return jsonify(eventStore[perceptor_name])
  elif perceptor_name == 'summary':
    if pipeline_error is not None:
      return jsonify({ "message": str(pipeline_error) }), 500
    return jsonify(pipeline_instance.get_summary())
  else:
    logging.debug({'message': 'No events for ' + perceptor_name})
    return jsonify([])


def format_pulse(pom: PerceptionObjectModel):
  # Convert input to base64 image
  input = pom.get_input_data()
  serialized_pom = pom.serialize()
  serialized_pom['input_data'] = "Pixel array that contains the input frame"
  serialized_pom['live_feed'] = "Bytes containing the JPEG encoded latest output frame"
  frame = ''
  if pom.live_feed is not None:
    # We've got a completed pom, use the output as frame
    latest_frame_b64 = base64.encodebytes(pom.live_feed) # This is hard coded to be the name of the output stream
    frame = latest_frame_b64.decode('utf-8')
  elif input is not None:
    # We've got an input data, use the output as frame
    frame = input.serialize()['frame'].decode('utf-8')
  return {
    'frame': 'data:image/jpeg;base64,' + frame,
    'pom': serialized_pom,
    'id': serialized_pom['pulse_number']
  }

@app.route('/current_pulse')
def get_current_pulse():
  if pipeline_instance is None:
    return jsonify({'message': 'Pipeline not initialized'}), 500
  pom = pipeline_instance.get_latest_pom()
  if pom is None:
    # Return empty
    return jsonify({
      'frame': pipeline_inputs[2].thumbnail, # Transparent image
      'pom': {},
      'id': 0,
    })
  formatted_pulse = format_pulse(pom)
  return jsonify(formatted_pulse)

@app.route('/pulses/history')
def get_historical_pulse():
  if pipeline_instance is None:
    return jsonify({'message': 'Pipeline not initialized'}), 500
  poms = pipeline_instance.get_pom_history()
  pulses = []
  for _, pom in poms.items():
    pulses.append(format_pulse(pom))
  return jsonify(pulses)

@app.route('/inputs')
def get_inputs():
  return jsonify({ "inputs": pipeline_inputs, "current": current_pipeline_input_id, "videoDevices": video_inputs })

@app.route('/inputs/<int:input_id>', methods=['PUT'])
def set_input(input_id):
  if pipeline_instance is None:
    return jsonify({'message': 'Pipeline not initialized'}), 500
  global current_pipeline_input_id
  body = request.json
  process_all_frames = False
  if body is not None:
    if body["process_all_frames"] is not None:
      process_all_frames = body["process_all_frames"]
    if body["video_device"] is not None:
      set_video_path(input_id, body["video_device"])
  eventStore.clear()
  current_pipeline_input_id = input_id
  pipeline_instance.change_input(get_current_pipeline_input(current_pipeline_input_id), process_all_frames)
  return jsonify({ "inputs": pipeline_inputs, "current": current_pipeline_input_id, "videoDevices": video_inputs })

# Serve static folder (and nested folders)
# We should be using nginx for this
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
  try:
    return send_from_directory(ui_build_path, path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

@app.route('/static/js/<path:path>')
def catch_all_js(path):
  try:
    return send_from_directory(ui_build_path + "/static/js", path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

@app.route('/static/css/<path:path>')
def catch_all_css(path):
  try:
    return send_from_directory(ui_build_path + "/static/css", path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

@app.route('/static/media/<path:path>')
def catch_all_media(path):
  try:
    return send_from_directory(ui_build_path + "/static/media", path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

def runAPI():
  port = int(os.environ.get('PORT', 5005))
  app.run(host='0.0.0.0', port=port, threaded=True)

def main():
  threading.Thread(target=runAPI, daemon=True).start()
  if pipeline_instance is not None:
    try:
        pipeline_instance.run()
    except Exception as e:
      logging.error(json.dumps({'message': "Pipeline run failed with: " + str(e)}))
      while True:
        time.sleep(1)
  else:
    while True:
      time.sleep(1)

if __name__ == "__main__":
    main()