import {
  Radio, Crosshair, Trophy, MountainSnow, Flag, Footprints, ExternalLink,
  ArrowRight, Swords, Sparkles, Users, ShieldCheck, RotateCcw, MessageCircle, Dice5,
} from "lucide-react";

// ---- DANE PLACEHOLDER (podmień na swoje / podepnij dane z trackera) ----

async function fetchPlayerData(playerIdConfig, defaultName, defaultInitials, accent, side) {
  const defaultPlayer = {
    id: defaultInitials.toLowerCase(), name: defaultName, initials: defaultInitials,
    accent, side, rank: "Unranked", lp: "-", games: 0, wl: "0W / 0L", wr: "-"
  };

  const riotApiKey = process.env.RIOT_API_KEY;
  if (!riotApiKey || !playerIdConfig) return defaultPlayer;

  const parts = playerIdConfig.split("#");
  if (parts.length !== 2) return defaultPlayer;
  const gameName = parts[0];
  const tagLine = parts[1];

  try {
    const accountRes = await fetch(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, {
      headers: { "X-Riot-Token": riotApiKey }
    });
    if (!accountRes.ok) throw new Error("Account not found");
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;
    const realName = accountData.gameName;

    const region = process.env.RIOT_REGION || "eun1";
    
    const summonerRes = await fetch(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
      headers: { "X-Riot-Token": riotApiKey }
    });
    if (!summonerRes.ok) throw new Error("Summoner not found");
    const summonerData = await summonerRes.json();
    const summonerId = summonerData.id;

    const leagueRes = await fetch(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
      headers: { "X-Riot-Token": riotApiKey }
    });
    if (!leagueRes.ok) throw new Error("League not found");
    const leagueData = await leagueRes.json();

    const soloq = leagueData.find(q => q.queueType === "RANKED_SOLO_5x5");
    
    if (soloq) {
      const wins = soloq.wins;
      const losses = soloq.losses;
      const total = wins + losses;
      const wr = total > 0 ? Math.round((wins / total) * 100) + "%" : "-";
      const rankStr = `${soloq.tier.charAt(0) + soloq.tier.slice(1).toLowerCase()} ${soloq.rank}`;
      
      return {
        id: defaultPlayer.id,
        name: realName,
        initials: realName.substring(0, 2).toUpperCase(),
        accent,
        side,
        rank: rankStr,
        lp: `${soloq.leaguePoints} LP`,
        games: total,
        wl: `${wins}W / ${losses}L`,
        wr: wr
      };
    } else {
      return { ...defaultPlayer, name: realName, initials: realName.substring(0, 2).toUpperCase() };
    }
  } catch (error) {
    console.error(`Failed to fetch data for ${playerIdConfig}:`, error);
    return defaultPlayer;
  }
}


const TIERS = [
  { name: "Unranked", color: "#737373", top: 92 },
  { name: "Iron", color: "#6b6b6b", top: 84.05 },
  { name: "Bronze", color: "#CD7F32", top: 76.82 },
  { name: "Silver", color: "#C0C0C0", top: 69.18 },
  { name: "Gold", color: "#FFD700", top: 61.55 },
  { name: "Platinum", color: "#00CED1", top: 53.91 },
  { name: "Emerald", color: "#50C878", top: 46.27 },
  { name: "Diamond", color: "#B9F2FF", top: 38.64 },
  { name: "Master", color: "#9B59B6", top: 26 },
  { name: "Grandmaster", color: "#FF4444", top: 17.91 },
  { name: "Challenger", color: "#F0E68C", top: 9 },
];

const DD = "https://ddragon.leagueoflegends.com/cdn";
const CHAMPS = ["Yone", "Lux", "Jinx", "Thresh", "Aatrox", "Ahri", "LeeSin", "Kaisa", "Ezreal", "Yasuo"];
const ITEMS = ["1055", "1056", "3006", "3031", "3089", "3157", "3078", "3072", "6655", "3143"];

