import mongoose from "mongoose";
import { randomUUID } from "crypto";

const useMockDb = process.env.USE_MOCK_DB === "true";

// helper to avoid accidental mutations of in-memory data
const toPlainObject = (value) =>
  value === null || value === undefined
    ? value
    : JSON.parse(JSON.stringify(value));

const buildMockModel = () => {
  const products = [
    {
      _id: randomUUID(),
      title: "Sample Burger",
      description: "A mock burger product used when the database is disabled.",
      price: 12.5,
      image: "1704631387262.png",
      category: "food",
      user: null,
    },
    {
      _id: randomUUID(),
      title: "Sample Lemonade",
      description: "Refreshing lemonade for mock mode.",
      price: 5,
      image: "1713501543450.png",
      category: "drinks",
      user: null,
    },
  ];

  const matchesFilter = (item, filter = {}) =>
    Object.entries(filter).every(([key, value]) =>
      value === undefined ? true : item[key] === value
    );

  return {
    async find(filter = {}) {
      const result = products.filter((item) => matchesFilter(item, filter));
      return toPlainObject(result);
    },
    async findById(id) {
      const product = products.find((item) => item._id === id);
      return toPlainObject(product ?? null);
    },
    async create(data) {
      const newProduct = {
        _id: randomUUID(),
        ...data,
      };
      products.push(newProduct);
      console.log("new product is saved", newProduct);
      return toPlainObject(newProduct);
    },
    async findByIdAndUpdate(id, update, options = {}) {
      const idx = products.findIndex((item) => item._id === id);
      if (idx === -1) return null;
      // shallow merge
      products[idx] = { ...products[idx], ...update };
      const updated = toPlainObject(products[idx]);
      return options.new ? updated : toPlainObject(products[idx]);
    },
  };
};

// schema for all products
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
});

// saying about saved product
productSchema.post("save", function (doc, next) {
  console.log("new product is saved", doc);
  next();
});

const Product = useMockDb
  ? buildMockModel()
  : mongoose.model("product", productSchema);

export default Product;
