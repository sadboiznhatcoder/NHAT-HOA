export const CATEGORY_HIERARCHY: Record<string, { brands: string[], subCategories: string[] }> = {
  "VINYL": {
    brands: ["Tarkett", "LG Hausys", "KDF", "Gerflor", "Responsive"],
    subCategories: ["Kháng khuẩn", "Chống tĩnh điện", "Chịu lực cao", "Chống trơn trượt"]
  },
  "THẢM (CARPET)": {
    brands: ["Suminoe", "Khác"],
    subCategories: ["Thảm tấm (Carpet Tile)", "Thảm cuộn (Broadloom/Roll)", "Thảm viên"]
  },
  "SÀN NÂNG (ACCESS FLOOR)": {
    brands: ["NAKA CORP", "Yikuan", "Unitile"],
    subCategories: ["Thép lõi xi măng (Cementitious)", "Gỗ ép (Woodcore)", "Nhôm đúc (Aluminum)", "Canxi Sunfat (Calcium Sulphate)"]
  },
  "SÀN TỰ PHẲNG (EPOXY/PU)": {
    brands: ["Viacor", "Khác"],
    subCategories: ["Sơn Epoxy", "Sơn Polyurethane (PU)"]
  },
  "PHÒNG SẠCH (CLEAN ROOM)": {
    brands: ["Beaver Panel", "Walltech"],
    subCategories: ["Panel tường (Wall Panel)", "Panel trần (Ceiling Panel)", "Cửa phòng sạch (Cleanroom Door)", "Phụ kiện nhôm"]
  },
  "SÀN ĐẶC BIỆT": {
    brands: ["Khác"],
    subCategories: ["Sàn thể thao ngoài trời", "Sàn hèm khóa (SPC)", "Sàn cao su (Rubber)"]
  }
};
