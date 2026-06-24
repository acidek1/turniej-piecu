const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf-8');

// Add fetchPlayerData function
const fetchPlayerDataFn = `
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
    const accountRes = await fetch(\`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/\${encodeURIComponent(gameName)}/\${encodeURIComponent(tagLine)}\`, {
      headers: { "X-Riot-Token": riotApiKey }
    });
    if (!accountRes.ok) throw new Error("Account not found");
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;
    const realName = accountData.gameName;

    const region = process.env.RIOT_REGION || "eun1";
    
    const summonerRes = await fetch(\`https://\${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/\${puuid}\`, {
      headers: { "X-Riot-Token": riotApiKey }
    });
    if (!summonerRes.ok) throw new Error("Summoner not found");
    const summonerData = await summonerRes.json();
    const summonerId = summonerData.id;

    const leagueRes = await fetch(\`https://\${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/\${summonerId}\`, {
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
      const rankStr = \`\${soloq.tier.charAt(0) + soloq.tier.slice(1).toLowerCase()} \${soloq.rank}\`;
      
      return {
        id: defaultPlayer.id,
        name: realName,
        initials: realName.substring(0, 2).toUpperCase(),
        accent,
        side,
        rank: rankStr,
        lp: \`\${soloq.leaguePoints} LP\`,
        games: total,
        wl: \`\${wins}W / \${losses}L\`,
        wr: wr
      };
    } else {
      return { ...defaultPlayer, name: realName, initials: realName.substring(0, 2).toUpperCase() };
    }
  } catch (error) {
    console.error(\`Failed to fetch data for \${playerIdConfig}:\`, error);
    return defaultPlayer;
  }
}
`;

// Replace `const PLAYERS = ...` with fetchPlayerDataFn
content = content.replace(/const PLAYERS = \[[\s\S]*?\];/m, fetchPlayerDataFn);

// Replace `export default function Page() {` with async and data fetching
content = content.replace(/export default function Page\(\) \{[\s\S]*?\}\n/, `export default async function Page() {
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
`);

// Replace Hero
content = content.replace(/function Hero\(\) \{/, 'function Hero({ players }) {');
content = content.replace(/<PlayerCard player=\{PLAYERS\[0\]\} \/>/, '<PlayerCard player={players[0]} />');
content = content.replace(/<PlayerCard player=\{PLAYERS\[1\]\} \/>/, '<PlayerCard player={players[1]} />');
content = content.replace(/<ClimbTrack \/>/, '<ClimbTrack players={players} />');

// Replace ClimbTrack
content = content.replace(/function ClimbTrack\(\) \{/, 'function ClimbTrack({ players }) {');
content = content.replace(/PLAYERS\[0\]\.name/g, 'players[0].name');
content = content.replace(/PLAYERS\[1\]\.name/g, 'players[1].name');
content = content.replace(/{PLAYERS\[0\].rank} \/ {PLAYERS\[0\].lp}/g, '{players[0].rank} / {players[0].lp}'); // Wait, the rank is hardcoded there
content = content.replace(/Unranked \/ -/g, '{players[0].rank} / {players[0].lp}').replace(/\{players\[0\]\.rank\} \/ \{players\[0\]\.lp\}/, '{players[0].rank} / {players[0].lp}').replace(/Unranked \/ -/, '{players[1].rank} / {players[1].lp}');

// Let's refine ClimbTrack replace:
let climbTrackMatches = content.match(/<p className="mt-0\.5 font-mono text-\[0\.8rem\] font-black text-white\/70 sm:text-sm">Unranked \/ -<\/p>/g);
if(climbTrackMatches && climbTrackMatches.length >= 2) {
  content = content.replace(/<p className="mt-0\.5 font-mono text-\[0\.8rem\] font-black text-white\/70 sm:text-sm">Unranked \/ -<\/p>/, '<p className="mt-0.5 font-mono text-[0.8rem] font-black text-white/70 sm:text-sm">{players[0].rank} / {players[0].lp}</p>');
  content = content.replace(/<p className="mt-0\.5 font-mono text-\[0\.8rem\] font-black text-white\/70 sm:text-sm">Unranked \/ -<\/p>/, '<p className="mt-0.5 font-mono text-[0.8rem] font-black text-white/70 sm:text-sm">{players[1].rank} / {players[1].lp}</p>');
}

// Replace Intro
content = content.replace(/function Intro\(\) \{/, 'function Intro({ players }) {');
content = content.replace(/PLAYERS\.map/, 'players.map');

// Replace RequestHistory
content = content.replace(/function RequestHistory\(\) \{/, 'function RequestHistory({ players }) {');
content = content.replace(/PLAYERS\.map/, 'players.map');

fs.writeFileSync('app/page.js', content);
