'use client';

import React from 'react';
import { ModernTemplateId, MODERN_TEMPLATES } from '@/lib/modern-templates';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';

interface ModernTemplateSelectorProps {
  selectedTemplate: ModernTemplateId;
  onSelectTemplate: (templateId: ModernTemplateId) => void;
}

export function ModernTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: ModernTemplateSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Choose Your Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODERN_TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-base">{template.name}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      ATS Score: {template.atsScore}
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                
                {/* Color scheme preview */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Colors:</span>
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.colorScheme.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.colorScheme.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.colorScheme.accent }}
                      title="Accent"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-2">
                    {template.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
