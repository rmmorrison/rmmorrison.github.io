import './App.css'

import Navigation from './components/Navigation'
import Introduction from './components/Introduction'
import About from './components/About'
import Contact from "./components/Contact.tsx";

function App() {
  return (
    <div className={`App`}>
      <header className={`App-header`}>
        <Navigation />
      </header>
      <main className={`flex flex-col items-center`}>
        <Introduction />
        <About />
        <Contact />
      </main>
    </div>
  )
}

export default App
