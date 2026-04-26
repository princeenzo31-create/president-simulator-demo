"use strict";

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const rnd = (min, max) => Math.random() * (max - min) + min;
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const fmt = (value, digits = 0) => Number(value).toLocaleString("fr-FR", {
  maximumFractionDigits: digits,
  minimumFractionDigits: digits
});

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const defaultBudget = [
  { id: "education", name: "Education", amount: 86, min: 54, max: 128, effect: "cohesion" },
  { id: "sante", name: "Sante", amount: 112, min: 74, max: 160, effect: "popularite" },
  { id: "defense", name: "Defense", amount: 58, min: 32, max: 130, effect: "preparation" },
  { id: "interieur", name: "Interieur", amount: 38, min: 21, max: 82, effect: "securite" },
  { id: "ecologie", name: "Ecologie", amount: 31, min: 12, max: 78, effect: "succes" },
  { id: "industrie", name: "Industrie", amount: 45, min: 16, max: 112, effect: "succes" },
  { id: "justice", name: "Justice", amount: 14, min: 8, max: 32, effect: "stabilite" },
  { id: "diplomatie", name: "Diplomatie", amount: 9, min: 4, max: 28, effect: "influence" },
  { id: "solidarites", name: "Solidarites", amount: 72, min: 41, max: 122, effect: "cohesion" },
  { id: "culture", name: "Culture", amount: 8, min: 2, max: 22, effect: "popularite" }
];

const cabinetSeeds = [
  { role: "Premier ministre", name: "Noemie Caradec", competence: 76, loyalty: 66, risk: 24 },
  { role: "Ministre de l'Economie", name: "Victor Sorel", competence: 82, loyalty: 52, risk: 36 },
  { role: "Ministre des Armees", name: "Amine Vautrin", competence: 79, loyalty: 71, risk: 18 },
  { role: "Ministre de l'Interieur", name: "Salome Rives", competence: 67, loyalty: 64, risk: 44 },
  { role: "Affaires etrangeres", name: "Iris Montclar", competence: 74, loyalty: 59, risk: 28 },
  { role: "Numerique et surete", name: "Basile Kermann", competence: 71, loyalty: 46, risk: 53 },
  { role: "Sante et solidarites", name: "Aya Verneuil", competence: 73, loyalty: 78, risk: 20 }
];

const theaterSeeds = [
  { id: "sahel", name: "Sahel occidental", type: "operation exterieure", threat: 46, control: 58, forces: 34, allies: 48 },
  { id: "almar", name: "Detroit d'Almar", type: "crise maritime", threat: 38, control: 63, forces: 28, allies: 56 },
  { id: "baltique", name: "Mer baltique", type: "dissuasion OTAN", threat: 33, control: 61, forces: 22, allies: 72 },
  { id: "cyber", name: "Cyberfront national", type: "attaque hybride", threat: 52, control: 45, forces: 41, allies: 36 },
  { id: "orbite", name: "Espace orbital", type: "satellites strategiques", threat: 29, control: 54, forces: 18, allies: 44 }
];

const travelSeeds = [
  {
    id: "europe",
    name: "Conseil europeen",
    place: "Bruxelles",
    cost: 0.8,
    quote: "Wir brauchen Stabilitat und Vertrauen.",
    translation: "Nous avons besoin de stabilite et de confiance.",
    benefit: "Soutien budgetaire et coordination energetique."
  },
  {
    id: "nordland",
    name: "Sommet du Nordland",
    place: "Aarvik",
    cost: 1.1,
    quote: "Security is built before the storm.",
    translation: "La securite se construit avant la tempete.",
    benefit: "Accord sur la surveillance maritime."
  },
  {
    id: "albia",
    name: "Visite d'Etat en Albia",
    place: "Lynden",
    cost: 1.4,
    quote: "A strong France is useful when it listens.",
    translation: "Une France forte est utile quand elle ecoute.",
    benefit: "Contrats industriels et canal de crise."
  },
  {
    id: "demerie",
    name: "Dialogue avec la Demerie",
    place: "Novigrad",
    cost: 1.7,
    quote: "Mir y parle, mais le rapport de force decide.",
    translation: "On parle de paix, mais le rapport de force decide.",
    benefit: "Desescalade possible, risque mediatique eleve."
  }
];

const actionSets = {
  campaign: [
    {
      name: "Grand meeting regional",
      desc: "Salle pleine, bains de foule, promesses cadrees et deux punchlines surveillees par les juristes.",
      impact: ["Opinion +", "Dynamique +", "Tresorerie -"],
      run: () => {
        const s = state.campaign;
        if (s.funds < 0.8) return notify("Tresorerie insuffisante pour organiser un grand meeting.");
        s.funds -= 0.8;
        s.polls = clamp(s.polls + rnd(0.7, 1.9));
        s.momentum = clamp(s.momentum + rnd(4, 8));
        s.fatigue = clamp(s.fatigue + 8);
        s.actionsTaken += 1;
        addLog("Le meeting remplit les images du soir. Les oppositions parlent d'operation de communication, donc c'est reussi.");
        gainXp(4);
      }
    },
    {
      name: "Debat national",
      desc: "Deux heures de direct, quatre adversaires, un journaliste qui cherche le moment de television.",
      impact: ["Credibilite +/-", "Opinion +", "Risque +"],
      run: () => {
        const s = state.campaign;
        if (s.fatigue > 82) return notify("Le candidat est trop fatigue pour encaisser un debat national.");
        const performance = rnd(-1.2, 3.2) + (s.credibility - 50) / 45;
        s.polls = clamp(s.polls + performance);
        s.credibility = clamp(s.credibility + performance * 2.2);
        s.privacyRisk = clamp(s.privacyRisk + rnd(2, 6));
        s.fatigue = clamp(s.fatigue + 13);
        s.actionsTaken += 1;
        addLog(performance >= 0 ? "Le debat installe une stature presidentielle." : "Le debat laisse une phrase isolee tourner en boucle toute la nuit.");
        gainXp(5);
      }
    },
    {
      name: "Pacte avec les maires",
      desc: "Negociation territoriale, investitures locales et promesse de ne jamais oublier les sous-prefectures.",
      impact: ["Parrainages +", "Implantation +", "Tresorerie -"],
      run: () => {
        const s = state.campaign;
        if (s.funds < 0.5) return notify("Il faut au moins 0,5 M EUR pour financer cette tournee locale.");
        s.funds -= 0.5;
        s.endorsements += 1;
        s.polls = clamp(s.polls + rnd(0.3, 1.1));
        s.groundGame = clamp(s.groundGame + rnd(5, 9));
        s.actionsTaken += 1;
        addLog("Le reseau d'elus locaux s'epaissit. Les plateaux parisiens appellent cela un signal faible, comme d'habitude.");
        gainXp(3);
      }
    },
    {
      name: "Chiffrage du programme",
      desc: "Publication d'une trajectoire budgetaire et de mesures detaillees, avec graphiques sobres et sueurs froides.",
      impact: ["Credibilite +", "Dynamique -", "Risque budget -"],
      run: () => {
        const s = state.campaign;
        s.credibility = clamp(s.credibility + rnd(6, 11));
        s.momentum = clamp(s.momentum - rnd(1, 4));
        s.polls = clamp(s.polls + rnd(0.1, 0.8));
        s.actionsTaken += 1;
        addLog("Le programme chiffre rassure les acteurs economiques. Une matinale demande tout de meme si les tableaux ne sont pas trop anxiogenes.");
        gainXp(4);
      }
    },
    {
      name: "Operation transparence",
      desc: "Audit rapide de patrimoine, vie privee verrouillee, consignes aux proches et chasse aux vieux messages.",
      impact: ["Risque vie privee -", "Opinion -", "Credibilite +"],
      run: () => {
        const s = state.campaign;
        if (s.funds < 0.3) return notify("Il faut financer les audits et l'equipe juridique.");
        s.funds -= 0.3;
        s.privacyRisk = clamp(s.privacyRisk - rnd(10, 18));
        s.polls = clamp(s.polls - rnd(0.1, 0.6));
        s.credibility = clamp(s.credibility + rnd(2, 4));
        s.actionsTaken += 1;
        addLog("L'equipe nettoie les angles morts. Une chaine info trouve suspect qu'il y ait si peu a suspecter.");
        gainXp(3);
      }
    }
  ],
  presidency: [
    {
      name: "Arbitrage interministeriel",
      desc: "Reunir Matignon, Bercy et les ministres concernes pour trancher un dossier bloque.",
      impact: ["Succes +", "Stabilite +", "Fatigue +"],
      run: () => {
        const p = state.presidency;
        p.success = clamp(p.success + rnd(1.2, 2.6));
        p.stability = clamp(p.stability + rnd(0.7, 1.6));
        p.popularity = clamp(p.popularity - rnd(0, 0.6));
        p.decisionsTaken += 1;
        addLog("L'arbitrage sort un dossier de l'enlisement administratif.");
        gainXp(6);
      }
    },
    {
      name: "Adresse aux Francais",
      desc: "Allocution breve, ton grave, promesse mesurable. Le prompteur a peur mais tient bon.",
      impact: ["Popularite +", "Medias +", "Risque si crise"],
      run: () => {
        const p = state.presidency;
        const effect = p.stability > 40 ? rnd(1.2, 3.4) : rnd(-1.5, 1.2);
        p.popularity = clamp(p.popularity + effect);
        p.mediaTrust = clamp(p.mediaTrust + rnd(0.8, 2.2));
        p.decisionsTaken += 1;
        addLog(effect >= 0 ? "L'allocution clarifie la ligne politique." : "L'allocution tombe au mauvais moment et nourrit les critiques.");
        gainXp(4);
      }
    },
    {
      name: "Conseil de defense",
      desc: "Evaluation des fronts, cybermenaces, stocks critiques et scenarios de riposte graduelle.",
      impact: ["Preparation +", "Tension +", "Budget -"],
      run: () => {
        const p = state.presidency;
        p.militaryReadiness = clamp(p.militaryReadiness + rnd(2.5, 5.5));
        p.security = clamp(p.security + rnd(0.8, 1.8));
        p.warTension = clamp(p.warTension + rnd(0.5, 2));
        p.debt = clamp(p.debt + rnd(0.05, 0.12), 70, 180);
        p.decisionsTaken += 1;
        addLog("Le conseil de defense releve le niveau de preparation sans annoncer officiellement qu'il l'a fait.");
        gainXp(5);
      }
    },
    {
      name: "Grand compromis social",
      desc: "Recevoir syndicats, patronat et oppositions. Personne ne sort heureux, ce qui est souvent le debut d'un accord.",
      impact: ["Cohesion +", "Assemblee +", "Succes +"],
      run: () => {
        const p = state.presidency;
        p.cohesion = clamp(p.cohesion + rnd(2.2, 4.8));
        p.assembly = clamp(p.assembly + rnd(1.1, 2.8));
        p.success = clamp(p.success + rnd(0.8, 1.8));
        p.popularity = clamp(p.popularity + rnd(-0.4, 1.2));
        p.decisionsTaken += 1;
        addLog("Le compromis social reduit le risque de blocage parlementaire.");
        gainXp(6);
      }
    }
  ]
};

