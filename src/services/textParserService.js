class TextParserService {
  constructor() {
    this.patterns = {
      // Name patterns
      name: [
        /(?:name|owner|full name)[\s:]*([A-Za-z\s]+)/i,
        /^([A-Za-z\s]+)$/m,
      ],
      
      // Address patterns
      address: [
        /(?:address|residence|location)[\s:]*([A-Za-z0-9\s,.-]+)/i,
        /(?:street|road|avenue|drive)[\s:]*([A-Za-z0-9\s,.-]+)/i,
      ],
      
      // Vehicle make patterns
      vehicleMake: [
        /(?:make|manufacturer|brand)[\s:]*([A-Za-z\s]+)/i,
        /(?:toyota|honda|ford|bmw|mercedes|audi|nissan|hyundai|kia|volkswagen|chevrolet|mazda|subaru|lexus|infiniti|acura|porsche|jaguar|land rover|volvo|saab|mini|smart|fiat|alfa romeo|maserati|ferrari|lamborghini|bentley|rolls royce|aston martin|mclaren|lotus|tesla|peugeot|renault|citroen|opel|seat|skoda|dacia|suzuki|isuzu|mitsubishi|daihatsu|proton|perodua|geely|haval|great wall|chery|byd|mg|tata|mahindra|maruti|bajaj|hero|yamaha|kawasaki|ducati|harley davidson)/i,
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
        /(?:engine|motor)[\s:]*([A-Za-z0-9]{6,20})/i,
        /\b([A-Za-z0-9]{6,20})\b/,
      ],
      
      // Year patterns (ensure 1900-2099)
      vehicleYear: [
        /(?:year|model year)[\s:]*(19|20)\d{2}/i,
        /\b(19|20)\d{2}\b/,
      ],
      
      // Color patterns
      vehicleColor: [
        /(?:color|colour)[\s:]*([A-Za-z]+)/i,
        /(?:black|white|silver|gray|grey|red|blue|green|brown|beige|gold|yellow|orange|purple|pink)/i,
      ],
      
      // Phone number patterns
      phoneNo: [
        /(?:phone|mobile|tel|contact)[\s:]*(\d{10,12})/i,
        /(\d{10,12})/,
      ],
      
      // Date patterns with month names
      dateIssued: [
        /(?:issued|issue date|date issued)[\s:]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
        /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/,
        /(?:issued|issue date|date issued)[\s:]*(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{2,4}))/i,
      ],
      
      expiryDate: [
        /(?:expiry|expire|expiration|valid until)[\s:]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
        /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/,
        /(?:expiry|expire|expiration|valid until)[\s:]*(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{2,4}))/i,
      ],
    };
  }

  parseText(text) {
    const extractedData = {};
    
    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Extract each field
    Object.keys(this.patterns).forEach(field => {
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
