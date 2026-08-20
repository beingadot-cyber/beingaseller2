import { Star, StarHalf } from "lucide-react";

export function RatingStars({
  rating,
  size = 14,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return (
            <Star
              key={i}
              size={size}
              className="fill-acid text-acid"
              strokeWidth={1.5}
            />
          );
        }
        if (i === full && half) {
          return (
            <span key={i} className="relative inline-flex">
              <Star size={size} className="text-fog" strokeWidth={1.5} />
              <StarHalf
                size={size}
                className="absolute inset-0 fill-acid text-acid"
                strokeWidth={1.5}
              />
            </span>
          );
        }
        return <Star key={i} size={size} className="text-fog" strokeWidth={1.5} />;
      })}
    </span>
  );
}