const events = {
  campaign: [
    {
      title: "Fuite de donnees personnelles",
      category: "Vie privee",
      body: "Un ancien prestataire menace de publier des messages prives du candidat. Une partie est banale, une autre est politiquement explosive.",
      choices: [
        {
          label: "Tout publier avec contexte",
          effect: "Credibilite +, risque - mais opinion instable",
          apply: () => {
            state.campaign.credibility = clamp(state.campaign.credibility + 8);
            state.campaign.privacyRisk = clamp(state.campaign.privacyRisk - 18);
            state.campaign.polls = clamp(state.campaign.polls + rnd(-2.5, 1.2));
            addLog("La transparence coupe la speculation, mais certains extraits alimentent la satire politique.");
          }
        },
        {
          label: "Attaquer juridiquement",
          effect: "Risque -, tresorerie -, medias -",
          apply: () => {
            state.campaign.funds = Math.max(0, state.campaign.funds - 0.9);
            state.campaign.privacyRisk = clamp(state.campaign.privacyRisk - 10);
            state.campaign.momentum = clamp(state.campaign.momentum - 4);
            addLog("Les avocats obtiennent un delai. Les editorialistes remplissent le vide avec des mines graves.");
          }
        },
        {
          label: "Ignorer et relancer sur le programme",
          effect: "Dynamique +, risque +",
          apply: () => {
            state.campaign.momentum = clamp(state.campaign.momentum + 7);
            state.campaign.privacyRisk = clamp(state.campaign.privacyRisk + 12);
            state.campaign.polls = clamp(state.campaign.polls + rnd(-0.6, 1.1));
            addLog("La campagne reprend son rythme, mais la fuite reste une mine sous le parquet.");
          }
        }
      ]
    },
    {
      title: "Panique sur les marches",
      category: "Economie",
      body: "Une agence de notation fictive avertit que les programmes electoraux sont rarement soumis aux lois de la gravite, jusqu'au lendemain du vote.",
      choices: [
        {
          label: "Presenter une regle de depense",
          effect: "Credibilite +, opinion populaire -",
          apply: () => {
            state.campaign.credibility = clamp(state.campaign.credibility + 9);
            state.campaign.polls = clamp(state.campaign.polls - rnd(0.3, 1.4));
            addLog("La regle de depense rassure les marches et crispe une partie de la base militante.");
          }
        },
        {
          label: "Accuser la finance de pression politique",
          effect: "Opinion +, credibilite -",
          apply: () => {
            state.campaign.polls = clamp(state.campaign.polls + rnd(0.8, 2.2));
            state.campaign.credibility = clamp(state.campaign.credibility - 5);
            state.campaign.momentum = clamp(state.campaign.momentum + 4);
            addLog("La replique mobilise les meetings, mais Bercy prepare deja des notes anxieuses.");
          }
        }
      ]
    },
    {
      title: "Alliance improbable",
      category: "Partis",
      body: "Un petit parti pivot propose son soutien contre trois circonscriptions, une mission parlementaire et une promesse impossible a expliquer en une phrase.",
      choices: [
        {
          label: "Accepter le pacte",
          effect: "Parrainages +, Assemblee future +, credibilite -",
          apply: () => {
            state.campaign.endorsements += 2;
            state.campaign.groundGame = clamp(state.campaign.groundGame + 8);
            state.campaign.credibility = clamp(state.campaign.credibility - 4);
            addLog("Le pacte donne de l'air electoral et cree une future facture parlementaire.");
          }
        },
        {
          label: "Refuser et rester lisible",
          effect: "Credibilite +, implantation -",
          apply: () => {
            state.campaign.credibility = clamp(state.campaign.credibility + 6);
            state.campaign.groundGame = clamp(state.campaign.groundGame - 3);
            state.campaign.polls = clamp(state.campaign.polls + rnd(-0.5, 0.9));
            addLog("La ligne reste claire. Le petit parti explique aussitot qu'il n'a jamais vraiment demande.");
          }
        }
      ]
    }
  ],
  presidency: [
    {
      title: "Cyberattaque contre les hopitaux",
      category: "Cyber",
      body: "Plusieurs centres hospitaliers basculent en mode degrade. Les services soupconnent un groupe lie a une puissance etrangere.",
      choices: [
        {
          label: "Riposte cyber discrete",
          effect: "Securite +, tension +, influence +",
          apply: () => {
            state.presidency.security = clamp(state.presidency.security + 6);
            state.presidency.warTension = clamp(state.presidency.warTension + 5);
            state.presidency.influence = clamp(state.presidency.influence + 2);
            improveTheater("cyber", 7, -8, 5);
            addLog("La riposte cyber retablit plusieurs systemes, sans communique triomphal.");
          }
        },
        {
          label: "Priorite aux soins et silence strategique",
          effect: "Popularite +, succes +, controle cyber -",
          apply: () => {
            state.presidency.popularity = clamp(state.presidency.popularity + 3);
            state.presidency.success = clamp(state.presidency.success + 3);
            improveTheater("cyber", -3, 4, 0);
            addLog("La gestion sanitaire rassure, mais l'adversaire teste les limites de la retenue.");
          }
        },
        {
          label: "Accuser publiquement l'Etat hostile",
          effect: "Influence +, tension ++, Assemblee -",
          apply: () => {
            state.presidency.influence = clamp(state.presidency.influence + 5);
            state.presidency.warTension = clamp(state.presidency.warTension + 10);
            state.presidency.assembly = clamp(state.presidency.assembly - 3);
            addLog("La declaration impose le sujet au niveau international et ouvre une sequence de tension.");
          }
        }
      ]
    },
    {
      title: "Revelation sur la vie privee du president",
      category: "Vie privee",
      body: "Un magazine publie des elements personnels. Rien d'illegal, mais assez intime pour saturer les conversations et agacer l'Elysee.",
      choices: [
        {
          label: "Reponse breve et retour au travail",
          effect: "Stabilite +, medias +",
          apply: () => {
            state.presidency.stability = clamp(state.presidency.stability + 3);
            state.presidency.mediaTrust = clamp(state.presidency.mediaTrust + 2);
            state.presidency.popularity = clamp(state.presidency.popularity + rnd(-1, 1.5));
            addLog("La reponse courte limite l'incendie. Une chronique de 47 minutes explique pourquoi c'est court.");
          }
        },
        {
          label: "Porter plainte",
          effect: "Risque -, medias -, popularite -",
          apply: () => {
            state.presidency.scandalRisk = clamp(state.presidency.scandalRisk - 10);
            state.presidency.mediaTrust = clamp(state.presidency.mediaTrust - 5);
            state.presidency.popularity = clamp(state.presidency.popularity - 2);
            addLog("La plainte protege la sphere privee mais donne une seconde vie au sujet.");
          }
        },
        {
          label: "Assumer avec humour sec",
          effect: "Popularite +/-, dignite institutionnelle -",
          apply: () => {
            const swing = rnd(-2, 4);
            state.presidency.popularity = clamp(state.presidency.popularity + swing);
            state.presidency.stability = clamp(state.presidency.stability - 2);
            state.presidency.mediaTrust = clamp(state.presidency.mediaTrust + 2);
            addLog(swing > 0 ? "Le trait d'humour desamorce la sequence." : "La blague est jugee trop personnelle pour la fonction.");
          }
        }
      ]
    },
    {
      title: "Motion de censure menacee",
      category: "Parlement",
      body: "L'Assemblee se crispe sur une reforme budgetaire. Les groupes charnieres demandent des garanties, des credits et probablement une camera.",
      choices: [
        {
          label: "Negocier article par article",
          effect: "Assemblee +, succes +, deficit +",
          apply: () => {
            state.presidency.assembly = clamp(state.presidency.assembly + 8);
            state.presidency.success = clamp(state.presidency.success + 3);
            state.presidency.debt = clamp(state.presidency.debt + 0.4, 70, 180);
            addLog("La negociation sauve le texte mais ajoute des concessions couteuses.");
          }
        },
        {
          label: "Engager la responsabilite du gouvernement",
          effect: "Succes +, Assemblee -, stabilite -",
          apply: () => {
            state.presidency.success = clamp(state.presidency.success + 5);
            state.presidency.assembly = clamp(state.presidency.assembly - 9);
            state.presidency.stability = clamp(state.presidency.stability - 6);
            addLog("Le texte avance. Les couloirs parlementaires deviennent un sport de contact.");
          }
        },
        {
          label: "Retirer temporairement le texte",
          effect: "Stabilite +, succes -, popularite +",
          apply: () => {
            state.presidency.stability = clamp(state.presidency.stability + 5);
            state.presidency.success = clamp(state.presidency.success - 4);
            state.presidency.popularity = clamp(state.presidency.popularity + 2);
            addLog("Le retrait calme la crise mais donne une image d'hesitation.");
          }
        }
      ]
    },
    {
      title: "Incident naval dans le detroit d'Almar",
      category: "Defense",
      body: "Une fregate francaise est illuminee par un radar de tir. L'etat-major propose plusieurs niveaux de reponse.",
      choices: [
        {
          label: "Escorte renforcee et message public",
          effect: "Controle +, tension +",
          apply: () => {
            improveTheater("almar", 9, -5, 7);
            state.presidency.warTension = clamp(state.presidency.warTension + 4);
            state.presidency.influence = clamp(state.presidency.influence + 2);
            addLog("L'escorte renforcee preserve la liberte de navigation.");
          }
        },
        {
          label: "Canal militaire confidentiel",
          effect: "Tension -, influence +",
          apply: () => {
            improveTheater("almar", 2, -8, 0);
            state.presidency.warTension = clamp(state.presidency.warTension - 6);
            state.presidency.influence = clamp(state.presidency.influence + 3);
            addLog("Le canal militaire reduit la temperature sans victoire televisuelle.");
          }
        },
        {
          label: "Deployer le groupe aeronaval",
          effect: "Controle ++, dette +, tension ++",
          apply: () => {
            improveTheater("almar", 14, -3, 13);
            state.presidency.warTension = clamp(state.presidency.warTension + 9);
            state.presidency.debt = clamp(state.presidency.debt + 0.3, 70, 180);
            addLog("Le groupe aeronaval impressionne les allies et inquiète les marches.");
          }
        }
      ]
    }
  ]
};

