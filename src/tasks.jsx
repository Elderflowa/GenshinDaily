// Everything on the checklists lives here. Edit freely: add, remove or reorder entries.
//   id     unique, used to remember the checkbox
//   icon   image URL (or inline <svg>)
//   badge  small text on the right (optional)
//   timer  { ms, ready } makes it a cooldown instead of a checkbox (optional)

const HOUR = 3600000
const WIKI = 'https://static.wikia.nocookie.net/gensin-impact/images'
const PAIMON = 'https://paimon.moe/images'

const ExpeditionIcon = (
  <svg viewBox="0 0 28 28" fill="none">
    <path d="M3 6 L10 4 L10 22 L3 24 Z" fill="currentColor" opacity=".35" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10 4 L18 7 L18 25 L10 22 Z" fill="currentColor" opacity=".55" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M18 7 L25 4 L25 22 L18 25 Z" fill="currentColor" opacity=".35" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="14" cy="12" r="2.5" fill="currentColor" />
    <path d="M14 14.8 C11.5 17.5 10.5 19 10.5 20.2 a3.5 3.5 0 0 0 7 0 C17.5 19 16.5 17.5 14 14.8z" fill="currentColor" />
  </svg>
)

export const DAILY = [
  { id: 'plants', label: 'Serenitea Pot Plants', icon: `${WIKI}/4/44/Icon_Housing_Landform_Field.png`, timer: { ms: (2 * 24 + 22) * HOUR, ready: 'Ready to plant' } },
  { id: 'expedition', label: 'Claim Expeditions', icon: ExpeditionIcon },
  { id: 'bp', label: 'Battle Pass Quests', icon: `${WIKI}/e/e4/System_Battle_Pass.png` },
  { id: 'teapot', label: 'Teapot: Claim Currency & Friendship', icon: `${WIKI}/e/e8/System_Serenitea_Pot.png` },
  { id: 'commissions', label: 'Daily Commissions', icon: `${WIKI}/6/62/Icon_Commission.svg`, badge: '×4' },
  { id: 'hoyolab', label: 'Sign in to Hoyolab', icon: 'https://static.wikia.nocookie.net/zenless-zone-zero/images/f/f4/HoYoLAB.png/revision/latest/thumbnail/width/360/height/360' },
  { id: 'groceries', label: 'Buy Milk, Wheat & Meat', icon: `${WIKI}/3/37/Item_Milk.png` },
]

export const REGION_COLORS = {
  Mondstadt: '#7ec8e3',
  Liyue: '#f5c518',
  Inazuma: '#c084fc',
  Sumeru: '#4ade80',
  Fontaine: '#60a5fa',
  Natlan: '#fb923c',
  'Nod-Krai': '#94a3b8',
  'Chenyu Vale': '#2dd4bf',
  'Frost Moon': '#a5b4fc',
  Snezhnaya: '#93c5fd',
}

// Daily bosses: [name, where, material shown in-game, icon] where icon is an item name to look up,
// a list of names to try in order, or a direct image URL (optional).
const DAILY_BOSS_REGIONS = [
  ['Mondstadt', [['Churldric', 'North', 'Hilichurl Scrolls', 'Divining Scroll']]],
  ['Chenyu Vale', [['Yiji and Tianyu', 'Central', 'Fragile Bones', 'Fragile Bone Shard']]],
  ['Fontaine', [
    ['2x Manta Ray', 'In Water', 'Transoceanic Pearls', 'Transoceanic Pearl'],
    ['Automaton A.S.F.G', 'North East', 'Meshing Gears', 'https://static.wikia.nocookie.net/gensin-impact/images/2/28/Item_Meshing_Gear.png'],
  ]],
  ['Nod-Krai', [['Raskolnikov', 'North', 'Fatui Operative Warrants', 'https://cdn.genshintrack.com/materials/immaculate-warrant.webp']]],
  ['Natlan', [
    ['Sappho Amidst the Waves', 'East', 'Saurian Whistles', 'Saurian Whistle'],
    ['Polychrome Tri-Stars', 'Center', 'Fatui Insignias', "Recruit's Insignia"],
    ['Bronzelock', 'Ochkanatlan East', 'Chaos Ruin', ['Chaos Ruin', 'Chaos Device']],
  ]],
  ['Frost Moon', [
    ['Prism Slime', 'West', 'Slime Drops', 'Slime Condensate'],
    ['Mushteshir', 'North', 'Chaos Ruin', ['Chaos Ruin', 'Chaos Device']],
  ]],
  ['Snezhnaya', [
    ['Furiosa', 'Central', 'Accreted Growth', 'https://static.wikia.nocookie.net/gensin-impact/images/d/db/Item_Accreted_Growth.png'],
    ['Bandersnatch', 'East', 'Chimeric ', 'https://static.wikia.nocookie.net/gensin-impact/images/c/c3/Item_Prime_Chimeric_Nexus.png'],
  ]],
]

