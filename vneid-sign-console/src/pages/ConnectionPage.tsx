import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getTokenStatus, login, refreshToken } from '../api/vneid'
import type { TokenResponse } from '../api/types'

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remain = seconds % 60
  return [hours, minutes, remain].map((part) => String(part).padStart(2, '0')).join(':')
}

export function ConnectionPage() {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)
  const [tick, setTick] = useState(() => Date.now())

  const statusQuery = useQuery({
    queryKey: ['token-status'],
    queryFn: getTokenStatus,
    refetchInterval: 15_000,
  })

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (result) => {
      setNotice(result.accessToken ? 'Đã nhận access token từ RSVAN.' : result.message ?? 'Login không trả token.')
      await queryClient.invalidateQueries({ queryKey: ['token-status'] })
    },
    onError: (error: Error) => setNotice(error.message),
  })

  const refreshMutation = useMutation({
    mutationFn: refreshToken,
    onSuccess: async (result: TokenResponse) => {
      setNotice(result.accessToken ? 'Đã làm mới access token.' : result.description ?? result.message ?? 'Refresh không trả token.')
      await queryClient.invalidateQueries({ queryKey: ['token-status'] })
    },
    onError: (error: Error) => setNotice(error.message),
  })

  const status = statusQuery.data
  const fetchedAt = statusQuery.dataUpdatedAt
  const elapsed = fetchedAt ? Math.floor((tick - fetchedAt) / 1000) : 0
  const accessLeft = status?.expiresInSeconds != null ? status.expiresInSeconds - elapsed : null
  const refreshLeft = status?.refreshTokenExpiresInSeconds != null ? status.refreshTokenExpiresInSeconds - elapsed : null
  const busy = loginMutation.isPending || refreshMutation.isPending

  return (
    <section className="page">
      <header className="page-header">
        <h2>Kết nối gateway</h2>
        <p>
          Console gọi <code>http://localhost:5244</code>. Tài khoản RSVAN nằm trên gateway, trang này chỉ kích hoạt login và refresh.
        </p>
      </header>

      <div className="card-row">
        <article className="card">
          <p className="label">Trạng thái</p>
          <p className={status?.authenticated ? 'value ok' : 'value'}>
            {statusQuery.isLoading ? 'Đang kiểm tra…' : status?.authenticated ? 'Đã xác thực' : 'Chưa có token'}
          </p>
          {status?.message ? <p className="hint">{status.message}</p> : null}
          {statusQuery.isError ? <p className="error">{(statusQuery.error as Error).message}</p> : null}
        </article>
        <article className="card">
          <p className="label">Access token còn</p>
          <p className="value mono">{accessLeft == null ? '—' : formatDuration(accessLeft)}</p>
        </article>
        <article className="card">
          <p className="label">Refresh token còn</p>
          <p className="value mono">{refreshLeft == null ? '—' : formatDuration(refreshLeft)}</p>
        </article>
      </div>

      <div className="actions">
        <button type="button" onClick={() => loginMutation.mutate()} disabled={busy}>
          {loginMutation.isPending ? 'Đang đăng nhập…' : 'Login'}
        </button>
        <button type="button" className="secondary" onClick={() => refreshMutation.mutate()} disabled={busy || !status?.authenticated}>
          {refreshMutation.isPending ? 'Đang làm mới…' : 'Refresh'}
        </button>
        <button type="button" className="ghost" onClick={() => statusQuery.refetch()} disabled={statusQuery.isFetching}>
          Kiểm tra lại
        </button>
      </div>

      {notice ? <p className="notice">{notice}</p> : null}
    </section>
  )
}