let state = createInitialState();
let activeTab = "overview";
let timeAccumulator = 0;
let frame = 0;

function createInitialState() {
  return {
    phase: "setup",
    paused: false,
    speed: 1,
    candidate: {
      name: "Camille Delmas",
      movement: "Nouvelle Concorde",
      style: "technocrate",
      weakness: "vie-privee",
      doctrine: { economy: 55, security: 62, diplomacy: 58, climate: 48 }
    },
    campaign: {
      week: 1,
      weeksLeft: 8,
      polls: 31.5,
      credibility: 49,
      momentum: 52,
      groundGame: 42,
      funds: 5.4,
      fatigue: 12,
      privacyRisk: 28,
      endorsements: 1,
      actionsTaken: 0,
      voteShare: 0
    },
    presidency: null,
    activeEvent: null,
    log: ["Bienvenue dans la campagne. La premiere epreuve est simple a dire et difficile a faire : gagner."],
    news: "La redaction politique attend le premier meeting.",
    missions: [],
    xp: 0,
    unlocked: []
  };
}

function createPresidency(voteShare) {
  const c = state.campaign;
  const startingPopularity = clamp(voteShare + 5 + (c.credibility - 50) / 8, 34, 76);
  const startingSuccess = clamp(42 + c.credibility / 5 + c.groundGame / 9, 35, 68);
  const assemblyBase = clamp(38 + c.endorsements * 4 + c.groundGame / 4, 28, 72);
  const p = {
    day: 1,
    mandateDay: 1,
    termLength: 200,
    dateLabel: "Jour 1 du mandat",
    popularity: startingPopularity,
    success: startingSuccess,
    stability: clamp(56 + (c.credibility - 50) / 3, 34, 75),
    influence: clamp(43 + state.candidate.doctrine.diplomacy / 4, 30, 70),
    security: clamp(48 + state.candidate.doctrine.security / 5, 35, 72),
    cohesion: clamp(48 + c.groundGame / 8, 34, 70),
    assembly: assemblyBase,
    mediaTrust: clamp(45 - c.privacyRisk / 6 + c.credibility / 7, 25, 70),
    militaryReadiness: clamp(46 + state.candidate.doctrine.security / 4, 35, 72),
    warTension: 28,
    scandalRisk: clamp(24 + c.privacyRisk / 2, 18, 64),
    gdp: 2860,
    debt: 111.8,
    taxRate: 45,
    budget: structuredClone(defaultBudget),
    cabinet: structuredClone(cabinetSeeds),
    theaters: structuredClone(theaterSeeds),
    travels: structuredClone(travelSeeds),
    decisionsTaken: 0,
    travelDone: 0,
    warOrders: 0,
    billsPassed: 0,
    crisisResolved: 0,
    legacy: 0
  };
  p.level = computeLevel(p);
  return p;
}

function setupCandidateFromForm() {
  state.candidate = {
    name: $("#candidateName").value.trim() || "Candidat sans nom",
    movement: $("#movementName").value.trim() || "Mouvement civique",
    style: $("#leadershipStyle").value,
    weakness: $("#weakness").value,
    doctrine: {
      economy: Number($("#doctrineEconomy").value),
      security: Number($("#doctrineSecurity").value),
      diplomacy: Number($("#doctrineDiplomacy").value),
      climate: Number($("#doctrineClimate").value)
    }
  };
  applyCandidateModifiers();
  generateMissions();
}

function applyCandidateModifiers() {
  const s = state.campaign;
  const d = state.candidate.doctrine;
  const styles = {
    technocrate: () => { s.credibility += 7; s.momentum -= 2; },
    regalien: () => { s.privacyRisk -= 3; s.groundGame += 2; s.credibility += 2; },
    social: () => { s.polls += 2.2; s.credibility -= 2; s.groundGame += 4; },
    ecologie: () => { s.polls += 1.2; s.momentum += 3; s.funds -= 0.3; },
    souverain: () => { s.momentum += 5; s.credibility -= 1; s.privacyRisk += 2; }
  };
  styles[state.candidate.style]?.();
  s.credibility = clamp(s.credibility + (d.economy - 50) / 16);
  s.groundGame = clamp(s.groundGame + (d.diplomacy - 50) / 20);
  s.polls = clamp(s.polls + (d.climate - 50) / 30, 18, 48);

  const weaknesses = {
    "vie-privee": () => { s.privacyRisk += 18; },
    finance: () => { s.funds += 1.1; s.credibility -= 5; },
    arrogance: () => { s.credibility += 3; s.polls -= 1.5; },
    experience: () => { s.momentum += 4; s.credibility -= 7; },
    alliances: () => { s.endorsements += 1; s.groundGame -= 5; }
  };
  weaknesses[state.candidate.weakness]?.();
  s.funds = Math.max(0.8, s.funds);
  s.privacyRisk = clamp(s.privacyRisk, 0, 100);
  s.credibility = clamp(s.credibility, 10, 90);
  s.groundGame = clamp(s.groundGame, 10, 90);
}

