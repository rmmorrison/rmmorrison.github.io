import './App.css'

import Navigation from './components/Navigation'
import Introduction from './components/Introduction'

function App() {
  return (
    <div className={`App`}>
      <header className={`App-header`}>
        <Navigation />
      </header>
      <main className={`flex flex-col items-center`}>
        <Introduction />
      </main>
    </div>
  )
}

export default App
