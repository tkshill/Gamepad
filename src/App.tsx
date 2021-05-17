import React, { useReducer } from "react"
import "./App.css"
import Controller from "./Controller"
import * as C from "./Controller"
import { Result } from "./Result"

//'ws://127.0.0.1:5678'

/* DOMAIN */

type State = {
  url: string
  controller: Controller
  socket: Socket
}

type Socket = Connected | Errored | Closed
type Closed = { status: "ClosedSocket" }
type Connected = { status: "Connected"; websocket: WebSocket }
type Errored = { status: "SocketError"; error: string }

/* INIT */

const initialState: State = {
  url: "",
  socket: { status: "ClosedSocket" },
  controller: C.initController,
}

/* Action */

type ConnectButtonClicked = {
  type: "ConnectButtonClicked"
  handler: (dispatch: Action) => void
}
type ReceivedPayload = { type: "PayloadReceived"; value: Result<Controller> }
type InputUpdated = { type: "InputUpdated"; value: string }
type DisconnectButtonClicked = { type: "DisconnectButtonClicked" }

type Action =
  | ReceivedPayload
  | InputUpdated
  | ConnectButtonClicked
  | DisconnectButtonClicked

/* UPDATE */

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "InputUpdated":
      return { ...state, url: action.value }
    case "ConnectButtonClicked":
      const newSocket = tryCreateSocket(state.url, action.handler)
      return { ...state, socket: newSocket }
    case "DisconnectButtonClicked":
      switch (state.socket.status) {
        case "ClosedSocket":
        case "SocketError":
          return state
        case "Connected":
          state.socket.websocket.close()
          return { ...state, socket: { status: "ClosedSocket" } }
      }
      break
    case "PayloadReceived":
      switch (action.value.isOk) {
        case true:
          return { ...state, controller: action.value.value }
        case false:
          return state
      }
  }
}

/* VIEW */
function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <form action="">
      <input
        type="text"
        value={state.url}
        placeholder="wss://homework.rain.gg:8765"
        onChange={e =>
          dispatch({ type: "InputUpdated", value: e.target.value })
        }
      />
      <button
        type="button"
        onClick={_ =>
          dispatch({ type: "ConnectButtonClicked", handler: dispatch })
        }
      >
        Connect
      </button>
      <button
        type="button"
        onClick={_ => dispatch({ type: "DisconnectButtonClicked" })}
      >
        Disconnect
      </button>
    </form>
  )
}

const tryCreateSocket = (
  url: string,
  dispatch: (_: Action) => void
): Socket => {
  try {
    var connection = new WebSocket(url)
    connection.onclose = function (_) {
      console.log("Connection closed")
    }
    connection.onmessage = function (e: MessageEvent<string>) {
      dispatch({
        type: "PayloadReceived",
        value: C.parseJSON(JSON.parse(e.data)),
      })
      console.log(e.data, typeof e.data)
    }
    return { status: "Connected", websocket: connection }
  } catch (error) {
    console.log(error)
    return {
      status: "SocketError",
      error: "Could not connect to socket: " + error,
    }
  }
}

export default App
