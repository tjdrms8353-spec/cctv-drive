import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Monitor from './pages/Monitor.jsx'
import Guide from './pages/Guide.jsx'
import FindCar from './pages/FindCar.jsx'
import Report from './pages/Report.jsx'
import MyPage from './pages/MyPage.jsx'
import Admin from './pages/admin/Admin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/find-car" element={<FindCar />} />
          <Route path="/report" element={<Report />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin', 'test_admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
