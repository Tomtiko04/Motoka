// Lagos State traffic offences and penalties.
//
// Transcribed from the gazetted schedules in the Lagos State Transport Sector
// Reform Law, published as a scanned PDF at
// https://tms.lagosstate.gov.ng/docs/TrafficLaw.pdf (retrieved 2026-09-03).
// The scan has no text layer, so this was read page by page rather than copied.
//
// Two separate schedules are merged here and kept distinguishable by
// `authority`: LASTMA enforces the traffic offences, the Vehicle Inspection
// Service enforces the documentation and roadworthiness ones. Several offences
// appear in both with different demerit points, which is why every entry says
// who is doing the enforcing.
//
// Fine amounts are the volatile field. Published news lists carry figures that
// disagree with this gazette — BRT corridor use is 20,000 here and is widely
// reported as 70,000 — so amounts are shown with their source and date rather
// than as settled fact. Offences and demerit points are stable; naira is not.
//
// One row is deliberately absent: item 27 of the inspection schedule falls on
// a page break in the source scan and could not be read.

export const TRAFFIC_RULES_SOURCE = {
  document: "Lagos State Transport Sector Reform Law \u2014 gazetted schedules",
  url: "https://tms.lagosstate.gov.ng/docs/TrafficLaw.pdf",
  publisher: "Lagos State Government",
  retrieved: "2026-09-03",
  schedules: [
    { authority: "LASTMA", title: "Traffic Offences and Penalties", pages: "A183\u2013A187", count: 64 },
    { authority: "VIS", title: "Vehicle Inspection Offences and Penalties", pages: "A161\u2013A165", count: 53 },
  ],
};

