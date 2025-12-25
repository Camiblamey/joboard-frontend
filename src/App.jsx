import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, DollarSign, ExternalLink, Filter, Search, 
  Clock, CheckCircle2, TrendingUp, RefreshCw, AlertCircle, Globe, 
  Briefcase, MapPin, Linkedin, ServerCrash 
} from 'lucide-react';

// --- UTILIDADES ---
const getDynamicDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const todayDate = new Date();
const formattedToday = `${todayDate.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][todayDate.getMonth()]} ${todayDate.getFullYear()}`;

// --- CONFIGURACIÓN DE FUENTES (PORTALES) ---
const SOURCES = {
  LINKEDIN: { name: 'LinkedIn', color: 'bg-[#0077b5]', text: 'text-white' },
  LABORUM: { name: 'Laborum', color: 'bg-[#ff6b00]', text: 'text-white' },
  COMPUTRABAJO: { name: 'Computrabajo', color: 'bg-[#2088c2]', text: 'text-white' },
  TRABAJANDO: { name: 'Trabajando.com', color: 'bg-[#fdb913]', text: 'text-slate-900' },
  CHILETRABAJOS: { name: 'Chiletrabajos', color: 'bg-[#e03a3c]', text: 'text-white' },
  INDEED: { name: 'Indeed', color: 'bg-[#2164f3]', text: 'text-white' }
};

// --- DATOS SIMULADOS (FALLBACK) ---
// Estos datos se usan si el servidor real no está conectado.
const MOCK_DATA = [
  {
    id: 1, category: 'Planner', role: 'Demand Planner Senior', company: 'Nestlé Chile',
    location: 'Las Condes, RM', daysAgo: 0, source: 'LINKEDIN',
    requirements: ['Ing. Comercial/Civil', 'Exp. Consumo Masivo', 'SAP APO'],
    salary: 'No especificado', link: 'https://www.linkedin.com', hot: true
  },
  {
    id: 2, category: 'Planner', role: 'Planner de Producción', company: 'Carozzi S.A.',
    location: 'San Bernardo, RM', daysAgo: 1, source: 'COMPUTRABAJO',
    requirements: ['Gestión de MRP', 'Control de Inventarios', 'Excel Avanzado'],
    salary: '$1.400.000 - $1.600.000', link: 'https://www.computrabajo.cl', hot: false
  },
  {
    id: 3, category: 'Planner', role: 'Supply Planner Importados', company: 'Retail Falabella',
    location: 'Santiago Centro', daysAgo: 0, source: 'LABORUM',
    requirements: ['Inglés Intermedio', 'Coordinación Comex', 'Excel Avanzado'],
    salary: 'No especificado', link: 'https://www.laborum.cl', hot: true
  },
  {
    id: 4, category: 'Product Manager', role: 'Product Manager Digital', company: 'Banco BCI',
    location: 'Híbrido / Las Condes', daysAgo: 2, source: 'TRABAJANDO',
    requirements: ['Metodologías Ágiles', 'UX/UI Basics', 'KPIs Digitales'],
    salary: 'No especificado', link: 'https://www.trabajando.cl', hot: false
  },
  {
    id: 6, category: 'CPFR', role: 'Analista CPFR (Walmart)', company: 'Empresa Confidencial',
    location: 'Quilicura, RM', daysAgo: 0, source: 'CHILETRABAJOS',
    requirements: ['Retail Link', 'Análisis de Instock', 'Relación con clientes'],
    salary: '$1.500.000 app.', link: 'https://www.chiletrabajos.cl', hot: true
  },
];

const CATEGORIES = ['Todos', 'Planner', 'Product Manager', 'Category / Lead', 'CPFR'];
const SOURCE_FILTERS = ['Todas', ...Object.values(SOURCES).map(s => s.name)];

