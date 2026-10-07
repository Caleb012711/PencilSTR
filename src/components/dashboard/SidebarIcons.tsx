import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  isActive?: boolean;
}

// 1. Bespoke Pinterest-Inspired PencilSTR Circular Brand Emblem
export const BrandLogoIcon: React.FC<IconProps> = ({ className = 'w-9 h-9', size }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="pstr-bg-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1C1917" />
        <stop offset="0.6" stopColor="#111110" />
        <stop offset="1" stopColor="#0C0A09" />
      </linearGradient>
      <linearGradient id="pstr-amber-grad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <radialGradient id="pstr-glow" cx="18" cy="18" r="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" stopOpacity="0.25" />
        <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <filter id="pstr-soft-shadow" x="0" y="2" width="36" height="34" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Ambient Glow */}
    <circle cx="18" cy="18" r="16" fill="url(#pstr-glow)" />

    {/* Tactile Outer Disc */}
    <rect
      x="2"
      y="2"
      width="32"
      height="32"
      rx="10"
      fill="url(#pstr-bg-grad)"
      stroke="#292524"
      strokeWidth="1.2"
      filter="url(#pstr-soft-shadow)"
    />

    {/* Architectural Diagonal Drafting Axis */}
    <line x1="8" y1="28" x2="28" y2="8" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />

    {/* Continuous Monogram: Crafted Architectural 'P' + Drafting Pencil Nib + Roofline */}
    <path
      d="M11 26V11C11 9.34315 12.3431 8 14 8H19.5C22.5376 8 25 10.4624 25 13.5C25 16.5376 22.5376 19 19.5 19H15"
      stroke="url(#pstr-amber-grad)"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Pencil Facet / Lead Tip at Base */}
    <path
      d="M9.5 24L11 28L12.5 24H9.5Z"
      fill="#F59E0B"
    />

    {/* Precision Architectural Compass Pivot */}
    <circle cx="19.5" cy="13.5" r="2.2" fill="#FFFFFF" />
    <circle cx="19.5" cy="13.5" r="3.6" stroke="#D97706" strokeWidth="1" strokeOpacity="0.8" />
  </svg>
);

// 2. Pinterest-style Curated Bento Overview (Organic Board Tiles)
export const OverviewIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect
      x="3"
      y="3"
      width="6.5"
      height="8.5"
      rx="2.25"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.2 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <rect
      x="12.5"
      y="3"
      width="6.5"
      height="5.5"
      rx="2.25"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.35 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <rect
      x="3"
      y="14.5"
      width="6.5"
      height="4.5"
      rx="2"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.35 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <rect
      x="12.5"
      y="11.5"
      width="6.5"
      height="7.5"
      rx="2.25"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.9 : 0.15}
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
);

// 3. Quantitative Underwriter Studio (Architectural Drafting Caliper & Compass)
export const StudioIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Compass Pivot Jewel */}
    <circle
      cx="11"
      cy="4.5"
      r="2"
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
    />
    {/* Compass Caliper Legs */}
    <path
      d="M9.8 6.2L4.5 17.5M12.2 6.2L17.5 17.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Graduated Arc Gauge */}
    <path
      d="M6.8 12.8C8 12 9.4 11.5 11 11.5C12.6 11.5 14 12 15.2 12.8"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    {/* Center Precision Tick */}
    <line x1="11" y1="10.2" x2="11" y2="12.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 4. Intelligence Analyst Chat (Fluid Dialogue Nodes & Spark)
export const ChatIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M17.5 11C17.5 14.5899 14.1421 17.5 10 17.5C8.8028 17.5 7.6713 17.2564 6.6667 16.8182L3.5 18L4.4545 15.1364C3.8548 13.9487 3.5 12.5298 3.5 11C3.5 7.41015 6.8579 4.5 11 4.5C15.1421 4.5 17.5 7.41015 17.5 11Z"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.18 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Three Conversational Dots */}
    <circle cx="8" cy="11" r="1.1" fill="currentColor" />
    <circle cx="11" cy="11" r="1.1" fill="currentColor" />
    <circle cx="14" cy="11" r="1.1" fill="currentColor" />
    {/* Pinterest Sparkle Aperture */}
    <path
      d="M16 4.5C17.2 4.5 18 3.7 18 2.5C18 3.7 18.8 4.5 20 4.5C18.8 4.5 18 5.3 18 6.5C18 5.3 17.2 4.5 16 4.5Z"
      fill="#D97706"
    />
  </svg>
);

// 5. Pipeline CRM / Board Progression (Curated Pinterest Boards / Cards)
export const PipelineIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect
      x="3"
      y="3.5"
      width="4.5"
      height="15"
      rx="1.75"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.3 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <rect
      x="9.5"
      y="3.5"
      width="4.5"
      height="10.5"
      rx="1.75"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.2 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <rect
      x="16"
      y="3.5"
      width="4.5"
      height="13.5"
      rx="1.75"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.4 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
);

// 6. Market Radar (Autonomous Geographic Sweep)
export const RadarIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="11" cy="11" r="4.25" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
    <circle cx="11" cy="11" r="1.5" fill="currentColor" />
    <path d="M11 3V6M11 16V19M3 11H6M16 11H19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M11 11L16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 7. Covenant & CC&R Audit (Institutional Verification Crest)
