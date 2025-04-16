const { ipcRenderer } = require('electron');

document.getElementById('chooseFile').addEventListener('click', async () => {
  const filePath = await ipcRenderer.invoke('select-file');
  document.getElementById('filePath').value = filePath;
});

document.getElementById('convert').addEventListener('click', async () => {
  const inputPath = document.getElementById('filePath').value;
  const format = document.getElementById('format').value;
  const quality = parseInt(document.getElementById('quality').value);
  const removeMetadata = document.getElementById('metadata').checked;

  if (!inputPath) {
    alert('Please select a file.');
    return;
  }

  const output = await ipcRenderer.invoke('convert-image', {
    inputPath,
    format,
    quality,
    removeMetadata,
  });

  alert(`Image saved as: ${output}`);
});
