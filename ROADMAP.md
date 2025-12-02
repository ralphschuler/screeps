# ROADMAP: Schwarm-Ansatz für Screeps Bot

1. Vision & High-Level Objectives (Schwarm-Ansatz)

Zielbild
- Aufbau eines verteilten Schwarms aus vielen robusten Kolonien statt weniger übergroßer Festungen.
- Nutzung des vollen GCL: so viele Räume kontrollieren, wie der GCL erlaubt, um Wachstum und CPU-Limit zu maximieren.
- Emergent Behaviour: globale Koordination entsteht durch lokale Regeln, Pheromon-Signale und wenige globale Impulse (Expansion, Krieg, Rückzug).
- Der Bot soll alle Kernfähigkeiten beherrschen:
- Expansion (Claims + Remotes)
- Remote-Mining in neutralen/feindlichen Räumen
- Verteidigung & PvP (inkl. Nukes, Power Creeps, Boosts)
- Markt-Handel & Logistik
- Erfolgsindikatoren:
- Stetig steigende Anzahl stabiler Räume (pro Shard und shard-übergreifend)
- CPU-Budget auch bei 100+ Räumen / 5.000+ Creeps im grünen Bereich
- Hohe Resilienz: nach schweren Verlusten automatischer Wiederaufbau

Relevante Doku
- Überblick & Weltmodell (Räume, Shards, Portale)
- GCL, RCL und Progression

⸻

2. Design-Prinzipien (Ressourcen-Effizienz)
- Dezentralität
- Jeder Raum hat eine eigene, lokale Steuerlogik; globale Ebenen geben nur grobe Ziele (z.B. „Shard X: Expansion“, „Cluster Y: War“).
- Stigmergische Kommunikation
- Kommunikation über einfache Zahlen in Room.memory (Pheromon-Felder), statt große Objektbäume oder globale Maps – reduziert Memory-Größe und Parsingkosten.
- Ereignisgetriebene Logik
- Kritische Ereignisse (Hostiles, eingehende Nukes, zerstörte Strukturen, Remote-Verlust) aktualisieren sofort relevante Flags.
- Periodische Routinen (Scans, Pheromon-Updates, Markt-Analysen) laufen nur alle N Ticks.
- Aggressives Caching + TTL
- Pfade, Scans, Analyseergebnisse werden mit TTL gecacht (im globalen Objekt, nicht in Memory) und nur bei Bedarf neu berechnet.
- Striktes Tick-Budget
- Zielgrößen: „Öko-Raum“ ≤ 0,1 CPU, „Kampf-Raum“ ≤ 0,25 CPU, globaler Overmind ≤ 1 CPU alle 20–50 Ticks.
- CPU-Bucket-gesteuertes Verhalten
- High-Bucket: teurere Operationen (z.B. neue Routen, Layout-Planung) freischalten.
- Low-Bucket: nur Kernlogik, Logs drosseln.

Relevante Doku
- CPU-Limit & Bucket
- Global Objects & Performance-Hinweise

⸻

3. Architektur-Ebenen (Schichtenmodell)
1. Global Meta-Layer (Empire / Multi-Shard)
- Koordiniert Rollen von Shards (Core, Expansion, Resource, Backup).
- Nutzt InterShardMemory (100 kB pro Shard) für shard-übergreifende Ziele, Status und Routen.
2. Shard-Strategic Layer
- Pro Shard eine Instanz, die:
- Cluster priorisiert (welcher Cluster expandiert, welcher Krieg führt)
- CPU-Anteil pro Shard anpasst via Game.cpu.setShardLimits.
3. Cluster-/Kolonie-Ebene
- Gruppiert angrenzende Owned-Räume + Remotes.
- Aufgaben:
- Inter-Room-Logistik (Terminal-Transfers, Shard-Transfers)
- Koordinierte Militäraktionen (gemeinsame Rallypoints, Squads aus mehreren Räumen)
4. Raum-Ebene
- Jeder Raum:
- verwaltet lokale Ökonomie, Verteidigung, Bau, Spawnlogik
- hält Pheromone, Threat-Level, Bauzustände in Room.memory.
5. Creep-/Squad-Ebene
- Creeps/Squads implementieren einfache Rollenlogik:
- Entscheidungen basieren auf Pheromonen, Posture, lokalen Zielen.

