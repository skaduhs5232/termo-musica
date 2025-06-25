/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Serviço para gerenciar estatísticas do site
 */

import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  addDoc,
  UpdateData,
  DocumentData
} from 'firebase/firestore';

export interface SiteStats {
  totalVisits: number;
  uniqueVisitors: number;
  lastVisit: string;
  dailyVisits?: number;
  weeklyVisits?: number;
  monthlyVisits?: number;
}

export interface VisitRecord {
  timestamp: Date;
  visitorId: string;
  userAgent: string;
  referrer: string;
  page: string;
}

export class StatsService {
  private static readonly VISITS_KEY = 'termo-musical-visits';
  private static readonly UNIQUE_VISITORS_KEY = 'termo-musical-unique-visitors';
  private static readonly SESSION_KEY = 'termo-musical-session';
  private static readonly VISITOR_ID_KEY = 'termo-musical-visitor-id';
  private static readonly LAST_VISIT_KEY = 'termo-musical-last-visit';
  
  // Coleções do Firebase
  private static readonly STATS_COLLECTION = 'site-stats';
  private static readonly VISITS_COLLECTION = 'visits';
  private static readonly STATS_DOC_ID = 'global-stats';

  /**
   * Gera um ID único para o visitante
   */
  private static generateVisitorId(): string {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Verifica se é um visitante único
   */
  private static isUniqueVisitor(): boolean {
    const visitorId = localStorage.getItem(this.VISITOR_ID_KEY);
    return !visitorId;
  }

  /**
   * Verifica se é uma nova sessão
   */
  private static isNewSession(): boolean {
    return !sessionStorage.getItem(this.SESSION_KEY);
  }

  /**
   * Obtém informações do navegador
   */
  private static getBrowserInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'Server',
        referrer: '',
        page: '/'
      };
    }
    
    return {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      page: window.location.pathname
    };
  }

  /**
   * Salva dados localmente como backup
   */
  private static saveLocalStats(stats: SiteStats) {
    try {
      localStorage.setItem(this.VISITS_KEY, stats.totalVisits.toString());
      localStorage.setItem(this.UNIQUE_VISITORS_KEY, stats.uniqueVisitors.toString());
      localStorage.setItem(this.LAST_VISIT_KEY, stats.lastVisit);
    } catch (error) {
      console.warn('Erro ao salvar estatísticas localmente:', error);
    }
  }

  /**
   * Carrega dados locais como backup
   */
  private static loadLocalStats(): SiteStats {
    return {
      totalVisits: parseInt(localStorage.getItem(this.VISITS_KEY) || '0', 10),
      uniqueVisitors: parseInt(localStorage.getItem(this.UNIQUE_VISITORS_KEY) || '0', 10),
      lastVisit: localStorage.getItem(this.LAST_VISIT_KEY) || new Date().toISOString(),
    };
  }

  /**
   * Registra uma nova visita
   */
  public static async recordVisit(): Promise<SiteStats> {
    const now = new Date().toISOString();
    const isNewSessionValue = this.isNewSession();
    const isUniqueVisitorValue = this.isUniqueVisitor();
    
    // Marcar sessão como visitada
    sessionStorage.setItem(this.SESSION_KEY, 'true');
    
    let visitorId = localStorage.getItem(this.VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = this.generateVisitorId();
      localStorage.setItem(this.VISITOR_ID_KEY, visitorId);
    }

    try {
      // Tentar salvar no Firebase
      const statsDocRef = doc(db, this.STATS_COLLECTION, this.STATS_DOC_ID);
      
      // Verificar se o documento já existe
      const statsDoc = await getDoc(statsDocRef);
      
      if (!statsDoc.exists()) {
        // Criar documento inicial
        const initialStats = {
          totalVisits: 1,
          uniqueVisitors: isUniqueVisitorValue ? 1 : 0,
          lastVisit: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(statsDocRef, initialStats);
        
        const result: SiteStats = {
          totalVisits: 1,
          uniqueVisitors: isUniqueVisitorValue ? 1 : 0,
          lastVisit: now
        };
        
        this.saveLocalStats(result);
        return result;
      } else {
        // Atualizar documento existente
        const updateData = {
          lastVisit: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Incrementar visitas se é nova sessão
        if (isNewSessionValue) {
          (updateData as any).totalVisits = increment(1);
        }
        
        // Incrementar visitantes únicos se é visitante único
        if (isUniqueVisitorValue) {
          (updateData as any).uniqueVisitors = increment(1);
        }
        
        await updateDoc(statsDocRef, updateData);
        
        // Registrar a visita individual
        await this.recordIndividualVisit(visitorId);
        
        // Buscar dados atualizados
        const updatedDoc = await getDoc(statsDocRef);
        const data = updatedDoc.data();
        
        const result: SiteStats = {
          totalVisits: data?.totalVisits || 0,
          uniqueVisitors: data?.uniqueVisitors || 0,
          lastVisit: now
        };
        
        this.saveLocalStats(result);
        return result;
      }
    } catch (error) {
      console.warn('Erro ao salvar no Firebase, usando backup local:', error);
      
      // Fallback para armazenamento local
      const localStats = this.loadLocalStats();
      
      if (isNewSessionValue) {
        localStats.totalVisits += 1;
      }
      
      if (isUniqueVisitorValue) {
        localStats.uniqueVisitors += 1;
      }
      
      localStats.lastVisit = now;
      this.saveLocalStats(localStats);
      
      return localStats;
    }
  }

  /**
   * Registra uma visita individual para análise detalhada
   */
  private static async recordIndividualVisit(visitorId: string): Promise<void> {
    try {
      const browserInfo = this.getBrowserInfo();
      const visitRecord: VisitRecord = {
        timestamp: new Date(),
        visitorId,
        userAgent: browserInfo.userAgent,
        referrer: browserInfo.referrer,
        page: browserInfo.page
      };
      
      const visitsCollection = collection(db, this.VISITS_COLLECTION);
      await addDoc(visitsCollection, visitRecord);
    } catch (error) {
      console.warn('Erro ao registrar visita individual:', error);
    }
  }

  /**
   * Obtém as estatísticas do Firebase com fallback local
   */
  public static async getStats(): Promise<SiteStats> {
    try {
      const statsDocRef = doc(db, this.STATS_COLLECTION, this.STATS_DOC_ID);
      const statsDoc = await getDoc(statsDocRef);
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        const result: SiteStats = {
          totalVisits: data.totalVisits || 0,
          uniqueVisitors: data.uniqueVisitors || 0,
          lastVisit: data.lastVisit?.toDate?.()?.toISOString() || new Date().toISOString()
        };
        
        // Salvar como backup local
        this.saveLocalStats(result);
        return result;
      }
    } catch (error) {
      console.warn('Erro ao buscar dados do Firebase, usando backup local:', error);
    }
    
    // Fallback para dados locais
    return this.loadLocalStats();
  }

  /**
   * Obtém o total de visitas (método de compatibilidade)
   */
  public static getTotalVisits(): number {
    return parseInt(localStorage.getItem(this.VISITS_KEY) || '0', 10);
  }

  /**
   * Obtém o total de visitantes únicos (método de compatibilidade)
   */
  public static getUniqueVisitors(): number {
    return parseInt(localStorage.getItem(this.UNIQUE_VISITORS_KEY) || '0', 10);
  }

  /**
   * Obtém a data da última visita (método de compatibilidade)
   */
  public static getLastVisit(): string {
    return localStorage.getItem(this.LAST_VISIT_KEY) || new Date().toISOString();
  }

  /**
   * Formata números para exibição
   */
  public static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Formata data para exibição
   */
  public static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  }

  /**
   * Reseta todas as estatísticas (para desenvolvimento/teste)
   */
  public static async resetStats(): Promise<void> {
    try {
      // Resetar no Firebase
      const statsDocRef = doc(db, this.STATS_COLLECTION, this.STATS_DOC_ID);
      await setDoc(statsDocRef, {
        totalVisits: 0,
        uniqueVisitors: 0,
        lastVisit: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Erro ao resetar no Firebase:', error);
    }
    
    // Resetar localmente
    localStorage.removeItem(this.VISITS_KEY);
    localStorage.removeItem(this.UNIQUE_VISITORS_KEY);
    localStorage.removeItem(this.VISITOR_ID_KEY);
    localStorage.removeItem(this.LAST_VISIT_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
  }
}
