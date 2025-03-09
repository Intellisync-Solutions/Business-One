import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Copy, Printer, Share2, Bookmark } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { ReactNode } from 'react';

interface AIGeneratedContentProps {
  title: string;
  description?: string;
  analysis: string;
  recommendations: string;
  loading?: boolean;
  error?: string;
  onSave?: () => void;
  onCopy?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export function AIGeneratedContent({
  title,
  description,
  analysis,
  recommendations,
  loading = false,
  error,
  onSave,
  onCopy,
  onPrint,
  onShare,
  onBookmark
}: AIGeneratedContentProps) {
  const [activeTab, setActiveTab] = useState<string>('analysis');

  // Enhanced markdown rendering with react-markdown
  const formatMarkdown = (content: string) => {
    if (!content) return <p className="text-muted-foreground italic">No content available</p>;
    
    // Define type-safe component overrides
    type ComponentsType = {
      [nodeType: string]: React.ComponentType<{
        children?: ReactNode;
        [key: string]: any;
      }>;
    };
    
    const components: ComponentsType = {
      h1: ({ children, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>,
      h3: ({ children, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props}>{children}</h3>,
      h4: ({ children, ...props }) => <h4 className="text-base font-semibold mt-3 mb-2" {...props}>{children}</h4>,
      p: ({ children, ...props }) => <p className="my-2" {...props}>{children}</p>,
      ul: ({ children, ...props }) => <ul className="my-2 list-disc pl-6" {...props}>{children}</ul>,
      ol: ({ children, ...props }) => <ol className="my-2 list-decimal pl-6" {...props}>{children}</ol>,
      li: ({ children, ...props }) => <li className="ml-2" {...props}>{children}</li>,
      strong: ({ children, ...props }) => <strong className="font-semibold" {...props}>{children}</strong>,
      blockquote: ({ children, ...props }) => (
        <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic" {...props}>{children}</blockquote>
      ),
      code: ({ children, inline, ...props }) => (
        inline ? 
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>{children}</code> : 
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto" {...props}>{children}</pre>
      ),
    };
    
    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown components={components}>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Ensure AI model reference is updated to GPT-4o-mini
  const AI_MODEL = 'gpt-4o-mini';

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-center text-muted-foreground">Generating Intellisync insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex space-x-1">
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Download className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
            {onCopy && (
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4" />
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {onBookmark && (
              <Button variant="outline" size="sm" onClick={onBookmark}>
                <Bookmark className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analysis" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md p-4 border border-slate-200 dark:border-slate-800">
            <TabsContent value="analysis" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="prose dark:prose-invert max-w-none">
                  {formatMarkdown(analysis)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="prose dark:prose-invert max-w-none">
                  {formatMarkdown(recommendations)}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>Generated by Intellisync AI ({AI_MODEL})</p>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs p-0 h-auto"
            onClick={() => setActiveTab(activeTab === 'analysis' ? 'recommendations' : 'analysis')}
          >
            View {activeTab === 'analysis' ? 'Recommendations' : 'Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