Relevante Doku
- Game-Objekt, Rooms, Shards
- InterShardMemory

⸻

4. Memory & Datenmodelle

Global (Empire)
- Memory.empire:
- Bekannte Räume + Meta-Daten
- Liste der Cluster, Shard-Rollen, globale Expansions- & War-Targets
- Globale Konfiguration (Schwellwerte, Persönlichkeits-Tuning)

Cluster
- Memory.colonies[colonyId]:
- Räume (home, remotes, military outposts)
- Aggregierte Kennzahlen (Energie-Einkommen, Mineral-Output, Threat-Index)
- Cluster-Status (eco / war / recovery)

Raum
- Room.memory.swarm (Schema, nicht dynamisch):
- colonyLevel, intent, danger
- pheromones.{expand,harvest,build,upgrade,defense,war,siege,logistics}
- sourceMeta (pro Source Slots, Distanz, Container/Link-IDs)
- labConfig, defenseConfig, remoteConfig
- eventLog: [ [type, gameTime], … ] (FIFO, max. ~20 Einträge)

InterShardMemory
- Kompaktes JSON mit:
- Shard-Liste + Rollen
- Shard-Health (CPU, Räume, Kriegslage)
- Cross-Shard-Tasks (Migration, Kolonisation, Evakuierung).

Constraints
- Memory-Limit ca. 2 MB; große Objektbäume + serialisierte Game-Objekte vermeiden.

⸻

5. Pheromon-System (Schwarm-Signale)

Pheromon-Typen (pro Raum)
- expand, harvest, build, upgrade, defense, war, siege, logistics
- Zusätzlich:
- intent (eco, expand, defense, war, siege, evacuate)
- danger (0–3, Bedrohungslevel)

Update-Quellen
1. Periodische Updates (alle 5–10 Ticks)
- nutzen rollierende Mittelwerte:
- Energie geerntet / verbraucht
- Bauvolumen
- Controller-Fortschritt
- Hostile-Statistik
2. Event-Updates
- Hostiles gesichtet → danger++, defense↑
- Struktur zerstört → danger↑, evtl. war↑
- Nuke detected → danger = 3, siege↑
- Remote verloren → expand, harvest, danger anpassen

Decay & Diffusion
- Pheromone pro Update mit Faktor 0,9–0,99 multiplizieren („Verdampfen“).
- Diffusion:
- danger, war: an Nachbarräume propagiert (abgeschwächt)
- expand, harvest: entlang etablierter Routen (Remote-Korridore) verteilt

Nutzung
- Spawn-Prioritäten & Posture leiten sich direkt aus Pheromon-Profil ab.
- Creeps lesen nur lokale Pheromone / Posture, kein globales Wissen nötig.

⸻

6. Kolonie-Lebenszyklus (Phasen)

Stage 1 – Seed Nest (RCL 1–3)
- Ziel: erste Basis stabilisieren, schnell auf RCL 3.
- Fokus:
- Container-Mining: Container an Sources bauen.
- Übergang zu Static Mining vorbereiten (s.u.).
- Strukturen:
- RCL1: 1 Spawn, Roads, 5 Container.

Stage 2 – Foraging Expansion (RCL 3–4)
- Remote-Mining starten:
- Nachbarräume scouten
- Source-Slots bestimmen (begehbare Felder um Source)
- Remote-Container an Sources platzieren
- Reservation von Remotes:
- Reservierte Controller erhöhen Source-Capacity von 1500 auf 3000.
- Erstes Claim eines zweiten Raums, falls GCL ausreichend.

Stage 3 – Mature Colony (RCL 4–6)
- Storage (RCL4) als zentrales Lager.
- Tower (ab RCL3) und zusätzliche Tower (RCL5,6) für Verteidigung.
- Extractor, Labs, Terminal ab RCL6:
- Start des Mineral-Abbaus & erste Chemie.

