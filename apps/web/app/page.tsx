
// // apps/web/app/page.tsx
// // Replace the default Next.js page entirely with this file.
// // Colours: Maroon #630102  ·  Cotton #EDEBDE  ·  Dark bg #0d0000

// import Link from "next/link"
// import { WaitlistForm } from "./WaitlistForm"
// import QuickrJourney from "@/components/QuickrJourney"
// import React from 'react';
// /* ─────────────────────────────────────────────────────────────────────────── */
// /*  Page (server component — only WaitlistForm is client)                      */
// /* ─────────────────────────────────────────────────────────────────────────── */

// export default function HomePage() {
//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: "#EDEBDE",
//         color: "#0d0000",
//         fontFamily: "'Georgia', serif",
//       }}
//     >
//       {/* ── NAV ──────────────────────────────────────────────────────────── */}
//       <nav
//         className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10"
//         style={{
//           background: "rgba(237,235,222,0.92)",
//           backdropFilter: "blur(12px)",
//           borderBottom: "1px solid rgba(99,1,2,0.1)",
//         }}
//       >
//         <span className="text-xl font-bold tracking-tight inline-flex items-center gap-1.5" style={{ color: "#630102" }}>
//             <span className="flex items-center -tracking-[0.05em]">
//               Quick<span style={{color: "#0d0000" }}>R</span>
//             </span>
          
          
//           <svg 
//               // className="w-[1.1em] h-[1.1em] fill-current shrink-0" 
//               className="w-4 h-4 inline align-middle shrink-0"
//               style={{ fill: "#000000" }}
//               viewBox="0 0 16 16" 
//               xmlns="http://www.w3.org/2000/svg"
//               aria-hidden="true"
//             >
//               <path d="M2 2h2v2H2z"/>
//               <path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z"/>
//               <path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z"/>
//               <path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z"/>
//               <path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z"/>
//             </svg> 
//             <span>Dine</span>

//         </span>

//         <div className="hidden items-center gap-8 text-sm sm:flex" style={{ color: "#630102" }}>
//           <a href="#how-it-works" className="opacity-70 hover:opacity-100 transition-opacity">How it works</a>
//           <a href="#what-we-do" className="opacity-70 hover:opacity-100 transition-opacity">Features</a>
//           <a href="#waitlist" className="opacity-70 hover:opacity-100 transition-opacity">List your cafe</a>
//         </div>

//         <Link
//           href="/admin/login"
//           className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
//           style={{ background: "#630102", color: "#EDEBDE" }}
//         >
//           Admin login
//         </Link>
//       </nav>

//       {/* ── HERO ─────────────────────────────────────────────────────────── */}
//       {/*
//           Design: large low-opacity QR code watermark behind text.
//           "DINING" in giant faded letterforms behind the main headline.
//           Maroon on cotton — warm and premium.
//       */}
//       <section
//         className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
//         style={{ background: "#EDEBDE" }}
//       >
//         <style dangerouslySetInnerHTML={{__html: `
//           @keyframes scan {
//             0% { top: 22%; }
//             50% { top: 78%; }
//             100% { top: 22%; }
//           }
//           .hero-qr-svg {
//             width: 100% !important;
//             height: 100% !important;
//           }
//         `}} />

//         {/* Giant low-opacity QR watermark */}
//         <svg
//           aria-hidden
//           viewBox="0 0 100 100"
//           xmlns="http://www.w3.org/2000/svg"
//           className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
//           style={{
//             width: "min(90vw, 640px)",
//             height: "min(90vw, 640px)",
//             opacity: 0.095,
//             color: "#565656", //63010
//           }}
//         >
//           {/* QR pattern — simplified but recognisable */}
//           {/* {/* Top-left finder */}
//           <rect x="5" y="5" width="26" height="26" rx="3" fill="currentColor" />
//           <rect x="9" y="9" width="18" height="18" rx="1" fill="#EDEBDE" />
//           <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />
          
