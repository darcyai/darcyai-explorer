import React from 'react'
import { findIndex } from 'lodash'
import Alert from '../components/Alert'

export interface Feedback {
  id: number
  timeout?: NodeJS.Timeout
  message: string
  type: FeedbackType
}

export enum FeedbackType {
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info'
}

declare interface FeedbackState {
  feedbacks: Feedback[]
  nextId: number
}

enum Actions {
  SET = 'set',
  REMOVE = 'remove',
  ADD = 'add'
}

declare interface FeedbackSetAction {
  type: Actions.SET
  data: Feedback[]
}

declare interface FeedbackAddAction {
  type: Actions.ADD
  data: NewFeedback
  dispatch: React.Dispatch<FeedbackAction>
}

declare interface FeedbackRemoveAction {
  type: Actions.REMOVE
  data: Pick<Feedback, 'id'>
}

declare type FeedbackAction = FeedbackAddAction | FeedbackRemoveAction | FeedbackSetAction
declare interface NewFeedback extends Omit<Feedback, 'id' | 'timeout'> {
  timeout?: number
}

declare interface FeedbackInterface {
  feedbacks: Feedback[]
  setFeedbacks: (fb: Feedback[]) => void
  pushFeedback: (f: NewFeedback) => void
  processError: (e: any) => Promise<string>
  pushErrorFeedBack: (e: Error) => void
}

const defaultContextValue: FeedbackInterface = {
  feedbacks: [],
  // feedbacks: [],
  setFeedbacks: (fb: Feedback[]) => {},
  pushErrorFeedBack: (e: Error) => {},
  pushFeedback: (f: NewFeedback) => {},
  processError: async (e: any) => ''
}

export const FeedbackContext = React.createContext(defaultContextValue)

export const useFeedback = (): FeedbackInterface => React.useContext(FeedbackContext)

const AUTO_HIDE = 3000

const initState: (populate: boolean) => FeedbackState = (populate) => ({
  feedbacks: populate ? [{ message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'.split(' ').join('a'), type: FeedbackType.ERROR, id: 9991 }, { message: 'This is a warning', type: FeedbackType.WARNING, id: 9999 }, { message: 'This is an error', type: FeedbackType.ERROR, id: 9998 }, { message: 'This is a success', type: FeedbackType.SUCCESS, id: 9997 }, { message: 'This is an info', type: FeedbackType.INFO, id: 9996 }] : [],
  nextId: 0
})

const reducer = (state: FeedbackState, action: FeedbackAction): FeedbackState => {
  switch (action.type) {
    case Actions.ADD:
      return {
        feedbacks: [...state.feedbacks,
          {
            ...action.data,
            timeout: action.data.type === FeedbackType.ERROR ? undefined : setTimeout(() => {
              action.dispatch({ type: Actions.REMOVE, data: { id: state.nextId } })
            }, (window as any).Cypress != null ? 10000 : action.data.timeout ?? AUTO_HIDE), // Set timeout to 10s in Cypress
            id: state.nextId
          }],
        nextId: state.nextId + 1
      }
    case Actions.REMOVE: {
      const idxToRemove = findIndex(state.feedbacks, f => f.id === action.data.id)
      if (idxToRemove === -1) return state
      return {
        ...state,
        feedbacks: [...state.feedbacks.slice(0, idxToRemove), ...state.feedbacks.slice(idxToRemove + 1)]
      }
    }
    case Actions.SET:
      return {
        ...state,
        feedbacks: action.data
      }
    default:
      return state
  }
}

export const FeedbackProvider: React.FC = (props) => {
  const [state, dispatch] = React.useReducer(reducer, initState(window.location.search.includes('alert')))

  const setFeedbacks = (newFeedbacks: Feedback[]): void => {
    dispatch({ type: Actions.SET, data: newFeedbacks })
  }
  const pushFeedback = (newFeedback: NewFeedback): void => {
    dispatch({ type: Actions.ADD, data: newFeedback, dispatch })
    // Update current state (same array will be used if multiple calls to pushFeedback in the same render loop)
    // state.feedbacks.push({ ...newFeedback, id: state.nextId })
    // state.nextId += 1
  }

  const processError = async (err: any): Promise<string> => {
    // Actual error
    if (err instanceof Error) {
      return err.message
    }
    // API Error / Response
    if (typeof err.json === 'function') {
      const jsonError = await err.json()
      return jsonError.message ?? JSON.stringify(jsonError)
    }
    if (typeof err.text === 'function') {
      return err.text()
    }
    // Default case
    return err.message ?? 'Unknown error'
  }

  const pushErrorFeedBack = (err: any): void => {
    processError(err)
      .then(message => pushFeedback({ message, type: FeedbackType.ERROR }))
      .catch(e => pushFeedback({ message: e.message, type: FeedbackType.ERROR }))
  }

  return (
    <FeedbackContext.Provider value={{
      feedbacks: state.feedbacks,
      processError,
      setFeedbacks,
      pushErrorFeedBack,
      pushFeedback
    }}
    >
      {props.children}
      <FeedbackContext.Consumer>
        {({ feedbacks }) =>
          <Alert
            open={feedbacks.length > 0}
            alerts={feedbacks.map((f, idx) => ({
              ...f,
              onClose: () => dispatch({ type: Actions.REMOVE, data: f })
            }))}
          />}
      </FeedbackContext.Consumer>
    </FeedbackContext.Provider>
  )
}