function startCampaign(event) {
  event.preventDefault();
  setupCandidateFromForm();
  state.phase = "campaign";
  $("#setupView").classList.add("hidden");
  $("#gameView").classList.remove("hidden");
  addLog(`${state.candidate.name} lance la campagne de ${state.candidate.movement}.`);
  render();
}

function gameTick() {
  if (state.paused || state.phase === "setup") return;
  const threshold = state.phase === "campaign" ? 6 : 5;
  timeAccumulator += state.speed;
  $("#timeProgress").style.width = `${clamp((timeAccumulator / threshold) * 100)}%`;
  if (timeAccumulator >= threshold) {
    timeAccumulator = 0;
    if (state.phase === "campaign") advanceCampaignWeek();
    if (state.phase === "presidency") advancePresidencyDay();
    render();
  }
  drawMaps();
}

function advanceCampaignWeek() {
  const c = state.campaign;
  c.week += 1;
  c.weeksLeft -= 1;
  const discipline = (c.credibility - 50) / 70;
  const field = (c.groundGame - 45) / 95;
  const buzz = (c.momentum - 50) / 42;
  const fatiguePenalty = Math.max(0, c.fatigue - 60) / 42;
  const privacyPenalty = Math.max(0, c.privacyRisk - 55) / 80;
  c.polls = clamp(c.polls + rnd(-0.9, 1.1) + discipline + field + buzz - fatiguePenalty - privacyPenalty, 17, 54);
  c.funds = Math.max(0, c.funds + rnd(0.35, 0.9) + c.polls / 110);
  c.fatigue = clamp(c.fatigue - rnd(4, 8));
  c.momentum = clamp(c.momentum + rnd(-5, 3));
  c.privacyRisk = clamp(c.privacyRisk + rnd(-1, 4));
  addLog(`Semaine ${c.week - 1} bouclee : intentions de vote a ${fmt(c.polls, 1)} %, tresorerie ${fmt(c.funds, 1)} M EUR.`);

  if (!state.activeEvent && Math.random() < 0.55) {
    setEvent(pick(events.campaign));
  }

  if (c.weeksLeft <= 0) runElection();
}

function runElection() {
  const c = state.campaign;
  const turnout = rnd(63, 78);
  const voteShare = clamp(
    c.polls + c.endorsements * 0.9 + (c.credibility - 50) * 0.08 + (c.groundGame - 45) * 0.06 + rnd(-3.2, 3.4),
    30,
    58
  );
  c.voteShare = voteShare;
  const won = voteShare >= 50;
  state.paused = true;

  if (won) {
    showModal({
      kicker: "Second tour",
      title: "Victoire presidentielle",
      body: `
        <p>${state.candidate.name} est elu avec <strong>${fmt(voteShare, 1)} %</strong> des voix et une participation de <strong>${fmt(turnout, 1)} %</strong>.</p>
        <p>Le niveau initial du mandat sera calcule avec l'opinion publique, la credibilite de campagne et la solidite des alliances.</p>
      `,
      actions: [
        {
          label: "Entrer a l'Elysee",
          primary: true,
          run: () => {
            state.paused = false;
            state.phase = "presidency";
            state.presidency = createPresidency(voteShare);
            state.activeEvent = null;
            generateMissions();
            addLog(`Investiture : niveau initial ${computeLevel(state.presidency)}. Les cent premiers jours commencent maintenant.`);
            closeModal();
            render();
          }
        }
      ]
    });
  } else {
    showModal({
      kicker: "Second tour",
      title: "Defaite honorable",
      body: `
        <p>Le score final atteint <strong>${fmt(voteShare, 1)} %</strong>. Le mouvement survit, mais le palais reste ferme.</p>
        <p>La demo peut etre relancee avec un style plus credible, plus local ou plus offensif.</p>
      `,
      actions: [
        { label: "Recommencer", primary: true, run: resetGame }
      ]
    });
  }
}

function advancePresidencyDay() {
  const p = state.presidency;
  p.day += 1;
  p.mandateDay += 1;

  const budget = computeBudget();
  p.debt = clamp(p.debt + budget.deficit / p.gdp / 365 * 100, 75, 190);

  const healthSpend = getBudget("sante").amount;
  const eduSpend = getBudget("education").amount;
  const defenseSpend = getBudget("defense").amount;
  const interiorSpend = getBudget("interieur").amount;
  const ecologySpend = getBudget("ecologie").amount;
  const industrySpend = getBudget("industrie").amount;
  const diplomacySpend = getBudget("diplomatie").amount;
  const solidaritySpend = getBudget("solidarites").amount;
  const justiceSpend = getBudget("justice").amount;

  p.success = clamp(p.success + (industrySpend - 45) / 520 + (ecologySpend - 31) / 720 - Math.max(0, budget.deficit - 105) / 950 + rnd(-0.22, 0.25));
  p.popularity = clamp(p.popularity + (healthSpend - 112) / 700 + (solidaritySpend - 72) / 820 - Math.max(0, p.taxRate - 46) / 75 - Math.max(0, p.debt - 118) / 380 + rnd(-0.28, 0.22));
  p.stability = clamp(p.stability + (justiceSpend - 14) / 280 + (eduSpend - 86) / 900 + (p.assembly - 50) / 900 - Math.max(0, p.warTension - 55) / 320 + rnd(-0.22, 0.2));
  p.security = clamp(p.security + (interiorSpend - 38) / 360 + (defenseSpend - 58) / 620 - averageThreat() / 920 + rnd(-0.22, 0.18));
  p.militaryReadiness = clamp(p.militaryReadiness + (defenseSpend - 58) / 410 - p.warTension / 1100 + rnd(-0.14, 0.22));
  p.influence = clamp(p.influence + (diplomacySpend - 9) / 160 + p.travelDone / 900 - Math.max(0, p.warTension - 70) / 450 + rnd(-0.18, 0.2));
  p.cohesion = clamp(p.cohesion + (solidaritySpend - 72) / 720 + (eduSpend - 86) / 850 - Math.max(0, p.taxRate - 48) / 120 + rnd(-0.2, 0.18));
  p.mediaTrust = clamp(p.mediaTrust + rnd(-0.35, 0.28) - Math.max(0, p.scandalRisk - 50) / 360);
  p.assembly = clamp(p.assembly + rnd(-0.3, 0.25) + (p.stability - 50) / 1200);
  p.scandalRisk = clamp(p.scandalRisk + rnd(-0.22, 0.35));
  p.warTension = clamp(p.warTension + averageThreat() / 900 + rnd(-0.25, 0.35));

  p.theaters.forEach((theater) => {
    theater.threat = clamp(theater.threat + rnd(-0.7, 1.0) + Math.max(0, p.warTension - 55) / 160);
    theater.control = clamp(theater.control + (p.militaryReadiness - 50) / 280 - theater.threat / 330 + rnd(-0.35, 0.3));
    theater.forces = clamp(theater.forces + (defenseSpend - 58) / 820 + rnd(-0.25, 0.2));
  });

  if (p.day % 10 === 0) generateMissions();
  checkMissions();

  if (!state.activeEvent && Math.random() < eventChance()) setEvent(pick(events.presidency));

  if (p.mandateDay >= p.termLength) endTerm();
}

function eventChance() {
  const p = state.presidency;
  return clamp(0.22 + p.scandalRisk / 420 + averageThreat() / 650 + Math.max(0, 50 - p.stability) / 380, 0.18, 0.52);
}

function endTerm() {
  state.paused = true;
  const p = state.presidency;
  const level = computeLevel(p);
  const collapsedTheaters = p.theaters.filter((t) => t.control < 25).length;
  const victory = level >= 85 && p.stability >= 58 && p.success >= 68 && p.popularity >= 43 && p.debt < 132 && collapsedTheaters === 0;
  const title = victory ? "Heritage republicain majeur" : "Mandat termine";
  const body = victory
    ? `<p>Votre presidence entre dans les manuels : niveau <strong>${level}</strong>, stabilite <strong>${fmt(p.stability)}</strong>, dette maitrisee et aucun front perdu.</p>`
    : `<p>Le mandat se termine au niveau <strong>${level}</strong>. Pour obtenir la victoire historique, il faut finir avec niveau 85, stabilite 58, succes 68, popularite 43, dette sous 132 % du PIB et aucun front effondre.</p>`;
  showModal({
    kicker: "Condition de victoire",
    title,
    body,
    actions: [
      { label: "Rejouer une campagne", primary: true, run: resetGame }
    ]
  });
}

function setEvent(eventTemplate) {
  state.activeEvent = {
    ...eventTemplate,
    choices: eventTemplate.choices.map((choice) => ({ ...choice }))
  };
  state.news = `${eventTemplate.category} : ${eventTemplate.title}`;
  addLog(`Evenement critique : ${eventTemplate.title}.`);
}

