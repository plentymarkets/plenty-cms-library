var Responses = Responses || {};
Responses.GET = Responses.GET || {};
Responses.POST = Responses.POST || {};

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

Responses.GET.basketItemsList = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data : [
        {
            BasketItemID : 982,
            BasketItemItemID : 2742,
            BasketItemQuantity : 2
        },
        {
            BasketItemID : 983,
            BasketItemItemID : 2312,
            BasketItemQuantity : 5
        }
    ]

};

Responses.GET.container_totals = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: [
        '<div data-plenty="Test.init(this)">New Totals</div>'
    ]
};

Responses.GET.category_content = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: [
        '<div data-plenty="Test.init(this)">New category content</div>'
    ]
};

Responses.GET.container_basketpreviewlist = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: [
        '<div data-plenty="Test.init(this)">New itemview content</div>'
    ]
};

Responses.POST.checkout = Responses.POST.checkout || {};
Responses.POST.checkout.lostPassword = {
    error: {
        code: 0,
        error_stack: [],
        message: ""
    },
    data: {
        IsMailSend: true
    }
};