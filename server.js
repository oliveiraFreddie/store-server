const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
require('dotenv').config();

const BASE_API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4242';
const port = process.env.PORT || 4242;
const app  = express();

app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors({ origin: true, credentials: true }));


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/checkout', async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
            allowed_countries: ['US', 'CA', 'PT'],
            },
                shipping_options: [
                {
                    shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 0,
                        currency: 'EUR',
                    },
                    display_name: 'Free shipping',
                    // Delivers between 5-7 business days
                    delivery_estimate: {
                        minimum: {
                        unit: 'business_day',
                        value: 5,
                        },
                        maximum: {
                        unit: 'business_day',
                        value: 7,
                        },
                    }
                    }
                },
                {
                    shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 1500,
                        currency: 'EUR',
                    },
                    display_name: 'Next day air',
                    // Delivers in exactly 1 business day
                    delivery_estimate: {
                        minimum: {
                        unit: 'business_day',
                        value: 1,
                        },
                        maximum: {
                        unit: 'business_day',
                        value: 1,
                        },
                    }
                    }
                },
                ],
            line_items: req.body.items.map((item) => ({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: item.name,
                        images: [item.product]
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: `${BASE_API_URL}/success.html`,
            cancel_url: `${BASE_API_URL}/cancel.html`,
        })

        res.status(200).json(session)
    } catch (error) {
        next(error)
    }
});

app.listen(port, () => console.log(`api is running on port: ${port}`));