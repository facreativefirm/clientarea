"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Upload,
    Save,
    Loader2,
    Camera,
    AlertCircle,
    Check,
    Briefcase,
    Shield,
    ChevronLeft
} from "lucide-react";
import api from "@/lib/api";
import { compressImage } from "@/lib/imageUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AddProspectPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        gpsLatitude: "",
        gpsLongitude: "",
        currentSoftware: "",
        painPoints: "",
        budgetRange: "",
        interestedServices: "",
    });

    const [proofFile, setProofFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    gpsLatitude: position.coords.latitude.toString(),
                    gpsLongitude: position.coords.longitude.toString()
                }));
            },
            (err) => {
                console.error(err);
                alert("Unable to retrieve location. Please allow access.");
            }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // Increased limit as we compress anyway
                alert("File size too large (max 10MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const originalBase64 = reader.result as string;
                    // Compress and convert to webp
                    const compressed = await compressImage(originalBase64, 0.6, 1000);
                    setProofFile(compressed);
                } catch (err) {
                    console.error("Compression failed", err);
                    setProofFile(reader.result as string); // Fallback to original
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (!formData.companyName || !formData.phone) {
                throw new Error("Company Name and Phone are required.");
            }

            const payload = {
                companyName: formData.companyName,
                contactPerson: formData.contactPerson,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : null,
                gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : null,
                surveys: {
                    currentSoftware: formData.currentSoftware,
                    painPoints: formData.painPoints,
                    budgetRange: formData.budgetRange,
                    interestedServices: formData.interestedServices
                },
                proofs: proofFile ? [{
                    type: "PHOTO",
                    url: proofFile,
                    gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : null,
                    gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : null,
                    metadata: { type: "Base64 Upload" }
                }] : []
            };

            await api.post('/sales-team/prospects', payload);

            setSuccess(true);
            setTimeout(() => {
                router.push('/sales-team/prospects');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to submit prospect");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-20 w-20 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                >
                    <Check className="h-10 w-10 text-emerald-600" />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Prospect Submitted!</h2>
                <p className="text-gray-500 font-medium">Redirecting to your list...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link href="/sales-team/prospects" className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-widest mb-2 hover:gap-2 transition-all">
                        <ChevronLeft size={14} />
                        Back to Prospects
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Add Prospect</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Initialize a new opportunity in your pipeline.</p>
                </motion.div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-center gap-3 font-bold text-sm"
                >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                </motion.div>
            )}

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-10 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100"
            >
                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">01</div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Client Foundation</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Company Legal Name *</Label>
                            <input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Primary Contact Person</Label>
                            <input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Phone Connection *</Label>
                            <input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Electronic Mail</Label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Physical Location</Label>
                        <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none resize-none" />
                    </div>

                    {/* Location */}
                    {/* Location */}
                    <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Geospatial Intelligence</div>
                            <Button type="button" onClick={handleGetLocation} variant="outline" className="h-8 px-4 rounded-lg font-bold gap-1.5 border-gray-200 text-xs font-sans">
                                <MapPin size={14} />
                                Locate
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Latitude</Label>
                                <input disabled value={formData.gpsLatitude} placeholder="0.0000" className="w-full h-9 px-3 bg-white/50 border border-gray-100 rounded-lg font-bold text-primary text-xs outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Longitude</Label>
                                <input disabled value={formData.gpsLongitude} placeholder="0.0000" className="w-full h-9 px-3 bg-white/50 border border-gray-100 rounded-lg font-bold text-primary text-xs outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Survey Data */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 font-bold text-sm">02</div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Market Intelligence</h3>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentSoftware" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Current Software Used</Label>
                        <input id="currentSoftware" name="currentSoftware" value={formData.currentSoftware} onChange={handleInputChange} placeholder="e.g. ERPNext, Excel" className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="painPoints" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Business Challenges</Label>
                        <textarea id="painPoints" name="painPoints" value={formData.painPoints} onChange={handleInputChange} rows={3} placeholder="What issues are they trying to solve?" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="budgetRange" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Estimated Budget</Label>
                            <input id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} placeholder="e.g. 50k - 100k" className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interestedServices" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Interested Services</Label>
                            <input id="interestedServices" name="interestedServices" value={formData.interestedServices} onChange={handleInputChange} placeholder="Web, SEO, ERP..." className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm focus:bg-white focus:border-primary/50 transition-all outline-none" />
                        </div>
                    </div>
                </div>

                {/* Proof */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-500 font-bold text-sm">03</div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Verification Proof</h3>
                    </div>
                    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                        <div className="flex flex-col items-center">
                            {proofFile ? (
                                <div className="space-y-3">
                                    <div className="relative inline-block">
                                        <img src={proofFile} alt="Proof" className="h-32 w-auto object-contain rounded-lg shadow-sm border border-gray-100" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setProofFile(null); }}
                                            className="absolute -top-2 -right-2 h-6 w-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                        >
                                            <Save size={12} className="rotate-45" />
                                        </button>
                                    </div>
                                    <div className="text-emerald-600 font-bold text-[10px] flex items-center justify-center gap-1">
                                        <Check size={12} /> Image Ready
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-3 group-hover:scale-105 transition-transform duration-300">
                                        <Camera className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">Upload Photo Evidence</h4>
                                    <p className="text-gray-400 font-medium text-[11px] mt-1 max-w-[200px] mx-auto">
                                        Card, storefront, or proof (Max 5MB)
                                    </p>
                                    <Button type="button" variant="outline" className="mt-4 h-9 px-4 rounded-lg font-bold text-xs">
                                        Select Image
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 pb-12">
                    <Button type="submit" className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold shadow-sm hover:bg-gray-800 transition-all gap-2 border-none font-sans" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" /> Submit Prospect
                            </>
                        )}
                    </Button>
                </div>
            </motion.form>
        </div>
    );
}
