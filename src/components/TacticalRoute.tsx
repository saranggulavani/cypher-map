import { useMemo } from "react";

/**
 * TACTICAL ROUTE: COMPACT ZIG-ZAG
 * Trends from Top-Left to Bottom-Right.
 * Optimized row height and label padding to prevent cropping.
 */
export default function TacticalRoute({ waypoints }: { waypoints: string[] }) {
  if (!waypoints || waypoints.length < 2) return null;

  // 1. DYNAMIC GRID CONSTANTS
  const width = 400;
  const rowHeight = 75; // Reduced from 100px for better vertical density
  const totalHeight = (waypoints.length - 1) * rowHeight + 120;

  // Increased horizontal padding to ensure labels like "AGARDANDA JETTY" don't hit edges
  const paddingX = 90;
  const startY = 60;

  // 2. STABILIZED COORDINATES (Snake Pattern)
  const points = useMemo(() => {
    return waypoints.map((_, i) => {
      const progress = i / (waypoints.length - 1);

      // We trend from left to right, but zig-zag along the way
      const isEven = i % 2 === 0;
      const zigZagOffset = isEven ? -30 : 30;

      // Calculate a base X that moves L -> R, then apply the zig-zag
      const baseX = paddingX + progress * (width - paddingX * 2);

      return {
        x: baseX + zigZagOffset,
        y: startY + i * rowHeight,
      };
    });
  }, [waypoints, totalHeight]);

  // 3. THE SMOOTH SNAKE PATH
  const pathD = useMemo(() => {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midY = p0.y + (p1.y - p0.y) / 2;
      // Bezier curve creates the organic 'snake' flow
      d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  return (
    <div className="relative w-full py-2">
      {/* HUD Header */}
      <div className="flex justify-between items-center mb-8 text-[8px] font-black uppercase tracking-[0.3em] text-white/30">
        <span>Trip Timeline</span>
        <span className="text-primary">{waypoints.length} Stops Logged</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${totalHeight}`}
        className="w-full h-auto overflow-visible"
      >
        {/* The Connection Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#ffc20e"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity={0.3}
        />

        {points.map((p, i) => {
          // Label Logic:
          // If point is pushed Right, put label on the Left (and vice-versa)
          const isZiggedRight = i % 2 !== 0;
          const labelX = isZiggedRight ? p.x - 110 : p.x + 18;
          const textAlign = isZiggedRight ? "text-right" : "text-left";

          return (
            <g key={i}>
              {/* Background Mask */}
              <circle cx={p.x} cy={p.y} r="14" fill="#0D0D0D" />

              {/* Tactical Pin Node */}
              <g transform={`translate(${p.x - 6}, ${p.y - 14}) scale(0.5)`}>
                <path
                  d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z"
                  fill="#ffc20e"
                />
                <circle cx="12" cy="12" r="5" fill="#0D0D0D" />
              </g>

              {/* Waypoint Label Box */}
              <foreignObject x={labelX} y={p.y - 12} width="95" height="30">
                <div
                  className={`flex h-full items-center ${isZiggedRight ? "justify-end pr-2" : "justify-start pl-2"}`}
                >
                  <p
                    className={`text-[8px] font-black uppercase tracking-[0.2em] leading-tight ${textAlign} ${
                      i === 0 || i === waypoints.length - 1
                        ? "text-white"
                        : "text-white/20"
                    }`}
                  >
                    {waypoints[i]}
                  </p>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
