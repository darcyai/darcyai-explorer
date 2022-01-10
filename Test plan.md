# Test plan

## List of supported devices
* Darcy camera
* Raspberry pi with coral and camera
* Tinker T
* Coral dev board
* Coral mini

All the following tests must succeed on all supported devices

## Tests

### "Happy path"

All tests are to be run in order

1. Running `docker run -p 5000:5000 --priviledged -v /dev:/dev edgeworx/darcy-ai-explorer` (*You might need to edit the image name*) should start a docker container without crashing
2. Opening a browser to the IP address (port 5000) of the device running the container should display the Explorer UI
  * The default video should be playing
  * The summary should be updating
  * The video should be properly annotated
  * The pipeline steps should be visible
  * The details tab should be closed
3. The video should be "pausable" using the pause icon on the bottom right of the video
  * The video should "freeze" on the last frame
  * The summary should stop updating
4. The video should be playable using the play icon on the bottom right of the video
  * The video should start playing again
  * The summary should update
5. The pipeline steps should be clickable
  * The details tab should show
  * The clicked step should be selected
    * The selected step should have a visual highlight
    * The details tab should show the configuration options of the selected step
6. Clicking the POM section should display the POM if the video is paused
  * Should contain a section for each perceptor
  * The data from the POM should match the data in the summary and on the video frame being displayed (I.E: Number of persons in the scene)
7. If the video is playing, the POM section should prompt the user to pause the video in order to inspect the POM
8. Click on the pipeline steps:
    1. Input step
        * The configuration section should allow you to select the input source
        * 2 video files and live feed options should be available
        * When a video file is selected, an toggle to enable/disable analysing every frame of the video should be available in the configuration
          * Enabling and disabling the option should restart the video feed with the proper play mode
        * Clicking on a different input should restart the video feed with the selected input
        * The event section should display `No events for input step`
        * The code section should display `There is no code for input step`
    2. People perceptor
        * The configuration section should allow to edit the values of all configuration values defined by the perceptor
          * Editing the color, and/or toggling the annotation of the frame should be visible immediatly in the video
        * The event section should display a list of the perceptor events
          * If the video is paused, the list should stop updating
          * If the video is playing the list should update live
          * Clicking on an event should display the event details
            * The event details should be closable
        * The code section should display the code for the input callback of the perceptor
    3. Mask perceptor
        * The configuration section should allow to edit the values of all configuration values defined by the perceptor
        * The event section should display `No events for mask step`
        * The code section should display the code for the input callback of the perceptor
    4. QR Code perceptor
        * The configuration section should allow to edit the values of all configuration values defined by the perceptor
        * The event section should display `No events for qr code step`
        * The code section should display the code for the input callback of the perceptor
    5. Callback
        * The configuration section should display `No configuration for callback step`
        * The event section should display `No events for callback step`
        * The code section should display the code for the perception complete callback
    6. Output
        * The configuration section should allow to edit the values of all configuration values defined by the output stream
          * toggling the display or the format of the timestamp should be immidiately visible on the video
        * The event section should display `No events for output step`
        * The code section should display the code for the input callback of the output stream
  9. The details section should be closable

  ### Errors
  
  1. No coral
    * Running the docker container on a device that is not coral enabled should fail with a human readable error message explaining that a coral is required to run this container

  2. No camera
    * Selecting the live feed if the device does not have a camera should error properly. (To be defined)


