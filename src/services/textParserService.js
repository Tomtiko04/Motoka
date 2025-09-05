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
      
      // Vehicle model patterns
      vehicleModel: [
        /(?:model|type)[\s:]*([A-Za-z0-9\s-]+)/i,
        /(?:camry|corolla|accord|civic|focus|fusion|3 series|5 series|x3|x5|a4|a6|altima|sentra|elantra|sonata|optima|forte|golf|jetta|passat|malibu|cruze|equinox|mazda3|mazda6|cx-5|outback|forester|es|is|gs|rx|gx|qx50|qx60|tlx|rdx|mdx|911|cayenne|macan|f-type|xe|xf|discovery|range rover|xc60|xc90|9-3|9-5|cooper|countryman|fortwo|500|giulietta|giulia|ghibli|quattroporte|gtc4lusso|portofino|488|f8|huracan|urus|continental|flying spur|phantom|ghost|wraith|db11|vantage|dbs|570s|720s|evora|exige|model s|model 3|model x|model y)/i,
      ],
      
      // Registration number patterns
      registrationNo: [
        /(?:registration|reg|plate|number)[\s:]*([A-Za-z0-9]{3,8})/i,
        /([A-Za-z]{2,3}\s?\d{3,5})/,
        /([A-Za-z0-9]{3,8})/,
      ],
      
      // Chassis number patterns
      chassisNo: [
        /(?:chassis|vin|frame)[\s:]*([A-Za-z0-9]{10,17})/i,
        /([A-Za-z0-9]{10,17})/,
      ],
      
      // Engine number patterns
      engineNo: [
        /(?:engine|motor)[\s:]*([A-Za-z0-9]{6,12})/i,
        /([A-Za-z0-9]{6,12})/,
      ],
      
      // Year patterns
      vehicleYear: [
        /(?:year|model year)[\s:]*(\d{4})/i,
        /(19|20)\d{2}/,
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
      
      // Date patterns
      dateIssued: [
        /(?:issued|issue date|date issued)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
      ],
      
      expiryDate: [
        /(?:expiry|expire|expiration|valid until)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
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
        return value.trim().toUpperCase().replace(/\s+/g, '');
      
      case 'chassisNo':
        return value.trim().toUpperCase().replace(/\s+/g, '');
      
      case 'engineNo':
        return value.trim().toUpperCase().replace(/\s+/g, '');
      
      case 'vehicleYear':
        return value.trim();
      
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
    // Handle different date formats
    const formats = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
      /(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
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
        
        // Convert 2-digit year to 4-digit
        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        
        // Ensure month and day are 2 digits
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');
        
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
