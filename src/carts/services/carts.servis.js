import CustomError from "../../errors/customError.js";
import cartsModel from "../../models/carts.model.js";
import { productsModel } from "../../models/products.model.js";
import ticketModel from "../../models/ticket.model.js";
import userModel from "../../models/users.model.js";
import { ProductsService } from "../../products/services/products.services.js";

class CartsServices {
  createCart = async () => {
    try {
      const newCart = {
        cart: [],
      };
      const cart = await cartsModel.create(newCart);

      return cart;
    } catch (error) {
      console.log(error);
    }
  };

  getAllCarts = async () => {
    try {
      const carts = await cartsModel.find();

      return carts;
    } catch (error) {
      console.log(error);
    }
  };

  getCartById = async (cid) => {
    try {
      const cart = await cartsModel
        .findById({ _id: cid })
        .populate("carts.product")
        .lean()
        .exec();

      if (!cart) throw new Error("Cart Not Found");

      return cart;
    } catch (error) {
      console.log(error);
    }
  };

  addProductToCart = async (cid, pid, user) => {
    try {
      const cart = await this.getCartById(cid);

      if (!cart) throw new Error("Cart Not Found");

      const product = await productsModel.findById({ _id: pid }).lean().exec();

      if (!product) throw new Error("Product Not Found");

      if (product.owner == user._id) {
        CustomError.createError({
          name: "Failed to add product to cart",
          message: "Cant add to cart a product that you already own",
        });
      }

      const findProduct = await cartsModel.findOne({ "carts.product": pid });

      if (findProduct) {
        const result = await cartsModel.updateOne(
          { "carts.product": pid },
          {
            $inc: {
              "carts.$.quantity": 1,
            },
          }
        );

        return result;
      }

      const result = await cartsModel.updateOne(
        { _id: cid },
        { $push: { carts: { product: pid } } }
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  updateQuantity = async (cid, pid, quantity) => {
    try {
      const cart = await this.getCartById(cid);

      if (!cart) throw new Error("Cart Not Found");

      const product = await cartsModel.findOne({ "carts.product": pid });

      if (!product) throw new Error("Product Not Found In Cart");

      const result = await cartsModel.updateOne(
        { "carts.product": pid },
        {
          $inc: {
            "carts.$.quantity": quantity,
          },
        }
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  addArrayOfProducts = async (cid, arrayOfProducts) => {
    try {
      const cart = await this.getCartById(cid);

      if (!cart) throw new Error("Cart Not Found");

      const mapProducts = arrayOfProducts.map((product) => {
        product: product._id;
      });

      const result = await cartsModel.updateOne(
        { _id: cid },
        { $push: { carts: { $each: mapProducts } } }
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  deleteProductFromCart = async (cid, pid) => {
    try {
      const cart = await this.getCartById(cid);

      if (!cart) throw new Error("Cart Not Found");

      const result = await cartsModel.updateOne(
        { _id: cid },
        { $pull: { carts: { product: pid } } }
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  deleteAllProducts = async (cid) => {
    try {
      const cart = await this.getCartById(cid);

      if (!cart) throw new Error("Cart Not Found");

      const result = await cartsModel.updateOne(
        { _id: cid },
        { $set: { carts: [] } }
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  purchaseProducts = async (cid) => {
    try {
      const cart = await this.getCartById(cid);

      if (!cart) throw new Error("Cart Not Found");

      const products = Array.from(cart.carts);

      const purchaser = await userModel.findOne({ cart: cid }).lean().exec();

      const total = await this.removeProductFromStock(cid, products);

      console.log(total);

      const ticket = await this.generateTicket(purchaser.email, total);

      console.log(ticket);

      return ticket;
    } catch (error) {
      console.log(error);
    }
  };

  generateTicket = async (purchaser, total) => {
    try {
      const result = await ticketModel.create({
        amount: total,
        purchaser: purchaser,
      });

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  removeProductFromStock = async (cid, products) => {
    try {
      let total = 0;

      products.forEach(async (product) => {
        const pid = product.product._id;

        if (ProductsService.updateStock(pid, product.quantity)) {
          await this.deleteProductFromCart(cid, pid);

          total = total + product.product.price;
        }
      });

      return total;
    } catch (error) {
      console.log(error);
    }
  };
}

export const CartServices = new CartsServices();