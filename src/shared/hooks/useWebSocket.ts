import { useEffect, useRef, useCallback } from 'react'

interface UseWebSocketOptions {
  // 메시지 수신 핸들러
  onMessage: (data: unknown) => void
  // 연결 오류 핸들러 (선택)
  onError?: (event: Event) => void
  // 연결 종료 핸들러 (선택)
  onClose?: (event: CloseEvent) => void
}

// 백엔드 WebSocket에 연결하는 공유 훅
// 컴포넌트 언마운트 시 자동으로 연결 종료
export function useWebSocket(url: string, options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const { onMessage, onError, onClose } = options

  // 수동 연결 종료 함수
  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  useEffect(() => {
    // WebSocket 연결 생성
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (event: MessageEvent) => {
      try {
        // JSON 파싱 후 핸들러 호출
        const parsed: unknown = JSON.parse(event.data as string)
        onMessage(parsed)
      } catch {
        // JSON 파싱 실패 시 원문 전달
        onMessage(event.data)
      }
    }

    ws.onerror = (event) => {
      onError?.(event)
    }

    ws.onclose = (event) => {
      onClose?.(event)
    }

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      ws.close()
    }
  }, [url, onMessage, onError, onClose])

  return { disconnect }
}
