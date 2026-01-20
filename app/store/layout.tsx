import { StoreProvider } from "@/components/store/StoreProvider";
import { StoreNavbar } from "@/components/store/StoreNavbar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Toaster } from "sonner";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StoreProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <StoreNavbar />
                <main className="flex-1">
                    {children}
                </main>
                <StoreFooter />
                <Toaster richColors position="top-right" />
            </div>
        </StoreProvider>
    );
}
