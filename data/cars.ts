export type Car = {
  id: string
  slug: string
  brand: string
  name: string
  year: number
  price: number
  monthly: number
  dp: number
  transmission: 'Automatic' | 'Manual'
  fuel: 'Bensin' | 'Diesel' | 'Listrik' | 'Hybrid'
  engine: string
  mileage: number
  color: string
  type: 'SUV' | 'MPV' | 'Sedan' | 'Hatchback' | 'Pickup' | 'Luxury'
  condition: 'Baru' | 'Bekas'
  location: string
  image: string
  gallery: string[]
  badge?: 'BEST SELLER' | 'NEW' | 'PROMO' | 'LUXURY' | 'READY STOCK' | 'SOLD OUT'
  isSoldOut?: boolean
  description: string
  features: string[]
  ownerId?: string
  branchId?: string
}

export const CARS: Car[] = [
  {
    id: 'c1',
    slug: 'ford-expedition-max-limited',
    brand: 'Ford',
    name: 'Ford Expedition MAX Limited 4x4',
    year: 2024,
    price: 1450000000,
    monthly: 22800000,
    dp: 290000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '3.5L EcoBoost Twin-Turbo V6',
    mileage: 8500,
    color: 'Oxford White',
    type: 'SUV',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/fortuner.jpg',
    gallery: [
      '/cars/fortuner.jpg'
    ],
    badge: 'BEST SELLER',
    description: 'Full-size SUV Amerika berkabin lapang 8-seater dengan performa mesin 3.5L EcoBoost Twin-Turbo 400 HP. Dilengkapi panoramic vista roof, sistem penggerak 4x4 teruji, dan suspensi udara adaptif.',
    features: ['3.5L Twin-Turbo 400 HP', 'Panoramic Vista Roof', 'Bang & Olufsen 22-Speaker Audio', 'Terrain Management System 4x4', 'Ford Co-Pilot360 Assist', 'PowerFold 3rd Row Seats']
  },
  {
    id: 'c2',
    slug: 'nissan-gtr-r35-nismo',
    brand: 'Nissan',
    name: 'Nissan GT-R R35 Nismo Edition',
    year: 2023,
    price: 3850000000,
    monthly: 58000000,
    dp: 770000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '3.8L VR38DETT Twin-Turbo V6',
    mileage: 4200,
    color: 'Pearl White Metallic',
    type: 'Luxury',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/crv.jpg',
    gallery: [
      '/cars/crv.jpg'
    ],
    badge: 'LUXURY',
    description: 'Supercar legendaris "Godzilla" Nissan GT-R R35 Nismo. Bertenaga 600 HP dari mesin rakitan tangan (Takumi), sistem penggerak ATTESA E-TS AWD, rem karbon keramik Brembo, dan aerodinamika karbon Nismo.',
    features: ['600 HP Hand-Built VR38DETT', 'ATTESA E-TS All-Wheel Drive', 'Carbon Ceramic Brembo Brakes', 'Recaro Carbon Racing Seats', 'Nismo Carbon Fiber Body Kit', 'Bose Custom Sound System']
  },
  {
    id: 'c3',
    slug: 'honda-crv-turbo-prestige',
    brand: 'Honda',
    name: 'Honda CR-V 1.5 Turbo Prestige',
    year: 2024,
    price: 545000000,
    monthly: 8500000,
    dp: 80000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '1.5L VTEC Turbo 190 HP',
    mileage: 12400,
    color: 'Platinum White Pearl',
    type: 'SUV',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/pajero.jpg',
    gallery: [
      '/cars/pajero.jpg'
    ],
    badge: 'NEW',
    description: 'Honda CR-V 1.5L Turbo Prestige hadir dengan desain elegan dan tangguh. Dilengkapi mesin VTEC Turbo 190 HP, Panoramic Sunroof, Hands-Free Power Tailgate, dan kecanggihan teknologi keselamatan Honda Sensing.',
    features: ['Honda Sensing', 'Panoramic Sunroof', 'Hands-Free Access Power Tailgate', '10.2" Interactive TFT Meter', 'Sequential LED Turning Signal', 'Bose Premium Audio System']
  },
  {
    id: 'c4',
    slug: 'toyota-tacoma-trd-pro',
    brand: 'Toyota',
    name: 'Toyota Tacoma TRD Pro 4x4',
    year: 2024,
    price: 1350000000,
    monthly: 21200000,
    dp: 270000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '3.5L V6 Direct-Injection 278 HP',
    mileage: 6100,
    color: 'Quicksand Tan',
    type: 'Pickup',
    condition: 'Bekas',
    location: 'Jakarta Barat',
    image: '/cars/alphard.jpg',
    gallery: [
      '/cars/alphard.jpg'
    ],
    badge: 'READY STOCK',
    description: 'Pickup double-cab off-road paling ikonik dari Toyota Racing Development (TRD Pro). Dilengkapi suspensi FOX QS3 Bypass, Skid Plate TRD aluminium, Velg Off-Road TRD 16 inci, dan RIGID Industries LED Fog Lights.',
    features: ['FOX QS3 Internal Bypass Shocks', 'TRD Pro Aluminum Skid Plate', 'Crawl Control & Multi-Terrain Select', 'RIGID Industries LED Fog Lights', 'TRD Pro Leather Trimmed Seats', 'JBL Premium Audio System']
  },
  {
    id: 'c5',
    slug: 'mercedes-benz-gle-450-coupe',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-Benz GLE 450 AMG Line',
    year: 2024,
    price: 1850000000,
    monthly: 29500000,
    dp: 370000000,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    engine: '3.0L EQ Boost Turbo 367 HP',
    mileage: 5200,
    color: 'Polar White',
    type: 'SUV',
    condition: 'Bekas',
    location: 'Jakarta Pusat',
    image: '/cars/civic.jpg',
    gallery: [
      '/cars/civic.jpg'
    ],
    badge: 'LUXURY',
    description: 'Executive SUV Coupe kemewahan Mercedes-Benz GLE 450 AMG Line. Mengusung mesin 3.0L Inline-6 Turbo bertenaga 367 HP dengan teknologi Mild Hybrid EQ Boost, AIRMATIC Suspension, dan layar MBUX widescreen.',
    features: ['AMG Line Exterior & Interior', 'AIRMATIC Air Suspension', 'Burmester Surround Sound System', 'Multibeam LED Headlamps', 'MBUX Widescreen Cockpit', 'Panoramic Sliding Sunroof']
  },
  {
    id: 'c6',
    slug: 'bmw-330i-m-sport',
    brand: 'BMW',
    name: 'BMW 330i M Sport (G20)',
    year: 2023,
    price: 1150000000,
    monthly: 18000000,
    dp: 200000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '2.0L TwinPower Turbo 258 HP',
    mileage: 5000,
    color: 'Portimao Blue Metallic',
    type: 'Sedan',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/bmw330i.jpg',
    gallery: [
      '/cars/bmw330i.jpg'
    ],
    badge: 'BEST SELLER',
    description: 'Sedan sport definitif BMW 330i M Sport generasi G20. Menghasilkan tenaga 258 HP dari mesin TwinPower Turbo dengan handling presisi khas BMW M Sport Suspension & Laserlight.',
    features: ['M Sport Aerodynamics Package', 'BMW Live Cockpit Professional', 'BMW Laserlight', 'Harman Kardon Surround Sound', 'Parking Assistant Plus', 'Comfort Access Keyless']
  },
  {
    id: 'c7',
    slug: 'mercedes-amg-gt-r-coupe',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-AMG GT R Coupe',
    year: 2023,
    price: 4950000000,
    monthly: 76000000,
    dp: 990000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '4.0L V8 Biturbo 585 HP',
    mileage: 2800,
    color: 'Magno Selenite Gray',
    type: 'Luxury',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/c300.jpg',
    gallery: [
      '/cars/c300.jpg'
    ],
    badge: 'LUXURY',
    description: 'Supercar "Beast of the Green Hell" Mercedes-AMG GT R. Dibekali mesin 4.0L V8 Biturbo bertenaga 585 HP, AMG Active Rear-Wheel Steering, rem AMG High-Performance, dan aerodinamika aktif nürburgring.',
    features: ['585 HP 4.0L V8 Biturbo', 'AMG Active Rear-Wheel Steering', 'AMG Ceramic High-Performance Brakes', 'AMG Performance Bucket Seats', 'Panamericana Front Grille', 'Burmester High-End 3D Sound']
  },
  {
    id: 'c8',
    slug: 'range-rover-sport-hse',
    brand: 'Land Rover',
    name: 'Range Rover Sport HSE Dynamic',
    year: 2024,
    price: 2650000000,
    monthly: 41000000,
    dp: 530000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '3.0L Ingenium Turbo 400 HP',
    mileage: 4800,
    color: 'Santorini Black Metallic',
    type: 'Luxury',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/ioniq5.jpg',
    gallery: [
      '/cars/ioniq5.jpg'
    ],
    badge: 'PROMO',
    description: 'SUV Mewah khas Inggris Range Rover Sport HSE Dynamic. Menggabungkan performa tinggi mesin 400 HP dengan kemewahan kabin Windsor Leather, Terrain Response 2 All-Wheel Drive, dan Meridian Sound System.',
    features: ['Terrain Response 2 AWD', 'Electronic Air Suspension', 'Meridian 3D Surround Sound 800W', 'Windsor Leather Executive Seats', 'Pixel-Laser LED Headlights', 'Soft Door Close']
  },
  {
    id: 'c9',
    slug: 'bmw-m4-competition-coupe',
    brand: 'BMW',
    name: 'BMW M4 Competition Coupe (G82)',
    year: 2024,
    price: 2450000000,
    monthly: 38000000,
    dp: 490000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '3.0L M TwinPower Turbo 510 HP',
    mileage: 3600,
    color: 'Isle of Man Green / Brooklyn Grey',
    type: 'Luxury',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/cx5.jpg',
    gallery: [
      '/cars/cx5.jpg'
    ],
    badge: 'NEW',
    description: 'Coupe performa murni BMW M4 Competition bertenaga 510 HP & torsi 650 Nm. Dilengkapi atap Carbon Fiber Reinforced Plastic (CFRP), kursi M Carbon Bucket, transmisi M Steptronic 8-speed, dan M Drive Professional.',
    features: ['510 HP M TwinPower Turbo Inline-6', 'M Carbon Bucket Seats', 'Carbon Fiber Roof & Body Kit', 'M Setup & M Drift Analyser', 'Harman Kardon Surround Sound', 'Head-Up Display M Specific']
  },
  {
    id: 'c10',
    slug: 'porsche-911-carrera-s',
    brand: 'Porsche',
    name: 'Porsche 911 Carrera S (992)',
    year: 2023,
    price: 3950000000,
    monthly: 61000000,
    dp: 790000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '3.0L Twin-Turbo Flat-6 450 HP',
    mileage: 4100,
    color: 'Jet Black Metallic',
    type: 'Luxury',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: '/cars/palisade.jpg',
    gallery: [
      '/cars/palisade.jpg'
    ],
    badge: 'LUXURY',
    description: 'Sports car paling ikonik di dunia Porsche 911 Carrera S generasi 992. Dibekali mesin 3.0L Flat-6 Twin-Turbo bertenaga 450 HP, transmisi PDK 8-Speed, Sport Chrono Package, dan Porsche Active Suspension Management (PASM).',
    features: ['450 HP Twin-Turbo Flat-6', '8-Speed PDK Transmission', 'Sport Chrono Package with Mode Switch', 'PASM Sport Suspension (-10mm)', 'BOSE Surround Sound System', 'Sports Exhaust System with Black Tailpipes']
  }
]
