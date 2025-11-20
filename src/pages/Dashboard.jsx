import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import TabunganView from '../components/TabunganView';
import TagihanView from '../components/TagihanView';
import { FaSignOutAlt, FaWallet, FaFileInvoiceDollar } from 'react-icons/fa';

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('tabungan');
    const [santriData, setSantriData] = useState(null);
    const [tabunganData, setTabunganData] = useState(null);
    const [tagihanData, setTagihanData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Extract NIS from email (nis@santri.com)
        const nis = currentUser.email.split('@')[0];

        // Listen to Santri Data (if needed for name, etc)
        // For now we just use the ID

        // Listen to Tabungan Data
        const unsubTabungan = onSnapshot(doc(db, 'tabungan', nis), (doc) => {
            if (doc.exists()) {
                setTabunganData(doc.data());
            }
        });

        // Listen to Tagihan Data
        const unsubTagihan = onSnapshot(doc(db, 'tagihan', nis), (doc) => {
            if (doc.exists()) {
                setTagihanData(doc.data());
            }
        });

        setLoading(false);

        return () => {
            unsubTabungan();
            unsubTagihan();
        };
    }, [currentUser]);

    return (
        <div className="min-h-screen bg-slate-900 text-gray-100 pb-20">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-lg">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-emerald-400">Dashboard Santri</h1>
                        <p className="text-xs text-gray-400">NIS: {currentUser?.email.split('@')[0]}</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 text-gray-400 hover:text-red-400 transition"
                        title="Logout"
                    >
                        <FaSignOutAlt className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('tabungan')}
                        className={`flex items-center px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${activeTab === 'tabungan'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <FaWallet className="mr-2" /> Tabungan
                    </button>
                    <button
                        onClick={() => setActiveTab('tagihan')}
                        className={`flex items-center px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${activeTab === 'tagihan'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <FaFileInvoiceDollar className="mr-2" /> Tagihan
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'tabungan' ? (
                        <TabunganView data={tabunganData} />
                    ) : (
                        <TagihanView data={tagihanData} />
                    )}
                </div>
            </div>
        </div>
    );
}
