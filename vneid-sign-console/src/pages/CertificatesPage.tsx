import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { listCertificates } from '../api/vneid'
import { GATEWAY_STATUS, type CredentialInfoItem } from '../api/types'
import { loadSession, saveSession } from '../session'

function flowLabel(flow: number) {
  if (flow === 1) {
    return 'Qua VNeID'
  }
  if (flow === 2) {
    return 'Qua CCCD và khuôn mặt'
  }
  return String(flow)
}

function certStatusLabel(status: number) {
  if (status === 1) {
    return 'Đang hoạt động'
  }
  return String(status)
}

export function CertificatesPage() {
  const stored = loadSession()
  const [citizenPid, setCitizenPid] = useState(stored.citizenPid)
  const [queryPid, setQueryPid] = useState('')
  const [selectedId, setSelectedId] = useState(stored.credentialID)
  const [formError, setFormError] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ['certificates', queryPid],
    queryFn: () => listCertificates(queryPid),
    enabled: queryPid.length > 0,
  })

  const response = listQuery.data
  const credentials = response?.data?.credentialInfos ?? []
  const statusLabel = response?.status ? (GATEWAY_STATUS[response.status] ?? response.status) : null

  function onSearch(event: FormEvent) {
    event.preventDefault()
    const pid = citizenPid.trim()
    if (!pid) {
      setFormError('Nhập CCCD.')
      return
    }
    setFormError(null)
    saveSession({ citizenPid: pid })
    setQueryPid(pid)
  }

  function chooseCredential(item: CredentialInfoItem) {
    const credentialID = item.credentialID || item.cert.serialNumber || ''
    saveSession({ citizenPid: queryPid || citizenPid.trim(), credentialID })
    setSelectedId(credentialID)
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>Danh sách CCTS</h2>
        <p>Tra các chứng thư đã kích hoạt, còn hiệu lực theo số định danh. Chọn một chứng thư để dùng khi ký.</p>
      </header>

      <form className="lookup" onSubmit={onSearch}>
        <label>
          CCCD
          <input value={citizenPid} onChange={(event) => setCitizenPid(event.target.value)} />
        </label>
        <button type="submit" disabled={listQuery.isFetching}>
          {listQuery.isFetching ? 'Đang tra cứu…' : 'Tra cứu'}
        </button>
      </form>

      {formError ? <p className="error">{formError}</p> : null}
      {listQuery.isError ? <p className="error">{(listQuery.error as Error).message}</p> : null}
      {response ? (
        <p className={response.status === '01' ? 'notice ok-text' : 'error'}>
          {response.status} — {response.description || statusLabel}
        </p>
      ) : null}
      {selectedId ? <p className="notice">Chứng thư đang chọn: <span className="mono">{selectedId}</span></p> : null}

      {response?.status === '01' && credentials.length === 0 ? (
        <p className="notice">Không có chứng thư đang hoạt động cho CCCD này.</p>
      ) : null}

      <div className="cert-list">
        {credentials.map((item) => {
          const active = selectedId === (item.credentialID || item.cert.serialNumber)
          return (
            <article key={item.credentialID || item.cert.serialNumber} className={active ? 'card cert-card selected' : 'card cert-card'}>
              <p className="label">Serial / credentialID</p>
              <p className="mono">{item.cert.serialNumber || item.credentialID}</p>
              <dl>
                <div>
                  <dt>Chủ thể</dt>
                  <dd>{item.cert.subjectDN || '—'}</dd>
                </div>
                <div>
                  <dt>Nhà phát hành</dt>
                  <dd>{item.cert.issuerDN || '—'}</dd>
                </div>
                <div>
                  <dt>Hiệu lực</dt>
                  <dd>
                    {item.cert.validFrom || '—'} — {item.cert.validTo || '—'}
                  </dd>
                </div>
                <div>
                  <dt>Nhà cung cấp</dt>
                  <dd>{item.cert.provider || '—'}</dd>
                </div>
                <div>
                  <dt>Trạng thái chứng thư</dt>
                  <dd>{certStatusLabel(item.cert.status)}</dd>
                </div>
                <div>
                  <dt>Luồng xác thực</dt>
                  <dd>{flowLabel(item.cert.flow)}</dd>
                </div>
                <div>
                  <dt>Khóa</dt>
                  <dd>
                    {item.key.status || '—'} · {item.key.len || '—'} bit
                    {item.key.algo?.length ? ` · ${item.key.algo.join(', ')}` : ''}
                  </dd>
                </div>
              </dl>
              <button type="button" className="secondary" onClick={() => chooseCredential(item)}>
                Dùng chứng thư này
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
