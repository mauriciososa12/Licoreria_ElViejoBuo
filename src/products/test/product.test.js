import supertest from "supertest";
import chai from "chai";
import dotenv from "dotenv";
dotenv.config();

const expect = chai.expect;
const requester = supertest(process.env.BASE_URL);

describe("Testing /api/products", () => {
  describe("/GET", () => {
    it("Get in /api/products should return an array", async () => {
      const { _body } = await requester.get("/api/products");

      expect(_body.payload).to.be.an("array").that.is.not.empty;
    });

    it("The array must include object", async () => {
      const { _body } = await requester.get("/api/products");

      expect(_body.payload[0]).to.be.an("object");
    });

    it("The object must have property _id", async () => {
      const { _body } = await requester.get("/api/products");

      expect(_body.payload[0]).to.haveOwnProperty("_id");
    });
  });
});