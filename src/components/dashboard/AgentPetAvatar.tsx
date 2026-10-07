import React from 'react';

export type AnimalPetType =
  | 'owl'
  | 'shiba'
  | 'cat'
  | 'beaver'
  | 'bunny'
  | 'fox'
  | 'bear'
  | 'otter'
  | 'hedgehog'
  | 'dragon'
  | 'wolf'
  | 'raccoon'
  | 'lion'
  | 'eagle'
  | 'koala'
  | 'panda'
  | 'tiger'
  | 'dolphin'
  | 'penguin'
  | 'frog'
  | 'octopus'
  | 'deer'
  | 'turtle'
  | 'elephant'
  | 'chameleon'
  | 'whale'
  | 'sloth'
  | 'bee'
  | 'badger'
  | 'falcon'
  | 'flamingo';

export type ShapePetType =
  | 'quantum-dots'
  | 'cyber-bot'
  | 'tesseract'
  | 'pulse-core'
  | 'delta-prism'
  | 'hex-shield'
  | 'chrono-gyro'
  | 'astro-star';

export type PetType = AnimalPetType | ShapePetType;

export type PetMood = 'happy' | 'focused' | 'curious' | 'calculating' | 'alert';

export const ANIMAL_PET_TYPES: AnimalPetType[] = [
  'owl',
  'shiba',
  'cat',
  'beaver',
  'bunny',
  'fox',
  'bear',
  'otter',
  'hedgehog',
  'dragon',
  'wolf',
  'raccoon',
  'lion',
  'eagle',
  'koala',
  'panda',
  'tiger',
  'dolphin',
  'penguin',
  'frog',
  'octopus',
  'deer',
  'turtle',
  'elephant',
  'chameleon',
  'whale',
  'sloth',
  'bee',
  'badger',
  'falcon',
  'flamingo',
];

export const SHAPE_PET_TYPES: ShapePetType[] = [
  'quantum-dots',
  'cyber-bot',
  'tesseract',
  'pulse-core',
  'delta-prism',
  'hex-shield',
  'chrono-gyro',
  'astro-star',
];

export const ALL_PET_TYPES: PetType[] = [
  ...ANIMAL_PET_TYPES,
  ...SHAPE_PET_TYPES,
];

interface AgentPetAvatarProps {
  agentId?: string;
  petType?: PetType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mood?: PetMood;
  isWorking?: boolean;
  className?: string;
  showBadge?: boolean;
}

export const getPetForAgent = (agentId: string = '', customPetType?: string): PetType => {
  if (customPetType && ALL_PET_TYPES.includes(customPetType as PetType)) {
    return customPetType as PetType;
  }
  const id = agentId.toLowerCase();
  // Shape pet matches
  if (id.includes('dot') || id.includes('matrix')) return 'quantum-dots';
  if (id.includes('bot') || id.includes('grok') || id.includes('cyber') || id.includes('auto')) return 'cyber-bot';
  if (id.includes('cube') || id.includes('tesseract') || id.includes('iso')) return 'tesseract';
  if (id.includes('pulse') || id.includes('orb') || id.includes('aura') || id.includes('core')) return 'pulse-core';
  if (id.includes('prism') || id.includes('delta') || id.includes('vector')) return 'delta-prism';
  if (id.includes('shield') || id.includes('hex') || id.includes('aegis')) return 'hex-shield';
  if (id.includes('gyro') || id.includes('chrono') || id.includes('clock')) return 'chrono-gyro';
  if (id.includes('star') || id.includes('astro') || id.includes('nova-star')) return 'astro-star';

  // Distinct animal matches
  if (id.includes('astra')) return 'owl'; // Astra: Wise Celestial Owl
  if (id.includes('scout')) return 'shiba'; // Scout: Alert Hound / Shiba
  if (id.includes('cipher') || id.includes('dscr')) return 'cat'; // Cipher / DSCR: Stealth Financial Cat
  if (id.includes('lex') || id.includes('zoning')) return 'beaver'; // Lex / Zoning: Diligent Legal Beaver
  if (id.includes('tax')) return 'otter'; // Tax: Stream River Otter
  if (id.includes('lion') || id.includes('capital') || id.includes('equity')) return 'lion';
  if (id.includes('eagle') || id.includes('sky') || id.includes('viewshed')) return 'eagle';
  if (id.includes('koala') || id.includes('hazard') || id.includes('insur')) return 'koala';
  if (id.includes('panda') || id.includes('balance')) return 'panda';
  if (id.includes('tiger') || id.includes('stress')) return 'tiger';
  if (id.includes('dolphin') || id.includes('wave') || id.includes('adr')) return 'dolphin';
  if (id.includes('penguin') || id.includes('escrow') || id.includes('reserve')) return 'penguin';
  if (id.includes('frog') || id.includes('leap')) return 'frog';
  if (id.includes('octo') || id.includes('ink')) return 'octopus';
  if (id.includes('deer') || id.includes('stag') || id.includes('bramble')) return 'deer';
  if (id.includes('turtle') || id.includes('preserve')) return 'turtle';
  if (id.includes('elephant') || id.includes('memory') || id.includes('history')) return 'elephant';
  if (id.includes('chameleon') || id.includes('color') || id.includes('adaptive')) return 'chameleon';
  if (id.includes('whale') || id.includes('spout') || id.includes('ocean')) return 'whale';
  if (id.includes('sloth') || id.includes('slow') || id.includes('cozy')) return 'sloth';
  if (id.includes('bee') || id.includes('buzz') || id.includes('honey')) return 'bee';
  if (id.includes('badger') || id.includes('tough')) return 'badger';
  if (id.includes('falcon') || id.includes('swift') || id.includes('speed')) return 'falcon';
  if (id.includes('flamingo') || id.includes('coral') || id.includes('pink')) return 'flamingo';
  if (id.includes('fox') || id.includes('yield')) return 'fox';
  if (id.includes('bear') || id.includes('vault')) return 'bear';
  if (id.includes('hedge') || id.includes('risk')) return 'hedgehog';
  if (id.includes('dragon')) return 'dragon';
  if (id.includes('radar') || id.includes('wolf')) return 'wolf';
  if (id.includes('raccoon') || id.includes('audit')) return 'raccoon';
  return 'bunny'; // Nova: Quantum Cyber Bunny
};

export const getPetName = (petType: PetType): { name: string; species: string; quirk: string; emoji: string; isShape?: boolean } => {
  switch (petType) {
    // Unique Shape Cyber Companions
    case 'quantum-dots':
      return { name: 'Dotsy', species: 'Quantum Orbit Dots', quirk: 'Dots swirl and orbit in synchrony while streaming live MLS comp feeds', emoji: '⠕', isShape: true };
    case 'cyber-bot':
      return { name: 'Byte', species: 'Prism Bot Automaton', quirk: 'Cyclops cyan visor pulses rhythmically and antennas calibrate calculations', emoji: '🤖', isShape: true };
    case 'tesseract':
      return { name: 'Tess', species: 'Isometric Hypercube', quirk: 'Inner tesseract cube rotates smoothly with glowing neon vertex nodes', emoji: '🧊', isShape: true };
    case 'pulse-core':
      return { name: 'Aura', species: 'Luminescent Pulse Orb', quirk: 'Concentric energy rings breathe gently when verifying debt covenants', emoji: '🔮', isShape: true };
    case 'delta-prism':
      return { name: 'Vector', species: 'Refractive Delta Prism', quirk: 'Hovering triangular prism splits light into underwriting risk spectra', emoji: '💎', isShape: true };
    case 'hex-shield':
      return { name: 'Aegis', species: 'Honeycomb Hex Droid', quirk: 'Hexagonal cyber matrix shimmers with glowing cyan honeycomb nodes', emoji: '🛡️', isShape: true };
    case 'chrono-gyro':
      return { name: 'Chrono', species: 'Temporal Gyroscope Droid', quirk: 'Gimbal rings spin smoothly while synchronizing multi-year amortizations', emoji: '⚙️', isShape: true };
    case 'astro-star':
      return { name: 'Nova-Star', species: 'Stellar Tetra Prism', quirk: 'Four diamond points radiate golden pulses when target cap rate is hit', emoji: '⭐', isShape: true };

    // Distinct Animal Mascots
    case 'owl':
      return { name: 'Archie', species: 'Celestial Scribe Owl', quirk: 'Flaps wings and blinks rapidly when calculating pro formas', emoji: '🦉' };
    case 'shiba':
      return { name: 'Pip', species: 'Scout Shiba Inu', quirk: 'Bounces and wags tail excitedly when sniffing out comp sets', emoji: '🐕' };
    case 'cat':
      return { name: 'Miso', species: 'Audit Cyber Cat', quirk: 'Whiskers twitch and paws tap fast when balancing debt tables', emoji: '🐈' };
    case 'beaver':
      return { name: 'Barnaby', species: 'Legal Scholar Beaver', quirk: 'Slaps tail and adjusts glasses when reviewing deed covenants', emoji: '🦫' };
    case 'fox':
      return { name: 'Rusty', species: 'Market Comp Fox', quirk: 'Swishes fluffy tail and swivels ears when tracking ADR pacing', emoji: '🦊' };
    case 'bear':
      return { name: 'Bruno', species: 'Vault Grizzly Bear', quirk: 'Rumbles happily and guards debt covenants with heavy paws', emoji: '🐻' };
    case 'otter':
      return { name: 'Ollie', species: 'Tax Shield River Otter', quirk: 'Floats on back and juggles bonus depreciation deductions', emoji: '🦦' };
    case 'hedgehog':
      return { name: 'Spike', species: 'Risk Shield Hedgehog', quirk: 'Bristles quills and curls into protective ball during rate shocks', emoji: '🦔' };
    case 'dragon':
      return { name: 'Draco', species: 'Sovereign Deal Dragon', quirk: 'Flaps wings and sparks embers when deal clears 1.50x DSCR', emoji: '🐲' };
    case 'wolf':
      return { name: 'Kona', species: 'Night Radar Wolf', quirk: 'Tilts head and watches market signals with razor-sharp gaze', emoji: '🐺' };
    case 'raccoon':
      return { name: 'Bandit', species: 'Audit Sleuth Raccoon', quirk: 'Washes inspection documents and finds hidden capex items', emoji: '🦝' };
    case 'lion':
      return { name: 'Leo', species: 'Capital Pride Lion', quirk: 'Rears majestically when equity hurdles and return waterfalls align', emoji: '🦁' };
    case 'eagle':
      return { name: 'Talon', species: 'Viewshed Recon Eagle', quirk: 'Soars high and pinpoints parcel boundaries with razor precision', emoji: '🦅' };
    case 'koala':
      return { name: 'Koko', species: 'Risk Sentinel Koala', quirk: 'Munches eucalyptus calmly while evaluating insurance and wildfire hazard lines', emoji: '🐨' };
    case 'panda':
      return { name: 'Bao', species: 'Balance Sheet Panda', quirk: 'Chews bamboo pensively while balancing assets and liabilities to the penny', emoji: '🐼' };
    case 'tiger':
      return { name: 'Rory', species: 'Apex Underwriter Tiger', quirk: 'Prowls dynamically through 10-year discount cash flow pro formas', emoji: '🐯' };
    case 'dolphin':
      return { name: 'Echo', species: 'ADR Wave Dolphin', quirk: 'Leaps gracefully through seasonal booking compression waves', emoji: '🐬' };
    case 'penguin':
      return { name: 'Pippin', species: 'Iceberg Escrow Penguin', quirk: 'Waddles with determination protecting capex reserve escrows', emoji: '🐧' };
    case 'frog':
      return { name: 'Finley', species: 'Liquidity Leap Frog', quirk: 'Puffs bright throat sac happily when cash flow clears hurdle', emoji: '🐸' };
    case 'octopus':
      return { name: 'Inky', species: 'Multi-Asset Octopus', quirk: 'Curling tentacles coordinate eight debt calculations simultaneously', emoji: '🐙' };
    case 'deer':
      return { name: 'Bramble', species: 'Forest Haven Stag', quirk: 'Velvet antlers gleam when surveying mountain ridge parcels', emoji: '🦌' };
    case 'turtle':
      return { name: 'Shelly', species: 'Capital Shield Turtle', quirk: 'Withdraws into hexagonal fortress shell during black-swan rate shocks', emoji: '🐢' };
    case 'elephant':
      return { name: 'Tembo', species: 'Institutional Memory Elephant', quirk: 'Flaps large ears and recalls deep historical sub-market transactions', emoji: '🐘' };
    case 'chameleon':
      return { name: 'Karma', species: 'Dynamic Rate Chameleon', quirk: 'Shifts skin hues dynamically matching ADR seasonality cycles', emoji: '🦎' };
    case 'whale':
      return { name: 'Bubbles', species: 'Oceanic Blue Whale', quirk: 'Shoots a playful water spout spray when cash flow clears underwriting hurdles', emoji: '🐋' };
    case 'sloth':
      return { name: 'Snooze', species: 'Cozy Slow-Yield Sloth', quirk: 'Smiles peacefully and clings to bamboo while computing 30-year amortizations', emoji: '🦥' };
    case 'bee':
      return { name: 'Buzz', species: 'Hyper-Yield Honeybee', quirk: 'Buzzes vigorously around cash flow spreadsheets and collects ADR nectar', emoji: '🐝' };
    case 'badger':
      return { name: 'Rocky', species: 'Resilient Honey Badger', quirk: 'Bold white racing stripe bristles when digging through dense municipal zoning codes', emoji: '🦡' };
    case 'falcon':
      return { name: 'Swift', species: 'Peregrine Stealth Falcon', quirk: 'Folds wings into high-speed dive when spotting new under-priced listings', emoji: '🦅' };
    case 'flamingo':
      return { name: 'Coral', species: 'Aesthetic Equity Flamingo', quirk: 'Stands gracefully on one slender leg balancing high-yield equity returns', emoji: '🦩' };
    case 'bunny':
    default:
      return { name: 'Nova', species: 'Quantum Bunny', quirk: 'Ears bounce in energetic rhythm when underwriting deals', emoji: '🐰' };
  }
};

