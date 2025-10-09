import '../globals.css';
import Navbar from '../components/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-900 min-h-screen text-gray-100">
        <Navbar />
        <main className="pt-4">{children}</main>
      </body>
    </html>
  );
}
