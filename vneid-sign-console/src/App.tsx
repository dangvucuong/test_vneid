import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { CertificatesPage } from './pages/CertificatesPage'
import { ConnectionPage } from './pages/ConnectionPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProvidersPage } from './pages/ProvidersPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<ConnectionPage />} />
          <Route path="providers" element={<ProvidersPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route
            path="sign"
            element={<PlaceholderPage title="Ký hash" note="Giai đoạn 4 sẽ tính digest, gửi yêu cầu ký và poll kết quả." />}
          />
          <Route
            path="events"
            element={<PlaceholderPage title="Nhật ký webhook" note="Giai đoạn 5 sẽ đọc GET /api/vneid/events. API đã sẵn trên gateway." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
