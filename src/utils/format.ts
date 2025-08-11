import { IncomeTransaction } from "../api/model";

export const formatCurrency = (amount: number, currency: string = "LAK", locale: string = "en-US") => {
  if (currency === ""){
    currency = "LAK";
  }
  
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

export const formatAsPercentage = (value: number) => {
  const options: Intl.NumberFormatOptions = {
    style: "percent",
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat("en-US", options).format(value /100);
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
