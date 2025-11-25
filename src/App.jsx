import { links } from "./links";

function App() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <img
            src="/assets/placeholder.png"
            alt="Pondok As-Salam"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pondok As-Salam
          </h1>
          <p className="text-gray-600 mb-6">
            Selamat datang di halaman resmi Pondok As-Salam.
          </p>
        </div>
        <div className="space-y-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-500 text-white text-center py-4 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