//           <rect x="69" y="5" width="26" height="26" rx="3" fill="currentColor" />
//           <rect x="73" y="9" width="18" height="18" rx="1" fill="#EDEBDE" />
//           <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />
          
//           <rect x="5" y="69" width="26" height="26" rx="3" fill="currentColor" />
//           <rect x="9" y="73" width="18" height="18" rx="1" fill="#EDEBDE" />
//           <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />
         
//           {[
//             [40,5],[45,5],[55,5],[60,5],
//             [40,10],[50,10],[60,10],
//             [37,15],[42,15],[52,15],[62,15],
//             [5,37],[10,37],[20,37],[30,37],
//             [5,42],[15,42],[25,42],
//             [5,47],[10,47],[20,47],[30,47],
//             [40,40],[45,40],[55,40],
//             [40,50],[50,50],[60,50],
//             [45,55],[55,55],
//             [40,60],[45,60],[55,60],[60,60],
//             [65,40],[70,40],[80,40],[90,40],
//             [65,50],[75,50],[85,50],[95,50],
//             [65,60],[70,60],[80,60],
//             [5,65],[10,65],[20,65],[30,65],
//             [5,70],[15,70],[25,70],
//             [37,75],[47,75],[57,75],[67,75],[77,75],[87,75],[97,75],
//             [37,80],[42,80],[52,80],[62,80],[72,80],[82,80],
//             [37,85],[47,85],[57,85],[67,85],[77,85],[87,85],
//           ].map(([x, y], i) => (
//             <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" />
//           ))}  


// {/* 
//            [38, 0], [34, 6], [44, 4], [50, 10], [60, 0], [66, 8], [30, 14],
//           , [38, 34], [46, 30], [54, 38], [62, 30], [70, 34], [78, 30], [86, 38],
//           , [38, 50], [46, 46], [54, 54], [62, 46], [70, 50], [78, 46], [86, 54],
//           , [38, 66], [46, 62], [54, 70], [62, 62], [70, 66], [78, 62], [86, 70],
//           , [38, 84], [46, 80], [54, 88], [62, 80], [70, 84], [78, 80], [86, 88]
//            */}

//         </svg>
//       {/* Moving Laser Scanline Overlay */}
//           className="pointer-events-none"
//           style={{
//         <div 
//             position: "absolute",
//             left: "50%",
//             top: "50%",
//             height: "3px",
//             transform: "translate(-50%, -50%)",
//             background: "linear-gradient(90deg, transparent, #630102 20%, #630102 80%, transparent)",
//             opacity: 0.35,
//             animation: "scan 3.2s ease-in-out infinite",
//             zIndex: 1
//           }}
//         />

//         {/* DINING watermark text
//             width: "min(78vw, 780px)",
//         <span
//           aria-hidden
//           className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-bold uppercase leading-none"
//           style={{
//             fontSize: "clamp(80px, 22vw, 260px)",
//             color: "#630102",
//             opacity: 0.04,
//             letterSpacing: "-0.04em",
//           }}
//         >
//           DINE
//         </span> */}
        
//         {/* Hero content */}
//         <div className="relative z-10 max-w-3xl">
//           <p
//             className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
//             style={{ color: "#630102", opacity: 0.7 }}
//           >
//             Qr ordering system
//           </p>

//           <h1
//             className="text-balance font-bold leading-[1.05] tracking-tight"
//             style={{
//               fontSize: "clamp(2.6rem, 8vw, 5.5rem)",
//               color: "#0d0000",
//             }}
//           >
//             Order Faster {" "}
//             <span style={{ color: "#630102" }}>Dine Smarter</span>
//           </h1>

//           <p
//             className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
//             style={{ color: "#4e1e04a3" }}
//           >

//             We believe ordering food should be as
//               enjoyable as eating it — no apps, no queues, no confusion.
            
//            <p  className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed tracking-wide sm:text-xl md:text-2xl transition-transform duration-300 ease-out hover:scale-105 cursor-default" style={{ color: "#2B0B00", fontFamily: "Playfair Display, Georgia, serif" }}>
//               A QR code on the table is <span style={{ color: "#630102", fontWeight: 700 }}>all it takes.</span>
//             </p>

           
//           </p>

