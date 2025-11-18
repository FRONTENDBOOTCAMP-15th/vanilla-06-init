export function formatDate(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  // datetime 속성용 ISO (YYYY-MM-DD)
  const datetime = date.toISOString().split('T')[0];

  // 화면 표시용: Apr 19. 2024
  const display = date
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .replace(',', '.');

  return { datetime, display };
}
