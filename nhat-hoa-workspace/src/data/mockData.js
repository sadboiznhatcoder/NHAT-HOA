// Using let so the mock logic can mutate it in-memory
export let mockProducts = [
  {
    id: '1',
    name: 'Apollo Vinyl Elite',
    brand_id: 'b1',
    category_id: 'c1',
    description: 'High-quality vinyl flooring with electrostatic discharge protection, perfect for medical and cleanroom environments.',
    price_per_m2: 450000,
    specs: { "Độ dày": '2mm', "Chất liệu": 'Vinyl', "Lớp chống mòn": '0.5mm' },
    certifications: ['ISO 14001', 'FloorScore', 'CE'],
    images: ['https://images.unsplash.com/photo-1581428982868-e410dd147b9d?q=80&w=800&auto=format&fit=crop'],
    brands: { name: 'Apollo Floors', logo: '' },
    categories: { name: 'Medical & Cleanroom' }
  },
  {
    id: '2',
    name: 'Epoxy Guard Pro',
    brand_id: 'b2',
    category_id: 'c2',
    description: 'Industrial grade epoxy coating for heavy machinery areas and automotive shops.',
    price_per_m2: 650000,
    specs: { "Độ dày": '3mm', "Chất liệu": 'Epoxy', "Bề mặt": 'Bóng (Gloss)' },
    certifications: ['ISO 9001'],
    images: ['https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=800&auto=format&fit=crop'],
    brands: { name: 'GuardTech', logo: '' },
    categories: { name: 'Industrial' }
  },
  {
    id: '3',
    name: 'EcoCarpet Comfort',
    brand_id: 'b3',
    category_id: 'c3',
    description: 'Sound-absorbing carpet tiles ideal for corporate offices and libraries.',
    price_per_m2: 320000,
    specs: { "Độ dày": '5mm', "Chất liệu": 'Nylon', "Kiểu dáng": 'Tile' },
    certifications: ['GreenLabel Plus'],
    images: ['https://images.unsplash.com/photo-1594818379496-da1e345b0ded?q=80&w=800&auto=format&fit=crop'],
    brands: { name: 'EcoWeave', logo: '' },
    categories: { name: 'Corporate Office' }
  }
];
