﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BookStore.Services;
using BookStore.ViewModels;
using BookStore.Models;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace BookStore.Controllers
{
    public class PhieuChiController : Controller
    {
        private IBookStoreData _bookStoreData;
        public PhieuChiController(IBookStoreData bookStoreData)
        {
            _bookStoreData = bookStoreData;
        }
        public async Task<IActionResult> Index(string sortOrder, string searchString,
                                               string currentFilter, int? page,
                                               int? firstShowedPage, int? lastShowedPage)
        {
            ViewData["QueryName"] = nameof(searchString);
            ViewData["SortDirection"] = "up";

            ViewData["CurrentSort"] = sortOrder;
            ViewData["NameSortParm"] = string.IsNullOrEmpty(sortOrder) ? "name_desc" : "";
            ViewData["DateSortParm"] = sortOrder == "Date" ? "date_desc" : "Date";

            if (searchString != null)
            {
                page = 1;
            }
            else
            {
                searchString = currentFilter;
            }

            ViewData["CurrentFilter"] = searchString;

            var customers = _bookStoreData.GetAllPhieuChi();

            //if (!string.IsNullOrEmpty(searchString))
            //{
            //    customers = customers.Where(c => c.TenKhachHang.Contains(searchString));
            //}

            switch (sortOrder)
            {
                case "name_desc":
                    customers = customers.OrderByDescending(c => c.ID);
                    ViewData["SortDirection"] = "down";
                    break;
                case "Date":
                    customers = customers.OrderBy(c => c.NgayLap);
                    break;
                case "date_desc":
                    customers = customers.OrderByDescending(c => c.NgayLap);
                    break;
                default:
                    customers = customers.OrderBy(c => c.ID);
                    ViewData["SortDirection"] = "up";
                    break;
            }

            int pageSize = 9;
            int numberOfDisplayPages = 5;

            var result = await PaginatedList<PhieuChiViewModel>.
                        CreateAsync(customers, page ?? 1, pageSize,
                                    numberOfDisplayPages,
                                    firstShowedPage, lastShowedPage);
            for (int i = 0; i < result.Count; i++)
            {
                if (result[i].PhieuTraHangId.HasValue)
                {
                    result[i].DoiTuong = "Khách hàng";
                }
                else
                {
                    result[i].DoiTuong = "Nhà cung cấp";
                }
            }
            return View(result);
        }
    }
}
