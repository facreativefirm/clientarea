"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Loader2,
    Plus,
    Search,
    MapPin,
    ChevronsRight,
    Calendar,
    Briefcase,
    Store,
    Users as UsersIcon,
    ArrowUpRight,
    Mail,
    Phone,
    Globe,
    FileText,
    Clock,
    User,
    ShieldAlert,
    X,
    MessageSquare,
    Info
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/shared/Badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Prospect {
    id: number;
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    businessType?: string;
    industryCategory?: string;
    companySize?: string;
    annualRevenue?: string;
    currentSoftware?: string;
    painPoints?: string;
    budgetRange?: string;
    decisionMaker?: string;
    purchaseTimeline?: string;
    interestedServices?: string;
    specificRequirements?: string;
    competitorUsage?: string;
    status: string; // SUBMITTED, VERIFIED, FRAUD, CONVERTED
    verificationStatus: string; // PENDING, APPROVED, REJECTED
    notes?: string;
    fraudReason?: string;
    createdAt: string;
    proofSubmissions: { id: number; proofType: string; fileUrl: string }[];
}

export default function ProspectsListPage() {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchProspects();
    }, []);

    const fetchProspects = async () => {
        try {
            const res = await api.get('/sales-team/prospects');
            setProspects(res.data.data);
        } catch (error) {
            console.error("Failed to fetch prospects", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'CONVERTED': return 'success';
            case 'VERIFIED': return 'info';
            case 'SUBMITTED': return 'warning';
            case 'FRAUD': return 'destructive';
            default: return 'secondary';
        }
    };

    const filteredProspects = prospects.filter(p =>
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-t-primary"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                        <span className="w-6 h-[1.5px] bg-primary"></span>
                        Management
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">My Prospects</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Track and manage your potential clients pipeline.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link href="/sales-team/prospects/new">
                        <Button className="h-11 px-6 rounded-xl font-bold bg-[#f37021] text-white shadow-sm hover:bg-[#d9621c] transition-all gap-2 border-none font-sans">
                            <Plus className="h-5 w-5" /> Add Prospect
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="relative max-w-lg group"
            >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                    placeholder="Search company or contact..."
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary/50 focus:ring-0 font-medium text-sm transition-all focus:bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>

            {/* List */}
            {filteredProspects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm"
                >
                    <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Store size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">No prospects found</h3>
                    <p className="text-gray-400 font-medium text-sm mt-1">Start adding prospects to grow your pipeline.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredProspects.map((prospect, idx) => (
                            <motion.div
                                key={prospect.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: idx * 0.03, duration: 0.2 }}
                                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-gray-100 uppercase">
                                            {prospect.companyName?.[0] || '?'}
                                        </div>
                                        <div className="truncate">
                                            <h3 className="font-bold text-gray-900 text-lg tracking-tight truncate">{prospect.companyName}</h3>
                                            <Badge variant={getStatusVariant(prospect.status)} className="font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">
                                                {prospect.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-medium text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
                                            {prospect.contactPerson || "Anonymous"}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            {new Date(prospect.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {prospect.proofSubmissions?.length > 0 && (
                                            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                <ArrowUpRight className="h-3 w-3" />
                                                Verified
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-none border-gray-50">
                                    <div className="flex flex-col md:items-end">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                            Verification
                                        </div>
                                        <div className={cn(
                                            "text-xs font-bold tracking-tight flex items-center gap-1.5",
                                            prospect.verificationStatus === 'APPROVED' ? 'text-emerald-600' :
                                                prospect.verificationStatus === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full",
                                                prospect.verificationStatus === 'APPROVED' ? 'bg-emerald-600' :
                                                    prospect.verificationStatus === 'REJECTED' ? 'bg-rose-600' : 'bg-amber-600'
                                            )} />
                                            {prospect.verificationStatus}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="rounded-lg font-bold text-gray-400 hover:text-primary transition-colors h-8 px-3 text-xs font-sans"
                                        onClick={() => {
                                            setSelectedProspect(prospect);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Details <ChevronsRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Prospect Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
                    {selectedProspect && (
                        <div className="flex flex-col max-h-[90vh]">
                            <DialogHeader className="p-0">
                                <DialogTitle className="sr-only">Prospect Details: {selectedProspect.companyName}</DialogTitle>
                            </DialogHeader>

                            {/* Modal Header */}
                            <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-black text-xl border border-gray-100 uppercase">
                                        {selectedProspect.companyName?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedProspect.companyName || 'Unnamed Prospect'}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={getStatusVariant(selectedProspect.status)} className="font-bold uppercase tracking-widest text-[9px]">
                                                {selectedProspect.status}
                                            </Badge>
                                            <Badge variant={selectedProspect.verificationStatus === 'APPROVED' ? 'success' : 'secondary'} className="font-bold uppercase tracking-widest text-[9px]">
                                                {selectedProspect.verificationStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                {/* Core Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><User size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Contact Person</p>
                                                <p className="font-bold text-gray-900">{selectedProspect.contactPerson || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Mail size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                                <p className="font-bold text-gray-900">{selectedProspect.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><Phone size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                                <p className="font-bold text-gray-900">{selectedProspect.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><MapPin size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Address</p>
                                                <p className="font-bold text-gray-900 leading-snug">{selectedProspect.address || 'N/A'}</p>
                                                {(selectedProspect.city || selectedProspect.state) && (
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {[selectedProspect.city, selectedProspect.state, selectedProspect.country].filter(Boolean).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Info size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Business Info</p>
                                                <p className="font-bold text-gray-900">{selectedProspect.businessType || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 font-medium">{selectedProspect.industryCategory} ({selectedProspect.companySize})</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Analysis */}
                                <div className="p-6 rounded-2xl bg-gray-50 space-y-4">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <ArrowUpRight size={14} className="text-primary" /> Business Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current software</p>
                                            <p className="text-sm font-medium text-gray-700">{selectedProspect.currentSoftware || 'None reported'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Budget Range</p>
                                            <p className="text-sm font-medium text-gray-700">{selectedProspect.budgetRange || 'Not discussed'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pain Points</p>
                                            <p className="text-sm font-medium text-gray-700">{selectedProspect.painPoints || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Interested Services</p>
                                            <p className="text-sm font-bold text-primary">{selectedProspect.interestedServices || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Proofs & Admin */}
                                {selectedProspect.proofSubmissions?.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                            <FileText size={14} className="text-emerald-500" /> Verification Evidence
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {selectedProspect.proofSubmissions.map((proof, i) => (
                                                <a
                                                    key={i}
                                                    href={proof.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="aspect-square rounded-xl overflow-hidden border border-gray-100 hover:border-primary transition-all relative group"
                                                >
                                                    <img src={proof.fileUrl} alt="Proof" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">View PDF/IMG</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes / Fraud */}
                                {(selectedProspect.notes || selectedProspect.fraudReason) && (
                                    <div className={cn(
                                        "p-6 rounded-2xl border",
                                        selectedProspect.status === 'FRAUD' ? "bg-rose-50 border-rose-100" : "bg-blue-50 border-blue-100"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {selectedProspect.status === 'FRAUD' ? <ShieldAlert size={16} className="text-rose-600" /> : <MessageSquare size={16} className="text-blue-600" />}
                                            <h4 className={cn("text-xs font-black uppercase tracking-widest", selectedProspect.status === 'FRAUD' ? "text-rose-600" : "text-blue-600")}>
                                                {selectedProspect.status === 'FRAUD' ? "Fraud Notification" : "Admin Feedback"}
                                            </h4>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {selectedProspect.status === 'FRAUD' ? selectedProspect.fraudReason : selectedProspect.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
                                <Button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl px-8 h-11 font-bold bg-gray-900 text-white hover:bg-black transition-all"
                                >
                                    Close Details
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
