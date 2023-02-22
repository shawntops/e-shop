const express = require('express');
const { Product } = require('../models/product');
const { Category } = require('../models/category')
const router = express.Router();
const mongoose = require('mongoose')

router.get(`/`, async (req, res) => {

    //Filtering Get products by categories
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category')//.select('name')

    if (!productList) {
        res.status(500).json({
            success: false,
            message: 'Product not found'
        })
    }
    res.send(productList);
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
        res.status(500).json({
            success: false,
            message: 'Product not found'
        })
    }
    res.send(product);
})

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')


    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();

    if (!product)
        return res.status(500).send('Product cannot be created')
    res.send(product)
})

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')

    let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )
    if (!product)
        return res.status(400).send('Product cannot be updated')
    res.send(product)
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Product not found"
            })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

//Get count of products
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments()

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
})

//Get count of featured products
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count) //The plus sign is used to change the count from a string value to integer(number)

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send({
        products
    });
})


module.exports = router