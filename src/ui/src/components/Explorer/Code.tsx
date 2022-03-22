import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { PipelineStep, usePipeline } from '../../providers/Pipeline'
import useHighlight from '../../hooks/useHighlight'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: theme.spacing(10),
    width: '100vw',
    [theme.breakpoints.up('md')]: {
      maxWidth: '49.5vw'
    }
  },
  noCode: {
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[2],
    textTransform: 'uppercase',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  codeSection: {
    padding: theme.spacing(0, 2),
    whiteSpace: 'pre-wrap',
    lineBreak: 'anywhere',
    maxWidth: '100%',
    font: 'normal normal normal 13px/21px Source Code Pro',
    letterSpacing: 0,
    height: 'auto',
    minHeight: '100%'
  }
}))

const codeByStep: { [key: string]: string } = {
  [PipelineStep.CALLBACK]: `
## Usage of the pipeline perception_completion_callback
## In here, we are using the callback to update our multiple counters
## The data is retrieved from the POM where it has been stored by the perceptors

__summary = {
  "inScene": 0,
  "faceMasks": 0,
  "qrCodes": 0
}

__face_mask_perceptor_name = 'facemask'
__qr_code_perceptor_name = 'qrcode'

__previous_mask_results = []
__detected_face_masks = {}
__previous_qr_codes_results = []
__detected_qr_codes = {}

def __update_masks_count(self, pom):
pulse_number = pom.get_pulse_number()
mask_results = pom.get_perceptor(self.__face_mask_perceptor_name)
if len(mask_results) == 0:
    return

for mask_result in mask_results:
    person_id = mask_result.get_person_id()
    if not person_id in self.__previous_mask_results:
        self.__previous_mask_results[person_id] = {
            "count": [1 if mask_result.has_mask() else 0],
            "pulse_number": pulse_number,
            "has_mask": False
        }
        continue

    # Rolling window of 10 frames
    self.__previous_mask_results[person_id]["count"].append(1 if mask_result.has_mask() else 0)
    if len(self.__previous_mask_results[person_id]["count"]) > 10:
        self.__previous_mask_results[person_id]["count"].pop(0)
    
    # Store latest pulse number where we saw the person
    self.__previous_mask_results[person_id]["pulse_number"] = pulse_number

    # If we have seen a mask for at least 6 frames out of the last 10, we consider them wearing a mask
    if sum(self.__previous_mask_results[person_id]["count"]) >= 6:
        # If we haven't counted the mask yet, we update the counter
        if self.__previous_mask_results[person_id]["has_mask"] == False:
            self.__summary["faceMasks"] += 1
            self.__previous_mask_results[person_id]["has_mask"] = True
    # Otherwise, the person is not wearing a mask
    else:
        self.__previous_mask_results[person_id]["has_mask"] = False

# Remove from memory any person we haven't seen in the last 20 pulses
to_delete = []
for person_id in self.__previous_mask_results:
    if self.__previous_mask_results[person_id]["pulse_number"] < pulse_number - 20:
        to_delete.append(person_id)
for person_id in to_delete:
    del self.__previous_mask_results[person_id]


def __update_qr_code_count(pom):
  qr_code_results = pom.get_perceptor(__qrcode_perceptor_name).get_qrcodes()
  __previous_qr_codes_results.append(qr_code_results)
  if len(__previous_qr_codes_results) < 10:
      # Less than 10 pulses, the data is not reliable enough
      return
  __previous_qr_codes_results.pop(0)
  # For the last 10 pulses, check to see which qr code was read for >= 6 pulses
  qr_code_count_per_data = {}
  for frame in __previous_qr_codes_results:
      for qr_code in frame:
          qr_code_data = qr_code.get_qrcode_data()
          if qr_code_data in qr_code_count_per_data:
              qr_code_count_per_data[qr_code_data] += 1
          else:
              qr_code_count_per_data[qr_code_data] = 1
  for qr_code_data, qr_code_cound in qr_code_count_per_data.items():
      if qr_code_cound >= 6:
          if qr_code_data not in __detected_qr_codes:
              __summary["qrCodes"] += 1
              __detected_qr_codes[qr_code_data] = True
  # Remove persons we haven't seen for 10 frames
  to_remove = []
  for qr_code_data in __detected_qr_codes:
      found = False
      for frame in __previous_qr_codes_results:
          if qr_code_data in [qr_code.get_qrcode_data() for qr_code in frame]:
              found = True
              break
      if not found:
          to_remove.append(qr_code_data)
  for qr_code in to_remove:
      __detected_qr_codes.pop(qr_code_data)

def __on_perception_complete(pom):
  # All perceptors are done running
  __summary["inScene"] = pom.get_perceptor(__people_perceptor_name).peopleCount()
  __update_masks_count(pom)
  __update_qr_code_count(pom)
  `,
  [PipelineStep.OUTPUT]: `
## Usage of the pipeline output stream callback
## In here, we are using the callback to send the annotated frame to the output stream

__people_perceptor_name = 'people'

def __output_stream_callback(pom, input_data):
    return pom.get_perceptor(__people_perceptor_name).annotatedFrame()
  `,
  [PipelineStep.PEOPLE]: `
## Usage of the people perceptor input callback
## We don't need to modify the frame, so we are sending the original input

# Passthrough callback
def __perceptor_input_callback(input_data, pom, config):
    return input_data.data.copy()
  `,
  [PipelineStep.QRCODE]: `
## Usage of the qr code perceptor input callback

__people_perceptor_name = 'people'

# Only run QRCode perceptor if we have at least one person in scene
def __qr_code_input_callback(self, input_data, pom, config):
    peeps = pom.get_perceptor(self.__people_perceptor_name).peopleCount()()
    if peeps > 0:
        return input_data.data.copy()
    return None
  `,
  [PipelineStep.MASK]: `
## Usage of the face mask perceptor input callback
## The face mask perceptor takes multiple inputs
## Each input is a sub section of the frame containing only the face
## Each face is retrieved using the people perceptor POM
## Additional transformations (like color conversion) can be done here

__people_perceptor_name = 'people'

def __face_mask_input_callback(input_data, pom, config):
  data = []
  people = pom.get_perceptor(__people_perceptor_name).people()
  for person_id in people:
      person = people[person_id]
      if not person["has_face"]:
          continue

      face = pom.get_perceptor(__people_perceptor_name).faceImage(person_id)
      rgb_face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
      data.append({"input": rgb_face, "person_id": person_id})
  `
}

const Code: React.FC = () => {
  const { selectedStep } = usePipeline()
  const classes = useStyles()
  const code: string|undefined = codeByStep[selectedStep ?? '']
  const highlightRef = useHighlight([selectedStep])

  if (code === undefined) {
    return (
      <div className={classes.root}>
        <div className={classes.noCode}>There is no code for {selectedStep}.</div>
      </div>
    )
  }
  return (
    <div ref={highlightRef} className={clsx(classes.root, 'line-numbers')}>
      <pre className={clsx(classes.codeSection, 'line-numbers')}>
        <code className={clsx('language-python')}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export default Code