//           <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
//             <a
//               href="#waitlist"
//               className="rounded-full px-7 py-3 text-sm font-semibold transition-all hover:opacity-90"
//               style={{ background: "#630102", color: "#EDEBDE" }}
//             >
//               Try for your CAFE
//             </a>
//             <a
//               href="#how-it-works"
//               className="rounded-full border px-7 py-3 text-sm font-semibold transition-all hover:bg-[#630102]/5"
//               style={{ borderColor: "rgba(99,1,2,0.3)", color: "#630102" }}
//             >
//               See how it works
//             </a>
//           </div>
//         </div>

//         {/* scroll cue */}
//         <div
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40"
//           style={{ color: "#630102" }}
//         >
//           <span className="text-xs tracking-widest uppercase">scroll</span>
//           <span className="text-lg">↓</span>
//         </div>
//       </section>

//        {/* ── HOW IT WORKS (QuickR Journey animated component) ─────────────── */}
//       {/*
//           This is the dark section with the animated phone + dashboard.
//           QuickrJourney is the recoloured component from quickr-journey-recoloured.tsx
//           placed at components/QuickrJourney.tsx
//       */}
//       {/* <QuickrJourney />  */}
 
//       <section id="how-it-works" className="w-full bg-[#0d0000] text-white py-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header Section */}
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-100">
//               Explore Our Live Dashboard
//             </h2>
//             <p className="mt-3 max-w-2xl mx-auto text-base text-gray-400">
//               See real-time analytics, order tracking, and table performance in action.
//             </p>
//           </div>

//           {/* Layout Grid: Dashboard Left, QR Code Right */}
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-2xl">
            
//             {/* Left Side: Live Dashboard Image Preview */}
//             <div className="lg:col-span-3 w-full overflow-hidden rounded-xl border border-gray-700 bg-black/40 shadow-inner">
//               <img 
//                 src="/Quickr/dashboard.png" 
//                 alt="QuickR Dine Analytics Dashboard Live Preview" 
//                 className="w-full h-auto object-cover block"
//               />
//             </div>

//             {/* Right Side: QR Code Scanner Block */}
//             <div className="lg:col-span-1 w-full flex flex-col items-center justify-center p-6 bg-[#0d0000] rounded-xl border border-gray-800 text-center">
//               <div className="bg-white p-4 rounded-xl shadow-lg max-w-[200px] sm:max-w-[220px] lg:max-w-full">
//                 <img 
//                   src="/Quickr/qr.png" 
//                   alt="Scan to try sample order" 
//                   className="w-full h-auto object-contain mx-auto"
//                 />
//               </div>
              
//               <div className="mt-5">
//                 <h3 className="text-lg font-bold text-gray-100">Try Sample Order</h3>
//                 <p className="mt-2 text-xs text-gray-400 leading-relaxed">
//                   Scan this QR code with your mobile device to simulate a customer checkout flow.
//                 </p>
//               </div>
//             </div>

//           </div>
//         </div>
//       </section>

    
// {/*       WHAT WE DO ───────────────────────────────────────────────────── */}
//       <section
//         id="what-we-do"
//         className="px-6 py-20 sm:px-10 sm:py-28"
//         style={{ background: "#EDEBDE" }}
//       >
//         <div className="mx-auto max-w-5xl">
//           <p
//             className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
//             style={{ color: "#630102", opacity: 0.7 }}
//           >
//             What we do
//           </p>
//           <h2
//             className="text-balance text-3xl font-bold leading-tight sm:text-4xl"
//             style={{ color: "#0d0000" }}
//           >
//             Everything a restaurant needs.<br />
//             Nothing it doesn't.
//           </h2>

