// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker error:', err));
  });
}

// Функция загрузки кубика
function loadCube() {
  const status = document.getElementById('status');
  const loadButton = document.getElementById('loadButton');
  const title = document.getElementById('title');

  // Чтение буфера обмена
  if (!navigator.clipboard) {
    status.textContent = 'Clipboard API not supported in this browser!';
    return;
  }

  navigator.clipboard.readText()
    .then(text => {
      const numbers = text.trim().split(' ').map(Number).filter(n => !isNaN(n));
      if (numbers.length !== 6) {
        status.textContent = 'Clipboard must contain exactly 6 numbers separated by spaces (e.g., "1 3 5 2 2 3")';
        return;
      }

      // Загружаем JSON
      fetch('/data/cubes.json')
        .then(response => response.json())
        .then(data => {
          const cube = data.find(item => item.image_id === 'cube');
          if (!cube) {
            status.textContent = 'Cube not found!';
            return;
          }

          // Настройка Canvas
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = cube.image_url;

          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Наложение цифр на грани
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

            // Скрываем кнопку, заголовок и статус после успешной загрузки
            loadButton.style.display = 'none';
            title.style.display = 'none';
            status.style.display = 'none';
          };

          img.onerror = () => {
            status.textContent = 'Error loading image!';
          };
        })
        .catch(err => {
          console.error('Error loading JSON:', err);
          status.textContent = 'Error loading cube data!';
        });
    })
    .catch(err => {
      console.error('Error reading clipboard:', err);
      status.textContent = 'Error reading clipboard! Please allow clipboard access.';
    });
}