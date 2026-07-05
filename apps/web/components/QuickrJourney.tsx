"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react"
import {
  QrCode,
  ScanLine,
  Check,
  CheckCheck,
  Plus,
  Minus,
  ChefHat,
  Utensils,
  CreditCard,
  Wifi,
  BatteryFull,
  Signal,
  ChevronRight,
  Coffee,
  Beef,
  ReceiptText,
  TrendingUp,
  Clock,
  BellRing,
  ArrowRight,
} from "lucide-react"

// ─── Colour tokens (maroon #630102 + cotton #d5d3c5) ────────────────────────
// bg-[#1a0000]  = very dark maroon bg for the section
// bg-[#630102]  = maroon primary accent
// text-[#EDEBDE] = cotton / warm white
// bg-[#EDEBDE]  = cotton fill
// border-[#630102]/30  = maroon with opacity
// ─────────────────────────────────────────────────────────────────────────────

const PHASES = [
  { id: 0, label: "Scan & Identify" },
  { id: 1, label: "Browse & Order" },
  { id: 2, label: "Retro Counter" },
  { id: 3, label: "Served" },
  { id: 4, label: "Paid & Settled" },
] as const

const PHASE_DURATION = 4200

type Phase = 0 | 1 | 2 | 3 | 4

/* ── Revenue counter ─────────────────────────────────────────────────────── */

function RevenueCounter({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const rounded = useTransform(mv, (v) => `₹${v.toFixed(0)}`)
  const [text, setText] = useState(`₹${value.toFixed(0)}`)

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.4, ease: "easeOut" })
    const unsub = rounded.on("change", (v) => setText(v))
    return () => { controls.stop(); unsub() }
  }, [value, mv, rounded])

  return <span className="tabular-nums">{text}</span>
}

/* ── Phone shell ─────────────────────────────────────────────────────────── */

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[240px] shrink-0 sm:w-[264px]">
      {/* maroon glow instead of emerald */}
      <div className="relative rounded-[2.6rem] border border-[#EDEBDE]/10 bg-[#1a0000] p-2.5 shadow-[0_0_0_1px_rgba(99,1,2,0.25),0_25px_60px_-15px_rgba(99,1,2,0.45)]">
        <div className="absolute -left-0.5 top-24 h-10 w-1 rounded-r bg-[#EDEBDE]/10" />
        <div className="absolute -left-0.5 top-36 h-10 w-1 rounded-r bg-[#EDEBDE]/10" />
        <div className="absolute -right-0.5 top-28 h-14 w-1 rounded-l bg-[#EDEBDE]/10" />
        <div className="relative h-[480px] overflow-hidden rounded-[2rem] bg-[#EDEBDE]">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-30 flex h-6 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-black">
            <div className="h-1.5 w-1.5 rounded-full bg-[#630102]/60" />
          </div>
          {/* status bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-3 text-[10px] font-medium text-[#630102]/70">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <BatteryFull className="h-3 w-3" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ── Mobile screens ──────────────────────────────────────────────────────── */

function MobileScreen({ phase }: { phase: Phase }) {
  return (
    <div className="absolute inset-0 pt-11">
      <AnimatePresence mode="wait">
        {phase === 0 && <ScanScreen key="scan" />}
        {phase === 1 && <MenuScreen key="menu" />}
        {phase === 2 && <TrackScreen key="track" />}
        {phase === 3 && <ServedScreen key="served" />}
        {phase === 4 && <PaidScreen key="paid" />}
      </AnimatePresence>
    </div>
  )
}

const screenMotion = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.35 },
}

