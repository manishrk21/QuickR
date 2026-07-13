"use client";

import React from "react";

interface LoyaltyBannerProps {
  visitCount?: number;
  target?: number;
  primaryColor?: string;
  hasReward?: boolean;
}

export default function LoyaltyBanner({ 
  visitCount = 0, 
  target = 5, 
  primaryColor = "#630102", 
  hasReward = false 
}: LoyaltyBannerProps) {
  const filled = Number(visitCount || 0);
  const total = Number(target || 0) || 5;

  // Real vector Ice Cream graphics with dynamic fillings and modern shading
  const IceCreamIcon = ({ isFilled, isLast }: { isFilled: boolean; isLast: boolean }) => (
    <div className="relative flex flex-col items-center group">
      <svg 
        className={`w-10 h-12 transition-all duration-500 transform ${
          isFilled ? "scale-100 filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.15)]" : "scale-95 opacity-35"
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
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {isFilled && (
          /* Texture lines on the filled cone */
          <path d="M9 14L13.5 24.5 M12 14L15 21 M15 14L12 21 M7.5 17.5L10.5 14" stroke="#C68B45" strokeWidth="1" />
        )}

        {/* Ice Cream Creamy Scoops */}
        <path 
          d="M5 14C4 14 3 13 3 11.5C3 10 4.5 9 6 9C5.5 8 6 6.5 7.5 5.5C9 4.5 11 4 12 4C13 4 15 4.5 16.5 5.5C18 6.5 18.5 8 18 9C19.5 9 21 10 21 11.5C21 13 20 14 19 14H5Z" 
          fill={isFilled ? (isLast ? "#FF8B94" : "#FFD3B6") : "none"} 
          stroke={isFilled ? (isLast ? "#E05A65" : "#E2A781") : "#FFFFFF"} 
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Cherry on Top for the absolute ultimate prize */}
        {isLast && isFilled && (
          <circle cx="12" cy="2" r="1.5" fill="#D62828" />
        )}
      </svg>
      
      {/* Visual Indicator Line underneath each completed treat */}
      <div 
        className={`h-1 w-4 rounded-full mt-2 transition-all duration-500 ${
          isFilled ? "bg-white opacity-100" : "bg-white/0"
        }`} 
      />
    </div>
  );

  return (
    <div 
      className="m-4 rounded-2xl p-6 text-white relative overflow-hidden border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.08)] bg-gradient-to-br"
      style={{ 
        backgroundColor: primaryColor,
        backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, rgba(0,0,0,0.15) 100%)`
      }}
    >
      {/* Premium ambient luxury overlay grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px)] bg-[size:40px] opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        
        {/* Beautiful Interactive Array Layer */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md w-full max-w-sm">
          {Array.from({ length: total }).map((_, i) => (
            <IceCreamIcon 
              key={i} 
              isFilled={i < filled} 
              isLast={i === total - 1}
            />
          ))}
        </div>

        {/* Clean, direct status narrative display */}
        <div className="space-y-1">
          {hasReward || filled >= total ? (
            <p className="text-base font-serif tracking-wide text-white animate-pulse">
              Receive your treat on this visit!
            </p>
          ) : (
            <p className="text-sm font-light tracking-widest uppercase text-white/90">
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
