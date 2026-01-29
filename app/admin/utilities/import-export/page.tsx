"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, FileUp, FileDown, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ImportExportPage() {
    const [activeTab, setActiveTab] = useState("clients");

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Data Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Import and export system data in CSV format.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="clients" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>

                <TabsContent value="clients">
                    <ImportExportPanel
                        type="clients"
                        title="Client Database"
                        description="Manage client records. Importing will automatically create User accounts (login credentials) for new clients."
                        exportLabel="Export Clients CSV"
                        importLabel="Import Clients CSV"
                        importWarning="Rows must include Email. A User account will be created for each row. Default password is 'ChangeMe123!'."
                    />
                </TabsContent>

                <TabsContent value="products">
                    <ImportExportPanel
                        type="products"
                        title="Product Catalog"
                        description="Manage products, services, and pricing."
                        exportLabel="Export Products CSV"
                        importLabel="Import Products CSV"
                    />
                </TabsContent>

                <TabsContent value="invoices">
                    <ImportExportPanel
                        type="invoices"
                        title="Invoices & Billing"
                        description="Export invoice history for accounting."
                        exportLabel="Export Invoices CSV"
                        importLabel="Import Invoices CSV"
                        disableImport={true} // Import invoices is complex, maybe disable for now? Or keep enabled but warn.
                        importWarning="Importing invoices requires matching Client Emails. Ensure clients exist first."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface ImportExportPanelProps {
    type: string;
    title: string;
    description: string;
    exportLabel: string;
    importLabel: string;
    disableImport?: boolean;
    importWarning?: string;
}

function ImportExportPanel({ type, title, description, exportLabel, importLabel, disableImport, importWarning }: ImportExportPanelProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [fileStats, setFileStats] = useState<{ name: string, size: number } | null>(null);
    const [csvContent, setCsvContent] = useState<string | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const response = await api.get('/import-export/export', {
                params: { type },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success(`${title} exported successfully!`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to export data.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileStats({ name: file.name, size: file.size });
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvContent(text);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!csvContent) return;

        try {
            setIsImporting(true);
            setImportResult(null);

            const response = await api.post('/import-export/import', {
                type,
                csvContent
            });

            setImportResult(response.data.data);
            toast.success("Import processing complete!");
            // Reset file input if needed or keep result visible
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Import failed.");
            setImportResult({ error: error.response?.data?.message || "Unknown error" });
        } finally {
            setIsImporting(false);
        }
    };

    const handleDownloadTemplate = (type: string) => {
        let csvContent = "";
        let filename = `${type}_template.csv`;

        if (type === 'clients') {
            csvContent = 'FirstName,LastName,Email,Company,Phone,Address,City,Country,Password\nJohn,Doe,john@example.com,Doe Inc,+1234567890,123 Main St,New York,USA,SecretPass123!';
        } else if (type === 'products') {
            csvContent = 'Name,Type,MonthlyPrice,AnnualPrice\n"Basic Web Hosting",HOSTING,9.99,99.99\n"Premium VPS",VPS,29.99,299.99';
        } else if (type === 'invoices') {
            csvContent = 'InvoiceNumber,ClientEmail,Total,Status,DueDate\nINV-1001,john@example.com,50.00,UNPAID,2025-12-31';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Template downloaded!");
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* EXPORT CARD */}
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-primary" />
                        Export Data
                    </CardTitle>
                    <CardDescription>
                        Download current {type} data as a CSV file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-secondary/20 p-4 rounded-lg text-sm text-muted-foreground">
                        <p>Format: CSV (Comma Separated Values)</p>
                        <p>Includes all active and inactive records.</p>
                    </div>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full"
                    >
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {exportLabel}
                    </Button>
                </CardContent>
            </Card>

            {/* IMPORT CARD */}
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-orange-500" />
                        Import Data
                    </CardTitle>
                    <CardDescription>
                        Bulk create or update {type} from CSV.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {disableImport ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Import Disabled</AlertTitle>
                            <AlertDescription>
                                {importWarning || "Import is currently disabled for this data type."}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {importWarning && (
                                <Alert className="bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>{importWarning}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor={`file-${type}`}>Select CSV File</Label>
                                <Input id={`file-${type}`} type="file" accept=".csv" onChange={handleFileChange} />
                            </div>

                            {fileStats && (
                                <div className="text-xs text-muted-foreground">
                                    File: {fileStats.name} ({(fileStats.size / 1024).toFixed(1)} KB)
                                </div>
                            )}

                            {importResult && (
                                <div className={`p-3 rounded-md text-sm ${importResult.error ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                                    {importResult.error ? (
                                        <p className="font-bold">Error: {importResult.error}</p>
                                    ) : (
                                        <div>
                                            <p className="font-bold flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Import Complete
                                            </p>
                                            <ul className="list-disc list-inside mt-1">
                                                <li>Success: {importResult.success}</li>
                                                <li>Failed: {importResult.failed}</li>
                                            </ul>
                                            {importResult.errors?.length > 0 && (
                                                <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded max-h-32 overflow-y-auto">
                                                    <p className="font-semibold text-xs mb-1">Errors:</p>
                                                    {importResult.errors.map((e: string, i: number) => (
                                                        <p key={i} className="text-xs">{e}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button
                                onClick={handleImport}
                                disabled={isImporting || !csvContent}
                                variant="secondary"
                                className="w-full"
                            >
                                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {importLabel}
                            </Button>

                            <div className="pt-2 border-t border-border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadTemplate(type)}
                                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <Download className="mr-2 h-3 w-3" />
                                    Download Demo CSV Template
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
