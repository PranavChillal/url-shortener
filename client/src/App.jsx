import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [result, setResult] = useState(null);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadLinks() {
    try {
      const res = await fetch(`${API_URL}/api/links`);
      if (!res.ok) throw new Error("Request failed");
      setLinks(await res.json());
    } catch {
      setError("Could not load your links. Is the server running?");
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCopied(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data);
      setOriginalUrl("");
      await loadLinks();
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Could not reach the server. Is it running?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Please copy the link manually.");
    }
  }

  return (
    <div className="app">
      <h1>Link Shortener</h1>
      <p className="subtitle">Paste a long link, get a short one.</p>

      <form className="shorten-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="https://example.com/a/very/long/link"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
        />
        <button type="submit" disabled={loading || !originalUrl.trim()}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <span>Your short link:</span>
          <a href={result.shortUrl} target="_blank" rel="noreferrer">
            {result.shortUrl}
          </a>
          <button type="button" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      <div className="links-header">
        <h2>Your links</h2>
        <button type="button" className="secondary" onClick={loadLinks}>
          Refresh
        </button>
      </div>

      {links.length === 0 ? (
        <p className="empty">No links yet. Shorten your first one above!</p>
      ) : (
        <ul className="links">
          {links.map((link) => (
            <li key={link.id}>
              <div className="link-main">
                <a href={link.shortUrl} target="_blank" rel="noreferrer">
                  {link.shortUrl}
                </a>
                <span className="original" title={link.originalUrl}>
                  {link.originalUrl}
                </span>
              </div>
              <div className="link-meta">
                <strong>{link.clicks}</strong>{" "}
                {link.clicks === 1 ? "click" : "clicks"}
                <span className="date">
                  {new Date(link.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;