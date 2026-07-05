"use client";

export function LoyaltyBanner({ visitCount = 0, target = 5, primaryColor, hasReward }: any) {
  const filled = Number(visitCount || 0);
  const total = Number(target || 0) || 0;
  const emptyColor = "#ffffff";
  const filledColor = "#56ff02"; // on top of banner background use white for contrast

  const Cup = ({ isFilled }: { isFilled: boolean }) => (
    <svg className={`w-6 h-6 ${isFilled ? "" : "filter grayscale opacity-40"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="7" r="4" fill={isFilled ? filledColor : emptyColor} />
      <path d="M7 12c0 2 1.5 5 5 5s5-3 5-5v-1H7v1z" fill={isFilled ? filledColor : emptyColor} />
    </svg>
  );

  return (
    <div className="m-4 rounded-lg p-3 text-sm font-medium text-white" style={{ backgroundColor: primaryColor }}>
      <div className="flex items-center justify-between">
        <div>Streak: {filled} / {total} visits</div>
        {hasReward ? (
          <div className="ml-3 text-xs opacity-90">Reward ready — show this to staff</div>
        ) : (
          <div className="ml-3 text-xs opacity-80">Every visit moves you closer to your reward</div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className="inline-flex">
            <Cup isFilled={i < filled} />
          </span>
        ))}
      </div>
    </div>
  );
}
