import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './App.css';
import Navbar from './navbar'; 
import Button from './Button'; // Import the styled button

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function MyApp() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfPath, setPdfPath] = useState('/23bce1370.pdf'); // State to manage the selected PDF file

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function goToNextPage() {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  }

  function goToPreviousPage() {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  }

  function handlePdfSelect(path) {
    setPdfPath(path);
    setPageNumber(1); // Reset to the first page when a new PDF is selected
  }

  return (
    <div className='app'>
      <Navbar onPdfSelect={handlePdfSelect} />
      <div className='doc'>
        <Document
          file={pdfPath}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        <p className='pagenum'>
          Page {pageNumber} of {numPages}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
            Previous
          </Button>
          <Button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            Next
          </Button>
        </div>
      </div>
      <div className="floating-button" onClick={() => alert('Button clicked!')}>
        +
      </div>
    </div>
  );
}

export default MyApp;