//           <div className="mt-14 grid gap-10 sm:grid-cols-2">
//             {/* For restaurants */}
//             <div>
//               <p
//                 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
//                 style={{ color: "#630102" }}
//               >
//                 For restaurant owners
//               </p>
//               <ul className="space-y-4">
//                 {[
//                   ["Digital menu", "Update anytime — changes are live instantly."],
//                   ["Live order dashboard", "Have track of every order"],
//                   ["QR table management", "Every table with it's own identity"],
//                   ["Streak tracking", "Improves customer loyalty and revenue per customer"],
//                   ["Analytics", "All analytics as daily revenue, top items, and peak hours. All in one place "],
//                 ].map(([title, desc]) => (
//                   <li key={title as string} className="flex gap-4">
//                     <span
//                       className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
//                       style={{ background: "#630102" }}
//                     />
//                     <div>
//                       <p className="font-semibold text-sm" style={{ color: "#0d0000" }}>{title}</p>
//                       <p className="text-sm leading-relaxed mt-0.5" style={{ color: "rgba(13,0,0,0.55)" }}>{desc}</p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* For customers */}
//             <div>
//               <p
//                 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
//                 style={{ color: "#630102" }}
//               >
//                 For your customers
//               </p>
//               <ul className="space-y-4">
//                 {[
//                   ["No app required", "Just browse and order"],
//                   ["Real-time order tracking", "Customers see their order go from received to prepared to served — live."],
//                   ["Phone or guest login", "OTP on mobile, Google, or continue as guest. No passwords to remember."],
//                   ["Loyalty rewards", "Every visit counts toward a reward. They see their streak on the menu page."],
//                   ["Add items anytime", "Forgot to order something? Add more items to an existing order before it's prepared."],
//                 ].map(([title, desc]) => (
//                   <li key={title as string} className="flex gap-4">
//                     <span
//                       className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
//                       style={{ background: "#630102", opacity: 0.5 }}
//                     />
//                     <div>
//                       <p className="font-semibold text-sm" style={{ color: "#0d0000" }}>{title}</p>
//                       <p className="text-sm leading-relaxed mt-0.5" style={{ color: "rgba(13,0,0,0.55)" }}>{desc}</p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
//       <div
//         className="mx-auto max-w-5xl px-6"
//         style={{ borderTop: "1px solid rgba(99,1,2,0.15)" }}
//       />

//       {/* ── WAITLIST / REQUEST ACCESS ─────────────────────────────────────── */}
//       <section
//         id="waitlist"
//         className="px-6 py-20 sm:px-10 sm:py-28"
//         style={{ background: "#EDEBDE" }}
//       >
//         <div className="mx-auto max-w-xl">
//           <p
//             className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
//             style={{ color: "#630102", opacity: 0.7 }}
//           >
//             Get started
//           </p>
//           <h2
//             className="text-3xl font-bold leading-tight sm:text-4xl"
//             style={{ color: "#0d0000" }}
//           >
//             Get QuickR for your restaurant
//           </h2>
//           <p
//             className="mt-4 text-base leading-relaxed"
//             style={{ color: "rgba(13,0,0,0.6)" }}
//           >
//             Fill in your details and we'll reach out to get you set up. No
//             commitment required — we'll walk you through everything.
//           </p>

//           {/* WaitlistForm is a client component — defined in WaitlistForm.tsx */}
//           <WaitlistForm />
//         </div>
//       </section>

//       {/* ── ABOUT + CONTACT ──────────────────────────────────────────────── */}
//       <section
//         id="about"
//         className="px-6 py-16 sm:px-10"
//         style={{
//           background: "#0d0000",
//           color: "#EDEBDE",
//         }}
//       >
//         <div className="mx-auto max-w-5xl grid gap-12 sm:grid-cols-2">
//           {/* About */}
//           <div>
//             <p
//               className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
//               style={{ color: "#EDEBDE", opacity: 0.4 }}
//             >
//               About
//             </p>
//             <p className="text-sm leading-relaxed" style={{ color: "rgba(237,235,222,0.7)" }}>
//               QuickR is a contactless ordering platform built for Indian
//               restaurants and cafes.  QuickR gives cafes and restaurants a QR-based digital ordering system.
//               Customers scan, browse, and order — you see every order live on your
//               dashboard without any app.
            
