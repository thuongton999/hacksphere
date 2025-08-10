import React, { useState, useRef, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { Land, Team } from '@shared/schema';
import { Button } from '@/components/ui/button';

interface GalaxyMapProps {
  lands: (Land & { team?: Team })[];
  onLandSelect?: (land: Land & { team?: Team }) => void;
  onCreateLand?: () => void;
  selectedLandId?: string;
  mentorMode?: boolean;
}

interface MapPin {
  id: string;
  x: number;
  y: number;
  land: Land & { team?: Team };
  type: 'land' | 'mentor';
}

export function GalaxyMap({ 
  lands, 
  onLandSelect, 
  onCreateLand, 
  selectedLandId,
  mentorMode = false 
}: GalaxyMapProps) {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Generate random positions for lands
  useEffect(() => {
    const mapPins: MapPin[] = lands.map((land, index) => ({
      id: land.id,
      x: 100 + (index % 8) * 120 + Math.random() * 60,
      y: 100 + Math.floor(index / 8) * 120 + Math.random() * 60,
      land,
      type: 'land',
    }));

    // Add mentor pins if in mentor mode
    if (mentorMode) {
      for (let i = 0; i < 5; i++) {
        mapPins.push({
          id: `mentor-${i}`,
          x: 200 + i * 150 + Math.random() * 80,
          y: 200 + Math.random() * 100,
          land: {} as any, // Placeholder for mentor data
          type: 'mentor',
        });
      }
    }

    setPins(mapPins);
  }, [lands, mentorMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.5, Math.min(2, scale + e.deltaY * -0.001));
    setScale(newScale);
  };

  const handlePinClick = (pin: MapPin, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pin.type === 'land' && onLandSelect) {
      onLandSelect(pin.land);
    }
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-xl planets-galaxy-bg border-2 border-planets-mid-grey">
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        data-testid="galaxy-map"
      >
        <div
          className="relative"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: 'center',
            width: '1200px',
            height: '800px',
          }}
        >
          {/* Galaxy background pattern */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Land and mentor pins */}
          {pins.map((pin) => (
            <div
              key={pin.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                pin.type === 'land' 
                  ? `planets-land-pin ${selectedLandId === pin.id ? 'ring-4 ring-planets-primary-blue' : ''}`
                  : 'planets-mentor-pin planets-land-pin'
              }`}
              style={{
                left: pin.x,
                top: pin.y,
              }}
              onClick={(e) => handlePinClick(pin, e)}
              data-testid={`map-pin-${pin.type}-${pin.id}`}
            >
              <MapPin className="w-4 h-4 text-white" />
              
              {/* Land info tooltip */}
              {pin.type === 'land' && pin.land.title && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-planets-dark-grey text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {pin.land.title}
                    {pin.land.totalChips > 0 && (
                      <span className="ml-1 text-planets-sunshine">
                        ⚡{pin.land.totalChips}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mentor availability indicator */}
              {pin.type === 'mentor' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-planets-success-green rounded-full border border-white" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setScale(Math.min(2, scale + 0.2))}
          className="w-8 h-8 p-0"
          data-testid="zoom-in-btn"
        >
          +
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
          className="w-8 h-8 p-0"
          data-testid="zoom-out-btn"
        >
          -
        </Button>
      </div>

      {/* Create Land button */}
      {onCreateLand && (
        <Button
          onClick={onCreateLand}
          className="absolute bottom-4 left-4 planets-btn-primary flex items-center gap-2"
          data-testid="create-land-btn"
        >
          <Plus className="w-4 h-4" />
          Claim Your Land
        </Button>
      )}

      {/* Map controls info */}
      <div className="absolute bottom-4 right-4 text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1">
        Drag to pan • Scroll to zoom
      </div>
    </div>
  );
}