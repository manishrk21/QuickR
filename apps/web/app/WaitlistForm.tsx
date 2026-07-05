// apps/web/app/WaitlistForm.tsx
// Client component — isolated so the rest of page.tsx stays a server component
"use client"

import { useState } from "react"
import emailjs from "@emailjs/browser"

type FormState = "idle" | "loading" | "success" | "error"

export function WaitlistForm() {
  const [state, setState] = useState<FormState>("idle")
  const [form, setForm] = useState({
    restaurant_name: "",
    owner_name: "",
    mobile: "",
    email: "",
    city: "",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("loading")

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          restaurant_name: form.restaurant_name,
          owner_name:      form.owner_name,
          mobile:          form.mobile,
          email:           form.email,
          city:            form.city,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setState("success")
    } catch {
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div
        className="mt-8 rounded-2xl p-8 text-center"
        style={{ background: "rgba(99,1,2,0.08)", border: "1px solid rgba(99,1,2,0.2)" }}
      >
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold text-lg" style={{ color: "#0d0000" }}>
          Request received!
        </p>
        <p className="mt-2 text-sm" style={{ color: "rgba(13,0,0,0.6)" }}>
          We'll reach out to {form.owner_name} within 24 hours to get you set up.
        </p>
      </div>
    )
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(99,1,2,0.25)",
    background: "rgba(99,1,2,0.04)",
    color: "#0d0000",
    fontSize: "14px",
    outline: "none",
  }

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "rgba(13,0,0,0.6)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label style={labelStyle}>Restaurant / Cafe name</label>
        <input
          required
          style={inputStyle}
          placeholder="The Deck Cafe"
          value={form.restaurant_name}
          onChange={(e) => set("restaurant_name", e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Your name</label>
        <input
          required
          style={inputStyle}
          placeholder="Ravi Kumar"
          value={form.owner_name}
          onChange={(e) => set("owner_name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Mobile</label>
          <input
            required
            type="tel"
            inputMode="numeric"
            maxLength={10}
            style={inputStyle}
            placeholder="9876543210"
            value={form.mobile}
            onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
        </div>
        <div>
          <label style={labelStyle}>City</label>
          <input
            required
            style={inputStyle}
            placeholder="Mumbai"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          required
          type="email"
          style={inputStyle}
          placeholder="owner@yourcafe.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>

      {state === "error" && (
        <p
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "rgba(99,1,2,0.08)", color: "#630102" }}
        >
          Something went wrong. Please email us directly at hello@quickr.in
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "#630102", color: "#EDEBDE", marginTop: "8px" }}
      >
        {state === "loading" ? "Sending…" : "Request access"}
      </button>

      <p className="text-center text-xs" style={{ color: "rgba(13,0,0,0.4)" }}>
        No commitment. We'll contact you within 24 hours.
      </p>
    </form>
  )
}
