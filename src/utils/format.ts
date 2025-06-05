import { IncomeTransaction } from "../api/model";

export const formatCurrency = (amount: number, currency: string = "LAK", locale: string = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatWithoutCurrency = (
  amount: number,
) => {
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    style: "decimal",
  };

  return new Intl.NumberFormat("en-US", options).format(amount);
};

export const findMinAmount = (amounts: number[]) => {
  return Math.min(...amounts);
};

export const sumAmount = (amounts: number[]) => {
  return amounts.reduce((total, amount) => total + amount, 0);
};

export const sumFromIncomeTransactions = (ts :IncomeTransaction[]) =>{
  return ts.reduce((total, amount) => {
    return Math.floor(Number(total) + Number(amount.amount));
  }, 0);
}