const PACKAGES = [
  { tag: "DUO", icon: Users, kicker: "Pakiet partner", title: "Duo raz dziennie", price: "1x dziennie",
    desc: "Pomoc do dobrania partnera, kiedy solo kolejka robi się zbyt ciężka.",
    points: ["Streamer wybiera partnera", "Nie działa podczas requestu", "Partner nie może się powtarzać"], featured: false },
  { tag: "DODGE", icon: RotateCcw, kicker: "Pakiet ewakuacja", title: "Jeden dodge", price: "1x dziennie",
    desc: "Awaryjne wyjście z kolejki, gdy draft wygląda słabo.",
    points: ["Jeden dodge na dzień", "Limit jest jawny", "Po zużyciu pakiet znika"], featured: true },
  { tag: "COACH", icon: MessageCircle, kicker: "Pakiet instruktor", title: "Coach na grę", price: "1 gra",
    desc: "Jedna gra z głosową asekuracją, podpowiedziami i planem na wynik.",
    points: ["Coach pomaga na żywo", "Obowiązuje jedną grę", "Coach może się powtarzać"], featured: false },
];

export default async function Page() {
  const p1Id = process.env.PLAYER1_ID || "Gracz1#EUNE";
  const p2Id = process.env.PLAYER2_ID || "Gracz2#EUNE";

  const p1 = await fetchPlayerData(p1Id, "Gracz 1", "G1", "#FFD700", "left");
  const p2 = await fetchPlayerData(p2Id, "Gracz 2", "G2", "#7dd3fc", "right");
  const players = [p1, p2];

  return (
    <main className="min-h-screen overflow-hidden bg-[#080a0f]">
      <Hero players={players} />
      <Intro players={players} />
      <Generator />
      <RequestHistory players={players} />
      <Packages />
      <ViewerDraw />
      <footer className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        Szkielet — dane są parsowane z Riot API. Ustaw sekrety (RIOT_API_KEY, PLAYER1_ID, PLAYER2_ID) na GitHubie.
      </footer>
    </main>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ players }) {
  return (
    <section className="relative overflow-hidden bg-[#080a0f]" style={{ height: "min(46rem, calc(100dvh - 3.5rem))" }}>
      {/* tło zamiast hero_vs.webp: split red/blue + VS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(120,20,40,0.5),transparent_45%),radial-gradient(circle_at_75%_40%,rgba(14,60,90,0.5),transparent_45%),linear-gradient(180deg,#0b0f17,#080a0f)]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-[8rem] font-black text-white/[0.06]">VS</span>
      </div>

      {/* Overlay z kartami zawodników */}
      <div className="absolute inset-x-0 bottom-0 bg-[#05070b]/70 px-4 pb-4 pt-3 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end">
          <PlayerCard player={players[0]} />
          <div className="hidden self-stretch place-items-center lg:grid">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-[#FFD700]/40 bg-[#05070b]/90 text-[#FFD700] shadow-[0_0_22px_rgba(255,215,0,0.2)]">
              <MountainSnow className="h-8 w-8" />
            </div>
          </div>
          <PlayerCard player={players[1]} />
        </div>
        <ClimbTrack players={players} />
      </div>
    </section>
  );
}

function PlayerCard({ player }) {
  const right = player.side === "right";
  return (
    <a href={`/player/${player.id}`}
       className="group relative grid min-h-28 grid-cols-[auto_minmax(0,1fr)] items-stretch gap-3 overflow-hidden border border-white/12 bg-[#05070b]/82 p-2 backdrop-blur-md transition hover:border-[#FFD700]/40 sm:min-h-32"
       style={{ backgroundImage: `linear-gradient(${right ? "115deg" : "245deg"}, rgba(6,9,13,0.88), ${right ? "rgba(8,47,73,0.36)" : "rgba(76,5,25,0.36)"})` }}>
      <span className={`pointer-events-none absolute top-0 h-full w-1.5 ${right ? "right-0 bg-cyan-200/70" : "left-0 bg-rose-300/70"}`} />
      {!right && <Avatar player={player} />}
      <div className={`relative z-10 flex min-w-0 flex-col justify-between py-1 ${right ? "lg:ml-auto lg:text-right" : ""}`}>
        <div className={`flex min-w-0 flex-wrap items-center gap-2 ${right ? "lg:justify-end" : ""}`}>
          <p className="text-2xl font-black leading-[0.92] text-white sm:text-3xl lg:text-4xl">{player.name}</p>
          <span className="inline-flex shrink-0 items-center gap-1.5 border border-white/10 bg-black/30 px-1.5 py-1 text-[0.64rem] font-black uppercase tracking-[0.12em] text-[#ef4444]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /><Radio className="h-3 w-3" />live
          </span>
        </div>
        <div className={`mt-2 flex flex-wrap items-center gap-1.5 ${right ? "lg:justify-end" : ""}`}>
          <span className="inline-flex items-center gap-1.5 border border-[#FFD700]/22 bg-[#FFD700]/10 px-2 py-1 font-mono text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#FFD700]">
            <Crosshair className="h-3 w-3" />{player.rank}
          </span>
          <span className="inline-flex items-center gap-1.5 border border-white/10 bg-black/25 px-2 py-1 font-mono text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/58">
            <Trophy className="h-3 w-3" />Solo race
          </span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          <Stat label="G" value={player.games} />
          <Stat label="W/L" value={player.wl} />
          <Stat label="WR" value={player.wr} />
          <Stat label="LP" value={player.lp} />
        </div>
      </div>
      {right && <Avatar player={player} />}
    </a>
  );
}

function Avatar({ player }) {
  return (
    <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-white/18 bg-[#080a0f] [clip-path:polygon(0_0,100%_0,100%_82%,50%_100%,0_82%)] sm:h-28 sm:w-24">
      <div className="grid h-full w-full place-items-center font-mono text-lg font-black" style={{ color: player.accent }}>
        {player.initials}
      </div>
      <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0 border border-white/10 bg-black/40 px-2 py-2">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-white/34">{label}</p>
      <p className="mt-1 whitespace-nowrap font-mono text-[0.76rem] font-black leading-none text-white sm:text-sm">{value}</p>
    </div>
  );
}

/* ---------------- CLIMB TRACK ---------------- */
function ClimbTrack({ players }) {
  return (
    <section className="relative pt-1">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em]" style={{ color: "#FFD700" }}>{players[0].name}</p>
          <p className="mt-0.5 font-mono text-[0.8rem] font-black text-white/70 sm:text-sm">{players[0].rank} / {players[0].lp}</p>
        </div>
        <div className="min-w-0 text-center">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/36">Wspinaczka na Śnieżkę</p>
          <p className="mt-0.5 font-mono text-xs font-black text-white/62">Ten sam poziom</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em]" style={{ color: "#7dd3fc" }}>{players[1].name}</p>
          <p className="mt-0.5 font-mono text-[0.8rem] font-black text-white/70 sm:text-sm">{players[0].rank} / {players[0].lp}</p>
        </div>
      </div>

      <div className="relative mt-2 h-44 overflow-hidden border border-white/10 bg-[#05070b]/58 sm:h-56">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(186,230,253,0.16),transparent_26%),linear-gradient(180deg,rgba(30,41,82,0.55),rgba(12,18,38,0.42)_46%,rgba(5,7,11,0.86))]" />
        <span className="absolute right-[14%] top-[12%] h-6 w-6 rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.92),rgba(148,163,184,0.35)_60%,transparent)]" />

        {/* Góra */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="mt" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(71,93,140,0.62)" />
              <stop offset="42%" stopColor="rgba(30,45,74,0.72)" />
              <stop offset="100%" stopColor="rgba(8,12,22,0.92)" />
            </linearGradient>
            <linearGradient id="snow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(248,250,252,0.96)" />
              <stop offset="100%" stopColor="rgba(186,230,253,0.55)" />
            </linearGradient>
            <linearGradient id="trail" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,215,0,0.32)" />
              <stop offset="60%" stopColor="rgba(255,215,0,0.70)" />
              <stop offset="100%" stopColor="rgba(255,247,205,0.95)" />
            </linearGradient>
          </defs>
          <path d="M0 100 L22 58 L50 9 L78 58 L100 100 Z" fill="url(#mt)" stroke="rgba(148,163,184,0.22)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          <path d="M50 9 L58 31 L53.5 28 L50.5 34 L47 27 L43 31 Z" fill="url(#snow)" />
          <path d="M10 92 L86 82 L20 70 L72 58 L33 46 L60 34 L46 23 L50 9" fill="none" stroke="url(#trail)" strokeWidth="1.5" strokeDasharray="2.4 2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Pasy tierów */}
        <div className="absolute inset-0">
          {TIERS.map((t) => (
            <div key={t.name} className="absolute inset-x-0 z-10 flex -translate-y-1/2 items-center gap-1.5 px-2" style={{ top: `${t.top}%` }}>
              <span className="h-2 w-2 shrink-0 rounded-full border border-white/55" style={{ backgroundColor: t.color }} />
              <span className="shrink-0 whitespace-nowrap font-mono text-[0.5rem] font-black uppercase tracking-[0.08em] sm:text-[0.58rem]"
                    style={{ color: t.name === "Challenger" ? "#FFD700" : "rgba(255,255,255,0.74)" }}>
                {t.name}
              </span>
              <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.18),transparent)]" />
            </div>
          ))}

          {/* Start + szczyt */}
          <div className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 text-[0.55rem] font-black uppercase tracking-[0.14em] text-white/52" style={{ left: "10%", top: "96%" }}>
            <Footprints className="h-3.5 w-3.5 text-[#FFD700]/80" />Start
          </div>
          <div className="absolute z-20 flex -translate-x-1/2 flex-col items-center" style={{ left: "50%", top: "2%" }}>
            <Flag className="h-4 w-4 text-[#FFD700]" />
            <span className="mt-0.5 font-mono text-[0.56rem] font-black uppercase tracking-[0.12em] text-white">Śnieżka</span>
            <span className="font-mono text-[0.46rem] font-bold uppercase tracking-[0.1em] text-white/50">1603 m</span>
          </div>

          {/* Ludziki */}
          <Stickman color="#FFD700" left="6%" delay="0s" />
          <Stickman color="#7dd3fc" left="14%" delay="0.18s" />
        </div>
      </div>
    </section>
  );
}

