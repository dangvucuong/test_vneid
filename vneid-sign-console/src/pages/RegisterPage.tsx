import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { getProviders, registerCertificate } from '../api/vneid'
import { GATEWAY_STATUS, type RegisterCertificateRequest, type UserInfo } from '../api/types'
import { loadSession, saveSession } from '../session'

const datePattern = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/

const emptyUser = (citizenPid: string): UserInfo => ({
  fullName: '',
  birthDate: '',
  citizenPid,
  issuingAuthority: '',
  dateOfIssue: '',
  gender: '',
  phone: '',
  email: '',
  nationalityCode: 'VN',
  permanentAddress: '',
  permanentVillageText: '',
  permanentCityText: '',
  livingPlaceAddress: '',
  livingPlaceVillageText: '',
  livingPlaceCityText: '',
  idCardExpireDate: '',
})

function validate(form: RegisterCertificateRequest): string | null {
  if (!form.provider) {
    return 'Chọn nhà cung cấp.'
  }
  if (!form.servicePackCode) {
    return 'Chọn gói dịch vụ.'
  }
  if (!form.originatorCode.trim()) {
    return 'Nhập originatorCode.'
  }
  if (!form.userInfo.citizenPid.trim()) {
    return 'CitizenPid là bắt buộc.'
  }

  const dates: Array<[string, string | null | undefined]> = [
    ['Ngày sinh', form.userInfo.birthDate],
    ['Ngày cấp', form.userInfo.dateOfIssue],
    ['Ngày hết hạn CCCD', form.userInfo.idCardExpireDate],
  ]
  for (const [label, value] of dates) {
    if (value && value.trim() && !datePattern.test(value.trim())) {
      return `${label} phải theo dạng DD/MM/YYYY.`
    }
  }
  return null
}

