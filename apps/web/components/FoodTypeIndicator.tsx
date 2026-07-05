// A colored square dot — the Indian restaurant standard indicator
// Veg = green dot in green square
// Non-veg = brown/red dot in brown square
// Egg = yellow dot in yellow square

interface FoodTypeIndicatorProps {
  type: "veg" | "non_veg" | "egg";
  size?: "sm" | "md";
}

const config = {
  veg: {
    border: "border-green-600",
    dot: "bg-green-600",
    label: "Veg",
  },
  non_veg: {
    border: "border-red-700",
    dot: "bg-red-700",
    label: "Non-veg",
  },
  egg: {
    border: "border-yellow-500",
    dot: "bg-yellow-500",
    label: "Egg",
  },
};

export function FoodTypeIndicator({
  type,
  size = "md",
}: FoodTypeIndicatorProps) {
  const { border, dot } = config[type];
  
  const boxSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center justify-center border-2 rounded-sm shrink-0 ${border} ${boxSize}`}
      title={config[type].label}
    >
      <span className={`rounded-full ${dot} ${dotSize}`} />
    </span>
  );
}