export const DAILY_BOSS_GROUPS = DAILY_BOSS_REGIONS.map(([title, bosses]) => ({
  title,
  tasks: bosses.map(([label, place, material, find]) => ({
    id: `b_${label.toLowerCase().replace(/[^a-z]+/g, '_')}`,
    label,
    sub: place && `${place} · ${material}`,
    material: [].concat(find ?? []),
  })),
}))

const WEEKLY_BOSSES = [
  { id: 'w_dvalin', label: 'Stormterror', region: 'Mondstadt', place: "Stormterror's Lair", icon: `${WIKI}/8/8f/Stormterror_Icon.png` },
  { id: 'w_wolf', label: 'Andrius', region: 'Mondstadt', place: 'Wolvendom', icon: `${WIKI}/a/a4/Andrius_Icon.png` },
  { id: 'w_nod_krai', label: 'The Game Before the Gate', region: 'Mondstadt', place: 'Falcon Coast', icon: `${WIKI}/f/f1/The_Game_Before_the_Gate_Icon.png` },
  { id: 'w_childe', label: 'Tartaglia', region: 'Liyue', place: 'Golden House', icon: `${WIKI}/d/d9/Childe_P3_Icon.png` },
  { id: 'w_azhdaha', label: 'Azhdaha', region: 'Liyue', place: 'Mt. Hulao', icon: `${WIKI}/1/18/Enemy_Azhdaha.png` },
  { id: 'w_signora', label: 'La Signora', region: 'Inazuma', place: 'Inazuma City', icon: `${WIKI}/5/57/NPC_Signora_Icon.png` },
  { id: 'w_raiden', label: 'Raiden Shogun', region: 'Inazuma', place: 'Grand Narukami Shrine', icon: `${PAIMON}/characters/raiden_shogun.png` },
  { id: 'w_scaramouche', label: 'Scaramouche', region: 'Sumeru', place: 'Chinvat Ravine', icon: `${PAIMON}/characters/wanderer.png` },
  { id: 'w_apep', label: "Guardian of Apep's Oasis", region: 'Sumeru', place: 'Desert of Hadramaveth', icon: `${WIKI}/e/e2/Guardian_of_Apep%27s_Oasis_Icon.png` },
  { id: 'w_narwhal', label: 'All-Devouring Narwhal', region: 'Fontaine', place: 'Salacia Plain', icon: `${WIKI}/4/47/All-Devouring_Narwhal_Icon.png` },
  { id: 'w_knave', label: 'The Knave', region: 'Fontaine', place: 'Mont Esus East', icon: `${PAIMON}/characters/arlecchino.png` },
  { id: 'w_natlan', label: 'Lord of Eroded Primal Fire', region: 'Natlan', place: 'Stadium of the Sacred Flame', icon: `${WIKI}/7/7e/Lord_of_Eroded_Primal_Fire_Icon.png` },
  { id: 'w_heretic', label: 'Heretic of the False Moon', region: 'Nod-Krai', place: 'Special Territory Research Institute', icon: `${WIKI}/e/ee/Heretic_of_the_False_Moon_Icon.png` },
]

const WEEKLY_OTHER = [
  { id: 'w_rep', label: 'Reputation Quests', icon: `${WIKI}/8/8e/System_City_Reputation.png` },
  { id: 'w_bounty', label: 'Reputation Bounties', icon: `${WIKI}/8/8e/System_City_Reputation.png` },
  { id: 'w_teapot', label: 'Teapot: Transient Resin', icon: `${WIKI}/f/f6/Item_Transient_Resin.png` },
  { id: 'w_parametric', label: 'Parametric Transformer', icon: `${WIKI}/f/f1/Item_Parametric_Transformer.png` },
  { id: 'crystal', label: 'Crystal Fly Traps (×3)', icon: 'https://hutaobot.moe/img/material/Crystalfly_Trap.png', timer: { ms: 7 * 24 * HOUR, ready: '7d cooldown' } },
]

export const MONTHLY = [
  { id: 'm_stygian', label: 'Stygian Onslaught', icon: 'https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2025/07/14/41133912/b6287b34deb1f4d12e0be0599584cc70_855379148837321239.png' },
  { id: 'm_abyss', label: 'Spiral Abyss', icon: `${WIKI}/7/79/Achievement_Domains_and_Spiral_Abyss_Series_I.png` },
  { id: 'm_transmute', label: 'Artifact Transmutation', icon: `${WIKI}/1/12/Item_Artifact_Transmuter.png` },
]

export const WEEKLY_GROUPS = [
  ...[...new Set(WEEKLY_BOSSES.map(b => b.region))].map(region => ({
    title: region,
    tasks: WEEKLY_BOSSES.filter(b => b.region === region).map(({ id, label, icon, place }) => ({ id, label, icon, sub: place })),
  })),
  { title: 'Other', tasks: WEEKLY_OTHER },
]
