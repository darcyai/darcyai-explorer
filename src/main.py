from darcyai_engine.perception_object_model import PerceptionObjectModel
from pipeline.explorer_pipeline import ExplorerPipeline
from flask import Flask, send_from_directory, jsonify, stream_with_context, Response
from flask_cors import CORS
import os
import threading

from datetime import timezone
import datetime
import base64

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
    print(perceptor_name, event_name, event_data)
    if perceptor_name not in eventStore:
      eventStore[perceptor_name] = [format_event(event_data)]
    else:
      eventStore[perceptor_name].insert(0, format_event(event_data))
      eventStore[perceptor_name] = eventStore[perceptor_name][:50]
    return None
  return event_handler

pipeline_inputs = [
  {
    "id": 1,
    "title": 'Demo video',
    "file": 'video.mp4',
    "thumbnail": 'video.jpg',
    "type": 'video_file',
    "description": 'People checking in at a school',
  },
  {
    "id": 2,
    "title": 'Demo video',
    "file": 'video_2.mp4',
    "thumbnail": 'video_2.jpg',
    "type": 'video_file',
    "description": 'Spinning earth',
  },
  {
    "id": 3,
    "title": 'Live video',
    "description": 'Live feed from your source video',
    "type": 'live_feed',
    "thumbnail": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAABuCAQAAAADz3AYAAAAnUlEQVR42u3QMQEAAAwCoNm/9Er4CRHIUREFIkWKRKRIkSIRKVIkIkWKFIlIkSJFIlKkSESKFCkSkSJFikSkSJGIFClSJCJFikSkSJEiESlSpEhEihSJSJEiRSJSpEiRiBQpEpEiRYpEpEiRIhEpUiQiRYoUiUiRIhEpUqRIRIoUKRKRIkUiUqRIkYgUKVIkIkWKRKRIkSIRKVLkugc1EABvYNjcFAAAAABJRU5ErkJggg==',
  }
]

current_pipeline_input_id = 1

def get_current_pipeline_input(id):
  for input in pipeline_inputs:
    if input['id'] == id:
      return input
  return None

pipeline_instance = ExplorerPipeline(app, get_current_pipeline_input(current_pipeline_input_id), store_latest_event)

@app.route('/events')
def get_all_events():
  return jsonify(eventStore)

@app.route('/pom')
def get_all_pom():
  return jsonify(pipeline_instance.get_pom().serialize())

@app.route('/events/<string:perceptor_name>')
def get_events(perceptor_name):
  if perceptor_name in eventStore:
    return jsonify(eventStore[perceptor_name])
  elif perceptor_name == 'summary':
    return jsonify(pipeline_instance.get_summary())
  else:
    print('No events for', perceptor_name)
    return jsonify([])


def format_pulse(pom: PerceptionObjectModel):
  # Convert input to base64 image
  input = pom.get_input_data()
  serialized_pom = pom.serialize()
  serialized_pom['input_data'] = "Pixel array that contains the input frame"
  serialized_pom['live_feed'] = "binary jpeg of the latest output frame"
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
  pom = pipeline_instance.get_latest_pom()
  formatted_pulse = format_pulse(pom)
  return jsonify(formatted_pulse)

@app.route('/pulses/history')
def get_historical_pulse():
  poms = pipeline_instance.get_pom_history()
  pulses = []
  for pulse_number, pom in poms.items():
    pulses.append(format_pulse(pom))
  return jsonify(pulses)

@app.route('/inputs')
def get_inputs():
  return jsonify({ "inputs": pipeline_inputs, "current": current_pipeline_input_id })

@app.route('/inputs/<int:input_id>', methods=['PUT'])
def set_input(input_id):
  global current_pipeline_input_id
  if input_id == current_pipeline_input_id:
    return jsonify({ "inputs": pipeline_inputs, "current": current_pipeline_input_id })
  eventStore.clear()
  current_pipeline_input_id = input_id
  pipeline_instance.change_input(get_current_pipeline_input(current_pipeline_input_id))
  return jsonify({ "inputs": pipeline_inputs, "current": current_pipeline_input_id })

# Serve static folder (and nested folders)
# We should be using nginx for this
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
  print("root path")
  print(path)
  try:
    return send_from_directory(ui_build_path, path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

@app.route('/static/js/<path:path>')
def catch_all_js(path):
  print("js path")
  print(path)
  try:
    return send_from_directory(ui_build_path + "/static/js", path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

@app.route('/static/css/<path:path>')
def catch_all_css(path):
  print("css path")
  print(path)
  try:
    return send_from_directory(ui_build_path + "/static/css", path)
  except BaseException:
    return send_from_directory(ui_build_path, 'index.html')

@app.route('/static/media/<path:path>')
def catch_all_media(path):
  print("media path")
  print(path)
  try:
    return send_from_directory(ui_build_path + "/static/media", path)
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