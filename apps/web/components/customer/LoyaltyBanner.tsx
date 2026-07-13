"use client";

import React from "react";

interface LoyaltyBannerProps {
  visitCount?: number;
  target?: number;
  primaryColor?: string;
  hasReward?: boolean;
}

export function LoyaltyBanner({ 
  visitCount = 0, 
  target = 5, 
  primaryColor = "#630102", 
  hasReward = false 
}: LoyaltyBannerProps) {
  const filled = Number(visitCount || 0);
  const total = Number(target || 0) || 5;

  // Highly compact vector Ice Cream graphics scaled down to fit one line on mobile
  const IceCreamIcon = ({ isFilled, isLast }: { isFilled: boolean; isLast: boolean }) => (
    <div className="relative flex flex-col items-center">
      <svg 
        className={`w-7 h-8 transition-all duration-500 transform ${
          isFilled ? "scale-100 filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)]" : "scale-95 opacity-30"
        }`} 
        viewBox="0 0 24 30" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        aria-hidden
      >
        {/* Waffle Cone Base */}
        <path 
          d="M6 14L12 28L18 14H6Z" 
          fill={isFilled ? "#E5A96A" : "none"} 
          stroke={isFilled ? "#C68B45" : "#FFFFFF"} 
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {isFilled && (
          <path d="M10 14L13.5 22 M14 14L12 19" stroke="#C68B45" strokeWidth="1" />
        )}

        {/* Ice Cream Creamy Scoops */}
        <path 
          d="M5 14C4 14 3 13 3 11.5C3 10 4.5 9 6 9C5.5 8 6 6.5 7.5 5.5C9 4.5 11 4 12 4C13 4 15 4.5 16.5 5.5C18 6.5 18.5 8 18 9C19.5 9 21 10 21 11.5C21 13 20 14 19 14H5Z" 
          fill={isFilled ? (isLast ? "#FF8B94" : "#FFD3B6") : "none"} 
          stroke={isFilled ? (isLast ? "#E05A65" : "#E2A781") : "#FFFFFF"} 
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Cherry Component */}
        {isLast && isFilled && (
          <circle cx="12" cy="2" r="1.5" fill="#D62828" />
        )}
      </svg>
      
      {/* Micro indicator node */}
      <div 
        className={`h-0.5 w-2 rounded-full mt-1 transition-all duration-500 ${
          isFilled ? "bg-white opacity-80" : "bg-white/0"
        }`} 
      />
    </div>
  );

  return (
    <div 
      className="m-3 rounded-xl p-3 text-white relative overflow-hidden border border-white/10 shadow-sm bg-gradient-to-br"
      style={{ 
        backgroundColor: primaryColor,
        backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, rgba(0,0,0,0.12) 100%)`
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px)] bg-[size:30px] opacity-25 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-2.5">
        
        {/* Compressed Row Container - Prevents breaking onto line two */}
        <div className="flex items-center justify-center gap-2.5 py-1 px-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm w-full max-w-[280px]">
          {Array.from({ length: total }).map((_, i) => (
            <IceCreamIcon 
              key={i} 
              isFilled={i < filled} 
              isLast={i === total - 1}
            />
          ))}
        </div>

        {/* Ultra-tight typography layout with minimal margins */}
        <div>
          {hasReward || filled >= total ? (
            <p className="text-xs font-serif tracking-wide text-white font-medium animate-pulse">
              Receive your treat on this visit!
            </p>
          ) : (
            <p className="text-[10px] font-light tracking-widest uppercase text-white/80">
              Receive a retreat on visit {total}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

// "use client";

// export function LoyaltyBanner({ visitCount = 0, target = 5, primaryColor, hasReward }: any) {
//   const filled = Number(visitCount || 0);
//   const total = Number(target || 0) || 0;
//   const emptyColor = "#ffffff";
//   const filledColor = "#56ff02"; // on top of banner background use white for contrast

//   const Cup = ({ isFilled }: { isFilled: boolean }) => (
//     <svg className={`w-6 h-6 ${isFilled ? "" : "filter grayscale opacity-40"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
//       <circle cx="12" cy="7" r="4" fill={isFilled ? filledColor : emptyColor} />
//       <path d="M7 12c0 2 1.5 5 5 5s5-3 5-5v-1H7v1z" fill={isFilled ? filledColor : emptyColor} />
//     </svg>
//   );

//   return (
//     <div className="m-4 rounded-lg p-3 text-sm font-medium text-white" style={{ backgroundColor: primaryColor }}>
//       <div className="flex items-center justify-between">
//         <div>Streak: {filled} / {total} visits</div>
//         {hasReward ? (
//           <div className="ml-3 text-xs opacity-90">Reward ready — show this to staff</div>
//         ) : (
//           <div className="ml-3 text-xs opacity-80">Every visit moves you closer to your reward</div>
//         )}
//       </div>

//       <div className="mt-3 flex flex-wrap gap-2">
//         {Array.from({ length: total }).map((_, i) => (
//           <span key={i} className="inline-flex">
//             <Cup isFilled={i < filled} />
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }
