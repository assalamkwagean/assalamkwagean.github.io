"use client";

import { useEffect, useState } from 'react';
import { getStudents, getCategories, getAppLogo, processPayment, getRecap } from '../../lib/api';

function ReceiptModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div id="receiptContent">
          <h3 className="text-lg font-bold">Kwitansi Pembayaran</h3>
          <p>Nama: {data.nama}</p>
          <p>NIS: {data.nis}</p>
          <p>Tanggal: {data.tanggal}</p>
          <div className="mt-2">
            {data.tagihan && data.tagihan.map((t, idx) => (
              <div key={idx} className="flex justify-between border-b py-1">
                <div>{t.jenisTagihan}</div>
                <div>Rp {Number(t.jumlahDibayar).toLocaleString('id-ID')}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default function FormPage() {
  const [logo, setLogo] = useState('');
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedNis, setSelectedNis] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [jenisTagihanOptions, setJenisTagihanOptions] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState([]);
  const [tagihanList, setTagihanList] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const url = await getAppLogo();
        if (url) setLogo(url);
        const sts = await getStudents();
        setStudents(sts || []);
        const cats = await getCategories();
        setCategories(cats || []);
      } catch (e) {
        console.error('init error', e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    // when category changes, set jenis options
    const matched = categories.find(c => c.nama === selectedCategory);
    if (matched) setJenisTagihanOptions(matched.tagihan || []);
    else setJenisTagihanOptions([]);
  }, [selectedCategory, categories]);

  useEffect(() => {
    // when selectedJenis changes, build tagihanList rows
    const rows = selectedJenis.map(j => {
      // find amount from jenisTagihanOptions
      const opt = jenisTagihanOptions.find(o => o.nama === j) || {};
      return {
        jenisTagihan: j,
        jumlahTagihan: Number(opt.jumlah) || 0,
        potongan: 0,
        jumlahDibayar: Number(opt.jumlah) || 0
      };
    });
    setTagihanList(rows);
  }, [selectedJenis, jenisTagihanOptions]);

  function updateRow(index, changes) {
    setTagihanList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...changes };
      // ensure jumlahDibayar = jumlahTagihan - potongan
      copy[index].jumlahDibayar = Number(copy[index].jumlahTagihan) - Number(copy[index].potongan || 0);
      return copy;
    });
  }

  function calculateTotals() {
    let totalTagihan = 0, totalPotongan = 0, totalDibayar = 0;
    tagihanList.forEach(r => {
      totalTagihan += Number(r.jumlahTagihan) || 0;
      totalPotongan += Number(r.potongan) || 0;
      totalDibayar += Number(r.jumlahDibayar) || 0;
    });
    return { totalTagihan, totalPotongan, totalDibayar };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedNis || tagihanList.length === 0) {
      alert('Pilih santri dan jenis tagihan terlebih dahulu');
      return;
    }
    const payload = {
      nis: selectedNis,
      nama: (students.find(s => s[0] === selectedNis) || [ '', '' ])[1],
      kategori: selectedCategory,
      metode: 'Tunai',
      penerima: localStorage.getItem('adminNama') || '',
      catatan: '',
      tagihan: tagihanList.map(r => ({ jenisTagihan: r.jenisTagihan, jumlahTagihan: r.jumlahTagihan, potongan: r.potongan, jumlahDibayar: r.jumlahDibayar }))
    };

    try {
      setLoading(true);
      const res = await processPayment(payload);
      if (res && res.success) {
        setReceiptData(res.data);
        // reset
        setSelectedJenis([]);
        setTagihanList([]);
      } else {
        alert('Gagal menyimpan pembayaran: ' + (res.error || JSON.stringify(res)));
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex flex-col items-center mb-6">
          {logo && <img src={logo} alt="logo" className="h-16 mb-3" />}
          <h1 className="text-2xl font-bold text-indigo-400 text-center">PEMBAYARAN PONDOK AS-SALAM</h1>
          <p className="text-gray-400 mt-1">Pesantren Fathul Ulum Periode 1446-1447 H.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">NIS/Nama Santri</label>
            <select value={selectedNis} onChange={e => setSelectedNis(e.target.value)} className="mt-1 block w-full rounded p-2 bg-slate-700 text-gray-100">
              <option value="">Pilih Santri</option>
              {students.map(s => (
                <option key={s[0]} value={s[0]}>{s[1]} ({s[0]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Kategori</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="mt-1 block w-full rounded p-2 bg-slate-700 text-gray-100">
              <option value="">Pilih Kategori</option>
              {categories.map(c => (
                <option key={c.nama} value={c.nama}>{c.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Jenis Tagihan (Pilih Banyak)</label>
            <select multiple value={selectedJenis} onChange={e => setSelectedJenis(Array.from(e.target.selectedOptions).map(o => o.value))} className="mt-1 block w-full rounded p-2 bg-slate-700 text-gray-100">
              {jenisTagihanOptions.map(opt => (
                <option key={opt.nama} value={opt.nama}>{opt.nama} - Rp {Number(opt.jumlah).toLocaleString('id-ID')}</option>
              ))}
            </select>
          </div>

          {tagihanList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto tagihan-table">
                <thead>
                  <tr>
                    <th className="text-left">Jenis</th>
                    <th className="text-right">Jumlah</th>
                    <th className="text-right">Potongan</th>
                    <th className="text-right">Dibayar</th>
                  </tr>
                </thead>
                <tbody id="tagihanList">
                  {tagihanList.map((r, i) => (
                    <tr key={i}>
                      <td>{r.jenisTagihan}</td>
                      <td className="text-right">Rp {Number(r.jumlahTagihan).toLocaleString('id-ID')}</td>
                      <td className="text-right"><input type="number" value={r.potongan} onChange={e => updateRow(i, { potongan: Number(e.target.value) })} className="bg-slate-700 text-right p-1 rounded" /></td>
                      <td className="text-right">Rp {Number(r.jumlahDibayar).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="font-bold">Total</td>
                    <td className="text-right">Rp {totals.totalTagihan.toLocaleString('id-ID')}</td>
                    <td className="text-right">Rp {totals.totalPotongan.toLocaleString('id-ID')}</td>
                    <td className="text-right">Rp {totals.totalDibayar.toLocaleString('id-ID')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setSelectedJenis([]); setTagihanList([]); }} className="px-4 py-2 bg-slate-700 text-gray-100 rounded-md">Reset</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{loading ? 'Memproses...' : 'Simpan Pembayaran'}</button>
          </div>
        </form>
      </div>

      <ReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />
    </div>
  );
}