Stage 4 – Fortified Hive (RCL 7–8)
- Vollausbau:
- RCL7: 2 Spawns, 50 Extensions, mehr Labs, Factory.
- RCL8: 3 Spawns, 60 Extensions, max. Tower, max. Labs, Observer, Nuker, Power Spawn.
- Komplettes Rampart-Netz um Kernstrukturen.

Stage 5 – Empire Dominance
- Mehrere RCL8-Räume (ggf. Multi-Shard).
- Power Creeps, Nukes, Markt, Commodities im Vollbetrieb.
- Shard-Rollen: z.B. Core-Shard, Resource-Shard, Backup-Shard.

⸻

7. Early-Game Strategie – Scout & Static Mining

Scout-Ansatz
- Früh einen günstigen Scout (nur MOVE) spawnen, um:
- Nachbarräume zu kartieren (Sources, Controller-Zustand, Hostiles, Portale).
- Remote-Kandidaten zu identifizieren.

Static Harvesting
- Best Practice: Harvester bleiben an der Source stehen und andere Creeps transportieren Energie; Tutorial-Variante (ein Creep macht alles) ist ineffizient.
- Quellen-Facts:
- Energy Sources: 3000 Energie in Owned-/Reserved-Räumen, 1500 sonst.
- Regeneration alle 300 Ticks; nicht abgebaute Energie verfällt.
- Optimales Setup:
- 1 Static Miner mit 5 WORK generiert 10 Energie/Tick und leert 3000 Energie in 300 Ticks → perfekte Ausnutzung.
- Container direkt neben Source; Miner benötigt kaum MOVE-Teile.
- Carrier übernehmen Transport zum Spawn/Storage (siehe Ökonomie-Rollen).

⸻

8. Ökonomie & Infrastruktur (Rollen & Flüsse)

Kernrollen
- Worker:
- Kleine Allrounder (WORK/CARRY/MOVE), übernehmen Startaufgaben (bau, upgrade, reparieren).
- Static Miner:
- 5–7 WORK, 1 MOVE, etwas CARRY (falls Container fehlt).
- Steht fix an Source/Extractor.
- Carrier:
- Schwerpunkt CARRY/MOVE.
- Dimensionierung abhängig von Distanz und Source-Output.
- Ziel: kontinuierliche Versorgung von Spawn/Extensions/Storage.
- Upgrader:
- Am Controller stationiert, meist mit eigenem Container/Link.
- Remote Miner & Remote Carrier:
- Speziell einem Remote-Source-Slot / -Container zugeordnet.
- Builder/Repairer:
- Fokus auf Ramparts/Walls, kritische Strukturen.

Logistik-Strukturen
- Storage (RCL4) als zentrales Hub.
- Links (ab RCL5/6) für Source → Storage/Controller Transfers.
- Terminal (RCL6) für Inter-Room/Markt-Transfers.

Flussketten
- Lokal: Source → Container/Link → Carrier/Link → Spawn/Extensions/Storage
- Remote: Remote Source → Container → Remote Carrier → Home-Storage/Terminal

⸻

9. Base-Blueprints (Baupläne)

Strukturgrenzen pro RCL
- Siehe offizielle Tabelle „Available structures per RCL“.

Blueprint-Level
1. Early Nest (RCL 1–2)
- 1 Spawn zentral
- 1–2 Container an Sources
- Minimale Straßen (Spawn ↔ Sources ↔ Controller)
2. Core Nest (RCL 3–4)
- Clustern von Extensions rund um Spawn
- 1 Tower in Spawn-Nähe
- Erste einfache Ramparts um Kern
3. Fortified/WAR Nest (RCL 5–8)
- 50–60 Extensions in kompakter Anordnung
- 3–6 Tower, symmetrisch für volle Abdeckung (Range-Falloff berücksichtigen).
- Ramparts um Kern und ggf. Exits
- Lab-Block, Factory, Observer, Nuker, Power Spawn eng geplant

Implementierung
- Blueprints als Koordinaten-Arrays im Code (relativ zu „Anchor“ – z.B. Main Spawn).
- Auswahl nach Raumtyp (Öko-Bunker, Kriegsbunker etc.).
- Kann später durch automatische Planner (z.B. Floodfill/Distance Transform) ersetzt werden.

