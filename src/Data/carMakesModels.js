/**
 * Top car brands and their most common models in Nigeria.
 * Ordered by market prevalence (Toyota is dominant, followed by Honda, etc.)
 */
export const CAR_MAKES_MODELS = {
  Toyota: [
    'Camry', 'Corolla', 'Highlander', 'Venza', 'Avalon',
    'Land Cruiser', 'Prado', 'RAV4', 'Fortuner', 'Hilux',
    'Yaris', 'Sienna', 'Sequoia', '4Runner', 'Prius', 'C-HR',
  ],
  Honda: [
    'Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V',
    'Odyssey', 'Fit', 'Passport', 'Ridgeline', 'Element',
  ],
  Lexus: [
    'RX 350', 'ES 350', 'GX 460', 'LX 570', 'LX 600',
    'IS 250', 'IS 350', 'NX 300', 'UX 200', 'LS 460',
  ],
  Mercedes: [
    'C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC',
    'GLS', 'A-Class', 'CLA', 'GLA', 'G-Class', 'ML',
  ],
  BMW: [
    '3 Series', '5 Series', '7 Series', 'X1', 'X3',
    'X5', 'X6', 'X7', '1 Series', 'M3', 'M5',
  ],
  Hyundai: [
    'Sonata', 'Elantra', 'Tucson', 'Santa Fe', 'Accent',
    'Creta', 'Azera', 'i10', 'i20', 'Palisade',
  ],
  Kia: [
    'Sportage', 'Sorento', 'Cerato', 'Optima', 'Picanto',
    'Telluride', 'Carnival', 'Stinger', 'Seltos', 'EV6',
  ],
  Ford: [
    'Explorer', 'Edge', 'Escape', 'Expedition', 'F-150',
    'Ranger', 'Fusion', 'Focus', 'Mustang', 'Bronco',
  ],
  Nissan: [
    'Pathfinder', 'Altima', 'Sentra', 'X-Trail', 'Murano',
    'Frontier', 'Armada', 'Kicks', 'Rogue', 'Maxima', 'Titan',
  ],
  Peugeot: [
    '406', '407', '508', '3008', '2008', '5008',
    '307', '308', '206', '208', '504', '505',
  ],
  Volkswagen: [
    'Passat', 'Golf', 'Tiguan', 'Polo', 'Jetta',
    'Touareg', 'Atlas', 'T-Cross', 'ID.4', 'Amarok',
  ],
  Chevrolet: [
    'Traverse', 'Equinox', 'Cruze', 'Malibu', 'Silverado',
    'Tahoe', 'Suburban', 'Trax', 'Blazer', 'Spark',
  ],
  Audi: [
    'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8',
    'A3', 'A5', 'TT', 'e-tron',
  ],
  Mitsubishi: [
    'Pajero', 'L200', 'Outlander', 'Eclipse Cross',
    'Galant', 'Lancer', 'ASX', 'Montero',
  ],
  Jeep: [
    'Grand Cherokee', 'Wrangler', 'Cherokee', 'Compass',
    'Commander', 'Renegade', 'Gladiator',
  ],
  'Land Rover': [
    'Range Rover', 'Range Rover Sport', 'Discovery',
    'Defender', 'Freelander', 'Evoque', 'Velar',
  ],
  Porsche: [
    'Cayenne', 'Panamera', 'Macan', '911', 'Taycan', 'Boxster',
  ],
  Mazda: [
    'Mazda 3', 'Mazda 6', 'CX-5', 'CX-9', 'CX-30',
    'MX-5', 'CX-3', 'BT-50',
  ],
  Infiniti: [
    'QX56', 'QX80', 'QX60', 'FX35', 'FX45',
    'Q50', 'Q70', 'QX50', 'G37',
  ],
  Subaru: [
    'Forester', 'Outback', 'Impreza', 'Legacy',
    'Crosstrek', 'Ascent', 'WRX',
  ],
  Innoson: [
    'IVM G80', 'IVM G40', 'IVM Fox', 'IVM Carrier',
    'IVM Caris', 'IVM Umu', 'IVM Bus',
  ],
  Volvo: [
    'XC90', 'XC60', 'XC40', 'S60', 'S90',
    'V40', 'V60', 'C40',
  ],
  Acura: [
    'MDX', 'RDX', 'TLX', 'ILX', 'ZDX', 'TSX', 'TL',
  ],
  Cadillac: [
    'Escalade', 'XT5', 'XT6', 'CT5', 'CT6', 'SRX', 'ATS',
  ],
  Dodge: [
    'Durango', 'Charger', 'Challenger', 'Journey', 'Grand Caravan',
  ],
  Buick: [
    'Enclave', 'Encore', 'LaCrosse', 'Envision', 'Verano',
  ],
  GMC: [
    'Yukon', 'Terrain', 'Envoy', 'Acadia', 'Sierra', 'Canyon',
  ],
  Haval: [
    'H6', 'H9', 'Jolion', 'F7', 'Big Dog',
  ],
  'Great Wall': [
    'Wingle', 'Steed', 'Cannon',
  ],
  Chery: [
    'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5',
  ],
};

export const CAR_MAKES = Object.keys(CAR_MAKES_MODELS).sort();

export function getModelsForMake(make) {
  return CAR_MAKES_MODELS[make] || [];
}
