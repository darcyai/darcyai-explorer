#----------------------------------------------------------------------------#
# Imports
#----------------------------------------------------------------------------#

from flask import Flask, render_template, request
import logging
import os
from logging import Formatter, FileHandler

class ExplorerAPI():
  def __init__(self) -> None:    
    self.app = Flask('API')
    self.configure()
  
  def configure(self) -> None:
    self.app.config.from_object('config')
 
    #----------------------------------------------------------------------------#
    # Controllers.
    #----------------------------------------------------------------------------#
    @self.app.route('/')
    def home():
        return render_template('pages/placeholder.home.html')

    # Error handlers.
    @self.app.errorhandler(500)
    def internal_error(error):
        #db_session.rollback()
        return render_template('errors/500.html'), 500


    @self.app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404

    if not self.app.debug:
        file_handler = FileHandler('error.log')
        file_handler.setFormatter(
            Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
        )
        self.app.logger.setLevel(logging.INFO)
        file_handler.setLevel(logging.INFO)
        self.app.logger.addHandler(file_handler)
        self.app.logger.info('errors')


  def run(self):
    #----------------------------------------------------------------------------#
    # Launch.
    #----------------------------------------------------------------------------#
    port = int(os.environ.get('PORT', 5000))
    self.app.run(host='0.0.0.0', port=port)
