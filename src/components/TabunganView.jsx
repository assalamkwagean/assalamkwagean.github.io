import React, { useState } from 'react';
import { FaWallet, FaCoins, FaChartLine, FaArrowUp, FaArrowDown, FaStickyNote, FaInbox } from 'react-icons/fa';

export default function TabunganView({ data }) {
    const [activeTab, setActiveTab] = useState('topup');

    if (!data) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data tabungan...</p>
            </div>
        );
    }

    const { saldo, limitHarian, riwayat } = data;

    // Calculate today's withdrawals
    const today = new Date().setHours(0, 0, 0, 0);
    const totalPenarikanHariIni = riwayat
        .filter(item => item.type === 'PENARIKAN' && new Date(item.tanggal).setHours(0, 0, 0, 0) === today)
        .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

    const sisaLimit = Math.max(0, limitHarian - totalPenarikanHariIni);

    // Filter history
    const riwayatTopUp = riwayat.filter(item => item.type === 'TOP-UP');
    const riwayatPenarikan = riwayat.filter(item => item.type === 'PENARIKAN');

    const formatCurrency = (val) => 'Rp ' + (val || 0).toLocaleString('id-ID');
    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID');

    return (
        <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Saldo Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl shadow-lg p-6 text-white transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Saldo Tabungan</span>
                        <FaWallet className="text-2xl opacity-75" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatCurrency(saldo)}</div>
                    <div className="text-xs opacity-75">Update: {new Date().toLocaleTimeString('id-ID')}</div>
                </div>

                {/* Limit Harian Card */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Limit Harian</span>
                        <FaCoins className="text-2xl text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-100 mb-1">{formatCurrency(limitHarian)}</div>
                    <div className="text-xs text-gray-400">Maksimal penarikan per hari</div>
                </div>

                {/* Sisa Limit Card */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Sisa Limit Hari Ini</span>
                        <FaChartLine className="text-2xl text-blue-400" />
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${sisaLimit <= 0 ? 'text-red-400' : sisaLimit < limitHarian * 0.3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {formatCurrency(sisaLimit)}
                    </div>
                    <div className="text-xs">
                        <span className="text-gray-400">Sudah ditarik: </span>
                        <span className="text-yellow-400">{formatCurrency(totalPenarikanHariIni)}</span>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('topup')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition ${activeTab === 'topup'
                                ? 'border-b-2 border-emerald-500 text-emerald-400 bg-slate-700/50'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/30'
                            }`}
                    >
                        <FaArrowUp className="mr-2" /> Riwayat Top-Up
                    </button>
                    <button
                        onClick={() => setActiveTab('penarikan')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition ${activeTab === 'penarikan'
                                ? 'border-b-2 border-yellow-500 text-yellow-400 bg-slate-700/50'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/30'
                            }`}
                    >
                        <FaArrowDown className="mr-2" /> Riwayat Penarikan
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'topup' ? (
                        <div className="space-y-3">
                            {riwayatTopUp.length > 0 ? (
                                riwayatTopUp.map((item, index) => (
                                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-500/50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-1">
                                                    <FaArrowUp className="text-emerald-400 mr-2" />
                                                    <span className="font-semibold text-gray-200">Top-Up</span>
                                                </div>
                                                <div className="text-xs text-gray-400">{formatDate(item.tanggal)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-emerald-400">+{formatCurrency(item.jumlah)}</div>
                                                <div className="text-xs text-gray-400">{item.metode || 'Manual'}</div>
                                            </div>
                                        </div>
                                        {item.keterangan && (
                                            <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-gray-400 flex items-center">
                                                <FaStickyNote className="mr-1" /> {item.keterangan}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <FaInbox className="text-4xl mb-2 mx-auto opacity-50" />
                                    <p>Belum ada riwayat top-up</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {riwayatPenarikan.length > 0 ? (
                                riwayatPenarikan.map((item, index) => (
                                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-yellow-500/50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-1">
                                                    <FaArrowDown className="text-yellow-400 mr-2" />
                                                    <span className="font-semibold text-gray-200">Penarikan</span>
                                                    {item.keterangan && item.keterangan.includes('[PENARIKAN KHUSUS]') && (
                                                        <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded text-white">Khusus</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400">{formatDate(item.tanggal)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-yellow-400">-{formatCurrency(item.jumlah)}</div>
                                                <div className="text-xs text-gray-400">{item.metode || 'Manual'}</div>
                                            </div>
                                        </div>
                                        {item.keterangan && (
                                            <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-gray-400 flex items-center">
                                                <FaStickyNote className="mr-1" /> {item.keterangan}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <FaInbox className="text-4xl mb-2 mx-auto opacity-50" />
                                    <p>Belum ada riwayat penarikan</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
