'use client';

import { useState } from 'react';
import { Country } from '@/types/game';
import { ChevronLeft, Check, Globe, Map, List } from 'lucide-react';
import InteractiveWorldMap from './InteractiveWorldMap';

interface CountrySelectorProps {
  onCountriesSelected: (countries: string[]) => void;
  onBack: () => void;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlândia', flag: '🇫🇮' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'RU', name: 'Rússia', flag: '🇷🇺' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'ZA', name: 'África do Sul', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigéria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egito', flag: '🇪🇬' },
  { code: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'AE', name: 'Emirados Árabes', flag: '🇦🇪' },
  { code: 'TH', name: 'Tailândia', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonésia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malásia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnã', flag: '🇻🇳' },
];

const REGIONS = [
  {
    name: 'América do Norte',
    countries: ['US', 'CA', 'MX'],
    color: 'bg-blue-500',
  },
  {
    name: 'América do Sul',
    countries: ['BR', 'AR', 'CO', 'CL', 'PE'],
    color: 'bg-green-500',
  },
  {
    name: 'Europa Ocidental',
    countries: ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT'],
    color: 'bg-purple-500',
  },
  {
    name: 'Europa Nórdica',
    countries: ['SE', 'NO', 'DK', 'FI'],
    color: 'bg-cyan-500',
  },
  {
    name: 'Ásia Oriental',
    countries: ['KR', 'JP', 'CN'],
    color: 'bg-red-500',
  },
  {
    name: 'Ásia Meridional',
    countries: ['IN', 'TH', 'ID', 'MY', 'SG', 'PH', 'VN'],
    color: 'bg-orange-500',
  },
  {
    name: 'Oceania',
    countries: ['AU'],
    color: 'bg-teal-500',
  },
  {
    name: 'África & Oriente Médio',
    countries: ['ZA', 'NG', 'EG', 'TR', 'IL', 'AE'],
    color: 'bg-yellow-500',
  },
  {
    name: 'Europa Oriental',
    countries: ['PL', 'RU'],
    color: 'bg-indigo-500',
  },
];

export default function CountrySelector({ onCountriesSelected, onBack }: CountrySelectorProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectionMode, setSelectionMode] = useState<'country' | 'region'>('country');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCountryToggle = (countryCode: string) => {
    if (selectionMode === 'region') {
      // Encontrar a região do país e alternar toda a região
      const region = REGIONS.find(r => r.countries.includes(countryCode));
      if (region) {
        handleRegionToggle(region.name);
      }
    } else {
      // Alternar apenas o país individual
      setSelectedCountries(prev => {
        const newSelection = prev.includes(countryCode) 
          ? prev.filter(code => code !== countryCode)
          : [...prev, countryCode];
        return newSelection;
      });
    }
  };

  const handleRegionToggle = (regionName: string) => {
    const region = REGIONS.find(r => r.name === regionName);
    if (!region) return;

    const isRegionSelected = selectedRegions.includes(regionName);
    
    if (isRegionSelected) {
      // Desselecionar região e seus países
      setSelectedRegions(prev => prev.filter(name => name !== regionName));
      setSelectedCountries(prev => prev.filter(code => !region.countries.includes(code)));
    } else {
      // Selecionar região e seus países
      setSelectedRegions(prev => [...prev, regionName]);
      setSelectedCountries(prev => {
        const newCountries = [...prev];
        region.countries.forEach(code => {
          if (!newCountries.includes(code)) {
            newCountries.push(code);
          }
        });
        return newCountries;
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCountries.length === COUNTRIES.length) {
      setSelectedCountries([]);
      setSelectedRegions([]);
    } else {
      setSelectedCountries(COUNTRIES.map(c => c.code));
      setSelectedRegions(REGIONS.map(r => r.name));
    }
  };

  const handleContinue = () => {
    if (selectedCountries.length === 0) {
      alert('Selecione pelo menos um país!');
      return;
    }
    onCountriesSelected(selectedCountries);
  };

  // Filtrar países com base na busca
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              🌍 Selecione os Países
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha de quais países você quer que apareçam os artistas
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Toggle de modo de seleção */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSelectionMode('country')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  selectionMode === 'country'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-sm">🏳️ País</span>
              </button>
              <button
                onClick={() => setSelectionMode('region')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  selectionMode === 'region'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-sm">🌍 Região</span>
              </button>
            </div>

            {/* Toggle de visualização */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="text-sm">Mapa</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm">Lista</span>
              </button>
            </div>
            
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              {selectedCountries.length === COUNTRIES.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          </div>
        </div>

        {/* Status e Controles */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedCountries.length} país{selectedCountries.length !== 1 ? 'es' : ''} selecionado{selectedCountries.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedRegions.length} região{selectedRegions.length !== 1 ? 'ões' : ''} selecionada{selectedRegions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Modo de seleção para o mapa */}
            {viewMode === 'map' && (
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSelectionMode('country')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectionMode === 'country'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title="Selecionar países individualmente"
                >
                  🏳️ País
                </button>
                <button
                  onClick={() => setSelectionMode('region')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectionMode === 'region'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title="Selecionar regiões inteiras"
                >
                  🌍 Região
                </button>
              </div>
            )}
            
            {/* Checkbox para seleção rápida */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all-checkbox"
                checked={selectedCountries.length === COUNTRIES.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="select-all-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecionar todos os países
              </label>
            </div>
          </div>
        </div>

        {/* Seleção por Regiões */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            🗺️ Selecionar por Região
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {REGIONS.map((region) => {
              const isSelected = selectedRegions.includes(region.name);
              return (
                <button
                  key={region.name}
                  onClick={() => handleRegionToggle(region.name)}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${region.color} text-white border-transparent`
                      : `bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500`
                  }`}
                >
                  <span className="text-sm font-medium">{region.name}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mapa Múndi ou Lista de Países */}
        {viewMode === 'map' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <InteractiveWorldMap
              selectedCountries={selectedCountries}
              onCountryClick={handleCountryToggle}
              selectedRegions={selectedRegions}
              selectionMode={selectionMode}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                🏳️ Selecionar Países Individuais
              </h2>
              
              {/* Campo de busca */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar países..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredCountries.map((country) => {
                const isSelected = selectedCountries.includes(country.code);
                return (
                  <button
                    key={country.code}
                    onClick={() => handleCountryToggle(country.code)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'
                    }`}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-sm font-medium text-left">{country.name}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
            
            {filteredCountries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum país encontrado para &ldquo;{searchTerm}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botão Continuar */}
        <div className="text-center">
          <div className="mb-4">
            {selectedCountries.length > 0 && (
              <div className="inline-flex flex-wrap gap-2 justify-center max-w-4xl">
                {selectedCountries.map((countryCode) => {
                  const country = COUNTRIES.find(c => c.code === countryCode);
                  if (!country) return null;
                  return (
                    <div
                      key={countryCode}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                      <button
                        onClick={() => handleCountryToggle(countryCode)}
                        className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <button
            onClick={handleContinue}
            disabled={selectedCountries.length === 0}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            Continuar com {selectedCountries.length} país{selectedCountries.length !== 1 ? 'es' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
