import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from '@/components/templates/Home'
import LiveCanvas from '@/components/templates/LiveCanvas'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: ':id',
    element: <LiveCanvas />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
