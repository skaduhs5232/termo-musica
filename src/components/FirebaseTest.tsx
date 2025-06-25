/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { StatsService } from '@/lib/stats-service';

export default function FirebaseTest() {
  const [status, setStatus] = useState('🔄 Inicializando...');
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setStatus('📡 Conectando ao Firebase...');
        setError(null);
        
        // Primeiro tentar obter stats existentes
        setStatus('📊 Buscando estatísticas...');
        const existingStats = await StatsService.getStats();
        
        setStatus('➕ Registrando nova visita...');
        const newStats = await StatsService.recordVisit();
        
        setStats(newStats);
        setStatus('✅ Firebase funcionando perfeitamente!');
        
      } catch (error: any) {
        console.error('Erro detalhado no Firebase:', error);
        setError(error.message || 'Erro desconhecido');
        
        // Verificar se é erro de permissões
        if (error.code === 'permission-denied') {
          setStatus('🔐 Erro de permissões - Configure as regras do Firestore');
        } else if (error.code === 'unavailable') {
          setStatus('🌐 Firestore indisponível - Verifique conexão');
        } else if (error.code === 'not-found') {
          setStatus('📂 Banco não encontrado - Crie o Firestore Database');
        } else {
          setStatus('❌ Erro: ' + (error.code || 'Desconhecido'));
        }
      }
    };

    // Aguardar um pouco antes de testar para garantir que tudo carregou
    const timer = setTimeout(testFirebase, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🔥 Teste Firebase</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{status}</p>
      
      {error && (
        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded mb-2">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {stats && (
        <div className="text-xs space-y-1 bg-green-50 dark:bg-green-900/20 p-2 rounded">
          <div><strong>Visitas:</strong> {stats.totalVisits}</div>
          <div><strong>Únicos:</strong> {stats.uniqueVisitors}</div>
          <div><strong>Última:</strong> {new Date(stats.lastVisit).toLocaleTimeString()}</div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
        <div>Projeto: termo-musical</div>
        <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}
