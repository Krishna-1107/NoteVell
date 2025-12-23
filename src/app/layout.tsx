import type { Metadata } from "next";
import "../style/globals.css"
import {ThemeProvider} from "../providers/ThemeProvider"
import { Toaster } from "sonner"
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import NoteProvider from "@/providers/NoteProvider";


export const metadata: Metadata = {
  title: "NoteVell",
  description: "A note taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <NoteProvider>
          <SidebarProvider>
          <AppSidebar/>
          <SidebarInset>
          <Header />
          <main className="flex flex-1 flex-col px-4 pt-5 xl:px-8">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
          </SidebarInset>
          </SidebarProvider>
          </NoteProvider>
          </ThemeProvider>
        </body>
      </html>
  );
}
