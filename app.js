// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/cubes/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker error:', err));
  });
}

// Функция загрузки кубика
function loadCube() {
  const status = document.getElementById('status');
  const loadButton = document.getElementById('loadButton');
  const title = document.getElementById('title');

  if (!navigator.clipboard) {
    status.textContent = 'Clipboard API not supported in this browser!';
    console.error('Clipboard API not supported');
    return;
  }

  navigator.clipboard.readText()
    .then(text => {
      console.log('Clipboard text:', text);
      const numbers = text.trim().split(' ').map(Number).filter(n => !isNaN(n));
      if (numbers.length !== 6) {
        status.textContent = 'Clipboard must contain exactly 6 numbers separated by spaces (e.g., "1 3 5 2 2 3")';
        console.error('Invalid clipboard data:', numbers);
        return Promise.reject('Invalid clipboard data');
      }

      return fetch('/cubes/data/cubes.json')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('JSON data:', data);
          const cube = data.find(item => item.image_id === 'cube');
          if (!cube) {
            status.textContent = 'Cube not found!';
            console.error('Cube not found in JSON:', data);
            return Promise.reject('Cube not found');
          }
          return { numbers, cube };
        });
    })
    .then(({ numbers, cube }) => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = cube.image_url;

      return new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('Image loaded:', img.src);
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          cube.faces.forEach((face, index) => {
            if (index < numbers.length) {
              const number = numbers[index];
              const fontSize = Math.min(face.width, face.height) * 0.7;
              ctx.font = `bold ${fontSize}px Impact, "Arial Black", Arial, sans-serif`;
              ctx.fillStyle = 'black';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(number, face.x + face.width / 2, face.y + face.height / 2);
            }
          });

          loadButton.style.display = 'none';
          title.style.display = 'none';
          status.style.display = 'none';
          resolve();
        };
        img.onerror = () => {
          status.textContent = 'Error loading image!';
          console.error('Image load error:', img.src);
          reject('Error loading image');
        };
      });
    })
    .catch(err => {
      console.error('Error in loadCube:', err);
      status.textContent = `Error: ${err.message || err}. Try again or check browser settings.`;
    });
}