import React from 'react';
import { FaInstagram, FaTiktok, FaYoutube, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { links } from '../links';

const ICONS = {
  instagram: <FaInstagram />,
  tiktok: <FaTiktok />,
  youtube: <FaYoutube />,
  whatsapp: <FaWhatsapp />,
  website: <FaGlobe />,
};

function Linktree() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center">
            <img
              className="w-24 h-24 rounded-full border-2 border-gray-300"
              src="https://assalamkwagean.github.io/images/logo-vertical.png"
              alt="Profile"
            />
            <h1 className="text-2xl font-bold mt-4 text-gray-800">Pondok Pesantren Assalam</h1>
            <p className="text-gray-600">Kwagean, Kediri, Jawa Timur</p>
          </div>
          <div className="mt-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-4 my-2 text-lg font-semibold text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <span>{link.title}</span>
                {ICONS[link.icon]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Linktree;
