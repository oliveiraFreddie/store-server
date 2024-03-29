const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4242; // Use a variável de ambiente PORT ou 4242 se não estiver definida

app.use(compression());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: false, limit: '1mb' }));
app.use(bodyparser.json({ limit: '1mb' }));
app.use(cors({
    origin: ['http://localhost:3000', 'https://fr3d-store-app.vercel.app'],
    credentials: true,
}));



const stripe = require('stripe')('sk_test_51OkOltHMoqj2puA5aDjE0X6Cg3qVMJyGcYNax0t7FWtxQRG6AmyCEDllwLgBnvJU4EYzS3Qh6Ktt3y3aMdsPbNS300Zfo8tkfC');

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
            success_url: 'http://localhost:4242/success.html' || 'https://fr3d-store-app.vercel.app/success.html',
            cancel_url: 'http://localhost:4242/cancel.html' || 'https://fr3d-store-app.vercel.app/cancel.html',
        })

        res.status(200).json(session)
    } catch (error) {
        next(error)
    }
});

app.listen(PORT, () => console.log(`API está funcionando na porta ${PORT}`));