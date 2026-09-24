import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getProviders } from '../api/vneid'
import { GATEWAY_STATUS } from '../api/types'
import { saveSession } from '../session'

export function ProvidersPage() {
  const navigate = useNavigate()
  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: () => getProviders(),
  })

  const response = providersQuery.data
  const providers = response?.data ?? []
  const statusLabel = response?.status ? GATEWAY_STATUS[response.status] ?? response.status : null

  function choosePack(provider: string, servicePackCode: string) {
    saveSession({ provider, servicePackCode })
    navigate('/register')
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>Nhà cung cấp</h2>
        <p>Danh sách CA và gói dịch vụ từ gateway. Chọn một gói để mang sang form đăng ký chứng thư.</p>
      </header>

      {providersQuery.isLoading ? <p className="notice">Đang tải nhà cung cấp…</p> : null}
      {providersQuery.isError ? <p className="error">{(providersQuery.error as Error).message}</p> : null}

      {response ? (
        <p className={response.status === '01' ? 'notice ok-text' : 'error'}>
          {response.status} — {response.description || statusLabel}
        </p>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nhà cung cấp</th>
              <th>Mã</th>
              <th>Trạng thái</th>
              <th>Gói</th>
              <th>Tháng</th>
              <th>Đơn giá</th>
              <th>Miễn phí</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {providers.flatMap((provider) => {
              const packs = provider.servicePackList.length > 0 ? provider.servicePackList : [null]
              return packs.map((pack, index) => (
                <tr key={`${provider.provider}-${pack?.servicePackCode ?? index}`}>
                  <td>{index === 0 ? provider.providerName || '—' : ''}</td>
                  <td className="mono">{index === 0 ? provider.provider : ''}</td>
                  <td>{index === 0 ? (provider.status === 1 ? 'Hoạt động' : 'Ngừng') : ''}</td>
                  <td>
                    {pack ? (
                      <>
                        <div>{pack.servicePackName || pack.servicePackCode}</div>
                        <div className="mono hint">{pack.servicePackCode}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{pack ? pack.servicePackMonth : '—'}</td>
                  <td>{pack ? pack.unitPrice.toLocaleString('vi-VN') : '—'}</td>
                  <td>{pack ? (pack.free === 1 ? 'Miễn phí' : 'Trả phí') : '—'}</td>
                  <td>
                    {pack ? (
                      <button type="button" className="secondary" onClick={() => choosePack(provider.provider, pack.servicePackCode)}>
                        Chọn gói
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
