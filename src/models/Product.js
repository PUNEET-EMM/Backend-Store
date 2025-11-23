import mongoose from "mongoose";

/* ---------------------- VARIANT SCHEMA ---------------------- */
const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'Variant SKU is required'],
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    trim: true,
  },
  attributes: {
    type: Map, // Example: { color: "Red", size: "L" }
    of: String,
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0
  },
  discountPercent: {
    type: Number, // % off from MRP
    default: 0
  },
  gstPercent: {
    type: Number, // GST %
    default: 0
  },
  marginPercent: {
    type: Number, // profit margin
    default: 0
  },
  images: [{
    url: { type: String },
    alt: String,
    order: { type: Number, default: 0 }
  }]
}, { _id: false });

/* ---------------------- PRODUCT SCHEMA ---------------------- */
const productSchema = new mongoose.Schema({
  // BASIC INFO
  sku: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },

  // CATEGORY & SUBCATEGORY
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: [true, 'Subcategory is required']
  },
  categoryName: String,
  subCategoryName: String,

  // PRICING (Base / Default)
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0
  },
  moq: {
    type: Number,
    default: 1,
    min: 1,
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  gstPercent: {
    type: Number,
    default: 0
  },
  marginPercent: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // VARIANTS
  variants: [variantSchema],

  // IMAGES
  images: [{
    url: { type: String, required: true },
    alt: String,
    order: { type: Number, default: 0 }
  }],


  // STATUS
  isActive: { type: Boolean, default: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalUser",
    required: true
  }


  // ATTRIBUTES ( metadata) - DISABLED FOR INITIAL STAGE
  // attributes: {
  //   type: Map,
  //   of: mongoose.Schema.Types.Mixed
  // },

  // SEO - DISABLED FOR INITIAL STAGE
  // seo: {
  //   title: String,
  //   description: String,
  //   keywords: [String]
  // },

    // STATS - DISABLED FOR INITIAL STAGE
//   stats: {
//     views: { type: Number, default: 0 },
//     salesCount: { type: Number, default: 0 },
//     rating: { type: Number, default: 0 },
//     reviewCount: { type: Number, default: 0 }
//   },

  // TAGS - DISABLED FOR INITIAL STAGE
  // tags: [String],
}, { timestamps: true });

/* ---------------------- INDEXES ---------------------- */
productSchema.index({ categoryId: 1, subCategoryId: 1 });
productSchema.index({ name: "text", description: "text" });

/* ---------------------- HOOKS ---------------------- */
// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// TODO: Add pre-save hook to auto-generate SKU
// Example: SKU format could be CAT-SUBCAT-XXXXX or timestamp-based

export const Product = mongoose.model("Product", productSchema);
