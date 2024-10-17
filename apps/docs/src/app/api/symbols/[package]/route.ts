import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import * as ts from "typescript";
import type { SymbolInfo } from "@/types";

const resolveModulePath = (currentPath: string, importPath: string): string | undefined => {
    const possibleExtensions = [".ts", ".tsx", ".d.ts"];
    const basePath = join(dirname(currentPath), importPath);

    for (const ext of possibleExtensions) {
        const fullPath = basePath + ext;
        if (existsSync(fullPath)) return fullPath;
    }

    return existsSync(basePath) && existsSync(join(basePath, "index.ts")) ? join(basePath, "index.ts") : undefined;
};

const getSymbols = (
    sourceFile: ts.SourceFile,
    checker: ts.TypeChecker,
    program: ts.Program,
    visitedFiles: Set<string> = new Set()
): SymbolInfo[] => {
    const symbols: SymbolInfo[] = [];
    visitedFiles.add(sourceFile.fileName);

    const addSymbol = (symbol: ts.Symbol, node: ts.Node): void => {
        const type = checker.getTypeAtLocation(node);
        const symbolInfo: SymbolInfo = {
            name: symbol.getName(),
            kind: ts.SyntaxKind[node.kind],
            documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            fileName: sourceFile.fileName,
            isExported: true,
            type: checker.typeToString(type),
        };

        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
            symbolInfo.parameters = node.parameters.map((param) => ({
                name: param.name.getText(),
                type: checker.typeToString(checker.getTypeAtLocation(param)),
            }));
        } else if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
            symbolInfo.properties = [];
            symbolInfo.methods = [];
            if (symbol.members)
                for (const [key, member] of symbol.members.entries()) {
                    const memberDeclaration = member.declarations?.[0];
                    if (
                        (memberDeclaration && ts.isPropertyDeclaration(memberDeclaration)) ||
                        (memberDeclaration && ts.isPropertySignature(memberDeclaration))
                    ) {
                        symbolInfo.properties?.push({
                            name: key.toString(),
                            type: checker.typeToString(checker.getTypeAtLocation(memberDeclaration)),
                        });
                    } else if (
                        (memberDeclaration && ts.isMethodDeclaration(memberDeclaration)) ||
                        (memberDeclaration && ts.isMethodSignature(memberDeclaration))
                    ) {
                        symbolInfo.methods?.push({
                            name: key.toString(),
                            returnType: checker.typeToString(
                                checker.getReturnTypeOfSignature(
                                    checker.getSignatureFromDeclaration(memberDeclaration)!
                                )
                            ),
                        });
                    }
                }
        } else if (ts.isEnumDeclaration(node)) {
            symbolInfo.enumMembers = node.members.map((member) => member.name.getText());
        }

        symbols.push(symbolInfo);
    };

    const visit = (node: ts.Node): void => {
        if (ts.isExportDeclaration(node)) {
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                const modulePath = resolveModulePath(sourceFile.fileName, node.moduleSpecifier.text);
                if (modulePath && !visitedFiles.has(modulePath)) {
                    const moduleSource = program.getSourceFile(modulePath);
                    if (moduleSource) {
                        symbols.push(...getSymbols(moduleSource, checker, program, visitedFiles));
                    }
                }
            } else if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                for (const element of node.exportClause.elements) {
                    const symbol = checker.getSymbolAtLocation(element.name);
                    if (symbol) addSymbol(symbol, element);
                }
            }
        } else if (
            (ts.isVariableStatement(node) ||
                ts.isFunctionDeclaration(node) ||
                ts.isClassDeclaration(node) ||
                ts.isInterfaceDeclaration(node) ||
                ts.isTypeAliasDeclaration(node) ||
                ts.isEnumDeclaration(node)) &&
            node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
        ) {
            if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    const symbol = checker.getSymbolAtLocation(decl.name);
                    if (symbol) addSymbol(symbol, decl);
                }
            } else if ("name" in node && node.name) {
                const symbol = checker.getSymbolAtLocation(node.name);
                if (symbol) addSymbol(symbol, node);
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return symbols;
};

export async function GET(request: Request, { params }: { params: { package: string } }) {
    const packageName = params.package;

    if (typeof packageName !== "string") {
        return NextResponse.json({ error: "Invalid package name" }, { status: 400 });
    }

    const packagePath = join(process.cwd(), "..", "..", "packages", packageName, "src", "index.ts");

    if (!existsSync(packagePath)) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    try {
        const content = await readFile(packagePath, "utf8");

        const compilerOptions = ts.getDefaultCompilerOptions();
        compilerOptions.moduleResolution = ts.ModuleResolutionKind.NodeJs;

        const program = ts.createProgram([packagePath], compilerOptions);
        const sourceFile = program.getSourceFile(packagePath);
        const checker = program.getTypeChecker();

        if (!sourceFile) {
            throw new Error("Failed to create source file");
        }

        const symbols = getSymbols(sourceFile, checker, program);

        return NextResponse.json(symbols);
    } catch (error) {
        console.error("Error getting symbols:", error);
        return NextResponse.json(
            { error: "Internal server error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
