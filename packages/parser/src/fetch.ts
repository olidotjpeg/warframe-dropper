const URL = 'https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html';

export async function fetchHtml(): Promise<string> {
    console.log(`Fetching ${URL}`);
    const res = await fetch(URL);

    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    const html = await res.text();
    return html
}