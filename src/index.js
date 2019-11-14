import 'dialog-polyfill/dialog-polyfill.css'
import dialogPolyfill from 'dialog-polyfill'
import QrScanner from 'qr-scanner';
import isUrl from 'is-url';
import vcard from 'vcard-parser';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

navigator.serviceWorker.onmessage = (event) => {
  const imageBlob = event.data.file;

  QrScanner.scanImage(imageBlob)
    .then(onScanSuccess)
    .catch(() => {
      qrScan.stop();

      qrText.innerHTML = 'No QR Code found';

      shareButton.disabled = true;
      resultDialog.showModal();
    })
};

shareButton.addEventListener('click', () => {
  if ('share' in navigator) {
    navigator
      .share({
        title: 'Scan Result',
        text: result,
        url: window.location.toString()
      }).catch((err) => {
      console.warn(err);
    });
  }
});

QrScanner.WORKER_PATH = './worker/qr-scanner-worker.min.js';

const videoPlayer = document.querySelector('#player');
const resultDialog = document.querySelector('#result-dialog');

const newCodeButton = document.querySelector('#next-button');
const qrText = document.querySelector('#qr-text');
const shareButton = document.querySelector('#share-button');

shareButton.disabled = true;

let result;

if (!resultDialog.showModal) {
  dialogPolyfill.registerDialog(resultDialog);
}

newCodeButton.addEventListener('click', () => {
  resultDialog.close();
  qrScan.start();

  while (qrText.firstChild) {
    qrText.removeChild(qrText.firstChild);
  }
});

const onScanSuccess = (text) => {
  result = text;

  if (isUrl(text)) {
    const qrLink = document.createElement('a');

    qrLink.appendChild(document.createTextNode(result))
    qrLink.target = '_blank';
    qrLink.title = result;
    qrLink.href = result;

    qrText.appendChild(qrLink)

    window.open(result, '_blank')

    return;
  } else if (text.startsWith('BEGIN:VCARD')) {
    const vcf = new Blob([result], { type: 'text/vcard' })
    const url = URL.createObjectURL(vcf);

    const contact = vcard.parse(result);
    const qrParagraph = document.createElement('p');
    const qrLink = document.createElement('a');
    const names = contact.fn.map(entry => entry.value).join(', ');

    qrParagraph.appendChild(document.createTextNode(`Kontakt herunterladen:`));
    qrLink.appendChild(document.createTextNode(names));
    qrLink.target = '_blank';
    qrLink.title = names;
    qrLink.href = url;
    qrLink.download = 'contacts.vcf';

    qrText.appendChild(qrParagraph)
    qrText.appendChild(qrLink)
  } else {
    qrText.innerHTML = result.replace(/\n/g, "<br />");
  }

  shareButton.disabled = false;

  qrScan.stop();
  resultDialog.showModal();
}

const qrScan = new QrScanner(videoPlayer, onScanSuccess);

qrScan.start();