function resolveEvent(choiceIndex) {
  if (!state.activeEvent) return;
  const choice = state.activeEvent.choices[choiceIndex];
  choice.apply();
  if (state.phase === "presidency") {
    state.presidency.crisisResolved += 1;
    state.presidency.decisionsTaken += 1;
  }
  state.activeEvent = null;
  gainXp(8);
  checkMissions();
  render();
}

function performAction(index) {
  const set = state.phase === "campaign" ? actionSets.campaign : actionSets.presidency;
  const action = set[index];
  if (!action) return;
  action.run();
  checkMissions();
  render();
}

function deployWarOrder(type, theaterId) {
  const p = state.presidency;
  const theater = theaterId ? p.theaters.find((item) => item.id === theaterId) : pick(p.theaters);
  if (!theater) return;

  if (type === "forces") {
    theater.forces = clamp(theater.forces + 11);
    theater.control = clamp(theater.control + 8);
    p.debt = clamp(p.debt + 0.16, 70, 190);
    p.warTension = clamp(p.warTension + 3);
    addLog(`Renforts envoyes sur ${theater.name}.`);
  }
  if (type === "intel") {
    theater.threat = clamp(theater.threat - 9);
    p.security = clamp(p.security + 2);
    p.scandalRisk = clamp(p.scandalRisk + 1);
    addLog(`Renseignement renforce sur ${theater.name}.`);
  }
  if (type === "allies") {
    theater.allies = clamp(theater.allies + 10);
    theater.control = clamp(theater.control + 4);
    p.influence = clamp(p.influence + 3);
    p.warTension = clamp(p.warTension - 2);
    addLog(`Coordination alliee accrue sur ${theater.name}.`);
  }
  p.warOrders += 1;
  p.decisionsTaken += 1;
  gainXp(5);
  checkMissions();
  render();
}

function takeTravel(travelId) {
  const p = state.presidency;
  const travel = p.travels.find((item) => item.id === travelId);
  if (!travel) return;
  if (p.day < 5) {
    notify("Le protocole demande au moins quelques jours de mandat avant un voyage majeur.");
    return;
  }
  p.influence = clamp(p.influence + rnd(4, 7));
  p.success = clamp(p.success + rnd(1, 3));
  p.popularity = clamp(p.popularity + rnd(-1.2, 1.5));
  p.mediaTrust = clamp(p.mediaTrust + rnd(0.2, 1.6));
  p.debt = clamp(p.debt + travel.cost / 18, 70, 190);
  p.travelDone += 1;
  p.decisionsTaken += 1;
  setEvent({
    title: `Point presse a ${travel.place}`,
    category: "Diplomatie",
    body: `Phrase recue : "${travel.quote}" Traduction : "${travel.translation}" ${travel.benefit}`,
    choices: [
      {
        label: "Repondre en partenaire exigeant",
        effect: "Influence +, tension -",
        apply: () => {
          p.influence = clamp(p.influence + 4);
          p.warTension = clamp(p.warTension - 2);
          addLog(`Le voyage ${travel.name} produit une image de fermete calme.`);
        }
      },
      {
        label: "Chercher un accord economique rapide",
        effect: "Succes +, dette -",
        apply: () => {
          p.success = clamp(p.success + 4);
          p.debt = clamp(p.debt - 0.2, 70, 190);
          addLog(`Le voyage ${travel.name} debouche sur des engagements industriels.`);
        }
      },
      {
        label: "Improviser une formule memorable",
        effect: "Medias +/-, popularite +/-",
        apply: () => {
          const swing = rnd(-2, 3.5);
          p.popularity = clamp(p.popularity + swing);
          p.mediaTrust = clamp(p.mediaTrust + swing / 2);
          addLog(swing >= 0 ? "La formule est reprise favorablement." : "La formule cree un incident de traduction.");
        }
      }
    ]
  });
  gainXp(6);
  checkMissions();
  render();
}

function cabinetAction(index, type) {
  const p = state.presidency;
  const member = p.cabinet[index];
  if (!member) return;
  if (type === "brief") {
    member.loyalty = clamp(member.loyalty + 4);
    member.competence = clamp(member.competence + rnd(0, 2));
    p.success = clamp(p.success + member.competence / 90);
    p.decisionsTaken += 1;
    addLog(`${member.role} remet une note claire. C'est suffisamment rare pour etre note.`);
  }
  if (type === "discipline") {
    member.risk = clamp(member.risk - 9);
    member.loyalty = clamp(member.loyalty - 3);
    p.scandalRisk = clamp(p.scandalRisk - 3);
    p.mediaTrust = clamp(p.mediaTrust - 1);
    p.decisionsTaken += 1;
    addLog(`Discipline imposee a ${member.name}. Le cabinet fuit moins, mais respire moins aussi.`);
  }
  if (type === "reshuffle") {
    member.name = generateMinisterName();
    member.competence = clamp(rnd(54, 86));
    member.loyalty = clamp(rnd(42, 82));
    member.risk = clamp(rnd(12, 58));
    p.stability = clamp(p.stability - 2);
    p.mediaTrust = clamp(p.mediaTrust + 1);
    p.decisionsTaken += 1;
    addLog(`${member.role} change de titulaire. Les commentateurs annoncent un tournant, comme a chaque fois.`);
  }
  gainXp(4);
  checkMissions();
  render();
}

function generateMinisterName() {
  const first = ["Helene", "Malik", "Jeanne", "Solal", "Nora", "Theo", "Maya", "Etienne", "Lea", "Rayan"];
  const last = ["Bresson", "Dumont", "Aubry", "Marceau", "Tessier", "Lenoir", "Valette", "Garnier", "Roche", "Bellanger"];
  return `${pick(first)} ${pick(last)}`;
}

function improveTheater(id, controlDelta, threatDelta, forceDelta) {
  const theater = state.presidency?.theaters.find((item) => item.id === id);
  if (!theater) return;
  theater.control = clamp(theater.control + controlDelta);
  theater.threat = clamp(theater.threat + threatDelta);
  theater.forces = clamp(theater.forces + forceDelta);
}

function computeBudget() {
  const p = state.presidency;
  if (!p) return null;
  const spending = p.budget.reduce((sum, row) => sum + row.amount, 0);
  const revenue = p.gdp * (p.taxRate / 100) * 0.39;
  const interest = p.gdp * (p.debt / 100) * 0.021;
  const deficit = spending + interest - revenue;
  return { spending, revenue, interest, deficit };
}

function getBudget(id) {
  return state.presidency.budget.find((row) => row.id === id);
}

function averageThreat() {
  const theaters = state.presidency?.theaters || [];
  if (!theaters.length) return 0;
  return theaters.reduce((sum, item) => sum + item.threat, 0) / theaters.length;
}

function computeLevel(p = state.presidency) {
  if (!p) {
    const c = state.campaign;
    return clamp(Math.round(c.polls * 0.9 + c.credibility * 0.25 + c.groundGame * 0.18 + c.endorsements * 1.4 - c.privacyRisk * 0.08), 1, 100);
  }
  const warPenalty = Math.max(0, averageThreat() - 55) * 0.18 + Math.max(0, p.warTension - 65) * 0.12;
  const debtPenalty = Math.max(0, p.debt - 118) * 0.22;
  const value =
    p.popularity * 0.34 +
    p.success * 0.28 +
    p.stability * 0.16 +
    p.influence * 0.1 +
    p.security * 0.07 +
    p.assembly * 0.05 -
    warPenalty -
    debtPenalty;
  return clamp(Math.round(value), 1, 100);
}

function gainXp(amount) {
  state.xp += amount;
  const unlocks = [
    { xp: 35, name: "Cellule anticipation" },
    { xp: 75, name: "Canal diplomatique discret" },
    { xp: 130, name: "Etat-major de crise permanent" },
    { xp: 210, name: "Doctrine d'heritage national" }
  ];
  unlocks.forEach((unlock) => {
    if (state.xp >= unlock.xp && !state.unlocked.includes(unlock.name)) {
      state.unlocked.push(unlock.name);
      addLog(`Progression debloquee : ${unlock.name}.`);
    }
  });
}

function generateMissions() {
  if (state.phase === "campaign") {
    state.missions = [
      {
        id: "campaign-actions",
        title: "Occuper le terrain",
        detail: "Faire 3 actions de campagne.",
        done: () => state.campaign.actionsTaken >= 3,
        reward: 8,
        paid: false
      },
      {
        id: "polls",
        title: "Franchir le seuil presidentiel",
        detail: "Atteindre 38 % d'intentions de vote avant le second tour.",
        done: () => state.campaign.polls >= 38,
        reward: 10,
        paid: false
      },
      {
        id: "privacy",
        title: "Verrouiller la vie privee",
        detail: "Ramener le risque de fuite sous 25.",
        done: () => state.campaign.privacyRisk < 25,
        reward: 8,
        paid: false
      }
    ];
  } else if (state.presidency) {
    state.missions = [
      {
        id: `decisions-${state.presidency.day}`,
        title: "Gouverner aujourd'hui",
        detail: "Prendre 2 decisions ou ordres avant le prochain cycle.",
        start: state.presidency.decisionsTaken,
        done: (mission) => state.presidency.decisionsTaken - mission.start >= 2,
        reward: 9,
        paid: false
      },
      {
        id: `budget-${state.presidency.day}`,
        title: "Tenir la trajectoire",
        detail: "Garder le deficit annuel sous 115 Md EUR.",
        done: () => computeBudget().deficit < 115,
        reward: 7,
        paid: false
      },
      {
        id: `front-${state.presidency.day}`,
        title: "Aucun front perdu",
        detail: "Maintenir tous les controles de theatre au-dessus de 35.",
        done: () => state.presidency.theaters.every((theater) => theater.control > 35),
        reward: 7,
        paid: false
      }
    ];
  }
}

