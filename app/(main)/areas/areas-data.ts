export type AreaData = {
  slug: string
  name: string
  county: string
  description: string
  nearbyAreas: string[]
}

export const areas: AreaData[] = [
  { slug: "musselburgh", name: "Musselburgh", county: "East Lothian", description: "Covering all of Musselburgh and surrounding streets including Fisherrow, Pinkie, and Stoneyhill.", nearbyAreas: ["Portobello", "Prestonpans", "Tranent", "Dalkeith"] },
  { slug: "dalkeith", name: "Dalkeith", county: "Midlothian", description: "Full mobile mechanic coverage across Dalkeith including Eskbank, Woodburn, and Hardengreen.", nearbyAreas: ["Bonnyrigg", "Newtongrange", "Gorebridge", "Musselburgh"] },
  { slug: "bonnyrigg", name: "Bonnyrigg", county: "Midlothian", description: "Serving Bonnyrigg and the surrounding Midlothian area including Lasswade and Broomieknowe.", nearbyAreas: ["Dalkeith", "Loanhead", "Penicuik", "Gorebridge"] },
  { slug: "penicuik", name: "Penicuik", county: "Midlothian", description: "Mobile mechanic covering Penicuik, Valleyfield, and the surrounding Midlothian villages.", nearbyAreas: ["Bonnyrigg", "Loanhead", "Gorebridge", "Edinburgh"] },
  { slug: "loanhead", name: "Loanhead", county: "Midlothian", description: "Covering Loanhead and nearby areas including Straiton and Burdiehouse.", nearbyAreas: ["Bonnyrigg", "Penicuik", "Edinburgh", "Dalkeith"] },
  { slug: "portobello", name: "Portobello", county: "Edinburgh", description: "Mobile mechanic serving Portobello, Joppa, and the east Edinburgh coastline.", nearbyAreas: ["Musselburgh", "Leith", "Edinburgh", "Prestonpans"] },
  { slug: "leith", name: "Leith", county: "Edinburgh", description: "Covering Leith, Newhaven, Granton, and the north Edinburgh waterfront area.", nearbyAreas: ["Edinburgh", "Portobello", "South Queensferry", "Musselburgh"] },
  { slug: "south-queensferry", name: "South Queensferry", county: "Edinburgh", description: "Mobile mechanic covering South Queensferry, Kirkliston, and the Queensferry area.", nearbyAreas: ["Edinburgh", "Broxburn", "Linlithgow", "Leith"] },
  { slug: "livingston", name: "Livingston", county: "West Lothian", description: "Serving Livingston including Dedridge, Craigshill, Knightsridge, and all surrounding areas.", nearbyAreas: ["Broxburn", "Bathgate", "Linlithgow", "Edinburgh"] },
  { slug: "bathgate", name: "Bathgate", county: "West Lothian", description: "Mobile mechanic covering Bathgate, Armadale, Whitburn, and surrounding West Lothian areas.", nearbyAreas: ["Livingston", "Broxburn", "Linlithgow", "Falkirk area"] },
  { slug: "broxburn", name: "Broxburn", county: "West Lothian", description: "Serving Broxburn, Uphall, and East Calder across West Lothian.", nearbyAreas: ["Livingston", "South Queensferry", "Edinburgh", "Bathgate"] },
  { slug: "prestonpans", name: "Prestonpans", county: "East Lothian", description: "Mobile mechanic covering Prestonpans, Tranent, and the East Lothian coast.", nearbyAreas: ["Musselburgh", "Haddington", "Tranent", "Portobello"] },
  { slug: "haddington", name: "Haddington", county: "East Lothian", description: "Serving Haddington, Gifford, and the surrounding East Lothian countryside.", nearbyAreas: ["Tranent", "Prestonpans", "Musselburgh", "North Berwick"] },
  { slug: "gorebridge", name: "Gorebridge", county: "Midlothian", description: "Mobile mechanic covering Gorebridge, Newtongrange, and surrounding Midlothian villages.", nearbyAreas: ["Dalkeith", "Bonnyrigg", "Penicuik", "Pathhead"] },
  { slug: "linlithgow", name: "Linlithgow", county: "West Lothian", description: "Covering Linlithgow and Bo'ness area in West Lothian.", nearbyAreas: ["Bathgate", "Broxburn", "South Queensferry", "Falkirk"] },
]
