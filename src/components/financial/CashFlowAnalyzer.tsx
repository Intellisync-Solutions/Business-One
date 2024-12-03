import React, { useState } from 'react' // eslint-disable-line no-unused-vars
import { Card } from "@/components/ui/card" // eslint-disable-line no-unused-vars
import { Input } from "@/components/ui/input" // eslint-disable-line no-unused-vars
import { Label } from "@/components/ui/label" // eslint-disable-line no-unused-vars
import { Button } from "@/components/ui/button" // eslint-disable-line no-unused-vars
import { Info, Trash2 } from 'lucide-react' // eslint-disable-line no-unused-vars
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // eslint-disable-line no-unused-vars
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // eslint-disable-line no-unused-vars
import { ScrollArea } from "@/components/ui/scroll-area" // eslint-disable-line no-unused-vars
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // eslint-disable-line no-unused-vars
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // eslint-disable-line no-unused-vars
import type {
  CashFlowData,
  CashFlowProjection,
  ProductSales,
  ServiceIncome,
  SubscriptionRevenue,
  LicensingRoyalties,
  CustomExpense,
  OtherRevenue
} from '@/types/cashflow' // eslint-disable-line no-unused-vars
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog" // eslint-disable-line no-unused-vars
import { formatCurrency } from '@/utils/currency'

interface CashFlowAnalyzerProps {
  data: CashFlowData;
  onDataChange: (data: CashFlowData) => void;
}

