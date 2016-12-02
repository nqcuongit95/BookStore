﻿// Write your Javascript code.
$(document).ready(function () {

    $('#search-input').bind("enterKey", function (e) {
        alert("fck me!");
    });

    $(".ui.fluid.dropdown").dropdown();

    $('.ui.sticky').sticky({
        context: '#context'
    });
        
    $('.ui.form')
       .form({
           on: 'blur',
           fields: {
               name: {
                   identifier: 'valid-name',
                   rules: [{
                       type: 'empty',
                       prompt: 'Tên không được để trống.'
                   }]
               },
               phone: {
                   identifier: 'valid-phone',
                   rules: [
                       {
                           type: 'empty',
                           prompt: 'Số điện thoại không được để trống.'
                       },
                       {
                           type:'minLength[10]',
                           prompt: "Vui lòng nhập đúng số điện thoại" 
                       }
                   ]
               },
               address: {
                   identifier: 'valid-address',
                   rules: [{
                       type: 'empty',
                       prompt: 'Vui lòng nhập địa chỉ.'
                   }]
               },
               email: {
                   identifier: 'valid-email',
                   rules: [{
                       type: 'email',
                       prompt: 'Vui lòng nhập đúng email.'
                   }]
               }
           }
       });

    //sortable table
    $('table').tablesort();

});