//             </p>
//             <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(237,235,222,0.5)" }}>
//               Built by MRK_21 with ❤️ for the Indian cafes/restaurants .
//             </p>
//           </div>

//           {/* Contact */}
//           <div>
//             <p
//               className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
//               style={{ color: "#EDEBDE", opacity: 0.4 }}
//             >
//               Contact
//             </p>
//             <p className="text-sm" style={{ color: "rgba(237,235,222,0.7)" }}>
//               <span style={{ color: "rgba(237,235,222,0.4)" }}>Email </span>
//               <a
//                 href="mailto:hello@quickr.in"
//                 className="underline underline-offset-4 transition-opacity hover:opacity-80"
//                 style={{ color: "#EDEBDE" }}
//               >
//                 mrk21creates@gmail.com {/* ← replace with your email */}
//               </a>
//             </p>
//             <p className="mt-6 text-sm" style={{ color: "rgba(237,235,222,0.4)" }}>
//               Social media — coming soon
//             </p>
//             <div className="mt-8 flex gap-5 text-xs" style={{ color: "rgba(237,235,222,0.4)" }}>
//               <Link href="/privacy" className="hover:text-[#EDEBDE] transition-colors">
//                 Privacy Policy
//               </Link>
//               <span>Terms — coming soon</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── FOOTER ───────────────────────────────────────────────────────── */}
//       <footer
//         className="px-6 py-6 sm:px-10"
//         style={{
//           background: "#0d0000",
//           borderTop: "1px solid rgba(237,235,222,0.06)",
//         }}
//       >
//         <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 flex-wrap">
//           <span className="text-sm font-bold" style={{ color: "#EDEBDE", opacity: 0.6 }}>
//             Quick<span style={{ color: "#630102" }}>R</span>
//           </span>
//           <p className="text-xs" style={{ color: "rgba(237,235,222,0.3)" }}>
//             © {new Date().getFullYear()} QuickR. All rights reserved.
//           </p>
//           <div className="flex gap-5 text-xs" style={{ color: "rgba(237,235,222,0.4)" }}>
//             <Link href="/admin/login" className="hover:text-[#EDEBDE] transition-colors">Admin login</Link>
//             <Link href="/privacy" className="hover:text-[#EDEBDE] transition-colors">Privacy</Link>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }







// apps/web/app/page.tsx
// Replace the default Next.js page entirely with this file.
// Colours: Maroon #630102  ·  Cotton #EDEBDE  ·  Dark bg #0d0000

