import React, { useEffect, useReducer } from "react"
import "./App.css"
import Controller from "./Controller"
import * as C from "./Controller"
import { Result } from "./Result"
import * as R from "./Result"
import { WSconnection } from "./WebSocket"

/*

Main Application model for the Gamepad project. Contains the core app view and
state management logic.

*/

/* DOMAIN */

type State = {
  url: string
  controller: Controller
  socket: Socket
}

type Socket = Closed | Awaiting | Connected | Closing | Errored
type Awaiting = { status: "Awaiting" }
type Closed = { status: "ClosedSocket" }
type Connected = { status: "Connected"; connection: WebSocket }
type Closing = { status: "Closing"; connection: WebSocket }
type Errored = { status: "SocketError"; error: string }

/* INIT */

const initialState: State = {
  url: "",
  socket: { status: "ClosedSocket" },
  controller: C.initController,
}

/* Action */

type ConnectButtonClicked = { type: "ConnectButtonClicked"; handler: (dispatch: Action) => void }
type ReceivedPayload = { type: "PayloadReceived"; value: Result<Controller> }
type InputUpdated = { type: "InputUpdated"; value: string }
type SuccessfulConnection = { type: "SuccessfulConnection"; value: WebSocket }
type FailedConnection = { type: "FailedConnection"; value: string }
type DisconnectButtonClicked = { type: "DisconnectButtonClicked" }
type SocketClosed = { type: "SocketClosed" }

type Action =
  | ReceivedPayload
  | InputUpdated
  | ConnectButtonClicked
  | DisconnectButtonClicked
  | SuccessfulConnection
  | FailedConnection
  | SocketClosed

/* UPDATE */

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "InputUpdated":
      return { ...state, url: action.value }
    case "ConnectButtonClicked":
      return { ...state, socket: { status: "Awaiting" } }
    case "SuccessfulConnection":
      return { ...state, socket: { status: "Connected", connection: action.value } }
    case "FailedConnection":
      return { ...state, socket: { status: "ClosedSocket" } }
    case "DisconnectButtonClicked":
      switch (state.socket.status) {
        case "Connected":
          return { ...state, socket: { status: "Closing", connection: state.socket.connection } }
        default:
          return state
      }
    case "PayloadReceived":
      switch (action.value.isOk) {
        case true:
          return { ...state, controller: action.value.value }
        case false:
          return state
      }
      break
    case "SocketClosed":
      return { ...state, socket: { status: "ClosedSocket" } }
  }
}

/* VIEW */

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    switch (state.socket.status) {
      case "Awaiting":
        const result = tryCreateSocket(state.url, dispatch)
        switch (result.isOk) {
          case true:
            dispatch({
              type: "SuccessfulConnection",
              value: result.value,
            })
            break
          case false:
            dispatch({ type: "FailedConnection", value: result.error })
        }
        break
      case "Closing":
        state.socket.connection.close()
        dispatch({ type: "SocketClosed" })
    }
  }, [state.socket])

  return (
    <form action="">
      <input
        type="text"
        value={state.url}
        placeholder="wss://homework.rain.gg:8765"
        onChange={e => dispatch({ type: "InputUpdated", value: e.target.value })}
      />
      <button
        type="button"
        onClick={_ => dispatch({ type: "ConnectButtonClicked", handler: dispatch })}
      >
        Connect
      </button>
      <button type="button" onClick={_ => dispatch({ type: "DisconnectButtonClicked" })}>
        Disconnect
      </button>
      <input value={state.controller.sticks[0].position.x.value} />
    </form>
  )
}

const tryCreateSocket = (url: string, dispatch: (_: Action) => void): Result<WebSocket> => {
  try {
    const connection = WSconnection.getInstance(url)
    connection.onopen = function (e: Event) {
      console.log("Opened")
    }
    connection.onmessage = function (e: MessageEvent<string>) {
      dispatch({
        type: "PayloadReceived",
        value: C.parseJSON(JSON.parse(e.data)),
      })
    }
    connection.onclose = function (e: CloseEvent) {
      console.log(e.code)
    }
    return R.ok(connection)
  } catch (e) {
    console.log(e)
    return R.error(e)
  }
}

export default App
