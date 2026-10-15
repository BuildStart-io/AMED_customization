INSERT INTO "amed_customization".products (
  user_id,
  name,
  description,
  price,
  delivery_price,
  product_type,
  images,
  video_url,
  is_active,
  variations
)
VALUES
  -- 1. Stethoscopes (Premium & Budget Range)
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Stethoscopes',
    'Premium and budget range stethoscopes for healthcare professionals and medical students. Clear auscultation, lightweight, and comfortable with up to 5 years warranty.',
    2900.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Model",
        "options": [
          { "label": "Littmann Classic III (Made in USA - 5Yr Warranty)", "price": 44500.00 },
          { "label": "Spirit CK-601CPF (Made in Taiwan - 2Yr Warranty)", "price": 22500.00 },
          { "label": "Littmann Classic II S.E. Grade A (Made in China - 1Yr Warranty)", "price": 12900.00 },
          { "label": "Rossmax EB600 Cardiology (Made in Taiwan - 2Yr Warranty)", "price": 10900.00 },
          { "label": "IndoSurgicals Silvery II SS (Made in India - 5Yr Warranty)", "price": 8900.00 },
          { "label": "IMED Dual Rhythm (Made in Sri Lanka - 1Yr Warranty)", "price": 7900.00 },
          { "label": "EasyCare Deluxe ECST 045 (Made in India - 1Yr Warranty)", "price": 5500.00 },
          { "label": "IndoSurgicals Dulcet (Made in India - 1Yr Warranty)", "price": 3500.00 },
          { "label": "Medigold Regular (Made in India - 1Yr Warranty)", "price": 2900.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 2. Sphygmomanometers (Desk, Portable Aneroid & Digital BP Monitors)
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Sphygmomanometers & Blood Pressure Monitors',
    'Clinical desk mercury, portable aneroid, and automatic digital blood pressure monitors for clinics, hospitals, and home care.',
    5500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Type & Model",
        "options": [
          { "label": "Omron HEM-7156T Digital Bluetooth (Japan - 2Yr Warranty)", "price": 25500.00 },
          { "label": "IndoSurgicals Clinical Desk Mercury (India - 1Yr Warranty)", "price": 24500.00 },
          { "label": "Rossmax Z1 Digital BP Monitor (Taiwan - 2Yr Warranty)", "price": 19500.00 },
          { "label": "SoftA Clinical Desk Mercury (China - 1Yr Warranty)", "price": 16500.00 },
          { "label": "Omron HEM-7120 Digital BP Monitor (Japan - 2Yr Warranty)", "price": 15500.00 },
          { "label": "Aneroid Desk Type Sphygmomanometer (India - 1Yr Warranty)", "price": 14500.00 },
          { "label": "Rossmax AU941f Digital BP Monitor (Taiwan - 2Yr Warranty)", "price": 12500.00 },
          { "label": "Rossmax GB100 Portable Aneroid (Taiwan - 2Yr Warranty)", "price": 7500.00 },
          { "label": "B.Well Swiss MED-62 Portable Aneroid (Swiss - 2Yr Warranty)", "price": 7500.00 },
          { "label": "BioPlus Portable Aneroid (India - 1Yr Warranty)", "price": 6500.00 },
          { "label": "Yuwell Portable Aneroid (China - 1Yr Warranty)", "price": 5500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 3. Medical Accessories & Spare Parts
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Medical Accessories & Spare Parts',
    'Essential replacement parts and repair kits for stethoscopes and blood pressure monitors.',
    650.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Spare Part",
        "options": [
          { "label": "Littmann Stethoscope Repair Kit (40016 Black)", "price": 7500.00 },
          { "label": "Rossmax BP Cuff", "price": 4500.00 },
          { "label": "Littmann Grade A Diaphragm", "price": 2200.00 },
          { "label": "Littmann Grade A Earpieces", "price": 2000.00 },
          { "label": "Aneroid BP Cuff", "price": 1700.00 },
          { "label": "BP Bulb with Valve", "price": 1200.00 },
          { "label": "Universal Stethoscope Diaphragm", "price": 800.00 },
          { "label": "Universal Stethoscope Earpieces", "price": 650.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 4. Glucometers & Test Strips
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'INFINITY Blood Glucose Monitoring System & Strips',
    'Fast 5-second accurate blood glucose results with small 0.5 ul sample size. Designed in USA, Made in Korea.',
    2500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Package Option",
        "options": [
          { "label": "INFINITY Glucometer Kit (With 25 Free Strips & 10 Free Lancets - 1Yr Warranty)", "price": 4500.00 },
          { "label": "INFINITY Gluco Test Strips (25 pcs)", "price": 2500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 5. Pulse Oximeters
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Pulse Oximeters',
    'Fingertip and handheld pulse oximeters for accurate SpO2 and Pulse Rate monitoring in clinics, hospitals, and home care.',
    4500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Model",
        "options": [
          { "label": "Standard Fingertip Pulse Oximeter (China)", "price": 4500.00 },
          { "label": "Rossmax SB100 Fingertip Pulse Oximeter (Taiwan - 2Yr Warranty)", "price": 18500.00 },
          { "label": "Rossmax SA120 Handheld Pulse Oximeter with Probe (Taiwan - 2Yr Warranty)", "price": 79900.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 6. Digital & Infrared Thermometers
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Digital & Infrared Thermometers',
    'Fast, accurate contact and non-contact thermometers for oral, axillary, and forehead temperature measurement.',
    900.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Model",
        "options": [
          { "label": "Standard Digital Thermometer (China)", "price": 900.00 },
          { "label": "Rossmax TG380 10-Sec Flexible Tip Thermometer (Taiwan)", "price": 1800.00 },
          { "label": "Omron MC-246 Water-Resistant Digital Thermometer (Japan)", "price": 1800.00 },
          { "label": "Non-Contact Infrared Thermometer TS-A1 (China)", "price": 7500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 7. ENT & Ophthalmic Diagnostic Equipment
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Otoscopes & Ophthalmoscopes (ENT & Ophthalmic)',
    'Reliable diagnostic instruments with bright halogen/LED illumination and sharp optics for ear, nose, and eye examination.',
    12500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Device & Model",
        "options": [
          { "label": "Standard Otoscope with Multiple Specula (Pakistan)", "price": 12500.00 },
          { "label": "Greetmed Otoscope (China)", "price": 26500.00 },
          { "label": "KaWe COMBILIGHT C10 Otoscope (Germany)", "price": 49500.00 },
          { "label": "BETA 200 Halogen Ophthalmoscope (China)", "price": 28500.00 },
          { "label": "KaWe EUROLIGHT E36 Ophthalmoscope (Germany)", "price": 69500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 8. Clinical Examination & Heating Lights
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Clinical Examination & Infrared Heating Lights',
    'Bright, focused examination lighting and therapeutic infrared heating lamps for clinics and hospitals.',
    2500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Light Type",
        "options": [
          { "label": "Head Lamp", "price": 2500.00 },
          { "label": "Philips 175W Infrared Lamp Bulb", "price": 8900.00 },
          { "label": "Tabletop Infrared Lamp", "price": 12500.00 },
          { "label": "Infrared Lamp with Floor Stand", "price": 32500.00 },
          { "label": "Mobile Clinical Examination Lamp", "price": 37500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 9. Nebulizers
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Respiratory Nebulizers',
    'Effective piston compressor aerosol therapy nebulizers for home care, clinics, and hospital wards.',
    12500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Model",
        "options": [
          { "label": "Compact Nebulizer Eolo (Home Use - China)", "price": 12500.00 },
          { "label": "MG Heavy Duty Nebulizer MG2306HD (Hospital Use with Adult & Kids Masks)", "price": 15500.00 },
          { "label": "Rossmax Piston Nebulizer NE100", "price": 20500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 10. Surgical Instruments & Procedure Trays
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Surgical Instruments & Procedure Trays',
    'Durable, precision-designed stainless steel forceps, scissors, speculums, and procedure trays for clinical and surgical use.',
    900.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Instrument",
        "options": [
          { "label": "Scalpel Handle", "price": 900.00 },
          { "label": "Surgical Scissor", "price": 1100.00 },
          { "label": "Catch Forcep", "price": 1100.00 },
          { "label": "Needle Holder", "price": 1300.00 },
          { "label": "Artery Forcep", "price": 1300.00 },
          { "label": "Mosquito Forcep", "price": 1800.00 },
          { "label": "Gallipot (Starting Price)", "price": 1800.00 },
          { "label": "Kidney Tray (Starting Price)", "price": 2500.00 },
          { "label": "Cheetle Forcep", "price": 2800.00 },
          { "label": "Instrument Tray (Starting Price)", "price": 2800.00 },
          { "label": "Vaginal Speculum", "price": 10500.00 }
        ]
      }
    ]'::jsonb
  ),

  -- 11. Sterilizers, Sutures & Surgical Consumables (Uses subVariants for multi-size sterilizers)
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Sterilizers, Sutures & Surgical Consumables',
    'Electric instrument sterilizers, stainless steel autoclaves, nylon monofilament sutures, and sterile surgical blades.',
    2500.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Equipment / Consumable",
        "options": [
          { "label": "Surgical Blades (Box of 100 pcs)", "price": 2500.00 },
          { "label": "Nylon Polyamide Monofilament Suture 2/0 (Box of 12 pcs)", "price": 3500.00 },
          {
            "label": "Atlas Electric Instrument Sterilizer (India - 1Yr Warranty)",
            "price": 18500.00,
            "subVariants": [
              {
                "name": "Sterilizer Size",
                "required": true,
                "options": [
                  { "label": "8.5 inches (LKR 18,500)", "price": 0 },
                  { "label": "10 inches (LKR 20,500)", "price": 2000.00 },
                  { "label": "12 inches (LKR 23,000)", "price": 4500.00 }
                ]
              }
            ]
          },
          {
            "label": "IndoSurgicals Stainless Steel Autoclave Sterilizer (India - 2Yr Warranty)",
            "price": 55000.00,
            "subVariants": [
              {
                "name": "Autoclave Capacity",
                "required": true,
                "options": [
                  { "label": "10L Capacity (LKR 55,000)", "price": 0 },
                  { "label": "20L Capacity (LKR 95,000)", "price": 40000.00 },
                  { "label": "26L Capacity (LKR 140,000)", "price": 85000.00 },
                  { "label": "75L Capacity (LKR 210,000)", "price": 155000.00 }
                ]
              }
            ]
          }
        ]
      }
    ]'::jsonb
  ),

  -- 12. Medical Student Essentials & Clinical Skills
  (
    'd2c25c68-9c26-490c-9599-bc6fa1eb5905',
    'Medical Student Essentials & Clinical Skills Tools',
    'Essential clinical examination and anatomy tools for medical students: dissection kits, suture practice pads, reflex hammers, pen torches, and tourniquets.',
    550.00,
    425.00,
    'physical',
    ARRAY[]::text[],
    NULL,
    true,
    '[
      {
        "name": "Item",
        "options": [
          { "label": "Tourniquet", "price": 550.00 },
          { "label": "Non-Rechargeable Pen Torch", "price": 1200.00 },
          { "label": "Adult Knee Hammer", "price": 1800.00 },
          { "label": "Rechargeable Pen Torch", "price": 2300.00 },
          { "label": "Tendon Knee Hammer", "price": 2800.00 },
          { "label": "Medical Skin Suture Practice Pad", "price": 5500.00 },
          { "label": "Anatomy Dissection Kit", "price": 6500.00 }
        ]
      }
    ]'::jsonb
  )
RETURNING *;