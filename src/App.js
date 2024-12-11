import './App.css';

import Navigation from './components/Navigation.js'
import Intro from './components/Intro.js'
import About from './components/About.js'
import Contact from './components/Contact.js'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navigation />
      </header>
      <main className="flex flex-col items-center">
        <Intro />
        <About />
        <Contact />
      </main>
    </div>
  );
}

export default App;
