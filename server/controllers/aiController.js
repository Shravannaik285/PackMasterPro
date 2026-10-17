const calculatePrice = require('../utils/calculatePrice');

/**
 * Controller for AI Packaging Recommendation using NVIDIA NIM API.
 * Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
 * Model: z-ai/glm-5.3-flash (OpenAI-compatible)
 * 
 * Flow: User inputs -> Express controller -> NVIDIA NIM API -> Clean structured JSON.
 * Includes intelligent heuristic engine and server-side pricing verification for all options.
 */

// Supported packaging types catalog
const PACKAGING_CATALOG = [
  {
    id: 'Corrugated Box',
    name: 'Corrugated Box',
    desc: 'Durable multi-ply cartons for shipping & storage',
    badge: 'Heavy Duty',
    defaultMaterial: '5-Ply Corrugated Cardboard',
    recommendedCategories: ['Electronics', 'Fragile & Glassware', 'Logistics & Shipping', 'Home & Kitchen'],
  },
  {
    id: 'Paper Bag',
    name: 'Paper Bag',
    desc: 'Eco-friendly biodegradable retail carry bags',
    badge: '100% Eco',
    defaultMaterial: 'Kraft Paper 180 GSM',
    recommendedCategories: ['Apparel & Fashion', 'Food & Beverage', 'Cosmetics & Personal Care'],
  },
  {
    id: 'Plastic Packaging',
    name: 'Plastic Packaging',
    desc: 'Protective pouches, bubble wrap & poly mailers',
    badge: 'Moisture Proof',
    defaultMaterial: 'Polyethylene Cushion Film',
    recommendedCategories: ['Apparel & Fashion', 'Electronics', 'Logistics & Shipping'],
  },
  {
    id: 'Labels',
    name: 'Labels',
    desc: 'High-adhesion shipping & brand barcode rolls',
    badge: 'Branding',
    defaultMaterial: 'Thermal Coated Adhesive Roll',
    recommendedCategories: ['Logistics & Shipping', 'Food & Beverage', 'Cosmetics & Personal Care'],
  },
];

/**
 * GET /api/ai/packaging-types
 * Returns the supported packaging types catalog to eliminate manual entries in frontend.
 */
const getPackagingTypes = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: PACKAGING_CATALOG,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch packaging types catalog',
      error: error.message,
    });
  }
};

/**
 * Helper to enrich AI options with deterministic backend pricing
 */
const enrichOptionsWithPricing = (options, dimensions, quantity, requirements) => {
  return options.map((opt) => {
    const optMaterial = opt.materialGrade || 
      (opt.type === 'Paper Bag' ? 'Kraft Paper 180 GSM' : 
       opt.type === 'Labels' ? 'Thermal Coated Adhesive Roll' : 
       '5-Ply Corrugated Cardboard');

    const quote = calculatePrice({
      packagingType: opt.type,
      dimensions,
      quantity,
      materialGrade: optMaterial,
      requirements,
    });

    return {
      ...opt,
      materialGrade: optMaterial,
      pricing: {
        unitPrice: quote.unitPrice,
        totalPrice: quote.totalPrice,
        breakdown: quote.breakdown,
      },
    };
  });
};

/**
 * POST /api/ai/recommend
 * Analyzes product requirements and returns AI recommendations with live pricing
 */
