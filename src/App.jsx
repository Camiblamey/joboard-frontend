import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  Globe, 
  Building2,
  Calendar,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Todas');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Esta es la URL de tu servidor en Render que configuramos en el Paso 1
        const apiUrl = 'https://joboard-api.onrender.com/jobs';
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('El servidor respondió con un error.');
        }

        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.message);
        // Datos de respaldo por si el servidor de Render está "durmiendo" o falla
        const demoData = [
          {
            id: 1,
            title: "Planner Estratégico (Modo Demo)",
            company: "Servidor en espera",
            location: "Santiago",
            salary: "Revisar conexión",
            date: "Hace poco",
            source: "SISTEMA",
            link: "#"
          }
        ];
        setJobs(demoData);
        setFilteredJobs(demoData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const results = jobs.filter(job => {
      const matchesSearch = (job.role || job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (job.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = selectedLocation === 'Todas' || (job.location || "").includes(selectedLocation);
      return matchesSearch && matchesLocation;
    });
    setFilteredJobs(results);
  }, [searchTerm, selectedLocation, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Briefcase className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Joboard <span className="text-emerald-600">Chile</span></span>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all">
            Publicar Empleo
          </button>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-200 py-12 text-center px-4">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Planning Jobs <span className="text-emerald-600">En Vivo</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">
          Explora las vacantes de planificación estratégica recopiladas automáticamente por tu servidor.
        </p>
        
        <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-2 bg-slate-100 p-2 rounded-2xl shadow-inner border border-slate-200">
          <input 
            type="text" 
            placeholder="Buscar cargo o empresa..." 
            className="flex-1 px-4 py-2 bg-transparent outline-none text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            Buscar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {error && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Conectado al servidor, pero mostrando datos de respaldo (Modo Demo).</p>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
              <p className="text-slate-400 font-medium">Consultando API en Render...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-800">{job.role || job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-slate-500 text-sm">
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{job.source}</span>
                  </div>
                </div>
                <a 
                  href={job.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors w-full md:w-auto justify-center"
                >
                  Ver Oferta <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">No hay ofertas disponibles en este momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;