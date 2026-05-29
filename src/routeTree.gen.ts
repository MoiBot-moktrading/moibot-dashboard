// 수동으로 정의한 TanStack Router 라우트 트리
// 파일 기반 자동 생성 대신 수동 관리

import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootComponent } from '@/routes/__root'
import { IndexComponent } from '@/routes/index'
import { DashboardIndexComponent } from '@/routes/dashboard/index'
import { BotsIndexComponent } from '@/routes/bots/index'
import { BotDetailComponent } from '@/routes/bots/$botId'
import { TradesIndexComponent } from '@/routes/trades/index'

// 루트 라우트
const rootRoute = createRootRoute({
  component: RootComponent,
})

// / 홈 라우트
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
})

// /dashboard 라우트
const dashboardIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardIndexComponent,
})

// /bots 라우트
const botsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bots',
  component: BotsIndexComponent,
})

// /bots/$botId 동적 라우트
const botDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bots/$botId',
  component: BotDetailComponent,
})

// /trades 라우트
const tradesIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trades',
  component: TradesIndexComponent,
})

// 라우트 트리 조합
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardIndexRoute,
  botsIndexRoute,
  botDetailRoute,
  tradesIndexRoute,
])

// 라우터 인스턴스 생성 및 내보내기
export const router = createRouter({ routeTree })

// 타입 안전성을 위한 라우터 타입 등록
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
