from darcyai_engine.perception_object_model import PerceptionObjectModel
from pipeline import ExplorerPipeline
from flask import Flask, send_from_directory, jsonify, stream_with_context, Response
from flask_cors import CORS
import os
import threading
import os

from datetime import timezone
import datetime

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
    if perceptor_name not in eventStore:
      eventStore[perceptor_name] = [format_event(event_data)]
    else:
      eventStore[perceptor_name].insert(0, format_event(event_data))
      eventStore[perceptor_name] = eventStore[perceptor_name][:50]
    return None
  return event_handler

pipeline_instance = ExplorerPipeline(app, store_latest_event)


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
  else:
    return jsonify({})


def format_pulse(pom: PerceptionObjectModel, pulse_number):
  # Convert input to base64 image
  input = pom.get_input_data()
  serialized_pom = pom.serialize()
  serialized_pom.pop('_PerceptionObjectModel__input_data') # Remove input data from serialized pom
  return {
    'frame': 'data:image/jpeg;base64,' + input.serialize()['frame'].decode('utf-8'),
    'pom': serialized_pom,
    'id': pulse_number
  }

@app.route('/current_pulse')
def get_current_pulse():
  pom = pipeline_instance.get_pom()
  return jsonify(format_pulse(pom, pipeline_instance.get_current_pulse_number()))

@app.route('/pulses/history')
def get_historical_pulse():
  poms = pipeline_instance.get_pom_history()
  pulses = []
  for pulse_number, pom in poms.items():
    pulses.append(format_pulse(pom, pulse_number))
  return jsonify(pulses)

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