// apps/web/app/privacy/page.tsx

import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — QuickR",
}

export default function PrivacyPage() {
  return (
    <div style={{ background: "#EDEBDE", minHeight: "100vh", color: "#0d0000", fontFamily: "Georgia, serif" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 sm:px-10"
        style={{ borderBottom: "1px solid rgba(99,1,2,0.12)" }}
      >
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ color: "#630102" }}>
          Quick<span style={{ color: "#0d0000" }}>R</span>
        </Link>
        <Link href="/" className="text-sm" style={{ color: "rgba(13,0,0,0.5)" }}>
          ← Back to home
        </Link>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: "#630102", opacity: 0.7 }}
        >
          Legal
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "#0d0000" }}>
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm" style={{ color: "rgba(13,0,0,0.5)" }}>
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed" style={{ color: "rgba(13,0,0,0.75)" }}>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>Who we are</h2>
            <p>
              QuickR is a contactless ordering platform for restaurants and cafes in India.
              When you use QuickR — whether as a customer ordering food or as a restaurant
              admin managing your menu — we collect some information to make the service work.
              This policy explains what we collect, why, and how long we keep it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>What we collect</h2>
            <ul className="space-y-3">
              {[
                ["Mobile number", "When you log in via OTP, we store your mobile number to identify you across visits to the same restaurant. Your number is never shared with any third party."],
                ["Name", "If you add your name to your profile, we store it so the restaurant can see it alongside your order."],
                ["Order history", "Every order you place is stored — items, quantities, price at time of order, and table. This is needed for the restaurant to serve you and for your own order tracking."],
                ["Visit history", "We track which days you visited a restaurant to calculate your loyalty streak. Only the date is stored, not the time or location."],
                ["Google account info", "If you sign in with Google, we receive your Google ID, email, and display name from Google. We store these to identify you on return visits. We do not access any other Google account data."],
                ["Device info", "We do not collect device identifiers, location data, or install any tracking cookies beyond what is necessary for your session."],
              ].map(([title, desc]) => (
                <li key={title as string} className="flex gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "#630102" }}
                  />
                  <div>
                    <span className="font-semibold" style={{ color: "#0d0000" }}>{title} — </span>
                    {desc}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>How we use it</h2>
            <ul className="space-y-2">
              {[
                "To process and display your order to the restaurant.",
                "To let you track your order status in real time.",
                "To calculate your loyalty streak and issue rewards.",
                "To let the restaurant see your order history if you are a registered (non-guest) customer.",
                "To send you an OTP via SMS for login (via MSG91, an Indian SMS provider).",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "#630102", opacity: 0.5 }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              We do not sell your data. We do not use your data for advertising.
              We do not share your data with the restaurant beyond what is necessary
              to fulfil your order.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>How long we keep it</h2>
            <ul className="space-y-2">
              {[
                "OTPs are deleted within 10 minutes of generation.",
                "Guest sessions are deleted after 48 hours of inactivity.",
                "Customer sessions (logged-in) expire after 24 hours.",
                "Order history is kept for 1 year, then automatically deleted.",
                "If you have not visited a restaurant in 12 months, your customer profile for that restaurant is eligible for deletion.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "#630102", opacity: 0.5 }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>Our Service Providers & Partners</h2>
            <ul className="space-y-2">
              {[
                ["Technical Infrastructure"," We use trusted cloud infrastructure and web hosting partners to manage our database, route network traffic, and prevent system abuse."],
                ["Data Localization"," In compliance with Indian regulations, all your personal data is stored and processed on secure cloud servers physically located within India."],
                ["Communication Partners","We use localized telecom infrastructure and SMS gateway providers to securely deliver OTPs to your registered mobile number."],
                ["Third-Party Logins","If you sign in via Google OAuth, that interaction is governed independently by Google’s own privacy framework."],
                
              ].map(([name, desc]) => (
                <li key={name as string} className="flex gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "#630102", opacity: 0.5 }}
                  />
                  <div>
                    <span className="font-semibold" style={{ color: "#0d0000" }}>{name} — </span>
                    {desc}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>Your rights</h2>
            <p>
              You can request deletion of your data at any time by emailing us.
              We will delete your customer profile and all associated order history,
              visit history, and loyalty data within 7 business days.
             
            </p>
            <p className="mt-3">
              If you signed in as a guest, your data is automatically deleted within
              48 hours anyway — no action needed.
            </p>
             <p>
                No False Information: Under Indian law, you must not impersonate another person or provide false, misleading, or incorrect information when registering or ordering.
              </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "#0d0000" }}>Contact</h2>
            <p>
              For privacy questions or data deletion requests, email us at{" "}
              <a
                href="mailto:hello@quickr.in"
                className="underline underline-offset-4"
                style={{ color: "#630102" }}
              >
                hello@quickr.in
              </a>
              {/* ← replace with your real email */}
            </p>
          </section>

        </div>
      </main>

      <footer
        className="px-6 py-6 text-center text-xs sm:px-10"
        style={{
          borderTop: "1px solid rgba(99,1,2,0.12)",
          color: "rgba(13,0,0,0.4)",
        }}
      >
        © {new Date().getFullYear()} QuickR ·{" "}
        <Link href="/" className="hover:underline">Home</Link>
      </footer>
    </div>
  )
}