function checkMissions() {
  state.missions.forEach((mission) => {
    if (!mission.paid && mission.done(mission)) {
      mission.paid = true;
      gainXp(mission.reward);
      if (state.phase === "presidency") state.presidency.success = clamp(state.presidency.success + 1);
      addLog(`Objectif rempli : ${mission.title}.`);
    }
  });
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 12);
  state.news = message;
}

function notify(message) {
  state.news = message;
  render();
}

function render() {
  renderIdentity();
  renderMetrics();
  renderActions();
  renderEvent();
  renderLog();
  renderMissions();
  renderBudget();
  renderWar();
  renderDiplomacy();
  renderCabinet();
  renderTimeAndLevel();
  drawMaps();
}

function renderIdentity() {
  $("#leaderName").textContent = state.candidate.name;
  $("#movementLabel").textContent = state.candidate.movement;
  $("#avatar").textContent = initials(state.candidate.name);
  $("#phaseLabel").textContent = state.phase === "campaign" ? "Campagne presidentielle" : "Presidence de la Republique";
  $("#newsTicker").textContent = state.news;
  $("#mapMode").textContent = state.phase === "campaign" ? "Campagne nationale" : "Situation interieure et exterieure";
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PR";
}

function renderMetrics() {
  const metrics = state.phase === "campaign" ? campaignMetrics() : presidencyMetrics();
  $("#metricsGrid").innerHTML = metrics.map((metric) => {
    const status = metric.value >= 66 ? "good" : metric.value < 38 ? "bad" : "warning";
    return `
      <article class="metric-card ${status}">
        <div class="metric-head">
          <span>${metric.label}</span>
          <small>${metric.note}</small>
        </div>
        <strong>${metric.display}</strong>
        <div class="bar"><span style="width:${clamp(metric.value)}%"></span></div>
      </article>
    `;
  }).join("");
}

function campaignMetrics() {
  const c = state.campaign;
  return [
    { label: "Intentions", note: "2e tour", value: c.polls, display: `${fmt(c.polls, 1)} %` },
    { label: "Credibilite", note: "programme", value: c.credibility, display: fmt(c.credibility) },
    { label: "Dynamique", note: "terrain", value: c.momentum, display: fmt(c.momentum) },
    { label: "Implantation", note: "elus", value: c.groundGame, display: fmt(c.groundGame) },
    { label: "Tresorerie", note: "M EUR", value: clamp(c.funds * 10, 0, 100), display: fmt(c.funds, 1) },
    { label: "Risque prive", note: "fuite", value: 100 - c.privacyRisk, display: fmt(c.privacyRisk) }
  ];
}

function presidencyMetrics() {
  const p = state.presidency;
  return [
    { label: "Popularite", note: "opinion", value: p.popularity, display: `${fmt(p.popularity)} %` },
    { label: "Succes", note: "reformes", value: p.success, display: fmt(p.success) },
    { label: "Stabilite", note: "institutions", value: p.stability, display: fmt(p.stability) },
    { label: "Assemblee", note: "majorite", value: p.assembly, display: fmt(p.assembly) },
    { label: "Influence", note: "monde", value: p.influence, display: fmt(p.influence) },
    { label: "Securite", note: "interieur", value: p.security, display: fmt(p.security) }
  ];
}

function renderActions() {
  const set = state.phase === "campaign" ? actionSets.campaign : actionSets.presidency;
  $("#decisionTitle").textContent = state.phase === "campaign" ? "QG de campagne" : "Bureau presidentiel";
  $("#decisionSubtitle").textContent = state.phase === "campaign" ? "8 semaines pour gagner" : "decisions a consequences";
  $("#actionsList").innerHTML = set.map((action, index) => `
    <button class="action-button" data-action="${index}">
      <strong>${action.name}</strong>
      <p>${action.desc}</p>
      <span class="action-impact">${action.impact.map((item) => `<span class="pill">${item}</span>`).join("")}</span>
    </button>
  `).join("");
  $$("#actionsList [data-action]").forEach((button) => {
    button.addEventListener("click", () => performAction(Number(button.dataset.action)));
  });
}

function renderEvent() {
  const event = state.activeEvent;
  $("#eventCategory").textContent = event?.category || "situation";
  if (!event) {
    $("#eventCard").className = "event-card empty";
    $("#eventCard").innerHTML = "<p>Aucun evenement critique. Les conseillers surveillent les signaux faibles.</p>";
    return;
  }
  $("#eventCard").className = "event-card";
  $("#eventCard").innerHTML = `
    <h3>${event.title}</h3>
    <p>${event.body}</p>
    <div class="event-options">
      ${event.choices.map((choice, index) => `
        <button class="action-button" data-choice="${index}">
          <strong>${choice.label}</strong>
          <p>${choice.effect}</p>
        </button>
      `).join("")}
    </div>
  `;
  $$("#eventCard [data-choice]").forEach((button) => {
    button.addEventListener("click", () => resolveEvent(Number(button.dataset.choice)));
  });
}

function renderLog() {
  $("#logList").innerHTML = state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join("");
}

function renderMissions() {
  $("#missionsList").innerHTML = state.missions.map((mission) => {
    const done = mission.done(mission);
    return `
      <div class="mission-item ${done ? "done" : ""}">
        <strong>${done ? "Accompli - " : ""}${mission.title}</strong>
        <span>${mission.detail}</span>
        <span>Recompense : ${mission.reward} XP</span>
      </div>
    `;
  }).join("");
  $("#missionTimer").textContent = state.phase === "campaign" ? "jusqu'au second tour" : "cycle de 10 jours";
}

function renderTimeAndLevel() {
  if (state.phase === "campaign") {
    const c = state.campaign;
    $("#dateLabel").textContent = `Semaine ${c.week} - ${c.weeksLeft} restantes`;
    $("#clockHint").textContent = "Une semaine avance toutes les quelques secondes selon la vitesse.";
    const level = computeLevel();
    $("#globalLevel").textContent = level;
    $("#levelProgress").style.width = `${level}%`;
    $("#levelFormula").textContent = "Pendant la campagne, ce niveau prefigure le capital politique du premier jour.";
  } else if (state.presidency) {
    const p = state.presidency;
    const level = computeLevel(p);
    p.level = level;
    $("#dateLabel").textContent = `Jour ${p.mandateDay} / ${p.termLength}`;
    $("#clockHint").textContent = "Demo compressee : un mandat dure 200 jours de simulation.";
    $("#globalLevel").textContent = level;
    $("#levelProgress").style.width = `${level}%`;
    $("#levelFormula").textContent = "Victoire historique : niveau 85, stabilite 58, succes 68, popularite 43 et dette sous 132 %.";
  }
}

function renderBudget() {
  if (!state.presidency) {
    $("#budgetSummary").innerHTML = "<div class='budget-kpi'><span>Budget</span><strong>Deverrouille apres l'election</strong></div>";
    $("#budgetRows").innerHTML = "";
    $("#budgetReport").innerHTML = "Gagnez l'election pour ouvrir la loi de finances.";
    return;
  }
  const p = state.presidency;
  const b = computeBudget();
  $("#taxSlider").value = p.taxRate;
  $("#taxLabel").textContent = `${fmt(p.taxRate)} % du PIB`;
  $("#budgetSummary").innerHTML = `
    <div class="budget-kpi"><span>Depenses</span><strong>${fmt(b.spending)} Md</strong></div>
    <div class="budget-kpi"><span>Recettes</span><strong>${fmt(b.revenue)} Md</strong></div>
    <div class="budget-kpi"><span>Interets</span><strong>${fmt(b.interest)} Md</strong></div>
    <div class="budget-kpi"><span>Dette</span><strong>${fmt(p.debt, 1)} %</strong></div>
  `;
  $("#budgetRows").innerHTML = p.budget.map((row) => `
    <div class="budget-row">
      <div>
        <strong>${row.name}</strong><br>
        <small>Effet principal : ${effectLabel(row.effect)}</small>
      </div>
      <input type="range" min="${row.min}" max="${row.max}" value="${row.amount}" data-budget="${row.id}">
      <strong>${fmt(row.amount)}</strong>
      <small>Md EUR</small>
    </div>
  `).join("");
  $$("#budgetRows [data-budget]").forEach((input) => {
    input.addEventListener("input", () => {
      const row = getBudget(input.dataset.budget);
      row.amount = Number(input.value);
      renderBudget();
      renderMetrics();
      renderTimeAndLevel();
    });
  });
  const deficitClass = b.deficit < 80 ? "status-good" : b.deficit < 125 ? "status-warning" : "status-bad";
  $("#budgetReport").innerHTML = `
    <p>Solde annuel estime : <strong class="${deficitClass}">${fmt(b.deficit)} Md EUR</strong>.</p>
    <p>Une depense sociale elevee soutient la cohesion. La defense reduit le risque militaire. Une fiscalite trop haute pese sur la popularite.</p>
    <p>Condition d'heritage : garder la dette sous <strong>132 % du PIB</strong> a la fin du mandat.</p>
  `;
}

