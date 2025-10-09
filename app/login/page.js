"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, getAppLogo } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    async function loadLogo() {
      try {
        const url = await getAppLogo();
        if (url) setLogo(url);
      } catch (e) {
        console.error('logo error', e);
      }
    }
    loadLogo();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await login(email, password);
      if (res && res.success) {
        if (res.user) localStorage.setItem('adminNama', res.user);
        router.push('/form');
      } else {
        setMessage(res.message || 'Login gagal');
      }
    } catch (err) {
      setMessage(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-6">
          <div className="inline-block rounded-md bg-slate-700 p-2 mb-4">
            {logo ? (
              <img src={logo} alt="logo" className="h-16 mx-auto" />
            ) : (
              <div className="text-gray-400">Loading...</div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-indigo-400">Login Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sistem Pembayaran Digital</p>
        </div>

        {message && <div className="p-3 mb-4 text-sm text-red-100 bg-red-600 rounded-lg">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="masukkan email admin"
              className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-slate-700 text-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="masukkan password"
              className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-slate-700 text-gray-100" />
          </div>

          <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500">
            {loading ? (<><i className="fas fa-spinner fa-spin mr-2"></i> Memproses...</>) : (<><i className="fas fa-sign-in-alt mr-2"></i> Login</>)}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">&copy; 2025 Pondok As-Salam Pesantren Fathul 'Ulum'.</p>
      </div>
    </div>
  );
}
