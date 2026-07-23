import { useState, type ChangeEvent, type FormEvent } from "react";

// Point this at your Flask backend
const API_URL = "http://localhost:5000/api/send-link";

interface EmailFormData {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
}

type StatusState = "idle" | "sending" | "success" | "error";

interface Status {
  state: StatusState;
  text: string;
}

type FieldErrors = Partial<Record<keyof EmailFormData, string>>;

interface SendEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  errors?: FieldErrors;
}

const initialForm: EmailFormData = {
  customerName: "",
  customerEmail: "",
  subject: "",
  message: "",
};

export default function Feedback() {
  const [form, setForm] = useState<EmailFormData>(initialForm);
  const [status, setStatus] = useState<Status>({ state: "idle", text: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ state: "sending", text: "" });
    setFieldErrors({});

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: SendEmailResponse = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setFieldErrors(data.errors);
        setStatus({ state: "error", text: data.error || "Please fix the errors below." });
        return;
      }

      setStatus({ state: "success", text: data.message || "Email sent." });
      setForm(initialForm);
    } catch {
      setStatus({ state: "error", text: "Could not reach the server. Is the Flask backend running?" });
    }
  }

  const inputClasses =
    "w-full box-border px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-stone-50 text-stone-900 " +
    "placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1 focus:bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-sm p-8"
      >
        <h1 className="text-xl font-bold text-stone-900 mb-1">Email a customer</h1>
        <p className="text-sm text-stone-500 mb-6">Send a one-off message straight from here.</p>

        <label htmlFor="customerName" className="block text-sm font-semibold text-stone-700 mt-4 mb-1.5">
          Customer name
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          placeholder="Jane Doe"
          value={form.customerName}
          onChange={handleChange}
          className={inputClasses}
        />

        <label htmlFor="customerEmail" className="block text-sm font-semibold text-stone-700 mt-4 mb-1.5">
          Customer email
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          placeholder="jane@example.com"
          value={form.customerEmail}
          onChange={handleChange}
          required
          className={inputClasses}
        />
        {fieldErrors.customerEmail && (
          <span className="block text-xs text-red-600 mt-1">{fieldErrors.customerEmail}</span>
        )}

        <label htmlFor="subject" className="block text-sm font-semibold text-stone-700 mt-4 mb-1.5">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="Your order has shipped"
          value={form.subject}
          onChange={handleChange}
          required
          className={inputClasses}
        />
        {fieldErrors.subject && <span className="block text-xs text-red-600 mt-1">{fieldErrors.subject}</span>}

        <label htmlFor="message" className="block text-sm font-semibold text-stone-700 mt-4 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Write your message..."
          value={form.message}
          onChange={handleChange}
          required
          className={`${inputClasses} resize-y`}
        />
        {fieldErrors.message && <span className="block text-xs text-red-600 mt-1">{fieldErrors.message}</span>}

        <button
          type="submit"
          disabled={status.state === "sending"}
          className="mt-6 w-full py-3 text-sm font-semibold text-white bg-emerald-800 rounded-lg
                     hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {status.state === "sending" ? "Sending..." : "Send email"}
        </button>

        {status.state === "success" && (
          <p className="mt-4 text-sm text-center text-emerald-800">{status.text}</p>
        )}
        {status.state === "error" && (
          <p className="mt-4 text-sm text-center text-red-600">{status.text}</p>
        )}
      </form>
    </div>
  );
}