const trafficRules = [
  {
    "id": "a1",
    "no": 1,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Violation of routes by commercial vehicles",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; counselling and enlightenment by LASDRI"
  },
  {
    "id": "a2",
    "no": 2,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Non-display of route and route number on vehicle",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "—"
  },
  {
    "id": "a3",
    "no": 3,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Disobeying traffic control personnel",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a4",
    "no": 4,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Parking on yellow line on a public highway / illegal parking",
    "points": "4",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a5",
    "no": 5,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Neglect of traffic directions",
    "points": "2",
    "fine": "Forfeiture of the vehicle to the State",
    "additional": "6 months imprisonment / 1 year community service"
  },
  {
    "id": "a6",
    "no": 6,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Vehicle crossing double yellow line / centre line",
    "points": "4",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; more training at LASDRI"
  },
  {
    "id": "a7",
    "no": 7,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Staying within the yellow junction box (offside rule)",
    "points": "3",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a8",
    "no": 8,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Failure to yield to right of way of pedestrians at a zebra crossing",
    "points": "3",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a9",
    "no": 9,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Failure to give way to traffic on the left at a roundabout",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a10",
    "no": 10,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Smoking / drinking alcohol while driving",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 months imprisonment or 6 months community service"
  },
  {
    "id": "a11",
    "no": 11,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Riding motorcycle without crash helmet for rider",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 months imprisonment or 6 months community service"
  },
  {
    "id": "a12",
    "no": 12,
    "authority": "LASTMA",
    "category": "Licensing&Registration",
    "title": "Riding a motorcycle without a rider’s permit",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound motorcycle; collect permit before release"
  },
  {
    "id": "a13",
    "no": 13,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Riding a motorcycle (i) against traffic (ii) on the kerb, median or road setbacks",
    "points": "2",
    "fine": "₦50,000 / ₦100,000",
    "additional": "3 months imprisonment / 6 months community service"
  },
  {
    "id": "a14",
    "no": 14,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Conveying more than one passenger at any given time, both rider and passenger",
    "points": "2",
    "fine": "₦50,000 / ₦100,000",
    "additional": "3 months imprisonment or both fine and imprisonment; 6 months community service"
  },
  {
    "id": "a15",
    "no": 15,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Instalment of musical gadget on a motorcycle",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Forfeiture of the gadget; counselling / enlightenment"
  },
  {
    "id": "a16",
    "no": 16,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Alteration of manufacturer’s specification on motorcycle (e.g. handle bar / leg)",
    "points": "2",
    "fine": "₦20,000",
    "additional": "Revert to manufacturer’s specification"
  },
  {
    "id": "a17",
    "no": 17,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Motorcyclist resisting arrest",
    "points": "—",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Additional LASDRI training before release"
  },
  {
    "id": "a18",
    "no": 18,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Driving motor vehicle / motorcycle without side mirrors, indicators, brake lights or rear lights",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Install / fix before release; counselling and enlightenment at LASDRI"
  },
  {
    "id": "a19",
    "no": 19,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Wrongful overtaking of other vehicle",
    "points": "—",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 years imprisonment, or both fine and imprisonment"
  },
  {
    "id": "a20",
    "no": 20,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Under-aged person riding a motorcycle",
    "points": "—",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Dislodge rider and impound motorcycle"
  },
  {
    "id": "a21",
    "no": 21,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Motorcycle operating using horn designed for motor vehicles",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Remove horn and install normal specification"
  },
  {
    "id": "a22",
    "no": 22,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Operating a motorcycle below 200cc engine capacity",
    "points": "3",
    "fine": "—",
    "additional": "Impound motorcycle"
  },
  {
    "id": "a23",
    "no": 23,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Exceeding prescribed speed limit",
    "points": "2",
    "fine": "₦100,000",
    "additional": "2 years imprisonment, or both fine and imprisonment"
  },
  {
    "id": "a24",
    "no": 24,
    "authority": "LASTMA",
    "category": "EmergencyProcedures",
    "title": "Tailgating an emergency vehicle",
    "points": "3",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 months imprisonment, or both fine and imprisonment"
  },
  {
    "id": "a25",
    "no": 25,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Failure of slow moving vehicle to keep to the right lane",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a26",
    "no": 26,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Assault on a traffic officer (physical)",
    "points": "3",
    "fine": "₦100,000 or 6 months imprisonment",
    "additional": "Pay compensation to assaulted officer"
  },
  {
    "id": "a27",
    "no": 27,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Driving in a direction prohibited by the Law / neglect of traffic directions",
    "points": "4",
    "fine": "Forfeiture of vehicle to the State",
    "additional": "1st: 1 year imprisonment + forfeiture. 2nd and subsequent: 3 years imprisonment, forfeiture, and capture of data and biometrics"
  },
  {
    "id": "a28",
    "no": 28,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Illegal U-turns",
    "points": "3",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Driver training at LASDRI"
  },
  {
    "id": "a29",
    "no": 29,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Wrongful overtaking of other vehicle",
    "points": "2",
    "fine": "₦50,000 / ₦100,000",
    "additional": "3 months imprisonment, or both fine and imprisonment, or 6 months community service"
  },
  {
    "id": "a30",
    "no": 30,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Overloading of a commercial vehicle on the highway",
    "points": "4",
    "fine": "₦50,000",
    "additional": "3 months imprisonment or 6 months community service"
  },
  {
    "id": "a31",
    "no": 31,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Driving on the walkway or kerbs",
    "points": "4",
    "fine": "₦50,000",
    "additional": "Impound vehicle; 3 months imprisonment"
  },
  {
    "id": "a32",
    "no": 32,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Parking on the walkway or kerbs",
    "points": "3",
    "fine": "₦20,000",
    "additional": "Impound vehicle; 3 months imprisonment"
  },
  {
    "id": "a33",
    "no": 33,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Parking or stopping to pick passengers by a commercial vehicle on the highway — both driver and passenger",
    "points": "3",
    "fine": "₦50,000",
    "additional": "Driver training at LASDRI or 3 months imprisonment"
  },
  {
    "id": "a34",
    "no": 34,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Bullion van driving in a direction prohibited by Law",
    "points": "5",
    "fine": "Forfeiture of vehicle",
    "additional": "3 years imprisonment or a fine of ₦500,000"
  },
  {
    "id": "a35",
    "no": 35,
    "authority": "LASTMA",
    "category": "EmergencyProcedures",
    "title": "Abandoned vehicle on highway",
    "points": "2",
    "fine": "₦50,000 plus cost of towing",
    "additional": "3 months imprisonment"
  },
  {
    "id": "a36",
    "no": 36,
    "authority": "LASTMA",
    "category": "EmergencyProcedures",
    "title": "Vehicle causing obstruction on highway if broken down",
    "points": "3",
    "fine": "Commercial ₦50,000 + towing; private ₦25,000 + towing",
    "additional": "—"
  },
  {
    "id": "a37",
    "no": 37,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Commuter or conductor hanging on tailboard of moving vehicle",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Dislodge and impound vehicle"
  },
  {
    "id": "a38",
    "no": 38,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Driving vehicle with doors left open",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "1 month community service in addition to fine"
  },
  {
    "id": "a39",
    "no": 39,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Making or receiving phone calls when driving without hands free",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 months community service"
  },
  {
    "id": "a40",
    "no": 40,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Texting / reading text messages while driving",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "6 months community service"
  },
  {
    "id": "a41",
    "no": 41,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Counting money, or otherwise engaging in other activities when driving",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 months community service"
  },
  {
    "id": "a42",
    "no": 42,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Driving without a strapped seat belt for both passengers",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle / strap on seat belt"
  },
  {
    "id": "a43",
    "no": 43,
    "authority": "LASTMA",
    "category": "EmergencyProcedures",
    "title": "Failure to display reflective warning sign at point of breakdown",
    "points": "3",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Procure standardised reflective sign before vehicle release"
  },
  {
    "id": "a44",
    "no": 44,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Motorist resisting arrest",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "a45",
    "no": 45,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Use of BRT Lite corridor",
    "points": "3",
    "fine": "₦20,000 / ₦30,000",
    "additional": "6 months imprisonment / 1 year community service, in addition to LASDRI training"
  },
  {
    "id": "a46",
    "no": 46,
    "authority": "LASTMA",
    "category": "EmergencyProcedures",
    "title": "Wilful obstruction on highway",
    "points": "2",
    "fine": "₦50,000 plus cost of towing",
    "additional": "3 months imprisonment, or both fine and imprisonment"
  },
  {
    "id": "a47",
    "no": 47,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Storage charge for impounded cars, jeeps and mini-buses, per day",
    "points": "—",
    "fine": "₦1,000",
    "additional": "—"
  },
  {
    "id": "a48",
    "no": 48,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Storage charge for impounded motorcycles and three-wheelers, per day",
    "points": "—",
    "fine": "₦500",
    "additional": "—"
  },
  {
    "id": "a49",
    "no": 49,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Storage charge for all other impounded vehicles (six wheelers and above), per day",
    "points": "—",
    "fine": "₦2,000",
    "additional": "—"
  },
  {
    "id": "a50",
    "no": 50,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing impounded cars, jeeps and mini-buses",
    "points": "—",
    "fine": "₦10,000",
    "additional": "—"
  },
  {
    "id": "a51",
    "no": 51,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing other commercial vehicles excluding trailers (mini-buses)",
    "points": "—",
    "fine": "₦10,000",
    "additional": "—"
  },
  {
    "id": "a52",
    "no": 52,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing a trailer or tanker (empty)",
    "points": "—",
    "fine": "₦50,000",
    "additional": "—"
  },
  {
    "id": "a53",
    "no": 53,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing a trailer or tanker (loaded)",
    "points": "—",
    "fine": "₦100,000",
    "additional": "—"
  },
  {
    "id": "a54",
    "no": 54,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing tippers and lorries (loaded)",
    "points": "—",
    "fine": "₦50,000",
    "additional": "—"
  },
  {
    "id": "a55",
    "no": 55,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing luxurious buses",
    "points": "—",
    "fine": "₦50,000",
    "additional": "—"
  },
  {
    "id": "a56",
    "no": 56,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing an overnight breakdown (trailer)",
    "points": "—",
    "fine": "₦100,000",
    "additional": "—"
  },
  {
    "id": "a57",
    "no": 57,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing tricycles",
    "points": "—",
    "fine": "₦2,000",
    "additional": "—"
  },
  {
    "id": "a58",
    "no": 58,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Towing motorcycles",
    "points": "—",
    "fine": "₦500",
    "additional": "—"
  },
  {
    "id": "a59",
    "no": 59,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Hire of heavy duty recovery equipment (towing / recovery fees)",
    "points": "—",
    "fine": "—",
    "additional": "At hirer’s cost"
  },
  {
    "id": "a60",
    "no": 60,
    "authority": "LASTMA",
    "category": "Offenses&Fines",
    "title": "Failure to pay penalty within prescribed time",
    "points": "—",
    "fine": "—",
    "additional": "Double the initial penalty"
  },
  {
    "id": "a61",
    "no": 61,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Operating vehicle within restricted routes or beyond approved hour",
    "points": "3",
    "fine": "₦50,000 / impound vehicle",
    "additional": "Optional 6 months imprisonment / 1 year community service"
  },
  {
    "id": "a62",
    "no": 62,
    "authority": "LASTMA",
    "category": "VehicleRequirements",
    "title": "Not painting a commercial vehicle in approved colours",
    "points": "4",
    "fine": "₦25,000",
    "additional": "Impound vehicle; enforce painting before release"
  },
  {
    "id": "a63",
    "no": 63,
    "authority": "LASTMA",
    "category": "DrivingConduct",
    "title": "Driving under the influence of alcohol / drugs",
    "points": "3",
    "fine": "₦100,000",
    "additional": "1 year imprisonment"
  },
  {
    "id": "a64",
    "no": 64,
    "authority": "LASTMA",
    "category": "RoadSigns&Markings",
    "title": "Disobeying traffic light",
    "points": "2",
    "fine": "₦10,000",
    "additional": "Optional 3 months imprisonment / 6 months community service"
  },
  {
    "id": "b1",
    "no": 1,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving without valid driver’s licence",
    "points": "2",
    "fine": "₦20,000 / ₦20,000",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b2",
    "no": 2,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving of a vehicle by person under 18 years",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; payment for removal and storage"
  },
  {
    "id": "b3",
    "no": 3,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Learner driver without permit",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b4",
    "no": 4,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Learner driver on highways",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Dislodge driver"
  },
  {
    "id": "b5",
    "no": 5,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Learner driver unaccompanied by licenced driver",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Dislodge driver"
  },
  {
    "id": "b6",
    "no": 6,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving an unlicenced, unregistered vehicle",
    "points": "4",
    "fine": "₦20,000 / ₦30,000",
    "additional": "3 months imprisonment, or both fine and imprisonment"
  },
  {
    "id": "b7",
    "no": 7,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving with a fake number plate",
    "points": "4",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Imprisonment not more than 6 months"
  },
  {
    "id": "b8",
    "no": 8,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving a vehicle with unauthorised or defective number plate",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Imprisonment not more than 6 months, or both fine and imprisonment"
  },
  {
    "id": "b9",
    "no": 9,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving with a forged driver’s licence",
    "points": "4",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Imprisonment not more than 6 months, or both fine and imprisonment"
  },
  {
    "id": "b10",
    "no": 10,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving without a valid MOT test certificate",
    "points": "2",
    "fine": "No fine stated",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b11",
    "no": 11,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving without a valid certificate of road worthiness",
    "points": "2",
    "fine": "No fine stated",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b12",
    "no": 12,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving without a valid vehicle licence",
    "points": "2",
    "fine": "No fine stated",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b13",
    "no": 13,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Not painting a commercial vehicle in approved colours",
    "points": "4",
    "fine": "₦25,000",
    "additional": "Enforce painting"
  },
  {
    "id": "b14",
    "no": 14,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving a commercial vehicle without valid hackney permit",
    "points": "2",
    "fine": "No fine stated",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b15",
    "no": 15,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Driving a commercial vehicle without certificate of road worthiness",
    "points": "2",
    "fine": "No fine stated",
    "additional": "Impound vehicle; payment for removal, storage, and evidence of payment for the document"
  },
  {
    "id": "b16",
    "no": 16,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Non-display of hackney permit",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle"
  },
  {
    "id": "b17",
    "no": 17,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "No car hire service permit",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle"
  },
  {
    "id": "b18",
    "no": 18,
    "authority": "VIS",
    "category": "RoadSigns&Markings",
    "title": "Disobeying traffic control personnel",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; LASDRI training"
  },
  {
    "id": "b19",
    "no": 19,
    "authority": "VIS",
    "category": "RoadSigns&Markings",
    "title": "Neglect of traffic directions",
    "points": "2",
    "fine": "—",
    "additional": "Forfeiture of the vehicle to the State. 1st: 1 year imprisonment + forfeiture. 2nd and subsequent: 3 years imprisonment, forfeiture, and capture of data and biometrics"
  },
  {
    "id": "b20",
    "no": 20,
    "authority": "VIS",
    "category": "DrivingConduct",
    "title": "Smoking, drinking and eating while driving",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound vehicle; 3 months imprisonment or 6 months community service"
  },
  {
    "id": "b21",
    "no": 21,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Riding motorcycle without approved crash helmet for rider and passenger",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Imprisonment not more than 6 months; 3 months imprisonment or community service"
  },
  {
    "id": "b22",
    "no": 22,
    "authority": "VIS",
    "category": "Licensing&Registration",
    "title": "Riding motorcycle without rider’s permit",
    "points": "—",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Impound motorcycle, collect permit before release; payment for removal, storage and evidence of payment for permit, or community service"
  },
  {
    "id": "b23",
    "no": 23,
    "authority": "VIS",
    "category": "RoadSigns&Markings",
    "title": "Operating vehicle within restricted routes or beyond approved hour",
    "points": "3",
    "fine": "₦50,000",
    "additional": "Impound vehicle; 6 months imprisonment or both fine and imprisonment"
  },
  {
    "id": "b24",
    "no": 24,
    "authority": "VIS",
    "category": "DrivingConduct",
    "title": "Physical assault on traffic officer",
    "points": "—",
    "fine": "₦100,000",
    "additional": "6 months imprisonment or both fine and imprisonment; compensation to assaulted officer"
  },
  {
    "id": "b25",
    "no": 25,
    "authority": "VIS",
    "category": "DrivingConduct",
    "title": "Commuter or conductor hanging on tailboard of moving vehicle",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Dislodge and impound vehicle; community service"
  },
  {
    "id": "b26",
    "no": 26,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving vehicles with doors left open",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Community service in addition to fine"
  },
  {
    "id": "b28",
    "no": 28,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving a right-hand vehicle",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Conversion"
  },
  {
    "id": "b29",
    "no": 29,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Riding motorcycle / tricycle with non-functional lamps",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Effect repairs"
  },
  {
    "id": "b30",
    "no": 30,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving private motor vehicle with non-functional lamps",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Effect repairs"
  },
  {
    "id": "b31",
    "no": 31,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving commercial vehicle with non-functional lamps",
    "points": "2",
    "fine": "₦20,000 / ₦30,000",
    "additional": "Effect repairs"
  },
  {
    "id": "b32",
    "no": 32,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving trailers, tankers and tippers with non-functional lamps",
    "points": "4",
    "fine": "₦50,000",
    "additional": "Impound vehicle"
  },
  {
    "id": "b33",
    "no": 33,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving company motor vehicles with non-functional lamps",
    "points": "3",
    "fine": "₦25,000",
    "additional": "Effect repairs"
  },
  {
    "id": "b34",
    "no": 34,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving a trailer or other vehicle carrying containers unlatched and not properly secured",
    "points": "4",
    "fine": "₦250,000",
    "additional": "Impound vehicle"
  },
  {
    "id": "b35",
    "no": 35,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving with worn-out tyre(s)",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "—"
  },
  {
    "id": "b36",
    "no": 36,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Driving without a functional spare tyre",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "—"
  },
  {
    "id": "b37",
    "no": 37,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Excessive smoke emission",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "—"
  },
  {
    "id": "b38",
    "no": 38,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Fire extinguisher violation",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "—"
  },
  {
    "id": "b39",
    "no": 39,
    "authority": "VIS",
    "category": "VehicleRequirements",
    "title": "Windscreen violation",
    "points": "1",
    "fine": "₦20,000 / ₦30,000",
    "additional": "—"
  },
  {
    "id": "b40",
    "no": 40,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Storage charge for impounded cars, jeeps and mini-buses, per day",
    "points": "—",
    "fine": "₦1,000",
    "additional": "—"
  },
  {
    "id": "b41",
    "no": 41,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Storage charge for impounded motorcycles and three-wheelers, per day",
    "points": "2",
    "fine": "₦500",
    "additional": "—"
  },
  {
    "id": "b42",
    "no": 42,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Storage charge for all other impounded vehicles (6 wheelers and above), per day",
    "points": "2",
    "fine": "₦2,000",
    "additional": "—"
  },
  {
    "id": "b43",
    "no": 43,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing an impounded car, jeep or mini bus",
    "points": "4",
    "fine": "₦10,000",
    "additional": "—"
  },
  {
    "id": "b44",
    "no": 44,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing other commercial vehicles excluding trailers (mini-buses)",
    "points": "2",
    "fine": "₦10,000",
    "additional": "—"
  },
  {
    "id": "b45",
    "no": 45,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing a trailer or tanker (empty)",
    "points": "—",
    "fine": "₦50,000",
    "additional": "—"
  },
  {
    "id": "b46",
    "no": 46,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing a trailer or tanker (loaded)",
    "points": "—",
    "fine": "₦100,000",
    "additional": "—"
  },
  {
    "id": "b47",
    "no": 47,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing tippers and lorries (loaded)",
    "points": "1",
    "fine": "₦50,000",
    "additional": "—"
  },
  {
    "id": "b48",
    "no": 48,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing luxurious buses",
    "points": "1",
    "fine": "₦50,000",
    "additional": "—"
  },
  {
    "id": "b49",
    "no": 49,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing an overnight breakdown trailer",
    "points": "—",
    "fine": "₦100,000",
    "additional": "—"
  },
  {
    "id": "b50",
    "no": 50,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing tricycles",
    "points": "2",
    "fine": "₦2,000",
    "additional": "—"
  },
  {
    "id": "b51",
    "no": 51,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Towing motorcycles",
    "points": "2",
    "fine": "₦500",
    "additional": "—"
  },
  {
    "id": "b52",
    "no": 52,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Hire of heavy duty recovery equipment (towing / recovery fees)",
    "points": "—",
    "fine": "—",
    "additional": "At hirer’s cost"
  },
  {
    "id": "b53",
    "no": 53,
    "authority": "VIS",
    "category": "Offenses&Fines",
    "title": "Failure to pay penalty fee within prescribed time",
    "points": "—",
    "fine": "—",
    "additional": "Double the initial penalty"
  }
];

export default trafficRules;