export const AgentPetAvatar: React.FC<AgentPetAvatarProps> = ({
  agentId,
  petType: propPetType,
  size = 'md',
  mood = 'focused',
  isWorking = false,
  className = '',
  showBadge = false,
}) => {
  const petType = propPetType || getPetForAgent(agentId);
  const petInfo = getPetName(petType);

  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group select-none ${className}`}
      title={`${petInfo.name} (${petInfo.species}): ${petInfo.quirk} · Status: ${isWorking ? 'WORKING NOW' : 'IDLE'}`}
    >
      <style>{`
        @keyframes petFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes petWorkingBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          30% { transform: translateY(-3.5px) scale(1.05); }
          60% { transform: translateY(1px) scale(0.97); }
        }
        @keyframes petBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes petRapidBlink {
          0%, 80%, 100% { transform: scaleY(1); }
          85%, 95% { transform: scaleY(0.1); }
        }
        @keyframes earWiggle {
          0%, 80%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(3deg); }
          90% { transform: rotate(-3deg); }
        }
        @keyframes earWiggleFast {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(6deg); }
          75% { transform: rotate(-6deg); }
        }
        @keyframes tailWag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes tailWagFast {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(16deg); }
          75% { transform: rotate(-12deg); }
        }
        @keyframes owlWingFlap {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          50% { transform: rotate(-14deg) scaleX(1.15); }
        }
        @keyframes owlWingFlapRight {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          50% { transform: rotate(14deg) scaleX(1.15); }
        }
        @keyframes whiskerTwitch {
          0%, 90%, 100% { transform: translateY(0); }
          95% { transform: translateY(-0.5px) rotate(2deg); }
        }
        @keyframes whiskerFast {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-1.5px) rotate(4deg); }
          70% { transform: translateY(1px) rotate(-3deg); }
        }
        @keyframes beaverTailSlap {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(5deg) translateY(-2px); }
        }
        @keyframes bunnyEarBounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2) translateY(-2px); }
        }
        @keyframes foxTailSwish {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg) translateY(-1px); }
        }
        @keyframes dragonWingFlap {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          50% { transform: rotate(-20deg) scaleX(1.2); }
        }
        @keyframes dragonWingFlapRight {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          50% { transform: rotate(20deg) scaleX(1.2); }
        }
        @keyframes hedgehogBristle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08) translateY(-1px); }
        }
        @keyframes otterSwim {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg) translateY(-1.5px); }
        }
        @keyframes workingAura {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes orbitDots {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitDotsReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes cubeFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(4deg); }
        }
        @keyframes pulseOrb {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes botVisorScan {
          0%, 100% { transform: scaleX(1); opacity: 0.9; }
          50% { transform: scaleX(1.15); opacity: 1; }
        }
        @keyframes deltaPrismHover {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(6deg); }
        }
      `}</style>

      {/* Dynamic Working Glow Halo */}
      {isWorking && (
        <span
          className="absolute inset-0 rounded-2xl bg-[#F59E0B]/20 dark:bg-[#F59E0B]/30 blur-xs pointer-events-none"
          style={{ animation: 'workingAura 1.4s ease-in-out infinite' }}
        />
      )}

      <div
        className={`${sizeClasses} relative rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
        style={{
          animation: isWorking
            ? 'petWorkingBounce 0.65s ease-in-out infinite'
            : 'petFloat 3.5s ease-in-out infinite',
        }}
      >
        {/* Render Dedicated Cute Pet Vector SVG */}
        {petType === 'owl' && (
          // Astra's Celestial Owl "Archie"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="owlBody" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#6D28D9" />
              </linearGradient>
              <linearGradient id="owlBelly" x1="24" y1="30" x2="40" y2="54" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EDE9FE" />
                <stop offset="1" stopColor="#DDD6FE" />
              </linearGradient>
            </defs>
            {/* Ear Tufts */}
            <path
              d="M18 12L24 22L14 20Z"
              fill="#7C3AED"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite'
                  : 'earWiggle 4s ease-in-out infinite',
                transformOrigin: '20px 20px',
              }}
            />
            <path
              d="M46 12L50 20L40 22Z"
              fill="#7C3AED"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite 0.25s'
                  : 'earWiggle 4s ease-in-out infinite 0.5s',
                transformOrigin: '44px 20px',
              }}
            />
            {/* Owl Body */}
            <rect x="14" y="16" width="36" height="40" rx="18" fill="url(#owlBody)" />
            {/* Animated Wings (Flap when working!) */}
            <path
              d="M14 28C14 28 10 36 12 44C13.5 50 16 52 16 52"
              stroke="#6D28D9"
              strokeWidth="3.2"
              strokeLinecap="round"
              style={{
                animation: isWorking ? 'owlWingFlap 0.35s ease-in-out infinite' : undefined,
                transformOrigin: '14px 28px',
              }}
            />
            <path
              d="M50 28C50 28 54 36 52 44C50.5 50 48 52 48 52"
              stroke="#6D28D9"
              strokeWidth="3.2"
              strokeLinecap="round"
              style={{
                animation: isWorking ? 'owlWingFlapRight 0.35s ease-in-out infinite' : undefined,
                transformOrigin: '50px 28px',
              }}
            />
            {/* Soft Cream Belly */}
            <ellipse cx="32" cy="42" rx="12" ry="11" fill="url(#owlBelly)" />
            {/* Feather Speckles */}
            <path
              d="M28 38C29.5 39.5 30.5 39.5 32 38M32 44C33.5 45.5 34.5 45.5 36 44M28 44C29.5 45.5 30.5 45.5 32 44"
              stroke="#8B5CF6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Big Expressive Owl Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 4.2s ease-in-out infinite',
                transformOrigin: '32px 28px',
              }}
            >
              <circle cx="25" cy="27" r="6" fill="#1E1B4B" />
              <circle cx="39" cy="27" r="6" fill="#1E1B4B" />
              {/* Eye Rings / Golden Goggles */}
              <circle cx="25" cy="27" r="7.5" stroke="#FDE047" strokeWidth={isWorking ? '2' : '1.5'} />
              <circle cx="39" cy="27" r="7.5" stroke="#FDE047" strokeWidth={isWorking ? '2' : '1.5'} />
              <path d="M32.5 27H31.5" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
              {/* Eye Catchlights */}
              <circle cx="27" cy="25" r="2" fill="white" />
              <circle cx="41" cy="25" r="2" fill="white" />
              <circle cx="23.5" cy="28.5" r="0.8" fill="white" />
              <circle cx="37.5" cy="28.5" r="0.8" fill="white" />
            </g>
            {/* Golden Beak */}
            <path d="M30 32L34 32L32 36Z" fill="#F59E0B" />
            {/* Cute Yellow Talons */}
            <path d="M24 56V59M27 56V59M37 56V59M40 56V59" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            {/* Glowing Head Gem */}
            <circle
              cx="32"
              cy="14"
              r="2.5"
              fill={isWorking ? '#F59E0B' : '#FDE047'}
              style={{ animation: 'visorPulse 1.2s ease-in-out infinite' }}
            />
          </svg>
        )}

        {petType === 'shiba' && (
          // Scout's Perky Shiba "Pip"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shibaFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
            {/* Wagging Shiba Tail (Much faster when working!) */}
            <path
              d="M48 42C54 40 56 34 54 30C52 26 46 28 46 32"
              stroke="#D97706"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                animation: isWorking
                  ? 'tailWagFast 0.35s ease-in-out infinite'
                  : 'tailWag 1.8s ease-in-out infinite',
                transformOrigin: '48px 40px',
              }}
            />
            {/* Shiba Ears */}
            <path
              d="M18 14L26 24L16 26Z"
              fill="#D97706"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite'
                  : 'earWiggle 3.2s ease-in-out infinite',
                transformOrigin: '20px 22px',
              }}
            />
            <path d="M19 17L24 23L17 24Z" fill="#FED7AA" />
            <path
              d="M46 14L50 26L38 24Z"
              fill="#D97706"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite 0.25s'
                  : 'earWiggle 3.2s ease-in-out infinite 0.4s',
                transformOrigin: '44px 22px',
              }}
            />
            <path d="M45 17L47 24L40 23Z" fill="#FED7AA" />
            {/* Dog Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#shibaFur)" />
            {/* White Muzzle & Chest Patch */}
            <ellipse cx="32" cy="38" rx="9" ry="8" fill="#FFFBEB" />
            <path d="M26 44C26 44 28 54 32 54C36 54 38 44 38 44" fill="#FFFBEB" />
            {/* Shiba Eyebrow Dots */}
            <circle cx="24" cy="25" r="1.8" fill="#FEF3C7" />
            <circle cx="40" cy="25" r="1.8" fill="#FEF3C7" />
            {/* Blinking Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 2s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <circle cx="25" cy="31" r="3.2" fill="#1C1917" />
              <circle cx="39" cy="31" r="3.2" fill="#1C1917" />
              <circle cx="26" cy="30" r="1" fill="white" />
              <circle cx="40" cy="30" r="1" fill="white" />
            </g>
            {/* Cute Black Snout */}
            <ellipse cx="32" cy="36" rx="2.5" ry="1.8" fill="#1C1917" />
            {/* Happy Mouth */}
            <path d="M30 38.5C31 39.5 32 39.5 32 38.5C32 39.5 33 39.5 34 38.5" stroke="#1C1917" strokeWidth="1.2" strokeLinecap="round" />
            {/* Scout Bandana */}
            <path d="M22 46L32 53L42 46" fill="#10B981" />
            <circle cx="32" cy="49" r="1.5" fill="#ECFDF5" />
            {/* Paws */}
            <circle cx="24" cy="54" r="3" fill="#FFFBEB" />
            <circle cx="40" cy="54" r="3" fill="#FFFBEB" />
          </svg>
        )}

        {petType === 'cat' && (
          // Cipher's Financial Cat "Miso"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="catFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#059669" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
            {/* Cat Tail */}
            <path
              d="M48 48C54 46 58 40 56 34"
              stroke="#047857"
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                animation: isWorking
                  ? 'tailWagFast 0.5s ease-in-out infinite'
                  : 'tailWag 2.5s ease-in-out infinite',
                transformOrigin: '48px 48px',
              }}
            />
            {/* Pointy Cat Ears */}
            <path
              d="M18 16L27 24L16 26Z"
              fill="#047857"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.6s ease-in-out infinite'
                  : 'earWiggle 3.5s ease-in-out infinite',
                transformOrigin: '20px 22px',
              }}
            />
            <path d="M19 19L24 23L17 24Z" fill="#FBCFE8" />
            <path
              d="M46 16L48 26L37 24Z"
              fill="#047857"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.6s ease-in-out infinite 0.3s'
                  : 'earWiggle 3.5s ease-in-out infinite 0.6s',
                transformOrigin: '44px 22px',
              }}
            />
            <path d="M45 19L47 24L40 23Z" fill="#FBCFE8" />
            {/* Head & Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#catFur)" />
            {/* White Chin/Chest */}
            <ellipse cx="32" cy="42" rx="8" ry="7" fill="#F0FDF4" />
            {/* Glowing Emerald Cat Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 2.2s ease-in-out infinite'
                  : 'petBlink 4.5s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <ellipse cx="25" cy="30" rx="3.5" ry="4" fill="#34D399" />
              <ellipse cx="39" cy="30" rx="3.5" ry="4" fill="#34D399" />
              <ellipse cx="25" cy="30" rx="1.2" ry="3.2" fill="#064E3B" />
              <ellipse cx="39" cy="30" rx="1.2" ry="3.2" fill="#064E3B" />
              <circle cx="26" cy="28" r="1" fill="white" />
              <circle cx="40" cy="28" r="1" fill="white" />
            </g>
            {/* Pink Nose */}
            <path d="M31 35L33 35L32 36.5Z" fill="#F472B6" />
            {/* Mouth */}
            <path d="M30 38C31 39 32 39 32 38C32 39 33 39 34 38" stroke="#064E3B" strokeWidth="1" strokeLinecap="round" />
            {/* Whiskers (Twitch fast when calculating!) */}
            <g
              style={{
                animation: isWorking
                  ? 'whiskerFast 0.45s ease-in-out infinite'
                  : 'whiskerTwitch 3s ease-in-out infinite',
              }}
            >
              <line x1="14" y1="36" x2="22" y2="37" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="14" y1="39" x2="22" y2="39" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="50" y1="36" x2="42" y2="37" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="50" y1="39" x2="42" y2="39" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Financial Monocle / Gold Coin */}
            <circle cx="32" cy="49" r="3.5" fill="#FDE047" stroke="#D97706" strokeWidth="1" />
            <path d="M32 47.5V50.5M30.8 48.2H33.2" stroke="#92400E" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        )}

        {petType === 'beaver' && (
          // Lex's Diligent Legal Beaver "Barnaby"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="beaverFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#92400E" />
                <stop offset="1" stopColor="#78350F" />
              </linearGradient>
            </defs>
            {/* Beaver Paddle Tail (Slaps ground when working!) */}
            <ellipse
              cx="48"
              cy="46"
              rx="8"
              ry="4"
              fill="#581C87"
              transform="rotate(20 48 46)"
              style={{
                animation: isWorking ? 'beaverTailSlap 0.4s ease-in-out infinite' : undefined,
                transformOrigin: '48px 46px',
              }}
            />
            {/* Beaver Ears */}
            <circle cx="20" cy="20" r="4.5" fill="#78350F" />
            <circle cx="20" cy="20" r="2.5" fill="#FBCFE8" />
            <circle cx="44" cy="20" r="4.5" fill="#78350F" />
            <circle cx="44" cy="20" r="2.5" fill="#FBCFE8" />
            {/* Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#beaverFur)" />
            {/* Cream Chest */}
            <ellipse cx="32" cy="42" rx="9" ry="8" fill="#FEF3C7" />
            {/* Spectacles */}
            <g>
              <circle cx="26" cy="29" r="5" stroke="#38BDF8" strokeWidth="1.2" fill="#E0F2FE" fillOpacity="0.4" />
              <circle cx="38" cy="29" r="5" stroke="#38BDF8" strokeWidth="1.2" fill="#E0F2FE" fillOpacity="0.4" />
              <line x1="31" y1="29" x2="33" y2="29" stroke="#38BDF8" strokeWidth="1.2" />
            </g>
            {/* Blinking Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.9s ease-in-out infinite'
                  : 'petBlink 3.6s ease-in-out infinite',
                transformOrigin: '32px 29px',
              }}
            >
              <circle cx="26" cy="29" r="2.5" fill="#1C1917" />
              <circle cx="38" cy="29" r="2.5" fill="#1C1917" />
              <circle cx="27" cy="28" r="0.8" fill="white" />
              <circle cx="39" cy="28" r="0.8" fill="white" />
            </g>
            {/* Nose & Teeth */}
            <ellipse cx="32" cy="34" rx="2.5" ry="2" fill="#451A03" />
            <rect x="30" y="37" width="2" height="3" rx="0.5" fill="white" stroke="#E2E8F0" strokeWidth="0.5" />
            <rect x="32" y="37" width="2" height="3" rx="0.5" fill="white" stroke="#E2E8F0" strokeWidth="0.5" />
            <path d="M28 44L32 46L36 44L36 47L32 46L28 47Z" fill="#3B82F6" />
          </svg>
        )}

        {petType === 'bunny' && (
          // Custom / Spawned Scribe's Quantum Bunny "Nova"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bunnyFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EC4899" />
                <stop offset="1" stopColor="#BE185D" />
              </linearGradient>
            </defs>
            {/* Long Bouncing Bunny Ears */}
            <g
              style={{
                animation: isWorking
                  ? 'bunnyEarBounce 0.45s ease-in-out infinite'
                  : 'earWiggle 3s ease-in-out infinite',
                transformOrigin: '23px 22px',
              }}
            >
              <ellipse cx="23" cy="12" rx="4" ry="10" fill="#BE185D" />
              <ellipse cx="23" cy="12" rx="2" ry="7" fill="#FCE7F3" />
            </g>
            <g
              style={{
                animation: isWorking
                  ? 'bunnyEarBounce 0.45s ease-in-out infinite 0.2s'
                  : 'earWiggle 3s ease-in-out infinite 0.5s',
                transformOrigin: '41px 22px',
              }}
            >
              <ellipse cx="41" cy="12" rx="4" ry="10" fill="#BE185D" />
              <ellipse cx="41" cy="12" rx="2" ry="7" fill="#FCE7F3" />
            </g>
            {/* Fluffy Round Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#bunnyFur)" />
            <ellipse cx="32" cy="40" rx="9" ry="8" fill="#FDF2F8" />
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.6s ease-in-out infinite'
                  : 'petBlink 4s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <circle cx="25" cy="30" r="3.5" fill="#18181B" />
              <circle cx="39" cy="30" r="3.5" fill="#18181B" />
              <circle cx="26.5" cy="28.5" r="1.5" fill="white" />
              <circle cx="40.5" cy="28.5" r="1.5" fill="white" />
              <circle cx="24" cy="31.5" r="0.6" fill="white" />
              <circle cx="38" cy="31.5" r="0.6" fill="white" />
            </g>
            <circle cx="20" cy="34" r="2.5" fill="#FDA4AF" fillOpacity="0.8" />
            <circle cx="44" cy="34" r="2.5" fill="#FDA4AF" fillOpacity="0.8" />
            <path d="M31 34L33 34L32 35.5M32 35.5C31.5 36.5 30.5 36.5 30 36M32 35.5C32.5 36.5 33.5 36.5 34 36" stroke="#831843" strokeWidth="1" strokeLinecap="round" />
            <circle cx="25" cy="48" r="2.5" fill="#FDF2F8" />
            <circle cx="39" cy="48" r="2.5" fill="#FDF2F8" />
          </svg>
        )}

        {petType === 'fox' && (
          // Market Comp Fox "Rusty"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="foxFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EA580C" />
                <stop offset="1" stopColor="#C2410C" />
              </linearGradient>
            </defs>
            {/* Bushy Fox Tail with White Tip */}
            <g
              style={{
                animation: isWorking
                  ? 'foxTailSwish 0.35s ease-in-out infinite'
                  : 'tailWag 2.2s ease-in-out infinite',
                transformOrigin: '48px 44px',
              }}
            >
              <path d="M46 44C54 42 59 34 56 26C53 22 48 24 46 28" stroke="#C2410C" strokeWidth="6" strokeLinecap="round" />
              <path d="M56 26C54 23 50 25 48 28" stroke="#FFF7ED" strokeWidth="4" strokeLinecap="round" />
            </g>
            {/* Triangular Black-Tipped Fox Ears */}
            <path
              d="M17 14L27 24L15 26Z"
              fill="#1C1917"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite'
                  : 'earWiggle 3.4s ease-in-out infinite',
                transformOrigin: '20px 22px',
              }}
            />
            <path d="M19 18L25 24L17 25Z" fill="#FFF7ED" />
            <path
              d="M47 14L49 26L37 24Z"
              fill="#1C1917"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite 0.25s'
                  : 'earWiggle 3.4s ease-in-out infinite 0.5s',
                transformOrigin: '44px 22px',
              }}
            />
            <path d="M45 18L47 25L39 24Z" fill="#FFF7ED" />
            {/* Head & Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#foxFur)" />
            {/* White Fox Cheek Fluffs & Bib */}
            <path d="M17 34C20 38 24 40 32 40C40 40 44 38 47 34C46 44 40 50 32 50C24 50 18 44 17 34Z" fill="#FFF7ED" />
            {/* Keen Golden Fox Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <ellipse cx="25" cy="30" rx="3.5" ry="3" fill="#D97706" />
              <ellipse cx="39" cy="30" rx="3.5" ry="3" fill="#D97706" />
              <ellipse cx="25" cy="30" rx="1.5" ry="2.8" fill="#1C1917" />
              <ellipse cx="39" cy="30" rx="1.5" ry="2.8" fill="#1C1917" />
              <circle cx="26" cy="28.5" r="0.9" fill="white" />
              <circle cx="40" cy="28.5" r="0.9" fill="white" />
            </g>
            {/* Cute Black Snout */}
            <ellipse cx="32" cy="36" rx="2.4" ry="1.8" fill="#1C1917" />
            <path d="M30 38C31 39 32 39 32 38C32 39 33 39 34 38" stroke="#1C1917" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}

        {petType === 'bear' && (
          // Vault Grizzly Bear "Bruno"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bearFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#78350F" />
                <stop offset="1" stopColor="#451A03" />
              </linearGradient>
            </defs>
            {/* Round Bear Ears */}
            <circle cx="20" cy="18" r="5.5" fill="#451A03" />
            <circle cx="20" cy="18" r="3" fill="#D97706" />
            <circle cx="44" cy="18" r="5.5" fill="#451A03" />
            <circle cx="44" cy="18" r="3" fill="#D97706" />
            {/* Large Sturdy Body */}
            <rect x="14" y="18" width="36" height="38" rx="18" fill="url(#bearFur)" />
            {/* Honey Gold Snout Area */}
            <ellipse cx="32" cy="38" rx="10" ry="8" fill="#FEF3C7" />
            {/* Black Nose */}
            <ellipse cx="32" cy="35" rx="3.5" ry="2.5" fill="#1C1917" />
            <path d="M30 38.5C31 40 32 40 32 38.5C32 40 33 40 34 38.5" stroke="#1C1917" strokeWidth="1.2" strokeLinecap="round" />
            {/* Warm Friendly Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 2s ease-in-out infinite'
                  : 'petBlink 4s ease-in-out infinite',
                transformOrigin: '32px 28px',
              }}
            >
              <circle cx="24" cy="27" r="3" fill="#1C1917" />
              <circle cx="40" cy="27" r="3" fill="#1C1917" />
              <circle cx="25" cy="26" r="1" fill="white" />
              <circle cx="41" cy="26" r="1" fill="white" />
            </g>
            {/* Honeycomb Vault Shield Medallion */}
            <circle cx="32" cy="49" r="3.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
            <path d="M32 47L34 49L32 51L30 49Z" fill="#FFFBEB" />
          </svg>
        )}

        {petType === 'otter' && (
          // Tax Shield River Otter "Ollie"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="otterFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0891B2" />
                <stop offset="1" stopColor="#0E7490" />
              </linearGradient>
            </defs>
            {/* Otter Swimming Tail */}
            <path
              d="M48 46C54 44 57 38 55 32"
              stroke="#0E7490"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                animation: isWorking
                  ? 'tailWagFast 0.4s ease-in-out infinite'
                  : 'tailWag 2s ease-in-out infinite',
                transformOrigin: '48px 46px',
              }}
            />
            {/* Small Rounded Otter Ears */}
            <circle cx="19" cy="22" r="3.5" fill="#0E7490" />
            <circle cx="19" cy="22" r="1.8" fill="#CFFAFE" />
            <circle cx="45" cy="22" r="3.5" fill="#0E7490" />
            <circle cx="45" cy="22" r="1.8" fill="#CFFAFE" />
            {/* Sleek Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#otterFur)" />
            {/* Cream Chest Patch */}
            <ellipse cx="32" cy="40" rx="9" ry="8" fill="#ECFEFF" />
            {/* Big Curious Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.7s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <circle cx="25" cy="30" r="3.2" fill="#155E75" />
              <circle cx="39" cy="30" r="3.2" fill="#155E75" />
              <circle cx="26" cy="29" r="1.1" fill="white" />
              <circle cx="40" cy="29" r="1.1" fill="white" />
            </g>
            {/* Button Nose & Whiskers */}
            <ellipse cx="32" cy="35" rx="2.5" ry="1.8" fill="#164E63" />
            <line x1="16" y1="36" x2="23" y2="37" stroke="#A5F3FC" strokeWidth="1" strokeLinecap="round" />
            <line x1="16" y1="38" x2="23" y2="38" stroke="#A5F3FC" strokeWidth="1" strokeLinecap="round" />
            <line x1="48" y1="36" x2="41" y2="37" stroke="#A5F3FC" strokeWidth="1" strokeLinecap="round" />
            <line x1="48" y1="38" x2="41" y2="38" stroke="#A5F3FC" strokeWidth="1" strokeLinecap="round" />
            {/* River Pebble Token */}
            <circle cx="32" cy="47" r="3" fill="#67E8F9" stroke="#0891B2" strokeWidth="1" />
          </svg>
        )}

        {petType === 'hedgehog' && (
          // Risk Shield Hedgehog "Spike"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hedgeQuills" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
            {/* Quills Crown (Bristles when working) */}
            <g
              style={{
                animation: isWorking ? 'hedgehogBristle 0.4s ease-in-out infinite' : undefined,
                transformOrigin: '32px 32px',
              }}
            >
              <path d="M16 18L20 12L24 19L30 11L34 19L40 12L44 18L50 14L48 24L53 28L47 34L53 40L46 44" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M16 18L13 24L18 28L12 34L18 40L13 44" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
            {/* Main Rounded Hedgehog Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#hedgeQuills)" />
            {/* Soft Peach Face Area */}
            <ellipse cx="32" cy="38" rx="10" ry="9" fill="#FFF1F2" />
            {/* Cute Rosy Cheeks */}
            <circle cx="23" cy="39" r="2" fill="#FDA4AF" />
            <circle cx="41" cy="39" r="2" fill="#FDA4AF" />
            {/* Shiny Black Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 4s ease-in-out infinite',
                transformOrigin: '32px 32px',
              }}
            >
              <circle cx="26" cy="32" r="2.8" fill="#1C1917" />
              <circle cx="38" cy="32" r="2.8" fill="#1C1917" />
              <circle cx="27" cy="31" r="1" fill="white" />
              <circle cx="39" cy="31" r="1" fill="white" />
            </g>
            {/* Little Pointy Snout */}
            <circle cx="32" cy="36" r="2" fill="#9F1239" />
          </svg>
        )}

        {petType === 'dragon' && (
          // Sovereign Deal Dragon "Draco"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dragonScales" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
            {/* Bat Wings (Flap when working!) */}
            <path
              d="M16 26C10 20 8 32 14 38C15 32 16 28 16 26Z"
              fill="#059669"
              stroke="#047857"
              strokeWidth="1.5"
              style={{
                animation: isWorking ? 'dragonWingFlap 0.35s ease-in-out infinite' : undefined,
                transformOrigin: '16px 28px',
              }}
            />
            <path
              d="M48 26C54 20 56 32 50 38C49 32 48 28 48 26Z"
              fill="#059669"
              stroke="#047857"
              strokeWidth="1.5"
              style={{
                animation: isWorking ? 'dragonWingFlapRight 0.35s ease-in-out infinite' : undefined,
                transformOrigin: '48px 28px',
              }}
            />
            {/* Dragon Horns */}
            <path d="M22 14L26 22L20 20Z" fill="#F59E0B" />
            <path d="M42 14L44 20L38 22Z" fill="#F59E0B" />
            {/* Dragon Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#dragonScales)" />
            {/* Golden Belly Plates */}
            <ellipse cx="32" cy="42" rx="8" ry="7" fill="#FEF3C7" />
            <line x1="26" y1="39" x2="38" y2="39" stroke="#D97706" strokeWidth="1" />
            <line x1="26" y1="43" x2="38" y2="43" stroke="#D97706" strokeWidth="1" />
            {/* Blinking Fierce Golden Dragon Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 2s ease-in-out infinite'
                  : 'petBlink 4s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <ellipse cx="25" cy="30" rx="3.5" ry="4" fill="#FDE047" />
              <ellipse cx="39" cy="30" rx="3.5" ry="4" fill="#FDE047" />
              <ellipse cx="25" cy="30" rx="1.2" ry="3.5" fill="#064E3B" />
              <ellipse cx="39" cy="30" rx="1.2" ry="3.5" fill="#064E3B" />
              <circle cx="26" cy="28.5" r="0.8" fill="white" />
              <circle cx="40" cy="28.5" r="0.8" fill="white" />
            </g>
            {/* Tiny Nostrils with Flame Spark */}
            <circle cx="30" cy="35" r="0.8" fill="#064E3B" />
            <circle cx="34" cy="35" r="0.8" fill="#064E3B" />
            <circle cx="32" cy="36.5" r="1.5" fill="#EF4444" style={{ animation: 'visorPulse 0.8s ease-in-out infinite' }} />
          </svg>
        )}

        {petType === 'wolf' && (
          // Night Radar Wolf "Kona"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wolfFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#475569" />
                <stop offset="1" stopColor="#1E293B" />
              </linearGradient>
            </defs>
            {/* Pointed Alert Wolf Ears */}
            <path
              d="M18 14L27 24L15 25Z"
              fill="#1E293B"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite'
                  : 'earWiggle 3.2s ease-in-out infinite',
                transformOrigin: '20px 22px',
              }}
            />
            <path d="M19 17L25 23L17 24Z" fill="#E2E8F0" />
            <path
              d="M46 14L49 25L37 24Z"
              fill="#1E293B"
              style={{
                animation: isWorking
                  ? 'earWiggleFast 0.5s ease-in-out infinite 0.25s'
                  : 'earWiggle 3.2s ease-in-out infinite 0.5s',
                transformOrigin: '44px 22px',
              }}
            />
            <path d="M45 17L47 24L39 23Z" fill="#E2E8F0" />
            {/* Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#wolfFur)" />
            {/* White Neck Ruff */}
            <path d="M22 36C26 40 32 42 32 42C32 42 38 40 42 36C40 46 36 50 32 50C28 50 24 46 22 36Z" fill="#F8FAFC" />
            {/* Starry Sapphire Wolf Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <circle cx="25" cy="30" r="3.2" fill="#38BDF8" />
              <circle cx="39" cy="30" r="3.2" fill="#38BDF8" />
              <circle cx="25" cy="30" r="1.5" fill="#0F172A" />
              <circle cx="39" cy="30" r="1.5" fill="#0F172A" />
              <circle cx="26" cy="29" r="0.9" fill="white" />
              <circle cx="40" cy="29" r="0.9" fill="white" />
            </g>
            <ellipse cx="32" cy="35" rx="2.5" ry="1.8" fill="#0F172A" />
          </svg>
        )}

        {petType === 'raccoon' && (
          // Audit Sleuth Raccoon "Bandit"
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="raccoonFur" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#64748B" />
                <stop offset="1" stopColor="#334155" />
              </linearGradient>
            </defs>
            {/* Striped Ringed Tail */}
            <g
              style={{
                animation: isWorking
                  ? 'tailWagFast 0.4s ease-in-out infinite'
                  : 'tailWag 2s ease-in-out infinite',
                transformOrigin: '48px 44px',
              }}
            >
              <path d="M48 44C54 42 58 36 56 30" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
              <circle cx="51" cy="40" r="2" fill="#F1F5F9" />
              <circle cx="55" cy="34" r="2" fill="#F1F5F9" />
            </g>
            {/* Ears with White Rim */}
            <circle cx="20" cy="20" r="4.5" fill="#334155" />
            <circle cx="20" cy="20" r="2.5" fill="#F1F5F9" />
            <circle cx="44" cy="20" r="4.5" fill="#334155" />
            <circle cx="44" cy="20" r="2.5" fill="#F1F5F9" />
            {/* Body */}
            <rect x="16" y="20" width="32" height="34" rx="16" fill="url(#raccoonFur)" />
            {/* Robber Eye Mask */}
            <path d="M18 29C21 27 28 27 32 30C36 27 43 27 46 29C46 34 38 35 32 32C26 35 18 34 18 29Z" fill="#0F172A" />
            {/* Eyes in Mask */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 30px',
              }}
            >
              <circle cx="25" cy="30" r="2.8" fill="#F8FAFC" />
              <circle cx="39" cy="30" r="2.8" fill="#F8FAFC" />
              <circle cx="25" cy="30" r="1.5" fill="#0F172A" />
              <circle cx="39" cy="30" r="1.5" fill="#0F172A" />
              <circle cx="25.8" cy="29.2" r="0.6" fill="white" />
              <circle cx="39.8" cy="29.2" r="0.6" fill="white" />
            </g>
            {/* White Muzzle & Snout */}
            <ellipse cx="32" cy="37" rx="6" ry="4.5" fill="#F8FAFC" />
            <ellipse cx="32" cy="35" rx="2" ry="1.5" fill="#0F172A" />
          </svg>
        )}

        {petType === 'lion' && (
          // Leo the Capital Pride Lion
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lionMane" cx="32" cy="32" r="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#B45309" />
              </radialGradient>
              <linearGradient id="lionFace" x1="20" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FCD34D" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Mane */}
            <circle cx="32" cy="33" r="23" fill="url(#lionMane)" />
            {/* Crown / Tufts */}
            <path d="M26 12L32 16L38 12L36 18L32 17L28 18Z" fill="#FBBF24" />
            {/* Ears */}
            <circle cx="18" cy="22" r="5" fill="#B45309" />
            <circle cx="18" cy="22" r="2.5" fill="#FDE68A" />
            <circle cx="46" cy="22" r="5" fill="#B45309" />
            <circle cx="46" cy="22" r="2.5" fill="#FDE68A" />
            {/* Face */}
            <circle cx="32" cy="35" r="15" fill="url(#lionFace)" />
            {/* Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 34px',
              }}
            >
              <ellipse cx="26" cy="33" rx="2.5" ry="3" fill="#78350F" />
              <ellipse cx="38" cy="33" rx="2.5" ry="3" fill="#78350F" />
              <circle cx="27" cy="32" r="0.8" fill="white" />
              <circle cx="39" cy="32" r="0.8" fill="white" />
            </g>
            {/* Muzzle */}
            <ellipse cx="32" cy="40" rx="5" ry="3.5" fill="#FEF3C7" />
            <polygon points="30,38 34,38 32,41" fill="#78350F" />
          </svg>
        )}

        {petType === 'eagle' && (
          // Talon the Viewshed Recon Eagle
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="eagleBody" x1="16" y1="18" x2="48" y2="54" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            {/* Wings */}
            <path
              d="M16 28C10 24 6 32 10 40C12 36 15 34 18 34Z"
              fill="#1E40AF"
              style={{
                animation: isWorking ? 'owlWingFlap 0.5s ease-in-out infinite' : 'owlWingFlap 3s ease-in-out infinite',
                transformOrigin: '18px 34px',
              }}
            />
            <path
              d="M48 28C54 24 58 32 54 40C52 36 49 34 46 34Z"
              fill="#1E40AF"
              style={{
                animation: isWorking ? 'owlWingFlapRight 0.5s ease-in-out infinite' : 'owlWingFlapRight 3s ease-in-out infinite',
                transformOrigin: '46px 34px',
              }}
            />
            {/* Head Feathers Crest */}
            <path d="M28 12L32 17L36 12L34 19L30 19Z" fill="#F8FAFC" />
            {/* Body */}
            <ellipse cx="32" cy="36" rx="15" ry="17" fill="url(#eagleBody)" />
            {/* White Hood / Head */}
            <path d="M20 28C20 20 25 15 32 15C39 15 44 20 44 28C44 33 39 36 32 36C25 36 20 33 20 28Z" fill="#F8FAFC" />
            {/* Sharp Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.5s ease-in-out infinite'
                  : 'petBlink 4s ease-in-out infinite',
                transformOrigin: '32px 26px',
              }}
            >
              <polygon points="24,24 29,26 25,28" fill="#F59E0B" />
              <polygon points="40,24 35,26 39,28" fill="#F59E0B" />
              <circle cx="26.5" cy="26" r="1.3" fill="#0F172A" />
              <circle cx="37.5" cy="26" r="1.3" fill="#0F172A" />
            </g>
            {/* Hooked Beak */}
            <path d="M30 28H34L32 35Z" fill="#F59E0B" />
          </svg>
        )}

        {petType === 'koala' && (
          // Koko the Risk Sentinel Koala
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="koalaFur" x1="16" y1="16" x2="48" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#94A3B8" />
                <stop offset="1" stopColor="#64748B" />
              </linearGradient>
            </defs>
            {/* Large Fluffy Ears */}
            <circle cx="14" cy="24" r="9" fill="#94A3B8" />
            <circle cx="14" cy="24" r="5.5" fill="#F1F5F9" />
            <circle cx="50" cy="24" r="9" fill="#94A3B8" />
            <circle cx="50" cy="24" r="5.5" fill="#F1F5F9" />
            {/* Head */}
            <circle cx="32" cy="34" r="16" fill="url(#koalaFur)" />
            {/* Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 32px',
              }}
            >
              <circle cx="24" cy="32" r="2.2" fill="#1E293B" />
              <circle cx="40" cy="32" r="2.2" fill="#1E293B" />
              <circle cx="24.8" cy="31.2" r="0.8" fill="white" />
              <circle cx="40.8" cy="31.2" r="0.8" fill="white" />
            </g>
            {/* Big Black Koala Nose */}
            <ellipse cx="32" cy="37" rx="4.5" ry="6" fill="#0F172A" />
            <ellipse cx="32" cy="35" rx="1.5" ry="2" fill="#334155" opacity="0.6" />
          </svg>
        )}

        {petType === 'panda' && (
          // Bao the Balance Sheet Panda
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Black Ears */}
            <circle cx="18" cy="18" r="6" fill="#0F172A" />
            <circle cx="46" cy="18" r="6" fill="#0F172A" />
            {/* White Head */}
            <circle cx="32" cy="34" r="17" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            {/* Eye Patches */}
            <ellipse cx="24" cy="32" rx="4.5" ry="5.5" transform="rotate(-15 24 32)" fill="#0F172A" />
            <ellipse cx="40" cy="32" rx="4.5" ry="5.5" transform="rotate(15 40 32)" fill="#0F172A" />
            {/* Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 32px',
              }}
            >
              <circle cx="25" cy="32" r="1.8" fill="white" />
              <circle cx="39" cy="32" r="1.8" fill="white" />
              <circle cx="25" cy="32" r="1" fill="#0F172A" />
              <circle cx="39" cy="32" r="1" fill="#0F172A" />
            </g>
            {/* Cute Nose */}
            <ellipse cx="32" cy="40" rx="2.5" ry="1.8" fill="#0F172A" />
          </svg>
        )}

        {petType === 'tiger' && (
          // Rory the Apex Underwriter Tiger
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tigerCoat" x1="16" y1="16" x2="48" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F97316" />
                <stop offset="1" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            {/* Ears */}
            <circle cx="18" cy="20" r="5" fill="#EA580C" />
            <circle cx="18" cy="20" r="2.5" fill="#FEF08A" />
            <circle cx="46" cy="20" r="5" fill="#EA580C" />
            <circle cx="46" cy="20" r="2.5" fill="#FEF08A" />
            {/* Head */}
            <circle cx="32" cy="34" r="16" fill="url(#tigerCoat)" />
            {/* Tiger Stripes */}
            <path d="M30 18L32 23L34 18" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M19 28L24 30" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M45 28L40 30" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            {/* Eyes */}
            <g
              style={{
                animation: isWorking
                  ? 'petRapidBlink 1.8s ease-in-out infinite'
                  : 'petBlink 3.8s ease-in-out infinite',
                transformOrigin: '32px 32px',
              }}
            >
              <ellipse cx="25" cy="32" rx="2.5" ry="3" fill="#FEF08A" />
              <ellipse cx="39" cy="32" rx="2.5" ry="3" fill="#FEF08A" />
              <ellipse cx="25" cy="32" rx="1.2" ry="2.2" fill="#09090B" />
              <ellipse cx="39" cy="32" rx="1.2" ry="2.2" fill="#09090B" />
            </g>
            {/* Muzzle */}
            <ellipse cx="32" cy="40" rx="5" ry="3.5" fill="#FFFBEB" />
            <polygon points="30,38 34,38 32,41" fill="#EA580C" />
          </svg>
        )}

        {petType === 'dolphin' && (
          // Echo the ADR Wave Dolphin
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dolphinBody" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            {/* Dorsal Fin */}
            <path d="M30 14C33 10 38 12 36 22Z" fill="#0284C7" />
            {/* Streamlined Body */}
            <path d="M12 36C14 26 24 20 36 20C48 20 54 28 52 38C48 46 32 46 22 44C16 42 12 38 12 36Z" fill="url(#dolphinBody)" />
            {/* White Belly */}
            <path d="M18 38C24 38 34 38 46 36C40 43 28 43 18 38Z" fill="#E0F2FE" />
            {/* Playful Eye */}
            <circle cx="44" cy="27" r="2.2" fill="#0C4A6E" />
            <circle cx="44.6" cy="26.4" r="0.8" fill="white" />
            {/* Snout */}
            <path d="M49 28C55 30 54 34 50 34Z" fill="#0284C7" />
          </svg>
        )}

        {petType === 'penguin' && (
          // Pippin the Iceberg Escrow Penguin
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <ellipse cx="32" cy="35" rx="16" ry="19" fill="#0F172A" />
            {/* White Chest */}
            <ellipse cx="32" cy="37" rx="11" ry="14" fill="#F8FAFC" />
            {/* Wings */}
            <ellipse cx="14" cy="35" rx="3.5" ry="9" transform="rotate(15 14 35)" fill="#1E293B" />
            <ellipse cx="50" cy="35" rx="3.5" ry="9" transform="rotate(-15 50 35)" fill="#1E293B" />
            {/* Eyes */}
            <circle cx="26" cy="25" r="2.2" fill="#0F172A" />
            <circle cx="38" cy="25" r="2.2" fill="#0F172A" />
            <circle cx="26.6" cy="24.4" r="0.8" fill="white" />
            <circle cx="38.6" cy="24.4" r="0.8" fill="white" />
            {/* Orange Beak */}
            <polygon points="29,28 35,28 32,33" fill="#F97316" />
            {/* Feet */}
            <ellipse cx="26" cy="52" rx="4" ry="2" fill="#F97316" />
            <ellipse cx="38" cy="52" rx="4" ry="2" fill="#F97316" />
          </svg>
        )}

        {/* ======================================================== */}
        {/* UNIQUE CYBER & SHAPE PET COMPANIONS                       */}
        {/* ======================================================== */}

        {petType === 'quantum-dots' && (
          // Dotsy: Quantum Orbit Dots (Floating cluster of orbital glowing nodes)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orbitGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            {/* Soft Ambient Field */}
            <circle cx="32" cy="32" r="22" fill="#06B6D4" fillOpacity="0.08" />
            {/* Orbital Ring 1 */}
            <ellipse cx="32" cy="32" rx="18" ry="8" stroke="#06B6D4" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" transform="rotate(-25 32 32)" />
            {/* Orbital Ring 2 */}
            <ellipse cx="32" cy="32" rx="18" ry="8" stroke="#3B82F6" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" transform="rotate(45 32 32)" />
            {/* Central Pulse Nucleus */}
            <circle cx="32" cy="32" r="6" fill="url(#orbitGrad)" style={{ animation: 'pulseOrb 1.6s ease-in-out infinite' }} />
            <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
            {/* Orbiting Quantum Satellite Dots */}
            <g style={{ animation: isWorking ? 'orbitDots 1.8s linear infinite' : 'orbitDots 5s linear infinite', transformOrigin: '32px 32px' }}>
              <circle cx="32" cy="14" r="3.2" fill="#06B6D4" />
              <circle cx="32" cy="14" r="1.2" fill="#FFFFFF" />
              <circle cx="50" cy="32" r="2.8" fill="#3B82F6" />
              <circle cx="50" cy="32" r="1" fill="#FFFFFF" />
              <circle cx="32" cy="50" r="3.2" fill="#06B6D4" />
              <circle cx="32" cy="50" r="1.2" fill="#FFFFFF" />
              <circle cx="14" cy="32" r="2.8" fill="#3B82F6" />
              <circle cx="14" cy="32" r="1" fill="#FFFFFF" />
            </g>
            <g style={{ animation: isWorking ? 'orbitDotsReverse 2.4s linear infinite' : 'orbitDotsReverse 7s linear infinite', transformOrigin: '32px 32px' }}>
              <circle cx="20" cy="20" r="2" fill="#A855F7" />
              <circle cx="44" cy="44" r="2" fill="#A855F7" />
            </g>
          </svg>
        )}

        {petType === 'cyber-bot' && (
          // Byte: Prism Bot Automaton (Minimalist faceted robot with LED visor)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="botChassis" x1="16" y1="16" x2="48" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#334155" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="visorGlow" x1="20" y1="30" x2="44" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            {/* Top Antenna Node */}
            <line x1="32" y1="10" x2="32" y2="18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="10" r="3" fill="#F59E0B" style={{ animation: 'pulseOrb 1.4s ease-in-out infinite' }} />
            {/* Side Ear Servos */}
            <rect x="12" y="27" width="4" height="10" rx="2" fill="#64748B" />
            <rect x="48" y="27" width="4" height="10" rx="2" fill="#64748B" />
            {/* Beveled Head Shell */}
            <rect x="16" y="18" width="32" height="30" rx="8" fill="url(#botChassis)" stroke="#475569" strokeWidth="1.5" />
            {/* Expressive Panoramic Cyan Visor */}
            <rect x="20" y="27" width="24" height="8" rx="4" fill="#0B132B" stroke="#1E293B" strokeWidth="1" />
            <rect
              x="23"
              y="29"
              width="18"
              height="4"
              rx="2"
              fill="url(#visorGlow)"
              style={{ animation: isWorking ? 'botVisorScan 0.8s ease-in-out infinite' : 'botVisorScan 2.5s ease-in-out infinite' }}
            />
            {/* Lower Cheek Status LEDs */}
            <circle cx="24" cy="41" r="1.5" fill="#10B981" />
            <circle cx="29" cy="41" r="1.5" fill="#3B82F6" />
            <circle cx="34" cy="41" r="1.5" fill="#6366F1" />
            <circle cx="39" cy="41" r="1.5" fill="#EC4899" />
          </svg>
        )}

        {petType === 'tesseract' && (
          // Tess: Isometric Hypercube (Rotating 3D wireframe geometric core)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tessEdge" x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D97706" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <g style={{ animation: isWorking ? 'cubeFloat 1.2s ease-in-out infinite' : 'cubeFloat 3.5s ease-in-out infinite', transformOrigin: '32px 32px' }}>
              {/* Outer Isometric Hexagon Prism */}
              <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="#D97706" fillOpacity="0.12" stroke="url(#tessEdge)" strokeWidth="1.8" strokeLinejoin="round" />
              {/* Internal Isometric Edges */}
              <line x1="32" y1="32" x2="32" y2="52" stroke="#D97706" strokeWidth="1.5" />
              <line x1="32" y1="32" x2="50" y2="22" stroke="#D97706" strokeWidth="1.5" />
              <line x1="32" y1="32" x2="14" y2="22" stroke="#D97706" strokeWidth="1.5" />
              {/* Inner Floating Tesseract Energy Sphere */}
              <circle cx="32" cy="32" r="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" style={{ animation: 'pulseOrb 1.5s ease-in-out infinite' }} />
              {/* Vertex Nodes */}
              <circle cx="32" cy="12" r="2" fill="#FBBF24" />
              <circle cx="50" cy="22" r="2" fill="#FBBF24" />
              <circle cx="50" cy="42" r="2" fill="#FBBF24" />
              <circle cx="32" cy="52" r="2" fill="#FBBF24" />
              <circle cx="14" cy="42" r="2" fill="#FBBF24" />
              <circle cx="14" cy="22" r="2" fill="#FBBF24" />
            </g>
          </svg>
        )}

        {petType === 'pulse-core' && (
          // Aura: Luminescent Pulse Orb (Concentric glowing energy orbital rings)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="auraGlow" cx="32" cy="32" r="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="0.6" stopColor="#6D28D9" />
                <stop offset="1" stopColor="#4C1D95" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Outer Energy Pulse Ring */}
            <circle cx="32" cy="32" r="22" stroke="#A78BFA" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="4 2" />
            <circle cx="32" cy="32" r="16" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.7" />
            {/* Floating Orbital Particle */}
            <g style={{ animation: 'orbitDots 3.2s linear infinite', transformOrigin: '32px 32px' }}>
              <circle cx="32" cy="16" r="2" fill="#C4B5FD" />
              <circle cx="48" cy="32" r="1.5" fill="#C4B5FD" />
            </g>
            {/* Center Core */}
            <circle cx="32" cy="32" r="11" fill="url(#auraGlow)" style={{ animation: 'pulseOrb 1.6s ease-in-out infinite' }} />
            <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" />
          </svg>
        )}

        {petType === 'delta-prism' && (
          // Vector: Refractive Delta Prism (Hovering light-splitting prism)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="deltaPrism" x1="18" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
            </defs>
            <g style={{ animation: 'deltaPrismHover 3s ease-in-out infinite', transformOrigin: '32px 32px' }}>
              {/* Refractive Triangle Facets */}
              <polygon points="32,14 50,46 14,46" fill="url(#deltaPrism)" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinejoin="round" />
              <polygon points="32,14 32,46 14,46" fill="#10B981" fillOpacity="0.4" />
              <line x1="32" y1="14" x2="32" y2="46" stroke="#34D399" strokeWidth="1.5" />
              {/* Core Refraction Gem */}
              <polygon points="32,24 40,40 24,40" fill="#34D399" fillOpacity="0.7" />
              <circle cx="32" cy="32" r="2.5" fill="#FFFFFF" />
            </g>
          </svg>
        )}

        {petType === 'hex-shield' && (
          // Aegis: Honeycomb Hex Droid (Futuristic cyber sentinel with pulsing honeycomb aperture)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hexChassis" x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E293B" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            {/* Outer Hexagon Shell */}
            <polygon points="32,10 52,22 52,42 32,54 12,42 12,22" fill="url(#hexChassis)" stroke="#06B6D4" strokeWidth="1.8" strokeLinejoin="round" />
            {/* Inner Honeycomb Matrix */}
            <polygon points="32,18 46,26 46,38 32,46 18,38 18,26" fill="#06B6D4" fillOpacity="0.15" stroke="#0891B2" strokeWidth="1" strokeLinejoin="round" />
            {/* Central Glowing Digital Aperture Eye */}
            <circle cx="32" cy="32" r="6" fill="#06B6D4" style={{ animation: 'pulseOrb 1.3s ease-in-out infinite' }} />
            <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
            {/* Satellite Vertex Glows */}
            <circle cx="32" cy="10" r="1.8" fill="#38BDF8" />
            <circle cx="52" cy="22" r="1.8" fill="#38BDF8" />
            <circle cx="52" cy="42" r="1.8" fill="#38BDF8" />
            <circle cx="32" cy="54" r="1.8" fill="#38BDF8" />
            <circle cx="12" cy="42" r="1.8" fill="#38BDF8" />
            <circle cx="12" cy="22" r="1.8" fill="#38BDF8" />
          </svg>
        )}

        {petType === 'chrono-gyro' && (
          // Chrono: Temporal Gyroscope Droid (Multi-axis kinetic rings with chronometer core)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Gimbal Ring */}
            <circle cx="32" cy="32" r="22" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Middle Rotating Axis Ring */}
            <ellipse cx="32" cy="32" rx="20" ry="10" stroke="#FBBF24" strokeWidth="1.6" transform="rotate(35 32 32)" />
            <ellipse cx="32" cy="32" rx="20" ry="10" stroke="#FBBF24" strokeWidth="1.6" transform="rotate(-35 32 32)" />
            {/* Inner Energy Core */}
            <circle cx="32" cy="32" r="7" fill="#F59E0B" style={{ animation: 'pulseOrb 1.5s ease-in-out infinite' }} />
            <circle cx="32" cy="32" r="3" fill="#FFFBEB" />
            {/* Node markers */}
            <circle cx="32" cy="10" r="2" fill="#F59E0B" />
            <circle cx="32" cy="54" r="2" fill="#F59E0B" />
            <circle cx="10" cy="32" r="2" fill="#F59E0B" />
            <circle cx="54" cy="32" r="2" fill="#F59E0B" />
          </svg>
        )}

        {petType === 'astro-star' && (
          // Nova-Star: Four-Point Stellar Spark (Radiant geometric diamond star with satellite sparks)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="starGlow" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F43F5E" />
                <stop offset="1" stopColor="#E11D48" />
              </linearGradient>
            </defs>
            <g style={{ animation: 'cubeFloat 2.8s ease-in-out infinite', transformOrigin: '32px 32px' }}>
              {/* Four-Point Geometric Star Polygon */}
              <path d="M32 10L36 28L54 32L36 36L32 54L28 36L10 32L28 28Z" fill="url(#starGlow)" stroke="#FB7185" strokeWidth="1.5" strokeLinejoin="round" />
              {/* Center Radiant Core */}
              <circle cx="32" cy="32" r="4" fill="#FFFFFF" style={{ animation: 'pulseOrb 1.2s ease-in-out infinite' }} />
              {/* Satellite Sparkles */}
              <circle cx="18" cy="18" r="1.5" fill="#FDA4AF" />
              <circle cx="46" cy="18" r="1.5" fill="#FDA4AF" />
              <circle cx="46" cy="46" r="1.5" fill="#FDA4AF" />
              <circle cx="18" cy="46" r="1.5" fill="#FDA4AF" />
            </g>
          </svg>
        )}

        {/* ======================================================== */}
        {/* ADDITIONAL DISTINCT ANIMAL MASCOTS                       */}
        {/* ======================================================== */}

        {petType === 'frog' && (
          // Finley: Liquidity Leap Frog
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Eye Bulges */}
            <circle cx="21" cy="22" r="7" fill="#15803D" />
            <circle cx="43" cy="22" r="7" fill="#15803D" />
            <circle cx="21" cy="22" r="4.5" fill="#FEF08A" />
            <circle cx="43" cy="22" r="4.5" fill="#FEF08A" />
            <ellipse cx="21" cy="22" rx="2" ry="3.5" fill="#052E16" />
            <ellipse cx="43" cy="22" rx="2" ry="3.5" fill="#052E16" />
            <circle cx="21.8" cy="21" r="1" fill="#FFFFFF" />
            <circle cx="43.8" cy="21" r="1" fill="#FFFFFF" />
            {/* Frog Head & Body */}
            <ellipse cx="32" cy="36" rx="19" ry="16" fill="#16A34A" />
            {/* Light Green Belly / Throat */}
            <ellipse cx="32" cy="41" rx="11" ry="8" fill="#BBF7D0" />
            {/* Cute Smile */}
            <path d="M25 36C28 39 36 39 39 36" stroke="#052E16" strokeWidth="1.6" strokeLinecap="round" />
            {/* Nostrils */}
            <circle cx="30" cy="32" r="0.8" fill="#052E16" />
            <circle cx="34" cy="32" r="0.8" fill="#052E16" />
          </svg>
        )}

        {petType === 'octopus' && (
          // Inky: Multi-Asset Octopus
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tentacles */}
            <path d="M16 44C12 48 10 54 14 56C18 54 18 48 20 44" fill="#7C3AED" />
            <path d="M24 46C20 52 22 56 26 56C28 52 26 48 28 46" fill="#8B5CF6" />
            <path d="M32 47C32 54 34 56 38 55C38 50 36 47 36 47" fill="#7C3AED" />
            <path d="M40 46C44 52 42 56 38 56C36 52 38 48 36 46" fill="#8B5CF6" />
            <path d="M48 44C52 48 54 54 50 56C46 54 46 48 44 44" fill="#7C3AED" />
            {/* Head */}
            <ellipse cx="32" cy="30" rx="18" ry="17" fill="#8B5CF6" />
            {/* Big Eyes */}
            <circle cx="25" cy="31" r="4.5" fill="#FFFFFF" />
            <circle cx="39" cy="31" r="4.5" fill="#FFFFFF" />
            <circle cx="26" cy="31" r="2.5" fill="#2E1065" />
            <circle cx="38" cy="31" r="2.5" fill="#2E1065" />
            <circle cx="27" cy="30" r="1" fill="#FFFFFF" />
            <circle cx="39" cy="30" r="1" fill="#FFFFFF" />
          </svg>
        )}

        {petType === 'deer' && (
          // Bramble: Forest Haven Stag
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Antlers */}
            <path d="M22 20L16 12M16 12L12 14M16 12L18 8" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <path d="M42 20L48 12M48 12L52 14M48 12L46 8" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            {/* Ears */}
            <ellipse cx="18" cy="25" rx="5" ry="3" transform="rotate(-30 18 25)" fill="#B45309" />
            <ellipse cx="46" cy="25" rx="5" ry="3" transform="rotate(30 46 25)" fill="#B45309" />
            {/* Head */}
            <polygon points="32,48 20,28 44,28" fill="#D97706" />
            <circle cx="32" cy="30" r="14" fill="#D97706" />
            {/* Gentle Eyes */}
            <circle cx="25" cy="30" r="2.5" fill="#1C1917" />
            <circle cx="39" cy="30" r="2.5" fill="#1C1917" />
            <circle cx="25.8" cy="29.2" r="0.8" fill="#FFFFFF" />
            <circle cx="39.8" cy="29.2" r="0.8" fill="#FFFFFF" />
            {/* Snout */}
            <ellipse cx="32" cy="42" rx="5" ry="3.5" fill="#FEF3C7" />
            <circle cx="32" cy="41" r="1.5" fill="#1C1917" />
          </svg>
        )}

        {petType === 'turtle' && (
          // Shelly: Capital Shield Turtle
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Flippers / Feet */}
            <ellipse cx="16" cy="26" rx="4" ry="7" transform="rotate(-35 16 26)" fill="#15803D" />
            <ellipse cx="48" cy="26" rx="4" ry="7" transform="rotate(35 48 26)" fill="#15803D" />
            <ellipse cx="18" cy="46" rx="3.5" ry="6" transform="rotate(-45 18 46)" fill="#15803D" />
            <ellipse cx="46" cy="46" rx="3.5" ry="6" transform="rotate(45 46 46)" fill="#15803D" />
            {/* Hexagonal Shield Shell */}
            <ellipse cx="32" cy="36" rx="17" ry="15" fill="#166534" stroke="#14532D" strokeWidth="1.5" />
            <polygon points="32,26 40,31 40,41 32,46 24,41 24,31" fill="#15803D" stroke="#14532D" strokeWidth="1" />
            {/* Head */}
            <circle cx="32" cy="19" r="6.5" fill="#22C55E" />
            <circle cx="29" cy="18" r="1.5" fill="#052E16" />
            <circle cx="35" cy="18" r="1.5" fill="#052E16" />
          </svg>
        )}

        {petType === 'elephant' && (
          // Tembo: Institutional Memory Elephant
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Big Flapping Ears */}
            <ellipse cx="14" cy="32" rx="8" ry="12" fill="#64748B" />
            <ellipse cx="50" cy="32" rx="8" ry="12" fill="#64748B" />
            {/* Head */}
            <circle cx="32" cy="32" r="15" fill="#94A3B8" />
            {/* Trunk */}
            <path d="M30 38C30 46 36 48 37 45" stroke="#64748B" strokeWidth="4.5" strokeLinecap="round" />
            {/* Tusks */}
            <path d="M26 40C24 43 22 45 20 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M38 40C40 43 42 45 44 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="25" cy="28" r="2" fill="#0F172A" />
            <circle cx="39" cy="28" r="2" fill="#0F172A" />
            <circle cx="25.6" cy="27.4" r="0.7" fill="#FFFFFF" />
            <circle cx="39.6" cy="27.4" r="0.7" fill="#FFFFFF" />
          </svg>
        )}

        {petType === 'chameleon' && (
          // Karma: Dynamic Rate Chameleon
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chamSkin" x1="16" y1="20" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="0.5" stopColor="#10B981" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Curled Spiral Tail */}
            <path d="M16 42C12 44 10 40 14 36C18 32 18 40 14 42" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="32" cy="36" rx="15" ry="12" fill="url(#chamSkin)" />
            {/* Crest / Casque */}
            <path d="M24 20C28 16 36 16 40 22Z" fill="#06B6D4" />
            {/* Swiveling Bulging Chameleon Eye */}
            <circle cx="38" cy="28" r="6" fill="#10B981" stroke="#047857" strokeWidth="1" />
            <circle cx="38" cy="28" r="3" fill="#FEF08A" />
            <circle cx="39" cy="27" r="1.5" fill="#0F172A" />
            <circle cx="39.5" cy="26.5" r="0.6" fill="#FFFFFF" />
          </svg>
        )}

        {petType === 'whale' && (
          // Bubbles: Oceanic Blue Whale (Cute whale with blowhole water spout)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Water Spout Spray */}
            <path d="M26 14C24 9 18 10 18 13C22 13 24 16 26 18" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M27 15C29 8 36 9 36 13C32 13 30 16 27 18" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="18" cy="10" r="1.2" fill="#7DD3FC" />
            <circle cx="36" cy="10" r="1.2" fill="#7DD3FC" />
            {/* Whale Body */}
            <path d="M12 36C12 26 22 20 36 20C48 20 54 26 54 36C54 44 44 48 30 48C18 48 12 44 12 36Z" fill="#0284C7" />
            {/* Whale Fluke Tail */}
            <path d="M12 36C8 32 4 30 4 36C6 38 10 38 12 37" fill="#0369A1" />
            <path d="M12 36C8 40 4 42 4 36C6 34 10 34 12 35" fill="#0369A1" />
            {/* White/Pale Underbelly */}
            <path d="M18 40C22 46 36 46 48 40C44 46 32 48 22 47Z" fill="#BAE6FD" />
            {/* Cute Whale Eye */}
            <circle cx="42" cy="32" r="3" fill="#FFFFFF" />
            <circle cx="43" cy="32" r="1.8" fill="#0F172A" />
            <circle cx="43.6" cy="31.4" r="0.7" fill="#FFFFFF" />
            {/* Smiling Mouth */}
            <path d="M38 38C42 40 46 39 48 36" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Pectoral Fin */}
            <ellipse cx="28" cy="40" rx="6" ry="3" transform="rotate(20 28 40)" fill="#0369A1" />
          </svg>
        )}

        {petType === 'sloth' && (
          // Snooze: Cozy Slow-Yield Sloth (Peaceful smiling sloth with clinging claws)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cozy Bamboo/Branch */}
            <line x1="8" y1="18" x2="56" y2="18" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="16" r="2.5" fill="#86EFAC" />
            {/* Hanging Sloth Body */}
            <ellipse cx="32" cy="38" rx="16" ry="14" fill="#A8A29E" />
            {/* Round Head */}
            <circle cx="32" cy="30" r="12" fill="#D6D3D1" />
            {/* Distinctive Sloth Eye Mask Stripe */}
            <ellipse cx="26" cy="30" rx="4.5" ry="3" transform="rotate(-15 26 30)" fill="#78716C" />
            <ellipse cx="38" cy="30" rx="4.5" ry="3" transform="rotate(15 38 30)" fill="#78716C" />
            {/* Peaceful Sleeping Eyes */}
            <path d="M24 30C26 32 28 32 30 30" stroke="#1C1917" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M34 30C36 32 38 32 40 30" stroke="#1C1917" strokeWidth="1.4" strokeLinecap="round" />
            {/* Dark Sloth Snout & Smile */}
            <ellipse cx="32" cy="35" rx="3" ry="2" fill="#44403C" />
            <path d="M30 37C32 39 34 39 36 37" stroke="#44403C" strokeWidth="1.2" strokeLinecap="round" />
            {/* Sloth Arms Clinging Up to Branch */}
            <path d="M20 28C18 22 22 18 24 18" stroke="#A8A29E" strokeWidth="4" strokeLinecap="round" />
            <path d="M44 28C46 22 42 18 40 18" stroke="#A8A29E" strokeWidth="4" strokeLinecap="round" />
            {/* Three Claws */}
            <line x1="23" y1="16" x2="23" y2="19" stroke="#E7E5E4" strokeWidth="1.2" />
            <line x1="25" y1="16" x2="25" y2="19" stroke="#E7E5E4" strokeWidth="1.2" />
            <line x1="39" y1="16" x2="39" y2="19" stroke="#E7E5E4" strokeWidth="1.2" />
            <line x1="41" y1="16" x2="41" y2="19" stroke="#E7E5E4" strokeWidth="1.2" />
          </svg>
        )}

        {petType === 'bee' && (
          // Buzz: Hyper-Yield Honeybee (Striped bee with iridescent wings and antennae)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Translucent Wings */}
            <ellipse cx="25" cy="18" rx="8" ry="13" transform="rotate(-30 25 18)" fill="#E0F2FE" fillOpacity="0.8" stroke="#38BDF8" strokeWidth="1.2" />
            <ellipse cx="39" cy="18" rx="8" ry="13" transform="rotate(30 39 18)" fill="#E0F2FE" fillOpacity="0.8" stroke="#38BDF8" strokeWidth="1.2" />
            {/* Antennae */}
            <path d="M28 24C26 18 20 16 18 18" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="1.5" fill="#F59E0B" />
            <path d="M36 24C38 18 44 16 46 18" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="46" cy="18" r="1.5" fill="#F59E0B" />
            {/* Bee Head */}
            <circle cx="32" cy="28" r="9" fill="#1E293B" />
            {/* Big Expressive Bee Eyes */}
            <ellipse cx="28" cy="27" rx="3.5" ry="4" fill="#FBBF24" />
            <circle cx="28" cy="27" r="2" fill="#0F172A" />
            <circle cx="28.8" cy="26.2" r="0.8" fill="#FFFFFF" />
            <ellipse cx="36" cy="27" rx="3.5" ry="4" fill="#FBBF24" />
            <circle cx="36" cy="27" r="2" fill="#0F172A" />
            <circle cx="36.8" cy="26.2" r="0.8" fill="#FFFFFF" />
            {/* Striped Abdomen */}
            <ellipse cx="32" cy="44" rx="13" ry="14" fill="#FBBF24" />
            {/* Black Stripes */}
            <path d="M21 39C27 41 37 41 43 39" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            <path d="M21 46C27 48 37 48 43 46" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {/* Stinger Tip */}
            <polygon points="32,58 30,54 34,54" fill="#0F172A" />
          </svg>
        )}

        {petType === 'badger' && (
          // Rocky: Resilient Honey Badger (Bold white racing stripe from crown to back)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dark Body */}
            <ellipse cx="32" cy="38" rx="17" ry="15" fill="#18181B" />
            {/* Badger Ears */}
            <circle cx="20" cy="24" r="3.5" fill="#18181B" stroke="#F4F4F5" strokeWidth="1" />
            <circle cx="44" cy="24" r="3.5" fill="#18181B" stroke="#F4F4F5" strokeWidth="1" />
            {/* Badger Head */}
            <ellipse cx="32" cy="32" rx="14" ry="12" fill="#27272A" />
            {/* Signature Bold White Top Stripe */}
            <polygon points="32,20 25,24 28,42 36,42 39,24" fill="#F4F4F5" />
            {/* Dark Mask Cheeks */}
            <ellipse cx="23" cy="32" rx="4" ry="5" fill="#09090B" />
            <ellipse cx="41" cy="32" rx="4" ry="5" fill="#09090B" />
            {/* Keen Dark Eyes */}
            <circle cx="24" cy="31" r="1.8" fill="#FFFFFF" />
            <circle cx="24" cy="31" r="1.1" fill="#000000" />
            <circle cx="40" cy="31" r="1.8" fill="#FFFFFF" />
            <circle cx="40" cy="31" r="1.1" fill="#000000" />
            {/* Sharp Tough Snout */}
            <ellipse cx="32" cy="39" rx="3.5" ry="2.5" fill="#09090B" />
            <circle cx="32" cy="38.5" r="1.5" fill="#27272A" />
          </svg>
        )}

        {petType === 'falcon' && (
          // Swift: Peregrine Stealth Falcon (Aerodynamic plumage, teardrop eyes)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Swept Raptor Wings */}
            <path d="M14 26C8 34 8 46 12 50C16 46 18 36 22 30" fill="#334155" />
            <path d="M50 26C56 34 56 46 52 50C48 46 46 36 42 30" fill="#334155" />
            {/* Sleek Aerodynamic Body */}
            <ellipse cx="32" cy="36" rx="14" ry="16" fill="#475569" />
            {/* Barred Cream Chest */}
            <ellipse cx="32" cy="40" rx="9" ry="11" fill="#F1F5F9" />
            <line x1="28" y1="36" x2="36" y2="36" stroke="#64748B" strokeWidth="1.2" />
            <line x1="26" y1="41" x2="38" y2="41" stroke="#64748B" strokeWidth="1.2" />
            <line x1="28" y1="46" x2="36" y2="46" stroke="#64748B" strokeWidth="1.2" />
            {/* Slate Crown */}
            <circle cx="32" cy="24" r="10" fill="#1E293B" />
            {/* Distinctive Falcon Teardrop Malar Stripe */}
            <path d="M26 26L24 35L27 33Z" fill="#0F172A" />
            <path d="M38 26L40 35L37 33Z" fill="#0F172A" />
            {/* Sharp Yellow Raptor Eye */}
            <circle cx="26" cy="24" r="3.5" fill="#F59E0B" />
            <circle cx="26" cy="24" r="2" fill="#0F172A" />
            <circle cx="26.7" cy="23.3" r="0.7" fill="#FFFFFF" />
            <circle cx="38" cy="24" r="3.5" fill="#F59E0B" />
            <circle cx="38" cy="24" r="2" fill="#0F172A" />
            <circle cx="38.7" cy="23.3" r="0.7" fill="#FFFFFF" />
            {/* Sharp Hooked Raptor Beak */}
            <path d="M30 26C32 26 34 26 34 29C34 33 32 34 32 34C32 34 30 33 30 29Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          </svg>
        )}

        {petType === 'flamingo' && (
          // Coral: Aesthetic Equity Flamingo (Hot pink plumage, slender curve)
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Graceful S-Curved Slender Neck */}
            <path d="M28 42C26 34 22 28 26 22C28 18 34 18 36 22" stroke="#EC4899" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            {/* Fluffy Coral Body */}
            <ellipse cx="38" cy="40" rx="14" ry="11" fill="#F43F5E" />
            <ellipse cx="42" cy="38" rx="8" ry="6" fill="#FB7185" />
            {/* Slender Leg */}
            <line x1="38" y1="51" x2="38" y2="58" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="54" x2="44" y2="48" stroke="#FB7185" strokeWidth="1.8" strokeLinecap="round" />
            {/* Head */}
            <circle cx="35" cy="22" r="7.5" fill="#F43F5E" />
            {/* Curved Hooked Bill */}
            <path d="M38 23C42 23 46 25 46 28C46 32 42 34 40 33" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M42 27C44 28 45 30 43 32" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Bright Intelligent Eye */}
            <circle cx="34" cy="21" r="2.2" fill="#FEF08A" />
            <circle cx="34" cy="21" r="1.2" fill="#0F172A" />
          </svg>
        )}
      </div>

      {/* Working Indicator Dot or Badge */}
      {isWorking && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F59E0B] border-2 border-white dark:border-[#141413] animate-ping"
          title="Working now"
        />
      )}

      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-tight bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2C2C28] text-[#787570] shadow-2xs"
        >
          {petInfo.name}
        </span>
      )}
    </div>
  );
};