const getPackagingRecommendation = async (req, res) => {
  try {
    const {
      productName = 'Product Item',
      isFragile: rawFragile,
      category = 'General',
      dimensions = { length: 20, width: 15, height: 8 },
      quantity = 500,
      userSelectedType = 'Corrugated Box',
      requirements = {
        protectionLevel: 'Medium',
        costPreference: 'Balanced',
        ecoFriendly: false,
        customPrint: false,
      },
    } = req.body;

    const apiKey = process.env.NVIDIA_API_KEY;
    const modelToUse = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    // If NVIDIA NIM API Key is configured, make call to NVIDIA NIM OpenAI-compatible endpoint
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_nvidia_api_key_here') {
      try {
        const userPrompt = `
You are a senior packaging engineer and supply chain expert. Analyze the following product specifications, user requirements, and recommend the best packaging option from our catalog:

CATALOG OF AVAILABLE PACKAGING TYPES:
1. "Corrugated Box" (Heavy duty multi-ply cardboard: 3-Ply or 5-Ply. Best for: heavy items, electronics, fragile glassware, high protection).
2. "Mailing Box" (E-Flute rigid die-cut fold carton. Best for: premium e-commerce, unboxing experience, cosmetics, apparel, medium protection).
3. "Paper Bag" (100% biodegradable & recyclable Kraft Paper 180 GSM. Best for: Eco-Friendly priority, apparel & fashion, food/bakery, retail carry, gifts, lightweight non-fragile items).
4. "Plastic Packaging" (Polyethylene bubble mailers & cushion pouches. Best for: lowest cost/Economy, waterproof moisture protection, soft goods, clothing).
5. "Labels" (Thermal rolls & adhesive brand stickers. Best for: jars, bottles, secondary branding, box identification).

INPUT DETAILS:
- Product Name: "${productName}"
- Category: "${category}"
- Dimensions: Length ${dimensions.length} cm, Width ${dimensions.width} cm, Height ${dimensions.height} cm
- Order Quantity: ${quantity} units
- User's Initial Selected Type: "${userSelectedType}"

USER REQUIREMENTS:
- Protection Level: ${requirements.protectionLevel || 'Medium'} (Standard = lightweight/flexible, Medium = moderate cushioning, High = heavy shock-absorption)
- Cost Preference: ${requirements.costPreference || 'Balanced'} (Economy = lowest cost, Balanced = best value, Premium = top finish)
- Eco-Friendly Priority: ${requirements.ecoFriendly ? 'YES (STRONGLY PRIORITIZE sustainable Kraft paper or eco-friendly materials!)' : 'NO'}
- Custom Branding/Print: ${requirements.customPrint ? 'YES' : 'NO'}

CRITICAL DECISION GUIDELINES:
- PRIMARY PACKET DIRECTIVE: The user specifically chose packet type "${userSelectedType}". Therefore, your primary "recommendedType" MUST be "${userSelectedType}"!
  * If user selected "Paper Bag" -> "recommendedType" must be "Paper Bag" (engineer optimal Kraft Paper GSM).
  * If user selected "Plastic Packaging" -> "recommendedType" must be "Plastic Packaging" (engineer optimal Cushion Film/Mailer).
  * If user selected "Labels" -> "recommendedType" must be "Labels" (engineer high-adhesion thermal roll).
  * If user selected "Corrugated Box" -> "recommendedType" must be "Corrugated Box" (engineer 3-Ply or 5-Ply).
- NEVER switch the primary recommendation to "Corrugated Box" if the user chose "Paper Bag", "Plastic Packaging", or "Labels".
- Engineer the ideal material grade, durability, cushioning, and specifications tailored specifically for "${userSelectedType}".
- Provide 2 distinct ALTERNATIVE packaging types from the catalog in the "options" array.
- Exactly ONE option must have "recommended": true and "tag": "Recommended" (its "type" MUST match "recommendedType").
- The other two options must have "recommended": false and relevant tags like "Alternative", "Eco-friendly", or "Budget Friendly".

Respond ONLY with a valid, raw JSON object (strictly NO markdown formatting, no code blocks, no backticks, no explanatory text) following this schema structure:
{
  "recommendedType": "<The chosen packaging type: 'Corrugated Box', 'Mailing Box', 'Paper Bag', 'Plastic Packaging', or 'Labels'>",
  "materialGrade": "<Specific material grade, e.g. 'Kraft Paper 180 GSM', '5-Ply Corrugated Cardboard', 'E-Flute Corrugated Board', 'Polyethylene Cushion Film', 'Thermal Coated Adhesive Roll'>",
  "suitabilityScore": <integer between 88 and 98>,
  "summary": "<1-2 sentence concise engineering explanation>",
  "reasoning": [
    "<Engineering reason based on product dimensions and weight>",
    "<Engineering reason based on protection level and durability>",
    "<Engineering reason based on eco-friendly or cost preference>",
    "<Engineering reason based on branding and presentation>"
  ],
  "comparisonWithUser": "<Specific comparison with user requirements and their initial selection>",
  "options": [
    {
      "type": "<Type matching recommendedType>",
      "tag": "Recommended",
      "materialGrade": "<Grade for this option>",
      "description": "<Concise description>",
      "pros": ["<Pro 1>", "<Pro 2>", "<Pro 3>"],
      "recommended": true
    },
    {
      "type": "<Alternative Type 1>",
      "tag": "Alternative",
      "materialGrade": "<Grade>",
      "description": "<Concise description>",
      "pros": ["<Pro 1>", "<Pro 2>", "<Pro 3>"],
      "recommended": false
    },
    {
      "type": "<Alternative Type 2>",
      "tag": "<Alternative tag, e.g. Eco-friendly or Budget Friendly>",
      "materialGrade": "<Grade>",
      "description": "<Concise description>",
      "pros": ["<Pro 1>", "<Pro 2>", "<Pro 3>"],
      "recommended": false
    }
  ]
}
`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25s safety timeout for LLM inference

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              {
                role: 'system',
                content:
                  'You are a senior packaging engineer and supply chain expert for PackMaster Pro. You output ONLY valid JSON matching the requested schema without any markdown, backticks, or conversational text.',
              },
              {
                role: 'user',
                content: userPrompt,
              },
            ],
            temperature: 0.2,
            max_tokens: 2048,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`NVIDIA NIM API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '';

        // Robust JSON extraction: extract outermost JSON block
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }

        const parsedData = JSON.parse(content);

        // Enrich options with deterministic backend pricing
        if (Array.isArray(parsedData.options) && parsedData.options.length > 0) {
          parsedData.options = enrichOptionsWithPricing(
            parsedData.options,
            dimensions,
            quantity,
            requirements
          );
        }

        // Attach pricing for primary recommended type
        const primaryQuote = calculatePrice({
          packagingType: parsedData.recommendedType || userSelectedType,
          dimensions,
          quantity,
          materialGrade: parsedData.materialGrade || '5-Ply Corrugated Cardboard',
          requirements,
        });
        parsedData.pricing = primaryQuote;

        return res.status(200).json({
          success: true,
          source: 'nvidia-nim',
          model: modelToUse,
          data: parsedData,
        });
      } catch (nvidiaError) {
        console.warn(
          '⚠️ NVIDIA NIM API call encountered an issue, falling back to expert packaging heuristics:',
          nvidiaError.message
        );
      }
    }

    // Dynamic heuristic recommendation engine responding accurately to user inputs & requirements
    const catLower = (category || '').toLowerCase();
    const userType = userSelectedType || 'Corrugated Box';
    const isEcoRequested = Boolean(requirements.ecoFriendly);
    const isHighProtection = requirements.protectionLevel === 'High';
    const isStandardProtection = requirements.protectionLevel === 'Standard';
    const isEconomyCost = requirements.costPreference === 'Economy';
    const isFragileCategory =
      catLower.includes('electronic') ||
      catLower.includes('glass') ||
      catLower.includes('fragile') ||
      catLower.includes('ceramic');
    const isFragile = Boolean(rawFragile || isFragileCategory || isHighProtection);

    // Primary type strictly follows the user's selected packet type!
    let primaryType = userType;
    let materialGrade = '3-Ply Standard Corrugated';
    let primarySummary = '';

    switch (userType) {
      case 'Paper Bag':
        primaryType = 'Paper Bag';
        materialGrade = isEcoRequested || isHighProtection ? 'Reinforced Kraft Paper 220 GSM' : 'Kraft Paper 180 GSM';
        primarySummary = '100% biodegradable and recyclable Kraft paper carry bag engineered with reinforced twisted handles.';
        break;
      case 'Plastic Packaging':
        primaryType = 'Plastic Packaging';
        materialGrade = isHighProtection ? 'Heavy-Duty Bubble Cushion Mailer' : 'Polyethylene Cushion Film';
        primarySummary = 'Lightweight moisture-resistant protective pouch optimized for puncture resistance and cost efficiency.';
        break;
      case 'Labels':
        primaryType = 'Labels';
        materialGrade = requirements.customPrint ? 'Full-Color Thermal Adhesive Roll' : 'Thermal Coated Adhesive Roll';
        primarySummary = 'High-adhesion commercial branding and shipping barcode label rolls tailored for your products.';
        break;
      case 'Mailing Box':
        primaryType = 'Mailing Box';
        materialGrade = 'E-Flute Corrugated Board';
        primarySummary = 'Clean rigid die-cut carton providing an exceptional unboxing experience and reliable protection.';
        break;
      case 'Corrugated Box':
      default:
        primaryType = 'Corrugated Box';
        materialGrade = (isHighProtection || isFragileCategory) ? '5-Ply Corrugated Cardboard' : '3-Ply Standard Corrugated';
        primarySummary = (isHighProtection || isFragileCategory)
          ? 'Heavy duty shock-resistant corrugated box engineered for high protection and stacking.'
          : 'Durable 3-ply carton offering a balanced ratio of weight, strength, and economy.';
        break;
    }

    // Build 3 intelligent options including the recommended choice and 2 context-aware alternatives
    const candidateTypes = [
      {
        type: 'Corrugated Box',
        materialGrade: isHighProtection || isFragileCategory ? '5-Ply Corrugated Cardboard' : '3-Ply Standard Corrugated',
        description: 'Durable multi-ply cartons engineered for structural strength and stacking.',
        pros: ['High stacking strength', 'Impact shock absorption', 'Ideal for shipping cartons'],
      },
      {
        type: 'Paper Bag',
        materialGrade: 'Kraft Paper 180 GSM',
        description: '100% biodegradable eco-friendly carry bags for retail and sustainable brands.',
        pros: ['Zero-plastic eco material', 'Lightweight & recyclable', 'Premium rustic brand feel'],
      },
      {
        type: 'Mailing Box',
        materialGrade: 'E-Flute Corrugated Board',
        description: 'Rigid tab-locking die-cut box designed for e-commerce unboxing.',
        pros: ['Sleek unboxing presentation', 'Easy fold-and-lock tabs', 'Space-efficient storage'],
      },
      {
        type: 'Plastic Packaging',
        materialGrade: 'Polyethylene Cushion Film',
        description: 'Moisture-resistant flexible cushioning mailers and protective pouches.',
        pros: ['Waterproof & tear-proof', 'Minimal weight shipping', 'Economical unit cost'],
      },
      {
        type: 'Labels',
        materialGrade: 'Thermal Coated Adhesive Roll',
        description: 'High-adhesion thermal printed brand and logistics barcode labels.',
        pros: ['High barcode clarity', 'Strong permanent adhesive', 'Universal product branding'],
      },
    ];

    // Position the chosen primaryType as first option with 'Recommended' tag
    const recommendedCandidate = candidateTypes.find((c) => c.type === primaryType) || {
      type: primaryType,
      materialGrade,
      description: primarySummary,
      pros: ['Customized for requirements', 'Cost effective', 'Fast production'],
    };

    const alternatives = candidateTypes.filter((c) => c.type !== primaryType).slice(0, 2);

    const fallbackOptions = [
      {
        type: recommendedCandidate.type,
        tag: 'Recommended',
        materialGrade: materialGrade || recommendedCandidate.materialGrade,
        description: primarySummary || recommendedCandidate.description,
        pros: recommendedCandidate.pros,
        recommended: true,
      },
      {
        type: alternatives[0].type,
        tag: isEcoRequested && alternatives[0].type === 'Paper Bag' ? 'Eco-friendly' : 'Alternative',
        materialGrade: alternatives[0].materialGrade,
        description: alternatives[0].description,
        pros: alternatives[0].pros,
        recommended: false,
      },
      {
        type: alternatives[1].type,
        tag: isEconomyCost && alternatives[1].type === 'Plastic Packaging' ? 'Budget Friendly' : 'Alternative',
        materialGrade: alternatives[1].materialGrade,
        description: alternatives[1].description,
        pros: alternatives[1].pros,
        recommended: false,
      },
    ];

    const enrichedFallbackOptions = enrichOptionsWithPricing(
      fallbackOptions,
      dimensions,
      quantity,
      requirements
    );

    const primaryQuote = calculatePrice({
      packagingType: primaryType,
      dimensions,
      quantity,
      materialGrade,
      requirements,
    });

    const fallbackResponse = {
      recommendedType: primaryType,
      materialGrade,
      suitabilityScore: isFragile ? 96 : 94,
      summary: primarySummary,
      reasoning: [
        `Calibrated for ${dimensions.length}×${dimensions.width}×${dimensions.height} cm dimensions`,
        `${requirements.protectionLevel || 'Medium'} protection level matched with ${materialGrade}`,
        `Volume discounts applied for ${quantity} units`,
        requirements.customPrint ? 'Custom branding and artwork supported' : 'Standard eco-finish',
      ],
      comparisonWithUser: `Based on your ${category} specifications and protection requirements, ${primaryType} offers the ideal balance of durability, security, and cost efficiency.`,
      options: enrichedFallbackOptions,
      pricing: primaryQuote,
    };

    return res.status(200).json({
      success: true,
      source: 'heuristic-engine',
      data: fallbackResponse,
    });
  } catch (error) {
    console.error('Error generating packaging recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate packaging recommendation',
      error: error.message,
    });
  }
};

module.exports = {
  getPackagingRecommendation,
  getPackagingTypes,
  PACKAGING_CATALOG,
};
