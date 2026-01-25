import { io, Socket } from "socket.io-client";
import { getSessionToken } from "./store/authStore";

// Define server URL - ensure this matches your backend API URL base
// If API_URL is http://localhost:5000/api, we typically want http://localhost:5000 for sockets
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SOCKET_URL = API_URL.replace('/api', ''); // Strip /api to get root

let socket: Socket | null = null;

export const socketService = {
    connect: (): Socket => {
        if (socket?.connected) return socket;

        const token = getSessionToken();

        socket = io(SOCKET_URL, {
            path: '/socket.io',
            auth: {
                token: token ? `Bearer ${token}` : null
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['polling', 'websocket'] // Try polling first for max compatibility (cPanel), then upgrade
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket?.id);
        });

        socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection Error:', err.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    getSocket: (): Socket | null => {
        return socket;
    },

    // Join a specific ticket room
    joinTicket: (ticketId: number | string) => {
        if (!socket) return;
        socket.emit('join_ticket', ticketId);
    },

    // Leave a specific ticket room
    leaveTicket: (ticketId: number | string) => {
        if (!socket) return;
        socket.emit('leave_ticket', ticketId);
    }
};
