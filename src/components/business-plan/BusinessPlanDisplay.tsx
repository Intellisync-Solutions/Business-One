import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Copy, Printer, FileBadge, FileText } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/components/ui/use-toast";
import { ReactNode } from 'react';

interface BusinessPlanDisplayProps {
  businessPlan: string;
  businessName?: string;
}

export function BusinessPlanDisplay({ businessPlan, businessName }: BusinessPlanDisplayProps) {
  const { toast } = useToast();
  const [activeTabs, setActiveTabs] = useState<Record<string, boolean>>({});

  // Enhanced markdown rendering with react-markdown, similar to AIGeneratedContent component
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

  // Parse the business plan, preserving markdown formatting
  const sections = useMemo(() => {
    // First try to process the content as properly formatted markdown
    const result: Record<string, string> = {};
    let currentSection = '';
    let currentContent: string[] = [];

    // Handle case where businessPlan might be JSON
    let planText = businessPlan;
    try {
      // Check if the business plan is a JSON string
      const parsedPlan = JSON.parse(businessPlan);
      if (typeof parsedPlan === 'object') {
        planText = parsedPlan.businessPlan || parsedPlan.remixedSection || businessPlan;
      }
    } catch (e) {
      // Not JSON, use as is
      console.log('Business plan is not JSON, using as plain text');
    }

    planText.split('\n').forEach(line => {
      // Check for markdown headings (## Heading)
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      
      if (headerMatch && headerMatch[1].length <= 2) {
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          result[currentSection] = currentContent.join('\n');
          currentContent = [];
        }
        currentSection = headerMatch[2].trim();
      } else if (currentSection) {
        currentContent.push(line);
      } else if (line.trim() && !currentSection) {
        // Handle case where content starts without a header
        currentSection = "Executive Summary";
        currentContent.push(line);
      }
    });

    // Add the last section
    if (currentSection && currentContent.length > 0) {
      result[currentSection] = currentContent.join('\n');
    }

    // If no proper sections were detected, try alternative format
    if (Object.keys(result).length === 0) {
      // Fallback to ALL CAPS with colon format
      let altCurrentSection = '';
      
      planText.split('\n').forEach(line => {
        if (line.trim().match(/^([A-Z][A-Z\s]+):/) && line.trim().length > 0) {
          altCurrentSection = line.trim().replace(/:$/, '');
          result[altCurrentSection] = '';
        } else if (line.trim() && altCurrentSection) {
          result[altCurrentSection] = (result[altCurrentSection] ? result[altCurrentSection] + '\n' : '') + line.trim();
        }
      });
    }

    console.log('Parsed business plan sections:', Object.keys(result));
    return result;
  }, [businessPlan]);

  // Handle copy full business plan
  const handleCopy = () => {
    navigator.clipboard.writeText(businessPlan)
      .then(() => {
        toast({
          title: "Business Plan Copied",
          description: "The full business plan has been copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive"
        });
      });
  };

  // Handle print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Failed",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive"
      });
      return;
    }

    // Create a styled document for printing
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${businessName ? `Business Plan for ${businessName}` : 'Business Plan'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 16px; }
            h2 { font-size: 20px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
            h3 { font-size: 18px; margin-top: 18px; margin-bottom: 10px; }
            p { margin-bottom: 12px; }
            ul, ol { margin-top: 8px; margin-bottom: 16px; padding-left: 24px; }
            .section { margin-bottom: 32px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${businessName ? `Business Plan for ${businessName}` : 'Business Plan'}</h1>
    `);
    
    // Add each section
    Object.entries(sections).forEach(([sectionName, content]) => {
      printWindow.document.write(`
        <div class="section">
          <h2>${sectionName}</h2>
          ${content.replace(/\n/g, '<br>')}
        </div>
      `);
    });
    
    // Close the document
    printWindow.document.write(`
          <div class="footer">
            Generated by Intellisync Business Suite (${new Date().toLocaleDateString()})
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    // Delay printing to ensure content is loaded
    setTimeout(() => printWindow.print(), 500);
  };

  // Handle save as PDF (uses browser print dialog)
  const handleSaveAsPDF = () => handlePrint();

  // Toggle section expansion/collapse
  const toggleSection = (section: string) => {
    setActiveTabs(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Header and business plan name */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-2">
        <div>
          <h1 className="text-3xl font-bold">
            {businessName ? `Business Plan for ${businessName}` : 'Business Plan'}
          </h1>
          <p className="text-muted-foreground mt-1">Generated by Intellisync AI (gpt-4o-mini)</p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveAsPDF}>
            <Download className="h-4 w-4 mr-1" />
            Save PDF
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="business-plan-sections space-y-4">
        {Object.entries(sections).length > 0 ? (
          Object.entries(sections).map(([sectionName, content]) => (
            <Card key={sectionName} className="w-full overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
              <CardHeader 
                className={`cursor-pointer ${activeTabs[sectionName] ? 'pb-2' : 'pb-6'}`} 
                onClick={() => toggleSection(sectionName)}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">{sectionName}</CardTitle>
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    {activeTabs[sectionName] ? 
                      <FileText className="h-4 w-4" /> : 
                      <FileBadge className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription>
                  {!activeTabs[sectionName] && content.split('\n')[0].substring(0, 100)}...
                </CardDescription>
              </CardHeader>
              
              {activeTabs[sectionName] && (
                <>
                  <Separator />
                  <CardContent className="pt-4 pb-6">
                    <ScrollArea 
                      className="overflow-y-auto" 
                      style={{ maxHeight: 'calc(80vh - 200px)', minHeight: '200px' }}
                      type="always"
                      scrollHideDelay={0}
                    >
                      <div className="pb-2 pr-4">
                        {formatMarkdown(content)}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center p-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Business Plan Content</h3>
              <p className="text-muted-foreground mt-1">Complete all sections and generate a business plan.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
