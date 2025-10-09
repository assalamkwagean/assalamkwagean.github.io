import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-800 p-3 border-b border-slate-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-indigo-400 font-bold">Pondok As-Salam</div>
        <div className="space-x-3">
          <Link href="/form"><a className="text-gray-200">Form</a></Link>
          <Link href="/recap"><a className="text-gray-200">Rekap</a></Link>
        </div>
      </div>
    </nav>
  );
}
