"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface DashboardShellProps {
    children: React.ReactNode;
    headerAction?: React.ReactNode;
}

export default function DashboardShell({ children, headerAction }: DashboardShellProps) {
    const { theme, toggleTheme, mounted } = useTheme();

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <nav className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="font-semibold text-lg tracking-tight">Stripe Dashboard</span>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <a href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Dashboard</a>
                            <a href="/settings" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Settings</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {headerAction}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
