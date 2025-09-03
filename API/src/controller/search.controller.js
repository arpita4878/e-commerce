import axios from "axios";
import Product from "../model/product.schema.js"
import Inventory from "../model/inventory.js";
import Order from "../model/order.schema.js";


export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    // const role = req.user.role;
    // const branchId = req.user.branchId;

    const role = req.headers["role"];
const branchId = req.headers["branchid"];

    let products = [];

    if (role === "super_admin") {
      products = await Product.find();
    } else if (role === "manager" || role === "staff") {
      products = await Inventory.find({ branchId }).populate("productId");
      products = products.map(p => ({
        _id: p.productId._id,
        name: p.productId.name,
        description: p.productId.description
      }));
    } else if (role === "deliveryboy") {
      const orders = await Order.find({ deliveryBoy: req.user._id }).populate("products");
      products = orders.flatMap(o => o.products.map(p => ({
        _id: p._id,
        name: p.name,
        description: p.description
      })));
    }

    const formattedProducts = products.map(p => ({
      id: String(p._id),
      name: p.name,
      description: p.description || ""
    }));

    const response = await axios.post("http://localhost:8001/search", {
      q,
      products: formattedProducts
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
