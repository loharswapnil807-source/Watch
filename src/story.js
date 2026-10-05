export const milestones = {
  '1601': {
    location: 'GENEVA, SWITZERLAND',
    title: 'Craft becomes a collective.',
    description: "The Watchmakers Guild of Geneva is established. What began at individual workbenches becomes a shared tradition of skill, standards, and knowledge passed from one generation to the next.",
    source: 'https://www.fhs.swiss/eng/origins.html',
  },
  '1770': {
    location: 'THE SWISS WATCHMAKING TRADITION',
    title: 'Motion becomes energy.',
    description: "Abraham-Louis Perrelet creates a ‘perpetual’ watch. Considered by many a precursor to modern self-winding watches, it introduces a beautiful possibility: a timepiece powered by its wearer's movement.",
    source: 'https://www.fhs.swiss/eng/origins.html',
  },
  '1842': {
    location: 'A NEW WAY TO WIND',
    title: 'A small crown. A great change.',
    description: "Adrien Philippe develops pendant winding. The traditional winding key gives way to a mechanism operated at the watch itself, bringing a new elegance and everyday practicality to the ritual of keeping time.",
    source: 'https://www.fhs.swiss/eng/origins.html',
  },
  '1961': {
    location: 'BENGALURU, INDIA',
    title: 'Precision for the people.',
    description: "HMT partners with Citizen of Japan to establish watch manufacturing in Bengaluru. The mechanical watch becomes an expression of industrial self-reliance, a meaningful gift, and a companion to everyday Indian life.",
    source: 'https://www.hmtwatches.in/',
  },
  '2022': {
    location: 'SURAT, INDIA',
    title: 'The story changes hands.',
    description: "A new generation enters the conversation. Argos emerges with the aim of making premium mechanical watch ownership more accessible, pairing Indian design and assembly with globally sourced components.",
    source: 'https://inc42.com/company/argos-watches/',
  },
};

export const mechanicsChapters = [
  {
    label: '001 / THE COMPLETE OBJECT',
    description: 'A mechanical watch is a tiny universe in perfect balance. Scroll to lift the crystal, separate the dial, and discover the movement at its heart.',
    component: 0,
  },
  {
    label: '002 / BEAUTY, OPENED UP',
    description: 'The crystal rises. The bezel, hands, and dial follow. Every layer has a purpose: to protect, to express, and to give precision a face.',
    component: 1,
  },
  {
    label: '003 / THE HEART OF THE MATTER',
    description: 'Beneath the dial, a spring stores energy. Gears carry it. A balance and escapement measure it. A quiet conversation between beautifully precise parts.',
    component: 2,
  },
  {
    label: '004 / BACK IN HARMONY',
    description: 'Continue scrolling and the individual parts become a whole again. Structure, movement, expression, protection. A world reunited, ready for your wrist.',
    component: 3,
  },
];

export function explosionForProgress(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const smooth = x => x * x * (3 - 2 * x);
  if (p < .12) return 0;
  if (p < .43) return smooth((p - .12) / .31);
  if (p < .60) return 1;
  if (p < .94) return 1 - smooth((p - .60) / .34);
  return 0;
}
