
let pdfUrl = null;
function processPDF() {
  const fileInput = document.getElementById('pdfInput');
  const file = fileInput.files[0];

  if (file) {
    
    const reader = new FileReader();
    reader.onload = function (event) {
      pdfUrl = event.target.result;
      pdfToImages();
    };
    reader.readAsDataURL(file);
  } else {
    alert('Please select a PDF file.');
  }
}
async function pdfToImages() {
  const loadingTask = pdfjsLib.getDocument(pdfUrl);

  const loadingBar = document.getElementById('loadingBar');
  const progressBar = document.getElementById('progress');
  const pdf = await loadingTask.promise;

  const zip = new JSZip();

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const progressValue = (pageNumber / pdf.numPages) * 100;
      progressBar.style.width = `${progressValue}%`;
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    const imageData = canvas.toDataURL('image/jpg');
    zip.file(`file-page${pageNumber}.jpg`, imageData.split('base64,')[1], { base64: true });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  progressBar.style.width = '0%';
    alert('PDF processing complete!');

  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.zip';
    link.click();
  });
}

// document.getElementById('pdfInput').addEventListener('change', processPDF);
