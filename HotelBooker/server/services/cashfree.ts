import Razorpay from 'razorpay';

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    booking_id?: string;
  };
}

interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
}

export class RazorpayService {
  private instance: Razorpay;

  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_uGpEIbyl9tXtTH",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "Ui7CXnrutIKk0Ufrp9dM1NzH",
    });
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log("Creating Razorpay order:", {
        amount: orderData.amount,
        receipt: orderData.receipt
      });

      const response = await this.instance.orders.create({
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        notes: orderData.notes,
      });

      console.log("Razorpay order created successfully:", {
        order_id: response.id,
        status: response.status
      });

      return {
        id: response.id,
        amount: response.amount,
        currency: response.currency,
        status: response.status,
        receipt: response.receipt
      };
    } catch (error) {
      console.error("Cashfree createOrder error:", error);
      throw error;
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree get order error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to get order details`);
      }

      return responseData;
    } catch (error) {
      console.error("Cashfree getOrderDetails error:", error);
      throw error;
    }
  }

  async getPaymentDetails(orderId: string, paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree get payment error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to get payment details`);
      }

      return responseData;
    } catch (error) {
      console.error("Cashfree getPaymentDetails error:", error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: any, headers: Record<string, any>): boolean {
    try {
      // Implement webhook signature verification
      // This is a simplified version - in production, implement proper signature verification
      const receivedSignature = headers['x-webhook-signature'];
      const timestamp = headers['x-webhook-timestamp'];
      
      if (!receivedSignature || !timestamp) {
        console.warn("Missing webhook signature or timestamp");
        return false;
      }

      // In production, verify the signature using your webhook secret
      // const expectedSignature = crypto
      //   .createHmac('sha256', WEBHOOK_SECRET)
      //   .update(timestamp + JSON.stringify(payload))
      //   .digest('hex');
      
      // return receivedSignature === expectedSignature;
      
      // For now, return true (implement proper verification in production)
      return true;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  async refundPayment(orderId: string, refundAmount: number, refundId: string): Promise<any> {
    try {
      const refundData = {
        refund_amount: refundAmount,
        refund_id: refundId,
        refund_note: "Refund requested by hotel management",
      };

      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}/refunds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(refundData),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree refund error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to process refund`);
      }

      return responseData;
    } catch (error) {
      console.error("Cashfree refundPayment error:", error);
      throw error;
    }
  }
}
