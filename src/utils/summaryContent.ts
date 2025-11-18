export function summaryContent(html: string = '', maxLength = 30) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
