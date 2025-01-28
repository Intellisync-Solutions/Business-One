import { RatioInterpretationData } from "@/components/financial/RatioInterpretation";

export interface RatioInput {
  name: string;
  label: string;
  placeholder: string;
  tooltip: string;
  min: number;
  required: boolean;
}

export interface FinancialRatio {
  title: string;
  description: string;
  interpretation: RatioInterpretationData;
  inputs: RatioInput[];
  calculate: (values: Record<string, number>) => number;
  formatResult: (value: number) => string;
}

export interface RatioCategory {
  title: string;
  ratios: FinancialRatio[];
}

export type RatioCategoryMap = Record<string, RatioCategory>;
