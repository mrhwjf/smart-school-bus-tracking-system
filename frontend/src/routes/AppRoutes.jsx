import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import Students from '../pages/admin/Students'
import Drivers from '../pages/admin/Drivers'
import Buses from '../pages/admin/Buses'
import RoutesPage from '../pages/admin/RoutesPage'
import Schedules from '../pages/admin/Schedules'
import Assignments from '../pages/admin/Assignments'
import MessagesPage from '../pages/admin/MessagesPage'
import Tracking from '../pages/admin/Tracking'
import ErrorPage from '../components/ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'students', element: <Students /> },
      { path: 'drivers', element: <Drivers /> },
      { path: 'buses', element: <Buses /> },
      { path: 'routes', element: <RoutesPage /> },
      { path: 'schedules', element: <Schedules /> },
      { path: 'assignments', element: <Assignments /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'tracking', element: <Tracking /> },
    ],
  },
])

export default router
