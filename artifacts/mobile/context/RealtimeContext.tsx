import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { realtimeClient, ConnectionStatus, RealtimeEventType } from "@/services/realtime";
import { TokenStore } from "@/services/api";

interface RealtimeContextType {
  status: ConnectionStatus;
  subscribe: (
    type: RealtimeEventType | "*",
    handler: (data: unknown) => void
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  status: "disconnected",
  subscribe: () => () => {},
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const appState = useRef(AppState.currentState);

  /* ── Connect when mounted ──────────────────────────────────────────────────── */
  useEffect(() => {
    /* Only connect if we have a token */
    TokenStore.getAccess().then((token) => {
      if (token) realtimeClient.connect();
    });

    /* Track status changes */
    const unsubStatus = realtimeClient.onStatusChange(setStatus);

    /* Reconnect when app comes to foreground after being backgrounded */
    const handleAppState = (nextState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        TokenStore.getAccess().then((token) => {
          if (token && realtimeClient.status !== "connected") {
            realtimeClient.connect();
          }
        });
      }
      appState.current = nextState;
    };
    const sub = AppState.addEventListener("change", handleAppState);

    return () => {
      unsubStatus();
      sub.remove();
      /* Don't disconnect here — the connection is shared across the app.
         It disconnects on logout via AuthContext. */
    };
  }, []);

  const subscribe = (
    type: RealtimeEventType | "*",
    handler: (data: unknown) => void
  ) => realtimeClient.on(type, handler);

  return (
    <RealtimeContext.Provider value={{ status, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