export const AuditIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M11 3L3.5 6.5V11.5C3.5 15.8 6.7 18.8 11 20C15.3 18.8 18.5 15.8 18.5 11.5V6.5L11 3Z"
      fill={isActive ? 'currentColor' : 'none'}
      fillOpacity={isActive ? 0.2 : 0}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 11.25L10 13.5L14.75 8.75"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 8. Settings & Calibration (Ergonomic Precision Dials)
export const SettingsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <line x1="4" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="4" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="8" cy="7" r="2.5" fill="#FAF9F6" className="dark:fill-[#121211]" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="14" cy="15" r="2.5" fill="#FAF9F6" className="dark:fill-[#121211]" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

// 9. Single Elegant Sidebar Toggle / Dock Control
export const SidebarDockToggleIcon: React.FC<IconProps & { collapsed?: boolean }> = ({
  className = 'w-4 h-4',
  size,
  collapsed = false,
}) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="7.5" y1="3.5" x2="7.5" y2="16.5" stroke="currentColor" strokeWidth="1.5" />
    {collapsed ? (
      <path d="M11 8L13 10L11 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M13 8L11 10L13 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

// 10. Solar / Lunar Theme Icons
export const SunIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="10" cy="10" r="3.75" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M10 2.5V4M10 16V17.5M2.5 10H4M16 10H17.5M4.7 4.7L5.8 5.8M14.2 14.2L15.3 15.3M4.7 15.3L5.8 14.2M14.2 5.8L15.3 4.7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M15.5 11.2C14.8 13.8 12.3 15.8 9.4 15.8C5.9 15.8 3 12.9 3 9.4C3 6.5 5 4 7.6 3.3C7.1 4.7 7.2 6.2 8.1 7.4C9 8.6 10.6 9.1 12 8.6C12.7 9.9 13.9 10.8 15.5 11.2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

// 11. Exit to Home Icon
export const ExitHomeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M8 4H4.5C3.67 4 3 4.67 3 5.5V14.5C3 15.33 3.67 16 4.5 16H8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M12.5 7L9.5 10L12.5 13"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9.5 10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// 12. Pinterest-style Pushpin / Bookmark Icon for Deals
export const PinDealIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, isActive }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M13.5 3.5L16.5 6.5L14 9L14.5 13.5L11 10L6.5 14.5L5.5 13.5L10 9L6.5 5.5L11 6L13.5 3.5Z"
      fill={isActive ? '#D97706' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 16L7 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// 14. The Drafting Table Icon (Architectural Blueprint, Spreadsheets & Deliverables)
export const DraftingTableIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Blueprint / Drafting Table Board */}
    <rect
      x="3"
      y="3"
      width="14"
      height="14"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.4"
      fill={isActive ? '#D97706' : 'none'}
      fillOpacity={isActive ? 0.12 : 0}
    />
    {/* Horizontal T-Square / Drafting Ruler */}
    <line x1="3" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.2" strokeOpacity={0.8} />
    {/* Vertical Grid Divisions */}
    <line x1="9" y1="7" x2="9" y2="17" stroke="currentColor" strokeWidth="1.2" strokeOpacity={0.6} />
    {/* Financial Spreadsheet / Document lines */}
    <line x1="5" y1="10.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="5" y1="13.5" x2="7.5" y2="13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="11" y1="10.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="11" y1="13.5" x2="14" y2="13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    {/* Top Right Drafting Pin / Nib */}
    <circle cx="14" cy="5" r="1" fill={isActive ? '#D97706' : 'currentColor'} />
  </svg>
);

// 15. Agent Team Mesh Icon
export const AgentTeamIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, isActive }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Inter-Agent Neural Mesh Pathways */}
    <path
      d="M10 6L5.5 13.5M10 6L14.5 13.5M5.5 13.5H14.5M10 6V11M5.5 13.5L10 11M14.5 13.5L10 11"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeDasharray={isActive ? undefined : '1.5 1.5'}
      strokeOpacity={isActive ? 0.7 : 0.4}
    />
    {/* Principal Scribe (Astra / Orchestrator Node) */}
    <circle
      cx="10"
      cy="5.5"
      r="3"
      fill={isActive ? '#8B5CF6' : 'currentColor'}
      fillOpacity={isActive ? 1 : 0.2}
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="10" cy="5.5" r="1.2" fill={isActive ? '#FFFFFF' : '#8B5CF6'} />

    {/* Specialist Scribe 1 (Left / DSCR Node) */}
    <circle
      cx="5"
      cy="14"
      r="2.5"
      fill={isActive ? '#059669' : 'currentColor'}
      fillOpacity={isActive ? 1 : 0.2}
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="5" cy="14" r="0.9" fill={isActive ? '#FFFFFF' : '#059669'} />

    {/* Specialist Scribe 2 (Right / CC&R Node) */}
    <circle
      cx="15"
      cy="14"
      r="2.5"
      fill={isActive ? '#D97706' : 'currentColor'}
      fillOpacity={isActive ? 1 : 0.2}
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="15" cy="14" r="0.9" fill={isActive ? '#FFFFFF' : '#D97706'} />

    {/* Satellite Scribe Node (Spawned) */}
    <circle
      cx="10"
      cy="11"
      r="1.8"
      fill={isActive ? '#2563EB' : 'currentColor'}
      fillOpacity={isActive ? 0.9 : 0.3}
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);


