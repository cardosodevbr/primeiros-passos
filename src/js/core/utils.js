/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 * @param {string} str
 * @returns {string}
 */
export function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Função de debounce para otimizar busca em tempo real nos inputs
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
