class TextParserService {
  constructor() {
    this.patterns = {
      // Name patterns
      name: [
        /(?:owners?\s+name|name|owner|full name)[\s:]*([A-Za-z\s.]+)/i,
        /(?:mr|mrs|miss|dr)\.?\s+([A-Za-z\s.]+)/i,
        /^([A-Za-z\s.]+)$/m,
      ],
      
      // Address patterns
      address: [
        /(?:address|residence|location)[\s:]*([A-Za-z0-9\s,.-]+)/i,
        /(?:street|road|avenue|drive)[\s:]*([A-Za-z0-9\s,.-]+)/i,
        /(\d+,\s*[A-Za-z0-9\s,.-]+(?:street|road|avenue|drive))/i,
      ],
      
      // Vehicle make patterns
      vehicleMake: [
        /(?:vehicle\s+make|make|manufacturer|brand)[\s:]*([A-Za-z\s-]+)/i,
        /(?:toyota|honda|ford|bmw|mercedes-benz|mercedes|audi|nissan|hyundai|kia|volkswagen|chevrolet|mazda|subaru|lexus|infiniti|acura|porsche|jaguar|land rover|volvo|saab|mini|smart|fiat|alfa romeo|maserati|ferrari|lamborghini|bentley|rolls royce|aston martin|mclaren|lotus|tesla|peugeot|renault|citroen|opel|seat|skoda|dacia|suzuki|isuzu|mitsubishi|daihatsu|proton|perodua|geely|haval|great wall|chery|byd|mg|tata|mahindra|maruti|bajaj|hero|yamaha|kawasaki|ducati|harley davidson)/i,
      ],
      
      // Vehicle model patterns (include common MB models, C300 etc.)
      vehicleModel: [
        /(?:model|type)[\s:]*([A-Za-z0-9\s-]+)/i,
        /(?:camry|corolla|accord|civic|focus|fusion|3 series|5 series|x3|x5|a4|a6|altima|sentra|elantra|sonata|optima|forte|golf|jetta|passat|malibu|cruze|equinox|mazda3|mazda6|cx-5|outback|forester|es|is|gs|rx|gx|qx50|qx60|tlx|rdx|mdx|911|cayenne|macan|f-type|xe|xf|discovery|range rover|xc60|xc90|9-3|9-5|cooper|countryman|fortwo|500|giulietta|giulia|ghibli|quattroporte|gtc4lusso|portofino|488|f8|huracan|urus|continental|flying spur|phantom|ghost|wraith|db11|vantage|dbs|570s|720s|evora|exige|model s|model 3|model x|model y|c\s?\d{2,3}|e\s?\d{2,3}|s\s?\d{2,3}|glc|gle|gla|glb|gls|g-wagon|g63|g550)/i,
      ],
      
      // Registration number patterns (Nigerian plates like ABC-123-XY, LAGOS formats)
      registrationNo: [
        /(?:registration|reg\.?|plate|number)[\s:]*([A-Z]{2,3}[-\s]?\d{3,4}[-\s]?[A-Z]{0,2})/i,
        /\b([A-Z]{3}[-\s]?\d{3,4})\b/i,
        /\b([A-Z]{2}[A-Z]?\d{3,4}[A-Z]{0,2})\b/i,
      ],
      
      // Chassis number patterns (VIN 17 chars preferred)
      chassisNo: [
        /(?:chassis|vin|frame)[\s:]*([A-HJ-NPR-Z0-9]{11,17})/i,
        /\b([A-HJ-NPR-Z0-9]{11,17})\b/,
      ],
      
      // Engine number patterns (alphanumeric 6-20)
      engineNo: [
        /(?:engine\s+number|engine|motor)[\s:]*([A-Za-z0-9]{6,20})/i,
        /\b([A-Za-z0-9]{6,20})\b/,
      ],
      
      // Year patterns (ensure 1900-2099)
      vehicleYear: [
        /(?:year|model year)[\s:]*(19|20)\d{2}/i,
        /\b(19|20)\d{2}\b/,
      ],
      
      // Color patterns
      vehicleColor: [
        /(?:colour\s+name|color|colour)[\s:]*([A-Za-z]+)/i,
        /(?:black|white|silver|gray|grey|red|blue|green|brown|beige|gold|yellow|orange|purple|pink)/i,
      ],
      
      // Phone number patterns
      phoneNo: [
        /(?:phone|mobile|tel|contact)[\s:]*(\d{10,12})/i,
        /(\d{10,12})/,
      ],
      
      // Date patterns with month names
      dateIssued: [
        /(?:date\s+issued|issued|issue date|date issued)[\s:]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
        /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/,
        /(?:issued|issue date|date issued)[\s:]*(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{2,4}))/i,
      ],
      
      expiryDate: [
        /(?:expiry\s+date|expiry|expire|expiration|valid until)[\s:]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
        /(?:feb\s+\d{4}|expiry\s+\d{4})/i, // Special case for "FEB 2026" format
        /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/,
        /(?:expiry|expire|expiration|valid until)[\s:]*(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{2,4}))/i,
      ],
    };
  }

  parseText(text) {
    const extractedData = {};
    
    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Special handling for Nigerian license format
    this.parseNigerianLicense(cleanText, extractedData);
    
    // Extract each field using patterns
    Object.keys(this.patterns).forEach(field => {
      // Skip if already extracted by special parsing
      if (extractedData[field]) return;
      
      const patterns = this.patterns[field];
      let value = null;
      
      for (const pattern of patterns) {
        const match = cleanText.match(pattern);
        if (match) {
          value = match[1] || match[0];
          break;
        }
      }
      
      if (value) {
        extractedData[field] = this.cleanValue(field, value);
      }
    });
    
    return extractedData;
  }

  parseNigerianLicense(text, extractedData) {
    // Owner's Name: "Mr RASAK 0. AWONUGA" - look for the pattern after "Owners Name:"
    const nameMatch = text.match(/owners?\s+name[:\s]*([A-Za-z\s.]+?)(?:\n|address|$)/i);
    if (nameMatch) {
      extractedData.ownerName = nameMatch[1].trim();
    }
    
    // Also try to find "Mr RASAK 0. AWONUGA" pattern directly
    const directNameMatch = text.match(/mr\s+([A-Za-z\s.]+)/i);
    if (directNameMatch && !extractedData.ownerName) {
      extractedData.ownerName = `Mr ${directNameMatch[1].trim()}`;
    }
    
    // Address: "104, FOLAGBADE STREET, IJEBU ODE" - look for pattern after "Address:"
    const addressMatch = text.match(/address[:\s]*([A-Za-z0-9\s,.-]+?)(?:\n|file|$)/i);
    if (addressMatch) {
      extractedData.address = addressMatch[1].trim();
    }
    
    // Also try to find address pattern directly
    const directAddressMatch = text.match(/(\d+,\s*[A-Za-z0-9\s,.-]+(?:street|road|avenue|drive))/i);
    if (directAddressMatch && !extractedData.address) {
      extractedData.address = directAddressMatch[1].trim();
    }
    
    // Vehicle Make: Look for any vehicle make pattern
    const makeMatch = text.match(/vehicle\s+make[:\s]*([A-Za-z\s-]+)/i);
    if (makeMatch) {
      extractedData.vehicleMake = makeMatch[1].trim().toLowerCase();
    }
    
    // Vehicle Model: Look for common model patterns (C300, E300, etc.)
    const modelMatch = text.match(/c\s*300|e\s*300|s\s*300|glc|gle|gla|glb|gls|a\s*class|b\s*class|clk|cls|slk|ml|gl|sprinter|vito|viano/i);
    if (modelMatch) {
      extractedData.vehicleModel = modelMatch[0].toLowerCase().replace(/\s+/g, '');
    }
    
    // Chassis Number: Look for any VIN pattern (17 characters, alphanumeric)
    const chassisMatch = text.match(/chassis\s+number[:\s]*([A-HJ-NPR-Z0-9]{11,17})/i);
    if (chassisMatch) {
      extractedData.chassisNo = chassisMatch[1].trim().toUpperCase();
    }
    
    // Engine Number: Look for patterns like "g" or other short alphanumeric
    const engineMatch = text.match(/engine\s+number[:\s]*([A-Za-z0-9]+)/i);
    if (engineMatch) {
      extractedData.engineNo = engineMatch[1].trim().toUpperCase();
    }
    
    // Color: "Black" - look for the exact color
    const colorMatch = text.match(/colour\s+name[:\s]*([A-Za-z]+)/i);
    if (colorMatch) {
      extractedData.vehicleColor = colorMatch[1].trim().toLowerCase();
    }
    
    // Date: "22/05/2025"
    const dateMatch = text.match(/date[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i);
    if (dateMatch) {
      extractedData.dateIssued = this.parseDate(dateMatch[1]);
    }
    
    // Look for "FEB 2026" format for expiry
    const expiryMatch = text.match(/(feb|jan|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/i);
    if (expiryMatch) {
      const monthMap = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
      };
      const month = monthMap[expiryMatch[1].toLowerCase()];
      const year = expiryMatch[2];
      extractedData.expiryDate = `${year}-${month}-01`;
    }
  }

  cleanValue(field, value) {
    switch (field) {
      case 'name':
        return value.trim().replace(/\s+/g, ' ');
      
      case 'address':
        return value.trim().replace(/\s+/g, ' ');
      
      case 'vehicleMake':
        return value.trim().toLowerCase().replace(/\s+/g, ' ');
      
      case 'vehicleModel':
        return value.trim().toLowerCase().replace(/\s+/g, ' ');
      
      case 'registrationNo':
        return value.trim().toUpperCase().replace(/\s+/g, '').replace(/-{2,}/g, '-');
      
      case 'chassisNo':
        return value.trim().toUpperCase().replace(/\s+/g, '');
      
      case 'engineNo':
        return value.trim().toUpperCase().replace(/\s+/g, '');
      
      case 'vehicleYear':
        return value.trim().slice(0, 4);
      
      case 'vehicleColor':
        return value.trim().toLowerCase();
      
      case 'phoneNo':
        return value.trim().replace(/\D/g, '');
      
      case 'dateIssued':
      case 'expiryDate':
        return this.parseDate(value.trim());
      
      default:
        return value.trim();
    }
  }

  parseDate(dateString) {
    // Month-name support
    const monthMap = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
    };

    const lower = dateString.toLowerCase();
    
    // Handle "FEB 2026" format (month + year only)
    const monthYearMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{4})/);
    if (monthYearMatch) {
      const month = monthMap[monthYearMatch[1]];
      const year = monthYearMatch[2];
      return `${year}-${month}-01`; // Default to 1st of month
    }
    
    // Handle full month name format
    const monthName = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*/);
    if (monthName) {
      const m = monthMap[monthName[1]];
      const dMatch = lower.match(/\b(\d{1,2})\b/);
      const yMatch = lower.match(/\b(\d{4})\b/);
      const d = (dMatch ? dMatch[1] : '01').padStart(2, '0');
      const y = yMatch ? yMatch[1] : '2000';
      return `${y}-${m}-${d}`;
    }

    // Handle numeric formats
    const formats = [
      /(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/,
      /(\d{2,4})[./-](\d{1,2})[./-](\d{1,2})/,
    ];
    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let day, month, year;
        if (format === formats[0]) {
          [, day, month, year] = match;
        } else {
          [, year, month, day] = match;
        }
        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');
        // guard invalid like 50 for month/day
        const mi = parseInt(month, 10);
        const di = parseInt(day, 10);
        if (mi < 1 || mi > 12 || di < 1 || di > 31) return `${year}-01-01`;
        return `${year}-${month}-${day}`;
      }
    }
    return dateString;
  }

  // Method to determine car type based on extracted data
  determineCarType(extractedData) {
    const { vehicleMake, vehicleModel } = extractedData;
    
    if (!vehicleMake) return null;
    
    const commercialKeywords = ['truck', 'bus', 'van', 'pickup', 'commercial', 'cargo'];
    const governmentKeywords = ['government', 'official', 'municipal', 'police', 'ambulance'];
    
    const makeModel = `${vehicleMake} ${vehicleModel || ''}`.toLowerCase();
    
    if (commercialKeywords.some(keyword => makeModel.includes(keyword))) {
      return 'commercial';
    }
    
    if (governmentKeywords.some(keyword => makeModel.includes(keyword))) {
      return 'government';
    }
    
    return 'private';
  }
}

export default new TextParserService();
