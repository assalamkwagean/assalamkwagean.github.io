"use client";

import { useEffect, useState } from 'react';
import { getStudents, getRecap, getAppLogo } from '../../lib/api';

export default function RecapPage() {
  const [students, setStudents] = useState([]);
  const [selectedNis, setSelectedNis] = useState('');
  const [recapData, setRecapData] = useState(null);
  const [logo, setLogo] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const sts = await getStudents();
        setStudents(sts || []);
        const url = await getAppLogo();
        if (url) setLogo(url);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  async function loadRecap(nis) {
    if (!nis) {
      setRecapData(null);
      return;
    }
    try {
      const data = await getRecap(nis);
      setRecapData(data);
    } catch (e) {
      console.error(e);
      alert('Gagal memuat rekap');
    }
  }

  useEffect(() => { loadRecap(selectedNis); }, [selectedNis]);

  function preparePdf() {
    if (!recapData) return alert('Pilih santri terlebih dahulu');
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      alert('jsPDF tidak ditemukan di halaman. Tambahkan library jsPDF di index.html atau gunakan browser console.');
      return;
    }
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('REKAPITULASI PEMBAYARAN', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Nama: ${recapData.nama || ''}`, 15, 30);
    doc.text(`NIS: ${recapData.nis || ''}`, 15, 36);
    doc.text(`Kategori: ${recapData.kategori || ''}`, 15, 42);
    let y = 52;
    doc.setFontSize(10);
    if (recapData.tagihan && recapData.tagihan.length) {
      recapData.tagihan.forEach(item => {
        doc.text(item.jenis || '', 15, y);
        doc.text(`Rp ${Number(item.dibayarkan || 0).toLocaleString('id-ID')}`, 150, y, { align: 'right' });
        y += 6;
      });
    }
    doc.save(`Rekap_${recapData.nama || ''}_${recapData.nis || ''}.pdf`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex flex-col items-center mb-6">
          {logo && <img src={logo} alt="logo" className="h-16 mb-3" />}
          <h1 className="text-2xl font-bold text-indigo-400 text-center">REKAPITULASI PEMBAYARAN</h1>
          <p className="text-gray-400 mt-1">Pondok As-Salam Pesantren Fathul Ulum</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">Pilih Santri</label>
          <select value={selectedNis} onChange={e => setSelectedNis(e.target.value)} className="mt-1 block w-full rounded p-2 bg-slate-700 text-gray-100">
            <option value="">Pilih Santri</option>
            {students.map(s => <option key={s[0]} value={s[0]}>{s[1]} ({s[0]})</option>)}
          </select>
        </div>

        <div id="recapContent">
          {!recapData ? (
            <div className="text-center py-8">
              <i className="fas fa-user text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">Pilih santri untuk melihat rekapitulasi pembayaran</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><div className="text-sm text-gray-400">Nama</div><div className="font-bold">{recapData.nama}</div></div>
                  <div><div className="text-sm text-gray-400">NIS</div><div className="font-bold">{recapData.nis}</div></div>
                  <div><div className="text-sm text-gray-400">Kategori</div><div className="font-bold">{recapData.kategori}</div></div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full recap-table">
                  <thead>
                    <tr>
                      <th>Jenis Tagihan</th>
                      <th>Jumlah Tagihan</th>
                      <th>Sudah Dibayar</th>
                      <th>Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recapData.tagihan && recapData.tagihan.map((t, i) => (
                      <tr key={i}>
                        <td>{t.jenis}</td>
                        <td>Rp {Number(t.jumlahTagihan || 0).toLocaleString('id-ID')}</td>
                        <td>Rp {Number(t.dibayarkan || 0).toLocaleString('id-ID')}</td>
                        <td>Rp {Number((t.jumlahTagihan || 0) - (t.dibayarkan || 0)).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-slate-700 text-gray-100 rounded-md">Kembali</button>
                <button onClick={preparePdf} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Lihat & Unduh PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