function Stickman({ color, left, delay }) {
  return (
    <div className="stick-walker pointer-events-none absolute z-30 h-14 w-12" style={{ left, top: "91.36%", animationDelay: delay }}>
      <div className="absolute left-1/2 top-[-1.05rem] z-20 -translate-x-1/2 whitespace-nowrap border border-white/10 bg-black/56 px-1.5 py-0.5 font-mono text-[0.56rem] font-black text-white/78">Unranked</div>
      <div className="absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 overflow-hidden rounded-full border border-white/28 bg-[#080a0f]" />
      <div className="absolute left-1/2 top-6 h-7 w-9 -translate-x-1/2">
        <div className="relative h-full w-full rotate-[18deg]">
          <span className="absolute left-1/2 top-0 h-[1.125rem] w-1 -translate-x-1/2 rounded-full" style={{ backgroundColor: color }} />
          <span className="limb arm-left absolute left-[0.85rem] top-1 h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
          <span className="limb arm-right absolute right-[0.85rem] top-1 h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
          <span className="limb leg-left absolute left-[1rem] top-3.5 h-[1.125rem] w-1 rounded-full" style={{ backgroundColor: color }} />
          <span className="limb leg-right absolute right-[1rem] top-3.5 h-[1.125rem] w-1 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- INTRO ---------------- */
function Intro({ players }) {
  return (
    <section className="border-t border-white/10 bg-[#080a0f]">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:px-6 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:px-8">
        <div>
          <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">Gracz 1 vs Gracz 2</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
            Publiczne centrum challenge'u League of Legends: ranked race na świeżych kontach.
            Profile zawodników, ranking live, W/L, LP, zasady, harmonogram i requesty widzów.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {players.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                <span className="min-w-28 text-xs font-black text-white/72">{p.name}</span>
                <SocialBtn label="Discord" /><SocialBtn label="Instagram" />
              </div>
            ))}
          </div>
        </div>
        <a href="/player/p1" className="inline-flex items-center justify-center rounded-md border border-[#FFD700]/32 bg-white/[0.04] px-3 py-2 text-sm font-black text-[#FFD700] transition hover:bg-[#FFD700]/12">Profil Gracz 1</a>
        <a href="/player/p2" className="inline-flex items-center justify-center rounded-md border border-sky-300/30 bg-white/[0.04] px-3 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-300/12">Profil Gracz 2</a>
      </div>
    </section>
  );
}

