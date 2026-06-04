require("dotenv").config();
const midtransClient = require("midtrans-client");

const coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey:    process.env.MIDTRANS_SERVER_KEY,
    clientKey:    process.env.MIDTRANS_CLIENT_KEY,
});

const run = async () => {
    try {
        const response = await coreApi.charge({
            payment_type: "qris",
            transaction_details: {
                order_id:     `TEST-${Date.now()}`,
                gross_amount: 10000,
            },
            qris: {
                acquirer: "gopay",
            },
            customer_details: {
                first_name: "Test User",
                email:      "test@test.com",
            },
            item_details: [
                {
                    id:       "ITEM-1",
                    price:    10000,
                    quantity: 1,
                    name:     "Test Item",
                },
            ],
        });

        console.log("SUCCESS:", JSON.stringify(response, null, 2));
    } catch (err) {
        console.error("ERROR:", err.message);
    }
};

run();