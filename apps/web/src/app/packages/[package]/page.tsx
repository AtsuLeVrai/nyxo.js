"use client";

import { Layout } from "@/components";
import type { SymbolInfo } from "@/types";
import { Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function PackagePage() {
    const { package: packageName } = useParams() as { package: string };
    const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/symbols/${packageName}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch symbols: ${res.status}`);
                }
                setSymbols(await res.json());
            } catch (error) {
                setError(error instanceof Error ? error.message : String(error));
            } finally {
                setIsLoading(false);
            }
        };

        void fetchSymbols();
    }, [packageName]);

    const filteredSymbols = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return symbols.filter(
            (s) => s.name.toLowerCase().includes(term) || s.documentation.toLowerCase().includes(term),
        );
    }, [symbols, searchTerm]);

    const renderSymbolDetails = useCallback(
        (symbol: SymbolInfo) => (
            <div className="p-6 bg-neutral-900 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">{symbol.name}</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400">Type</h3>
                        <p className="text-white font-mono">{symbol.type}</p>
                    </div>

                    {symbol.documentation && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">Documentation</h3>
                            <p className="text-white">{symbol.documentation}</p>
                        </div>
                    )}

                    {symbol.parameters && symbol.parameters.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">Parameters</h3>
                            <div className="space-y-2">
                                {symbol.parameters.map((param) => (
                                    <div
                                        key={param.name}
                                        className="flex"
                                    >
                                        <span className="text-purple-400 font-mono">{param.name}</span>
                                        <span className="text-gray-400 mx-2">:</span>
                                        <span className="text-blue-400 font-mono">{param.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {symbol.properties && symbol.properties.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">Properties</h3>
                            <div className="space-y-2">
                                {symbol.properties.map((prop) => (
                                    <div
                                        key={prop.name}
                                        className="flex"
                                    >
                                        <span className="text-purple-400 font-mono">{prop.name}</span>
                                        <span className="text-gray-400 mx-2">:</span>
                                        <span className="text-blue-400 font-mono">{prop.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {symbol.methods && symbol.methods.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">Methods</h3>
                            <div className="space-y-2">
                                {symbol.methods?.map((method) => (
                                    <div
                                        key={method.name}
                                        className="flex"
                                    >
                                        <span className="text-purple-400 font-mono">{method.name}</span>
                                        <span className="text-gray-400 mx-2">→</span>
                                        <span className="text-blue-400 font-mono">{method.returnType}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ),
        [],
    );

    if (isLoading) {
        return (
            <Layout>
                <div className="flex h-screen items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="p-4 text-red-400">{error}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex h-screen">
                <div className="w-80 border-r border-neutral-800 p-4 flex flex-col">
                    <div className="relative mb-4">
                        <Search
                            className="absolute left-3 top-2.5 text-gray-500"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex-1 overflow-auto">
                        {filteredSymbols.map((symbol) => (
                            <button
                                type="button"
                                key={symbol.name}
                                onClick={() => setActiveSymbol(symbol.name)}
                                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                                    activeSymbol === symbol.name
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-300 hover:bg-neutral-800"
                                }`}
                            >
                                <div className="font-medium">{symbol.name}</div>
                                <div className="text-sm opacity-70">{symbol.kind}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                    {activeSymbol ? (
                        renderSymbolDetails(filteredSymbols.find((s) => s.name === activeSymbol) as SymbolInfo)
                    ) : (
                        <div className="text-center text-gray-400 mt-10">Select a symbol to view details</div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
