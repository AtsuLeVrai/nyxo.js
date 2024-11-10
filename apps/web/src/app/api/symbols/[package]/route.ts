import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { SymbolInfo } from "@/types";
import { NextResponse } from "next/server";
import {
    ModuleResolutionKind,
    type Node,
    type Program,
    type SourceFile,
    SyntaxKind,
    type Symbol as TsSymbol,
    type TypeChecker,
    createProgram,
    displayPartsToString,
    forEachChild,
    getDefaultCompilerOptions,
    isClassDeclaration,
    isExportDeclaration,
    isFunctionDeclaration,
    isInterfaceDeclaration,
    isMethodDeclaration,
    isMethodSignature,
    isPropertyDeclaration,
    isPropertySignature,
    isStringLiteral,
    isTypeAliasDeclaration,
    isVariableStatement,
} from "typescript";

const resolveModulePath = (currentPath: string, importPath: string): string | undefined => {
    const possibleExtensions = [".ts", ".tsx", ".d.ts"];
    const basePath = join(dirname(currentPath), importPath);

    for (const ext of possibleExtensions) {
        if (existsSync(basePath + ext)) {
            return basePath + ext;
        }
    }

    return existsSync(basePath) && existsSync(join(basePath, "index.ts")) ? join(basePath, "index.ts") : undefined;
};

const getSymbols = (
    sourceFile: SourceFile,
    checker: TypeChecker,
    program: Program,
    visited = new Set<string>(),
): SymbolInfo[] => {
    const symbols: SymbolInfo[] = [];
    visited.add(sourceFile.fileName);

    const processSymbol = (symbol: TsSymbol, node: Node) => {
        const type = checker.getTypeAtLocation(node);
        const info: SymbolInfo = {
            name: symbol.getName(),
            kind: SyntaxKind[node.kind],
            documentation: displayPartsToString(symbol.getDocumentationComment(checker)),
            fileName: sourceFile.fileName,
            type: checker.typeToString(type),
            isExported: true,
        };

        if (isFunctionDeclaration(node) || isMethodDeclaration(node)) {
            info.parameters = node.parameters.map((p) => ({
                name: p.name.getText(),
                type: checker.typeToString(checker.getTypeAtLocation(p)),
            }));
        }

        if (isClassDeclaration(node) || isInterfaceDeclaration(node)) {
            info.properties = [];
            info.methods = [];

            symbol.members?.forEach((member, key) => {
                const decl = member.declarations?.[0];
                if (!decl) {
                    return;
                }

                if (isPropertyDeclaration(decl) || isPropertySignature(decl)) {
                    info.properties?.push({
                        name: key.toString(),
                        type: checker.typeToString(checker.getTypeAtLocation(decl)),
                    });
                } else if (isMethodDeclaration(decl) || isMethodSignature(decl)) {
                    const signature = checker.getSignatureFromDeclaration(decl);
                    if (signature) {
                        info.methods?.push({
                            name: key.toString(),
                            returnType: checker.typeToString(checker.getReturnTypeOfSignature(signature)),
                        });
                    }
                }
            });
        }

        symbols.push(info);
    };

    const visitNode = (node: Node): void => {
        if (isExportDeclaration(node) && node.moduleSpecifier && isStringLiteral(node.moduleSpecifier)) {
            const modulePath = resolveModulePath(sourceFile.fileName, node.moduleSpecifier.text);
            if (modulePath && !visited.has(modulePath)) {
                const moduleSource = program.getSourceFile(modulePath);
                if (moduleSource) {
                    symbols.push(...getSymbols(moduleSource, checker, program, visited));
                }
            }
        } else if (
            (isVariableStatement(node) ||
                isFunctionDeclaration(node) ||
                isClassDeclaration(node) ||
                isInterfaceDeclaration(node) ||
                isTypeAliasDeclaration(node)) &&
            node.modifiers?.some((m) => m.kind === SyntaxKind.ExportKeyword)
        ) {
            if (isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    const symbol = checker.getSymbolAtLocation(decl.name);
                    if (symbol) {
                        processSymbol(symbol, decl);
                    }
                }
            } else if ("name" in node && node.name) {
                const symbol = checker.getSymbolAtLocation(node.name);
                if (symbol) {
                    processSymbol(symbol, node);
                }
            }
        }

        forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    return symbols;
};

export async function GET(_request: Request, { params }: { params: Promise<{ package: string }> }) {
    try {
        const { package: packageName } = await params;

        if (typeof packageName !== "string") {
            return NextResponse.json({ error: "Invalid package name" }, { status: 400 });
        }

        const packagePath = join(process.cwd(), "..", "..", "packages", packageName, "src", "index.ts");
        if (!existsSync(packagePath)) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        const program = createProgram([packagePath], {
            ...getDefaultCompilerOptions(),
            moduleResolution: ModuleResolutionKind.NodeNext,
        });

        const sourceFile = program.getSourceFile(packagePath);
        if (!sourceFile) {
            throw new Error("Failed to create source file");
        }

        const symbols = getSymbols(sourceFile, program.getTypeChecker(), program);
        return NextResponse.json(symbols);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}