import Link from "next/link"
import { WaitlistForm } from "./WaitlistForm"
import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page (server component — only WaitlistForm is client)                      */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "#EDEBDE",
        color: "#0d0000",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10"
        style={{
          background: "rgba(237,235,222,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(99,1,2,0.1)",
        }}
      >
        <span className="text-xl font-bold tracking-tight inline-flex items-center gap-1.5" style={{ color: "#630102" }}>
          <span className="flex items-center -tracking-[0.05em]">
            Quick<span style={{color: "#0d0000" }}>R</span>
          </span>
          
          <svg 
            className="w-4 h-4 inline align-middle shrink-0"
            style={{ fill: "#000000" }}
            viewBox="0 0 16 16" 
            xmlns="http://w3.org"
            aria-hidden="true"
          >
            <path d="M2 2h2v2H2z"/>
            <path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z"/>
            <path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z"/>
            <path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z"/>
            <path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z"/>
          </svg> 
          <span>Dine</span>
        </span>

        <div className="hidden items-center gap-8 text-sm sm:flex" style={{ color: "#630102" }}>
          <a href="#how-it-works" className="opacity-70 hover:opacity-100 transition-opacity">How it works</a>
          <a href="#what-we-do" className="opacity-70 hover:opacity-100 transition-opacity">Features</a>
          <a href="#waitlist" className="opacity-70 hover:opacity-100 transition-opacity">List your cafe</a>
        </div>

        <Link
          href="/admin/login"
          className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
          style={{ background: "#630102", color: "#EDEBDE" }}
        >
          Admin login
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
        style={{ background: "#EDEBDE" }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scan {
            0% { top: 22%; }
            50% { top: 78%; }
            100% { top: 22%; }
          }
          .hero-qr-svg {
            width: 100% !important;
            height: 100% !important;
          }
        `}} />

        {/* Giant low-opacity QR watermark */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          xmlns="http://w3.org"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "min(90vw, 640px)",
            height: "min(90vw, 640px)",
            opacity: 0.095,
            color: "#565656",
          }}
        >
          <rect x="5" y="5" width="26" height="26" rx="3" fill="currentColor" />
          <rect x="9" y="9" width="18" height="18" rx="1" fill="#EDEBDE" />
          <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />
          
          <rect x="69" y="5" width="26" height="26" rx="3" fill="currentColor" />
          <rect x="73" y="9" width="18" height="18" rx="1" fill="#EDEBDE" />
          <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />
          
          <rect x="5" y="69" width="26" height="26" rx="3" fill="currentColor" />
          <rect x="9" y="73" width="18" height="18" rx="1" fill="#EDEBDE" />
          <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />
        </svg>

        {/* Moving Laser Scanline Overlay */}
        <div 
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "min(90vw, 640px)",
            height: "3px",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(90deg, transparent, #630102 20%, #630102 80%, transparent)",
            opacity: 0.35,
            animation: "scan 3.2s ease-in-out infinite",
            zIndex: 1
          }}
        />
        
        {/* Hero content */}
        <div className="relative z-10 max-w-3xl">
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "#630102", opacity: 0.7 }}
          >
            Qr ordering system
          </p>

          <h1
            className="text-balance font-bold leading-[1.05] tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 8vw, 5.5rem)",
              color: "#0d0000",
            }}
          >
            Order Faster <span style={{ color: "#630102" }}>Dine Smarter</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: "#0d0000", opacity: 0.8 }}
          >
            Enhance your restaurant's workflow, eliminate structural wait times, and provide seamless guests checkouts directly from the table.
          </p>
        </div>
      </section>

      {/* ── SAMPLE PREVIEW SECTION (REPLACED QUICKRJOURNEY) ──────────────── */}
      <section id="how-it-works" className="w-full bg-[#0d0000] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-100">
              Explore Our Live Dashboard
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-gray-400">
              See real-time analytics, order tracking, and table performance in action.
            </p>
          </div>

          {/* Layout Grid: Dashboard Left, QR Code Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-2xl">
            
            {/* Left Side: Live Dashboard Image Preview */}
            <div className="lg:col-span-3 w-full overflow-hidden rounded-xl border border-gray-700 bg-black/40 shadow-inner">
              <img 
                src="/Quickr/dashboard.png" 
                alt="QuickR Dine Analytics Dashboard Live Preview" 
                className="w-full h-auto object-cover block"
              />
            </div>

            {/* Right Side: QR Code Scanner Block */}
            <div className="lg:col-span-1 w-full flex flex-col items-center justify-center p-6 bg-[#0d0000] rounded-xl border border-gray-800 text-center">
              <div className="bg-white p-4 rounded-xl shadow-lg max-w-[200px] sm:max-w-[220px] lg:max-w-full">
                <img 
                  src="/Quickr/qr.png" 
                  alt="Scan to try sample order" 
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>
              
              <div className="mt-5">
                <h3 className="text-lg font-bold text-gray-100">Try Sample Order</h3>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                  Scan this QR code with your mobile device to simulate a customer checkout flow.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WAITLIST SECTION ────────────────────────────────────────────── */}
      <section id="waitlist" className="flex flex-col items-center justify-center pt-20 pb-24 px-4 text-center">
        <WaitlistForm />
      </section>
    </div>
  )
}









