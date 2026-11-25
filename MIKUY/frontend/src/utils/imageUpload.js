/**
 * Comprime y valida fotografías (JPG, PNG, WEBP) en el navegador antes de subirlas a MySQL.
 */
export function compressImageFile(file, maxSide = 720, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No se seleccionó archivo.'));
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      return reject(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'));
    }
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('La imagen supera el máximo de 5 MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Archivo de imagen dañado.'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
