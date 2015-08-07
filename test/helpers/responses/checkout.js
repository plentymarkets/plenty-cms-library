var Responses = Responses || {};
Responses.GET = Responses.GET || {};

Responses.GET.checkout = {
  error: {
    code: 0,
    error_stack: [],
    message: ""
  },
  data: {
    BasketItemsList: [
      {
        BasketItemID: 982,
        BasketItemItemID: 2742,
        BasketItemQuantity: 1
      }
    ],
    CheckoutMethodOfPaymentID: 2
  }
};

Responses.GET.container_totals = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: [
        '<div data-test="">New Totals</div>'
    ]
};

Responses.GET.category_content = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: [
        '<div data-test="">New category content</div>'
    ]
};

Responses.GET.container_basketpreviewlist = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: [
        '<div data-test="">New itemview content</div>'
    ]
};