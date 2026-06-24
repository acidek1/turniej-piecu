# Masterles — szkielet (odtworzenie układu z 72hint.fail)

Statyczny szkielet strony challenge'u LoL na tym samym stacku co oryginał:
**Next.js + Tailwind + lucide-react**. Wszystkie dane to placeholdery — żadnego
backendu, żadnego live data. To czysta baza pod własny challenge.

## Co jest w środku
- `app/layout.js` — sidebar (desktop), mobilny header + dolny pasek nawigacji.
- `app/page.js` — strona główna z sekcjami:
  hero z dwiema kartami zawodników, "Wspinaczka na Śnieżkę" (góra + pasy tierów + ludziki),
  generator-ruletka (champion/item), historia requestów, pakiety, losowanie widzów.
- `app/globals.css` — Tailwind + animacje (ruletka, ludziki).

## Uruchomienie
Node 18+:
```bash
npm install
npm run dev    # http://localhost:3000
```

## Co podmienić jako pierwsze
- Zawodnicy: tablica `PLAYERS` w `app/page.js` (nazwa, inicjały, kolor, rank/LP/WR).
- Tła zamiast obrazka `hero_vs.webp` zrobiłem gradientem — podmień na własny obrazek
  (wrzuć do `public/` i użyj `<img src="/twoj-plik">`).
- Avatary: teraz inicjały w kolorowym polu (komponent `Avatar`).
- Splash/itemy w generatorze ciągną się z publicznego CDN Riota (ddragon) — zostają.

## Czego TU NIE MA (świadomie)
- Backendu / bazy (oryginał używa Convex). Strony `/randomizer`, `/zasady`, `/widzowie`
  itd. są tylko linkami — to do dorobienia.
- Podpięcia rang/LP. Tu wchodzi tracker z wcześniejszych rozmów: Riot `by-puuid`,
  op.gg MCP albo ręczny arkusz — wynik wstawiasz w `PLAYERS`.

Uwaga: to odtworzenie układu dla nauki/startu. Nazwa "Masterles", konkretni streamerzy,
teksty i logo z oryginału należą do ich autora — przy publikacji użyj własnych.
