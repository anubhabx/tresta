"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// import Ably from "ably"; // Dynamically imported

interface AblyContextValue {
  isConnected: boolean;
  connectionState: string;
}

const AblyContext = React.createContext<AblyContextValue>({
  isConnected: false,
  connectionState: "initialized",
});

export function useAbly() {
  const context = React.useContext(AblyContext);
  if (!context) {
    throw new Error("useAbly must be used within AblyProvider");
  }
  return context;
}

export function AblyProvider({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();
  const queryClient = useQueryClient();
  const [ablyClient, setAblyClient] = React.useState<any>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionState, setConnectionState] =
    React.useState<string>("initialized");
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const wasManuallyDisconnectedRef = React.useRef(false);

  // Check if real notifications are enabled
  const isEnabled =
    process.env.NEXT_PUBLIC_ENABLE_REAL_NOTIFICATIONS === "true";

  // Initialize Ably client
  React.useEffect(() => {
    if (!userId || !isEnabled) {
      return;
    }

    let client: any = null;
    let channel: any = null;

    const initAbly = async () => {
      const Ably = (await import("ably")).default;

      client = new Ably.Realtime({
        authCallback: async (tokenParams, callback) => {
          try {
            const token = await getToken();
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/ably/token`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (!response.ok) {
              throw new Error("Failed to fetch Ably token");
            }

            const tokenRequest = await response.json();
            callback(null, tokenRequest.data);
          } catch (error) {
            console.error("Ably auth error:", error);
            callback(error as any, null);
          }
        },
      });

      // Monitor connection state
      client.connection.on("connected", () => {
        setIsConnected(true);
        setConnectionState("connected");
        console.log("Ably connected");
      });

      client.connection.on("disconnected", () => {
        setIsConnected(false);
        setConnectionState("disconnected");
        console.log("Ably disconnected");
      });

      client.connection.on("failed", () => {
        setIsConnected(false);
        setConnectionState("failed");
        console.error("Ably connection failed");
      });

      // Subscribe to user's notification channel
      channel = client.channels.get(`notifications:${userId}`);

      channel.subscribe("notification", (message: any) => {
        console.log("New notification received:", message.data);

        // Invalidate queries to fetch new notifications
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-count"],
        });

        // Show toast notification
        if (message.data?.title) {
          toast.info(message.data.title, {
            description: message.data.message,
          });
        }
      });

      setAblyClient(client);
    };

    initAbly();

    return () => {
      if (channel) channel.unsubscribe();
      if (client) client.close();
    };
  }, [userId, isEnabled, getToken, queryClient]);

  // Auto-disconnect after 30 minutes of inactivity
  React.useEffect(() => {
    if (!ablyClient || !isConnected) {
      return;
    }

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(
        () => {
          console.log("Disconnecting Ably due to inactivity");
          wasManuallyDisconnectedRef.current = true;
          ablyClient.close();
        },
        30 * 60 * 1000,
      ); // 30 minutes
    };

    // Track user activity
    const activityEvents = [
      "mousemove",
      "keypress",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [ablyClient, isConnected]);

  // Reconnect on user activity after manual disconnect
  React.useEffect(() => {
    if (!ablyClient || !wasManuallyDisconnectedRef.current) {
      return;
    }

    const handleActivity = () => {
      if (wasManuallyDisconnectedRef.current && connectionState === "closed") {
        console.log("Reconnecting Ably after user activity");
        wasManuallyDisconnectedRef.current = false;
        ablyClient.connect();
      }
    };

    const activityEvents = ["mousemove", "keypress", "click"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { once: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [ablyClient, connectionState]);

  const value: AblyContextValue = {
    isConnected,
    connectionState,
  };

  return <AblyContext.Provider value={value}>{children}</AblyContext.Provider>;
}
