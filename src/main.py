from pipeline import ExplorerPipeline
from api import ExplorerAPI

pipeline_instance = ExplorerPipeline()
pipeline_instance.run()

http_server_instance = ExplorerAPI()
http_server_instance.run()