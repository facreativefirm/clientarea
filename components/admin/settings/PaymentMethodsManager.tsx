"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Trash2,
    Edit2,
    ChevronUp,
    ChevronDown,
    Loader2,
    Save,
    Banknote,
    Smartphone,
    Globe,
    Zap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

interface PaymentMethod {
    id: number;
    name: string;
    description: string;
    type: string;
    subtype: string;
    enabled: boolean;
    displayOrder: number;
    accountNumber: string;
    accountName: string;
    branchName: string;
    instructionsEn: string;
    instructionsBn: string;
    metadata: string;
}

export default function PaymentMethodsManager() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payment-methods");
            setMethods(res.data.data.methods);
        } catch (error) {
            toast.error("Failed to fetch payment methods");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingMethod({
            name: "",
            description: "",
            type: "bank",
            subtype: "personal",
            enabled: true,
            displayOrder: methods.length,
            accountNumber: "",
            accountName: "",
            branchName: "",
            instructionsEn: "",
            instructionsBn: "",
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this payment method?")) return;
        try {
            await api.delete(`/payment-methods/${id}`);
            toast.success("Payment method deleted");
            fetchMethods();
        } catch (error) {
            toast.error("Failed to delete payment method");
        }
    };

    const handleSave = async () => {
        if (!editingMethod?.name) {
            toast.error("Name is required");
            return;
        }
        setSaving(true);
        try {
            if (editingMethod.id) {
                await api.patch(`/payment-methods/${editingMethod.id}`, editingMethod);
                toast.success("Payment method updated");
            } else {
                await api.post("/payment-methods", editingMethod);
                toast.success("Payment method created");
            }
            setIsDialogOpen(false);
            fetchMethods();
        } catch (error) {
            toast.error("Failed to save payment method");
        } finally {
            setSaving(false);
        }
    };

    const handleMove = async (index: number, direction: "up" | "down") => {
        const newMethods = [...methods];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newMethods.length) return;

        [newMethods[index], newMethods[targetIndex]] = [newMethods[targetIndex], newMethods[index]];

        const orders = newMethods.map((m, i) => ({ id: m.id, displayOrder: i }));

        try {
            setMethods(newMethods);
            await api.post("/payment-methods/reorder", { orders });
        } catch (error) {
            toast.error("Failed to reorder methods");
            fetchMethods();
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                    <h4 className="font-bold">Manual Payment Methods</h4>
                    <p className="text-xs text-muted-foreground">Manage Bank Transfers, bKash Personal, etc.</p>
                </div>
                <Button onClick={handleAdd} size="sm" className="rounded-xl gap-2">
                    <Plus size={16} /> Add Method
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {methods.map((method, index) => (
                    <div
                        key={method.id}
                        className={cn(
                            "flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 transition-all hover:bg-white/10",
                            !method.enabled && "opacity-50 grayscale"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                {method.type === 'bank' ? <Banknote size={20} /> : <Smartphone size={20} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-sm">{method.name}</h5>
                                    <Badge variant={method.enabled ? "success" : "secondary"} className="text-[8px] px-1.5 py-0">
                                        {method.enabled ? "ACTIVE" : "DISABLED"}
                                    </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{method.description || "No description"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1 mr-4">
                                <button
                                    onClick={() => handleMove(index, "up")}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => handleMove(index, "down")}
                                    disabled={index === methods.length - 1}
                                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                            <Button onClick={() => handleEdit(method)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Edit2 size={14} />
                            </Button>
                            <Button onClick={() => handleDelete(method.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}

                {methods.length === 0 && (
                    <div className="text-center p-12 bg-white/5 border border-dashed border-white/20 rounded-3xl">
                        <p className="text-muted-foreground text-sm font-medium">No manual payment methods configured yet.</p>
                        <Button onClick={handleAdd} variant="link" className="text-primary font-bold">Add your first one</Button>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingMethod?.id ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
                        <DialogDescription>Configure details for manual payment processing.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Method Name</Label>
                            <Input
                                value={editingMethod?.name || ""}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Bank Transfer, bKash Personal..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={editingMethod?.type || "bank"}
                                onValueChange={(val) => setEditingMethod(prev => ({ ...prev, type: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                                    <SelectItem value="auto_gateway">Automated Gateway Integration</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Subtype</Label>
                            <Select
                                value={editingMethod?.subtype || "personal"}
                                onValueChange={(val) => setEditingMethod(prev => ({ ...prev, subtype: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="merchant">Merchant</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                            <Switch
                                checked={editingMethod?.enabled || false}
                                onCheckedChange={(val) => setEditingMethod(prev => ({ ...prev, enabled: val }))}
                            />
                            <Label>Enabled / Visible to Clients</Label>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Brief Description</Label>
                            <Input
                                value={editingMethod?.description || ""}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Direct deposit to our account"
                            />
                        </div>

                        {editingMethod?.type === 'bank' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Account Name</Label>
                                    <Input
                                        value={editingMethod?.accountName || ""}
                                        onChange={(e) => setEditingMethod(prev => ({ ...prev, accountName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input
                                        value={editingMethod?.accountNumber || ""}
                                        onChange={(e) => setEditingMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Branch Name</Label>
                                    <Input
                                        value={editingMethod?.branchName || ""}
                                        onChange={(e) => setEditingMethod(prev => ({ ...prev, branchName: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}

                        {editingMethod?.type === 'mobile_wallet' && (
                            <div className="space-y-2">
                                <Label>Wallet Number</Label>
                                <Input
                                    value={editingMethod?.accountNumber || ""}
                                    onChange={(e) => setEditingMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    placeholder="01712xxxxxx"
                                />
                            </div>
                        )}

                        <div className="space-y-2 md:col-span-2">
                            <Label>Instructions (English)</Label>
                            <Textarea
                                value={editingMethod?.instructionsEn || ""}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev, instructionsEn: e.target.value }))}
                                placeholder="Step by step instructions for the client..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Instructions (Bangla)</Label>
                            <Textarea
                                value={editingMethod?.instructionsBn || ""}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev, instructionsBn: e.target.value }))}
                                placeholder="ধাপে ধাপে নির্দেশনা..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Method
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
