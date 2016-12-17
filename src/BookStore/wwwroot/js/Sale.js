﻿$(document).ready(function () {

    //define some global variable
    var inputEvents = 'DOMAttrModified textInput input keypress paste';

    var recentlyAddedRow;

    var totalMoneyToPay = 0;

    var priceType = 1;

    var numberInput = "<div class=\"ui tiny input count-input\" style=\"max-width: 80px\">"
                       + "<input type=\"number\" name='count' min='0'>"
                        + "</div>";

    var normalInput = "<div class=\"ui tiny input price-input\" style=\"max-width: 100px\">"
                      + "<input type=\"text\">"
                       + "</div>";

    var trashIcon = "<i class=\"trash outline link icon\" data-content=\"xóa\"></i>";

    //controls
    $(".ui.selection.dropdown").dropdown();
    $(".ui.search").on("click", 'input', function () {
        $(this).select();
    });

    //update when price-type change
    $(".ui.selection.dropdown").dropdown({
        onChange: function (value, text, choice) {

            //set global pricetype value
            priceType = value;

            var allPriceTd = $("#invoice-table tr");
            var productIds = [];
            console.log(value);

            allPriceTd.each(function (index) {

                var id = $(this).find('td:eq(0)').text();
                productIds.push(id);
                console.log(id);
            })

            updatePriceType(productIds, value);
        }
    });

    function updatePriceType(productIds, priceType) {
        $.ajax({
            type: "POST",
            url: urlPriceType,
            dataType: "json",
            traditional: true,
            data: {
                productIds: productIds,
                priceType: priceType
            },
            success: function (result, status, xhr) {
                if (status === 'success') {

                    $.each(result, function (index, value) {

                        var productRow = $('#invoice-table').find('tr').filter(function () {
                            return $(this).find('td:eq(0)').text() == value.id;
                        })

                        var priceInput = productRow.find("td:eq(3) input");
                        priceInput.val(value.price);
                        priceInput.trigger("textInput");

                    })
                }
            }
        });
    }

    $.fn.exists = function () {
        return this.length !== 0;
    }

    var g_productTable = $('.ui.bottom.attached.segment');

    $('.top.menu .item').tab();

    $('.ui.fluid.search').search({
        apiSettings: {
            url: urlSearch + "?val={query}"
        },
        fields: {
            title: 'name',
            description: 'phone'
        },
        minCharacters: 3,
        onSelect: function (result, response) {
            updateCustomer(result);
        }
    });

    function updateCustomer(result) {
        var table = $("#customer-table");

        var phone = table.find("tr:eq(0)").find("td:eq(1)");
        var address = table.find("tr:eq(1)").find("td:eq(1)");

        phone.text(result.phone);
        address.text(result.address);
    }

    //search products
    $.fn.api.settings.api = {
        'get products': urlSearchProduct,
        //'change price': urlChangePrice
    }

    $('#product-input').search({
        apiSettings: {
            action: 'get products'
        },
        cache: false,
        throttle: 200,
        fields: {
            title: 'name',
            price: 'retailPrice'
        },
        onResults: function (response) {            
            showProductsResult(response);
        },
        onSelect: function (result, response) {
            
            var tdId = $('#product-results').find('tr td:eq(0)').filter(function () {
                return $(this).text() == result.id
            });

            tdId.closest('tr').trigger('click');
        }
    })   

    function showProductsResult(response) {
        
        var table = $('#product-results');
        table.empty();       

        $.each(response.results, function (index, value) {

            var data = '<tr>';

            $.each(value, function (key, value) {
                if (value != null) {
                    data += '<td>' + value + '</td>';
                }
            })

            data += '</tr>';
            table.append(data);
        })

        return true;
    }

    //handle table row click event for adding product to invoice
    $('#products-table').on('click', 'tbody tr', function () {
        //event.preventDefault();        

        var invoice = $('#invoice-table');
        var clickedRow = $(this);

        //get the data
        var id = clickedRow.find('td:eq(0)').text();
        var name = clickedRow.find('td:eq(1)').text();
        var price = priceType == 1 ? clickedRow.find('td:eq(2)').text() :
                                      clickedRow.find('td:eq(3)').text();

        var availableProduct = clickedRow.find('td:eq(4)').text();

        //test if available product is in stock > 0
        if (availableProduct > 0) {

            //the key is to compare id of product and added product                                 
            var alreadyAdded = invoice.find('tr td').filter(function () {
                return $(this).text() == id;
            })

            //test if product already added, then increase the numbers of it;
            if (alreadyAdded.exists()) {

                var tdInputCount = alreadyAdded.closest('tr').find('td:eq(2) input');

                var count = Number(tdInputCount.val());

                count += 1;

                //check if number of products added over the available on stock
                if (count > availableProduct) {
                    count -= 1;
                    alert("buying exceed the stock");
                }
                else {

                    tdInputCount.val(count);

                    //recalculating the total money
                    var tdTotalMoney = alreadyAdded.closest('tr').find('td:eq(4)');
                    var currentPriceTd = alreadyAdded.closest('tr').find('td:eq(3) input');
                    var currentPrice = Number(currentPriceTd.val());
                    var value = count * currentPrice;
                    tdTotalMoney.text(value);

                    //update payment
                    updatePayment();
                    recalculateCustomerChange()
                }

            }
            else {
                //it's the first added product

                var row = "<tr>";
                row += "<td>" + id + "</td>";
                row += "<td>" + name + "</td>";
                row += "<td>" + numberInput + "</td>"
                row += "<td>" + normalInput + "</td>";
                row += "<td>" + price + "</td>"
                row += "<td>" + trashIcon + "</td>"
                row += "</tr>";

                invoice.append(row);

                //it's the first time added product, so the count equal to 1
                invoice.find('tr:last td:eq(2) input').val('1');
                //also set the price of product
                invoice.find('tr:last td:eq(3) input').val(price);

                //update payment
                updatePayment();

                //bind event to remove icon
                $(".trash.outline.link.icon").popup({
                    offset: -12
                });

                $(".trash.outline.link.icon").on('click', function () {
                    $(this).closest('tr').remove();
                    updatePayment();
                    recalculateCustomerChange();
                })

                //bind input event to count td;
                invoice.find('tr:last').on(inputEvents, '.count-input input', function () {

                    var inputTd = $(this);

                    var currentCount = Number(inputTd.val());

                    if (currentCount > availableProduct) {
                        alert("number of products exceed the stock");
                        inputTd.val(availableProduct);
                    }

                    if (currentCount < 0) {
                        alert("number of products must not be negative");
                        inputTd.val(0);
                    }

                    var countTd = $(this);
                    var currentPriceTd = countTd.closest('td').next().find('input');
                    var totalMoneyTd = currentPriceTd.closest('td').next();

                    calculateTotalMoney(countTd, currentPriceTd, totalMoneyTd);
                    recalculateCustomerChange();
                })

                //bind input event to price td;
                invoice.find('tr:last').on(inputEvents, '.price-input input', function () {

                    var priceTd = $(this);
                    var totalMoneyTd = priceTd.closest('td').next();
                    var currentCountTd = priceTd.closest('td').prev().find('input');

                    if (Number(priceTd.val()) < 0) {
                        alert("price must not be negative");
                        priceTd.val(0);
                    }

                    calculateTotalMoney(currentCountTd, priceTd, totalMoneyTd);
                    recalculateCustomerChange();

                })
            }

        }
        else {


        }
    })

    //set total money
    function calculateTotalMoney(count, price, total) {

        var currentCountProducts = Number(count.val());

        var currentPrice = Number(price.val());

        var totalMoney = currentPrice * currentCountProducts;

        total.text(totalMoney);

        //update payment
        updatePayment();

    }

    function updatePayment() {

        var total = 0;
        $('#invoice-table tr').each(function () {

            var value = Number($(this).find('td:eq(4)').text());

            total += value;
        })

        totalMoneyToPay = total;

        $('#payment-table tr:eq(0) td:eq(1)').text(total);

        $('#payment-table tr:eq(1) td:eq(1)').text(total);

    }

    //handle customer pay
    $('#paid-money').on(inputEvents, 'input', function () {

        var customerChangeTd = $(this).closest('tr').next().find('td:eq(1)');
        var customerPay = Number($(this).val());
        //alert(customerPay)
        var customerChange = customerPay - totalMoneyToPay;
        console.log(customerChange);
        if (customerChange > 0) {
            customerChangeTd.text(customerChange);
        }
        else {
            customerChangeTd.text('0');
        }
    })


    function recalculateCustomerChange() {

        totalMoneyToPay

        var customerPayTd = $('#paid-money input');
        var customerPay = Number(customerPayTd.val());

        var customerChangeTd = customerPayTd.closest('tr').next('tr').find('td:eq(1)');

        var customerChange = customerPay - totalMoneyToPay;

        if (customerChange > 0) {
            customerChangeTd.text(customerChange)
        }
        else {
            customerChangeTd.text(0);
        }

    }

});