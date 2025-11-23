import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    list: [
      {
        fieldname: { type: String, required: true, trim: true },
        category: { type: Number, required: true },
        subCategory: { type: Number, required: true },
      },
    ],
  },
  { _id: false }
);

const bannerSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    alt: { type: String, trim: true },
  },
  { _id: false }
);

const homepageSchema = new mongoose.Schema(
  {
    sections: [sectionSchema],
    carousel: {
      mobile: [bannerSchema],
      desktop: [bannerSchema],
    },
    miceBanner: {
      mobile: {
        image: { type: String },
        link: { type: String },
        alt: { type: String },
      },
      desktop: {
        image: { type: String },
        link: { type: String },
        alt: { type: String },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Homepage", homepageSchema);
