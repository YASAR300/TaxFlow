import React from 'react';
import { formatINR } from '@/utils/indianFormat';

/**
 * TaxBreakupTable - Extracted sub-component for showing detailed GST tax breakup.
 * 
 * Props:
 * - taxSlabs (array): Active GST slabs, each containing { rate, taxable, cgst, sgst, igst, total }
 * - taxMode (string): 'intrastate' or 'interstate'
 * - totalCGST (number): Sum of CGST
 * - totalSGST (number): Sum of SGST
 * - totalIGST (number): Sum of IGST
 * - totalTax (number): Sum of all GST taxes
 */
export default function TaxBreakupTable({
  taxSlabs = [],
  taxMode = 'intrastate',
  totalCGST = 0,
  totalSGST = 0,
  totalIGST = 0,
  totalTax = 0
}) {
  if (!taxSlabs || taxSlabs.length === 0) return null;

  const isIntrastate = taxMode === 'intrastate';

  return (
    <div className="w-full mt-3 text-[11px] text-[#4a5568] border border-slate-200 rounded overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 font-semibold border-b border-slate-200">
            <th className="p-1.5 text-left border-r border-slate-200 text-[#4a5568]">GST Slab</th>
            <th className="p-1.5 text-right border-r border-slate-200 text-[#4a5568]">Taxable Value</th>
            {isIntrastate ? (
              <>
                <th className="p-1.5 text-right border-r border-slate-200 text-[#4a5568]">CGST</th>
                <th className="p-1.5 text-right border-r border-slate-200 text-[#4a5568]">SGST</th>
              </>
            ) : (
              <th className="p-1.5 text-right border-r border-slate-200 text-[#4a5568]">IGST</th>
            )}
            <th className="p-1.5 text-right text-[#4a5568]">Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {taxSlabs.map((slab) => {
            const slabRate = parseFloat(slab.rate) || 0;
            const taxable = parseFloat(slab.taxable) || 0;
            const total = parseFloat(slab.total) || 0;

            return (
              <tr key={slab.rate} className="border-b border-slate-200 last:border-b-0">
                <td className="p-1.5 border-r border-slate-200 font-medium">GST @ {slabRate}%</td>
                <td className="p-1.5 text-right border-r border-slate-200 font-mono text-[10.5px]">
                  {formatINR(taxable)}
                </td>
                {isIntrastate ? (
                  <>
                    <td className="p-1.5 text-right border-r border-slate-200 font-mono text-[10.5px]">
                      <span className="text-[9px] text-slate-400 mr-1">({slabRate / 2}%)</span>
                      {formatINR(slab.cgst || 0)}
                    </td>
                    <td className="p-1.5 text-right border-r border-slate-200 font-mono text-[10.5px]">
                      <span className="text-[9px] text-slate-400 mr-1">({slabRate / 2}%)</span>
                      {formatINR(slab.sgst || 0)}
                    </td>
                  </>
                ) : (
                  <td className="p-1.5 text-right border-r border-slate-200 font-mono text-[10.5px]">
                    <span className="text-[9px] text-slate-400 mr-1">({slabRate}%)</span>
                    {formatINR(slab.igst || 0)}
                  </td>
                )}
                <td className="p-1.5 text-right font-semibold font-mono text-[10.5px]">
                  {formatINR(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
