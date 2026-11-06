const crypto = require('crypto');
const Webhook = require('../models/Webhook');

/**
 * Dispatch an event to all registered, active webhooks matching the event type.
 * Includes HMAC-SHA256 signature for tamper-evident transmission.
 */
const dispatchWebhookEvent = async (eventType, payload) => {
  try {
    const webhooks = await Webhook.find({
      isActive: true,
      events: eventType,
    });

    if (!webhooks || webhooks.length === 0) return [];

    const deliveryTimestamp = new Date().toISOString();
    const eventBody = JSON.stringify({
      event: eventType,
      timestamp: deliveryTimestamp,
      data: payload,
    });

    const dispatchPromises = webhooks.map(async (webhook) => {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(eventBody)
        .digest('hex');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ConsentLog-Enterprise-Webhook-Dispatcher/2.0',
            'X-ConsentLog-Event': eventType,
            'X-ConsentLog-Delivery': deliveryTimestamp,
            'X-ConsentLog-Signature': `sha256=${signature}`,
          },
          body: eventBody,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        webhook.lastTriggeredAt = new Date();
        webhook.lastResponseStatus = response.status;
        if (!response.ok) {
          webhook.failureCount = (webhook.failureCount || 0) + 1;
        } else {
          webhook.failureCount = 0;
        }
        await webhook.save();

        return { id: webhook._id, url: webhook.url, status: response.status, success: response.ok };
      } catch (err) {
        webhook.lastTriggeredAt = new Date();
        webhook.lastResponseStatus = 504;
        webhook.failureCount = (webhook.failureCount || 0) + 1;
        await webhook.save();
        return { id: webhook._id, url: webhook.url, status: 504, success: false, error: err.message };
      }
    });

    return await Promise.allSettled(dispatchPromises);
  } catch (error) {
    console.error('[WebhookDispatcher] Error dispatching webhook events:', error.message);
    return [];
  }
};

module.exports = { dispatchWebhookEvent };

