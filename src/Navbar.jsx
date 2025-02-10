import './Navbar.css';
import Button from './Button';

function Navbar({ onPdfSelect }) {
  const pdfFiles = [
    { name: '23bce1370', path: '/23bce1370.pdf' },
    { name: 'os module 1', path: '/os_1.pdf' },
    { name: 'module 3', path: '/os_3.pdf' },
    { name: 'ai notes', path: '/ai.pdf' },
    { name: 'Document 5', path: '/document5.pdf' },
  ];

  return (
    <div className="navbar">
      <h2 >PDF Documents</h2>
      <div className="nav-buttons">
        {pdfFiles.map((pdf, index) => (
          <Button
            key={index}
            onClick={() => onPdfSelect(pdf.path)}
            className="nav-button custom-nav-button"
          >
            {pdf.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Navbar;