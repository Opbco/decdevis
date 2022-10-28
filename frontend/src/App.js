import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h3 className="typingAnim">
          Edit <code>src/App.js</code> and save to reload.
        </h3>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div className="scrollDown">
        <span className="scrollDown-span"></span>
      </div>
    </div>
  );
}

export default App;