⸻

10. Creep-Ökosystem – Rollen & Benennung

Wirtschaft
- worker, staticMiner, carrier, upgrader, builder, mineralMiner, mineralCarrier.
- Remote-Varianten mit Zielraum/Source in Namen codiert.

Scouting & Expansion
- scout: kartiert Räume, Portale, feindliche Basen.
- claimer, reserver: CLAIM-Creeps für neue Räume bzw. Reservation.

Verteidigung
- defender (melee, TOUGH/ATTACK/MOVE)
- rangedDefender (RANGED_ATTACK/MOVE/TOUGH)
- healer (HEAL/MOVE/TOUGH)

Offensive
- soldier (melee oder ranged / mixed)
- siegeDismantler (WORK/TOUGH/MOVE)
- harasser (kleine, schnelle Störer)
- Squads: Gruppen mit gemeinsamem Squad-Namen (z.B. raidAlpha.*)

Utility
- linkManager (falls per Creep gelöst)
- explorer (Controller-Touch, Spezialaufgaben)

Power Creeps
- Öko-Operator (Spawn/Tower/Lab/Storage-Powers)
- Combat-Operator (DISRUPT, SHIELD, etc.)

⸻

11. Cluster- & Empire-Logik

Cluster-Aufgaben
- Monitoring:
- Aggregierte Energie, Mineralien, Threat-Werte.
- Logistik:
- Terminal-Transfers zwischen Räumen (z.B. Energy → Neubau-Raum, Mineralien → Chemie-Hub).
- Militär:
- Formierung von Squads aus mehreren Räumen
- Gemeinsame Rallypoints
- Unterstützung angegriffener Räume mit Verstärkung

Empire-Aufgaben
- Shard-Rollen:
- core, expansion, resource, backup
- War Targets:
- Priorisierte feindliche Spieler/Räume (global)
- Nuke Candidates:
- Zielräume mit hohem strukturellem/strategischem Wert
- Inter-Shard Portale:
- Graph aus Portalen mit Distanz & Gefahrenklasse, für Expansion und Evakuierung.

⸻

12. Kampf & Verteidigung (Adaptives Verhalten)

Threat-Level & Posture
- danger 0–3:
- 0: ruhig
- 1: Hostile gesichtet
- 2: aktiver Angriff
- 3: Belagerung/Nuke
- Postures:
- eco, defense, war, siege, evacuate
- Wirkung:
- Spawn-Profile (z.B. in defense/war Militärrollen bevorzugen)
- Boost-Level (nur in war/siege)

Tower-Control
- Towers schießen und reparieren:
- Priorisierung: Healer > Ranged > Melee > Support
- Range-Falloff beachten (nahe Ziele bevorzugen).
- In Friedenszeiten:
- Limitierte Repair-Last (z.B. nur unter bestimmten Hits-Schwellen)

Defensive Creeps & Safe Mode
- Dynamische Verteidiger:
- Spawns halten immer Slots frei für „Sofort-Defender“.
- Safe Mode:
- Falls Verteidigung nicht reicht → Safe Mode als Notbremse, 20.000 Ticks Schutz; Cooldown-Regeln beachten.

Offensive Doktrin
- Eskalation:
- Harassment → Raids → Siege
- Squads:
- Komposition & Rallypoints pro Zielraum
- Korrelation mit Nukes & Boosts (siehe Punkte 13 & 16)

⸻

13. Nukes (Atomschläge)

Nuker & Ressourcenkosten
- Nuker (RCL8): 1 pro Raum erlaubt.
- Kosten pro Nuke:
- 300.000 Energie + 5.000 Ghodium.

Detection & Folgen
- Eingehende Nukes über Room.nukes oder Observer-Scans.
- Flugzeit ca. 50.000 Ticks.
- Schaden:
- 10.000.000 Hits im Zentrum, 5.000.000 im Radius; zerstört fast alle Strukturen in diesem Bereich.
- Safe Mode wird bei Einschlag beendet, 200 Ticks Sperre.