function effectLabel(effect) {
  const labels = {
    cohesion: "cohesion sociale",
    popularite: "popularite",
    preparation: "preparation militaire",
    securite: "securite interieure",
    succes: "succes des reformes",
    stabilite: "stabilite",
    influence: "influence"
  };
  return labels[effect] || effect;
}

function renderWar() {
  if (!state.presidency) {
    $("#theaterList").innerHTML = "<p class='mini-report'>La defense detaillee s'ouvre apres l'investiture.</p>";
    $("#warActions").innerHTML = "";
    return;
  }
  const p = state.presidency;
  $("#theaterList").innerHTML = p.theaters.map((theater) => `
    <article class="theater-card">
      <div class="theater-meta">
        <strong>${theater.name}</strong>
        <span>${theater.type}</span>
      </div>
      <div class="three-bars">
        ${barLine("Menace", theater.threat, true)}
        ${barLine("Controle", theater.control)}
        ${barLine("Forces", theater.forces)}
        ${barLine("Allies", theater.allies)}
      </div>
      <div class="action-impact">
        <button class="small-button" data-war="forces" data-theater="${theater.id}">Renforts</button>
        <button class="small-button" data-war="intel" data-theater="${theater.id}">Renseignement</button>
        <button class="small-button" data-war="allies" data-theater="${theater.id}">Allies</button>
      </div>
    </article>
  `).join("");
  $$("#theaterList [data-war]").forEach((button) => {
    button.addEventListener("click", () => deployWarOrder(button.dataset.war, button.dataset.theater));
  });
  $("#warActions").innerHTML = `
    <button class="action-button" data-war-global="forces">
      <strong>Projection rapide</strong>
      <p>Renforce un theatre aleatoire sous tension. Cout budgetaire et diplomatique modere.</p>
    </button>
    <button class="action-button" data-war-global="intel">
      <strong>Operation de renseignement</strong>
      <p>Reduit une menace, avec risque de revelation politique.</p>
    </button>
    <button class="action-button" data-war-global="allies">
      <strong>Coalition alliee</strong>
      <p>Ameliore le controle et fait baisser la tension generale.</p>
    </button>
  `;
  $$("#warActions [data-war-global]").forEach((button) => {
    button.addEventListener("click", () => deployWarOrder(button.dataset.warGlobal));
  });
}

function barLine(label, value, invert = false) {
  const status = invert
    ? value > 70 ? "bad" : value > 42 ? "warning" : "good"
    : value > 66 ? "good" : value < 34 ? "bad" : "warning";
  return `
    <div class="bar-line">
      <span>${label}</span>
      <div class="bar"><span class="${status}" style="width:${clamp(value)}%"></span></div>
      <strong>${fmt(value)}</strong>
    </div>
  `;
}

function renderDiplomacy() {
  if (!state.presidency) {
    $("#travelList").innerHTML = "<p class='mini-report'>Les voyages diplomatiques seront disponibles apres l'election.</p>";
    $("#diplomacyReport").innerHTML = "";
    return;
  }
  const p = state.presidency;
  $("#travelList").innerHTML = p.travels.map((travel) => `
    <article class="travel-card">
      <div class="travel-meta">
        <strong>${travel.name}</strong>
        <span>${travel.place}</span>
      </div>
      <p>${travel.benefit}</p>
      <p><strong>Phrase recue :</strong> "${travel.quote}"<br><strong>Traduction :</strong> "${travel.translation}"</p>
      <button class="action-button" data-travel="${travel.id}">
        <strong>Organiser le voyage</strong>
        <p>Cout protocolaire : ${fmt(travel.cost, 1)} M EUR. Retombees variables selon le contexte.</p>
      </button>
    </article>
  `).join("");
  $$("#travelList [data-travel]").forEach((button) => {
    button.addEventListener("click", () => takeTravel(button.dataset.travel));
  });
  $("#diplomacyReport").innerHTML = `
    <p>Influence actuelle : <strong>${fmt(p.influence)}</strong>.</p>
    <p>Voyages realises : <strong>${p.travelDone}</strong>.</p>
    <p>Les voyages ameliorent l'influence et peuvent reduire certains fronts, mais trop voyager pendant une crise interieure expose la popularite.</p>
  `;
}

function renderCabinet() {
  if (!state.presidency) {
    $("#cabinetList").innerHTML = "<p class='mini-report'>L'entourage sera forme a l'investiture.</p>";
    $("#cabinetReport").innerHTML = "";
    return;
  }
  const p = state.presidency;
  $("#cabinetList").innerHTML = p.cabinet.map((member, index) => `
    <article class="cabinet-card">
      <div class="cabinet-meta">
        <strong>${member.role}</strong>
        <span>${member.name}</span>
      </div>
      <div class="three-bars">
        ${barLine("Competence", member.competence)}
        ${barLine("Loyaute", member.loyalty)}
        ${barLine("Risque", member.risk, true)}
      </div>
      <div class="action-impact">
        <button class="small-button" data-cabinet="brief" data-index="${index}">Briefing</button>
        <button class="small-button" data-cabinet="discipline" data-index="${index}">Discipline</button>
        <button class="small-button" data-cabinet="reshuffle" data-index="${index}">Remanier</button>
      </div>
    </article>
  `).join("");
  $$("#cabinetList [data-cabinet]").forEach((button) => {
    button.addEventListener("click", () => cabinetAction(Number(button.dataset.index), button.dataset.cabinet));
  });
  const avgCompetence = p.cabinet.reduce((sum, member) => sum + member.competence, 0) / p.cabinet.length;
  const avgLoyalty = p.cabinet.reduce((sum, member) => sum + member.loyalty, 0) / p.cabinet.length;
  const avgRisk = p.cabinet.reduce((sum, member) => sum + member.risk, 0) / p.cabinet.length;
  $("#cabinetReport").innerHTML = `
    <p>Competence moyenne : <strong>${fmt(avgCompetence)}</strong>.</p>
    <p>Loyaute moyenne : <strong>${fmt(avgLoyalty)}</strong>.</p>
    <p>Risque de fuite : <strong>${fmt(avgRisk)}</strong>. Un cabinet competent mais deloyal produit des reformes rapides et des unes tres embarrassantes.</p>
  `;
}

function showModal({ kicker, title, body, actions }) {
  $("#modalKicker").textContent = kicker;
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modalActions").innerHTML = actions.map((action, index) => `
    <button class="${action.primary ? "primary-button" : "ghost-button"}" data-modal-action="${index}">${action.label}</button>
  `).join("");
  $$("#modalActions [data-modal-action]").forEach((button) => {
    button.addEventListener("click", () => actions[Number(button.dataset.modalAction)].run());
  });
  $("#modal").classList.remove("hidden");
}

function closeModal() {
  $("#modal").classList.add("hidden");
}

function resetGame() {
  localStorage.removeItem("president-simulator-save");
  state = createInitialState();
  activeTab = "overview";
  timeAccumulator = 0;
  closeModal();
  $("#setupView").classList.remove("hidden");
  $("#gameView").classList.add("hidden");
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === "overview"));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === "overviewPanel"));
  renderIntroCanvas();
}

function saveGame() {
  const saveState = { ...state, activeEvent: null, missions: [] };
  localStorage.setItem("president-simulator-save", JSON.stringify({ state: saveState, activeTab }));
  notify("Sauvegarde locale effectuee.");
}

function loadGame() {
  const raw = localStorage.getItem("president-simulator-save");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved?.state) {
      state = saved.state;
      activeTab = saved.activeTab || "overview";
      if (state.phase !== "setup") {
        $("#setupView").classList.add("hidden");
        $("#gameView").classList.remove("hidden");
      }
      generateMissions();
      switchTab(activeTab);
      render();
    }
  } catch {
    localStorage.removeItem("president-simulator-save");
  }
}

function switchTab(tabName) {
  activeTab = tabName;
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${tabName}Panel`));
  drawMaps();
}

