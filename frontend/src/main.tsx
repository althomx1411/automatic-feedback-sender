import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import  FeedbackForm  from '@/pages/email/Email'
import Feedbacks from '@/pages/feedbacks/Feedbacks'

import { createBrowserRouter , RouterProvider} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "emails", element: <FeedbackForm /> },
      { path: "feedback", element: <Feedbacks /> }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
