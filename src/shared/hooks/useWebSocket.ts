import { useCallback, useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  // 메시지 수신 핸들러
  onMessage: (data: unknown) => void
  // 연결 오류 핸들러 (선택)
  onError?: (event: Event) => void
  // 자동 재접속 여부 (기본 true)
  autoReconnect?: boolean
  // 재접속 대기 시간 ms (기본 3000)
  reconnectDelay?: number
}

// 백엔드 WebSocket에 연결하는 공유 훅
// 자동 재접속 + 컴포넌트 언마운트 시 연결 종료
export function useWebSocket(url: string, options: UseWebSocketOptions) {
  const { autoReconnect = true, reconnectDelay = 3000 } = options

  // 최신 콜백을 ref로 유지 (connect 함수 안정화)
  const onMessageRef = useRef(options.onMessage)
  const onErrorRef = useRef(options.onError)
  useEffect(() => { onMessageRef.current = options.onMessage })
  useEffect(() => { onErrorRef.current = options.onError })

  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (mountedRef.current) setConnected(true)
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        onMessageRef.current(JSON.parse(event.data as string))
      } catch {
        onMessageRef.current(event.data)
      }
    }

    ws.onerror = (event) => {
      onErrorRef.current?.(event)
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConnected(false)
      if (autoReconnect) {
        reconnectTimerRef.current = setTimeout(connect, reconnectDelay)
      }
    }
  }, [url, autoReconnect, reconnectDelay])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const disconnect = useCallback(() => {
    mountedRef.current = false
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  return { connected, disconnect }
}
