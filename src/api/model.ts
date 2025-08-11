

export type ListCalculations = {
  calculations: Calculation[]
  nextPageToken: string  
}

export type calculationStatus = "COMPLETED" | "PENDING" 

export type  Calculation ={
  id: number
  statementFileId: number
  number: string
  product: string
  account: Account
  basicSalaryFromInterview: number
  exchangeRate: number
  monthlyAverageIncome: number
  monthlyNetIncome: number
  monthlyOtherIncome: number
  eightyPercentOfMonthlyOtherIncome: number
  totalOtherIncome: number
  totalBasicSalary: number
  totalIncome: number
  periodInMonth: number
  startedAt: string
  endedAt: string
  createdBy: string
  createdAt: string
  status:calculationStatus
  salaryBreakdown: ListMonthlySalaries
  allowanceBreakdown: ListAllowances
  commissionBreakdown: ListCommissions
  source: Source
}

export type Account ={
  number: string
  displayName: string
  currency: string
}

export type Metadata = {
  originalName: string
  name: string
  createdBy: string
  createdAt: string
  publicUrl: string
};

export type Source ={
  basicSalary: breakdown
  allowance: breakdown
  commission: breakdown
}

type breakdown = {
  monthlyAverage: number
  total: number
}

export type ListMonthlySalaries = {
  monthlySalaries: MonthlyIncome[]
  basicSalary: number
  total: number
}

export type MonthlyIncome = {
  month: string
  timesReceived: number
  transactions: IncomeTransaction[]
  total: number
}

export type MonthlyIncomeReq = {
  month: string
  transactions: IncomeTransaction[]
}

export type ListAllowances = {
  allowances: Allowance[]
  total: number
}

export type Allowance = {
  title: string
  months: number
  monthlyAverage: number
  transactions: IncomeTransaction[]
  total: number
}

export type Commission = {
	month:                 string           
	transactions: IncomeTransaction[] 
	total:                 number
}

export type ListCommissions = {
	commissions:    Commission[]
	monthlyAverage : number
	total         : number
}

export type Currency = {
  id : string 
  code: string
  exchangeRate: number
  createdAt: string
  updatedAt: string
}

export type ListCurrencies = {
  nextPageToken: string 
  currencies: Currency[]
}

export type Wording = {
  id: number
  word: string
  category: sourceCategory
  createdBy: string
  createdAt: string
}

export type ListWordings = {
  nextPageToken: string 
  wordlists: Wording[]
}

export type SelfEmployedWording = {
  id: number
  word: string
  createdBy: string
  createdAt: string
}

export type ListSelfEmployedWordings = {
  nextPageToken: string 
  wordlists: SelfEmployedWording[]
}

export type sourceCategory = "SALARY" | "ALLOWANCE" | "COMMISSION" | ""
export type userStatus = "ENABLED" | "DISABLED" | "CLOSED"

export type User = {
  isAdmin: boolean
  id: string
  email: string
  displayName: string
  status: userStatus
  createdAt: string
  updatedAt: string
}

export type ListUsers = {
  nextPageToken: string 
  users: User[]
}

export type IncomeTransaction = {
  date: string;
  billNumber: string;
  noted: string;
  amount: number
}

export type ListIncomeTransactions = {
  transactions: IncomeTransaction[]
}


export interface ListCIBCalculations {
  calculations : CIBCalculation[]
  nextPageToken: string
}

export interface CIBCalculation {
  id: number
  cibFileName: string
  number: string
  customer: Customer
  totalInstallmentInLAK: number
  aggregateQuantity: AggregateQuantity
  aggregateByBankCode: AggregateByBankCode[]
  contracts: Contract[]
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  displayName: string
  phoneNumber: string
  dateOfBirth: string
}

export interface AggregateQuantity {
  total: number
  closed: number
  active: number
}

export interface AggregateByBankCode {
  bankCode: string
  quantity: number
}

export interface Contract {
  number: string
  bankCode: string
  type: string
  currency: string
  gradeCIB: string
  term: string
  gradeCIBLast12months: string[]
  status: "CLOSED" | "ACTIVE"
  termType: string
  lastedAt: string
  firstInstallment: string
  lastInstallment: string
  interestRate: number
  financeAmount: number
  outstandingBalance: number
  overdueInDay: number
  period: number
  installment: number
  installmentInLAK: number
  exchangeRate: number
}

export type Business = {
  id : string 
  name: string
  marginPercentage: number
  createdAt: string
  updatedAt: string
}

export type ListBusinesses = {
  nextPageToken: string 
  businesses: Business[]
}

export type BusinessType = {
  id: string
  name: string
}

export type  SelfEmployedCalculation ={
  id: number
  statementFileId: number
  businessType: BusinessType
  number: string
  product: string
  account: Account
  exchangeRate: number
  marginPercentage: number
  monthlyAverageIncome: number
  monthlyAverageByMargin: number
  monthlyNetIncome: number
  totalIncome: number
  periodInMonth: number
  startedAt: string
  endedAt: string
  createdBy: string
  createdAt: string
  status:calculationStatus
  monthlyBreakdown: MonthlyBreakdown
}

export type MonthlyBreakdown = {
  total: number
  monthlyIncomes: MonthlyIncome[]
}

export type ListSelfEmployedCalculations = {
  calculations: SelfEmployedCalculation[]
  nextPageToken: string  
}
