/**
 * Format a date string or Date object into a readable format
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'MM/DD/YYYY')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${month}/${day}/${year}`;
  }
};
