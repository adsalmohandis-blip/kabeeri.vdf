# ECOM-UI02 Product Details Conversion

## Identity

- Design code: `ECOM-UI02`
- Business: e-commerce
- View: product details page
- Style: inspectable product page with conversion-first hierarchy
- Copy policy: inspiration only

## Core Pattern

```text
gallery
product summary
price / stock / variants
primary purchase action
delivery and trust details
description / specs / reviews
related products
```

## Required Sections

- image gallery with stable aspect ratio;
- product title and rating;
- price, discount, tax or fee note;
- variant selector and quantity;
- add-to-cart and buy-now actions;
- delivery estimate, returns, warranty, support;
- specs, reviews, FAQ, related products.

## Component Contracts

- `ProductGallery`
- `PriceBlock`
- `VariantSelector`
- `QuantityStepper`
- `AddToCartButton`
- `BuyNowButton`
- `ReviewStars`
- `TrustPanel`
- `RelatedProducts`

## States

- variant unavailable;
- quantity limit reached;
- add-to-cart loading;
- add-to-cart success;
- out of stock;
- review loading or empty.

## Design Rules

- Main product signal appears above the fold.
- Purchase buttons must be visually clear and icon-supported.
- Use badges for stock, sale, and shipping status.
- Keep gallery controls accessible.

## Motion

- `BALANCED_MOTION`
- Gallery transitions are allowed.
- Add-to-cart feedback may use subtle toast or cart drawer.
- Do not animate prices in a distracting way.

## Task Seed

- Build product detail view with gallery, variants, purchase actions, trust, specs, reviews.
- Include unavailable variant, loading, success, and error states.

