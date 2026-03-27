const utf8 = new TextEncoder();
const utf8Decode = (b: Uint8Array) => new TextDecoder().decode(b);

export const toBase64 = (str: string): string =>
  btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );

export const fromBase64 = (b64: string): string =>
  decodeURIComponent(
    Array.prototype.map
      .call(
        atob(b64.replace(/\s/g, '')),
        (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      )
      .join('')
  );

export const encodeBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

export const encodeBase64UrlStr = (input: string): string => encodeBase64Url(utf8.encode(input));

export const decodeBase64UrlStr = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return utf8Decode(Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)));
};
