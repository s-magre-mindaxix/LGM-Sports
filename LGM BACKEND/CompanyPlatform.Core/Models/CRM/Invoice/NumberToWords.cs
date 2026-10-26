using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Invoice
{
    public static class NumberToWords
    {
        public static string ConvertAmount(decimal amount)
        {
            try
            {
                long number = (long)amount;
                long paisa = (long)((amount - number) * 100);

                string words = $"{ConvertToWords(number)} Rs.";
                if (paisa > 0)
                {
                    words += $" Point {ConvertToWords(paisa)} Paise Only";
                }
                else
                {
                    words += " Only";
                }
                return words;
            }
            catch (Exception)
            {
                return "N/A";
            }
        }

        private static string ConvertToWords(long number)
        {
            if (number == 0) return "Zero";

            if (number < 0) return "Minus " + ConvertToWords(Math.Abs(number));

            string words = "";

            if ((number / 10000000) > 0)
            {
                words += ConvertToWords(number / 10000000) + " Crore ";
                number %= 10000000;
            }
            if ((number / 100000) > 0)
            {
                words += ConvertToWords(number / 100000) + " Lakh ";
                number %= 100000;
            }
            if ((number / 1000) > 0)
            {
                words += ConvertToWords(number / 1000) + " Thousand ";
                number %= 1000;
            }
            if ((number / 100) > 0)
            {
                words += ConvertToWords(number / 100) + " Hundred ";
                number %= 100;
            }
            if (number > 0)
            {
                if (words != "") words += "and ";

                var unitsMap = new[] { "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
                var tensMap = new[] { "Zero", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

                if (number < 20) words += unitsMap[number];
                else
                {
                    words += tensMap[number / 10];
                    if ((number % 10) > 0) words += " " + unitsMap[number % 10];
                }
            }
            return words.Trim();
        }
    }
}
