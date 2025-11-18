import type { MockData, Factory, Product, ProductionData, FinanceData, EnergyData, MaintenanceData, QualityData, HrData, SupplyChainData, SalesData } from './types';

export const FACTORIES: Factory[] = [
  { id: 1, name: 'کارخانه زغال‌سنگ ۱', type: 'Coal & Coke' },
  { id: 2, name: 'کارخانه کک متالورژی ۲', type: 'Coal & Coke' },
  { id: 3, name: 'کارخانه فروسیلیس ۳', type: 'Ferroalloys' },
  { id: 4, name: 'کارخانه فروسیلیکومنگنز ۴', type: 'Ferroalloys' },
];

export const PRODUCTS: Product[] = [
  { id: 1, name: 'زغال‌سنگ', factoryType: 'Coal & Coke' },
  { id: 2, name: 'کک متالورژی', factoryType: 'Coal & Coke' },
  { id: 3, name: 'فروسیلیس', factoryType: 'Ferroalloys' },
  { id: 4, name: 'فروسیلیکومنگنز', factoryType: 'Ferroalloys' },
];

export const EQUIPMENT = [
    { id: 'furnace-01', name: 'کوره بلند ۱' },
    { id: 'conveyor-01', name: 'نوار نقاله اصلی' },
    { id: 'crusher-01', name: 'سنگ شکن' },
    { id: 'coke-oven-01', name: 'کوره کک‌سازی' },
];

export const CUSTOMERS = [
    { id: 'cust-01', name: 'مشتری داخلی الف' },
    { id: 'cust-02', name: 'مشتری داخلی ب' },
    { id: 'cust-03', name: 'مشتری صادراتی ج' },
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockData = (): MockData => {
  const production: ProductionData[] = [];
  const finance: FinanceData[] = [];
  const energy: EnergyData[] = [];
  const maintenance: MaintenanceData[] = [];
  const quality: QualityData[] = [];
  const hr: HrData[] = [];
  const supplyChain: SupplyChainData[] = [];
  const sales: SalesData[] = [];

  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    FACTORIES.forEach(factory => {
      // HR data is per factory, not per product
      if (!hr.some(h => h.date === dateString && h.factoryId === factory.id)) {
          hr.push({
              date: dateString,
              factoryId: factory.id,
              employeeCount: rand(150, 250),
              absenteeismRate: rand(1, 40) / 10, // 0.1% to 4%
              turnoverRate: rand(0, 5) / 10, // 0% to 0.5% monthly
              safetyIncidents: rand(0, 2),
          });
      }

      PRODUCTS.filter(p => p.factoryType === factory.type).forEach(product => {
        const planned = rand(800, 1200);
        const actual = planned - rand(0, 150);
        const downtimeHours = rand(0, 4);
        const wasteTon = rand(5, 50);
        const oee = parseFloat(((actual / planned) * ((24-downtimeHours)/24) * 0.95).toFixed(2));

        production.push({
          date: dateString,
          factoryId: factory.id,
          productId: product.id,
          planned,
          actual,
          downtimeHours,
          wasteTon,
          oee
        });

        const revenue = actual * rand(180, 220);
        const costOfGoods = actual * rand(120, 160);
        const grossMargin = revenue - costOfGoods;
        const netProfit = grossMargin * rand(60, 85) / 100;
        
        finance.push({
            date: dateString,
            factoryId: factory.id,
            productId: product.id,
            revenue,
            costOfGoods,
            grossMargin,
            netProfit
        });

        let energyIntensityFactor: number;
        if (factory.type === 'Ferroalloys') {
            energyIntensityFactor = rand(5000, 8000);
        } else {
            energyIntensityFactor = rand(100, 200);
        }
        const energyConsumptionKwh = actual * energyIntensityFactor;

        energy.push({
            date: dateString,
            factoryId: factory.id,
            productId: product.id,
            energyConsumptionKwh,
        });

        const equipment = EQUIPMENT[rand(0, EQUIPMENT.length - 1)];
        maintenance.push({
            date: dateString,
            factoryId: factory.id,
            equipmentId: equipment.id,
            downtimeType: Math.random() > 0.8 ? 'emergency' : 'planned',
            durationHours: rand(1, 8),
            cost: rand(500, 5000),
        });

        quality.push({
            date: dateString,
            factoryId: factory.id,
            productId: product.id,
            rejectionRate: rand(1, 50) / 10, // 0.1% to 5%
            cpkIndex: parseFloat((1 + Math.random()).toFixed(2)), // 1.00 to 2.00
            labTurnaroundTimeHours: rand(2, 24),
        });

        supplyChain.push({
            date: dateString,
            factoryId: factory.id,
            rawMaterialInventoryTon: rand(5000, 20000),
            finishedGoodsInventoryTon: rand(1000, 8000),
            supplierOnTimeDeliveryRate: rand(85, 99),
            transportCost: actual * rand(10, 25),
        });

        sales.push({
            date: dateString,
            factoryId: factory.id,
            productId: product.id,
            customerId: CUSTOMERS[rand(0, CUSTOMERS.length - 1)].id,
            region: Math.random() > 0.4 ? 'Domestic' : 'Export',
            revenue: revenue,
            unitsSold: actual,
        });
      });
    });
  }

  return { factories: FACTORIES, products: PRODUCTS, production, finance, energy, maintenance, quality, hr, supplyChain, sales };
};
