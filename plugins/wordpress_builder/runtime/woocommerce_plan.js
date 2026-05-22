function buildWooCommercePlan(input, options = {}) {
  const idea = String(input || options.idea || options.description || "WooCommerce store").trim();
  return {
    report_type: "wordpress_woocommerce_plan",
    idea,
    store_model: {
      catalog_model: ["simple products", "variable products", "categories", "tags"],
      customer_journey: ["browse", "product detail", "cart", "checkout", "order confirmation"],
      operations_model: ["admin catalog management", "order fulfillment", "refund handling", "inventory review"]
    },
    product_model: {
      product_types: ["simple", "variable", "bundled", "digital"],
      data_points: ["price", "SKU", "stock", "shipping class", "tax class", "gallery", "attributes"]
    },
    checkout_requirements: [
      "Guest checkout and account checkout are both reviewed.",
      "Validation, payment error states, and confirmation states are documented.",
      "Cart persistence and abandoned-cart behavior are defined."
    ],
    payment_shipping_notes: [
      "Payments should be tested in sandbox first.",
      "Shipping zones, tax rules, and fulfillment notifications must be documented.",
      "Do not enable live gateways without Owner approval."
    ],
    security_notes: [
      "Protect cart, checkout, and account endpoints with proper nonces and capability checks.",
      "Review order status transitions, webhooks, and refund flows for abuse cases."
    ],
    next_action: "Use this WooCommerce plan with the theme-plan and security-cleanup-plan before implementation."
  };
}

module.exports = {
  buildWooCommercePlan
};