Nuke-Scoring & Einsatz
- Score-Faktoren:
- RCL, Anzahl/Typ wertvoller Strukturen, Tower-Dichte, Distanz, aktueller Kriegszustand.
- Einsatz:
- Nuke nur bei hohem Score + ausreichenden Ressourcen.
- Koordination mit Siege-Squads kurz vor Einschlag (Synergie: zerstörte Tower/Ramparts).

⸻

14. Power Creeps (Endgame-Einheiten)

Mechanik
- Global Power Level (GPL) → Anzahl und Level der Power Creeps.
- Power Creeps sind account-gebunden und respawnbar (Power Spawn, Cooldown).

Operator-Powers (Beispiele)
- Ökonomie:
- OPERATE_SPAWN (schnelleres Spawning)
- OPERATE_TOWER (Tower-Effizienz)
- OPERATE_LAB, OPERATE_STORAGE, OPERATE_FACTORY
- Kampf:
- DISRUPT_SPAWN, DISRUPT_TOWER, SHIELD (mobiler Schutzrampart)

Einsatzstrategie
- Öko-Operator:
- Sitzt meist im Haupt-Öko-Raum und benutzt Langzeit-Powers auf Spawn/Tower/Labs/Storage in Intervallen.
- Combat-Operator:
- Wird im War-/Siege-Modus in Front-Räume verlegt und nutzt offensive Powers taktisch.
- CPU-Effizienz:
- Power Creeps werden nur in dedizierten Intervallen geupdatet (z.B. alle X Ticks), nicht in jedem Tick.

⸻

15. Markt-Integration (Handels-KI)

Markt-Mechanik
- Game.market.createOrder (5 % Credit-Fee pro Order).
- Game.market.deal für direkte Käufe/Verkäufe; Energy-Transportkosten trägt die ausführende Seite.

Strategie
- Parameter:
- Mindest-Credit-Reserve
- Zielbestände pro Ressource / Compound
- Eco-Modus:
- Überschüsse verkaufen, fehlende Basisminerale ggf. nachkaufen.
- War-Modus:
- Aggressiver Einkauf von Boost-Mineralen, Ghodium, ggf. Energie.
- Taktik:
- Möglichst große Pakete auf einmal traden, um Transportkosten zu minimieren.
- Orders regelmäßig prüfen/erneuern; ungenutzte Orders canceln.

⸻

16. Lab- & Boost-System

Lab-Setup
- RCL6: bis zu 3 Labs; RCL8: bis zu 10 Labs.
- Labs müssen innerhalb Range 2 zueinander stehen, um zu reagieren.
- Typische Struktur:
- 2 Input-Labs (Reaktanten)
- 3–8 Output-Labs (Produkte)

Chemie-Steuerung
- Ziel-Bestände für wichtige Compounds (v.a. T3 Boosts).
- Reaktionsketten automatisch planen:
- Rohstoffe → Zwischenprodukte → Endprodukte
- lab.runReaction(labA, labB) steuert Produktion.

Boost-System
- lab.boostCreep(creep):
- 30 Mineral + 20 Energie pro Bodypart; Effekt multipliziert die Part-Leistung.
- Boost-Politik:
- Nur bei größeren Kämpfen / Operationen boosten.
- Spezial-Labs in Spawn-Nähe mit fertigen Boosts bevorraten.
- lab.unboostCreep kann ggf. nach Krieg eingesetzt werden (Rückgewinnung von 50 % der Mineralien).

⸻

17. Mauern & Ramparts (Verteidigungsplanung)

Struktur-Basics
- Walls blocken alle Creeps.
- Ramparts:
- Eigene Creeps/Strukturen können darauf stehen; feindliche werden blockiert.
- Rampart schützt alles auf seinem Feld.
- Max-Hits von Ramparts steigen mit RCL, bis 300M Hits auf RCL8.

Core-Shell & Perimeter
- Core:
- Alle Kernstrukturen (Spawn, Storage, Terminal, Labs, Nuker, Power Spawn) unter Ramparts.
- Perimeter:
- Walls/Ramparts an Exits und Engpässen.
- Perimeter kann im Frieden „heruntergefahren“ werden (wenig Hits / nicht repariert), um Energie zu sparen.

