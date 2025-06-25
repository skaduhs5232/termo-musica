'use client';

import { Github, Eye, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { StatsService, SiteStats } from "@/lib/stats-service";

export default function Footer() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeStats = async () => {
      try {
        // Registrar visita e obter estatísticas
        const currentStats = await StatsService.recordVisit();
        setStats(currentStats);
      } catch (error) {
        console.error('Erro ao inicializar estatísticas:', error);
        // Em caso de erro, usar valores padrão
        setStats({
          totalVisits: 0,
          uniqueVisitors: 0,
          lastVisit: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeStats();
  }, []);

  return (
    <footer className="py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          {/* Estatísticas */}
          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
            {/* Total de Visitas */}
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-blue-500" />
              <span>
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {StatsService.formatNumber(stats?.totalVisits || 0)}
                    </span>{' '}
                    visita{(stats?.totalVisits || 0) !== 1 ? 's' : ''}
                  </>
                )}
              </span>
            </div>

            {/* Visitantes Únicos */}
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-500" />
              <span>
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {StatsService.formatNumber(stats?.uniqueVisitors || 0)}
                    </span>{' '}
                    visitante{(stats?.uniqueVisitors || 0) !== 1 ? 's' : ''}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Créditos */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>Feito por</span>
            <a 
              href="https://github.com/skaduhs5232" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
            >
              <Github size={16} />
              Thiago de Oliveira
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
