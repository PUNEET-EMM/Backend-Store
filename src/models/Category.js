import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
//   description: {
//     type: String,
//     trim: true
//   },
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
//   seo: {
//     title: String,
//     description: String,
//     keywords: [String]
//   },
  stats: {
    productsCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
//   description: {
//     type: String,
//     trim: true
//   },
  
  // SUBCATEGORIES ARRAY (embedded)
  subcategories: [subCategorySchema],
  
  imageUrl: String,
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
//   seo: {
//     title: String,
//     description: String,
//     keywords: [String]
//   },
  
  stats: {
    subcategoriesCount: { type: Number, default: 0 },
    productsCount: { type: Number, default: 0 }
  },
   createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalUser",
    required: true,
  }
}, {
  timestamps: true
});

// INDEXES
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ 'subcategories.slug': 1 });

categorySchema.pre('validate', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  this.subcategories.forEach(sub => {
    if (!sub.slug && sub.name) {
      sub.slug = sub.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  });

  this.stats.subcategoriesCount = this.subcategories.filter(s => s.isActive).length;

  next();
});


export const Category = mongoose.model('Category', categorySchema);