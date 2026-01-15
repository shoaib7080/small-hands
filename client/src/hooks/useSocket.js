import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";

    if (!socket) {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
      });

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return socket;
};
