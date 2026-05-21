# Test-Vid-o-Tiktok

## Schéma Logistique — Flux d'Information et Physiques

```mermaid
graph TD
    %% Couleurs et styles
    classDef info fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000;
    classDef phys fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000;
    classDef hub fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000;
    classDef client fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#000;

    %% Section Flux d'Information
    subgraph FLUX D'INFORMATIONS
        C[Client Final] :::client
        Web[Site Web Distributeur <br> CMS / CRM] :::info
        WMS[Système WMS de l'Entrepôt] :::info
        
        C -->|1. Passe commande| Web
        Web -->|2. Transmet les commandes| WMS
    end

    %% Section Flux Physiques
    subgraph FLUX PHYSIQUES
        Centrale[Centrale d'Achat du Distributeur] :::phys
        
        subgraph Hub[ENTREPÔT MUTUALISÉ D'IVRY-SUR-SEINE]
            Direction[FM LOGISTIC <br> Réception & Stockage < 12h] :::hub
            ZoneA[Zone Ambiant <br> 58%] :::hub
            ZoneF[Zone Frais <br> 38%] :::hub
            ZoneS[Zone Surgelé <br> 4%] :::hub
        end
        
        Transp[Sous-traitants Transport <br> 24 Tournées / Jour] :::phys
        Drives[27 Drives Urbains / Magasins] :::phys

        %% Connections physiques
        Centrale -->|A. Réassort des marchandises| Direction
        WMS -.->|Ordres de Picking| Direction
        Direction --> ZoneA
        Direction --> ZoneF
        Direction --> ZoneS
        
        ZoneA & ZoneF & ZoneS -->|B. Préparation des 350 cmd/jour| Transp
        Transp -->|C. Livraison Camions 20m³ Frigo| Drives
        Drives -->|D. Remise des courses| C
    end

    %% Application des styles
    class Centrale,Transp,Drives phys;
    class Direction,ZoneA,ZoneF,ZoneS hub;
```
