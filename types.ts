export type Language = 'en' | 'fa';

export interface Factory {
  id: number;
  name: string;
  type: 'Coal & Coke' | 'Ferroalloys';
}

export interface Product {
  id: number;
  name: string;
  factoryType: 'Coal & Coke' | 'Ferroalloys';
}

export interface ProductionData {
  date: string;
  factoryId: number;
  productId: number;
  planned: number;
  actual: number;
  downtimeHours: number;
  wasteTon: number;
  oee: number;
}

export interface FinanceData {
  date: string;
  factoryId: number;
  productId: number;
  revenue: number;
  costOfGoods: number;
  grossMargin: number;
  netProfit: number;
}

export interface EnergyData {
  date: string;
  factoryId: number;
  productId: number;
  energyConsumptionKwh: number;
}

export interface MaintenanceData {
  date: string;
  factoryId: number;
  equipmentId: string;
  downtimeType: 'planned' | 'emergency';
  durationHours: number;
  cost: number;
}

export interface QualityData {
  date: string;
  factoryId: number;
  productId: number;
  rejectionRate: number; // percentage
  cpkIndex: number;
  labTurnaroundTimeHours: number;
}

export interface HrData {
  date: string;
  factoryId: number;
  employeeCount: number;
  absenteeismRate: number; // percentage
  turnoverRate: number; // percentage
  safetyIncidents: number;
}

export interface SupplyChainData {
  date: string;
  factoryId: number;
  rawMaterialInventoryTon: number;
  finishedGoodsInventoryTon: number;
  supplierOnTimeDeliveryRate: number; // percentage
  transportCost: number;
}

export interface SalesData {
  date: string;
  factoryId: number;
  productId: number;
  customerId: string;
  region: 'Domestic' | 'Export';
  revenue: number;
  unitsSold: number;
}

export interface KpiData {
    title: string;
    value: string;
    change: number;
    description: string;
    icon: React.ReactNode;
}

export interface MockData {
  factories: Factory[];
  products: Product[];
  production: ProductionData[];
  finance: FinanceData[];
  energy: EnergyData[];
  maintenance: MaintenanceData[];
  quality: QualityData[];
  hr: HrData[];
  supplyChain: SupplyChainData[];
  sales: SalesData[];
}

export interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  mockData: MockData;
  activePage: string;
  setActivePage: (page: string) => void;
}
