import { Schema, models, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  courses: Schema.Types.ObjectId[];
}

export const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

const Category = models.Category || model("Category", CategorySchema);

export default Category;