Dynamische Reparaturziele
- Ziel-Hits pro Gefahrenlevel:
- Danger0: z.B. 100k
- Danger1: ~300k
- Danger2: ~5M
- Danger3: 50M+
- Tower:
- Reparieren im Notfall Ramparts before they fall; sind aber energie-ineffizient.
- Builder:
- Kontinuierliche Instandhaltung, effizienter als Tower.

⸻

18. CPU-Management & Scheduling

Frequenzebenen
1. High Frequency (jeder Tick)
- Creep-Loops (inkl. Bewegung)
- grundlegende Raumlogik (Spawns, Tower, einfache Checks)
- Memory-Cleanup (Memory.creeps)
2. Medium Frequency (alle 5–20 Ticks)
- Pheromon-Updates
- Cluster-Logik (Transfers, War-Koordination)
- Lab- und Markt-Routinen
3. Low Frequency (≥100 Ticks)
- Welt-Mapping, Portal-Suche
- Nuke-Scoring, großflächige Routenberechnung
- InterShard-Koordination

Bucket-Strategie
- High-Bucket (z.B. >9000):
- Geplante „CPU-Spikes“ (Pre-computation von Pfaden, Layout-Optimierungen).
- Low-Bucket (z.B. <2000):
- Nur Kernlogik, Logs minimieren, optional Teile der Rooms pro Tick auslassen.

Relevante Doku
- CPU-Bucket & Grenzen (max +500 CPU/Tick, max 10.000 Bucket).

⸻

19. Resilienz & Respawn-Fähigkeit

Redundanz
- Möglichst früh mehrere Räume pro Shard claimen; nie nur ein Kernraum.
- Shard-übergreifende Verteilung (Core + Backup-Shard).

Notfallpläne
- InterShardMemory:
- Enthält „Recovery-Plan“ (z.B. empfohlener Respawn-Sektor).
- Vor absehbarem Wipe:
- Ressourcen abziehen (Markt/Terminals)
- ggf. Power Creeps / spezielle Creeps in sichere Räume verlegen.

Respawn
- GCL bleibt nach Respawn erhalten – sofortige Mehrraum-Expansion möglich.
- Code & Architektur bleiben identisch; System baut neu auf, aber mit gelerntem Verhalten.

⸻

20. Bewegung, Pathfinding & Traffic-Management

Grundprinzipien
- Pathfinding ist eine der teuersten CPU-Operationen; Standard-Creep.moveTo nutzt intern PathFinder.
- Ziel: Pfadfindung so selten wie möglich, Nutzung von:
- reusePath
- moveByPath
- global/raumweise gecachten Pfaden
- CostMatrices

Lokal-Strategie (pro Creep)
- moveTo(target, { reusePath: N }):
- N deutlich > 5 (Standard), z.B. 20–50, um Re-Pathing zu reduzieren.
- Pfade mit Room.serializePath / Room.deserializePath im creep.memory oder globalem Cache speichern.
- moveByPath für bekannte Routen (z.B. Remote-Route).

Global/Room-Level-Pfadmanagement
- Zentrale Pfade:
- Storage ↔ jede Source
- Storage ↔ Controller
- Storage ↔ Remote-Eingang
- Diese Pfade werden mit PathFinder.search einmalig (oder selten) berechnet und geteilt.
- CostMatrices:
- Terrain-Kosten
- Zusatzkosten für:
- Ramparts (je nach Modus)
- Straßen (günstiger)
- Massen-Traffic-Korridore

Traffic-Regeln für 5.000+ Creeps
- Kein mehrfaches moveTo pro Tick: Jede Rolle stellt sicher, dass pro Creep nur ein Move-Intent erzeugt wird (sonst überschreiben sich Pfade).
- Stuck-Detection:
- creep.memory.stuck–Zähler; bei >N: Pfad neu berechnen oder „Side-Step“ versuchen.
- Yield-Regeln:
- Creeps mit „niedriger Priorität“ weichen solchen mit hoher (z.B. Hauler weichen Defendern).
- Flow-Field-Ansätze:
- Für stark frequentierte Routen (z.B. Storage↔Spawn) Nutzung von globalen „Richtungsfeldern“.

