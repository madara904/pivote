import { Badge } from "./badge";

export default function NodeLanding()
{
return (
    <div className="space-y-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* TEXT BEREICH */}
        <div className="space-y-6">
          <Badge variant="outline" className="font-mono text-[10px] tracking-[0.2em] border-primary/20 text-primary">
            Network Operations
          </Badge>
          <h1 className="text-4xl font-bold tracking-tighter">
            Global Supply Chain <br /> <span className="text-primary">Orchestration</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            Echtzeit-Visualisierung Ihrer Logistik-Knotenpunkte. Überwachen Sie den Fluss von Inquiries und Angeboten weltweit.
          </p>
          <div className="flex gap-4 pt-4">
             <div className="text-center px-4 border-r">
                <p className="text-xl font-bold">128</p>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Nodes</p>
             </div>
             <div className="text-center px-4">
                <p className="text-xl font-bold">2.4k</p>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Events</p>
             </div>
          </div>
        </div>

        {/* VISUAL BEREICH: DAS NETZWERK (Statt eines Nodes) */}
        <div className="relative h-[360px] rounded-[2.5rem] border bg-card overflow-hidden border-dashed border-border shadow-2xl">
          {/* Dot Matrix Background */}
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Das abstrakte Netzwerk */}
            <div className="relative w-64 h-64">
              {/* Zentraler Punkt (Du) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-primary rounded-full shadow-[0_0_20px_var(--primary)] z-20" />
              
              {/* Umkreisende Orbits / Verbindungen */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 border border-primary/10 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 border border-primary/5 rounded-full border-dashed animate-[spin_35s_linear_infinite_reverse]" />

              {/* "Partner" Nodes im Raster verteilt */}
              <PartnerNode top="10%" left="20%" label="LHR" delay="0s" />
              <PartnerNode top="15%" left="75%" label="JFK" delay="1s" />
              <PartnerNode top="70%" left="15%" label="SIN" delay="2s" />
              <PartnerNode top="80%" left="80%" label="DXB" delay="0.5s" />
              
              {/* Strahlende Linien-Effekte (Abstrakt) */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <line x1="50%" y1="50%" x2="20%" y2="10%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="75%" y2="15%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="15%" y2="70%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4" />
              </svg>
            </div>
          </div>

          {/* Technisches Overlay wie bei Supabase */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
             <p className="text-[9px] font-mono uppercase tracking-widest opacity-50">Global Syncing...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerNode({ top, left, label, delay }: any) {
  return (
    <div 
      className="absolute flex flex-col items-center gap-1 animate-pulse" 
      style={{ top, left, animationDelay: delay }}
    >
      <div className="h-2 w-2 bg-foreground/20 rounded-full border border-border" />
      <span className="text-[8px] font-mono text-muted-foreground font-bold tracking-tighter">{label}</span>
    </div>
  );
}