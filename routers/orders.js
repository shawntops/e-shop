const express = require('express');
const { Order } = require('../models/order');
const router = express.Router();
const { OrderItem } = require('../models/orderitems')

router.get(`/`, async (req, res) => {
    const orderList = await Order.find()
        .populate('user', 'name')
        .populate({
            path: 'orderItems',

            populate: {
                path: 'product',
                model: 'Product',

                populate: {
                    path: 'category',
                    model: 'Category'
                }
            }
        })
        .sort({ 'dateOrdered': -1 })

    if (!orderList) {
        res.status(500).json({
            success: false,
            message: 'Order not found'
        })
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        // .populate({
        //     path: 'orderItems', populate: {
        //         path: 'product', populate: 'category'
        //     }
        // })
        .populate({
            path: 'orderItems',

            populate: {
                path: 'product',
                model: 'Product',

                populate: {
                    path: 'category',
                    model: 'Category'
                }
            }
        })

    if (!order) {
        res.status(500).json({
            success: false,
            message: 'Order not found'
        })
    }
    res.send(order);
})

router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
    }))
    const orderItemIdsResolved = await orderItemsIds

    let globalTotalPrice

    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice

        globalTotalPrice = totalPrice
    }))




    console.log(totalPrices);


    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: globalTotalPrice,
        user: req.body.user
    })
    order = await order.save()

    if (!order)
        return res.status(404).send('Order cannot be created!')

    res.send(order)
})

router.put('/:id', async (req, res) => {
    let order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    )
    if (!order)
        return res.status(400).send('Order cannot be found')
    res.send(order)
})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {  //This line of code is for deleting corresponding OrderItem in the database
                await orderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: "Order deleted successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Order not found"
            })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

module.exports = router