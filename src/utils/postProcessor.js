// Post-processor for Google Document AI responses
// Cleans and normalizes fields, choosing best candidates by confidence and length

function cleanVehicleDoc(document) {
  const validators = {
    plate: (v) => /^[A-Z]{3}\d{3}[A-Z]{2}$/.test(v),
    chassis: (v) => /^[A-Z0-9]{17}$/.test(v),
    engine: (v) => /^[A-Z0-9]{6,12}$/.test(v),
  };

  function pickBest(candidates, validator) {
    if (!Array.isArray(candidates) || candidates.length === 0) return null;
    let valid = validator ? candidates.filter((c) => validator((c.value || '').toString().trim().toUpperCase())) : candidates;
    if (!valid.length) valid = candidates;

    valid.sort((a, b) => {
      const ac = typeof a.confidence === 'number' ? a.confidence : 0;
      const bc = typeof b.confidence === 'number' ? b.confidence : 0;
      if (bc !== ac) return bc - ac;
      const al = (a.value || '').length;
      const bl = (b.value || '').length;
      return bl - al;
    });
    const best = valid[0];
    return (best && typeof best.value === 'string') ? best.value.trim() : null;
  }

  // Collect candidates by field label/type
  const fields = {};

  // 1) Entities (if present)
  const entities = (document && document.entities) || [];
  for (const entity of entities) {
    const key = entity.type || '';
    const value = (entity.mentionText || '').trim();
    if (!value) continue;
    if (!fields[key]) fields[key] = [];
    fields[key].push({ value, confidence: entity.confidence || 0 });
  }

  // 2) Pages.formFields (generic KV from Form Parser)
  const pages = (document && document.pages) || [];
  const pushField = (label, value, confidence = 0) => {
    if (!label || !value) return;
    if (!fields[label]) fields[label] = [];
    fields[label].push({ value: value.trim(), confidence });
  };

  const labelMap = [
    // [normalizedKey, array of possible labels]
    ['OwnerName', ['owner', "owner's name", 'owners name', 'owner name', 'name of owner']],
    ['Address', ['address', 'residence', 'location']],
    ['RegistrationNumber', ['registration number', 'reg. number', 'reg number', 'plate', 'plate number']],
    ['ChassisNumber', ['chassis number', 'vin', 'frame']],
    ['EngineNumber', ['engine number', 'engine']],
    ['VehicleMake', ['vehicle make', 'make', 'manufacturer', 'brand']],
    ['VehicleModel', ['vehicle model', 'model', 'type']],
    ['ColourName', ['colour name', 'color', 'colour']],
    ['ExpiryDate', ['expiry date', 'expiry', 'expire', 'expiration', 'valid until']],
    ['IssuedDate', ['date issued', 'issued', 'issue date']],
  ];

  const normalizeLabel = (text) => (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const resolveNormalizedKey = (label) => {
    const n = normalizeLabel(label);
    for (const [key, labels] of labelMap) {
      if (labels.some((l) => n.includes(l))) return key;
    }
    return null;
  };

  for (const page of pages) {
    const formFields = page.formFields || [];
    for (const field of formFields) {
      const nameText = field.fieldName?.textAnchor?.content || '';
      const valueText = field.fieldValue?.textAnchor?.content || '';
      const conf = typeof field.fieldValue?.confidence === 'number' ? field.fieldValue.confidence : (typeof field.confidence === 'number' ? field.confidence : 0);
      const normKey = resolveNormalizedKey(nameText);
      if (normKey && valueText) {
        pushField(normKey, valueText, conf);
      }
    }
  }

  const result = {
    ownerName: pickBest(fields['OwnerName'] || [], null),
    address: pickBest(fields['Address'] || [], null),
    registrationNumber: pickBest(fields['RegistrationNumber'] || [], validators.plate),
    chassisNumber: pickBest(fields['ChassisNumber'] || [], validators.chassis),
    engineNumber: pickBest(fields['EngineNumber'] || [], validators.engine),
    vehicleMake: pickBest(fields['VehicleMake'] || [], null),
    vehicleModel: pickBest(fields['VehicleModel'] || [], null),
    color: pickBest(fields['ColourName'] || fields['ColorName'] || [], null),
    expiryDate: pickBest(fields['ExpiryDate'] || [], null),
    issuedDate: pickBest(fields['IssuedDate'] || fields['IssueDate'] || [], null),
  };

  // Normalize some fields
  if (result.registrationNumber) result.registrationNumber = result.registrationNumber.replace(/[-\s]/g, '').toUpperCase();
  if (result.chassisNumber) result.chassisNumber = result.chassisNumber.replace(/\s/g, '').toUpperCase();
  if (result.engineNumber) result.engineNumber = result.engineNumber.replace(/\s/g, '').toUpperCase();
  if (result.vehicleMake) result.vehicleMake = result.vehicleMake.toLowerCase();
  if (result.vehicleModel) result.vehicleModel = result.vehicleModel.toLowerCase();
  if (result.color) result.color = result.color.toLowerCase();

  return result;
}

export default cleanVehicleDoc;