function ScanScreen() {
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div {...screenMotion} className="flex h-full flex-col px-4">
      <p className="mt-1 text-center text-[11px] font-medium uppercase tracking-widest text-[#630102]/80">
        QuickR Scanner
      </p>
      <div className="relative mt-4 flex flex-1 items-center justify-center">
        <div className="relative flex h-52 w-52 items-center justify-center overflow-hidden rounded-3xl border border-[#630102]/20 bg-[#630102]/5">
          {[
            "left-2 top-2 border-l-2 border-t-2",
            "right-2 top-2 border-r-2 border-t-2",
            "left-2 bottom-2 border-l-2 border-b-2",
            "right-2 bottom-2 border-r-2 border-b-2",
          ].map((c) => (
            <span key={c} className={`absolute h-6 w-6 rounded-sm border-[#630102] ${c}`} />
          ))}
          <AnimatePresence mode="wait">
            {!connected ? (
              <motion.div key="qr" exit={{ scale: 0.6, opacity: 0 }} className="relative">
                <QrCode className="h-28 w-28 text-[#630102]" strokeWidth={1.2} />
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-[#1a0000] shadow-[0_0_12px_4px_rgba(26,0,0,0.4)]"
                  initial={{ top: "8%" }}
                  animate={{ top: ["8%", "92%", "8%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="ok"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 15 }}
                className="relative flex items-center justify-center"
              >
                <motion.span
                  className="absolute h-20 w-20 rounded-full border-2 border-[#630102]"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#630102]">
                  <Check className="h-8 w-8 text-[#EDEBDE]" strokeWidth={3} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="pb-6 text-center">
        <AnimatePresence mode="wait">
          {connected ? (
            <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm font-semibold text-[#1a0000]">Table #04 Connected!</p>
              <p className="mt-1 text-[11px] text-[#630102]/60">The Restroom Cafe</p>
            </motion.div>
          ) : (
            <motion.p key="s" exit={{ opacity: 0 }} className="text-xs text-[#630102]/70">
              Point at the QR code on your table
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const MENU = [
  { name: "Classic Retro Burger", price: 280, icon: Beef, selected: true, qty: 1 },
  { name: "Cold Brew Coffee", price: 120, icon: Coffee, selected: true, qty: 1 },
  { name: "Truffle Fries", price: 180, icon: Utensils, selected: false, qty: 0 },
  { name: "Cheese Nachos", price: 200, icon: Utensils, selected: false, qty: 0 },
]

function MenuScreen() { 
  const [tapped, setTapped] = useState(false) 
  
  useEffect(() => { 
    const t = setTimeout(() => setTapped(true), 2800) 
    return () => clearTimeout(t) 
  }, []) 

  return ( 
    <motion.div {...screenMotion} className="flex h-full flex-col"> 
      <div className="flex items-center justify-between px-4 pt-1"> 
        <div> 
          <p className="text-[10px] uppercase tracking-widest text-[#630102]/70"> Menu · Table 04 </p> 
          <p className="text-sm font-semibold text-[#1a0000]">The Restroom Cafe</p> 
        </div> 
        <span className="rounded-full bg-[#630102]/10 px-2 py-0.5 text-[10px] font-medium text-[#630102]"> Open </span> 
      </div> 

      <motion.div className="mt-3 flex-1 space-y-2 overflow-hidden px-4" animate={{ y: [0, -6, -14, -6] }} transition={{ duration: 3, ease: "easeInOut" }} > 
        {MENU.map((item, i) => { 
          const Icon = item.icon 
          return ( 
            <motion.div 
              key={item.name} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * i }} 
              className={`flex items-center gap-3 rounded-2xl border p-2.5 ${ 
                item.selected 
                  ? "border-[#630102]/30 bg-[#630102]/10" 
                  : "border-[#630102]/10 bg-[#630102]/[0.03]" 
              }`} 
            > 
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#630102] shadow-sm"> 
                <Icon className="h-5 w-5" /> 
              </div> 
              
              <div className="min-w-0 flex-1"> 
                <p className="truncate text-xs font-medium text-[#1a0000]">{item.name}</p> 
                <p className="text-[11px] text-[#630102]/70">₹{item.price}</p> 
              </div> 
              
              {item.selected ? ( 
                <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#630102]/20 px-1.5 py-1 shadow-sm"> 
                  <Minus className="h-3 w-3 text-[#630102]/60" /> 
                  <span className="text-xs font-semibold text-[#630102]">{item.qty}</span> 
                  <Plus className="h-3 w-3 text-[#630102]" /> 
                </div> 
              ) : ( 
                <Plus className="h-4 w-4 text-[#630102]/40" /> 
              )} 
            </motion.div> 
          ) 
        })} 
      </motion.div> 

      <div className="px-4 pb-6 pt-2"> 
        <motion.button 
          type="button" 
          animate={tapped ? { scale: [1, 0.94, 1] } : { scale: [1, 1.02, 1] }} 
          transition={tapped ? { duration: 0.3 } : { duration: 1.4, repeat: Infinity }} 
          className="flex w-full items-center justify-between rounded-2xl bg-[#630102] px-4 py-3 text-sm font-semibold text-[#EDEBDE] shadow-md shadow-[#630102]/20" 
        > 
          <span>{tapped ? "Order Placed!" : "Place Order · ₹400"}</span> 
          {tapped ? ( 
            <Check className="h-4 w-4" strokeWidth={3} /> 
          ) : ( 
            <ArrowRight className="h-4 w-4" /> 
          )} 
        </motion.button> 
      </div> 
    </motion.div> 
  ) 
}



function TrackScreen() { 
  return ( 
    <motion.div {...screenMotion} className="flex h-full flex-col px-4"> 
      {/* MODIFIED: Updated status text color from light opacity to dark maroon text-[#630102]/70 */}
      <p className="mt-1 text-center text-[10px] uppercase tracking-widest text-[#630102]/70"> 
        Order #1042 · Live 
      </p> 
      
      <div className="mt-6 flex flex-1 flex-col items-center justify-center"> 
        <div className="relative flex h-28 w-28 items-center justify-center"> 
          {/* MODIFIED: Adjusted background pulsing ring tracker from white outline to a soft maroon color layer */}
          <motion.span className="absolute inset-0 rounded-full border-2 border-[#630102]/20" animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }} /> 
          
          {/* MODIFIED: Converted the chef hat circle container background to white with maroon text so it remains visible */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#630102] shadow-sm"> 
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} > 
              <ChefHat className="h-9 w-9" /> 
            </motion.div> 
          </div> 
        </div> 
        
        {/* MODIFIED: Flipped order state main heading from light beige text-[#EDEBDE] to off-black text-[#1a0000] */}
        <p className="mt-5 text-sm font-semibold text-[#1a0000]">Chef is preparing your meal</p> 
        {/* MODIFIED: Changed countdown duration subtitle from translucent light text to a distinct maroon text-[#630102]/70 */}
        <p className="mt-1 text-[11px] text-[#630102]/70">Estimated 12 min</p> 
      </div> 

      <div className="mb-6 space-y-3"> 
        {[ 
          { l: "Order Received", done: true }, 
          { l: "Preparing", done: true, active: true }, 
          { l: "Served", done: false }, 
        ].map((s) => ( 
          <div key={s.l} className="flex items-center gap-3"> 
            {/* MODIFIED: Refined tracker step indicator badges. Checked circles remain maroon with beige symbols. Pending circles utilize a clear maroon opacity combination bg-[#630102]/10 */}
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${ 
              s.done ? "bg-[#630102] text-[#EDEBDE]" : "bg-[#630102]/10 text-[#630102]/40" 
            }`} > 
              {s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : <Clock className="h-3 w-3" />} 
            </span> 
            
            {/* MODIFIED: Mapped layout step text variables using deep maroon and off-black layers to separate completed steps from upcoming milestones */}
            <span className={`text-xs ${ 
              s.active ? "font-bold text-[#630102]" : s.done ? "text-[#1a0000]/70" : "text-[#630102]/40" 
            }`}> 
              {s.l} 
            </span> 
          </div> 
        ))} 
      </div> 
    </motion.div> 
  ) 
}

function ServedScreen() { 
  return ( 
    <motion.div {...screenMotion} className="flex h-full flex-col items-center justify-center px-6 text-center" > 
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="relative flex items-center justify-center" > 
        {/* MODIFIED: Adjusted background animated ripple from white opacity to deep maroon outline border-[#630102]/20 */}
        <motion.span className="absolute h-24 w-24 rounded-full border-2 border-[#630102]/20" initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 1.1, repeat: Infinity }} /> 
        
        {/* MODIFIED: Main circle stays solid bg-[#630102] but checkmark symbols pull clean light background values for pop */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#630102]"> 
          <CheckCheck className="h-10 w-10 text-[#EDEBDE]" strokeWidth={2.5} /> 
        </div> 
      </motion.div> 
      
      {/* MODIFIED: Changed main celebration text headline from light text-[#EDEBDE] to readable off-black text-[#1a0000] */}
      <p className="mt-6 text-base font-semibold text-[#1a0000]">Your order has been served!</p> 
      {/* MODIFIED: Shifted the sub-label text class configuration from light opacity to dark maroon text-[#630102]/70 */}
      <p className="mt-1 text-xs text-[#630102]/70">Enjoy your meal at Table #04</p> 
      
      {/* MODIFIED: Reconfigured the bottom status banner block styling to look balanced and readable over a light background layout canvas */}
      <div className="mt-6 flex items-center gap-2 rounded-full bg-[#630102]/10 px-4 py-2 text-[#630102]"> 
        <Utensils className="h-4 w-4" /> 
        <span className="text-xs font-medium">Bon Appétit</span> 
      </div> 
    </motion.div> 
  ) 
}

function PaidScreen() { 
  return ( 
    <motion.div {...screenMotion} className="flex h-full flex-col px-4"> 
      {/* MODIFIED: Changed top receipt tracker label color from light opacity to dark maroon text-[#630102]/70 */}
      <p className="mt-1 text-center text-[10px] uppercase tracking-widest text-[#630102]/70"> Digital Receipt </p> 
      
      <div className="mt-4 flex-1"> 
        {/* MODIFIED: Re-styled the receipt container box to look like standard clean white receipt paper over your light beige screen canvas */}
        <div className="rounded-2xl border border-[#630102]/10 bg-white p-4 shadow-sm"> 
          
          {/* MODIFIED: Inverted dashed separator line and title text colors for clean visibility */}
          <div className="flex items-center justify-between border-b border-dashed border-[#630102]/20 pb-3"> 
            <span className="text-xs font-semibold text-[#1a0000]">The Restroom Cafe</span> 
            <ReceiptText className="h-4 w-4 text-[#630102]/40" /> 
          </div> 
          
          <div className="space-y-2 py-3 text-[11px]"> 
            {/* MODIFIED: Changed food order item description text strings from white layer to clear dark charcoal text-[#1a0000]/80 */}
            <div className="flex justify-between text-[#1a0000]/80"> 
              <span>Classic Retro Burger ×1</span><span>₹280</span> 
            </div> 
            <div className="flex justify-between text-[#1a0000]/80"> 
              <span>Cold Brew Coffee ×1</span><span>₹120</span> 
            </div> 
            {/* MODIFIED: Set service charge text color to a muted dark maroon tone text-[#630102]/50 */}
            <div className="flex justify-between text-[#630102]/50"> 
              <span>Service charge</span><span>₹40</span> 
            </div> 
          </div> 
          
          {/* MODIFIED: Updated bottom financial total sum string values to a solid bold dark structure layout */}
          <div className="flex justify-between border-t border-dashed border-[#630102]/20 pt-3 text-sm font-semibold text-[#1a0000]"> 
            <span>Total</span> 
            <span className="text-[#630102]">₹440</span> 
          </div> 
        </div> 
      </div> 

      {/* MODIFIED: Kept the primary dynamic footer block backdrop as your robust signature bg-[#630102], but ensured text nodes inside print vividly using text-[#EDEBDE] */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 flex items-center gap-3 rounded-2xl bg-[#630102] px-4 py-3 shadow-md shadow-[#630102]/20" > 
        {/* MODIFIED: Adjusted internal payment success circle opacity backdrop to mix with the bright beige element variable */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDEBDE]/15"> 
          <CreditCard className="h-5 w-5 text-[#EDEBDE]" /> 
        </div> 
        <div> 
          <p className="text-sm font-semibold text-[#EDEBDE]">Paid successfully</p> 
          <p className="text-[11px] text-[#EDEBDE]/70">via UPI / Card</p> 
        </div> 
      </motion.div> 
    </motion.div> 
  ) 
}



/* ── Desktop dashboard ───────────────────────────────────────────────────── */


function StatusBadge({ phase }: { phase: Phase }) { 
  if (phase >= 3) { 
    return ( 
      <span className="flex items-center gap-1.5 rounded-full bg-[#630102]/10 px-2.5 py-1 text-[11px] font-semibold text-[#630102]"> 
        <span className="h-1.5 w-1.5 rounded-full bg-[#630102]" /> 
        Served 
      </span> 
    ) 
  } 
  return ( 
    <motion.span
      animate={{ opacity: [1, 0.55, 1] }} 
      transition={{ duration: 1.2, repeat: Infinity }} 
      className="flex items-center gap-1.5 rounded-full bg-[#630102]/5 px-2.5 py-1 text-[11px] font-semibold text-[#630102]/70" 
    > 
      {/* MODIFIED: Adjusted the animated processing dot to print with a subtle maroon tint */}
      <span className="h-1.5 w-1.5 rounded-full bg-[#630102]/40" /> 
      Preparing 
    </motion.span> 
  ) 
}


function DesktopDashboard({ phase }: { phase: Phase }) {
  const inLiveFeed = phase >= 2 && phase < 4
  const completed = phase >= 4
  const revenue = completed ? 9990 : 10390

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm backdrop-blur-sm sm:rounded-3xl sm:p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#630102] text-[#EDEBDE]">
            <Utensils className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a0000]">Owner Analytics</p>
            <p className="text-[11px] text-[#630102]/60">The Restroom Cafe</p>
          </div>
        </div>
        <div className="self-start flex items-center gap-1.5 rounded-full bg-[#630102]/5 px-2.5 py-1 text-[11px] font-medium text-[#630102] sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-[#630102]" /> Live 
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#630102]/20 bg-[#630102]/5 p-3">
          <div className="flex items-center gap-1 text-[10px] text-[#630102]/80">
            <TrendingUp className="h-3 w-3" /> Revenue 
          </div>
          <p className="mt-1 text-lg font-bold text-[#1a0000]">
            <RevenueCounter value={revenue} />
          </p>
        </div>
        <div className="rounded-2xl border border-[#630102]/10 bg-[#630102]/[0.02] p-3">
          <p className="text-[10px] text-[#630102]/60">Orders</p>
          <p className="mt-1 text-lg font-bold text-[#1a0000] tabular-nums">{completed ? 43 : 42}</p>
        </div>
        <div className="rounded-2xl border border-[#630102]/10 bg-[#630102]/[0.02] p-3">
          <p className="text-[10px] text-[#630102]/60">Tables</p>
          <p className="mt-1 text-lg font-bold text-[#1a0000] tabular-nums">18/24</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1a0000]">
              <BellRing className="h-3.5 w-3.5 text-[#630102]/60" /> Retro Counter · Live Feed 
            </p>
            <span className="text-[10px] text-[#630102]/60">
              {inLiveFeed ? "1 active" : "0 active"}
            </span>
          </div>
          <div className="mt-2 flex-1 min-h-[76px] flex flex-col justify-center rounded-2xl border border-dashed border-[#630102]/20 p-2">
            <AnimatePresence mode="wait">
              {inLiveFeed ? (
                <motion.div key="order" initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.9 }} className="flex items-center gap-3 rounded-xl border border-[#630102]/10 bg-[#630102]/[0.02] p-2.5 shadow-sm" >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#630102]/10 text-[#630102]">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a0000] truncate">Table #04 · 2 Items</p>
                    <p className="text-[11px] text-[#630102]/70 truncate">Burger, Cold Brew · ₹400</p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge phase={phase} />
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-[60px] items-center justify-center text-[11px] text-[#630102]/40">
                  {completed ? "Queue cleared" : "Waiting for orders…"}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#1a0000]/70">Completed History</p>
          <div className="mt-2 space-y-2">
            <AnimatePresence>
              {completed && (
                <motion.div key="done" initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex items-center gap-3 rounded-xl border border-[#630102]/20 bg-[#630102]/5 p-2.5" >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#630102] text-[#EDEBDE]">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a0000] truncate">Table #04 · Settled</p>
                    <p className="text-[11px] text-[#630102]/60 truncate">Paid via UPI</p>
                  </div>
                  <span className="text-xs font-bold text-[#630102] shrink-0">+₹440</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-3 rounded-xl border border-[#630102]/10 bg-[#630102]/[0.01] p-2.5 opacity-80">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#630102]/10 text-[#630102]/50">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#1a0000]/80 truncate">Table #11 · Settled</p>
                <p className="text-[11px] text-[#630102]/50 truncate">Paid via Card</p>
              </div>
              <span className="text-xs font-medium text-[#1a0000]/70 shrink-0">+₹680</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ── Main export ─────────────────────────────────────────────────────────── */

export default function QuickrJourney() {
  const [phase, setPhase] = useState<Phase>(0)
  const [playing, setPlaying] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = useCallback(() => {
    setPhase((p) => ((p + 1) % 5) as Phase)
  }, [])

  useEffect(() => {
    if (!playing) return
    timer.current = setTimeout(advance, PHASE_DURATION)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [phase, playing, advance])

  const goTo = (p: Phase) => {
    if (timer.current) clearTimeout(timer.current)
    setPhase(p)
  }

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-20 sm:py-28"
      style={{ background: "#c35151" }}
    >
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(219, 217, 202, 0.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(237,235,222,0.06) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%,black 40%,transparent 100%)",
        }}
      />
      {/* maroon glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "rgba(255, 251, 251, 0.2)" }}
      />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              border: "1px solid rgba(222, 220, 204, 0.34)",
              background: "rgba(247, 242, 242, 0.2)",
              color: "#370b0b",
            }}
          >
            <ScanLine className="h-3.5 w-3.5" />
            The QuickR Flow
          </span>
          <h2
            className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "#dec0c0" }}
          >
            From QR scan to settled bill, in one seamless loop
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed sm:text-base" style={{ color: "rgba(237,235,222,0.5)" }}>
            Watch a live order flow through QuickR — guests scan, browse, and pay
            while your Retro Counter and analytics update in real time.
          </p>
        </div>

        {/* stepper */}
        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PHASES.map((p, i) => {
              const active = phase === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goTo(p.id as Phase)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    border: active ? "1px solid rgba(255, 255, 255, 0.5)" : "1px solid rgba(237,235,222,0.1)",
                    background: active ? "rgba(112, 0, 0, 0.25)" : "rgba(237,235,222,0.03)",
                    color: active ? "#EDEBDE" : "rgba(237,235,222,0.5)",
                  }}
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      background: active ? "#630102" : "rgba(237,235,222,0.1)",
                      color: active ? "#EDEBDE" : "rgba(237,235,222,0.6)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{p.label}</span>
                  {i < PHASES.length - 1 && (
                    <ChevronRight className="hidden h-3 w-3 opacity-30 md:inline" style={{ color: "#EDEBDE" }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* progress bar */}
          <div className="h-1 w-full max-w-md overflow-hidden rounded-full" style={{ background: "rgba(237,235,222,0.1)" }}>
            <motion.div
              key={`${phase}-${playing}`}
              className="h-full rounded-full"
              style={{ background: "#630102" }}
              initial={{ width: "0%" }}
              animate={{ width: playing ? "100%" : "0%" }}
              transition={{ duration: playing ? PHASE_DURATION / 1000 : 0, ease: "linear" }}
            />
          </div>
        </div>

        {/* dashboard */}
        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[auto_1fr]">
          <PhoneShell>
            <MobileScreen phase={phase} />
          </PhoneShell>
          <div className="flex flex-col gap-5">
            <DesktopDashboard phase={phase} />
          </div>
        </div>
      </div>
    </section>
  )
}
