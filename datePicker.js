"use strict";
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', "Picker"], factory);
    } else {
        factory(window.jQuery || window.Zepto || window.$, window.Picker);
    }
}(function ($, Picker) {
    var defaultOptions = {
        startDate: undefined,
        endDate: new Date(),
        mode: "dateTime",
        initialSelDate: undefined,
        onDateSelected: undefined
    };
    var calDayDate = new Date();
    $.fn.datePicker = function (options) {
        var opts = $.extend({}, defaultOptions, options);
        var yearArray;
        var monthArray;
        var dayArray;
        var hourArray;
        var minuteArray;
        var startDate = opts["startDate"];
        var endDate = opts["endDate"];
        var dateTimePicker = "dateTime" === opts["mode"];
        var pickerData;
        var selectedIndex;
        var selectedDate;
        if (!(startDate instanceof Date)) {
            startDate = new Date();
            startDate.setFullYear(2000, 0, 1);
        }
        if (!(endDate instanceof Date)) {
            endDate = new Date();
        }
        var initPickerData = function (initialSelDate) {
            pickerData = [];
            selectedIndex = [];
            selectedDate = new Date();
            yearArray = [];
            monthArray = [];
            dayArray = [];
            var startYear = startDate.getFullYear();
            var endYear = endDate.getFullYear();
            if (initialSelDate instanceof Date) {
                if (initialSelDate < startDate) {
                    selectedDate.setTime(startDate.getTime());
                } else if (initialSelDate > endDate) {
                    selectedDate.setTime(endDate.getTime());
                } else {
                    selectedDate.setTime(initialSelDate.getTime());
                }
            }
            initNumArray(yearArray, startYear, endYear, "年");
            initMonthArray(monthArray, selectedDate, startDate, endDate);
            initDayArray(dayArray, selectedDate, startDate, endDate);
            pickerData.push(yearArray);
            pickerData.push(monthArray);
            pickerData.push(dayArray);
            if (dateTimePicker) {
                hourArray = [];
                minuteArray = [];
                initHourArray(hourArray, selectedDate, startDate, endDate);
                initMinuteArray(minuteArray, selectedDate, startDate, endDate);
                pickerData.push(hourArray);
                pickerData.push(minuteArray);
            }
            initSelectedIndex(selectedIndex, startDate, selectedDate, dateTimePicker);
        };
        initPickerData(opts["initialSelDate"]);
        var picker = new Picker({
            data: pickerData, selectedIndex: selectedIndex, title: opts["title"] || "请选择时间"
        });
        picker.on('picker.select', function (selectedVal, selectedIn) {
            if (typeof opts["onDateSelected"] === 'function') {
                var selDate = new Date();
                selDate.setTime(selectedDate.getTime());
                opts["onDateSelected"](selDate);
            }
        });
        picker.on('picker.change', function (index, selectedIn) {
            if (selectedIn >= pickerData[index].length) {
                return;
            }
            selectedIndex[index] = selectedIn;
            switch (index) {
                //year
                case 0:
                    yearChange(yearArray[selectedIndex[0]].value);
                    break;
                //month
                case 1:
                    monthChange(monthArray[selectedIndex[1]].value - 1);
                    break;
                //day
                case 2:
                    dayChange(dayArray[selectedIndex[2]].value);
                    break;
                //hour
                case 3:
                    hourChange(hourArray[selectedIndex[3]].value);
                    break;
                //minute
                case 4:
                    selectedDate.setMinutes(minuteArray[selectedIndex[4]].value);
                    break
            }
        });
        function getNewSelectedIndex(array, index) {
            if (selectedIndex[index] >= array.length) {
                return array.length - 1;
            } else {
                return selectedIndex[index];
            }
        }

        function yearChange(newYear) {
            selectedDate.setFullYear(newYear, 0, 1);

            monthArray = [];
            initMonthArray(monthArray, selectedDate, startDate, endDate);
            refillColumn(1, monthArray);
            monthChange(monthArray[selectedIndex[1]].value - 1);

        }

        function monthChange(newMonth) {
            selectedDate.setFullYear(selectedDate.getFullYear(), newMonth, 1);

            dayArray = [];
            initDayArray(dayArray, selectedDate, startDate, endDate);
            refillColumn(2, dayArray);
            dayChange(dayArray[selectedIndex[2]].value);
        }

        function dayChange(newDay) {
            selectedDate.setDate(newDay);
            if (dateTimePicker !== true) {
                return;
            }
            hourArray = [];
            initHourArray(hourArray, selectedDate, startDate, endDate);
            refillColumn(3, hourArray);
            hourChange(hourArray[selectedIndex[3]].value);
        }

        function hourChange(newHour) {
            if (dateTimePicker !== true) {
                return;
            }
            selectedDate.setHours(newHour);
            minuteArray = [];
            initMinuteArray(minuteArray, selectedDate, startDate, endDate);
            refillColumn(4, minuteArray);
            selectedDate.setMinutes(minuteArray[selectedIndex[4]].value);
        }

        function refillColumn(index, array) {
            var newSelIndex = getNewSelectedIndex(array, index);
            picker.refillColumn(index, array);
            picker.scrollColumn(index, newSelIndex);
            selectedIndex[index] = newSelIndex;
            pickerData[index] = array;
        }

        this.click(function () {
            picker.show();
        });
        var reInitPickerData = function (startD, endD, initialSelD) {
            var changed = false;
            if (startD instanceof Date && startD.getTime() !== startDate.getTime()) {
                startDate.setTime(startD.getTime());
                changed = true;
            }
            if (endD instanceof Date && endD.getTime() !== startD.getTime()) {
                endDate.setTime(endD.getTime());
                changed = true;
            }
            if (changed === true || initialSelD instanceof Date) {
                initPickerData(initialSelD);
            }
        };
        var setSelectedDate = function (selectedD) {
            if (selectedD instanceof Date && selectedD.getTime() !== selectedDate.getTime()) {
                yearChange(selectedD.getFullYear());
            }
        };
        return {
            reInitPickerData: reInitPickerData,
            setSelectedDate: setSelectedDate,
            getSelectedDate: function () {
                var date = new Date();
                date.setTime(selectedDate.getTime());
                return date;
            },
            show: function () {
                picker.show();
            },
            hide: function () {
                picker.hide();
            }
        };
    };

    function initMonthArray(monthArray, selectedDate, startDate, endDate) {
        var startMonth = 1;
        if (isSameYear(selectedDate, startDate)) {
            startMonth = startDate.getMonth() + 1;
        }
        var endMonth = 12;
        if (isSameYear(selectedDate, endDate)) {
            endMonth = endDate.getMonth() + 1;
        }
        initNumArray(monthArray, startMonth, endMonth, "月");
    }

    function isSameYear(date, anotherDate) {
        return date.getYear() === anotherDate.getYear();
    }

    function isSameMonth(date, anotherDate) {
        return date.getYear()
            === anotherDate.getYear()
            && date.getMonth()
            === anotherDate.getMonth();
    }

    function isSameDay(date, anotherDate) {
        return date.getYear()
            === anotherDate.getYear()
            && date.getMonth()
            === anotherDate.getMonth()
            && date.getDate()
            === anotherDate.getDate();
    }

    function isSameHour(date, anotherDate) {
        return date.getYear()
            === anotherDate.getYear()
            && date.getMonth()
            === anotherDate.getMonth()
            && date.getDate()
            === anotherDate.getDate()
            && date.getHours()
            === anotherDate.getHours();
    }

    function initDayArray(dayArray, selectedDate, startDate, endDate) {
        if (isSameMonth(selectedDate, startDate)) {
            calDayDate.setFullYear(selectedDate.getYear(), selectedDate.getMonth(), startDate.getDate());
        } else {
            calDayDate.setFullYear(selectedDate.getYear(), selectedDate.getMonth(), 1);
        }
        var startDay = calDayDate.getDate();
        calDayDate.setFullYear(selectedDate.getYear(), selectedDate.getMonth() + 1, 0);
        var lastDay = calDayDate.getDate();
        if (isSameMonth(selectedDate, endDate)) {
            lastDay = endDate.getDate();
        }
        initNumArray(dayArray, startDay, lastDay, "日");
    }

    function initHourArray(hourArray, selectedDate, startDate, endDate) {
        var startHour = 0;
        if (isSameDay(selectedDate, startDate)) {
            startHour = startDate.getHours();
        }
        var endHour = 23;
        if (isSameDay(selectedDate, endDate)) {
            endHour = endDate.getHours();
        }
        initNumArray(hourArray, startHour, endHour, "时");
    }

    function initMinuteArray(minuteArray, selectedDate, startDate, endDate) {
        var startMinute = 0;
        if (isSameHour(selectedDate, startDate)) {
            startMinute = startDate.getMinutes();
        }
        var endMinute = 59;
        if (isSameHour(selectedDate, endDate)) {
            endMinute = endDate.getMinutes();
        }
        initNumArray(minuteArray, startMinute, endMinute, "分");
    }

    function initNumArray(array, min, max, unit) {
        if (array.length > 0) {
            array.length = 0;
        }
        for (var i = min; i <= max; i++) {
            array.push({text: i + unit, value: i});
        }
    }

    function initSelectedIndex(selectedIndex, startDate, selectedDate, dateTimePicker) {
        if (selectedIndex.length > 0) {
            selectedIndex.length = 0;
        }
        selectedIndex.push(selectedDate.getYear() - startDate.getYear());
        if (isSameYear(selectedDate, startDate)) {
            selectedIndex.push(selectedDate.getMonth() - startDate.getMonth());
        } else {
            selectedIndex.push(selectedDate.getMonth());
        }
        if (isSameMonth(selectedDate, startDate)) {
            calDayDate.setFullYear(selectedDate.getYear(), selectedDate.getMonth(), startDate.getDate());
        } else {
            calDayDate.setFullYear(selectedDate.getYear(), selectedDate.getMonth(), 1);
        }
        selectedIndex.push(selectedDate.getDate() - calDayDate.getDate());
        if (dateTimePicker === true) {
            if (isSameDay(selectedDate, startDate)) {
                selectedIndex.push(selectedDate.getHours() - startDate.getHours());
            } else {
                selectedIndex.push(selectedDate.getHours());
            }
            if (isSameHour(selectedDate, startDate)) {
                selectedIndex.push(selectedDate.getMinutes() - startDate.getMinutes());
            } else {
                selectedIndex.push(selectedDate.getMinutes());
            }
        }
    }
}));
