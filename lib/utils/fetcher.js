export const jsonFetcher = async (url, init) => {
  const res = await fetch(url, init);
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {}
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.json();
};


