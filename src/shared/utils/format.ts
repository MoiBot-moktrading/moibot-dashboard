// 가격, 수익률 등 트레이딩 관련 숫자 포맷 유틸리티

// 원화 가격 포맷 (예: 12345678 → "12,345,678 KRW")
export function formatKrw(value: number): string {
  return `${value.toLocaleString('ko-KR')} KRW`
}

// 수익률 포맷 (예: 0.0523 → "+5.23%", -0.02 → "-2.00%")
export function formatPnlPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(2)}%`
}

// 수익/손실 금액 포맷 (예: 15000 → "+15,000", -3000 → "-3,000")
export function formatPnlAmount(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toLocaleString('ko-KR')}`
}

// 날짜/시각 포맷 (ISO 문자열 → 한국 시각 표시)
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 수익/손실에 따른 Tailwind 색상 클래스 반환
export function pnlColorClass(value: number): string {
  if (value > 0) return 'text-green-500'
  if (value < 0) return 'text-red-500'
  return 'text-gray-400'
}
