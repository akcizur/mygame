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
- [ ] Inventář UI
- [ ] Nástroje
- [ ] Crafting
- [ ] Interiér domu jako skutečná samostatná lokace
- [ ] Rozšíření domu
- [ ] Příběhové stopy
- [ ] Počasí
- [ ] Více biomů a procedurálních událostí
- [ ] Save sloty

## Designové pravidlo

Dům nemá být jen spawn point. Je to místo, kam se hráč vrací, aby **zpracoval zkušenost z výpravy**: přečetl deník, doplnil zásoby, odpočinul si a rozhodl se, kam půjde další den.
