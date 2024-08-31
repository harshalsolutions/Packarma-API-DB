import razorpayInstance from '../../payments/razorpay-initialize.js';
import ApiResponse from '../../utils/ApiResponse.js';
import CustomError from '../../utils/CustomError.js';
import dotenv from 'dotenv';

dotenv.config();

export const CreatePaymentController = async (req, res, next) => {
    const { amount, currency } = req.body;
    const options = {
        amount: amount * 100,
        currency,
        receipt: `receipt_${Date.now()}`,
    };
    try {
        const order = await razorpayInstance.orders.create(options);

        res.json(new ApiResponse(200, order, 'Order created successfully'));
    } catch (error) {
        console.log('CreatePaymentController error:', error);
        next(new CustomError(500, error.message));
    }
}

export const VerifyPaymentController = async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            res.json(new ApiResponse(200, { status: 'success' }, 'Payment verified successfully'));
        } else {
            throw new CustomError(400, 'Payment verification failed');
        }
    } catch (error) {
        console.log('VerifyPaymentController error:', error);
        next(new CustomError(500, error.message));
    }
};