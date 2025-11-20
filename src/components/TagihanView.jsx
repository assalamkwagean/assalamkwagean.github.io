import React from 'react';
import { FaFileInvoiceDollar, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function TagihanView({ data }) {
    if (!data) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data tagihan...</p>
            </div>
        );
    }

    const { recap } = data;

    if (!recap || Object.keys(recap).length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <FaFileInvoiceDollar className="text-4xl mb-2 mx-auto opacity-50" />
                <p>Tidak ada data tagihan</p>
            </div>
        );
    }

    // Convert recap object to array and sort if needed
    // Assuming keys are like "Januari", "Februari" or specific bill names
    const items = Object.entries(recap).map(([key, value]) => ({
        name: key,
        amount: value
    }));

    const formatCurrency = (val) => 'Rp ' + (Number(val) || 0).toLocaleString('id-ID');

    return (
        <div className="animate-fade-in">
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                        <FaFileInvoiceDollar className="mr-2 text-emerald-400" />
                        Rekapitulasi Tagihan
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-700/50 text-gray-300 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Jenis Tagihan / Bulan</th>
                                <th className="p-4 font-medium text-right">Status / Jumlah Dibayar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-700/30 transition">
                                    <td className="p-4 text-gray-200 font-medium">{item.name}</td>
                                    <td className="p-4 text-right">
                                        {/* Logic to determine if it's a status or amount */}
                                        {/* Based on the GAS logic, it seems to be amounts paid */}
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Number(item.amount) > 0
                                                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-slate-700 text-gray-400'
                                            }`}>
                                            {Number(item.amount) > 0 ? (
                                                <>
                                                    <FaCheckCircle className="mr-1" /> {formatCurrency(item.amount)}
                                                </>
                                            ) : (
                                                <>
                                                    <FaClock className="mr-1" /> Belum Dibayar
                                                </>
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
