import { Outlet, Link } from 'react-router-dom'

import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Layout */}
      <nav className="p-4 bg-card border-b flex items-center gap-6">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          Dashboard
        </Link>


        <div className="flex gap-3">

          <Button  variant="outline">
            <Link to="/emails">
              Go to Emails
            </Link>
          </Button>

          <Button  variant="outline">
            <Link to="/feedback">
              Go to Feedback
            </Link>
          </Button>
        </div>
      </nav>

      {/* Main View Content Area */}
      <main className="p-6 flex-1 container max-w-7xl">
        <Outlet />
      </main>
    </div>
  )
}

export default App
