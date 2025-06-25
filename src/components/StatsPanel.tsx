'use client';

import { useEffect, useState } from 'react';
import { StatsService, SiteStats } from '@/lib/stats-service';
import { Eye, Users, Calendar, BarChart3 } from 'lucide-react';

export default function StatsPanel() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const currentStats = await StatsService.getStats();
        setStats(currentStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleResetStats = async () => {
    if (confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.')) {
      await StatsService.resetStats();
      setStats({
        totalVisits: 0,
        uniqueVisitors: 0,
        lastVisit: new Date().toISOString(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <BarChart3 className="text-blue-500" />
          Estatísticas do Site
        </h2>
        <button
          onClick={handleResetStats}
          className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
        >
          Resetar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Visitas */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Visitas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {StatsService.formatNumber(stats?.totalVisits || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Visitantes Únicos */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visitantes Únicos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {StatsService.formatNumber(stats?.uniqueVisitors || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Última Visita */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Última Visita</p>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {StatsService.formatDate(stats?.lastVisit || '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          ℹ️ Como funciona o contador
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Visitas:</strong> Conta o número total de sessões (uma por aba/janela)</li>
          <li>• <strong>Visitantes Únicos:</strong> Conta cada dispositivo/navegador apenas uma vez</li>
          <li>• <strong>Armazenamento:</strong> Dados salvos no navegador (localStorage)</li>
          <li>• <strong>Persistência:</strong> Dados mantidos mesmo após fechar o navegador</li>
        </ul>
      </div>
    </div>
  );
}
