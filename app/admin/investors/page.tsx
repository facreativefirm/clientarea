"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import {
    Users,
    Search,
    Edit,
    CheckCircle2,
    XCircle,
    Loader2,
    DollarSign,
    Briefcase
} from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/shared/Badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

export default function AdminInvestorsPage() {
    const [investors, setInvestors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Edit Modal State
    const [editOpen, setEditOpen] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        commissionType: 'PERCENTAGE',
        commissionValue: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchInvestors();
    }, []);

    const fetchInvestors = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/investor/admin/all");
            setInvestors(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch investors");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (investor: any) => {
        setSelectedInvestor(investor);
        setEditForm({
            commissionType: investor.commissionType,
            commissionValue: investor.commissionValue,
            status: investor.status
        });
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/investor/admin/${selectedInvestor.id}`, editForm);
            toast.success("Investor updated successfully");
            setEditOpen(false);
            fetchInvestors();
        } catch (error) {
            toast.error("Failed to update investor");
        }
    };

    const filteredInvestors = investors.filter(inv =>
        inv.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Investor",
            accessorKey: "user.firstName" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="font-bold">{item.user.firstName} {item.user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{item.user.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Commission Rate",
            accessorKey: "commissionValue" as any,
            cell: (item: any) => (
                <Badge variant="outline" className="font-mono">
                    {item.commissionType === 'PERCENTAGE' ? `${item.commissionValue}%` : formatPrice(item.commissionValue)}
                </Badge>
            )
        },
        {
            header: "Earnings",
            accessorKey: "totalEarnings" as any,
            cell: (item: any) => (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-emerald-500">{formatPrice(item.totalEarnings)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Wallet:</span>
                        <span className="font-bold">{formatPrice(item.walletBalance)}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge variant={item.status === 'ACTIVE' ? 'success' : 'destructive'} className="text-[10px] uppercase">
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                    <Edit size={14} className="mr-2" /> Manage
                </Button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Sidebar />
            <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Investor Management</h1>
                        <p className="text-muted-foreground">Manage investor profiles and commission rates.</p>
                    </div>
                    <Button variant="outline" onClick={fetchInvestors}>
                        <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search investors..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <DataTable columns={columns} data={filteredInvestors} pagination />
                </div>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Investor Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Commission Type</Label>
                                <Select
                                    value={editForm.commissionType}
                                    onValueChange={(val) => setEditForm({ ...editForm, commissionType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Commission Value</Label>
                                <Input
                                    type="number"
                                    value={editForm.commissionValue}
                                    onChange={(e) => setEditForm({ ...editForm, commissionValue: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={handleUpdate}>Save Changes</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
