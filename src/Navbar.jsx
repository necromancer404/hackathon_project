import { useState } from 'react';
import './Navbar.css';

function Navbar({ onPdfSelect }) {
  const pdfFiles = [
    { name: 'Document 1', path: '/23bce1370.pdf' },
    { name: 'Document 2', path: '/document2.pdf' },
    { name: 'Document 3', path: '/document3.pdf' },
    { name: 'Document 4', path: '/document4.pdf' },
    { name: 'Document 5', path: '/document5.pdf' },
  ];

  return (
    <div className="navbar">
      <h2>PDF Documents</h2>
      <div className="nav-buttons">
        {pdfFiles.map((pdf, index) => (
          <button
            key={index}
            onClick={() => onPdfSelect(pdf.path)}
            className="nav-button"
          >
            {pdf.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Navbar;