function SocialBtn({ label }) {
  return (
    <a href="#" className="inline-flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.045] px-2.5 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.1em] text-white/62 transition hover:border-[#FFD700]/28 hover:bg-[#FFD700]/10 hover:text-[#FFD700]">
      {label}<ExternalLink className="h-3 w-3" />
    </a>
  );
}

/* ---------------- GENERATOR ---------------- */
function Generator() {
  const champs = [...CHAMPS, ...CHAMPS];
  const items = [...ITEMS, ...ITEMS];
  return (
    <section className="group/g relative min-h-[31rem] cursor-pointer overflow-hidden border-t border-white/10 bg-[#07090d]">
      <a href="/randomizer" aria-label="Otwórz generator" className="absolute inset-0 z-30" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#07090d_0%,rgba(7,9,13,0.88)_38%,rgba(7,9,13,0.46)_100%)]" />
      <div className="relative mx-auto grid min-h-[31rem] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="max-w-xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFD700]"><Dice5 className="h-4 w-4" />Generator</p>
          <h2 className="text-4xl font-black leading-none text-white sm:text-5xl">Request zanim wejdzie do gry</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/62">Champion, pozycja, summoner spelle, runy i build w jednym losowaniu.</p>
          <span className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#FFD700] px-4 py-3 text-sm font-black text-[#080a0f] transition group-hover/g:bg-[#ffe45c]">Otwórz generator<ExternalLink className="h-4 w-4" /></span>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#080a0f]/72 p-3 backdrop-blur">
          <div className="pointer-events-none absolute inset-y-3 left-1/2 z-20 w-px -translate-x-1/2 bg-[#FFD700]/72 shadow-[0_0_20px_rgba(255,215,0,0.65)]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-[linear-gradient(90deg,#080a0f,transparent)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-[linear-gradient(270deg,#080a0f,transparent)]" />
          <div className="overflow-hidden rounded-md">
            <div className="champion-track flex w-max gap-2">
              {champs.map((c, i) => (
                <div key={`${c}-${i}`} className={`relative h-48 w-32 shrink-0 overflow-hidden rounded-md border bg-[#0d1118] sm:h-56 sm:w-40 ${c === "Jinx" ? "border-[#FFD700]/70" : "border-white/10"}`}>
                  <img src={`${DD}/img/champion/splash/${c}_0.jpg`} alt={c} className="absolute inset-0 h-full w-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,10,15,0.42))]" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 overflow-hidden rounded-md border border-white/10 bg-black/24 px-1.5 py-2">
            <div className="item-track flex w-max gap-2">
              {items.map((it, i) => (
                <div key={`${it}-${i}`} className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-white/12 bg-[#0d1118] sm:h-16 sm:w-16">
                  <img src={`${DD}/15.4.1/img/item/${it}.png`} alt={`item ${it}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- REQUEST HISTORY ---------------- */
function RequestHistory({ players }) {
  return (
    <section className="border-t border-white/10 bg-[#080a0f]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFD700]"><Swords className="h-4 w-4" />Historia requestów</p>
            <h2 className="max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">Co widzowie wrzucili do kolejki</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">Ostatnie zatwierdzone i oczekujące champion requesty z donate'ów, z warunkiem i statusem.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:ml-auto sm:min-w-[24rem]">
            {[["Requesty", "0"], ["Aktywne", "0"], ["Wartość", "0 zł"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-white/10 bg-[#0d1118] px-3 py-3 text-right">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/36">{l}</p>
                <p className="mt-1 truncate font-mono text-xl font-black text-white sm:text-2xl">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#0d1118]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-xs font-black text-white/72">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.accent }} />{p.name}
                </span>
              ))}
            </div>
            <a href="/requesty" className="inline-flex items-center gap-1.5 rounded-md border border-[#FFD700]/30 px-2.5 py-1.5 text-xs font-black text-[#FFD700] transition hover:border-[#FFD700]/60">Pełna kolejka<ArrowRight className="h-3.5 w-3.5" /></a>
          </div>
          <div className="px-4 py-8 text-sm leading-6 text-white/52">Pierwsze requesty pojawią się po zatwierdzeniu donate'ów w panelu moderatora.</div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PACKAGES ---------------- */
function Packages() {
  const splash = { DUO: "Taric_4", DODGE: "Renekton_6", COACH: "Lulu_5" };
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#071014]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#071014,#0b1417_52%,#080a0f)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-7 text-4xl font-black leading-none text-white sm:text-5xl">Pakiety pomocy streamera</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {PACKAGES.map((pk) => {
            const Icon = pk.icon;
            return (
              <article key={pk.tag} className={`relative overflow-hidden rounded-lg border bg-[#101417]/88 ${pk.featured ? "border-[#FFD700]/48 md:-translate-y-3" : "border-white/12"}`}>
                {pk.featured && <div className="absolute inset-x-0 top-0 z-20 bg-[#FFD700] px-4 py-1.5 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#071014]">awaryjny pick</div>}
                <div className="relative h-44 overflow-hidden sm:h-52">
                  <img src={`${DD}/img/champion/splash/${splash[pk.tag]}.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" style={{ objectPosition: "60% 34%" }} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(7,16,20,0.76))]" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-md border border-white/14 bg-[#071014]/72 text-[#FFD700] backdrop-blur"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FFD700]">{pk.tag}</p>
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-white/62">Pool Party</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">{pk.kicker}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h3 className="text-2xl font-black leading-none text-white">{pk.title}</h3>
                    <p className="shrink-0 font-mono text-lg font-black text-[#FFD700]">{pk.price}</p>
                  </div>
                  <p className="mt-4 min-h-16 text-sm font-semibold leading-6 text-white/58">{pk.desc}</p>
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                    {pk.points.map((pt) => (
                      <div key={pt} className="flex items-start gap-2 text-sm font-semibold text-white/68">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200/80" /><span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- VIEWER DRAW ---------------- */
function ViewerDraw() {
  const pool = ["SubKing", "top diff", "mleczny", "Kasia", "RiftFan", "NocnySub"];
  return (
    <section className="relative min-h-[29rem] overflow-hidden border-t border-white/10 bg-[#090b10]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#090b10,#0b1018_54%,#111217)]" />
      <div className="relative mx-auto grid min-h-[29rem] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#0d1118] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#FFD700]" /><p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Pula widzów</p></div>
              <span className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-xs font-black text-emerald-100">gotowi</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pool.map((n) => <span key={n} className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-3 text-sm font-black text-white/72">{n}</span>)}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {["SubKing", "top diff", "mleczny"].map((n, i) => (
                <div key={n} className="min-h-24 rounded-md border border-[#FFD700]/22 bg-[#FFD700]/10 p-3">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#FFD700]">miejsce {i + 1}</p>
                  <p className="mt-5 truncate font-mono text-lg font-black text-white">{n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="order-1 max-w-xl lg:order-2 lg:ml-auto">
          <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFD700]"><Users className="h-4 w-4" />Losowanie widzów</p>
          <h2 className="text-4xl font-black leading-none text-white sm:text-5xl">Trzy osoby z puli, bez arkuszy na streamie</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/62">Subowie trafiają do puli, moderator widzi statusy, a losowanie wybiera osoby gotowe do wejścia.</p>
          <a href="/widzowie" className="mt-7 inline-flex items-center gap-2 rounded-md border border-white/14 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.1]">Otwórz losowanie<ExternalLink className="h-4 w-4" /></a>
        </div>
      </div>
    </section>
  );
}