export default function CashFlowAnalyzer({ data, onDataChange }: CashFlowAnalyzerProps) {
  const [activeTab, setActiveTab] = useState('revenue')
  const [projectionYears, setProjectionYears] = useState(1)
  const [projections, setProjections] = useState<CashFlowProjection[]>([])
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; index: number } | null>(null);

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    switch (itemToDelete.type) {
      case 'product':
        handleDeleteProduct(itemToDelete.index);
        break;
      case 'service':
        handleDeleteService(itemToDelete.index);
        break;
      case 'subscription':
        handleDeleteSubscription(itemToDelete.index);
        break;
      case 'licensing':
        handleDeleteLicensing(itemToDelete.index);
        break;
    }
    setItemToDelete(null);
  };

  const handleDeleteClick = (type: string, index: number) => {
    setItemToDelete({ type, index });
  };

  const handleDeleteProduct = (index: number) => {
    handleDataChange({
      productSales: initializedData.productSales.filter((_, i) => i !== index)
    })
    toast({
      title: "Product Deleted",
      description: "Product has been removed from cash flow analysis",
    })
  }

  const handleDeleteService = (index: number) => {
    handleDataChange({
      serviceIncome: initializedData.serviceIncome.filter((_, i) => i !== index)
    })
    toast({
      title: "Service Deleted",
      description: "Service has been removed from cash flow analysis",
    })
  }

  const handleDeleteSubscription = (index: number) => {
    handleDataChange({
      subscriptionRevenue: initializedData.subscriptionRevenue.filter((_, i) => i !== index)
    })
    toast({
      title: "Subscription Plan Deleted",
      description: "Subscription plan has been removed from cash flow analysis",
    })
  }

  const handleDeleteLicensing = (index: number) => {
    handleDataChange({
      licensingRoyalties: initializedData.licensingRoyalties.filter((_, i) => i !== index)
    })
    toast({
      title: "Licensing Agreement Deleted",
      description: "Licensing agreement has been removed from cash flow analysis",
    })
  }

  // Initialize data with default values if properties are undefined
  const initializedData: CashFlowData = {
    ...data,
    fixedExpenses: {
      rent: data.fixedExpenses?.rent || 0,
      salaries: data.fixedExpenses?.salaries || 0,
      insurance: data.fixedExpenses?.insurance || 0,
      utilities: data.fixedExpenses?.utilities || 0,
      softwareSubscriptions: data.fixedExpenses?.softwareSubscriptions || 0,
      custom: Array.isArray(data.fixedExpenses?.custom) ? data.fixedExpenses.custom : []
    },
    variableExpenses: {
      cogs: data.variableExpenses?.cogs || 0,
      marketing: data.variableExpenses?.marketing || 0,
      salesCommissions: data.variableExpenses?.salesCommissions || 0,
      supplies: data.variableExpenses?.supplies || 0,
      custom: Array.isArray(data.variableExpenses?.custom) ? data.variableExpenses.custom : []
    },
    oneTimeExpenses: {
      startupCosts: data.oneTimeExpenses?.startupCosts || 0,
      capitalExpenditures: data.oneTimeExpenses?.capitalExpenditures || 0,
      legalAndLicensing: data.oneTimeExpenses?.legalAndLicensing || 0,
      custom: Array.isArray(data.oneTimeExpenses?.custom) ? data.oneTimeExpenses.custom : []
    },
    financialObligations: {
      loanRepayments: data.financialObligations?.loanRepayments || 0,
      interestPayments: data.financialObligations?.interestPayments || 0,
      taxes: data.financialObligations?.taxes || 0,
      custom: Array.isArray(data.financialObligations?.custom) ? data.financialObligations.custom : []
    }
  }

  const handleDataChange = (newData: Partial<CashFlowData>) => {
    const updatedData = {
      ...initializedData,
      ...newData,
    }
    onDataChange(updatedData)
    toast({
      title: "Data Updated",
      description: "Cash flow data has been successfully updated",
      variant: "default"
    })
  }

  const handleProductSalesChange = (
    index: number, 
    field: keyof ProductSales, 
    value: number | { [key: string]: number | string }
  ) => {
    handleDataChange({
      productSales: initializedData.productSales.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    })
  }

  const addProductSales = () => {
    handleDataChange({
      productSales: [...initializedData.productSales, {
        unitsSold: 0,
        pricePerUnit: 0,
        productionCostPerUnit: 0,
        seasonality: {}
      }]
    })
  }

  const handleServiceIncomeChange = (index: number, field: keyof ServiceIncome, value: string | number) => {
    handleDataChange({
      serviceIncome: initializedData.serviceIncome.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    })
  }

  const addServiceIncome = () => {
    handleDataChange({
      serviceIncome: [...initializedData.serviceIncome, {
        serviceType: '',
        rateOrPrice: 0,
        expectedVolumePerMonth: 0
      }]
    })
  }

  const handleExpenseChange = (
    category: 'fixedExpenses' | 'variableExpenses' | 'oneTimeExpenses' | 'financialObligations',
    field: string,
    value: string
  ) => {
    // Validate and clean the input
    let numValue = 0;
    
    try {
      // Remove currency formatting if present
      const cleanValue = value.replace(/[$,]/g, "");
      numValue = parseFloat(cleanValue);
      
      // Validate the number
      if (isNaN(numValue) || numValue < 0) {
        toast({
          title: "Invalid Input",
          description: "Please enter a valid positive number",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid input format",
        variant: "destructive"
      });
      return;
    }

    // Update the data with validated value
    handleDataChange({
      [category]: {
        ...initializedData[category],
        [field]: numValue
      }
    });
  };

  const handleCustomExpenseChange = (
    category: 'fixedExpenses' | 'variableExpenses' | 'oneTimeExpenses' | 'financialObligations',
    index: number,
    field: keyof CustomExpense,
    value: string
  ) => {
    const updatedCustomExpenses = [...initializedData[category].custom];
    
    // Validate amount field
    if (field === 'amount') {
      try {
        // Remove currency formatting if present
        const cleanValue = value.replace(/[$,]/g, "");
        const numValue = parseFloat(cleanValue);
        
        if (isNaN(numValue) || numValue < 0) {
          toast({
            title: "Invalid Amount",
            description: "Please enter a valid positive amount",
            variant: "destructive"
          });
          return;
        }
        
        updatedCustomExpenses[index] = {
          ...updatedCustomExpenses[index],
          amount: numValue
        };
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid amount format",
          variant: "destructive"
        });
        return;
      }
    } else {
      // For non-amount fields (name, description)
      updatedCustomExpenses[index] = {
        ...updatedCustomExpenses[index],
        [field]: value
      };
    }

    handleDataChange({
      [category]: {
        ...initializedData[category],
        custom: updatedCustomExpenses
      }
    });
  };

  const handleDeleteCustomExpense = (
    category: 'fixedExpenses' | 'variableExpenses' | 'oneTimeExpenses' | 'financialObligations',
    index: number
  ) => {
    const updatedCustomExpenses = [...initializedData[category].custom];
    updatedCustomExpenses.splice(index, 1);
    
    handleDataChange({
      [category]: {
        ...initializedData[category],
        custom: updatedCustomExpenses
      }
    });
  };

  const addCustomExpense = (
    category: 'fixedExpenses' | 'variableExpenses' | 'oneTimeExpenses' | 'financialObligations'
  ) => {
    handleDataChange({
      [category]: {
        ...initializedData[category],
        custom: [
          ...initializedData[category].custom,
          { name: '', amount: 0, description: '' }
        ]
      }
    });
  };

  const calculateProjections = () => {
    // Implement 12-month projection logic here
    const projections: CashFlowProjection[] = []
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    let cumulativeCashFlow = 0
    months.forEach(month => {
      // Calculate total revenue
      const revenue = calculateMonthlyRevenue(initializedData, month)
      
      // Calculate total expenses
      const expenses = calculateMonthlyExpenses(initializedData, month)
      
      // Calculate net cash flow
      const netCashFlow = revenue - expenses
      cumulativeCashFlow += netCashFlow

      projections.push({
        month,
        revenue,
        expenses,
        netCashFlow,
        cumulativeCashFlow,
        
        // Add default or calculated values for required properties
        currentAssets: 0, // You might want to calculate this based on your financial data
        currentLiabilities: 0, // Calculate based on financial obligations
        inventory: 0, // Calculate based on product sales and inventory turnover
        costOfGoodsSold: expenses, // A simple approximation
        totalExpenses: expenses,
        totalAssets: 0,
        shareholderEquity: 0,
        beginningInventory: 0,
        endingInventory: 0,
        beginningReceivables: 0,
        endingReceivables: 0,
        totalLiabilities: 0,
        ebit: netCashFlow, // Earnings before interest and taxes
        interestExpense: 0,
        operatingCashFlow: netCashFlow,
        ebitda: netCashFlow, // Earnings before interest, taxes, depreciation, and amortization
        stockPrice: 0,
        netIncome: netCashFlow,
        outstandingShares: 0,
        operatingIncome: netCashFlow
      })
    })

    setProjections(projections)
  }

  React.useEffect(() => {
    calculateProjections()
  }, [initializedData])

  const handleRecalculateProjections = () => {
    calculateProjections()
  }

  const calculateSubscriptionRevenue = (subscriptions: SubscriptionRevenue[]): number => {
    return subscriptions.reduce((total, sub) => {
      const monthlyRevenue = sub.monthlyFee * sub.subscribers * (1 - sub.churnRate);
      return total + monthlyRevenue;
    }, 0);
  };

  const calculateMonthlyRevenue = (data: CashFlowData, month: string): number => {
    // Include subscription revenue calculation
    const subscriptionRevenue = calculateSubscriptionRevenue(data.subscriptionRevenue || []);
    
    // Sum up other revenue sources
    const otherRevenue = data.otherRevenue.affiliateIncome +
      data.otherRevenue.advertisingRevenue +
      data.otherRevenue.grantsAndDonations;

    // Product Sales
    let productSalesRevenue = 0
    data.productSales.forEach(product => {
      const seasonality = product.seasonality as { [key: string]: number | string }
      const seasonalFactor = seasonality[month] || 1
      productSalesRevenue += product.unitsSold * product.pricePerUnit * (seasonalFactor as number)
    })

    // Service Income
    let serviceIncomeRevenue = 0
    data.serviceIncome.forEach(service => {
      serviceIncomeRevenue += service.rateOrPrice * service.expectedVolumePerMonth
    })

    return subscriptionRevenue + otherRevenue + productSalesRevenue + serviceIncomeRevenue;
  };

  const handleSaveProjection = () => {
    try {
      // Save to localStorage
      localStorage.setItem('cashFlowData', JSON.stringify(initializedData))

      // Save to file
      const dataStr = JSON.stringify(initializedData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cash-flow-projection-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Projection Saved",
        description: "Your cash flow projection has been saved both locally and to file.",
      })
    } catch (error) {
      toast({
        title: "Error Saving Projection",
        description: "There was an error saving your projection. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedData = JSON.parse(text) as CashFlowData
      onDataChange(importedData)
      toast({
        title: "Success",
        description: "Cash flow data imported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import cash flow data. Please ensure the file is valid JSON.",
        variant: "destructive",
      })
    }
    
    if (event.target) event.target.value = '' // Reset file input
  }

  // Hidden file input for file selection
  const renderFileInput = () => (
    <input
      type="file"
      ref={fileInputRef}
      style={{ display: 'none' }}
      accept=".json"
      onChange={handleFileChange}
    />
  )

  // Try to load data from localStorage on component mount
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem('cashFlowData')
      if (savedData) {
        const parsedData = JSON.parse(savedData) as CashFlowData
        onDataChange(parsedData)
        toast({
          title: "Data Restored",
          description: "Your previous cash flow data has been restored.",
        })
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
  }, [])

  const calculateTotalRevenue = (data: CashFlowData): number => {
    const productSalesRevenue = data.productSales.reduce((sum, product) => sum + (product.unitsSold * product.pricePerUnit), 0);
    const serviceIncomeRevenue = data.serviceIncome.reduce((sum, service) => sum + (service.rateOrPrice * service.expectedVolumePerMonth), 0);
    const subscriptionRevenue = data.subscriptionRevenue.reduce((sum, subscription) => sum + (subscription.monthlyFee * subscription.subscribers), 0);
    const licensingRoyaltiesRevenue = data.licensingRoyalties.reduce((sum, royalty) => sum + (royalty.royaltyRate * royalty.expectedVolume), 0);
    const otherRevenue = data.otherRevenue.affiliateIncome + data.otherRevenue.advertisingRevenue + data.otherRevenue.grantsAndDonations;

    return productSalesRevenue + serviceIncomeRevenue + subscriptionRevenue + licensingRoyaltiesRevenue + otherRevenue;
  };

  const generateProjections = () => {
    if (!validateCashFlowData(data)) {
      console.error('Invalid cash flow data');
      return;
    }

    const growthRate = 0.05; // 5% annual growth rate
    const baseRevenue = calculateTotalRevenue(data);
    const baseExpenses = calculateMonthlyExpenses(data, 'total') * 12;

    const newProjections: CashFlowProjection[] = Array.from({ length: projectionYears }, (_, index) => {
      const yearMultiplier = Math.pow(1 + growthRate, index);
      const projectedRevenue = baseRevenue * yearMultiplier;
      const projectedExpenses = baseExpenses * yearMultiplier;
      const netCashFlow = projectedRevenue - projectedExpenses;

      return {
        month: `Year ${index + 1}`,
        year: index + 1,
        revenue: projectedRevenue,
        expenses: projectedExpenses,
        netCashFlow: netCashFlow,
        cumulativeCashFlow: 0, // This will be calculated separately

        // Balance Sheet Items
        currentAssets: projectedRevenue * 0.3, // Assume 30% of revenue is current assets
        currentLiabilities: projectedExpenses * 0.25, // Assume 25% of expenses are current liabilities
        inventory: projectedRevenue * 0.15, // Assume 15% of revenue is inventory
        totalAssets: projectedRevenue * 0.8, // Assume 80% of revenue is total assets
        shareholderEquity: projectedRevenue * 0.4, // Assume 40% of revenue is shareholder equity
        totalLiabilities: projectedExpenses * 0.6, // Assume 60% of expenses are total liabilities

        // Income Statement Items
        costOfGoodsSold: projectedExpenses * 0.7, // Assume 70% of expenses are COGS
        totalExpenses: projectedExpenses,
        operatingIncome: projectedRevenue - projectedExpenses,
        ebit: projectedRevenue - projectedExpenses,
        ebitda: (projectedRevenue - projectedExpenses) * 1.1, // Add back estimated D&A
        netIncome: (projectedRevenue - projectedExpenses) * 0.75, // After estimated taxes

        // Cash Flow Items
        operatingCashFlow: netCashFlow * 0.9, // Assume 90% of net cash flow is from operations
        
        // Market Items
        stockPrice: (projectedRevenue - projectedExpenses) * 0.5, // Simplified P/E based calculation
        outstandingShares: 1000000, // Assume constant number of shares
        
        // Working Capital Items
        beginningInventory: projectedRevenue * 0.14, // Previous period inventory
        endingInventory: projectedRevenue * 0.15, // Current period inventory
        beginningReceivables: projectedRevenue * 0.19, // Previous period receivables
        endingReceivables: projectedRevenue * 0.2, // Current period receivables
        
        // Interest and Debt
        interestExpense: projectedExpenses * 0.05 // Assume 5% of expenses are interest
      };
    });

    // Calculate cumulative cash flow
    let cumulativeCashFlow = 0;
    const projectionWithCumulativeCashFlow = newProjections.map(projection => {
      cumulativeCashFlow += projection.netCashFlow;
      return {
        ...projection,
        cumulativeCashFlow: cumulativeCashFlow
      };
    });

    setProjections(projectionWithCumulativeCashFlow);
  };

  const validateCashFlowData = (data: any): data is CashFlowData => {
    if (!data || typeof data !== 'object') return false;

    // Validate arrays
    if (!Array.isArray(data.productSales)) return false;
    if (!Array.isArray(data.serviceIncome)) return false;
    if (!Array.isArray(data.subscriptionRevenue)) return false;
    if (!Array.isArray(data.licensingRoyalties)) return false;

    // Validate other revenue
    if (!data.otherRevenue || typeof data.otherRevenue !== 'object') return false;
    if (typeof data.otherRevenue.affiliateIncome !== 'number') return false;
    if (typeof data.otherRevenue.advertisingRevenue !== 'number') return false;
    if (typeof data.otherRevenue.grantsAndDonations !== 'number') return false;

    // Validate fixed expenses
    if (!data.fixedExpenses || typeof data.fixedExpenses !== 'object') return false;
    if (typeof data.fixedExpenses.rent !== 'number') return false;
    if (typeof data.fixedExpenses.salaries !== 'number') return false;
    if (typeof data.fixedExpenses.insurance !== 'number') return false;
    if (typeof data.fixedExpenses.utilities !== 'number') return false;
    if (typeof data.fixedExpenses.softwareSubscriptions !== 'number') return false;
    if (!Array.isArray(data.fixedExpenses.custom)) return false;

    // Validate variable expenses
    if (!data.variableExpenses || typeof data.variableExpenses !== 'object') return false;
    if (typeof data.variableExpenses.cogs !== 'number') return false;
    if (typeof data.variableExpenses.marketing !== 'number') return false;
    if (typeof data.variableExpenses.salesCommissions !== 'number') return false;
    if (typeof data.variableExpenses.supplies !== 'number') return false;
    if (!Array.isArray(data.variableExpenses.custom)) return false;

    // Validate one-time expenses
    if (!data.oneTimeExpenses || typeof data.oneTimeExpenses !== 'object') return false;
    if (typeof data.oneTimeExpenses.startupCosts !== 'number') return false;
    if (typeof data.oneTimeExpenses.capitalExpenditures !== 'number') return false;
    if (typeof data.oneTimeExpenses.legalAndLicensing !== 'number') return false;
    if (!Array.isArray(data.oneTimeExpenses.custom)) return false;

    // Validate financial obligations
    if (!data.financialObligations || typeof data.financialObligations !== 'object') return false;
    if (typeof data.financialObligations.loanRepayments !== 'number') return false;
    if (typeof data.financialObligations.interestPayments !== 'number') return false;
    if (typeof data.financialObligations.taxes !== 'number') return false;
    if (!Array.isArray(data.financialObligations.custom)) return false;

    // Validate growth parameters
    if (!data.growthParameters || typeof data.growthParameters !== 'object') return false;
    if (typeof data.growthParameters.revenueGrowthRate !== 'number') return false;
    if (typeof data.growthParameters.expenseGrowthRate !== 'number') return false;
    if (typeof data.growthParameters.accountsReceivableDays !== 'number') return false;
    if (typeof data.growthParameters.accountsPayableDays !== 'number') return false;
    if (typeof data.growthParameters.inventoryTurnoverDays !== 'number') return false;

    return true;
  }

  const calculateMonthlyExpenses = (data: CashFlowData, month: string): number => {
    let expenses = 0;

    // Fixed Expenses
    if (data.fixedExpenses) {
      expenses += (data.fixedExpenses.rent || 0) +
        (data.fixedExpenses.salaries || 0) +
        (data.fixedExpenses.insurance || 0) +
        (data.fixedExpenses.utilities || 0) +
        (data.fixedExpenses.softwareSubscriptions || 0);
      
      if (Array.isArray(data.fixedExpenses.custom)) {
        expenses += data.fixedExpenses.custom.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }
    }

    // Variable Expenses
    if (data.variableExpenses) {
      expenses += (data.variableExpenses.cogs || 0) +
        (data.variableExpenses.marketing || 0) +
        (data.variableExpenses.salesCommissions || 0) +
        (data.variableExpenses.supplies || 0);
      
      if (Array.isArray(data.variableExpenses.custom)) {
        expenses += data.variableExpenses.custom.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }
    }

    // Financial Obligations
    if (data.financialObligations) {
      expenses += (data.financialObligations.loanRepayments || 0) +
        (data.financialObligations.interestPayments || 0) +
        (data.financialObligations.taxes || 0);
      
      if (Array.isArray(data.financialObligations.custom)) {
        expenses += data.financialObligations.custom.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }
    }

    // One-time Expenses (only include these in the total)
    if (month === 'total' && data.oneTimeExpenses) {
      expenses += (data.oneTimeExpenses.startupCosts || 0) +
        (data.oneTimeExpenses.capitalExpenditures || 0) +
        (data.oneTimeExpenses.legalAndLicensing || 0);
      
      if (Array.isArray(data.oneTimeExpenses.custom)) {
        expenses += data.oneTimeExpenses.custom.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }
    }

    return expenses;
  }

  const calculateTotalExpenses = () => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'total'];
    const monthlyExpenses = months.reduce((acc, month) => {
      acc[month] = calculateMonthlyExpenses(initializedData, month);
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.entries(monthlyExpenses).reduce((sum, [_, expenses]) => sum + expenses, 0);
    return totalExpenses;
  }

  const addSubscriptionRevenue = () => {
    handleDataChange({
      subscriptionRevenue: [...initializedData.subscriptionRevenue, {
        pricingTier: '',
        monthlyFee: 0,
        subscribers: 0,
        churnRate: 0
      }]
    })
  }

  const addLicensingRoyalty = () => {
    handleDataChange({
      licensingRoyalties: [...initializedData.licensingRoyalties, {
        agreementName: '',
        royaltyRate: 0,
        expectedVolume: 0
      }]
    })
  }

  const handleSubscriptionChange = (index: number, field: keyof SubscriptionRevenue, value: string | number) => {
    handleDataChange({
      subscriptionRevenue: initializedData.subscriptionRevenue.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    })
  }

  const handleLicensingChange = (index: number, field: keyof LicensingRoyalties, value: string | number) => {
    handleDataChange({
      licensingRoyalties: initializedData.licensingRoyalties.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    })
  }

  const handleOtherRevenueChange = (field: keyof OtherRevenue, value: number) => {
    handleDataChange({
      otherRevenue: {
        ...initializedData.otherRevenue,
        [field]: value
      }
    })
  }

  const resetOtherRevenue = (field: keyof OtherRevenue) => {
    handleDataChange({
      otherRevenue: {
        ...initializedData.otherRevenue,
        [field]: 0
      }
    })
    toast({
      title: "Revenue Item Reset",
      description: `${field} has been reset to 0`,
    })
  }

  return (
    <Card className="p-4 sm:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Help
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cash Flow Analyzer Help</DialogTitle>
                <DialogDescription>
                  This tool helps you analyze and project your business cash flow.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Revenue Tab</h4>
                  <p className="text-sm text-muted-foreground">Enter your various revenue streams including product sales, services, and subscriptions.</p>
                </div>
                <div>
                  <h4 className="font-medium">Expenses Tab</h4>
                  <p className="text-sm text-muted-foreground">Track your fixed and variable expenses, including operational costs and one-time expenses.</p>
                </div>
                <div>
                  <h4 className="font-medium">Projections Tab</h4>
                  <p className="text-sm text-muted-foreground">View and analyze cash flow projections based on your entered data.</p>
                </div>
                <div>
                  <h4 className="font-medium">Settings Tab</h4>
                  <p className="text-sm text-muted-foreground">Configure growth parameters and other settings for more accurate projections.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Product Sales Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Product Sales</h3>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4">
                  {initializedData.productSales.map((product, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex flex-col space-y-2">
                        <Label>Units Sold</Label>
                        <Input
                          type="number"
                          value={product.unitsSold}
                          onChange={(e) => handleProductSalesChange(index, 'unitsSold', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Price per Unit</Label>
                        <Input
                          type="number"
                          value={product.pricePerUnit}
                          onChange={(e) => handleProductSalesChange(index, 'pricePerUnit', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Production Cost per Unit</Label>
                        <Input
                          type="number"
                          value={product.productionCostPerUnit}
                          onChange={(e) => handleProductSalesChange(index, 'productionCostPerUnit', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Seasonality</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select seasonality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>Monthly Fee</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Monthly subscription fee per customer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick('product', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={addProductSales} className="w-full mt-4">Add Product</Button>
            </Card>

            {/* Service Income Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Service Income</h3>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4">
                  {initializedData.serviceIncome.map((service, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex flex-col space-y-2">
                        <Label>Service Type</Label>
                        <Input
                          type="text"
                          value={service.serviceType}
                          onChange={(e) => handleServiceIncomeChange(index, 'serviceType', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Rate or Price</Label>
                        <Input
                          type="number"
                          value={service.rateOrPrice}
                          onChange={(e) => handleServiceIncomeChange(index, 'rateOrPrice', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Expected Volume per Month</Label>
                        <Input
                          type="number"
                          value={service.expectedVolumePerMonth}
                          onChange={(e) => handleServiceIncomeChange(index, 'expectedVolumePerMonth', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick('service', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete service</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={addServiceIncome} className="w-full mt-4">Add Service</Button>
            </Card>

            {/* Subscription Revenue Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Subscription Revenue</h3>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4">
                  {initializedData.subscriptionRevenue.map((subscription, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex flex-col space-y-2">
                        <Label>Pricing Tier</Label>
                        <Input
                          type="text"
                          value={subscription.pricingTier}
                          onChange={(e) => handleSubscriptionChange(index, 'pricingTier', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Monthly Fee</Label>
                        <Input
                          type="number"
                          value={subscription.monthlyFee}
                          onChange={(e) => handleSubscriptionChange(index, 'monthlyFee', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Subscribers</Label>
                        <Input
                          type="number"
                          value={subscription.subscribers}
                          onChange={(e) => handleSubscriptionChange(index, 'subscribers', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Churn Rate</Label>
                        <Input
                          type="number"
                          value={subscription.churnRate}
                          onChange={(e) => handleSubscriptionChange(index, 'churnRate', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick('subscription', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete subscription plan</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={addSubscriptionRevenue} className="w-full mt-4">Add Subscription Plan</Button>
            </Card>

            {/* Licensing Royalties Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Licensing Royalties</h3>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4">
                  {initializedData.licensingRoyalties.map((royalty, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex flex-col space-y-2">
                        <Label>Agreement Name</Label>
                        <Input
                          type="text"
                          value={royalty.agreementName}
                          onChange={(e) => handleLicensingChange(index, 'agreementName', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Royalty Rate</Label>
                        <Input
                          type="number"
                          value={royalty.royaltyRate}
                          onChange={(e) => handleLicensingChange(index, 'royaltyRate', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label>Expected Volume</Label>
                        <Input
                          type="number"
                          value={royalty.expectedVolume}
                          onChange={(e) => handleLicensingChange(index, 'expectedVolume', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick('licensing', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete licensing agreement</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={addLicensingRoyalty} className="w-full mt-4">Add Licensing Agreement</Button>
            </Card>

            {/* Other Revenue Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Other Revenue</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>Affiliate Income</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={initializedData.otherRevenue.affiliateIncome}
                      onChange={(e) => handleOtherRevenueChange('affiliateIncome', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetOtherRevenue('affiliateIncome')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Advertising Revenue</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={initializedData.otherRevenue.advertisingRevenue}
                      onChange={(e) => handleOtherRevenueChange('advertisingRevenue', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetOtherRevenue('advertisingRevenue')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Grants and Donations</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={initializedData.otherRevenue.grantsAndDonations}
                      onChange={(e) => handleOtherRevenueChange('grantsAndDonations', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetOtherRevenue('grantsAndDonations')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* Total Expenses Summary Card */}
          <Card className="p-4 bg-muted">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Total Expenses</h3>
              <span className="text-2xl font-bold">{formatCurrency(calculateTotalExpenses())}</span>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fixed Expenses Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Fixed Expenses</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>Rent</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.fixedExpenses.rent)}
                    onChange={(e) => handleExpenseChange('fixedExpenses', 'rent', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Salaries</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.fixedExpenses.salaries)}
                    onChange={(e) => handleExpenseChange('fixedExpenses', 'salaries', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Insurance</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.fixedExpenses.insurance)}
                    onChange={(e) => handleExpenseChange('fixedExpenses', 'insurance', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Utilities</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.fixedExpenses.utilities)}
                    onChange={(e) => handleExpenseChange('fixedExpenses', 'utilities', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Software Subscriptions</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.fixedExpenses.softwareSubscriptions)}
                    onChange={(e) => handleExpenseChange('fixedExpenses', 'softwareSubscriptions', e.target.value)}
                    className="w-full"
                  />
                </div>
                {initializedData.fixedExpenses.custom.map((expense, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex flex-col space-y-2">
                      <Label>Custom Expense {index + 1}</Label>
                      <Input
                        type="text"
                        value={expense.name}
                        onChange={(e) => handleCustomExpenseChange('fixedExpenses', index, 'name', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="text"
                        value={formatCurrency(expense.amount)}
                        onChange={(e) => handleCustomExpenseChange('fixedExpenses', index, 'amount', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCustomExpense('fixedExpenses', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={() => addCustomExpense('fixedExpenses')} className="w-full mt-4">Add Custom Expense</Button>
            </Card>

            {/* Variable Expenses Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Variable Expenses</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>COGS</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.variableExpenses.cogs)}
                    onChange={(e) => handleExpenseChange('variableExpenses', 'cogs', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Marketing</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.variableExpenses.marketing)}
                    onChange={(e) => handleExpenseChange('variableExpenses', 'marketing', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Sales Commissions</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.variableExpenses.salesCommissions)}
                    onChange={(e) => handleExpenseChange('variableExpenses', 'salesCommissions', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Supplies</Label>
                  <Input
                    type="text"
                    value={formatCurrency(initializedData.variableExpenses.supplies)}
                    onChange={(e) => handleExpenseChange('variableExpenses', 'supplies', e.target.value)}
                    className="w-full"
                  />
                </div>
                {initializedData.variableExpenses.custom.map((expense, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex flex-col space-y-2">
                      <Label>Custom Expense {index + 1}</Label>
                      <Input
                        type="text"
                        value={expense.name}
                        onChange={(e) => handleCustomExpenseChange('variableExpenses', index, 'name', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="text"
                        value={formatCurrency(expense.amount)}
                        onChange={(e) => handleCustomExpenseChange('variableExpenses', index, 'amount', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCustomExpense('variableExpenses', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={() => addCustomExpense('variableExpenses')} className="w-full mt-4">Add Custom Expense</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="mb-4">
            <Label htmlFor="projectionYears">Projection Years (1-5)</Label>
            <Input
              id="projectionYears"
              type="number"
              min={1}
              max={5}
              value={projectionYears}
              onChange={(e) => {
                const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), 5);
                setProjectionYears(value);
                generateProjections();
              }}
              className="w-full mt-1"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Month</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Revenue</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Expenses</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Net Cash Flow</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Cumulative</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projections.map((projection, index) => (
                  <TableRow key={index}>
                    <TableCell>{projection.month}</TableCell>
                    <TableCell className="text-right">${projection.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${projection.expenses.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={projection.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                        ${projection.netCashFlow.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${projection.cumulativeCashFlow.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={generateProjections}>Generate Projections</Button>
            <Button variant="outline" onClick={handleSaveProjection}>Save</Button>
            <Button variant="outline" onClick={handleFileUpload}>Import</Button>
            {renderFileInput()}
            <Button variant="outline" onClick={handleRecalculateProjections}>Recalculate Projections</Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Growth Parameters</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>Revenue Growth Rate</Label>
                  <Input
                    type="number"
                    value={initializedData.growthParameters.revenueGrowthRate}
                    onChange={(e) => handleDataChange({
                      growthParameters: {
                        ...initializedData.growthParameters,
                        revenueGrowthRate: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Expense Growth Rate</Label>
                  <Input
                    type="number"
                    value={initializedData.growthParameters.expenseGrowthRate}
                    onChange={(e) => handleDataChange({
                      growthParameters: {
                        ...initializedData.growthParameters,
                        expenseGrowthRate: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Accounts Receivable Days</Label>
                  <Input
                    type="number"
                    value={initializedData.growthParameters.accountsReceivableDays}
                    onChange={(e) => handleDataChange({
                      growthParameters: {
                        ...initializedData.growthParameters,
                        accountsReceivableDays: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Accounts Payable Days</Label>
                  <Input
                    type="number"
                    value={initializedData.growthParameters.accountsPayableDays}
                    onChange={(e) => handleDataChange({
                      growthParameters: {
                        ...initializedData.growthParameters,
                        accountsPayableDays: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Inventory Turnover Days</Label>
                  <Input
                    type="number"
                    value={initializedData.growthParameters.inventoryTurnoverDays}
                    onChange={(e) => handleDataChange({
                      growthParameters: {
                        ...initializedData.growthParameters,
                        inventoryTurnoverDays: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
