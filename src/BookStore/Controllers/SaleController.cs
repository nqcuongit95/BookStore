﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BookStore.Services;
using BookStore.ViewModels;
using Microsoft.AspNetCore.Identity;
using BookStore.Entities;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace BookStore.Controllers
{   
    [Authorize]
    public class SaleController : Controller
    {
        private IBookStoreData _bookStoreData;
        private UserManager<Staff> _userManager;

        public SaleController(IBookStoreData bookStoreData,
                              UserManager<Staff> userManager)
        {
            _bookStoreData = bookStoreData;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            return View("Index", user.FullName);
        }

        //find customers
        public async Task<IActionResult> FindCustomer(string val)
        {
            var result =await _bookStoreData.FindCustomer(val);

            return Json(result);    
        }

        public async Task<IActionResult> FindProduct(string keyword)
        {
            var model = await _bookStoreData.FindProduct(keyword);

            return Json(model);
            //return PartialView("_ProductResults",model);
        }
    }
}