export function RegisterPage() {
  const stored = loadSession()
  const [form, setForm] = useState<RegisterCertificateRequest>({
    provider: stored.provider,
    servicePackCode: stored.servicePackCode,
    originatorCode: stored.originatorCode || 'CA2_SignPlatform',
    userInfo: emptyUser(stored.citizenPid),
  })
  const [clientError, setClientError] = useState<string | null>(null)
  const [resultText, setResultText] = useState(
    stored.transactionCode
      ? `Giao dịch đã lưu: ${stored.transactionCode}${stored.lastStatus ? ` (${stored.lastStatus} — ${stored.lastDescription})` : ''}`
      : '',
  )

  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: () => getProviders(),
  })

  const providers = providersQuery.data?.data ?? []
  const selectedProvider = providers.find((item) => item.provider === form.provider)
  const packs = selectedProvider?.servicePackList ?? []

  const registerMutation = useMutation({
    mutationFn: (body: RegisterCertificateRequest) => registerCertificate(body),
    onSuccess: (result) => {
      const transactionCode = result.data?.transactionCode ?? ''
      saveSession({
        citizenPid: form.userInfo.citizenPid.trim(),
        provider: form.provider,
        servicePackCode: form.servicePackCode,
        originatorCode: form.originatorCode.trim(),
        transactionCode,
        lastStatus: result.status ?? '',
        lastDescription: result.description ?? '',
      })
      const statusLabel = result.status ? GATEWAY_STATUS[result.status] ?? '' : ''
      setResultText(
        `${result.status ?? '—'} — ${result.description || statusLabel}${transactionCode ? `. transactionCode: ${transactionCode}` : ''}`,
      )
    },
    onError: (error: Error) => setResultText(error.message),
  })

  function updateUser(patch: Partial<UserInfo>) {
    setForm((current) => ({ ...current, userInfo: { ...current.userInfo, ...patch } }))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const error = validate(form)
    setClientError(error)
    if (error) {
      return
    }
    registerMutation.mutate({
      ...form,
      originatorCode: form.originatorCode.trim(),
      userInfo: {
        ...form.userInfo,
        citizenPid: form.userInfo.citizenPid.trim(),
        nationalityCode: form.userInfo.nationalityCode.trim() || 'VN',
      },
    })
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>Đăng ký CCTS</h2>
        <p>Bước gửi thông tin định danh. Theo dõi kích hoạt trên VNeID nằm ở giai đoạn sau.</p>
      </header>

      {providersQuery.isError ? <p className="error">{(providersQuery.error as Error).message}</p> : null}

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Nhà cung cấp
          <select
            value={form.provider}
            onChange={(event) =>
              setForm((current) => ({ ...current, provider: event.target.value, servicePackCode: '' }))
            }
          >
            <option value="">Chọn nhà cung cấp</option>
            {providers.map((provider) => (
              <option key={provider.provider} value={provider.provider}>
                {provider.providerName || provider.provider} ({provider.provider})
              </option>
            ))}
          </select>
        </label>
        <label>
          Gói dịch vụ
          <select
            value={form.servicePackCode}
            onChange={(event) => setForm((current) => ({ ...current, servicePackCode: event.target.value }))}
          >
            <option value="">Chọn gói</option>
            {packs.map((pack) => (
              <option key={pack.servicePackCode} value={pack.servicePackCode}>
                {pack.servicePackName || pack.servicePackCode}
                {pack.free === 1 ? ' — miễn phí' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          originatorCode
          <input
            value={form.originatorCode}
            onChange={(event) => setForm((current) => ({ ...current, originatorCode: event.target.value }))}
          />
        </label>
        <label>
          Họ tên
          <input value={form.userInfo.fullName} onChange={(event) => updateUser({ fullName: event.target.value })} />
        </label>
        <label>
          Ngày sinh
          <input
            placeholder="DD/MM/YYYY"
            value={form.userInfo.birthDate}
            onChange={(event) => updateUser({ birthDate: event.target.value })}
          />
        </label>
        <label>
          CCCD
          <input
            value={form.userInfo.citizenPid}
            onChange={(event) => updateUser({ citizenPid: event.target.value })}
          />
        </label>
        <label>
          Nơi cấp
          <input
            value={form.userInfo.issuingAuthority ?? ''}
            onChange={(event) => updateUser({ issuingAuthority: event.target.value })}
          />
        </label>
        <label>
          Ngày cấp
          <input
            placeholder="DD/MM/YYYY"
            value={form.userInfo.dateOfIssue ?? ''}
            onChange={(event) => updateUser({ dateOfIssue: event.target.value })}
          />
        </label>
        <label>
          Giới tính
          <input value={form.userInfo.gender ?? ''} onChange={(event) => updateUser({ gender: event.target.value })} />
        </label>
        <label>
          Điện thoại
          <input value={form.userInfo.phone ?? ''} onChange={(event) => updateUser({ phone: event.target.value })} />
        </label>
        <label>
          Email
          <input value={form.userInfo.email ?? ''} onChange={(event) => updateUser({ email: event.target.value })} />
        </label>
        <label>
          Quốc tịch
          <input
            value={form.userInfo.nationalityCode}
            onChange={(event) => updateUser({ nationalityCode: event.target.value })}
          />
        </label>
        <label>
          Ngày hết hạn CCCD
          <input
            placeholder="DD/MM/YYYY"
            value={form.userInfo.idCardExpireDate ?? ''}
            onChange={(event) => updateUser({ idCardExpireDate: event.target.value })}
          />
        </label>
        <label className="span-2">
          Địa chỉ thường trú
          <input
            value={form.userInfo.permanentAddress ?? ''}
            onChange={(event) => updateUser({ permanentAddress: event.target.value })}
          />
        </label>
        <label>
          Phường/xã thường trú
          <input
            value={form.userInfo.permanentVillageText ?? ''}
            onChange={(event) => updateUser({ permanentVillageText: event.target.value })}
          />
        </label>
        <label>
          Tỉnh/thành thường trú
          <input
            value={form.userInfo.permanentCityText ?? ''}
            onChange={(event) => updateUser({ permanentCityText: event.target.value })}
          />
        </label>
        <label className="span-2">
          Nơi ở hiện tại
          <input
            value={form.userInfo.livingPlaceAddress ?? ''}
            onChange={(event) => updateUser({ livingPlaceAddress: event.target.value })}
          />
        </label>
        <label>
          Phường/xã nơi ở
          <input
            value={form.userInfo.livingPlaceVillageText ?? ''}
            onChange={(event) => updateUser({ livingPlaceVillageText: event.target.value })}
          />
        </label>
        <label>
          Tỉnh/thành nơi ở
          <input
            value={form.userInfo.livingPlaceCityText ?? ''}
            onChange={(event) => updateUser({ livingPlaceCityText: event.target.value })}
          />
        </label>

        {clientError ? <p className="error span-2">{clientError}</p> : null}

        <div className="actions span-2">
          <button type="submit" disabled={registerMutation.isPending || providersQuery.isLoading}>
            {registerMutation.isPending ? 'Đang gửi…' : 'Gửi đăng ký'}
          </button>
        </div>
      </form>

      {resultText ? <p className="notice result">{resultText}</p> : null}
    </section>
  )
}
