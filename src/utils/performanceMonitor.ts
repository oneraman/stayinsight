export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startTimer(label: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Keep only last 100 measurements
      if (this.metrics.get(label)!.length > 100) {
        this.metrics.get(label)!.shift();
      }
      
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      return duration;
    };
  }
  
  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [label, times] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length,
        latest: times[times.length - 1] || 0
      };
    }
    
    return result;
  }
  
  logSummary(): void {
    console.log('📊 Performance Summary:');
    const metrics = this.getMetrics();
    
    for (const [label, data] of Object.entries(metrics)) {
      console.log(`  ${label}: avg ${data.average.toFixed(2)}ms (${data.count} samples)`);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
