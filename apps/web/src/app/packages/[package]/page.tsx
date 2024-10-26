"use client";

import { Layout } from "@/components";
import type { SymbolInfo } from "@/types";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type CategoryState = Record<string, SymbolInfo[]>;

export default function PackagePage() {
    const params = useParams();
    const packageName = params.package as string;
    const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSymbols = useCallback(async () => {
        if (!packageName) {
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch(`/api/symbols/${packageName}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch symbols: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            setSymbols(data);
        } catch (error) {
            setError(
                `An error occurred while fetching symbols: ${error instanceof Error ? error.message : String(error)}`
            );
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [packageName]);

    useEffect(() => {
        void fetchSymbols();
    }, [fetchSymbols]);

    const categories = useMemo(() => {
        return symbols.reduce<CategoryState>((acc, symbol) => {
            if (!acc[symbol.kind]) {
                acc[symbol.kind] = [];
            }

            acc[symbol.kind].push(symbol);
            return acc;
        }, {});
    }, [symbols]);

    const packageSummary = useMemo(() => {
        if (symbols.length === 0) {
            return "";
        }
        const classCount = symbols.filter((symbol) => symbol.kind === "ClassDeclaration").length;
        const functionCount = symbols.filter((symbol) => symbol.kind === "FunctionDeclaration").length;
        const interfaceCount = symbols.filter((symbol) => symbol.kind === "InterfaceDeclaration").length;
        return `This package contains ${symbols.length} exported symbols, including ${classCount} classes, ${functionCount} functions, and ${interfaceCount} interfaces.`;
    }, [symbols]);

    const toggleCategory = useCallback((category: string) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }

            return newSet;
        });
    }, []);

    const filteredCategories = useMemo(() => {
        return Object.entries(categories).reduce<CategoryState>((acc, [category, symbols]) => {
            const filteredSymbols = symbols.filter(
                (symbol) =>
                    symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    symbol.documentation.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredSymbols.length > 0) {
                acc[category] = filteredSymbols;
            }

            return acc;
        }, {});
    }, [categories, searchTerm]);

    const renderSymbol = useCallback(
        (symbol: SymbolInfo) => (
            <motion.div
                key={symbol.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4 bg-neutral-800 rounded-lg shadow-lg"
            >
                <h3 className="text-xl font-semibold text-blue-400">{symbol.name}</h3>
                <p className="text-sm text-gray-400 mb-2">Type: {symbol.type}</p>
                <p className="text-gray-300 mt-2">{symbol.documentation || "No documentation available."}</p>

                {symbol.parameters && symbol.parameters.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold text-purple-400">Parameters:</h4>
                        <ul className="list-disc list-inside">
                            {symbol.parameters.map((param) => (
                                <li key={param.name} className="text-gray-300">
                                    <span className="font-semibold">{param.name}</span>: {param.type}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {symbol.properties && symbol.properties.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold text-purple-400">Properties:</h4>
                        <ul className="list-disc list-inside">
                            {symbol.properties.map((prop) => (
                                <li key={prop.name} className="text-gray-300">
                                    <span className="font-semibold">{prop.name}</span>: {prop.type}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {symbol.methods && symbol.methods.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold text-purple-400">Methods:</h4>
                        <ul className="list-disc list-inside">
                            {symbol.methods.map((method) => (
                                <li key={method.name} className="text-gray-300">
                                    <span className="font-semibold">{method.name}</span>: {method.returnType}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {symbol.enumMembers && symbol.enumMembers.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold text-purple-400">Enum Members:</h4>
                        <ul className="list-disc list-inside">
                            {symbol.enumMembers.map((member) => (
                                <li key={member} className="text-gray-300">
                                    {member}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-4">File: {symbol.fileName}</p>
                {symbol.isExported && (
                    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded mt-2">
                        Exported
                    </span>
                )}
            </motion.div>
        ),
        []
    );

    return (
        <Layout>
            <main className="flex-1 p-8 overflow-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-bold mb-6 py-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block">
                        {packageName.charAt(0).toUpperCase() + packageName.slice(1)} Package Documentation
                    </h1>

                    {packageSummary && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6 text-gray-300"
                        >
                            {packageSummary}
                        </motion.p>
                    )}

                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search symbols..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full p-2 pl-10 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-500 text-white p-4 rounded-lg">{error}</div>
                    ) : Object.keys(filteredCategories).length === 0 ? (
                        <p className="text-xl text-gray-400">No symbols found for this package.</p>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {Object.entries(filteredCategories).map(([category, symbols]) => (
                                <div key={category} className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category)}
                                        className="flex justify-between items-center w-full p-4 bg-neutral-800 rounded-lg shadow-lg hover:bg-neutral-700 transition-colors duration-200"
                                    >
                                        <h2 className="text-2xl font-semibold text-blue-400">{category}</h2>
                                        {expandedCategories.has(category) ? (
                                            <ChevronUp size={24} />
                                        ) : (
                                            <ChevronDown size={24} />
                                        )}
                                    </button>
                                    {expandedCategories.has(category) && (
                                        <div className="mt-4 space-y-4">{symbols.map(renderSymbol)}</div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </Layout>
    );
}
