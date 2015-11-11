![plentymarkets Logo](http://www.plentymarkets.eu/layout/pm/images/logo/plentymarkets-logo.jpg)

# plentymarkets CMS library 0.9.1

## Update your **Callisto Light 2** to plentymarketsCMStools 0.9.1

### Step 1: Download plentymarketsCMStools 0.9.1

You can download this repository as a [zip archive](https://github.com/plentymarkets/plenty-cms-library/archive/master.zip).
All required files can be found in `dist/`-folder

### Step 2: Upload required files

Upload the following files to `LAYOUT_FOLDER/js/plenty/`:
- `plentymarketsCMStools-0.9.1.js`
- `lang/de_DE.json` (You have to create the folder `lang` manually)
- `lang/en_EN.json`

### Step 3: Include new files in your template

Download and open `LAYOUT_FOLDER/js/plenty/scripts.json` and change the file to use:
```js
{
  "PageDesignGlobal": {
    "head": [],
    "body": [
      .
      .
      .
      "plenty/plentymarketsCMStools-0.9.1.js"
    ]
  },
  .
  .
  .
}
```
If the `scripts.json` doesn't exist see [Update your Callisto Light using dependecyInjector](#update-your-callisto-light-using-dependecyinjector).
Upload the edited file back to your webspace (you will override the existing version).

### Step 4: Load language files in your PageDesign-templates

Open templates: `PageDesignContent`, `PageDesignCheckout`, `PageDesignMyAccount` and search for:

```html
<script>
    ScriptLoader.load({
        layout: 'PageDesign$PageDesign',
        position: 'body',
        rootPath: '{% GetGlobal('LayoutFolder'); %}/js/',
        sourceMap: '{% GetGlobal('LayoutFolder'); %}/js/plenty/scripts.json'
    });
</script>
```
If you cannot find this code see [Update your Callisto Light using dependecyInjector](#update-your-callisto-light-using-dependecyinjector).
**ATTENTION:** In each template you will find two similar occurrences of this snippet. Make sure that the value of the parameter `position` is `'body'`

Add the following lines after each found occurrence:

```html
<script>
    {% if $Lang == "de" %}
        PlentyFramework.loadLanguageFile('/lang/de_DE.json');
    {% elseif $Lang == "en" %}
        PlentyFramework.loadLanguageFile('/lang/en_EN.json');
    {% endif %}
</script>
```
**ATTENTION:** Do not wrap these calls in the same &lt;script&gt; tag. Be sure to have separate &lt;script&gt; tags for each call.

### Step 5: Edit Category for Checkout-Step 3

Open the category which is set for Checkout-Step 3. By default this category is named "Kasse".
Search for
```html
<!-- STEP 1: Order details -->
<div class="container" data-plenty-checkout-id="details" id="checkoutPanelOrderDetails" aria-labelledby="checkoutTabOrderDetails" role="tabpanel">
    {% $_id = CheckoutStepPageID(4) %}
    {% CategoryContentBody($_id) %}
</div>
{% endif %}

<!-- STEP 2: Addresses -->
<div class="container" data-plenty-checkout-id="addresses" id="checkoutPanelAddresses" aria-labelledby="checkoutTabAddresses" role="tabpanel">
    {% $_id = CheckoutStepPageID(5) %}
    {% CategoryContentBody($_id) %}
</div>

<!-- STEP 3: Shipping & Payment -->
<div class="container" data-plenty-checkout-id="shipping-payment" id="checkoutPanelShippingPayment" aria-labelledby="checkoutTabShippingPayment" role="tabpanel">
    {% $_id = CheckoutStepPageID(6) %}
    {% CategoryContentBody($_id) %}
</div>

<!-- STEP 4: Overview & Confirmation -->
<div class="container" data-plenty-checkout-id="confirm" id="checkoutPanelConfirm" aria-labelledby="checkoutTabConfirm" role="tabpanel" data-plenty-checkout-catcontent="{% CheckoutStepPageID(7) %}">
    {% $_id = CheckoutStepPageID(7) %}
    {% CategoryContentBody($_id) %}
</div>
```
and edit to:

```html
<!-- STEP 1: Order details -->
{% $_id = CheckoutStepPageID(4) %}
<div class="container" data-plenty-checkout-id="details" id="checkoutPanelOrderDetails" aria-labelledby="checkoutTabOrderDetails" role="tabpanel" data-plenty-checkout-content="$_id">
    {% CategoryContentBody($_id) %}
</div>
{% endif %}

<!-- STEP 2: Addresses -->
{% $_id = CheckoutStepPageID(5) %}
<div class="container" data-plenty-checkout-id="addresses" id="checkoutPanelAddresses" aria-labelledby="checkoutTabAddresses" role="tabpanel" data-plenty-checkout-content="$_id">
    {% CategoryContentBody($_id) %}
</div>

<!-- STEP 3: Shipping & Payment -->
{% $_id = CheckoutStepPageID(6) %}
<div class="container" data-plenty-checkout-id="shipping-payment" id="checkoutPanelShippingPayment" aria-labelledby="checkoutTabShippingPayment" role="tabpanel" data-plenty-checkout-content="$_id">
    {% CategoryContentBody($_id) %}
</div>

<!-- STEP 4: Overview & Confirmation -->
{% $_id = CheckoutStepPageID(7) %}
<div class="container" data-plenty-checkout-id="confirm" id="checkoutPanelConfirm" aria-labelledby="checkoutTabConfirm" role="tabpanel" data-plenty-checkout-content="$_id">
    {% CategoryContentBody($_id) %}
</div>
```

### Step 6: Edit Category for Checkout-Step 6

Open the category which is set for Checkout-Step 6. By default this category is named "Zahlung &amp; Versand".
Search for:

```js
if ( response.data.CheckoutMethodOfPaymentRedirectURL == '' && response.data.CheckoutMethodOfPaymentAdditionalContent == '' )
```
and edit to:

```js
if ( !response || (response.data.CheckoutMethodOfPaymentRedirectURL == '' && response.data.CheckoutMethodOfPaymentAdditionalContent == '' ) )
```




## Update your **Callisto Light** using `dependecyInjector`

Perform **Step 1** and **Step 2** as described above.

### Step 3 (alternative): Include new files in your template

Download and open `LAYOUT_FOLDER/js/plenty/dependencies.json` and change the file to use:
```js
{
  "PageDesignGlobal": {
    "head": [],
    "body": [
      .
      .
      .
      "plenty/plentymarketsCMStools-0.9.1.js"
    ]
  },
  .
  .
  .
}
```
Upload the edited file back to your webspace (you will override the existing version).

### Step 4 (alternative): Load language files in your PageDesign-templates

Open templates: `PageDesignContent`, `PageDesignCheckout`, `PageDesignMyAccount` and search for:

```html
<script>
    requireScripts( 'PageDesign$PageDesign', 'body', '{% GetGlobal('LayoutFolder'); %}/js/' );
</script>
```
**ATTENTION:** In each template you will find two similar occurrences of this snippet. Make sure that the value of the second parameter is `'body'`.

Add the following lines after each occurrence:

```html
<script>
    {% if $Lang == "de" %}
        PlentyFramework.loadLanguageFile('/lang/de_DE.json');
    {% elseif $Lang == "en" %}
        PlentyFramework.loadLanguageFile('/lang/en_EN.json');
    {% endif %}
</script>
```
**ATTENTION:** Do not wrap these calls in the same &lt;script&gt; tag. Be sure to have separate &lt;script&gt; tags for each call.


Perform **Step 5** and **Step 6** as described above.