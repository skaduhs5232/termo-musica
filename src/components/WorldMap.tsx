interface WorldMapProps {
  selectedCountries: string[];
  onCountryClick: (countryCode: string) => void;
  selectedRegions: string[];
}

// Coordenadas simplificadas para países principais (aproximadas)
const COUNTRY_PATHS: Record<string, { path: string; center: [number, number] }> = {
  'US': {
    path: 'M 160 150 L 280 150 L 280 200 L 160 200 Z',
    center: [220, 175]
  },
  'CA': {
    path: 'M 130 100 L 320 100 L 320 150 L 130 150 Z',
    center: [225, 125]
  },
  'MX': {
    path: 'M 150 200 L 250 200 L 250 240 L 150 240 Z',
    center: [200, 220]
  },
  'BR': {
    path: 'M 280 220 L 350 220 L 360 310 L 270 310 Z',
    center: [315, 265]
  },
  'AR': {
    path: 'M 270 310 L 320 310 L 315 390 L 275 390 Z',
    center: [295, 350]
  },
  'CO': {
    path: 'M 260 240 L 290 240 L 290 270 L 260 270 Z',
    center: [275, 255]
  },
  'CL': {
    path: 'M 250 310 L 270 310 L 270 390 L 250 390 Z',
    center: [260, 350]
  },
  'PE': {
    path: 'M 240 270 L 280 270 L 280 310 L 240 310 Z',
    center: [260, 290]
  },
  'GB': {
    path: 'M 480 120 L 500 120 L 500 140 L 480 140 Z',
    center: [490, 130]
  },
  'FR': {
    path: 'M 480 140 L 520 140 L 520 180 L 480 180 Z',
    center: [500, 160]
  },
  'DE': {
    path: 'M 520 120 L 550 120 L 550 160 L 520 160 Z',
    center: [535, 140]
  },
  'ES': {
    path: 'M 460 180 L 500 180 L 500 210 L 460 210 Z',
    center: [480, 195]
  },
  'IT': {
    path: 'M 520 180 L 540 180 L 540 230 L 520 230 Z',
    center: [530, 205]
  },
  'NL': {
    path: 'M 500 120 L 520 120 L 520 140 L 500 140 Z',
    center: [510, 130]
  },
  'BE': {
    path: 'M 490 140 L 510 140 L 510 155 L 490 155 Z',
    center: [500, 147]
  },
  'CH': {
    path: 'M 510 160 L 530 160 L 530 175 L 510 175 Z',
    center: [520, 167]
  },
  'AT': {
    path: 'M 530 150 L 550 150 L 550 165 L 530 165 Z',
    center: [540, 157]
  },
  'SE': {
    path: 'M 520 80 L 540 80 L 540 120 L 520 120 Z',
    center: [530, 100]
  },
  'NO': {
    path: 'M 500 60 L 530 60 L 530 120 L 500 120 Z',
    center: [515, 90]
  },
  'DK': {
    path: 'M 510 110 L 530 110 L 530 125 L 510 125 Z',
    center: [520, 117]
  },
  'FI': {
    path: 'M 540 80 L 560 80 L 560 120 L 540 120 Z',
    center: [550, 100]
  },
  'PL': {
    path: 'M 550 130 L 580 130 L 580 160 L 550 160 Z',
    center: [565, 145]
  },
  'RU': {
    path: 'M 580 80 L 780 80 L 780 200 L 580 200 Z',
    center: [680, 140]
  },
  'CN': {
    path: 'M 680 150 L 760 150 L 760 220 L 680 220 Z',
    center: [720, 185]
  },
  'IN': {
    path: 'M 620 200 L 680 200 L 680 260 L 620 260 Z',
    center: [650, 230]
  },
  'TH': {
    path: 'M 680 220 L 710 220 L 710 260 L 680 260 Z',
    center: [695, 240]
  },
  'ID': {
    path: 'M 710 260 L 780 260 L 780 290 L 710 290 Z',
    center: [745, 275]
  },
  'MY': {
    path: 'M 690 250 L 720 250 L 720 270 L 690 270 Z',
    center: [705, 260]
  },
  'SG': {
    path: 'M 700 265 L 710 265 L 710 275 L 700 275 Z',
    center: [705, 270]
  },
  'PH': {
    path: 'M 750 200 L 780 200 L 780 240 L 750 240 Z',
    center: [765, 220]
  },
  'VN': {
    path: 'M 690 200 L 720 200 L 720 240 L 690 240 Z',
    center: [705, 220]
  },
  'AU': {
    path: 'M 720 300 L 820 300 L 820 360 L 720 360 Z',
    center: [770, 330]
  },
  'JP': {
    path: 'M 780 160 L 820 160 L 820 200 L 780 200 Z',
    center: [800, 180]
  },
  'KR': {
    path: 'M 760 150 L 780 150 L 780 170 L 760 170 Z',
    center: [770, 160]
  },
  'ZA': {
    path: 'M 540 320 L 580 320 L 580 360 L 540 360 Z',
    center: [560, 340]
  },
  'NG': {
    path: 'M 500 240 L 530 240 L 530 270 L 500 270 Z',
    center: [515, 255]
  },
  'EG': {
    path: 'M 540 220 L 570 220 L 570 250 L 540 250 Z',
    center: [555, 235]
  },
  'TR': {
    path: 'M 570 180 L 620 180 L 620 210 L 570 210 Z',
    center: [595, 195]
  },
  'IL': {
    path: 'M 570 210 L 585 210 L 585 225 L 570 225 Z',
    center: [577, 217]
  },
  'AE': {
    path: 'M 600 230 L 620 230 L 620 245 L 600 245 Z',
    center: [610, 237]
  }
};