function bindUi() {
  $("#candidateForm").addEventListener("submit", startCampaign);
  $("#pauseBtn").addEventListener("click", () => {
    state.paused = !state.paused;
    $("#pauseIcon").textContent = state.paused ? ">" : "II";
  });
  $$(".speed-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.speed = Number(button.dataset.speed);
      $$(".speed-btn").forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
  $("#taxSlider").addEventListener("input", (event) => {
    if (!state.presidency) return;
    state.presidency.taxRate = Number(event.target.value);
    renderBudget();
    renderMetrics();
    renderTimeAndLevel();
  });
  $("#saveBtn").addEventListener("click", saveGame);
  $("#resetBtn").addEventListener("click", resetGame);
}

function drawMaps() {
  frame += 1;
  renderIntroCanvas();
  renderGameMap();
}

function renderIntroCanvas() {
  const canvas = $("#introCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawFranceLikeShape(ctx, w * 0.5, h * 0.52, 1.25, "rgba(111, 182, 255, 0.22)", "rgba(231, 224, 210, 0.72)");
  drawRadar(ctx, w * 0.72, h * 0.35, 92, frame * 0.025);
  drawDocumentStack(ctx, w * 0.12, h * 0.2);
  drawPulsePoint(ctx, w * 0.48, h * 0.41, "#e0ba65", "Elysee");
  drawPulsePoint(ctx, w * 0.58, h * 0.58, "#ff746d", "Crise");
  drawPulsePoint(ctx, w * 0.38, h * 0.63, "#70d49a", "Terrain");
}

function renderGameMap() {
  const canvas = $("#mapCanvas");
  if (!canvas || $("#gameView").classList.contains("hidden")) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawFranceLikeShape(ctx, w * 0.42, h * 0.52, 1.28, "rgba(111, 182, 255, 0.2)", "rgba(231, 224, 210, 0.75)");

  if (state.phase === "campaign") {
    const c = state.campaign;
    const cities = [
      ["Paris", 0.43, 0.36, c.polls],
      ["Lyon", 0.52, 0.57, c.groundGame],
      ["Marseille", 0.55, 0.76, c.momentum],
      ["Bordeaux", 0.34, 0.66, c.credibility],
      ["Lille", 0.44, 0.21, c.endorsements * 18 + 22],
      ["Nantes", 0.25, 0.49, c.funds * 9]
    ];
    cities.forEach(([label, x, y, value]) => drawPulsePoint(ctx, w * x, h * y, value > 58 ? "#70d49a" : value < 36 ? "#ff746d" : "#e0ba65", label, clamp(value)));
    drawCampaignBars(ctx, w, h);
  } else if (state.presidency) {
    const p = state.presidency;
    drawPulsePoint(ctx, w * 0.43, h * 0.36, "#e0ba65", "Elysee", p.popularity);
    drawPulsePoint(ctx, w * 0.55, h * 0.51, p.stability > 55 ? "#70d49a" : "#ff746d", "Institutions", p.stability);
    drawPulsePoint(ctx, w * 0.31, h * 0.58, p.cohesion > 55 ? "#70d49a" : "#e0ba65", "Cohesion", p.cohesion);
    const coords = {
      sahel: [0.66, 0.83],
      almar: [0.76, 0.55],
      baltique: [0.72, 0.22],
      cyber: [0.24, 0.24],
      orbite: [0.84, 0.34]
    };
    p.theaters.forEach((theater) => {
      const [x, y] = coords[theater.id] || [rnd(0.2, 0.8), rnd(0.2, 0.8)];
      const color = theater.threat > 66 ? "#ff746d" : theater.threat > 42 ? "#e0ba65" : "#70d49a";
      drawPulsePoint(ctx, w * x, h * y, color, theater.name, theater.threat);
      drawLine(ctx, w * 0.43, h * 0.36, w * x, h * y, color, theater.threat);
    });
    drawMandateGauge(ctx, w, h);
  }
}

function drawGrid(ctx, w, h) {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#0c151d");
  gradient.addColorStop(1, "#101014");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.055)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawFranceLikeShape(ctx, cx, cy, scale, fill, stroke) {
  const pts = [
    [-92, -130], [-18, -158], [62, -126], [112, -55], [92, 30],
    [128, 96], [42, 136], [-44, 118], [-116, 60], [-136, -22]
  ];
  ctx.beginPath();
  pts.forEach(([x, y], index) => {
    const px = cx + x * scale;
    const py = cy + y * scale;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(231,224,210,0.18)";
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - 110 * scale, cy + i * 40 * scale);
    ctx.quadraticCurveTo(cx, cy + (i * 26 - 18) * scale, cx + 112 * scale, cy + (i * 28 + 20) * scale);
    ctx.stroke();
  }
}

function drawRadar(ctx, cx, cy, radius, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(112,212,154,0.35)";
  ctx.lineWidth = 1;
  for (let r = radius / 3; r <= radius; r += radius / 3) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.rotate(angle);
  const gradient = ctx.createLinearGradient(0, 0, radius, 0);
  gradient.addColorStop(0, "rgba(112,212,154,0.0)");
  gradient.addColorStop(1, "rgba(112,212,154,0.55)");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius, 0);
  ctx.stroke();
  ctx.restore();
}

function drawDocumentStack(ctx, x, y) {
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = `rgba(231,224,210,${0.12 + i * 0.08})`;
    ctx.strokeStyle = "rgba(231,224,210,0.28)";
    ctx.lineWidth = 1;
    ctx.fillRect(x + i * 16, y + i * 18, 150, 92);
    ctx.strokeRect(x + i * 16, y + i * 18, 150, 92);
    ctx.fillStyle = "rgba(231,224,210,0.34)";
    for (let line = 0; line < 4; line += 1) {
      ctx.fillRect(x + i * 16 + 18, y + i * 18 + 20 + line * 14, 95 + line * 8, 3);
    }
  }
}

function drawPulsePoint(ctx, x, y, color, label, value = 55) {
  const pulse = 8 + Math.sin(frame / 10) * 3 + clamp(value, 0, 100) / 18;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.arc(x, y, pulse * 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(238,243,247,0.86)";
  ctx.font = "700 13px Inter, system-ui, sans-serif";
  ctx.fillText(label, x + 12, y - 10);
}

function drawLine(ctx, x1, y1, x2, y2, color, value) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = clamp(value / 130, 0.18, 0.65);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 9]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function drawCampaignBars(ctx, w, h) {
  const c = state.campaign;
  const items = [
    ["Opinion", c.polls * 1.7],
    ["Credibilite", c.credibility],
    ["Terrain", c.groundGame],
    ["Risque", 100 - c.privacyRisk]
  ];
  const x = w * 0.68;
  const y = h * 0.68;
  ctx.fillStyle = "rgba(8,12,16,0.72)";
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x - 22, y - 34, 238, 146);
  ctx.strokeRect(x - 22, y - 34, 238, 146);
  ctx.fillStyle = "rgba(238,243,247,0.9)";
  ctx.font = "800 13px Inter, system-ui, sans-serif";
  ctx.fillText("Projection electorale", x, y - 10);
  items.forEach(([label, value], index) => {
    const yy = y + 18 + index * 25;
    ctx.fillStyle = "rgba(156,170,186,0.95)";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.fillText(label, x, yy);
    ctx.fillStyle = value > 65 ? "#70d49a" : value < 38 ? "#ff746d" : "#e0ba65";
    ctx.fillRect(x + 86, yy - 9, clamp(value, 0, 100), 8);
  });
}

function drawMandateGauge(ctx, w, h) {
  const p = state.presidency;
  const x = w * 0.67;
  const y = h * 0.67;
  const level = computeLevel(p);
  ctx.fillStyle = "rgba(8,12,16,0.75)";
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x - 22, y - 34, 250, 154);
  ctx.strokeRect(x - 22, y - 34, 250, 154);
  ctx.fillStyle = "rgba(238,243,247,0.9)";
  ctx.font = "850 13px Inter, system-ui, sans-serif";
  ctx.fillText("Indice d'heritage", x, y - 10);
  const rows = [
    ["Niveau", level],
    ["Popularite", p.popularity],
    ["Succes", p.success],
    ["Stabilite", p.stability],
    ["Dette maitrisee", clamp(160 - p.debt, 0, 100)]
  ];
  rows.forEach(([label, value], index) => {
    const yy = y + 17 + index * 22;
    ctx.fillStyle = "rgba(156,170,186,0.95)";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.fillText(label, x, yy);
    ctx.fillStyle = value > 66 ? "#70d49a" : value < 38 ? "#ff746d" : "#e0ba65";
    ctx.fillRect(x + 100, yy - 8, clamp(value, 0, 100), 7);
  });
}

bindUi();
renderIntroCanvas();
setInterval(gameTick, 1000);
loadGame();