// LOGO
const Logo = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="100" height="100" rx="22" fill="#10B981" />
    <circle cx="62" cy="38" r="14" stroke="white" strokeWidth="9" />
    <path d="M52 48 L42 58 C35 65 35 75 45 80 C52 83 60 80 62 72" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function JoboardApp() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSource, setActiveSource] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para la conexión con el Backend
  const [jobs, setJobs] = useState([]); // Inicia vacío
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, connected, disconnected

  // --- EFECTO: CARGAR DATOS (backend o mock) ---
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // INTENTO DE CONEXIÓN REAL
        // Nota: Esto fallará en la vista previa del editor web, pero funcionará
        // si ejecutas 'server.py' en tu máquina local.
        const response = await fetch('http://127.0.0.1:8000/jobs', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error("Backend no disponible");
        
        const realData = await response.json();
        setJobs(realData);
        setConnectionStatus('connected');
        console.log("Conectado al Backend Python:", realData);

      } catch (error) {
        // FALLBACK: SI FALLA, USAR DATOS FALSOS
        console.warn("Backend no detectado. Usando datos de prueba (Mock Data).");
        setJobs(MOCK_DATA);
        setConnectionStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // --- EFECTO: FILTRADO ---
  useEffect(() => {
    const results = jobs.filter(job => {
      // Manejo de seguridad por si el source no existe en nuestro mapa
      const sourceConfig = SOURCES[job.source] || { name: 'Desconocido' };
      const jobSourceName = sourceConfig.name;

      const matchesCategory = activeCategory === 'Todos' || job.category === activeCategory;
      const matchesSource = activeSource === 'Todas' || jobSourceName === activeSource;
      const matchesSearch = 
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSource && matchesSearch;
    });
    
    // Ordenar por fecha (asumiendo que daysAgo existe)
    results.sort((a, b) => (a.daysAgo || 0) - (b.daysAgo || 0));
    setFilteredJobs(results);
  }, [activeCategory, activeSource, searchTerm, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* --- Header --- */}
      <header className="bg-slate-900 text-white shadow-xl relative overflow-hidden border-b border-emerald-900/50">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-900/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            
            {/* Branding */}
            <div className="flex items-center gap-5">
              <div className="shrink-0 bg-white/5 p-2 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
                <Logo className="w-16 h-16 md:w-20 md:h-20" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center">
                     <RefreshCw className="w-3 h-3 mr-1 animate-spin-slow"/> V 3.0 Hybrid
                  </span>
                  
                  {/* Status Indicator */}
                  {connectionStatus === 'connected' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30 uppercase tracking-wider flex items-center">
                      <Globe className="w-3 h-3 mr-1"/> Online (Python API)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center" title="Ejecuta server.py para ver datos reales">
                      <ServerCrash className="w-3 h-3 mr-1"/> Modo Demo (Mock Data)
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  Joboard <span className="text-emerald-500">Hunter</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-md mt-1">
                  Agregador multi-fuente de ofertas Supply Chain en Chile.
                </p>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="flex gap-4">
               {/* Stat 1 */}
               <div className="hidden lg:block bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 text-right">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Fuentes Activas</p>
                 <div className="flex items-center justify-end gap-2">
                   <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-[#0077b5] border-2 border-slate-900"></div>
                     <div className="w-6 h-6 rounded-full bg-[#ff6b00] border-2 border-slate-900"></div>
                     <div className="w-6 h-6 rounded-full bg-[#2088c2] border-2 border-slate-900"></div>
                   </div>
                   <span className="text-xl font-bold text-white">6</span>
                 </div>
               </div>

               {/* Stat 2 */}
               <div className="bg-emerald-500/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-500/20 text-right min-w-[140px]">
                 <div className="flex items-center justify-end gap-2 mb-1 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   Nuevas Hoy
                 </div>
                 <p className="text-4xl font-black text-white">
                    {isLoading ? '-' : filteredJobs.filter(j => j.daysAgo === 0).length}
                 </p>
               </div>
            </div>

          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-1 mb-8">
          <div className="flex flex-col lg:flex-row">
            
            {/* Buscador */}
            <div className="relative flex-1 p-2">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
                placeholder="Buscar cargo, empresa o palabra clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="h-px lg:h-auto lg:w-px bg-slate-100 mx-2"></div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2 p-2">
              
              {/* Filtro Categoría */}
              <div className="relative group min-w-[180px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Briefcase className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500" />
                </div>
                <select 
                  className="appearance-none w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer border-r-[16px] border-transparent"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Filtro Fuentes */}
              <div className="relative group min-w-[180px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Globe className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500" />
                </div>
                <select 
                  className="appearance-none w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer border-r-[16px] border-transparent"
                  value={activeSource}
                  onChange={(e) => setActiveSource(e.target.value)}
                >
                  {SOURCE_FILTERS.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- Job List --- */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
             <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 animate-pulse">
                <div className="bg-slate-200 w-16 h-16 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-slate-200 w-1/3 mx-auto rounded mb-2"></div>
                <div className="h-3 bg-slate-200 w-1/4 mx-auto rounded"></div>
             </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} sourceConfig={SOURCES[job.source] || { name: 'Otro', color: 'bg-gray-500', text: 'text-white' }} />
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No se encontraron resultados</h3>
              <p className="text-slate-500 text-sm mt-1">Intenta cambiar los filtros de búsqueda o categoría.</p>
              <button 
                onClick={() => {setActiveCategory('Todos'); setActiveSource('Todas'); setSearchTerm('');}}
                className="mt-4 text-emerald-600 font-bold text-sm hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>
      
       <footer className="max-w-7xl mx-auto px-4 mt-16 pb-10 text-center border-t border-slate-200 pt-10">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Logo className="w-6 h-6 grayscale" />
          <span className="font-bold text-slate-600">Joboard</span>
        </div>
        <p className="text-slate-400 text-xs max-w-2xl mx-auto">
          {connectionStatus === 'connected' 
             ? "Conectado al servidor Python local. Datos en tiempo real." 
             : "Modo Demo: Ejecuta los scripts de Python para ver datos reales."}
        </p>
      </footer>
    </div>
  );
}

function JobCard({ job, sourceConfig }) {
  const isToday = job.daysAgo === 0;
  const dateString = getDynamicDate(job.daysAgo || 0);

  return (
    <div className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col md:flex-row gap-5 relative overflow-hidden">
      
      {/* Indicador lateral de fuente */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${sourceConfig.color}`}></div>

      {/* Info Principal */}
      <div className="flex-1 pl-3">
        {/* Badges superiores */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Badge de Fuente */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sourceConfig.color} ${sourceConfig.text}`}>
            <Globe className="w-3 h-3" /> {sourceConfig.name}
          </span>
          
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {job.category}
          </span>

          {job.hot && (
             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1">
               <TrendingUp className="w-3 h-3" /> Alta Demanda
             </span>
          )}
        </div>

        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
              {job.role}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                {job.company}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                {job.location}
              </div>
            </div>
          </div>
          
          {/* Fecha (Desktop) */}
          <div className="text-right hidden sm:block">
            <div className={`text-xs font-bold ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isToday ? 'PUBLICADO HOY' : `Hace ${job.daysAgo || 0} días`}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
              {dateString}
            </div>
          </div>
        </div>

        {/* Requisitos y Salario */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {job.requirements && job.requirements.map((req, idx) => (
               <span key={idx} className="inline-flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-slate-400" /> {req}
               </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[200px]">
            <div className={`text-sm font-bold flex items-center ${job.salary !== 'No especificado' ? 'text-slate-700' : 'text-slate-400'}`}>
               <DollarSign className="w-4 h-4 mr-0.5 text-slate-400" />
               {job.salary === 'No especificado' ? 'A convenir' : job.salary}
            </div>
            
            <a 
              href={job.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              Ver Oferta <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}