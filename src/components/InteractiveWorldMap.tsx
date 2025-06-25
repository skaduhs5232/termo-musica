'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

interface GeographyData {
  rsmKey: string;
  properties: {
    NAME: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface InteractiveWorldMapProps {
  selectedCountries: string[];
  onCountryClick: (countryCode: string) => void;
  selectedRegions: string[];
  selectionMode: 'country' | 'region';
}

// URL do arquivo de dados geográficos do mundo
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapeamento de códigos ISO para cores de região
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

// Mapeamento de códigos ISO para regiões
const COUNTRY_TO_REGION: Record<string, string> = {
  'US': 'América do Norte',
  'CA': 'América do Norte',
  'MX': 'América do Norte',
  'BR': 'América do Sul',
  'AR': 'América do Sul',
  'CO': 'América do Sul',
  'CL': 'América do Sul',
  'PE': 'América do Sul',
  'GB': 'Europa Ocidental',
  'FR': 'Europa Ocidental',
  'DE': 'Europa Ocidental',
  'ES': 'Europa Ocidental',
  'IT': 'Europa Ocidental',
  'NL': 'Europa Ocidental',
  'BE': 'Europa Ocidental',
  'CH': 'Europa Ocidental',
  'AT': 'Europa Ocidental',
  'SE': 'Europa Nórdica',
  'NO': 'Europa Nórdica',
  'DK': 'Europa Nórdica',
  'FI': 'Europa Nórdica',
  'PL': 'Europa Oriental',
  'RU': 'Europa Oriental',
  'CN': 'Ásia Oriental',
  'JP': 'Ásia Oriental',
  'KR': 'Ásia Oriental',
  'IN': 'Ásia Meridional',
  'TH': 'Ásia Meridional',
  'ID': 'Ásia Meridional',
  'MY': 'Ásia Meridional',
  'SG': 'Ásia Meridional',
  'PH': 'Ásia Meridional',
  'VN': 'Ásia Meridional',
  'AU': 'Oceania',
  'ZA': 'África & Oriente Médio',
  'NG': 'África & Oriente Médio',
  'EG': 'África & Oriente Médio',
  'TR': 'África & Oriente Médio',
  'IL': 'África & Oriente Médio',
  'AE': 'África & Oriente Médio',
};

// Mapeamento de nomes de países para códigos ISO (expandido)
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  // Estados Unidos
  'United States of America': 'US',
  'United States': 'US',
  'USA': 'US',
  'US': 'US',
  
  // Canadá
  'Canada': 'CA',
  
  // México  
  'Mexico': 'MX',
  'México': 'MX',
  
  // Brasil
  'Brazil': 'BR',
  'Brasil': 'BR',
  
  // Argentina
  'Argentina': 'AR',
  
  // Colômbia
  'Colombia': 'CO',
  
  // Chile
  'Chile': 'CL',
  
  // Peru
  'Peru': 'PE',
  'Perú': 'PE',
  
  // Reino Unido
  'United Kingdom': 'GB',
  'United Kingdom of Great Britain and Northern Ireland': 'GB',
  'UK': 'GB',
  'Great Britain': 'GB',
  'Britain': 'GB',
  'England': 'GB',
  'Scotland': 'GB',
  'Wales': 'GB',
  'Northern Ireland': 'GB',
  
  // França
  'France': 'FR',
  'França': 'FR',
  
  // Alemanha
  'Germany': 'DE',
  'Deutschland': 'DE',
  'Alemanha': 'DE',
  
  // Espanha
  'Spain': 'ES',
  'España': 'ES',
  'Espanha': 'ES',
  
  // Itália
  'Italy': 'IT',
  'Italia': 'IT',
  'Itália': 'IT',
  
  // Holanda
  'Netherlands': 'NL',
  'Holland': 'NL',
  'The Netherlands': 'NL',
  'Holanda': 'NL',
  'Países Baixos': 'NL',
  
  // Bélgica
  'Belgium': 'BE',
  'België': 'BE',
  'Belgique': 'BE',
  'Bélgica': 'BE',
  
  // Suíça
  'Switzerland': 'CH',
  'Schweiz': 'CH',
  'Suisse': 'CH',
  'Svizzera': 'CH',
  'Suíça': 'CH',
  
  // Áustria
  'Austria': 'AT',
  'Österreich': 'AT',
  'Áustria': 'AT',
  
  // Suécia
  'Sweden': 'SE',
  'Sverige': 'SE',
  'Suécia': 'SE',
  
  // Noruega
  'Norway': 'NO',
  'Norge': 'NO',
  'Noreg': 'NO',
  'Noruega': 'NO',
  
  // Dinamarca
  'Denmark': 'DK',
  'Danmark': 'DK',
  'Dinamarca': 'DK',
  
  // Finlândia
  'Finland': 'FI',
  'Suomi': 'FI',
  'Finlândia': 'FI',
  
  // Polônia
  'Poland': 'PL',
  'Polska': 'PL',
  'Polônia': 'PL',
  
  // Rússia
  'Russia': 'RU',
  'Russian Federation': 'RU',
  'Россия': 'RU',
  'Rússia': 'RU',
  
  // China
  'China': 'CN',
  "People's Republic of China": 'CN',
  'PRC': 'CN',
  '中国': 'CN',
  
  // Japão
  'Japan': 'JP',
  '日本': 'JP',
  'Japão': 'JP',
  
  // Coreia do Sul
  'South Korea': 'KR',
  'Korea, Republic of': 'KR',
  'Republic of Korea': 'KR',
  'ROK': 'KR',
  '대한민국': 'KR',
  'Coreia do Sul': 'KR',
  
  // Índia
  'India': 'IN',
  'Republic of India': 'IN',
  'भारत': 'IN',
  'Índia': 'IN',
  
  // Tailândia
  'Thailand': 'TH',
  'Kingdom of Thailand': 'TH',
  'ประเทศไทย': 'TH',
  'Tailândia': 'TH',
  
  // Indonésia
  'Indonesia': 'ID',
  'Republic of Indonesia': 'ID',
  'Indonésia': 'ID',
  
  // Malásia
  'Malaysia': 'MY',
  'Malásia': 'MY',
  
  // Singapura
  'Singapore': 'SG',
  'Republic of Singapore': 'SG',
  'Singapura': 'SG',
  
  // Filipinas
  'Philippines': 'PH',
  'Republic of the Philippines': 'PH',
  'Pilipinas': 'PH',
  'Filipinas': 'PH',
  
  // Vietnã
  'Vietnam': 'VN',
  'Viet Nam': 'VN',
  'Socialist Republic of Vietnam': 'VN',
  'Việt Nam': 'VN',
  'Vietnã': 'VN',
  
  // Austrália
  'Australia': 'AU',
  'Commonwealth of Australia': 'AU',
  'Austrália': 'AU',
  
  // África do Sul
  'South Africa': 'ZA',
  'Republic of South Africa': 'ZA',
  'África do Sul': 'ZA',
  
  // Nigéria
  'Nigeria': 'NG',
  'Federal Republic of Nigeria': 'NG',
  'Nigéria': 'NG',
  
  // Egito
  'Egypt': 'EG',
  'Arab Republic of Egypt': 'EG',
  'مصر': 'EG',
  'Egito': 'EG',
  
  // Turquia
  'Turkey': 'TR',
  'Republic of Turkey': 'TR',
  'Türkiye': 'TR',
  'Turquia': 'TR',
  
  // Israel
  'Israel': 'IL',
  'State of Israel': 'IL',
  'ישראל': 'IL',
  
  // Emirados Árabes Unidos
  'United Arab Emirates': 'AE',
  'UAE': 'AE',
  'الإمارات العربية المتحدة': 'AE',
  'Emirados Árabes Unidos': 'AE',
  
  // Países adicionais comuns em datasets geográficos
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Iceland': 'IS',
  'Luxembourg': 'LU',
  'Czech Republic': 'CZ',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Croatia': 'HR',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Serbia': 'RS',
  'Montenegro': 'ME',
  'Bosnia and Herzegovina': 'BA',
  'North Macedonia': 'MK',
  'Albania': 'AL',
  'Greece': 'GR',
  'Cyprus': 'CY',
  'Malta': 'MT',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Estonia': 'EE',
  'Belarus': 'BY',
  'Ukraine': 'UA',
  'Moldova': 'MD',
  'Georgia': 'GE',
  'Armenia': 'AM',
  'Azerbaijan': 'AZ',
  'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ',
  'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ',
  'Turkmenistan': 'TM',
  'Afghanistan': 'AF',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Nepal': 'NP',
  'Bhutan': 'BT',
  'Sri Lanka': 'LK',
  'Myanmar': 'MM',
  'Cambodia': 'KH',
  'Laos': 'LA',
  'Mongolia': 'MN',
  'North Korea': 'KP',
  'Taiwan': 'TW',
  'Hong Kong': 'HK',
  'Macau': 'MO',
  'New Zealand': 'NZ',
  'Papua New Guinea': 'PG',
  'Fiji': 'FJ',
  'Morocco': 'MA',
  'Algeria': 'DZ',
  'Tunisia': 'TN',
  'Libya': 'LY',
  'Sudan': 'SD',
  'Ethiopia': 'ET',
  'Kenya': 'KE',
  'Tanzania': 'TZ',
  'Uganda': 'UG',
  'Rwanda': 'RW',
  'Burundi': 'BI',
  'Democratic Republic of the Congo': 'CD',
  'Republic of the Congo': 'CG',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Niger': 'NE',
  'Mali': 'ML',
  'Burkina Faso': 'BF',
  'Senegal': 'SN',
  'Gambia': 'GM',
  'Guinea-Bissau': 'GW',
  'Guinea': 'GN',
  'Sierra Leone': 'SL',
  'Liberia': 'LR',
  'Ivory Coast': 'CI',
  'Ghana': 'GH',
  'Togo': 'TG',
  'Benin': 'BJ',
  'Cameroon': 'CM',
  'Equatorial Guinea': 'GQ',
  'Gabon': 'GA',
  'São Tomé and Príncipe': 'ST',
  'Angola': 'AO',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
  'Botswana': 'BW',
  'Namibia': 'NA',
  'Lesotho': 'LS',
  'Swaziland': 'SZ',
  'Mozambique': 'MZ',
  'Madagascar': 'MG',
  'Mauritius': 'MU',
  'Seychelles': 'SC',
  'Comoros': 'KM',
  'Djibouti': 'DJ',
  'Eritrea': 'ER',
  'Somalia': 'SO',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Kuwait': 'KW',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Yemen': 'YE',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Syria': 'SY',
  'Venezuela': 'VE',
  'Guyana': 'GY',
  'Suriname': 'SR',
  'French Guiana': 'GF',
  'Uruguay': 'UY',
  'Paraguay': 'PY',
  'Bolivia': 'BO',
  'Ecuador': 'EC',
  'Panama': 'PA',
  'Costa Rica': 'CR',
  'Nicaragua': 'NI',
  'Honduras': 'HN',
  'El Salvador': 'SV',
  'Guatemala': 'GT',
  'Belize': 'BZ',
  'Cuba': 'CU',
  'Jamaica': 'JM',
  'Haiti': 'HT',
  'Dominican Republic': 'DO',
  'Puerto Rico': 'PR',
  'Trinidad and Tobago': 'TT',
  'Barbados': 'BB',
  'Saint Vincent and the Grenadines': 'VC',
  'Saint Lucia': 'LC',
  'Grenada': 'GD',
  'Dominica': 'DM',
  'Antigua and Barbuda': 'AG',
  'Saint Kitts and Nevis': 'KN',
  'Bahamas': 'BS',
};

export default function InteractiveWorldMap({ 
  selectedCountries, 
  onCountryClick, 
  selectedRegions,
  selectionMode = 'country'
}: InteractiveWorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 0]);

  const getCountryColor = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      const region = COUNTRY_TO_REGION[countryCode];
      return region ? REGION_COLORS[region] : '#3B82F6';
    }
    return '#E5E7EB';
  };

  const getCountryHoverColor = (countryCode: string, isSelected: boolean) => {
    if (isSelected) {
      // Se já está selecionado, escurecer a cor atual
      const region = COUNTRY_TO_REGION[countryCode];
      if (region && REGION_COLORS[region]) {
        // Escurecer a cor da região
        return REGION_COLORS[region] + 'CC';
      }
      return '#2563EB';
    }
    
    // Se não está selecionado, mostrar preview da cor que teria
    const region = COUNTRY_TO_REGION[countryCode];
    if (region && REGION_COLORS[region]) {
      if (selectionMode === 'region') {
        // No modo região, mostrar a cor da região mais claramente
        return REGION_COLORS[region] + '80'; // Mais opaco para melhor feedback
      }
      return REGION_COLORS[region] + '66'; // Versão clara da cor da região
    }
    return '#D1D5DB';
  };

  const handleCountryClick = (geo: GeographyData) => {
    const countryName = (geo.properties.NAME || geo.properties.name || geo.properties.NAME_EN) as string;
    
    if (!countryName) {
      return;
    }
    
    const countryCode = COUNTRY_NAME_TO_CODE[countryName];
    
    if (countryCode) {
      // Sempre chamar onCountryClick com o país clicado
      // O componente pai (CountrySelector) decidirá se deve selecionar a região inteira
      onCountryClick(countryCode);
    }
  };

  const handleMouseEnter = (geo: GeographyData, event: React.MouseEvent) => {
    const countryName = (geo.properties.NAME || geo.properties.name || geo.properties.NAME_EN) as string;
    const countryCode = countryName ? COUNTRY_NAME_TO_CODE[countryName] : null;
    
    if (countryCode) {
      const region = COUNTRY_TO_REGION[countryCode];
      let tooltip = countryName;
      
      if (selectionMode === 'region' && region) {
        tooltip = `${countryName} → Selecionar toda ${region}`;
      } else if (region) {
        tooltip = `${countryName} (${region})`;
      }
      
      setTooltipContent(tooltip);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    } else {
      const displayName = countryName || 'País desconhecido';
      setTooltipContent(`${displayName} (não disponível)`);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent('');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setCenter([0, 0]);
  };

  return (
    <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-200 dark:border-gray-600">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          🗺️ Mapa Múndi Interativo
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Modo: {selectionMode === 'country' ? '🏳️ Seleção por País' : '🌍 Seleção por Região'} 
          | Clique nos países para selecioná-los. Use a roda do mouse para fazer zoom.
        </p>
      </div>

      <div className="relative">
        {/* Controles de Zoom */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Reset View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <ComposableMap
          projectionConfig={{
            scale: 140 * zoom,
            center: center as [number, number],
          }}
          style={{
            width: '100%',
            height: '500px',
            background: 'transparent',
          }}
        >
          <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = (geo.properties.NAME || geo.properties.name || geo.properties.NAME_EN) as string;
                  const countryCode = countryName ? COUNTRY_NAME_TO_CODE[countryName] : null;
                  const isSelectable = !!countryCode;
                  const isSelected = countryCode && selectedCountries.includes(countryCode);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        isSelectable
                          ? getCountryColor(countryCode)
                          : '#F3F4F6'
                      }
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: 'none',
                          cursor: isSelectable ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: isSelectable
                            ? getCountryHoverColor(countryCode, !!isSelected)
                            : '#F3F4F6',
                          outline: 'none',
                          cursor: isSelectable ? 'pointer' : 'default',
                        },
                        pressed: {
                          outline: 'none',
                        },
                      }}
                      onClick={(event: React.MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (isSelectable) {
                          handleCountryClick(geo);
                        }
                      }}
                      onMouseEnter={(event: React.MouseEvent) => {
                        handleMouseEnter(geo, event);
                      }}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        {tooltipContent && (
          <div
            className="fixed z-50 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            📊 Estatísticas
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Países selecionados:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {selectedCountries.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Regiões ativas:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {selectedRegions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Países disponíveis:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {Object.keys(COUNTRY_NAME_TO_CODE).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Modo atual:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {selectionMode === 'country' ? '🏳️ País' : '🌍 Região'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            🎨 Regiões Selecionadas
          </h4>
          <div className="space-y-2">
            {selectedRegions.length > 0 ? (
              selectedRegions.map((region) => (
                <div key={region} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: REGION_COLORS[region] }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {region}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-500 italic">
                Nenhuma região selecionada
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            ℹ️ Instruções
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Clique nos países para selecionar</li>
            <li>• Modo região: seleciona toda a região</li>
            <li>• Use a roda do mouse para zoom</li>
            <li>• Arraste para mover o mapa</li>
            <li>• Países cinza não estão disponíveis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
