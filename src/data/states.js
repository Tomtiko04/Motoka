// Data-driven so /states/:slug is one route/component instead of six
// near-identical page files. Each entry maps directly to a StatePage render.
export const STATES = [
  {
    slug: 'lagos',
    name: 'Lagos',
    cities: 'Ikeja, Lekki, Surulere, or anywhere else in Lagos',
    intro:
      "Lagos has the highest vehicle volume of any state Motoka serves — which usually means the longest queues at the licensing office. Renew your vehicle license, road worthiness certificate, and other statutory permits online instead, wherever in Lagos you're based.",
  },
  {
    slug: 'ogun',
    name: 'Ogun State',
    cities: 'Abeokuta, Sagamu, or Ijebu-Ode',
    intro:
      'If your vehicle is registered in Ogun State, Motoka renews your license, road worthiness certificate, and other statutory permits online — no trip to Abeokuta or your local licensing office required.',
  },
  {
    slug: 'oyo',
    name: 'Oyo State',
    cities: 'Ibadan, Ogbomosho, or Oyo town',
    intro:
      'Vehicle owners registered in Oyo State — most commonly in Ibadan — can renew their license and road worthiness certificate through Motoka without visiting a government office in person.',
  },
  {
    slug: 'osun',
    name: 'Osun State',
    cities: 'Osogbo, Ile-Ife, or Ilesa',
    intro:
      'Motoka processes vehicle license and road worthiness renewals for Osun State-registered vehicles online, coordinated through our licensed agent network within the state.',
  },
  {
    slug: 'edo',
    name: 'Edo State',
    cities: 'Benin City, Ekpoma, or Auchi',
    intro:
      'For vehicles registered in Edo State, Motoka handles license renewal, road worthiness certification, and other statutory documents online, without a trip to a licensing office in Benin City.',
  },
  {
    slug: 'rivers',
    name: 'Rivers State',
    cities: 'Port Harcourt or anywhere else in Rivers State',
    intro:
      'Motoka renews vehicle licenses and road worthiness certificates for Rivers State-registered vehicles online — submit your details from anywhere in the state and skip the Port Harcourt licensing office queue.',
  },
]

export function getStateBySlug(slug) {
  return STATES.find((s) => s.slug === slug)
}
