import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface TeamMapData {
  id: string;
  awards: number;
  centroid: [number, number];
  track: string;
  myTeam: boolean;
}

interface HeroGalaxyMapProps {
  width?: number;
  height?: number;
  className?: string;
}

export function HeroGalaxyMap({ width = 800, height = 600, className = "" }: HeroGalaxyMapProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const { data: teamMapData = [] } = useQuery<TeamMapData[]>({
    queryKey: ["/api/v1/planets/map/teams"],
  });

  // Polylabel implementation - finds the pole of inaccessibility (visual center)
  const polylabel = (polygon: [number, number][], precision: number = 1.0): [number, number] => {
    // Get bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of polygon) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Initial grid cell size
    let cellSize = Math.min(width, height) / 4;
    
    // Cover polygon with initial cells
    let bestCell = { x: minX + width / 2, y: minY + height / 2, d: 0 };
    
    // Check centroid as initial candidate
    const centroid = getCentroid(polygon);
    if (pointInPolygon(centroid, polygon)) {
      const centroidDistance = pointToPolygonDist(centroid, polygon);
      if (centroidDistance > bestCell.d) {
        bestCell = { x: centroid[0], y: centroid[1], d: centroidDistance };
      }
    }
    
    // Grid search
    for (let y = minY; y < maxY; y += cellSize) {
      for (let x = minX; x < maxX; x += cellSize) {
        const point: [number, number] = [x + cellSize / 2, y + cellSize / 2];
        if (pointInPolygon(point, polygon)) {
          const distance = pointToPolygonDist(point, polygon);
          if (distance > bestCell.d) {
            bestCell = { x: point[0], y: point[1], d: distance };
          }
        }
      }
    }
    
    return [bestCell.x, bestCell.y];
  };
  
  // Helper functions for polylabel
  const getCentroid = (polygon: [number, number][]): [number, number] => {
    let area = 0;
    let x = 0;
    let y = 0;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const v = polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
      area += v;
      x += (polygon[i][0] + polygon[j][0]) * v;
      y += (polygon[i][1] + polygon[j][1]) * v;
    }
    
    if (area === 0) return [0, 0];
    return [x / (3 * area), y / (3 * area)];
  };
  
  const pointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) &&
          (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
        inside = !inside;
      }
    }
    return inside;
  };
  
  const pointToPolygonDist = (point: [number, number], polygon: [number, number][]): number => {
    let minDist = Infinity;
    for (let i = 0, len = polygon.length, j = len - 1; i < len; j = i++) {
      const dist = pointToSegmentDist(point, polygon[j], polygon[i]);
      minDist = Math.min(minDist, dist);
    }
    return minDist;
  };
  
  const pointToSegmentDist = (point: [number, number], a: [number, number], b: [number, number]): number => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    
    if (dx !== 0 || dy !== 0) {
      const t = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy);
      
      if (t > 1) {
        return Math.sqrt((point[0] - b[0]) ** 2 + (point[1] - b[1]) ** 2);
      } else if (t > 0) {
        return Math.sqrt((point[0] - (a[0] + dx * t)) ** 2 + (point[1] - (a[1] + dy * t)) ** 2);
      }
    }
    
    return Math.sqrt((point[0] - a[0]) ** 2 + (point[1] - a[1]) ** 2);
  };

  // Calculate polygon area for smart sizing
  const calculatePolygonArea = (points: [number, number][]): number => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    return Math.abs(area) / 2;
  };

  // Helper function to determine text color based on background contrast
  const getContrastColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, deep navy for light backgrounds
    return luminance > 0.5 ? "#0B1B33" : "#FFFFFF";
  };

  // Generate enhanced territories with smart label positioning
  const generateTeamTerritories = () => {
    return teamMapData.map((team, index) => {
      const baseSize = 50 + (team.awards * 2); // Size based on awards
      const isMyTeam = team.myTeam;
      
      // Use specified colors from palette
      const colors = {
        "AI/ML": "#2F6BFF",      // Neural Networks - bright blue
        "Web3": "#1EC6A8",       // Quantum Leap - bright teal  
        "Mobile": "#2F6BFF",     // Primary blue
        "IoT": "#1EC6A8",        // Teal
        "FinTech": "#2F6BFF"     // Primary blue
      };
      
      const fillColor = colors[team.track as keyof typeof colors] || "#2F6BFF";
      
      // Generate organic, country-like shape using SVG path
      const generateOrganicPath = (cx: number, cy: number, size: number) => {
        const points = [];
        const numPoints = 8 + Math.floor(Math.random() * 4); // 8-12 points for organic shape
        
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * 2 * Math.PI;
          const radiusVariation = 0.7 + Math.random() * 0.6; // Random variation
          const radius = size * radiusVariation;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          points.push([x, y] as [number, number]);
        }
        
        // Calculate optimal label position using polylabel and area
        const area = calculatePolygonArea(points);
        const optimalPosition = polylabel(points, 1.0);
        const labelSize = Math.min(Math.max(Math.sqrt(area) / 8, 12), 18);
        
        // Create smooth curved path
        let path = `M ${points[0][0]},${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
          const current = points[i];
          const next = points[(i + 1) % points.length];
          const controlX = current[0] + (next[0] - current[0]) * 0.3;
          const controlY = current[1] + (next[1] - current[1]) * 0.3;
          path += ` Q ${controlX},${controlY} ${next[0]},${next[1]}`;
        }
        path += " Z";
        
        return {
          path,
          labelPosition: optimalPosition,
          labelSize,
          area
        };
      };
      
      const pathData = generateOrganicPath(team.centroid[0], team.centroid[1], baseSize);
      
      // Team name mapping with abbreviated versions for small cells
      const teamNames = {
        "AI/ML": { full: "Neural Networks", short: "Neural" },
        "Web3": { full: "Quantum Leap", short: "Quantum" },
        "Mobile": { full: "Mobile Makers", short: "Mobile" },
        "IoT": { full: "IoT Innovators", short: "IoT" },
        "FinTech": { full: "FinTech Pioneers", short: "FinTech" }
      };
      
      const teamName = teamNames[team.track as keyof typeof teamNames] || { full: team.track, short: team.track };
      const displayName = pathData.area < 5000 ? teamName.short : teamName.full;
      
      return {
        id: team.id,
        path: pathData.path,
        color: fillColor,
        textColor: getContrastColor(fillColor),
        team: team,
        isMyTeam: isMyTeam,
        labelPosition: pathData.labelPosition,
        labelSize: pathData.labelSize,
        displayName: displayName,
        fullName: teamName.full,
        area: pathData.area
      };
    });
  };

  // Generate territories and apply collision detection
  const rawTerritories = generateTeamTerritories();
  
  // Simple collision detection - adjust overlapping labels
  const territories = useMemo(() => {
    const adjustedTerritories = [...rawTerritories];
    const minDistance = 40; // Minimum distance between labels
    
    for (let i = 0; i < adjustedTerritories.length; i++) {
      for (let j = i + 1; j < adjustedTerritories.length; j++) {
        const territory1 = adjustedTerritories[i];
        const territory2 = adjustedTerritories[j];
        
        const dx = territory1.labelPosition[0] - territory2.labelPosition[0];
        const dy = territory1.labelPosition[1] - territory2.labelPosition[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          // Move labels apart
          const angle = Math.atan2(dy, dx);
          const pushDistance = (minDistance - distance) / 2;
          
          territory1.labelPosition = [
            territory1.labelPosition[0] + Math.cos(angle) * pushDistance,
            territory1.labelPosition[1] + Math.sin(angle) * pushDistance
          ];
          
          territory2.labelPosition = [
            territory2.labelPosition[0] - Math.cos(angle) * pushDistance,
            territory2.labelPosition[1] - Math.sin(angle) * pushDistance
          ];
        }
      }
    }
    
    return adjustedTerritories;
  }, [rawTerritories]);

  // Add subtle stars for background
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
    return stars;
  };

  const stars = generateStars();

  return (
    <div className={`relative overflow-visible ${className}`} data-testid="hero-galaxy-map" style={{ position: 'relative' }}>
      {/* Animated Background Layers */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {/* Drifting gradient background */}
        <div 
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #2F47D3 0%, #9B4DFF 50%, #2F47D3 100%)',
            pointerEvents: 'none'
          }}
        />
        
        {/* Nebula blobs */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <div 
            className="absolute w-64 h-64 rounded-full opacity-20 animate-nebula-drift"
            style={{
              background: 'radial-gradient(circle, #6EA3FF 0%, transparent 70%)',
              top: '10%',
              left: '20%',
              animationDelay: '0s',
              pointerEvents: 'none'
            }}
          />
          <div 
            className="absolute w-48 h-48 rounded-full opacity-15 animate-nebula-drift"
            style={{
              background: 'radial-gradient(circle, #1EC6A8 0%, transparent 70%)',
              top: '60%',
              right: '15%',
              animationDelay: '8s',
              pointerEvents: 'none'
            }}
          />
          <div 
            className="absolute w-36 h-36 rounded-full opacity-25 animate-nebula-drift"
            style={{
              background: 'radial-gradient(circle, #FFB020 0%, transparent 70%)',
              bottom: '20%',
              left: '30%',
              animationDelay: '15s',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Multi-layer starfield */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          {/* Large stars - slow parallax */}
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={`large-${i}`}
              className="absolute animate-parallax-slow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 2}px`,
                height: `${3 + Math.random() * 2}px`,
                backgroundColor: '#FFD966',
                borderRadius: '50%',
                animationDelay: `${Math.random() * 30}s`,
                pointerEvents: 'none'
              }}
            />
          ))}
          
          {/* Medium stars - medium parallax + twinkle */}
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={`medium-${i}`}
              className="absolute animate-parallax-medium animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 1}px`,
                height: `${2 + Math.random() * 1}px`,
                backgroundColor: '#FFD966',
                borderRadius: '50%',
                animationDelay: `${Math.random() * 20}s, ${Math.random() * 2}s`,
                pointerEvents: 'none'
              }}
            />
          ))}
          
          {/* Small stars - fast twinkle */}
          {Array.from({ length: 25 }, (_, i) => (
            <div
              key={`small-${i}`}
              className="absolute animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '1px',
                height: '1px',
                backgroundColor: '#FFD966',
                borderRadius: '50%',
                animationDelay: `${Math.random() * 2}s`,
                pointerEvents: 'none'
              }}
            />
          ))}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="relative w-full h-full z-10"
        style={{ maxHeight: '600px' }}
      >
        {/* Enhanced filters and gradients */}
        <defs>
          <linearGradient id="galaxyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(47, 71, 211, 0.1)" />
            <stop offset="100%" stopColor="rgba(155, 77, 255, 0.1)" />
          </linearGradient>
          
          {/* Enhanced white glow with inner stroke */}
          <filter id="territoryGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="glow"/>
            <feColorMatrix in="glow" values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 1 0"/>
            <feMerge> 
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="territoryInnerStroke" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology operator="dilate" radius="1" result="stroke"/>
            <feColorMatrix in="stroke" values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 1 0" result="whiteStroke"/>
            <feComposite in="whiteStroke" in2="SourceGraphic" operator="over"/>
          </filter>
          
          {/* Pill blur filter for backdrop effect */}
          <filter id="pillBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
          </filter>
        </defs>

        {/* Semi-transparent background for contrast */}
        <rect width="100%" height="100%" fill="url(#galaxyGradient)" />

        {/* Additional SVG stars for layering */}
        {stars.map(star => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="#FFD966"
            opacity={star.opacity}
            className="animate-twinkle"
            style={{ animationDelay: `${Math.random() * 2}s` }}
          />
        ))}

        {/* Team Territories - polygons only with pointer-events */}
        {territories.map((territory) => (
          <g 
            key={territory.id}
            className="animate-country-hover"
            onMouseEnter={() => setSelectedTeam(territory.id)}
            onMouseLeave={() => setSelectedTeam(null)}
          >
            {/* Outer glow */}
            <path
              d={territory.path}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              opacity="0.3"
              filter="url(#territoryGlow)"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Territory fill - clickable */}
            <path
              d={territory.path}
              fill={territory.color}
              opacity={territory.isMyTeam ? "0.85" : "0.7"}
              filter="url(#territoryInnerStroke)"
              data-testid={`territory-${territory.id}`}
              style={{ pointerEvents: 'fill', cursor: 'pointer' }}
              onClick={() => window.location.href = '/teams'}
            />
            
            {/* White inner stroke */}
            <path
              d={territory.path}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              opacity="0.9"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        ))}
      </svg>
      
      {/* Label Layer - rendered above SVG with forced black text */}
      <div className="label-layer absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {territories.map((territory) => {
          const minCellAreaThreshold = 3000;
          const isSmallCell = territory.area < minCellAreaThreshold;
          
          return (
            <div key={`label-${territory.id}`} className="absolute">
              {!isSmallCell ? (
                // Pill-style label for larger cells with forced black text
                <Link href="/teams">
                  <button
                    className={`
                      absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                      ${selectedTeam === territory.id ? 'scale-105 -translate-y-2' : ''}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    style={{
                      left: `${(territory.labelPosition[0] / width) * 100}%`,
                      top: `${(territory.labelPosition[1] / height) * 100}%`,
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid #E9EEF8',
                      borderRadius: '9999px',
                      padding: '6px 12px',
                      fontSize: `${Math.max(territory.labelSize * 0.8, 11)}px`,
                      fontWeight: '700',
                      color: '#0B1B33',
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={() => setSelectedTeam(territory.id)}
                    onMouseLeave={() => setSelectedTeam(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = '/teams';
                      }
                    }}
                    tabIndex={0}
                    data-testid={`label-${territory.id}`}
                    title={territory.fullName}
                  >
                    <div className="text-center">
                      <div style={{ color: '#0B1B33', fontWeight: '700' }}>{territory.displayName}</div>
                      <div 
                        style={{ 
                          fontSize: `${Math.max(territory.labelSize * 0.6, 9)}px`,
                          color: '#0B1B33',
                          fontWeight: '700',
                          opacity: 0.8,
                          marginTop: '2px'
                        }}
                      >
                        {territory.team.awards} pts
                      </div>
                    </div>
                  </button>
                </Link>
              ) : (
                // SVG fallback with black text and white stroke for tiny cells
                <Link href="/teams">
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${(territory.labelPosition[0] / width) * 100}%`,
                      top: `${(territory.labelPosition[1] / height) * 100}%`,
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={() => setSelectedTeam(territory.id)}
                    onMouseLeave={() => setSelectedTeam(null)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = '/teams';
                      }
                    }}
                  >
                    <svg width="80" height="30" className="overflow-visible">
                      <text
                        x="40"
                        y="15"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          fill: '#0B1B33',
                          stroke: '#FFFFFF',
                          strokeWidth: '3px',
                          paintOrder: 'stroke fill'
                        }}
                      >
                        {territory.displayName}
                      </text>
                    </svg>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced hover tooltip */}
      {selectedTeam && (
        <div 
          className="absolute top-4 left-4 z-30 pointer-events-none"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid #E9EEF8'
          }}
        >
          {(() => {
            const territory = territories.find(t => t.id === selectedTeam);
            return territory ? (
              <div className="min-w-[200px]">
                <h4 className="font-bold text-gray-900 text-lg mb-1">{territory.fullName}</h4>
                <p className="text-sm text-gray-600 mb-2">{territory.team.track} Track</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{territory.team.awards} total points</span>
                  {territory.isMyTeam && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      My Team
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to manage team</p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}