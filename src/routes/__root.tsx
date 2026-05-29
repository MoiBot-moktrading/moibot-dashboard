import { Outlet, Link } from '@tanstack/react-router'

// 전체 앱의 루트 레이아웃 — 사이드바 + 헤더 포함
export function RootComponent() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* 사이드바 내비게이션 */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-4 gap-2">
        <div className="text-lg font-bold text-white mb-6 px-2">MoiBot</div>
        <nav className="flex flex-col gap-1">
          <Link
            to="/"
            className="px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white [&.active]:bg-gray-800 [&.active]:text-white"
          >
            홈
          </Link>
          <Link
            to="/dashboard"
            className="px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white [&.active]:bg-gray-800 [&.active]:text-white"
          >
            대시보드
          </Link>
          <Link
            to="/bots"
            className="px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white [&.active]:bg-gray-800 [&.active]:text-white"
          >
            봇 목록
          </Link>
          <Link
            to="/trades"
            className="px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white [&.active]:bg-gray-800 [&.active]:text-white"
          >
            거래 이력
          </Link>
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-auto">
        {/* 라우트별 컴포넌트가 렌더링되는 자리 */}
        <Outlet />
      </main>
    </div>
  )
}
