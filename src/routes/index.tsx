import { Navigate } from '@tanstack/react-router'

// 홈(/) — 봇 목록으로 리다이렉트
export function IndexComponent() {
  return <Navigate to="/bots" />
}
