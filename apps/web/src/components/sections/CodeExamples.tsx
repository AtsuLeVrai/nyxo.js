"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Code,
  Copy,
  Play,
  Settings,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CodeBlock, type ProgrammingLanguage } from "@/components/ui/CodeBlock";
import { Tabs } from "@/components/ui/Tabs";
import type { CodeExample } from "@/utils/types";

interface CodeExamplesProps {
  examples: CodeExample[];
  title?: string;
  description?: string;
  interactive?: boolean;
  showPlayground?: boolean;
  defaultTab?: number;
  className?: string;
}

interface ExampleResult {
  success: boolean;
  output: string;
  error?: string;
}

export function CodeExamples({
  examples,
  title = "Code Examples",
  description,
  interactive = false,
  showPlayground = false,
  defaultTab = 0,
  className = "",
}: CodeExamplesProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<number>(defaultTab);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [exampleResult, setExampleResult] = useState<ExampleResult | null>(
    null,
  );
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableCode, setEditableCode] = useState<string>(
    examples[defaultTab]?.code || "",
  );

  // Function to run code example (simulated)
  const runExample = (): void => {
    setIsRunning(true);
    setExampleResult(null);

    // Simulate a delay to show loading state
    setTimeout(() => {
      try {
        // For demo purposes, we're just showing a simulated output
        // In a real application, you might evaluate this code in a safe way
        const result: ExampleResult = {
          success: true,
          output: `// Example output for "${examples[activeTab].title}"\n// This is a simulated result for demonstration purposes\n\n✅ Command executed successfully\n📊 Response received from Discord API\n🤖 Bot responded with the expected message`,
        };

        setExampleResult(result);
      } catch (error) {
        setExampleResult({
          success: false,
          output: "",
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setIsRunning(false);
      }
    }, 1500);
  };

  // Copy code to clipboard
  const copyCode = (): void => {
    navigator.clipboard.writeText(
      isEditing ? editableCode : examples[activeTab].code,
    );
  };

  // Handle tab change
  const handleTabChange = (index: number): void => {
    setActiveTab(index);
    setExampleResult(null);
    setEditableCode(examples[index].code);
    setIsEditing(false);
  };

  // Format tabs from examples
  const tabs = examples.map((example, index) => ({
    id: `example-${index}`,
    label: example.title,
    icon: <Code className="h-4 w-4" />,
    content: (
      <div>
        <CodeBlock
          code={isEditing && index === activeTab ? editableCode : example.code}
          language={example.language as ProgrammingLanguage}
          title={example.fileName || `Example ${index + 1}`}
          showLineNumbers={true}
          showCopyButton={false}
          highlightedLines={example.highlightedLines}
        />
      </div>
    ),
  }));

  return (
    <div
      className={`overflow-hidden rounded-lg border border-dark-500 bg-dark-800 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-dark-500 border-b bg-dark-700 px-4 py-3">
        <div>
          <h3 className="font-bold text-lg text-slate-100">{title}</h3>
          {description && (
            <p className="mt-1 text-slate-400 text-sm">{description}</p>
          )}
        </div>

        {interactive && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyCode()}
              leadingIcon={<Copy className="h-4 w-4" />}
            >
              Copy
            </Button>

            {showPlayground && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                  leadingIcon={<Settings className="h-4 w-4" />}
                >
                  Settings
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={runExample}
                  disabled={isRunning}
                  loading={isRunning}
                  leadingIcon={<Play className="h-4 w-4" />}
                >
                  Run
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Settings panel (collapsible) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-dark-500 border-b bg-dark-600"
          >
            <div className="p-4">
              <h4 className="mb-3 font-medium text-slate-200 text-sm">
                Playground Settings
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 rounded border-dark-500 bg-dark-700 text-primary-500"
                      checked={isEditing}
                      onChange={() => setIsEditing(!isEditing)}
                    />
                    <span className="ml-2 text-slate-300 text-sm">
                      Enable code editing
                    </span>
                  </label>
                </div>

                {isEditing && (
                  <div className="flex space-x-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setEditableCode(examples[activeTab].code)}
                    >
                      Reset Code
                    </Button>

                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => setIsEditing(false)}
                    >
                      Apply Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code tabs */}
      <div className="p-4">
        <Tabs
          items={tabs}
          defaultTab={`example-${defaultTab}`}
          onChange={(tabId) => {
            const index = Number.parseInt(tabId.split("-")[1]);
            handleTabChange(index);
          }}
        />
      </div>

      {/* Results panel (for interactive examples) */}
      {interactive && showPlayground && (
        <div className="border-dark-500 border-t bg-dark-700 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-medium text-slate-200 text-sm">Output</h4>

            {exampleResult && (
              <Badge
                variant={exampleResult.success ? "success" : "danger"}
                size="sm"
              >
                {exampleResult.success ? "Success" : "Error"}
              </Badge>
            )}
          </div>

          <div className="h-40 overflow-auto rounded border border-dark-500 bg-dark-800 p-3 font-mono text-slate-300 text-sm">
            {isRunning ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  <span className="text-slate-400">Running example...</span>
                </div>
              </div>
            ) : exampleResult ? (
              exampleResult.success ? (
                <pre className="whitespace-pre-wrap">
                  {exampleResult.output}
                </pre>
              ) : (
                <div className="flex items-start text-danger-400">
                  <AlertCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <pre className="whitespace-pre-wrap">
                    {exampleResult.error}
                  </pre>
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                Click "Run" to execute this example
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with links */}
      <div className="border-dark-500 border-t bg-dark-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            Powered by Nyxo.js Framework
          </div>

          <a
            href={"/docs/examples"}
            className="flex items-center font-medium text-primary-400 text-sm hover:text-primary-300"
          >
            View more examples
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