Remote & Inter-Room Bewegung
- Nutzung von Portalen & Exits:
- Pfade Raum-übergreifend mit PathFinder unter Angabe von roomCallback.
- Optionale Nutzung von Community-Libs (z.B. Traveler / Cartographer) – aber Architektur bleibt so, dass Austausch jederzeit möglich ist.

⸻

21. Logging, Monitoring & Visualisierung

Logging-Ebenen
- Core-Events:
- Warnungen: CPU-Überlauf, Bucket < X, fehlgeschlagene Spawns, Nuke-Detection.
- Fehler: nicht gefangene Exceptions, Logik-Inkonsistenzen.
- Stat-Logs (z.B. alle 100 Ticks):
- Energy-Income, Upkeep, Controller-Progress, Lab-Produktion, Markt-Bilanzen.
- Cluster/Empire-Logs:
- Kriegsstatus, Nuke-Status, Shard-Rollen.

Alle Logs sollten über abstraction gehen (logger.info/debug/warn/error) um später Storage (Konsole, Segment, externe Stats-Tools) wechseln zu können.

Persistente Stats
- Nutzung von Memory-Segments oder externen Endpunkten (Influx/Prometheus) optional.
- Minimalversion: aggregierte Statistik in einem Memory-Segment, das von einer Visualisierung (z.B. Grafana-Proxy) ausgelesen wird.

In-Game Visualisierung
- RoomVisual für:
- Pheromon-Heatmaps
- Pfade & Traffic-Lanes
- Blueprint-Overlay (geplante vs. gebaute Strukturen)
- Live-Kampfinformationen (Zielprioritäten, Schaden/ Tick).
- Nur für sichtbare/aktuelle Räume aktiv (z.B. nur wenn du die Roomansicht offen hast oder nach Debug-Flag).

Debug-Levels
- Konfigurierbare LOG_LEVEL pro Subsystem (movement, combat, market, labs, empire).
- Möglichkeit, Debug-Flags im Spiel zu setzen (z.B. per Flag-Name oder Terminal-Command), um bestimmtes Subsystem temporär „laut“ zu schalten.

⸻

22. Projektstruktur, Modularität & Tests

Code-Struktur (TypeScript-Beispiel)
- src/
- core/
- mainLoop.ts
- scheduler.ts
- logger.ts
- memory/
- schema.ts (statische Typen für Memory)
- swarmState.ts (Pheromon-Handling)
- interShard.ts
- rooms/
- roomRunner.ts
- roomEconomy.ts
- roomDefense.ts
- roomPlanning.ts
- creeps/
- roles/*.ts (eine Datei pro Rolle)
- movement.ts (Pathfinder + Traffic-Regeln)
- clusters/
- clusterManager.ts
- empire/
- empireManager.ts
- marketManager.ts
- powerManager.ts
- nukeManager.ts
- labs/
- chemistryPlanner.ts
- boostManager.ts
- defense/
- towerLogic.ts
- wallManager.ts
- planning/
- blueprints.ts
- layoutPlanner.ts
- visuals/
- roomVisuals.ts
- config/
- tuning.ts (Schwellwerte, Persönlichkeits-Profile)

Modularität & Testbarkeit
- Jedes Subsystem:
- hat klar definierte Input/Output-Schnittstellen
- arbeitet idealerweise auf einfachen Datenstrukturen (Plain Objects, IDs)
- Unit-Tests (z.B. Jest):
- Pheromon-Regeln, Lab-Reihenfolgen, Market-Strategien, Spawn-Prioritäten.
- Simulation/Replay:
- Logik-Module so geschrieben, dass sie mit „Fake-Game-State“ getestet werden können.
- Replays von kritischen Ticks (z.B. Kämpfe) gegen gespeicherten Input erneut abspielbar.

Konfiguration
- Zentraler config/tuning.ts:
- Aggressivität (Expansions-Stärke)
- War/Nuke/Boost-Schwellen
- CPU-Budget pro Ebene
- Ermöglicht schnell unterschiedliche „Persönlichkeiten“ des Bots zu testen, ohne Kernlogik zu ändern.
