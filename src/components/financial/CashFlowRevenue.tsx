import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CurrencyInput, NumberInput, PercentageInput } from "./CashFlowFormFields"
import type { 
  ProductSales, 
  ServiceIncome, 
  SubscriptionRevenue, 
  LicensingRoyalties,
  OtherRevenue 
} from "@/types/cashflow"

interface RevenueFormProps {
  productSales: ProductSales[];
  serviceIncome: ServiceIncome[];
  subscriptionRevenue: SubscriptionRevenue[];
  licensingRoyalties: LicensingRoyalties[];
  otherRevenue: OtherRevenue;
  onProductSalesChange: (products: ProductSales[]) => void;
  onServiceIncomeChange: (services: ServiceIncome[]) => void;
  onSubscriptionRevenueChange: (subscriptions: SubscriptionRevenue[]) => void;
  onLicensingRoyaltiesChange: (licensing: LicensingRoyalties[]) => void;
  onOtherRevenueChange: (other: OtherRevenue) => void;
}

export function RevenueForm({
  productSales,
  serviceIncome,
  subscriptionRevenue,
  licensingRoyalties,
  otherRevenue,
  onProductSalesChange,
  onServiceIncomeChange,
  onSubscriptionRevenueChange,
  onLicensingRoyaltiesChange,
  onOtherRevenueChange
}: RevenueFormProps) {
  const handleAddProduct = () => {
    onProductSalesChange([
      ...productSales,
      {
        unitsSold: 0,
        pricePerUnit: 0,
        productionCostPerUnit: 0,
        seasonality: {}
      }
    ])
  }

  const handleAddService = () => {
    onServiceIncomeChange([
      ...serviceIncome,
      {
        serviceType: "",
        rateOrPrice: 0,
        expectedVolumePerMonth: 0
      }
    ])
  }

  const handleAddSubscription = () => {
    onSubscriptionRevenueChange([
      ...subscriptionRevenue,
      {
        pricingTier: "",
        monthlyFee: 0,
        subscribers: 0,
        churnRate: 0
      }
    ])
  }

  const handleAddLicensing = () => {
    onLicensingRoyaltiesChange([
      ...licensingRoyalties,
      {
        agreementName: "",
        royaltyRate: 0,
        expectedVolume: 0
      }
    ])
  }

  return (
    <div className="space-y-6">
      {/* Product Sales */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Product Sales</h3>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>
        {productSales.map((product, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput
                label="Units Sold (Monthly)"
                value={product.unitsSold}
                onChange={(value) => {
                  const newProducts = [...productSales]
                  newProducts[index] = { ...product, unitsSold: value }
                  onProductSalesChange(newProducts)
                }}
                tooltip="Expected monthly sales volume"
              />
              <CurrencyInput
                label="Price Per Unit"
                value={product.pricePerUnit}
                onChange={(value) => {
                  const newProducts = [...productSales]
                  newProducts[index] = { ...product, pricePerUnit: value }
                  onProductSalesChange(newProducts)
                }}
                tooltip="Selling price per unit"
              />
              <CurrencyInput
                label="Production Cost Per Unit"
                value={product.productionCostPerUnit}
                onChange={(value) => {
                  const newProducts = [...productSales]
                  newProducts[index] = { ...product, productionCostPerUnit: value }
                  onProductSalesChange(newProducts)
                }}
                tooltip="Cost to produce one unit"
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Service Income */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Service Income</h3>
          <Button onClick={handleAddService}>Add Service</Button>
        </div>
        {serviceIncome.map((service, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Service Type</Label>
                <Input
                  value={service.serviceType}
                  onChange={(e) => {
                    const newServices = [...serviceIncome]
                    newServices[index] = { ...service, serviceType: e.target.value }
                    onServiceIncomeChange(newServices)
                  }}
                />
              </div>
              <CurrencyInput
                label="Rate/Price"
                value={service.rateOrPrice}
                onChange={(value) => {
                  const newServices = [...serviceIncome]
                  newServices[index] = { ...service, rateOrPrice: value }
                  onServiceIncomeChange(newServices)
                }}
                tooltip="Hourly rate or package price"
              />
              <NumberInput
                label="Expected Volume (Monthly)"
                value={service.expectedVolumePerMonth}
                onChange={(value) => {
                  const newServices = [...serviceIncome]
                  newServices[index] = { ...service, expectedVolumePerMonth: value }
                  onServiceIncomeChange(newServices)
                }}
                tooltip="Expected monthly clients or hours"
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Subscription Revenue */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Subscription Revenue</h3>
          <Button onClick={handleAddSubscription}>Add Subscription Tier</Button>
        </div>
        {subscriptionRevenue.map((subscription, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Pricing Tier</Label>
                <Input
                  value={subscription.pricingTier}
                  onChange={(e) => {
                    const newSubscriptions = [...subscriptionRevenue]
                    newSubscriptions[index] = { ...subscription, pricingTier: e.target.value }
                    onSubscriptionRevenueChange(newSubscriptions)
                  }}
                />
              </div>
              <CurrencyInput
                label="Monthly Fee"
                value={subscription.monthlyFee}
                onChange={(value) => {
                  const newSubscriptions = [...subscriptionRevenue]
                  newSubscriptions[index] = { ...subscription, monthlyFee: value }
                  onSubscriptionRevenueChange(newSubscriptions)
                }}
                tooltip="Monthly subscription fee"
              />
              <NumberInput
                label="Subscribers"
                value={subscription.subscribers}
                onChange={(value) => {
                  const newSubscriptions = [...subscriptionRevenue]
                  newSubscriptions[index] = { ...subscription, subscribers: value }
                  onSubscriptionRevenueChange(newSubscriptions)
                }}
                tooltip="Current number of subscribers"
              />
              <PercentageInput
                label="Monthly Churn Rate"
                value={subscription.churnRate}
                onChange={(value) => {
                  const newSubscriptions = [...subscriptionRevenue]
                  newSubscriptions[index] = { ...subscription, churnRate: value }
                  onSubscriptionRevenueChange(newSubscriptions)
                }}
                tooltip="Percentage of subscribers canceling monthly"
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Licensing Royalties */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mt-4">
          <Label>Licensing Royalties</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddLicensing}
          >
            Add Licensing Entry
          </Button>
        </div>
        {licensingRoyalties.map((licensing, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Agreement Name</Label>
                <Input
                  value={licensing.agreementName}
                  onChange={(e) => {
                    const newLicensing = [...licensingRoyalties]
                    newLicensing[index] = { ...licensing, agreementName: e.target.value }
                    onLicensingRoyaltiesChange(newLicensing)
                  }}
                />
              </div>
              <PercentageInput
                label="Royalty Rate"
                value={licensing.royaltyRate}
                onChange={(value) => {
                  const newLicensing = [...licensingRoyalties]
                  newLicensing[index] = { ...licensing, royaltyRate: value }
                  onLicensingRoyaltiesChange(newLicensing)
                }}
                tooltip="Percentage of revenue paid as royalties"
              />
              <NumberInput
                label="Expected Volume (Monthly)"
                value={licensing.expectedVolume}
                onChange={(value) => {
                  const newLicensing = [...licensingRoyalties]
                  newLicensing[index] = { ...licensing, expectedVolume: value }
                  onLicensingRoyaltiesChange(newLicensing)
                }}
                tooltip="Expected monthly volume of licensed products or services"
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Other Revenue */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Other Revenue (Monthly)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CurrencyInput
            label="Affiliate Income"
            value={otherRevenue.affiliateIncome}
            onChange={(value) => onOtherRevenueChange({ ...otherRevenue, affiliateIncome: value })}
            tooltip="Monthly income from referrals and partnerships"
          />
          <CurrencyInput
            label="Advertising Revenue"
            value={otherRevenue.advertisingRevenue}
            onChange={(value) => onOtherRevenueChange({ ...otherRevenue, advertisingRevenue: value })}
            tooltip="Monthly income from advertising"
          />
          <CurrencyInput
            label="Grants and Donations"
            value={otherRevenue.grantsAndDonations}
            onChange={(value) => onOtherRevenueChange({ ...otherRevenue, grantsAndDonations: value })}
            tooltip="Monthly grants or donations received"
          />
        </div>
      </Card>
    </div>
  )
}
