import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function MyApp() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentFile, setCurrentFile] = useState('/23bce1370.pdf'); // Default file

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

  function handleFileChange(filePath) {
    setCurrentFile(filePath);
    setPageNumber(1); // Reset to the first page when a new file is opened
  }

  return (
    <div className='app'>
      <div className='list'>
        <ul>
          <li>
            <button onClick={() => handleFileChange('/23BCE1370_assesment8.pdf')}>
              Open PDF2
            </button>
          </li>
        </ul>
      </div>
      <div className='doc'>
        <Document file={currentFile} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
        <p className='pagenum'>
          Page {pageNumber} of {numPages}
        </p>
        <div>
          <button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
            Previous
          </button>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            Next
          </button>
        </div>
      </div>
      <div className="floating-button" onClick={() => alert('Button clicked!')}>
        +
      </div>
    </div>
  );
}

export default MyApp;
