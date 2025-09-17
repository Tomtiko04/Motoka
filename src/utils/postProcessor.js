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

  // Collect entities from DocAI response (Form Parser schema)
  const fields = {};
  const entities = (document && document.entities) || [];
  for (const entity of entities) {
    const key = entity.type || '';
    const value = (entity.mentionText || '').trim();
    if (!fields[key]) fields[key] = [];
    fields[key].push({ value, confidence: entity.confidence || 0 });
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


