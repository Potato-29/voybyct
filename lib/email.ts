// Opens Gmail's compose window in the browser, addressed to `to`.
export function gmailComposeUrl(to: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to });
  return `https://mail.google.com/mail/?${params}`;
}
