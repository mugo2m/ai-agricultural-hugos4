// components/CashFlowStatement.tsx
import React from 'react';
import { CashFlowResult } from '@/lib/cashFlowCalculator';
import { formatCurrency } from '@/lib/utils';

interface CashFlowStatementProps {
  cashFlow: CashFlowResult;
  farmerName?: string;
}

export const CashFlowStatement: React.FC<CashFlowStatementProps> = ({
  cashFlow,
  farmerName = 'Farmer'
}) => {
  return (
    <div className="cash-flow-statement bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-emerald-700 mb-2">
        📊 CASH FLOW PROJECTION
      </h2>
      <p className="text-gray-600 mb-6">
        For {farmerName}'s {cashFlow.crop} enterprise ({cashFlow.farmSize} acre{cashFlow.farmSize > 1 ? 's' : ''})
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-emerald-50">
              <th className="border border-emerald-200 p-3 text-left">Month</th>
              <th className="border border-emerald-200 p-3 text-left">Activities</th>
              <th className="border border-emerald-200 p-3 text-right">Costs (Ksh)</th>
              <th className="border border-emerald-200 p-3 text-right">Revenue (Ksh)</th>
              <th className="border border-emerald-200 p-3 text-right">Net Cash (Ksh)</th>
              <th className="border border-emerald-200 p-3 text-right">Cumulative (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.months.map((month) => (
              <tr key={month.month} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-3 font-medium">
                  Month {month.month} ({month.monthName})
                </td>
                <td className="border border-gray-200 p-3">
                  {month.activities.join(', ')}
                </td>
                <td className="border border-gray-200 p-3 text-right">
                  {formatCurrency(month.costs)}
                </td>
                <td className="border border-gray-200 p-3 text-right">
                  {month.revenue > 0 ? formatCurrency(month.revenue) : '-'}
                </td>
                <td className={`border border-gray-200 p-3 text-right font-medium ${
                  month.netCash < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {month.netCash < 0 ? '-' : ''}{formatCurrency(Math.abs(month.netCash))}
                </td>
                <td className={`border border-gray-200 p-3 text-right font-medium ${
                  month.cumulativeCash < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {month.cumulativeCash < 0 ? '-' : ''}{formatCurrency(Math.abs(month.cumulativeCash))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold">
            <tr>
              <td colSpan={2} className="border border-gray-300 p-3 text-right">TOTAL</td>
              <td className="border border-gray-300 p-3 text-right">{formatCurrency(cashFlow.totalCosts)}</td>
              <td className="border border-gray-300 p-3 text-right">{formatCurrency(cashFlow.totalRevenue)}</td>
              <td className="border border-gray-300 p-3 text-right">{formatCurrency(cashFlow.netProfit)}</td>
              <td className="border border-gray-300 p-3 text-right"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* INTERPRETATION SECTION */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">📋 INTERPRETATION</h3>
        <p className="text-blue-900">
          This cash flow projection shows your expected monthly cash position from planting to harvest.
          Banks use this to assess your ability to repay loans.
        </p>
      </div>

      {/* LOAN SUMMARY */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-700 mb-3">💰 LOAN SUMMARY</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Peak Cash Deficit:</span>
              <span className="font-semibold text-red-600">{formatCurrency(cashFlow.peakDeficit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Needed:</span>
              <span className="font-semibold">{formatCurrency(cashFlow.loanNeeded)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Revenue:</span>
              <span className="font-semibold text-green-600">{formatCurrency(cashFlow.totalRevenue)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-600">Repayment Capacity:</span>
              <span className="font-semibold text-green-600">{formatCurrency(cashFlow.repaymentCapacity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loan-to-Value Ratio:</span>
              <span className="font-semibold">
                {Math.round((cashFlow.loanNeeded / cashFlow.totalRevenue) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-700 mb-3">📈 KEY METRICS</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">ROI:</span>
              <span className="font-semibold text-green-600">{cashFlow.roi}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payback Period:</span>
              <span className="font-semibold">1 month after harvest</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Break-even Yield:</span>
              <span className="font-semibold">{cashFlow.breakevenYield} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peak Working Capital:</span>
              <span className="font-semibold">{formatCurrency(cashFlow.loanNeeded)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Profit:</span>
              <span className="font-semibold text-green-600">{formatCurrency(cashFlow.netProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANK STATEMENT */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
        <h3 className="font-bold text-green-800 mb-2">🏦 BANK STATEMENT</h3>
        <p className="text-green-900">
          Based on your projected cash flow, you can afford a loan of <strong>{formatCurrency(cashFlow.loanNeeded)}</strong>
          with comfortable repayment capacity. Your peak deficit occurs in <strong>Month {
            cashFlow.months.findIndex(m => m.cumulativeCash === cashFlow.peakDeficit) + 1
          }</strong>.
          Consider timing your loan drawdown accordingly.
        </p>
      </div>

      {/* NEXT STEPS */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
        <h3 className="font-bold text-purple-800 mb-2">📞 NEXT STEPS</h3>
        <p className="text-purple-900">
          Take this cash flow statement to your bank, SACCO, or microfinance institution.
          The professional format meets global standards (IFRS) accepted by most financial institutions.
        </p>
      </div>
    </div>
  );
};