# WILDLANDS — herní plán

## Hlavní smyčka

```mermaid
flowchart TD
    START["DEN ZAČÍNÁ"] --> HOME["DŮM<br/>bezpečná zóna"]
    HOME --> BED["POSTEL<br/>spánek / nový den"]
    HOME --> DESK["STŮL<br/>DENÍK"]
    HOME --> OUT["DVEŘE<br/>výprava"]

    OUT --> MEADOW["LOUKY"]
    MEADOW --> FOREST["LES"]
    FOREST --> RIVER["ŘEKA"]
    RIVER --> RIDGE["HŘEBEN"]
    RIDGE --> RUINS["RUINY"]

    MEADOW --> LOOT["sběr surovin"]
    FOREST --> DANGER["nepřátelé"]
    RIVER --> DISCOVER["objev"]
    RIDGE --> DISCOVER
    RUINS --> DISCOVER

    LOOT --> RETURN["návrat"]
    DANGER --> RETURN
    DISCOVER --> JOURNAL_EVENT["automatický zápis objevu"]

    RETURN --> DESK
    JOURNAL_EVENT --> DESK
    DESK --> NOTE["vlastní zápis"]
    NOTE --> BED
    BED --> START
```

## Svět

```mermaid
flowchart LR
    A["DŮM<br/>0–345"] --> B["LOUKY<br/>345–1900"]
    B --> C["LES<br/>1900–3660"]
    C --> D["ŘEKA<br/>3660–5000"]
    D --> E["HŘEBEN<br/>5000–6900"]
    E --> F["RUINY<br/>6900–9000"]

    A -. "bezpečí" .-> A
    B -. "dřevo / bobule / kámen" .-> B
    C -. "větší riziko" .-> C
    D -. "nové lokace" .-> D
    E -. "výhled / orientace" .-> E
    F -. "pozdější návrat" .-> F
```

## Deník

Deník je persistentní herní prvek uložený v localStorage.

- vlastní zápisy hráče
- automatické zápisy významných objevů
- historie posledních zápisů
- zápisy jsou vázané na herní den
- stav zůstává po obnovení stránky

## Další fáze

```mermaid
flowchart TD
    NOW["Dům + deník + průzkum"] --> INV["inventář"]
    INV --> TOOLS["nástroje"]
    TOOLS --> CRAFT["crafting"]
    CRAFT --> BASE["rozšíření domu"]
    BASE --> SAVE["persistentní save"]
    SAVE --> QUEST["úkoly / příběhové stopy"]
    QUEST --> WEATHER["počasí + sezóna"]
    WEATHER --> BIOMES["nové biomy"]
```

Priorita je zachovat jednoduchou smyčku: **dům → výprava → objev → deník → návrat → spánek**. Další systémy se mají přidávat kolem ní, ne ji nahrazovat.


## Stav implementace

- [x] Dům jako bezpečný hub
- [x] Muž jako protagonista
- [x] Průzkum horizontálního světa
- [x] Oblasti a landmarks
- [x] Den/noc
- [x] Sběr surovin
- [x] Deník s vlastními zápisy
- [x] Automatické zápisy objevů
- [x] Persistentní save pozice, zdrojů a objevů
- [x] Inventář UI + mobilní tlačítko
- [x] Sběr surovin se zachováním stavu po reloadu
- [x] Crafting: sekera / krumpáč / pochodeň
- [x] Progresivní přístup ke zdrojům podle výbavy
- [x] Nástroje
- [x] Crafting
- [ ] Interiér domu jako skutečná samostatná lokace
- [x] Základní úpravy světa (stavění / odstraňování)
- [x] Persistentní pařezy po pokácených stromech
- [x] Opravitelný most přes řeku
- [x] Persistentní truhla v domě
- [ ] Interiér domu jako samostatná Phaser Scene
- [ ] Rozšíření domu
- [x] První příběhová stopa v ruinách
- [ ] Počasí
- [ ] Více biomů a procedurálních událostí
- [ ] Save sloty

## Aktuální herní stav

Inventář je nyní první samostatná vrstva nad survival systémem. Klávesa `I` nebo tlačítko `INV` otevře panel se zásobami. Sebrané suroviny mají stabilní ID, takže po obnovení stránky nezmizí stav světa.

Crafting je první skutečná brána postupu: základní suroviny → nástroj → hlubší oblast → nový typ rizika nebo objevu.

Další krok není přidávat desítky systémů, ale dát zásobám ještě větší účel: **nástroj → přístup k novému zdroji → crafting → rozšíření domu → příběhová stopa**.

```mermaid
flowchart LR
    GATHER["SBĚR"] --> INV["INVENTÁŘ"]
    INV --> TOOL["NÁSTROJ"]
    TOOL --> ACCESS["NOVÁ OBLAST / ZDROJ"]
    ACCESS --> CRAFT["CRAFTING"]
    CRAFT --> HOME["DŮM"]
    HOME --> STORY["STORY STOPA"]
    STORY --> EXPEDITION["DALŠÍ VÝPRAVA"]
```

## Designové pravidlo

Dům nemá být jen spawn point. Je to místo, kam se hráč vrací, aby **zpracoval zkušenost z výpravy**: přečetl deník, doplnil zásoby, odpočinul si a rozhodl se, kam půjde další den.

## Svět jako stavitelný prostor

Svět není pouze mapa, kterou hráč prochází. Je navržen jako persistentní stav, který se může měnit. Sebrané zdroje zůstávají sebrané a nově přidané objekty se ukládají do `localStorage`.

První vrstva úprav je záměrně jednoduchá:

- `B` — stavět; u řeky opraví most
- `R` — odstranit vlastní objekt v dosahu
- pokácený strom zanechá pařez
- změny se uloží a přežijí reload
- truhla v domě funguje jako persistentní sklad (`E` uložit, `Shift+E` vybrat)
- stejný `WorldEdit` model je připravený pro cesty, ploty, úkryty, pracovní stanice, světla, farmy a další objekty

Architektura má směřovat k modelu **world state → edit → persistence → render**, nikoli k jednorázově nakreslené mapě.

## Dlouhodobý směr

```mermaid
flowchart TD
    WORLD["SVĚT"] --> EXPLORE["PROCHÁZENÍ"]
    EXPLORE --> COLLECT["SBĚR VŠEHO"]
    COLLECT --> CRAFT["CRAFTING"]
    CRAFT --> BUILD["STAVĚNÍ"]
    BUILD --> MODIFY["ÚPRAVA TERÉNU / OBJEKTŮ"]
    MODIFY --> RETURN["SVĚT SE ZMĚNÍ"]
    RETURN --> EXPLORE
    RETURN --> STORY["NOVÉ STOPy / UDÁLOSTI"]
    STORY --> EXPLORE
```

Cílem je postupně dostat hru od **„procházím mapu“** k **„žiju ve světě, který po mně zůstává změněný“**.
