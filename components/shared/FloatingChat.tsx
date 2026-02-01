"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    MessageSquare,
    X,
    Send,
    Paperclip,
    Loader2,
    ChevronRight,
    User,
    Mail,
    Phone,
    FileText,
    ShieldCheck,
    CheckCircle2,
    RefreshCw,
    Volume2,
    VolumeX,
    ArrowLeft,
    Plus,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuthStore, setSessionToken } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { socketService } from "@/lib/socket";


type ChatState = 'CLOSED' | 'IDENTIFY' | 'INITIATE_TICKET' | 'TICKET_LIST' | 'CHATTING' | 'LOADING';

export function FloatingChat() {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { user, setAuth } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [chatState, setChatState] = useState<ChatState>('LOADING');

    const isHiddenPage = pathname?.startsWith('/admin') || pathname?.startsWith('/support') || pathname?.startsWith('/auth');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Forms
    const [identifyForm, setIdentifyForm] = useState({ name: '', email: '', phone: '' });
    const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });

    // Chat Data
    const [tickets, setTickets] = useState<any[]>([]);
    const [ticket, setTicket] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollerRef = useRef<NodeJS.Timeout | null>(null);
    const sentSound = useRef<HTMLAudioElement | null>(null);
    const receivedSound = useRef<HTMLAudioElement | null>(null);
    const lastMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
        sentSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        receivedSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    }, []);

    // Initial State Determination
    useEffect(() => {
        if (!isOpen) return;

        if (user) {
            // Refresh tickets when opening if we're not already in an active chat
            if (chatState === 'LOADING' || chatState === 'IDENTIFY' || (chatState === 'INITIATE_TICKET' && tickets.length === 0)) {
                checkActiveSession();
            }
        } else {
            setChatState('IDENTIFY');
        }
    }, [isOpen, user]);

    const checkActiveSession = async () => {
        try {
            setChatState('LOADING');
            // Fetch all tickets for this user (both Guests and Clients)
            const res = await api.get('/support/tickets');
            const userTickets = res.data.data.tickets;
            setTickets(userTickets || []);

            if (userTickets && userTickets.length > 0) {
                setChatState('TICKET_LIST');
            } else {
                setChatState('INITIATE_TICKET');
            }
        } catch (err: any) {
            // On 401/403, we should definitely show IDENTIFY, on other errors just show the ticket form
            if (err.response?.status === 401 || err.response?.status === 403) {
                setChatState('IDENTIFY');
            } else {
                setChatState('INITIATE_TICKET');
            }
        }
    };

    const loadTicket = async (ticketId: number) => {
        try {
            setChatState('LOADING');
            const res = await api.get(`/support/tickets/${ticketId}`);
            const ticketData = res.data.data.ticket;
            setTicket(ticketData);
            setReplies(ticketData.replies || []);
            setChatState('CHATTING');
        } catch (err) {
            toast.error("Failed to load ticket");
            setChatState('TICKET_LIST');
        }
    };


    // Socket Connection & Events
    useEffect(() => {
        if (!user) return;

        const socket = socketService.connect();

        const handleNewMessage = (data: any) => {
            // Use functional update to avoid closure staleness
            setReplies((prev: any[]) => {
                if (prev.some(r => r.id === data.reply.id)) return prev;

                // Play sound and scroll if not from me
                const isMe = data.reply.userId === user.id || data.reply.user?.id === user.id;
                if (!isMe) {
                    if (!isMuted && receivedSound.current) {
                        receivedSound.current.play().catch(() => { });
                    }
                    if (!isOpen) {
                        setUnreadCount(u => u + 1);
                    }
                }

                return [...prev, data.reply];
            });

            // Trigger scroll
            if (isOpen && chatState === 'CHATTING') {
                chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
            }
        };

        // 2. Listen for ticket status updates
        const handleTicketUpdate = (data: any) => {
            if (ticket && data.id === ticket.id) {
                setTicket((prev: any) => ({ ...prev, ...data }));
            }
            // Also refresh list if needed - simple way is to re-fetch or update local state
            setTickets((prev: any[]) => prev.map(t => t.id === data.id ? { ...t, ...data } : t));
        };

        socket.on('new_message', handleNewMessage);
        socket.on('ticket_updated', handleTicketUpdate);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('ticket_updated', handleTicketUpdate);
        };
    }, [user, ticket, isOpen, isMuted]);

    // Join/Leave Ticket Room
    useEffect(() => {
        if (chatState === 'CHATTING' && ticket) {
            socketService.joinTicket(ticket.id);
        }

        return () => {
            if (ticket) {
                // We don't necessarily leave immediately to allow rapid re-entry, 
                // but for cleanliness we can. Or we rely on global listening.
                // For this implementation plan, we join specific rooms.
                socketService.leaveTicket(ticket.id);
            }
        };
    }, [chatState, ticket?.id]);

    // Initial Load (One-time fetch instead of polling)
    useEffect(() => {
        // ... (Keep existing initial load logic if needed for first render)
    }, []);

    useEffect(() => {
        return () => {
            if (pollerRef.current) clearInterval(pollerRef.current);
        };
    }, []);

    useEffect(() => {
        if (chatState === 'CHATTING' && isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setUnreadCount(0);
        }
    }, [replies, chatState, isOpen]);

    const handleBack = () => {
        if (chatState === 'CHATTING' || chatState === 'INITIATE_TICKET') {
            if (tickets.length > 0) {
                setChatState('TICKET_LIST');
                // Clear forms when going back to list or starting fresh
                setTicketForm({ subject: '', message: '' });
                setSelectedImage(null);
            } else {
                setChatState('IDENTIFY');
            }
        } else if (chatState === 'TICKET_LIST') {
            setChatState('IDENTIFY');
        }
    };

    const handleIdentify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifyForm.name || !identifyForm.email) {
            toast.error("Please provide at least Name and Email");
            return;
        }
        setChatState('INITIATE_TICKET');
    };

    const handleInitiateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketForm.subject || !ticketForm.message) {
            toast.error("Please provide Subject and Message");
            return;
        }

        try {
            setChatState('LOADING');

            let res;
            if (user) {
                // Authenticated user opening a ticket
                // We'll need a way to find a default department or provide one
                const depts = await api.get('/support/departments');
                const departments = depts.data.data.departments || [];
                const deptId = departments[0]?.id;

                if (!deptId) {
                    throw new Error("No support departments available. Please contact administrator.");
                }

                res = await api.post('/support/tickets', {
                    subject: ticketForm.subject,
                    message: ticketForm.message,
                    departmentId: deptId,
                    priority: 'MEDIUM'
                });
            } else {
                // Guest user initiating chat
                res = await api.post('/support-chat/initiate', {
                    ...identifyForm,
                    ...ticketForm
                });

                // If success, we get a session token
                if (res.data.data.sessionToken) {
                    const { user: newUser, sessionToken } = res.data.data;
                    setSessionToken(sessionToken);
                    setAuth(newUser, sessionToken);
                }
            }

            const ticketData = res.data.data.ticket;
            setTicket(ticketData);
            setReplies(ticketData.replies || []);
            setTickets(prev => [ticketData, ...prev]); // Add new ticket to list immediately
            setChatState('CHATTING');
            // Polling is handled by unified effect
            toast.success("Support session started!");
            // Reset forms
            setTicketForm({ subject: '', message: '' });
            setSelectedImage(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to start support session");
            setChatState(user ? 'INITIATE_TICKET' : 'IDENTIFY');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size must be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !ticket) return;

        const msg = newMessage;
        const attachment = selectedImage;

        setNewMessage("");
        setSelectedImage(null);
        setSending(true);

        try {
            await api.post(`/support/tickets/${ticket.id}/reply`, {
                message: msg,
                attachments: attachment ? [attachment] : []
            });

            // The socket listener handles adding the reply to the UI.
            if (!isMuted && sentSound.current) {
                sentSound.current.play().catch(() => { });
            }
        } catch (err) {
            toast.error("Failed to send message");
            setNewMessage(msg);
            setSelectedImage(attachment);
        } finally {
            setSending(false);
        }
    };

    if (!mounted || isHiddenPage) return null;

    return (
        <div className="fixed bottom-6 right-12 z-[99999] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 md:w-[400px] h-[550px] max-h-[80vh] bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 bg-primary text-primary-foreground flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                {chatState !== 'IDENTIFY' && chatState !== 'LOADING' && (
                                    <button
                                        onClick={handleBack}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors mr-[-4px]"
                                        title="Back"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight">Live Support</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Support Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative bg-secondary/10 flex flex-col">
                            {chatState === 'TICKET_LIST' && (
                                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
                                    <div className="flex justify-between items-center mb-1 px-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Support History</p>
                                        <button
                                            onClick={() => {
                                                setTicketForm({ subject: '', message: '' });
                                                setChatState('INITIATE_TICKET');
                                            }}
                                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={12} /> New Ticket
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {tickets.length === 0 ? (
                                            <div className="flex-1 py-12 flex flex-col items-center justify-center p-6 text-center">
                                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                                    <MessageSquare size={32} className="text-primary/20" />
                                                </div>
                                                <p className="text-sm font-bold text-foreground">No tickets yet.</p>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Send us a message below and we'll help you out!</p>
                                            </div>
                                        ) : (
                                            tickets.map((t, index) => (
                                                <button
                                                    key={t.id || index}
                                                    onClick={() => loadTicket(t.id)}
                                                    className="w-full text-left p-4 rounded-3xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all group relative"
                                                >
                                                    <div className="flex justify-between items-start mb-2 gap-3">
                                                        <h5 className="font-bold text-[13px] leading-tight flex-1 group-hover:text-primary transition-colors">{t.subject}</h5>
                                                        <div className={cn(
                                                            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shrink-0",
                                                            t.status === 'OPEN' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                                t.status === 'CLOSED' ? "bg-secondary text-muted-foreground border border-border" :
                                                                    t.status === 'ON_HOLD' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                                        "bg-primary/10 text-primary border border-primary/20"
                                                        )}>
                                                            {t.status}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={10} className="opacity-50" />
                                                            <span className="text-[10px] font-bold tracking-tight uppercase">
                                                                {new Date(t.lastReplyDate || t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MessageSquare size={10} className="opacity-50" />
                                                            <span className="text-[10px] font-bold tracking-tight">{t._count?.replies || t.replies?.length || 1}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            {chatState === 'LOADING' && (
                                <div className="absolute inset-0 z-10 bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Establishing Connection...</p>
                                </div>
                            )}

                            {chatState === 'IDENTIFY' && (
                                <form onSubmit={handleIdentify} className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                                    <div className="text-center mb-2">
                                        <h4 className="font-bold text-base">Welcome!</h4>
                                        <p className="text-xs text-muted-foreground">How can we help you today? Please identify yourself to start a chat.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    placeholder="John Doe"
                                                    className="pl-10 h-11 rounded-xl bg-card border-border/50"
                                                    value={identifyForm.name}
                                                    onChange={e => setIdentifyForm({ ...identifyForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="pl-10 h-11 rounded-xl bg-card border-border/50"
                                                    value={identifyForm.email}
                                                    onChange={e => setIdentifyForm({ ...identifyForm, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone (Optional)</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    placeholder="+1 234 567 890"
                                                    className="pl-10 h-11 rounded-xl bg-card border-border/50"
                                                    value={identifyForm.phone}
                                                    onChange={e => setIdentifyForm({ ...identifyForm, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2">
                                            Continue <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {chatState === 'INITIATE_TICKET' && (
                                <form onSubmit={handleInitiateTicket} className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                                    <div className="text-center mb-2">
                                        <h4 className="font-bold text-base">Let's Talk</h4>
                                        <p className="text-xs text-muted-foreground">What's on your mind? Briefly describe your issue.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    placeholder="e.g. Website is down"
                                                    className="pl-10 h-11 rounded-xl bg-card border-border/50"
                                                    value={ticketForm.subject}
                                                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                                            <textarea
                                                className="w-full h-32 rounded-xl bg-card border border-border/50 p-4 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none font-medium"
                                                placeholder="Describe your query in detail..."
                                                value={ticketForm.message}
                                                onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2">
                                            Start Support Session
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {chatState === 'CHATTING' && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
                                        {replies.map((reply, i) => {
                                            const isMe = reply.userId === user?.id || reply.user?.id === user?.id;
                                            return (
                                                <motion.div
                                                    key={reply.id || `reply-${i}`}
                                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className={cn(
                                                        "flex flex-col max-w-[85%] gap-1",
                                                        isMe ? "ml-auto items-end" : "items-start"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                                            : "bg-card border border-border/50 rounded-tl-none"
                                                    )}>
                                                        {reply.message}
                                                    </div>
                                                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">
                                                        {reply.createdAt ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Footer / Input */}
                                    <div className="p-4 bg-card border-t border-border/50 flex flex-col gap-3">
                                        {ticket?.status === 'CLOSED' || ticket?.status === 'ON_HOLD' ? (
                                            <div className="py-3 px-4 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider bg-secondary/30 rounded-2xl border border-border/50">
                                                {ticket?.status === 'CLOSED' ? 'This ticket is closed and solved.' : 'This ticket is currently on hold.'}
                                            </div>
                                        ) : (
                                            <>
                                                {selectedImage && (
                                                    <div className="relative inline-block self-start">
                                                        <img src={selectedImage} alt="Attachment" className="h-16 w-16 object-cover rounded-lg border border-border" />
                                                        <button
                                                            onClick={() => setSelectedImage(null)}
                                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 text-muted-foreground hover:text-primary"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <Paperclip size={18} />
                                                    </Button>
                                                    <div className="flex-1 relative">
                                                        <textarea
                                                            className="w-full h-12 bg-secondary/30 rounded-xl px-4 py-3 text-xs pr-10 focus:outline-none focus:border-primary/50 transition-all resize-none font-medium scrollbar-hide"
                                                            placeholder="Type a message..."
                                                            value={newMessage}
                                                            onChange={e => setNewMessage(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSendMessage(e);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <Button size="icon" disabled={sending || !newMessage.trim()} className="h-11 w-11 rounded-xl shrink-0">
                                                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                    </Button>
                                                </form>
                                            </>
                                        )}
                                        <div className="flex justify-center">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                                                <ShieldCheck size={10} className="text-emerald-500" /> Secure Support Session
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-[28px] shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 z-50 group",
                    isOpen
                        ? "bg-card border border-border/50 text-foreground"
                        : (unreadCount > 0 ? "bg-red-500 text-white" : "bg-primary text-primary-foreground")
                )}
            >
                {isOpen ? <X size={28} /> : (
                    <div className="relative">
                        <MessageSquare size={28} className={cn(unreadCount > 0 && "animate-swing")} />
                        {unreadCount > 0 ? (
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-primary text-[10px] font-bold">
                                {unreadCount}
                            </div>
                        ) : (
                            <>
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-4 border-primary rounded-full animate-ping" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-4 border-primary rounded-full" />
                            </>
                        )}
                    </div>
                )}
            </button>

            <style jsx global>{`
                @keyframes swing {
                    0%, 100% { transform: rotate(0deg); }
                    20% { transform: rotate(15deg); }
                    40% { transform: rotate(-10deg); }
                    60% { transform: rotate(5deg); }
                    80% { transform: rotate(-5deg); }
                }
                .animate-swing {
                    animation: swing 1.5s ease-in-out infinite;
                    transform-origin: center center;
                }
            `}</style>
        </div>
    );
}
