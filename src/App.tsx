import React from 'react';
import logo from './logo.svg';
import './App.css';

// var connection = new WebSocket('ws://127.0.0.1:5678');
// connection.onmessage = function (event) {
//   console.log(event.data)
// }

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
