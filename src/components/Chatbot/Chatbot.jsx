import React, { useEffect, useMemo, useState } from "react";
import { fetchChatbotConfig, askChatbot } from "../../services/chatbotService";
import "./Chatbot.css";

const PARAM_LABELS = {
  customerId: "Customer",
  productId: "Product",
  invoiceNumber: "Invoice Number",
  fromDate: "From Date",
  toDate: "To Date",
  supplierId: "Supplier",
  salesmanId: "Salesman",
  saleType: "Sale Type",
  categoryId: "Category",
  reportType: "Report Type",
};

const PAGE_LIMIT = 15;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("categories"); // categories | questions | params | result
  const [config, setConfig] = useState({ categories: [], questions: [] });
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (open && !config.categories.length) {
      fetchChatbotConfig()
        .then((cfg) => (cfg && cfg.success ? setConfig(cfg) : setError(cfg?.error || "Failed to load")))
        .catch(() => setError("Could not reach server"));
    }
  }, [open, config.categories.length]);

  const categoryQuestions = useMemo(
    () => config.questions.filter((q) => q.category === category?.id),
    [config, category]
  );

  const reset = () => {
    setView("categories");
    setCategory(null);
    setQuestion(null);
    setParams({});
    setResult(null);
    setError("");
    setPage(0);
  };

  const selectQuestion = (q) => {
    setQuestion(q);
    setParams({});
    if (!q.requiredParams || q.requiredParams.length === 0) {
      submit(q, {});
    } else {
      setView("params");
    }
  };

  const submit = async (q, p) => {
    setLoading(true);
    setError("");
    setView("result");
    setPage(0);
    try {
      const res = await askChatbot(q.id, p);
      setResult(res);
    } catch {
      setResult({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  const rows = result?.data || [];
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const pageRows = rows.slice(page * PAGE_LIMIT, page * PAGE_LIMIT + PAGE_LIMIT);

  return (
    <>
      <button className="chatbot-fab" onClick={() => setOpen((o) => !o)} title="Admin AI Assistant">
        💬
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Admin AI Assistant</span>
            <button onClick={reset} title="Restart">↺</button>
            <button onClick={() => setOpen(false)} title="Close">×</button>
          </div>
          <div className="chatbot-body">
            {error && <div className="chatbot-error">{error}</div>}

            {view === "categories" && (
              <>
                <div className="chatbot-prompt">How can I help you? Pick a category:</div>
                <div className="chatbot-grid">
                  {config.categories.map((c) => (
                    <button key={c.id} className="chatbot-chip" onClick={() => { setCategory(c); setView("questions"); }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {view === "questions" && (
              <>
                <div className="chatbot-prompt">{category?.label} — select a question:</div>
                <div className="chatbot-questions">
                  {categoryQuestions.map((q) => (
                    <button key={q.id} className="chatbot-q" onClick={() => selectQuestion(q)}>{q.question}</button>
                  ))}
                </div>
                <button className="chatbot-back" onClick={() => setView("categories")}>← Back to categories</button>
              </>
            )}

            {view === "params" && question && (
              <>
                <div className="chatbot-prompt">{question.question}</div>
                <div className="chatbot-form">
                  {question.requiredParams.map((p) => (
                    <label key={p}>
                      {PARAM_LABELS[p] || p}
                      <input
                        type={p === "fromDate" || p === "toDate" ? "date" : "text"}
                        value={params[p] || ""}
                        onChange={(e) => setParams({ ...params, [p]: e.target.value })}
                        placeholder={p === "customerId" || p === "productId" ? "Enter ID" : ""}
                      />
                    </label>
                  ))}
                  <button className="chatbot-submit" onClick={() => submit(question, params)}>Run</button>
                  <button className="chatbot-back" onClick={() => setView("questions")}>← Back</button>
                </div>
              </>
            )}

            {view === "result" && (
              <>
                {loading ? (
                  <div className="chatbot-prompt">Fetching…</div>
                ) : result ? (
                  <>
                    {result.error && <div className="chatbot-error">{result.error}</div>}
                    {result.message && <div className="chatbot-prompt">{result.message}</div>}
                    {result.summary && (
                      <div className="chatbot-summary">
                        {Object.entries(result.summary).map(([k, v]) => (
                          <div className="chatbot-card" key={k}>
                            <div className="chatbot-card-label">{k}</div>
                            <div className="chatbot-card-value">{String(v)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {rows.length > 0 && (
                      <div className="chatbot-table-wrap">
                        <table className="chatbot-table">
                          <thead>
                            <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
                          </thead>
                          <tbody>
                            {pageRows.map((r, i) => (
                              <tr key={i}>{columns.map((c) => <td key={c}>{String(r[c] ?? "")}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                        {rows.length > PAGE_LIMIT && (
                          <div className="chatbot-pager">
                            <button disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
                            <span>{page + 1} / {Math.ceil(rows.length / PAGE_LIMIT)}</span>
                            <button disabled={(page + 1) * PAGE_LIMIT >= rows.length} onClick={() => setPage(page + 1)}>›</button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
                <div className="chatbot-actions">
                  <button onClick={() => { setView("questions"); setResult(null); }}>Back to questions</button>
                  <button onClick={() => { setView("params"); setResult(null); if (question && !question.requiredParams?.length) setView("categories"); }}>Change filters</button>
                  <button onClick={reset}>New category</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
