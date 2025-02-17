import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BusinessPlanDisplayProps {
  businessPlan: string;
  businessName?: string;
}

export function BusinessPlanDisplay({ businessPlan, businessName }: BusinessPlanDisplayProps) {
  // Explicitly use React to satisfy TypeScript
  const _react = React;

  // Parse the business plan into sections
  const parsedSections = useMemo(() => {
    const sections: Record<string, string[]> = {};
    let currentSection = '';

    businessPlan.split('\n').forEach(line => {
      // Detect section headers (assuming they are in ALL CAPS or start with #)
      if (line.trim().match(/^(#|[A-Z\s]+:)/) && line.trim().length > 0) {
        currentSection = line.trim().replace(/^#\s*/, '').replace(/:$/, '');
        sections[currentSection] = [];
      } else if (line.trim() && currentSection) {
        sections[currentSection].push(line.trim());
      }
    });

    return sections;
  }, [businessPlan]);

  return (
    <div className="space-y-4">
      {businessName && (
        <h2 className="text-2xl font-bold mb-4">
          Business Plan for {businessName}
        </h2>
      )}

      {Object.entries(parsedSections).map(([sectionName, content]) => (
        <Card key={sectionName} className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{sectionName}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-4">
            {content.map((paragraph, index) => (
              <p key={index} className="mb-2 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>
      ))}

      {Object.keys(parsedSections).length === 0 && (
        <div className="text-center text-muted-foreground p-8">
          No structured business plan could be generated.
        </div>
      )}
    </div>
  );
}
