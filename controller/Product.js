const { query } = require("express");
const { Product } = require("../model/Product");

exports.createProduct = async (req, res) => {
  //this product we have to get from API body
  const product = new Product(req.body);
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchAllProducts = async (req, res) => {
  //here we need a query string

  //filter = {"category":["smartphone","laptops"]}
  //sort = {_sort: price, _order="desc"}
  // pagination = {_page:1, _limit=10} //_page=1&_limit=10

  //TODO : we have to try with multiple category and brands after change in front-end
  let condition = {};
  if (!req.query.admin) {
    condition.deleted = { $ne: true };
  }

  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition); //adding .count() to query will execute it (and it can be executed once only) which we dont want so making copy of it

  if (req.query.category) {
    query = query.find({ category: req.query.category });
    totalProductsQuery = totalProductsQuery.find({
      category: req.query.category,
    });
  }
  if (req.query.brand) {
    query = query.find({ brand: req.query.brand });
    totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand });
  }
  //TODO : how to get sort on discounted Price not actual price.
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order }); // "title" : "order"
    totalProductsQuery = totalProductsQuery.sort({
      [req.query._sort]: req.query._order,
    }); // "title" : "order"
  }

  const totalDocs = await totalProductsQuery.countDocuments().exec(); // Mongoose 7+ uses countDocuments(); count() was removed

  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs); //adding header
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id); //findbyid finds by objectId ig, so whatever you put in there is compared with _id and not id or whatever data field you have made
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      //no need to send entire product as body, just the data fields you wanna change.
      new: true,
    }); //findbyid finds by objectId ig, so whatever you put in there is compared with _id and not id or whatever data field you have made
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};
