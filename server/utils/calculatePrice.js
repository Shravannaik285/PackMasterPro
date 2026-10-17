/**
 * calculatePrice.js
 * 
 * Deterministic, rule-based packaging quotation engine.
 * Calculates transparent unit price and total price in INR (₹).
 * 
 * Formula:
 * 1. Calculate Surface Area (sq cm or sq meters).
 * 2. Apply Base Material Rate per unit area.
 * 3. Add requirement modifiers (Protection grade, Custom Print, Eco-finish).
 * 4. Apply quantity volume discount tiers.
 */

function calculatePrice({
  packagingType = 'Corrugated Box',
  dimensions = { length: 20, width: 15, height: 8 },
  quantity = 500,
  materialGrade = '5-Ply Corrugated Cardboard',
  requirements = {}
}) {
  const l = Number(dimensions.length) || 20;
  const w = Number(dimensions.width) || 15;
  const h = Number(dimensions.height) || 8;
  const qty = Math.max(1, Number(quantity) || 1);

  // Surface area of a 3D box (in square cm): 2*(L*W + W*H + H*L)
  const surfaceAreaSqCm = 2 * (l * w + w * h + h * l);
  // Convert to square meters (1 m² = 10,000 cm²)
  const surfaceAreaSqM = surfaceAreaSqCm / 10000;

  let baseRatePerSqM = 40; // Default base rate per square meter for standard board
  let baseUnitFloor = 10;  // Minimum price per unit

  switch (packagingType) {
    case 'Corrugated Box':
      baseRatePerSqM = 45;
      baseUnitFloor = 12;
      if (materialGrade.includes('5-Ply')) {
        baseRatePerSqM += 15;
        baseUnitFloor += 4;
      } else if (materialGrade.includes('7-Ply') || materialGrade.includes('Heavy Duty')) {
        baseRatePerSqM += 30;
        baseUnitFloor += 8;
      }
      break;

    case 'Paper Bag':
      baseRatePerSqM = 30;
      baseUnitFloor = 8;
      if (materialGrade.includes('Heavy') || materialGrade.includes('Kraft 180')) {
        baseRatePerSqM += 10;
        baseUnitFloor += 3;
      }
      break;

    case 'Plastic Packaging':
      baseRatePerSqM = 25;
      baseUnitFloor = 6;
      break;

    case 'Labels':
      // Labels are small 2D surfaces (L * W)
      const labelAreaSqM = (l * w) / 10000;
      const labelBase = Math.max(1.0, labelAreaSqM * 200 + 0.5);
      const labelUnitPrice = qty >= 1000 ? Math.max(1.2, labelBase * 0.8) : labelBase;
      const roundedLabelPrice = Number(labelUnitPrice.toFixed(2));
      return {
        unitPrice: roundedLabelPrice,
        totalPrice: Math.round(roundedLabelPrice * qty),
        breakdown: {
          surfaceAreaSqM: Number(labelAreaSqM.toFixed(4)),
          baseUnitPrice: roundedLabelPrice,
          volumeDiscountPercentage: qty >= 1000 ? 20 : 0
        }
      };

    default:
      baseRatePerSqM = 40;
      baseUnitFloor = 10;
  }

  // Calculate raw unit cost from surface area
  let unitCost = baseUnitFloor + (surfaceAreaSqM * baseRatePerSqM);

  // Add protection level surcharge
  if (requirements.protectionLevel === 'High') {
    unitCost += 4.0;
  } else if (requirements.protectionLevel === 'Medium') {
    unitCost += 2.0;
  }

  // Add custom print surcharge
  if (requirements.customPrint) {
    unitCost += 3.0;
  }

  // Add eco-friendly certified materials surcharge
  if (requirements.ecoFriendly) {
    unitCost += 1.5;
  }

  // Quantity volume discount tier
  let discountMultiplier = 1.0;
  let discountPercent = 0;
  if (qty >= 2000) {
    discountMultiplier = 0.75; // 25% discount
    discountPercent = 25;
  } else if (qty >= 1000) {
    discountMultiplier = 0.85; // 15% discount
    discountPercent = 15;
  } else if (qty >= 500) {
    discountMultiplier = 0.92; // 8% discount
    discountPercent = 8;
  }

  const finalUnitPrice = Math.max(baseUnitFloor, Number((unitCost * discountMultiplier).toFixed(2)));
  const totalPrice = Math.round(finalUnitPrice * qty);

  return {
    unitPrice: finalUnitPrice,
    totalPrice: totalPrice,
    breakdown: {
      surfaceAreaSqM: Number(surfaceAreaSqM.toFixed(3)),
      rawUnitCost: Number(unitCost.toFixed(2)),
      volumeDiscountPercentage: discountPercent,
    }
  };
}

module.exports = calculatePrice;
