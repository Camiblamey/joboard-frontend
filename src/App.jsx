import React, { useState, useEffect } from 'react';
import { 
  Building2, ExternalLink, Filter, Search, 
  Clock, CheckCircle2, Briefcase, MapPin, Loader2
} from 'lucide-react';

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');

  // Las 9 categorías exactas que pediste
  const CATEGORIES = [
    'Todas', 'Planner', 'Product Manager', 'CPFR', 'Category Manager', 
    'Lead Manager', 'Mejora Continua', 'Proyectos', 'Customer', 'Business Intelligence'
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Conexión real con tu servidor en Render
        const response = await fetch('https://joboard-api.onrender.com/jobs');
        if (!response.ok) throw new Error('Error al conectar con el servidor');
        
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("Error cargando ofertas:", err);
        // Si falla, dejamos la lista vacía para no mostrar datos falsos
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const results = jobs.filter(job => {
      const matchesSearch = (job.role || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (job.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro exacto de categoría
      const matchesCategory = activeCategory === 'Todas' || (job.category || "") === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    setFilteredJobs(results);
  }, [searchTerm, activeCategory, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* Header Limpio y Elegante */}
      <header className="bg-slate-900 text-white shadow-xl relative overflow-hidden border-b border-emerald-900/50">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-900/40"></div>
        
        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
              <Briefcase className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Joboard <span className="text-emerald-500">Hunter</span>
              </h1>
              <p className="text-slate-400 text-sm">Monitor de empleo estratégico • Chile</p>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="bg-emerald-500/10 backdrop-blur-md px-5 py-2 rounded-xl border border-emerald-500/20 text-right">
               {/* ACTUALIZACIÓN: Reflejamos la realidad de 120 horas */}
               <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">
                 Ofertas Recientes (5 días)
               </p>
               <p className="text-2xl font-black text-white leading-none">
                 {isLoading ? '-' : filteredJobs.length}
               </p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-6 relative z-20">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-2 mb-8 flex flex-col gap-2">
          {/* Buscador */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-slate-50 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 text-slate-700 placeholder-slate-400 font-medium transition-all"
              placeholder="Busca cargo o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botones de Categorías (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                  activeCategory === cat 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Trabajos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Sincronizando con los portales...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all relative overflow-hidden cursor-default">
                {/* Línea lateral de acento */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></div>

                <div className="flex flex-col md:flex-row gap-4 pl-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {job.category}
                      </span>
                      {job.posted_at && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {job.posted_at}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                      {job.role}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium mb-3">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                        {job.location}
                      </div>
                    </div>

                    {job.requirements && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.requirements.map((req, idx) => (
                          <span key={idx} className="inline-flex items-center text-[11px] text-slate-600 bg-emerald-50/50 px-2 py-1 rounded-md border border-emerald-100/50">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end min-w-[140px] pl-4 md:border-l border-slate-100">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 mt-1">
                      {job.source}
                    </div>
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm uppercase tracking-wide group-hover:shadow-emerald-200/50"
                    >
                      Postular <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
              <Filter className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Sin resultados recientes</h3>
              <p className="text-slate-400 text-sm">No encontramos ofertas de menos de 5 días en esta categoría.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-16 text-center text-slate-400 text-xs py-8 border-t border-slate-200">
        <p>© 2025 Joboard Hunter • Conectado a Render API • Búsqueda Inteligente</p>
      </footer>
    </div>
  );
}

export default App;