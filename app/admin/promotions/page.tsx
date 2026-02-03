"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tag, Plus, Trash2, Edit2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: "",
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: "",
        usageLimit: "",
        recurrence: "",
        minimumOrderAmount: "",
        applicableProducts: "" // Comma separated IDs
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await api.get("/promotions");
            if (res.data.status === "success") {
                setPromotions(res.data.data.promotions);
            }
        } catch (error) {
            toast.error("Failed to load promotions");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return;
        try {
            await api.delete(`/promotions/${id}`);
            toast.success("Promotion deleted");
            fetchPromotions();
        } catch (error) {
            toast.error("Failed to delete promotion");
        }
    };

    const handleEdit = (promo: any) => {
        setFormData({
            code: promo.code,
            type: promo.type,
            value: promo.value.toString(),
            validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
            validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : "",
            usageLimit: promo.usageLimit?.toString() || "",
            recurrence: promo.recurrence?.toString() || "",
            minimumOrderAmount: promo.minimumOrderAmount?.toString() || "",
            applicableProducts: Array.isArray(JSON.parse(promo.applicableProducts || '[]'))
                ? JSON.parse(promo.applicableProducts).join(', ')
                : ""
        });
        setEditingId(promo.id);
        setIsCreateOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value),
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                recurrence: formData.recurrence ? parseInt(formData.recurrence) : null,
                minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : null,
                validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
                applicableProducts: formData.applicableProducts
                    ? JSON.stringify(formData.applicableProducts.split(',').map(id => parseInt(id.trim())).filter(n => !isNaN(n)))
                    : null
            };

            if (editingId) {
                await api.put(`/promotions/${editingId}`, payload);
                toast.success("Promotion updated successfully");
            } else {
                await api.post("/promotions", payload);
                toast.success("Promotion created successfully");
            }
            setIsCreateOpen(false);
            resetForm();
            fetchPromotions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save promotion");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            type: "percentage",
            value: "",
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: "",
            usageLimit: "",
            recurrence: "",
            minimumOrderAmount: "",
            applicableProducts: ""
        });
        setEditingId(null);
    };

    const filteredPromotions = promotions.filter(p =>
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <Tag className="text-primary" /> Promotions
                                </h1>
                                <p className="text-muted-foreground">Manage discount codes and coupons</p>
                            </div>
                            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                                setIsCreateOpen(open);
                                if (!open) resetForm();
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="font-bold">
                                        <Plus className="mr-2 h-4 w-4" /> Create Promotion
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingId ? "Edit Promotion" : "Create New Promotion"}</DialogTitle>
                                        <DialogDescription>
                                            {editingId ? "Update existing promotion details." : "Add a new coupon code for customers."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreate} className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Promo Code</Label>
                                                <Input
                                                    placeholder="e.g. SUMMER25"
                                                    value={formData.code}
                                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Discount Type</Label>
                                                <Select
                                                    value={formData.type}
                                                    onValueChange={v => setFormData({ ...formData, type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Discount Value</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="e.g. 20"
                                                value={formData.value}
                                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Valid From</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.validFrom}
                                                    onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Valid Until</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.validUntil}
                                                    onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                                />
                                                <p className="text-[10px] text-muted-foreground">Leave empty for no expiry</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Usage Limit</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Total global uses"
                                                    value={formData.usageLimit}
                                                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Recurrence</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="N (0 = One-time)"
                                                    value={formData.recurrence}
                                                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                                                />
                                                <p className="text-[10px] text-muted-foreground">Number of cycles (0 = first only, 99 = lifetime)</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Min Order Amount</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.minimumOrderAmount}
                                                onChange={e => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Applicable Product IDs</Label>
                                            <Input
                                                placeholder="e.g. 1, 5, 10 (Leave empty for all)"
                                                value={formData.applicableProducts}
                                                onChange={e => setFormData({ ...formData, applicableProducts: e.target.value })}
                                            />
                                            <p className="text-[10px] text-muted-foreground">Comma separated Product IDs. Leave blank to apply to all products.</p>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={submitting}>
                                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {editingId ? "Save Changes" : "Create Promotion"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b bg-muted/20 flex gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search promotions..."
                                        className="pl-9 bg-background"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Validity</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredPromotions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No promotions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPromotions.map((promo) => (
                                            <TableRow key={promo.id}>
                                                <TableCell className="font-bold flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs tracking-wider font-mono">
                                                        {promo.code}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {promo.type === 'percentage'
                                                        ? <span className="text-emerald-600 font-bold">{promo.value}% OFF</span>
                                                        : <span className="text-emerald-600 font-bold">{formatPrice(promo.value)} OFF</span>
                                                    }
                                                    {promo.minimumOrderAmount && (
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                                            Min: {formatPrice(promo.minimumOrderAmount)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs">
                                                        <div><span className="text-muted-foreground">From:</span> {new Date(promo.validFrom).toLocaleDateString()}</div>
                                                        {promo.validUntil ? (
                                                            <div className={new Date(promo.validUntil) < new Date() ? "text-red-500 font-bold" : ""}>
                                                                <span className="text-muted-foreground">Until:</span> {new Date(promo.validUntil).toLocaleDateString()}
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground italic">No expiry</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <span className="font-bold">{promo.usedCount}</span>
                                                        <span className="text-muted-foreground"> / {promo.usageLimit || '∞'}</span>
                                                    </div>
                                                    {promo.usageLimit && promo.usedCount >= promo.usageLimit && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Limit Reached</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(promo)}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(promo.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