const REGION_COLORS: Record<string, string> = {
  'América do Norte': '#3B82F6',
  'América do Sul': '#10B981',
  'Europa Ocidental': '#8B5CF6',
  'Europa Nórdica': '#06B6D4',
  'Ásia Oriental': '#EF4444',
  'Ásia Meridional': '#F97316',
  'Oceania': '#14B8A6',
  'África & Oriente Médio': '#EAB308',
  'Europa Oriental': '#6366F1',
};

export default function WorldMap({ selectedCountries, onCountryClick, selectedRegions }: WorldMapProps) {
  const getCountryColor = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      // Encontrar a região do país para usar sua cor
      const regions = [
        { name: 'América do Norte', countries: ['US', 'CA', 'MX'] },
        { name: 'América do Sul', countries: ['BR', 'AR', 'CO', 'CL', 'PE'] },
        { name: 'Europa Ocidental', countries: ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT'] },
        { name: 'Europa Nórdica', countries: ['SE', 'NO', 'DK', 'FI'] },
        { name: 'Ásia Oriental', countries: ['KR', 'JP', 'CN'] },
        { name: 'Ásia Meridional', countries: ['IN', 'TH', 'ID', 'MY', 'SG', 'PH', 'VN'] },
        { name: 'Oceania', countries: ['AU'] },
        { name: 'África & Oriente Médio', countries: ['ZA', 'NG', 'EG', 'TR', 'IL', 'AE'] },
        { name: 'Europa Oriental', countries: ['PL', 'RU'] },
      ];
      
      const region = regions.find(r => r.countries.includes(countryCode));
      return region ? REGION_COLORS[region.name] : '#3B82F6';
    }
    return '#E5E7EB';
  };

  return (
    <div className="w-full bg-blue-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-200 dark:border-gray-600">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          🗺️ Mapa Múndi Interativo
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Clique nos países para selecioná-los
        </p>
      </div>
      
      <div className="flex justify-center">
        <svg
          viewBox="0 0 900 400"
          className="w-full max-w-4xl h-auto border rounded-lg bg-blue-100 dark:bg-gray-700"
          style={{ aspectRatio: '900/400' }}
        >
          {/* Oceanos */}
          <rect width="900" height="400" fill="#93C5FD" className="dark:fill-gray-600" />
          
          {/* Continentes base */}
          <g fill="#D1D5DB" className="dark:fill-gray-500">
            {/* América do Norte */}
            <path d="M 120 80 L 350 80 L 350 200 L 120 200 Z" />
            {/* América do Sul */}
            <path d="M 250 200 L 370 200 L 370 380 L 250 380 Z" />
            {/* Europa */}
            <path d="M 450 60 L 580 60 L 580 200 L 450 200 Z" />
            {/* Ásia */}
            <path d="M 580 60 L 850 60 L 850 280 L 580 280 Z" />
            {/* África */}
            <path d="M 480 200 L 620 200 L 620 360 L 480 360 Z" />
            {/* Oceania */}
            <path d="M 720 280 L 850 280 L 850 360 L 720 360 Z" />
          </g>
          
          {/* Países interativos */}
          {Object.entries(COUNTRY_PATHS).map(([countryCode, data]) => (
            <g key={countryCode}>
              <path
                d={data.path}
                fill={getCountryColor(countryCode)}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onCountryClick(countryCode)}
              />
              {selectedCountries.includes(countryCode) && (
                <circle
                  cx={data.center[0]}
                  cy={data.center[1]}
                  r="8"
                  fill="white"
                  stroke={getCountryColor(countryCode)}
                  strokeWidth="2"
                />
              )}
              {selectedCountries.includes(countryCode) && (
                <text
                  x={data.center[0]}
                  y={data.center[1] + 2}
                  textAnchor="middle"
                  fontSize="10"
                  fill={getCountryColor(countryCode)}
                  fontWeight="bold"
                >
                  ✓
                </text>
              )}
            </g>
          ))}
          
          {/* Legenda de regiões */}
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="220" height="200" fill="white" fillOpacity="0.95" rx="8" stroke="#374151" strokeWidth="1" />
            <text x="15" y="25" fontSize="14" fontWeight="bold" fill="#374151">Regiões Selecionadas:</text>
            {selectedRegions.length > 0 ? (
              selectedRegions.map((region, index) => (
                <g key={region} transform={`translate(15, ${45 + index * 22})`}>
                  <rect x="0" y="-10" width="14" height="14" fill={REGION_COLORS[region]} rx="3" />
                  <text x="22" y="2" fontSize="11" fill="#374151" fontWeight="500">{region}</text>
                </g>
              ))
            ) : (
              <text x="15" y="50" fontSize="11" fill="#9CA3AF" fontStyle="italic">Nenhuma região selecionada</text>
            )}
            
            <line x1="15" y1={selectedRegions.length > 0 ? 70 + selectedRegions.length * 22 : 70} x2="205" y2={selectedRegions.length > 0 ? 70 + selectedRegions.length * 22 : 70} stroke="#E5E7EB" strokeWidth="1" />
            
            <text x="15" y={selectedRegions.length > 0 ? 95 + selectedRegions.length * 22 : 95} fontSize="12" fontWeight="bold" fill="#374151">
              Países: {selectedCountries.length}
            </text>
            
            <text x="15" y={selectedRegions.length > 0 ? 115 + selectedRegions.length * 22 : 115} fontSize="10" fill="#6B7280">
              Clique nos países para selecionar
            </text>
          </g>
        </svg>
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        * Representação simplificada dos países. Clique para selecionar/deselecionar.
      </div>
    </div>
  );
}
