export function getCsrfToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
