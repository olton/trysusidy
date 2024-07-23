if (typeof globalThis['METRO_DISABLE_BANNER'] === 'undefined') {
    console.info(`%c
███╗   ███╗███████╗████████╗██████╗  ██████╗     ██╗   ██╗██╗
████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗    ██║   ██║██║
██╔████╔██║█████╗     ██║   ██████╔╝██║   ██║    ██║   ██║██║
██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗██║   ██║    ██║   ██║██║
██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝    ╚██████╔╝██║
╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝      ╚═════╝ ╚═╝                                                             
`, `color: #0080fe`);
}

/**
* Datetime v3.0.5. 
* Copyright 2024 by Serhii Pimenov
* Licensed under MIT
*
* Build time: 08.06.2024 20:43:59
*/

const isNum = v => !isNaN(v);

const DEFAULT_FORMAT = "YYYY-MM-DDTHH:mm:ss.sss";
const INVALID_DATE = "Invalid date";
const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|m{1,2}|s{1,3}/g;
const REGEX_FORMAT_STRFTIME = /(%[a-z])/gi;
const DEFAULT_FORMAT_STRFTIME = "%Y-%m-%dT%H:%M:%S.%Q%t";
const DEFAULT_LOCALE = {
    months: "January February March April May June July August September October November December".split(" "),
    monthsShort: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
    weekdays: "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
    weekdaysShort: "Sun Mon Tue Wed Thu Fri Sat".split(" "),
    weekdaysMin: "Su Mo Tu We Th Fr Sa".split(" "),
    weekStart: 0
};

const M = {
    ms: "Milliseconds",
    s: "Seconds",
    m: "Minutes",
    h: "Hours",
    D: "Date",
    d: "Day",
    M: "Month",
    Y: "FullYear",
    y: "Year",
    t: "Time"
};

const C = {
    ms: "ms",
    s: "second",
    m: "minute",
    h: "hour",
    D: "day",
    W: "week",
    d: "weekDay",
    M: "month",
    Y: "year",
    Y2: "year2",
    t: "time",
    c: "century",
    q: "quarter"
};

const required$1 = (m = '') => {
    throw new Error("This argument is required!")
};

const isset = (v, nullable = true) => {
    try {
        return nullable ? typeof v !== 'undefined' : typeof v !== 'undefined' && v !== null
    } catch (e) {
        return false
    }
};

const not$1 = v => typeof v === "undefined" || v === null;

const lpad$1 = function(str, pad, length){
    let _str = ""+str;
    if (length && _str.length >= length) {
        return _str;
    }
    return Array((length + 1) - _str.length).join(pad) + _str;
};

let Datetime$1 = class Datetime {
    constructor() {
        const args = [].slice.call(arguments);
        this.value = new (Function.prototype.bind.apply(Date,  [this].concat(args) ) );
        this.locale = "en";
        this.weekStart = Datetime.locales["en"].weekStart;
        this.utcMode = false;
        this.mutable = true;

        if (!isNum(this.value.getTime())) {
            throw new Error(INVALID_DATE);
        }
    }

    static locales = {
        "en": DEFAULT_LOCALE
    }

    static isDatetime(val){
        return val instanceof Datetime;
    }

    static now(asDate = false){
        return datetime$1()[asDate ? "val" : "time"]();
    }

    static parse(str = required$1()){
        return datetime$1(Date.parse(str));
    }

    static setLocale(name = required$1(), locale = required$1()){
        Datetime.locales[name] = locale;
    }

    static getLocale(name = "en"){
        return isset(Datetime.locales[name], false) ? Datetime.locales[name] : Datetime.locales["en"];
    }

    static align(date, align){
        let _date = datetime$1(date),
            result, temp;

        switch (align) {
            case C.s:  result = _date.ms(0); break; //second
            case C.m:  result = Datetime.align(_date, C.s)[C.s](0); break; //minute
            case C.h:  result = Datetime.align(_date, C.m)[C.m](0); break; //hour
            case C.D:  result = Datetime.align(_date, C.h)[C.h](0); break; //day
            case C.M:  result = Datetime.align(_date, C.D)[C.D](1); break; //month
            case C.Y:  result = Datetime.align(_date, C.M)[C.M](0); break; //year
            case C.W:  {
                temp = _date.weekDay();
                result = Datetime.align(date, C.D).addDay(-temp);
                break; // week
            }
            default: result = _date;
        }
        return result;
    }

    static alignEnd(date, align){
        let _date = datetime$1(date),
            result, temp;

        switch (align) {
            case C.ms: result = _date.ms(999); break; //second
            case C.s:  result = Datetime.alignEnd(_date, C.ms); break; //second
            case C.m:  result = Datetime.alignEnd(_date, C.s)[C.s](59); break; //minute
            case C.h:  result = Datetime.alignEnd(_date, C.m)[C.m](59); break; //hour
            case C.D:  result = Datetime.alignEnd(_date, C.h)[C.h](23); break; //day
            case C.M:  result = Datetime.alignEnd(_date, C.D)[C.D](1).add(1, C.M).add(-1, C.D); break; //month
            case C.Y:  result = Datetime.alignEnd(_date, C.D)[C.M](11)[C.D](31); break; //year
            case C.W:  {
                temp = _date.weekDay();
                result = Datetime.alignEnd(_date, 'day').addDay(6 - temp);
                break; // week
            }

            default: result = date;
        }

        return result;
    }

    immutable(v){
        this.mutable = !(not$1(v) ? true : v);
        return this;
    }

    utc(){
        this.utcMode = true;
        return this;
    }

    local(){
        this.utcMode = false;
        return this;
    }

    useLocale(val, override){
        this.locale = override ? val : !isset(Datetime.locales[val], false) ? "en" : val;
        this.weekStart = Datetime.getLocale(this.locale).weekStart;
        return this;
    }

    clone(){
        const c = datetime$1(this.value);
        c.locale = this.locale;
        c.weekStart = this.weekStart;
        c.mutable = this.mutable;
        return c;
    }

    align(to){
        if (this.mutable) {
            this.value = Datetime.align(this, to).val();
            return this;
        }

        return this.clone().immutable(false).align(to).immutable(!this.mutable);
    }

    alignEnd(to){
        if (this.mutable) {
            this.value = Datetime.alignEnd(this, to).val();
            return this;
        }

        return this.clone().immutable(false).alignEnd(to).immutable(!this.mutable);
    }

    val(val){
        if ( !(val instanceof Date) )
            return this.value;

        if (this.mutable) {
            this.value = val;
            return this;
        }

        return datetime$1(val);
    }

    year2(){
        return +(""+this.year()).substr(-2);
    }

    /* Get + Set */

    _set(m, v){
        const fn = "set" + (this.utcMode && m !== "t" ? "UTC" : "") + M[m];
        if (this.mutable) {
            this.value[fn](v);
            return this;
        }
        const clone = this.clone();
        clone.value[fn](v);
        return clone;
    }

    _get(m){
        const fn = "get" + (this.utcMode && m !== "t" ? "UTC" : "") + M[m];
        return this.value[fn]();
    }

    _work(part, val){
        if (!arguments.length || (typeof val === "undefined" || val === null)) {
            return this._get(part);
        }
        return this._set(part, val);
    }

    ms(val){ return this._work("ms", val);}
    second(val){return this._work("s", val);}
    minute(val){return this._work("m", val); }
    hour(val){return this._work("h", val);}
    day(val){return this._work("D", val);}
    month(val){return this._work("M", val);}
    year(val){return this._work("Y", val);}
    time(val){return this._work("t", val);}

    weekDay(val){
        if (!arguments.length || (not$1(val))) {
            return this.utcMode ? this.value.getUTCDay() : this.value.getDay();
        }

        const curr = this.weekDay();
        const diff = val - curr;

        this.day(this.day() + diff);

        return this;
    }

    get(unit){
        return typeof this[unit] !== "function" ? this : this[unit]();
    }

    set(unit, val){
        return typeof this[unit] !== "function" ? this : this[unit](val);
    }

    add(val, to){
        switch (to) {
            case C.h: return this.time(this.time() + (val * 60 * 60 * 1000));
            case C.m: return this.time(this.time() + (val * 60 * 1000));
            case C.s: return this.time(this.time() + (val * 1000));
            case C.ms: return this.time(this.time() + (val));
            case C.D: return this.day(this.day() + val);
            case C.W: return this.day(this.day() + val * 7);
            case C.M: return this.month(this.month() + val);
            case C.Y: return this.year(this.year() + val);
        }
    }

    addHour(v){return this.add(v,C.h);}
    addMinute(v){return this.add(v,C.m);}
    addSecond(v){return this.add(v, C.s);}
    addMs(v){return this.add(v, C.ms);}
    addDay(v){return this.add(v,C.D);}
    addWeek(v){return this.add(v,C.W);}
    addMonth(v){return this.add(v, C.M);}
    addYear(v){return this.add(v, C.Y);}

    format(fmt, locale){
        const format = fmt || DEFAULT_FORMAT;
        const names = Datetime.getLocale(locale || this.locale);
        const year = this.year(), year2 = this.year2(), month = this.month(), day = this.day(), weekDay = this.weekDay();
        const hour = this.hour(), minute = this.minute(), second = this.second(), ms = this.ms();
        const matches = {
            YY: year2,
            YYYY: year,
            M: month + 1,
            MM: lpad$1(month + 1, 0, 2),
            MMM: names.monthsShort[month],
            MMMM: names.months[month],
            D: day,
            DD: lpad$1(day, 0, 2),
            d: weekDay,
            dd: names.weekdaysMin[weekDay],
            ddd: names.weekdaysShort[weekDay],
            dddd: names.weekdays[weekDay],
            H: hour,
            HH: lpad$1(hour, 0, 2),
            m: minute,
            mm: lpad$1(minute,0, 2),
            s: second,
            ss: lpad$1(second,0, 2),
            sss: lpad$1(ms,0, 3)
        };

        return format.replace(REGEX_FORMAT, (match, $1) => $1 || matches[match]);
    }

    valueOf(){
        return this.value.valueOf();
    }

    toString(){
        return this.value.toString();
    }
};

const datetime$1 = (...args) => args && args[0] instanceof Datetime$1 ? args[0] : new Datetime$1(...args);

const fnFormat$5 = Datetime$1.prototype.format;

const buddhistMixin = {
    buddhist() {
        return this.year() + 543;
    },

    format(format, locale) {
        format = format || DEFAULT_FORMAT;
        const matches = {
            BB: (this.buddhist() + "").slice(-2),
            BBBB: this.buddhist()
        };
        let result = format.replace(/(\[[^\]]+])|B{4}|B{2}/g, (match, $1) => $1 || matches[match]);

        return fnFormat$5.bind(this)(result, locale)
    }
};

Object.assign(Datetime$1.prototype, buddhistMixin);

const createCalendar = (date, iso) => {
    let _date = date instanceof Datetime$1 ? date.clone().align("month") : datetime$1(date);
    let ws = iso === 0 || iso ? iso : date.weekStart;
    let wd = ws ? _date.isoWeekDay() : _date.weekDay();
    let names = Datetime$1.getLocale(_date.locale);
    let now = datetime$1(), i;

    const getWeekDays = (wd, ws) => {
        if (ws === 0) {
            return wd;
        }
        let su = wd[0];
        return wd.slice(1).concat([su]);
    };

    const result = {
        month: names.months[_date.month()],
        days: [],
        weekstart: iso ? 1 : 0,
        weekdays: getWeekDays(names.weekdaysMin,ws),
        today: now.format("YYYY-MM-DD"),
        weekends: [],
        week: []
    };


    _date.addDay(ws ? -wd+1 : -wd);

    for(i = 0; i < 42; i++) {
        result.days.push(_date.format("YYYY-MM-DD"));
        _date.add(1, 'day');
    }

    result.weekends = result.days.filter(function(v, i){
        const def = [0,6,7,13,14,20,21,27,28,34,35,41];
        const iso = [5,6,12,13,19,20,26,27,33,34,40,41];

        return ws === 0 ? def.includes(i) : iso.includes(i);
    });

    _date = now.clone();
    wd = ws ? _date.isoWeekDay() : _date.weekDay();
    _date.addDay(ws ? -wd+1 : -wd);
    for (i = 0; i < 7; i++) {
        result.week.push(_date.format("YYYY-MM-DD"));
        _date.add(1, 'day');
    }

    return result;
};

Object.assign(Datetime$1.prototype, {
    // 1 - Monday, 0 - Sunday
    calendar(weekStart){
        return createCalendar(this, weekStart);
    }
});

const fnFormat$4 = Datetime$1.prototype.format;

Object.assign(Datetime$1.prototype, {
    century(){
        return Math.ceil(this.year()/100);
    },

    format(format, locale){
        format = format || DEFAULT_FORMAT;

        const matches = {
            C: this.century()
        };

        let fmt = format.replace(/(\[[^\]]+])|C/g, (match, $1) => $1 || matches[match]);

        return fnFormat$4.bind(this)(fmt, locale)
    }
});

Object.assign(Datetime$1.prototype, {
    same(d){
        return this.time() === datetime$1(d).time();
    },

    /*
    * align: year, month, day, hour, minute, second, ms = default
    * */
    compare(d, align, operator = "="){
        const date = datetime$1(d);
        const curr = datetime$1(this.value);
        let t1, t2;

        operator = operator || "=";

        if (["<", ">", ">=", "<=", "=", "!="].includes(operator) === false) {
            operator = "=";
        }

        align = (align || "ms").toLowerCase();

        t1 = curr.align(align).time();
        t2 = date.align(align).time();

        switch (operator) {
            case "<":
                return t1 < t2;
            case ">":
                return t1 > t2;
            case "<=":
                return t1 <= t2;
            case ">=":
                return t1 >= t2;
            case "=":
                return t1 === t2;
            case "!=":
                return t1 !== t2;
        }
    },

    between(d1, d2){
        return this.younger(d1) && this.older(d2);
    },

    older(date, align){
        return this.compare(date, align, "<");
    },

    olderOrEqual(date, align){
        return this.compare(date, align, "<=");
    },

    younger(date, align){
        return this.compare(date, align, ">");
    },

    youngerOrEqual(date, align){
        return this.compare(date, align, ">=");
    },

    equal(date, align){
        return this.compare(date, align, "=");
    },

    notEqual(date, align){
        return this.compare(date, align, "!=");
    },

    diff(d){
        const date = datetime$1(d);
        const diff = Math.abs(this.time() - date.time());
        const diffMonth = Math.abs(this.month() - date.month() + (12 * (this.year() - date.year())));

        return {
            "ms": diff,
            "second": Math.ceil(diff / 1000),
            "minute": Math.ceil(diff / (1000 * 60)),
            "hour": Math.ceil(diff / (1000 * 60 * 60)),
            "day": Math.ceil(diff / (1000 * 60 * 60 * 24)),
            "month": diffMonth,
            "year": Math.floor(diffMonth / 12)
        }
    },

    distance(d, align){
        return this.diff(d)[align];
    }
});

Object.assign(Datetime$1.prototype, {
    isLeapYear(){
        const year = this.year();
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
});

Object.assign(Datetime$1.prototype, {
    dayOfYear(){
        const dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        const month = this.month();
        const day = this.day();
        return dayCount[month] + day + ((month > 1 && this.isLeapYear()) ? 1 : 0);
    }
});

Object.assign(Datetime$1.prototype, {
    daysInMonth(){
        const curr = datetime$1(this.value);
        return curr.add(1, 'month').day(1).add(-1, 'day').day();
    },

    daysInYear(){
        return this.isLeapYear() ? 366 : 365;
    },

    daysInYearMap(){
        const result = [];
        const curr = datetime$1(this.value);

        curr.month(0).day(1);

        for(let i = 0; i < 12; i++) {
            curr.add(1, 'month').add(-1, 'day');
            result.push(curr.day());
            curr.day(1).add(1, 'month');
        }
        return result;
    },

    daysInYearObj(locale, shortName){
        const map = this.daysInYearMap();
        const result = {};
        const names = Datetime$1.getLocale(locale || this.locale);

        map.forEach((v, i) => result[names[shortName ? 'monthsShort' : 'months'][i]] = v);

        return result;
    }
});

Object.assign(Datetime$1.prototype, {
    decade(){
        return Math.floor(this.year()/10) * 10;
    },

    decadeStart(){
        const decade = this.decade();
        const result = this.mutable ? this : this.clone();

        return result.year(decade).month(0).day(1);
    },

    decadeEnd(){
        const decade = this.decade() + 9;
        const result = this.mutable ? this : this.clone();

        return result.year(decade).month(11).day(31);
    },

    decadeOfMonth(){
        const part = this.clone().add(1, "month").day(1).add(-1, 'day').day() / 3;
        const day = this.day();

        if (day <= part) return 1;
        if (day <= part * 2) return 2;
        return 3;
    }
});

Object.assign(Datetime$1, {
    from(str, format, locale){
        let norm, normFormat, fItems, dItems;
        let iMonth, iDay, iYear, iHour, iMinute, iSecond, iMs;
        let year, month, day, hour, minute, second, ms;
        let parsedMonth;

        const getIndex = function(where, what){
            return where.map(function(el){
                return el.toLowerCase();
            }).indexOf(what.toLowerCase());
        };

        const monthNameToNumber = function(month){
            let i = -1;
            const names = Datetime$1.getLocale(locale || 'en');

            if (not$1(month)) return -1;

            i = getIndex(names.months, month);

            if (i === -1 && typeof names["monthsParental"] !== "undefined") {
                i = getIndex(names["monthsParental"], month);
            }

            if (i === -1) {
                month = month.substr(0, 3);
                i = getIndex(names.monthsShort, month);
            }

            return i === -1 ? -1 : i + 1;
        };

        const getPartIndex = function(part){
            const parts = {
                "month": ["M", "mm", "%m"],
                "day": ["D", "dd", "%d"],
                "year": ["YY", "YYYY", "yy", "yyyy", "%y"],
                "hour": ["h", "hh", "%h"],
                "minute": ["m", "mi", "i", "ii", "%i"],
                "second": ["s", "ss", "%s"],
                "ms": ["sss"]
            };

            let result = -1, key, index;

            for(let i = 0; i < parts[part].length; i++) {
                key = parts[part][i];
                index = fItems.indexOf(key);
                if (index !== -1) {
                    result = index;
                    break;
                }
            }

            return result;
        };

        if (!format) {
            return datetime$1();
        }

        /* eslint-disable-next-line */
        norm = str.replace(/[\/,.:\s]/g, '-');
        /* eslint-disable-next-line */
        normFormat = format.toLowerCase().replace(/[^a-zA-Z0-9%]/g, '-');
        fItems = normFormat.split('-');
        dItems = norm.split('-');

        if (norm.replace(/-/g,"").trim() === "") {
            throw new Error(INVALID_DATE);
        }

        iMonth = getPartIndex("month");
        iDay = getPartIndex("day");
        iYear = getPartIndex("year");
        iHour = getPartIndex("hour");
        iMinute = getPartIndex("minute");
        iSecond = getPartIndex("second");
        iMs = getPartIndex("ms");

        if (iMonth > -1 && dItems[iMonth]) {
            if (isNaN(parseInt(dItems[iMonth]))) {
                dItems[iMonth] = monthNameToNumber(dItems[iMonth]);
                if (dItems[iMonth] === -1) {
                    iMonth = -1;
                }
            } else {
                parsedMonth = parseInt(dItems[iMonth]);
                if (parsedMonth < 1 || parsedMonth > 12) {
                    iMonth = -1;
                }
            }
        } else {
            iMonth = -1;
        }

        year  = iYear > -1 && dItems[iYear] ? dItems[iYear] : 0;
        month = iMonth > -1 && dItems[iMonth] ? dItems[iMonth] : 1;
        day   = iDay > -1 && dItems[iDay] ? dItems[iDay] : 1;

        hour    = iHour > -1 && dItems[iHour] ? dItems[iHour] : 0;
        minute  = iMinute > -1 && dItems[iMinute] ? dItems[iMinute] : 0;
        second  = iSecond > -1 && dItems[iSecond] ? dItems[iSecond] : 0;
        ms  = iMs > -1 && dItems[iMs] ? dItems[iMs] : 0;

        return datetime$1(year, month-1, day, hour, minute, second, ms);
    }
});

const fnFormat$3 = Datetime$1.prototype.format;

Object.assign(Datetime$1.prototype, {
    ampm(isLowerCase){
        let val = this.hour() < 12 ? "AM" : "PM";
        return isLowerCase ? val.toLowerCase() : val;
    },

    hour12: function(h, p){
        let hour = h;

        if (arguments.length === 0) {
            return this.hour() % 12;
        }

        p = p || 'am';

        if (p.toLowerCase() === "pm") {
            hour += 12;
        }

        return this.hour(hour);
    },

    format: function(format, locale){
        let matches, result, h12 = this.hour12();

        format = format || DEFAULT_FORMAT;

        matches = {
            a: "["+this.ampm(true)+"]",
            A: "["+this.ampm(false)+"]",
            h: h12,
            hh: lpad$1(h12, 0, 2)
        };

        result = format.replace(/(\[[^\]]+])|a|A|h{1,2}/g, (match, $1) => $1 || matches[match]);

        return fnFormat$3.bind(this)(result, locale)
    }
});

const fnFormat$2 = Datetime$1.prototype.format;
const fnAlign$1 = Datetime$1.align;
const fnAlignEnd$1 = Datetime$1.alignEnd;

Object.assign(Datetime$1, {
    align(d, align) {
        let date = datetime$1(d), result, temp;

        switch(align) {
            case "isoWeek":
                temp = date.isoWeekDay();
                result = fnAlign$1(date, 'day').addDay(-temp + 1);
                break; // isoWeek

            default: result = fnAlign$1.apply(undefined, [date, align]);
        }

        return result;
    },

    alignEnd (d, align) {
        let date = datetime$1(d), result, temp;

        switch(align) {
            case "isoWeek":
                temp = date.isoWeekDay();
                result = fnAlignEnd$1(date, 'day').addDay(7 - temp);
                break; // isoWeek

            default: result = fnAlignEnd$1.apply(undefined, [date, align]);
        }

        return result;
    }
});

Object.assign(Datetime$1.prototype, {
    isoWeekDay(val){
        let wd = (this.weekDay() + 6) % 7 + 1;

        if (!arguments.length || (not$1(val))) {
            return wd;
        }

        return this.addDay(val - wd);
    },

    format(format, locale){
        format = format || DEFAULT_FORMAT;
        const matches = {
            I: this.isoWeekDay()
        };
        let result = format.replace(/(\[[^\]]+])|I{1,2}/g, (match, $1) => $1 || matches[match]);
        return fnFormat$2.bind(this)(result, locale)
    }
});

Object.assign(Datetime$1, {
    max(){
        let arr = [].slice.call(arguments);
        return arr.map((el) => datetime$1(el)).sort((a, b) => b.time() - a.time())[0];
    }
});

Object.assign(Datetime$1.prototype, {
    max(){
        return Datetime$1.max.apply(this, [this].concat([].slice.call(arguments)));
    }
});

Object.assign(Datetime$1, {
    min(){
        let arr = [].slice.call(arguments);
        return arr.map((el) => datetime$1(el)).sort((a, b) => a.time() - b.time())[0];
    }
});

Object.assign(Datetime$1.prototype, {
    min(){
        return Datetime$1.min.apply(this, [this].concat([].slice.call(arguments)));
    }
});

const fnAlign = Datetime$1.align;
const fnAlignEnd = Datetime$1.alignEnd;
const fnAdd = Datetime$1.prototype.add;

Object.assign(Datetime$1, {
    align(d, align){
        let date = datetime$1(d), result;

        switch(align) {
            case "quarter":  result = Datetime$1.align(date, 'day').day(1).month(date.quarter() * 3 - 3); break; //quarter
            default: result = fnAlign.apply(this, [date, align]);
        }

        return result;
    },

    alignEnd(d, align){
        let date = datetime$1(d), result;

        switch(align) {
            case "quarter":  result = Datetime$1.align(date, 'quarter').add(3, 'month').add(-1, 'ms'); break; //quarter
            default: result = fnAlignEnd.apply(this, [date, align]);
        }

        return result;
    }
});

Object.assign(Datetime$1.prototype, {
    quarter(){
        const month = this.month();

        if (month <= 2) return 1;
        if (month <= 5) return 2;
        if (month <= 8) return 3;
        return 4;
    },

    add(val, to){
        if (to === "quarter") {
            return this.month(this.month() + val * 3);
        }
        return fnAdd.bind(this)(val, to);
    },

    addQuarter(v){
        return this.add(v, "quarter");
    }
});

Object.assign(Datetime$1, {
    sort(arr, opt){
        let result, _arr;
        const o = {};

        if (typeof opt === "string" || typeof opt !== "object" || not$1(opt)) {
            o.format = DEFAULT_FORMAT;
            o.dir = opt && opt.toUpperCase() === "DESC" ? "DESC" : "ASC";
            o.returnAs = "datetime";
        } else {
            o.format = opt.format || DEFAULT_FORMAT;
            o.dir = (opt.dir || "ASC").toUpperCase();
            o.returnAs = opt.format ? "string" : opt.returnAs || "datetime";
        }

        _arr =  arr.map((el) => datetime$1(el)).sort((a, b) => a.valueOf() - b.valueOf());

        if (o.dir === "DESC") {
            _arr.reverse();
        }

        switch (o.returnAs) {
            case "string":
                result = _arr.map((el) => el.format(o.format));
                break;
            case "date":
                result = _arr.map((el) => el.val());
                break;

            default: result = _arr;
        }

        return result;
    }
});

const fnFormat$1 = Datetime$1.prototype.format;

Object.assign(Datetime$1.prototype, {
    utcOffset(){
        return this.value.getTimezoneOffset();
    },

    timezone(){
        return this.toTimeString().replace(/.+GMT([+-])(\d{2})(\d{2}).+/, '$1$2:$3');
    },

    timezoneName(){
        return this.toTimeString().replace(/.+\((.+?)\)$/, '$1');
    },

    format(format, locale){
        format = format || DEFAULT_FORMAT;

        const matches = {
            Z: this.utcMode ? "Z" : this.timezone(),
            ZZ: this.timezone().replace(":", ""),
            ZZZ: "[GMT]"+this.timezone(),
            z: this.timezoneName()
        };

        let result = format.replace(/(\[[^\]]+])|Z{1,3}|z/g, (match, $1) => $1 || matches[match]);

        return fnFormat$1.bind(this)(result, locale)
    }
});

const fnFormat = Datetime$1.prototype.format;

Object.assign(Datetime$1.prototype, {
    // TODO Need optimisation
    weekNumber (weekStart) {
        let nYear, nday, newYear, day, daynum, weeknum;

        weekStart = +weekStart || 0;
        newYear = datetime$1(this.year(), 0, 1);
        day = newYear.weekDay() - weekStart;
        day = (day >= 0 ? day : day + 7);
        daynum = Math.floor(
            (this.time() - newYear.time() - (this.utcOffset() - newYear.utcOffset()) * 60000) / 86400000
        ) + 1;

        if(day < 4) {
            weeknum = Math.floor((daynum + day - 1) / 7) + 1;
            if(weeknum > 52) {
                nYear = datetime$1(this.year() + 1, 0, 1);
                nday = nYear.weekDay() - weekStart;
                nday = nday >= 0 ? nday : nday + 7;
                weeknum = nday < 4 ? 1 : 53;
            }
        }
        else {
            weeknum = Math.floor((daynum + day - 1) / 7);
        }
        return weeknum;
    },

    isoWeekNumber(){
        return this.weekNumber(1);
    },

    weeksInYear(weekStart){
        const curr = datetime$1(this.value);
        return curr.month(11).day(31).weekNumber(weekStart);
    },

    format: function(format, locale){
        let matches, result, wn = this.weekNumber(), wni = this.isoWeekNumber();

        format = format || DEFAULT_FORMAT;

        matches = {
            W: wn,
            WW: lpad$1(wn, 0, 2),
            WWW: wni,
            WWWW: lpad$1(wni, 0, 2)
        };

        result = format.replace(/(\[[^\]]+])|W{1,4}/g, (match, $1) => $1 || matches[match]);

        return fnFormat.bind(this)(result, locale)
    }
});

Object.assign(Datetime$1.prototype, {
    strftime(fmt, locale){
        const format = fmt || DEFAULT_FORMAT_STRFTIME;
        const names = Datetime$1.getLocale(locale || this.locale);
        const year = this.year(), year2 = this.year2(), month = this.month(), day = this.day(), weekDay = this.weekDay();
        const hour = this.hour(), hour12 = this.hour12(), minute = this.minute(), second = this.second(), ms = this.ms(), time = this.time();
        const aDay = lpad$1(day, 0, 2),
            aMonth = lpad$1(month + 1, 0, 2),
            aHour = lpad$1(hour, 0, 2),
            aHour12 = lpad$1(hour12, 0, 2),
            aMinute = lpad$1(minute, 0, 2),
            aSecond = lpad$1(second, 0, 2),
            aMs = lpad$1(ms, 0, 3);

        const that = this;

        const thursday = function(){
            return datetime$1(that.value).day(that.day() - ((that.weekDay() + 6) % 7) + 3);
        };

        const matches = {
            '%a': names.weekdaysShort[weekDay],
            '%A': names.weekdays[weekDay],
            '%b': names.monthsShort[month],
            '%h': names.monthsShort[month],
            '%B': names.months[month],
            '%c': this.toString().substring(0, this.toString().indexOf(" (")),
            '%C': this.century(),
            '%d': aDay,
            '%D': [aDay, aMonth, year].join("/"),
            '%e': day,
            '%F': [year, aMonth, aDay].join("-"),
            '%G': thursday().year(),
            '%g': (""+thursday().year()).slice(2),
            '%H': aHour,
            '%I': aHour12,
            '%j': lpad$1(this.dayOfYear(), 0, 3),
            '%k': aHour,
            '%l': aHour12,
            '%m': aMonth,
            '%n': month + 1,
            '%M': aMinute,
            '%p': this.ampm(),
            '%P': this.ampm(true),
            '%s': Math.round(time / 1000),
            '%S': aSecond,
            '%u': this.isoWeekDay(),
            '%V': this.isoWeekNumber(),
            '%w': weekDay,
            '%x': this.toLocaleDateString(),
            '%X': this.toLocaleTimeString(),
            '%y': year2,
            '%Y': year,
            '%z': this.timezone().replace(":", ""),
            '%Z': this.timezoneName(),
            '%r': [aHour12, aMinute, aSecond].join(":") + " " + this.ampm(),
            '%R': [aHour, aMinute].join(":"),
            "%T": [aHour, aMinute, aSecond].join(":"),
            "%Q": aMs,
            "%q": ms,
            "%t": this.timezone()
        };

        return format.replace(
            REGEX_FORMAT_STRFTIME,
            (match) => (matches[match] === 0 || matches[match] ? matches[match] : match)
        );
    }
});

Object.assign(Datetime$1, {
    isToday(date){
        const d = datetime$1(date).align("day");
        const c = datetime$1().align('day');

        return d.time() === c.time();
    }
});

Object.assign(Datetime$1.prototype, {
    isToday(){
        return Datetime$1.isToday(this);
    },

    today(){
        const now = datetime$1();

        if (!this.mutable) {
            return now;
        }
        return this.val(now.val());
    }
});

Object.assign(Datetime$1, {
    isTomorrow(date){
        const d = datetime$1(date).align("day");
        const c = datetime$1().align('day').add(1, 'day');

        return d.time() === c.time();
    }
});

Object.assign(Datetime$1.prototype, {
    isTomorrow(){
        return Datetime$1.isTomorrow(this);
    },

    tomorrow(){
        if (!this.mutable) {
            return this.clone().immutable(false).add(1, 'day').immutable(!this.mutable);
        }
        return this.add(1, 'day');
    }
});

Object.assign(Datetime$1.prototype, {
    toDateString(){
        return this.value.toDateString();
    },

    toISOString(){
        return this.value.toISOString();
    },

    toJSON(){
        return this.value.toJSON();
    },

    toGMTString(){
        return this.value.toGMTString();
    },

    toLocaleDateString(){
        return this.value.toLocaleDateString();
    },

    toLocaleString(){
        return this.value.toLocaleString();
    },

    toLocaleTimeString(){
        return this.value.toLocaleTimeString();
    },

    toTimeString(){
        return this.value.toTimeString();
    },

    toUTCString(){
        return this.value.toUTCString();
    },

    toDate(){
        return new Date(this.value);
    }
});

Object.assign(Datetime$1, {
    timestamp(){
        return new Date().getTime() / 1000;
    }
});

Object.assign(Datetime$1.prototype, {
    unix(val) {
        let _val;

        if (!arguments.length || (not$1(val))) {
            return Math.floor(this.valueOf() / 1000)
        }

        _val = val * 1000;

        if (this.mutable) {
            return this.time(_val);
        }

        return datetime$1(this.value).time(_val);
    },

    timestamp(){
        return this.unix();
    }
});

Object.assign(Datetime$1, {
    isYesterday(date){
        const d = datetime$1(date).align("day");
        const c = datetime$1().align('day').add(-1, 'day');

        return d.time() === c.time();
    }
});

Object.assign(Datetime$1.prototype, {
    isYesterday(){
        return Datetime$1.isYesterday(this);
    },

    yesterday(){
        if (!this.mutable) {
            return this.clone().immutable(false).add(-1, 'day').immutable(!this.mutable);
        }
        return this.add(-1, 'day');
    }
});

const getResult = (val) => {
    let res;
    let seconds = Math.floor(val / 1000),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60),
        days = Math.floor(hours / 24),
        months = Math.floor(days / 30),
        years = Math.floor(months / 12);

    if (years >= 1) res =  `${years} year`;
    if (months >= 1 && years < 1) res =  `${months} mon`;
    if (days >= 1 && days <= 30) res =  `${days} days`;
    if (hours && hours < 24) res =  `${hours} hour`;
    if (minutes && (minutes >= 40 && minutes < 60)) res =  "less a hour";
    if (minutes && minutes < 40) res =  `${minutes} min`;
    if (seconds && seconds >= 30 && seconds < 60) res =  `${seconds} sec`;
    if (seconds < 30) res =  `few sec`;

    return res
};

Object.assign(Datetime$1, {
    timeLapse(d) {
        let old = datetime$1(d),
            now = datetime$1(),
            val = now - old;

        return getResult(val)
    }
});

Object.assign(Datetime$1.prototype, {
    timeLapse() {
        let val = datetime$1() - +this;
        return getResult(val)
    }
});

const ParseTimeMixin = {
    parseTime (t) {
        if (!isNaN(t)) return Math.abs(+t)
        const pattern = /([0-9]+d)|([0-9]{1,2}h)|([0-9]{1,2}m)|([0-9]{1,2}s)/gm;
        const match = t.match(pattern);
        return match.reduce( (acc, val) => {
            let res;

            if (val.includes('d')) {
                res = 1000 * 60 * 60 * 24 * parseInt(val);
            } else if (val.includes('h')) {
                res = 1000 * 60 * 60 * parseInt(val);
            } else if (val.includes('m')) {
                res = 1000 * 60 * parseInt(val);
            } else if (val.includes('s')) {
                res = 1000 * parseInt(val);
            }

            return acc + res
        }, 0 )
    }
};

Object.assign(Datetime$1, ParseTimeMixin);

const version$6 = "3.0.5";
const build_time$6 = "08.06.2024, 20:43:59";

const info$6 = () => {
    console.info(`%c Datetime Library %c v${version$6} %c ${build_time$6} `, "color: #ffffff; font-weight: bold; background: #003152", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

Datetime$1.info = info$6;

globalThis.Datetime = Datetime$1;
globalThis.datetime = datetime$1

;(function() {

    var getLocale = Datetime$1.getLocale;

    Datetime$1.getLocale = function(locale){
        var data;

        if (!Metro) {
            locale = 'en';
            return getLocale.call(this, locale);
        }

        if (!Metro.locales[locale]) {
            locale = "en-US";
        }

        data = Metro.locales[locale]['calendar'];

        return {
            months: data.months.filter( function(el, i){ return i < 12} ),
            monthsShort: data.months.filter( function(el, i){ return i > 11} ),
            weekdays: data.days.filter( function(el, i){ return i < 7} ),
            weekdaysShort: data.days.filter( function(el, i){ return i > 13} ),
            weekdaysMin: data.days.filter( function(el, i){ return i > 6 && i < 14} ),
            weekStart: data.weekStart
        }
    };
}());

/*!
 * String - String routines
 * Copyright 2024 by Serhii Pimenov
 * Licensed under MIT
 !*/

/**
 * A regular expression string matching digits
 */
const digit = '\\d';

/**
 * A regular expression string matching whitespace
 */
const whitespace = '\\s\\uFEFF\\xA0';

/**
 * A regular expression string matching diacritical mark
 */
const diacriticalMark = '\\u0300-\\u036F\\u1AB0-\\u1AFF\\u1DC0-\\u1DFF\\u20D0-\\u20FF\\uFE20-\\uFE2F';

/**
 * A regular expression to match the General Punctuation Unicode block
 */
const generalPunctuationBlock = '\\u2000-\\u206F';

/**
 * A regular expression to match non characters from from Basic Latin and Latin-1 Supplement Unicode blocks
 */
const nonCharacter = '\\x00-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7b-\\xBF\\xD7\\xF7';

/**
 * A regular expression to match the dingbat Unicode block
 */
const dingbatBlock = '\\u2700-\\u27BF';

/**
 * A regular expression string that matches lower case letters: LATIN
 */
const lowerCaseLetter = 'a-z\\xB5\\xDF-\\xF6\\xF8-\\xFF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F';

/**
 * A regular expression string that matches upper case letters: LATIN
 */
const upperCaseLetter = '\\x41-\\x5a\\xc0-\\xd6\\xd8-\\xde\\u0100\\u0102\\u0104\\u0106\\u0108\\u010a\\u010c\\u010e\\u0110\\u0112\\u0114\\u0116\\u0118\\u011a\\u011c\\u011e\\u0120\\u0122\\u0124\\u0126\\u0128\\u012a\\u012c\\u012e\\u0130\\u0132\\u0134\\u0136\\u0139\\u013b\\u013d\\u013f\\u0141\\u0143\\u0145\\u0147\\u014a\\u014c\\u014e\\u0150\\u0152\\u0154\\u0156\\u0158\\u015a\\u015c\\u015e\\u0160\\u0162\\u0164\\u0166\\u0168\\u016a\\u016c\\u016e\\u0170\\u0172\\u0174\\u0176\\u0178\\u0179\\u017b\\u017d\\u0181\\u0182\\u0184\\u0186\\u0187\\u0189-\\u018b\\u018e-\\u0191\\u0193\\u0194\\u0196-\\u0198\\u019c\\u019d\\u019f\\u01a0\\u01a2\\u01a4\\u01a6\\u01a7\\u01a9\\u01ac\\u01ae\\u01af\\u01b1-\\u01b3\\u01b5\\u01b7\\u01b8\\u01bc\\u01c4\\u01c5\\u01c7\\u01c8\\u01ca\\u01cb\\u01cd\\u01cf\\u01d1\\u01d3\\u01d5\\u01d7\\u01d9\\u01db\\u01de\\u01e0\\u01e2\\u01e4\\u01e6\\u01e8\\u01ea\\u01ec\\u01ee\\u01f1\\u01f2\\u01f4\\u01f6-\\u01f8\\u01fa\\u01fc\\u01fe\\u0200\\u0202\\u0204\\u0206\\u0208\\u020a\\u020c\\u020e\\u0210\\u0212\\u0214\\u0216\\u0218\\u021a\\u021c\\u021e\\u0220\\u0222\\u0224\\u0226\\u0228\\u022a\\u022c\\u022e\\u0230\\u0232\\u023a\\u023b\\u023d\\u023e\\u0241\\u0243-\\u0246\\u0248\\u024a\\u024c\\u024e';

/**
 * Regular expression to match whitespaces from the left side
 */
const REGEXP_TRIM_LEFT = new RegExp('^[' + whitespace + ']+');

/**
 * Regular expression to match whitespaces from the right side
 */
const REGEXP_TRIM_RIGHT = new RegExp('[' + whitespace + ']+$');

/**
 * Regular expression to match digit characters
 */
const REGEXP_DIGIT = new RegExp('^' + digit + '+$');

/**
 * Regular expression to match HTML special characters.
 */
const REGEXP_HTML_SPECIAL_CHARACTERS = /[<>&"'`]/g;
const REGEXP_TAGS = /(<([^>]+)>)/ig;

/**
 * Regular expression to match Unicode words
 */
const REGEXP_WORD = new RegExp(
    '(?:[' +
    upperCaseLetter +
    '][' +
    diacriticalMark +
    ']*)?(?:[' +
    lowerCaseLetter +
    '][' +
    diacriticalMark +
    ']*)+|\
(?:[' +
    upperCaseLetter +
    '][' +
    diacriticalMark +
    ']*)+(?![' +
    lowerCaseLetter +
    '])|\
[' +
    digit +
    ']+|\
[' +
    dingbatBlock +
    ']|\
[^' +
    nonCharacter +
    generalPunctuationBlock +
    whitespace +
    ']+',
    'g'
);

/**
 * Regular expression to match words from Basic Latin and Latin-1 Supplement blocks
 */
const REGEXP_LATIN_WORD = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

/**
 * Regular expression to match alpha characters
 */
const REGEXP_ALPHA = new RegExp('^(?:[' + lowerCaseLetter + upperCaseLetter + '][' + diacriticalMark + ']*)+$');

/**
 * Regular expression to match alpha and digit characters
 */
const REGEXP_ALPHA_DIGIT = new RegExp(
    '^((?:[' + lowerCaseLetter + upperCaseLetter + '][' + diacriticalMark + ']*)|[' + digit + '])+$'
);

/**
 * Regular expression to match Extended ASCII characters, i.e. the first 255
 */
const REGEXP_EXTENDED_ASCII = /^[\x01-\xFF]*$/;

const toStr = (val, def = "") => {
    if (!val) return def;
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join("");
    return JSON.stringify(val);
};

const nvl = (a, b) => {
    return (typeof a === "undefined" || a === null) ? b : a
};

/*
* Split string to words. You can set specified patter to split
* */
const words = (s, pattern, flags) => {
    let regexp;

    if (!pattern) {
        regexp = REGEXP_EXTENDED_ASCII.test(s) ? REGEXP_LATIN_WORD : REGEXP_WORD;
    } else if (pattern instanceof RegExp) {
        regexp = pattern;
    } else {
        regexp = new RegExp(pattern, nvl(flags, ''));
    }

    return nvl(toStr(s).match(regexp), []);
};

const capitalize = (s, strong = false) => {
    let _s = toStr(s);
    let last = (_s).substr(1);
    return (_s).substr(0, 1).toUpperCase() + (strong ? last.toLowerCase() : last)
};

const camelCase$2 = s => {
    return words(toStr(s)).map( (el, i) => {
        return i === 0 ? el.toLowerCase() : capitalize(el)
    } ).join("")
};

const dashedName$1 = s => words(toStr(s)).map( (el) => el.toLowerCase() ).join("-");

const decapitalize = s => {
    let _s = toStr(s);
    return (_s).substr(0, 1).toLowerCase() + (_s).substr(1)
};

const kebab = (s, joinWith = '-') => words(toStr(s)).map( el => el.toLowerCase() ).join(joinWith);

const lower = s => toStr(s).toLowerCase();

/*
* Split string to chars array with ignores
* */
const chars$1 = (s, ignore = []) => (toStr(s)).split("").filter( (el) => !ignore.includes(el));

const reverse = (s, ignore) => chars$1(toStr(s), ignore).reverse().join("");

const shuffleArray = (a = []) => {
  let _a = [...a];
  let i = _a.length, t, r;

  while (0 !== i) {
    r = Math.floor(Math.random() * i);
    i -= 1;
    t = _a[i];
    _a[i] = _a[r];
    _a[r] = t;
  }

  return _a;
};

const shuffle = s => shuffleArray(toStr(s).split("")).join("");

const snake = s => words(toStr(s)).map( el => el.toLowerCase() ).join("_");

const _swap = (swapped, char) => {
    const lc = char.toLowerCase();
    const uc = char.toUpperCase();

    return swapped + (char === lc ? uc : lc)
};

const swap = s => toStr(s).split("").reduce(_swap, '');

const title$1 = (s, noSplit, sep = "") => {
    let _s = toStr(s);
    const regexp = REGEXP_EXTENDED_ASCII.test(_s) ? REGEXP_LATIN_WORD : REGEXP_WORD;
    const noSplitArray = Array.isArray(noSplit) ? noSplit : typeof noSplit !== "string" ?  [] : noSplit.split(sep);

    return s.replace(regexp, (w, i) => {
        const isNoSplit = i && noSplitArray.includes(_s[i - 1]);
        return isNoSplit ? lower(w) : capitalize(w);
    })
};

const upper = s => toStr(s).toUpperCase();

/*
* Get string length
* */
const count = s => toStr(s).length;

const uniqueArray = (a = []) => {
    let _a = [...a];
    for (let i = 0; i < _a.length; ++i) {
        for (let j = i + 1; j < _a.length; ++j) {
            if (_a[i] === _a[j])
                _a.splice(j--, 1);
        }
    }

    return _a;
};

const countChars = (s, ignore) => chars$1(s, ignore).length;
const countUniqueChars = (s, ignore) => uniqueArray(chars$1(s, ignore)).length;

const countSubstr = (s, sub = "") => {
    let _s = toStr(s);
    let _sub = toStr(sub);
    return _s === '' || _sub === '' ? 0 : _s.split(_sub).length - 1;
};

const countWords = (s, pattern, flags) => words(s, pattern, flags).length;
const countUniqueWords = (s, pattern, flags) => uniqueArray(words(s, pattern, flags)).length;

const escapeCharactersMap = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
};

function replaceSpecialCharacter(character) {
    return escapeCharactersMap[character];
}

const escapeHtml = s => toStr(s).replace(REGEXP_HTML_SPECIAL_CHARACTERS, replaceSpecialCharacter);

const unescapeCharsMap = {
    '<': /(&lt;)|(&#x0*3c;)|(&#0*60;)/gi,
    '>': /(&gt;)|(&#x0*3e;)|(&#0*62;)/gi,
    '&': /(&amp;)|(&#x0*26;)|(&#0*38;)/gi,
    '"': /(&quot;)|(&#x0*22;)|(&#0*34;)/gi,
    "'": /(&#x0*27;)|(&#0*39;)/gi,
    '`': /(&#x0*60;)|(&#0*96;)/gi,
};
const chars = Object.keys(unescapeCharsMap);

function reduceUnescapedString(string, key) {
    return string.replace(unescapeCharsMap[key], key);
}

const unescapeHtml = s => chars.reduce(reduceUnescapedString, toStr(s));

const unique = (s, ignore) => uniqueArray(chars$1(s, ignore)).join("");

const uniqueWords = (s, pattern, flags) => uniqueArray(words(s, pattern, flags)).join("");

/*
* Get substring from string.
* */
const substring = (s, start, len) => toStr(s).substring(start, len);

/*
* Get N first chars from string.
* */
const first = (s, len = 0) => substring(toStr(s), 0, len);

/*
* Get N last chars from string.
* */
const last = (s, len = 0) => {
  let _s = toStr(s);
  return _s ? substring(_s, _s.length - len) : '';
};

const MAX_SAFE_INTEGER = 0x1fffffffffffff;
const BYTE_ORDER_MARK = '\uFEFF';

const clip = (val, min, max = MAX_SAFE_INTEGER) => {
    if (val < min) return min;
    if (val > max) return max;
    return val;
};

const toInt = val => {
    if (val === Infinity) return MAX_SAFE_INTEGER;
    if (val === -Infinity) return -MAX_SAFE_INTEGER;
    return ~~val;
};

/*
* Truncates `subject` to a new `length` with specified ending.
* */
const truncate = (s, len = 0, end = '...') => {
  let _s = toStr(s);
  let _len = !len ? _s.length : clip(toInt(len), 0, MAX_SAFE_INTEGER);

  return substring(_s, 0, _len) + (_s.length === _len ? '' : end)
};

const truncateWithAlign = (s, len = 0, end = '...') => {
  const truncatedText = truncate(s, len, '');
  return truncatedText.slice(s, truncatedText.lastIndexOf(" ")) + end
};

/*
* Slice string to N parts.
* */
const slice = (s, parts = 1) => {
  let _s = toStr(s);
  let res = [];
  let len = Math.round(_s.length / parts);

  for(let i = 0; i < parts; i++) {
    res.push(
      substring(_s, i * len, len)
    );
  }

  return res
};

/*
* Truncates `subject` to a new `length` and does not break the words with specified ending.
* */
const prune = (s, len = 0, end = "") => {
    let _s = toStr(s);
    let _len = !len ? _s.length : clip(toInt(len), 0, MAX_SAFE_INTEGER);
    let _truncatedLen = 0;
    const pattern = REGEXP_EXTENDED_ASCII.test(_s) ? REGEXP_LATIN_WORD : REGEXP_WORD;

    _s.replace(pattern, (word, offset) => {
        const wordLength = offset + word.length;
        if (wordLength <= _len - end.length) {
            _truncatedLen = wordLength;
        }
    });

    return _s.substring(0, _truncatedLen) + end;
};

const repeat = (s, times = 0) => {
    let _s = toStr(s);
    let _times = !times ? _s.length : clip(toInt(times), 0, MAX_SAFE_INTEGER);
    const _origin = _s;

    if (times === 0) {
        return "";
    }

    for(let i = 0; i < _times - 1; i++) {
        _s += _origin;
    }

    return _s
};

const padBuilder = (pad, len = 0) => {
    const padLength = pad.length;
    const length = len - padLength;

    return repeat(pad, length + 1).substring(0, len)
};

const _pad = (s, pad = "", len = 0, left = false) => {
    let _s = toStr(s);
    let _len = !len ? _s.length : clip(toInt(len), 0, MAX_SAFE_INTEGER);
    let _padLen = pad.length;
    let _paddingLen = _len - _s.length;
    let _sideLen = _paddingLen;

    if (_paddingLen <= 0 || _padLen === 0) {return _s}

    let pads = padBuilder(pad, _sideLen);

    return left ? pads + _s : _s + pads
};

const lpad = (s, pad = ' ', len = 0) => {
    return _pad(s, pad, len,  true)
};

const rpad = (s, pad = ' ', len = 0) => {
    return _pad(s, pad, len, false)
};

const pad = (s, pad = '', len = 0) => {
    let _s = toStr(s);
    let _len = !len ? _s.length : clip(toInt(len), 0, MAX_SAFE_INTEGER);
    let _padLen = pad.length;
    let _paddingLen = _len - _s.length;
    let _sideLen = toInt(_paddingLen / 2); //?
    let _remainingLen = _paddingLen % 2; //?

    if (_paddingLen <= 0 || _padLen === 0) {return _s}

    return padBuilder(pad, _sideLen) + _s + padBuilder(pad, _sideLen + _remainingLen) //?
};

const insert = (s, sbj = '', pos = 0) => {
    let _s = toStr(s);
    return _s.substring(0, pos) + sbj + _s.substring(pos)
};

const reduce = Array.prototype.reduce;
const reduceRight = Array.prototype.reduceRight;

const trim = (s, ws) => ltrim(rtrim(s, ws), ws);

const ltrim = (s, ws) => {
    let _s = toStr(s);

    if (!ws) {return _s.replace(REGEXP_TRIM_LEFT, '')}
    if (ws === '' || _s === '') {return _s}
    if (typeof ws !== "string") {ws = '';}

    let match = true;

    return reduce.call(
        _s,
        (trimmed, char) => {
            if (match && ws.includes(char)) {
                return trimmed;
            }
            match = false;
            return trimmed + char
        },
        ''
    );
};

const rtrim = (s, ws) => {
    let _s = toStr(s);

    if (!ws) {return _s.replace(REGEXP_TRIM_RIGHT, '')}
    if (ws === '' || _s === '') {return _s}
    if (typeof ws !== "string") {ws = '';}

    let match = true;

    return reduceRight.call(
        _s,
        (trimmed, char) => {
            if (match && ws.includes(char)) {
                return trimmed
            }
            match = false;
            return char + trimmed
        },
        ''
    );
};

const endsWith$1 = (s, end, pos) => toStr(s).endsWith(end, pos);

const isAlpha = s => REGEXP_ALPHA.test(toStr(s));

const isAlphaDigit = s => REGEXP_ALPHA_DIGIT.test(toStr(s));

const isDigit = s => REGEXP_DIGIT.test(toStr(s));

const isBlank = (s, strong = true) => strong ? toStr(s).length === 0 : trim(s).length === 0;

const isEmpty = s => trim(s).length === 0;

const isLower = s => lower(s) === s;

const isUpper = s => upper(s) === s;

const startsWith$1 = (s, start, pos) => toStr(s).startsWith(start, pos);

const stripTagsAll = s => toStr(s).replace(REGEXP_TAGS, '');

const stripTags = (s, allowed = []) => {
    let _s = toStr(s);
    let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

    return _s.replace(tags, ($0, $1) => {
        return allowed.includes($1) ? $0 : ''
    })
};

/*
* Original code
* copyright (c) 2007-present by Alexandru Mărășteanu <hello@alexei.ro>
* Source: https://github.com/alexei/sprintf.js
* License: BSD-3-Clause License
* */

const re = {
    not_string: /[^s]/,
    not_bool: /[^t]/,
    not_type: /[^T]/,
    not_primitive: /[^v]/,
    number: /[diefg]/,
    numeric_arg: /[bcdiefguxX]/,
    json: /[j]/,
    not_json: /[^j]/,
    text: /^[^\x25]+/,
    modulo: /^\x25{2}/,
    placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
    key: /^([a-z_][a-z_\d]*)/i,
    key_access: /^\.([a-z_][a-z_\d]*)/i,
    index_access: /^\[(\d+)\]/,
    sign: /^[+-]/
};

function sprintf_format(parse_tree, argv) {
    let cursor = 1, tree_length = parse_tree.length, arg, output = '', ph, pad, pad_character, pad_length, is_positive, sign;

    for (let i = 0; i < tree_length; i++) {
        if (typeof parse_tree[i] === 'string') {
            output += parse_tree[i];
        }
        else if (typeof parse_tree[i] === 'object') {
            ph = parse_tree[i]; // convenience purposes only
            if (ph.keys) { // keyword argument
                arg = argv[cursor];
                for (let k = 0; k < ph.keys.length; k++) {
                    if (typeof arg === "undefined") {
                        throw new Error(sprintf('[sprintf] Cannot access property "%s" of undefined value "%s"', ph.keys[k], ph.keys[k-1]))
                    }
                    arg = arg[ph.keys[k]];
                }
            }
            else if (ph.param_no) { // positional argument (explicit)
                arg = argv[ph.param_no];
            }
            else { // positional argument (implicit)
                arg = argv[cursor++];
            }

            if (re.not_type.test(ph.type) && re.not_primitive.test(ph.type) && arg instanceof Function) {
                arg = arg();
            }

            if (re.numeric_arg.test(ph.type) && (typeof arg !== 'number' && isNaN(arg))) {
                throw new TypeError(sprintf('[sprintf] expecting number but found %T'))
            }

            if (re.number.test(ph.type)) {
                is_positive = arg >= 0;
            }

            switch (ph.type) {
                case 'b':
                    arg = parseInt(arg, 10).toString(2);
                    break
                case 'c':
                    arg = String.fromCharCode(parseInt(arg, 10));
                    break
                case 'd':
                case 'i':
                    arg = parseInt(arg, 10);
                    break
                case 'j':
                    arg = JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0);
                    break
                case 'e':
                    arg = ph.precision ? parseFloat(arg).toExponential(ph.precision) : parseFloat(arg).toExponential();
                    break
                case 'f':
                    arg = ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg);
                    break
                case 'g':
                    arg = ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg);
                    break
                case 'o':
                    arg = (parseInt(arg, 10) >>> 0).toString(8);
                    break
                case 's':
                    arg = String(arg);
                    arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
                    break
                case 't':
                    arg = String(!!arg);
                    arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
                    break
                case 'T':
                    arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
                    arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
                    break
                case 'u':
                    arg = parseInt(arg, 10) >>> 0;
                    break
                case 'v':
                    arg = arg.valueOf();
                    arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
                    break
                case 'x':
                    arg = (parseInt(arg, 10) >>> 0).toString(16);
                    break
                case 'X':
                    arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
                    break
            }
            if (re.json.test(ph.type)) {
                output += arg;
            }
            else {
                if (re.number.test(ph.type) && (!is_positive || ph.sign)) {
                    sign = is_positive ? '+' : '-';
                    arg = arg.toString().replace(re.sign, '');
                }
                else {
                    sign = '';
                }
                pad_character = ph.pad_char ? ph.pad_char === '0' ? '0' : ph.pad_char.charAt(1) : ' ';
                pad_length = ph.width - (sign + arg).length;
                pad = ph.width ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : '';
                output += ph.align ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg);
            }
        }
    }
    return output
}

const sprintf_cache = Object.create(null);

function sprintf_parse(fmt) {
    if (sprintf_cache[fmt]) {
        return sprintf_cache[fmt]
    }

    let _fmt = fmt, match, parse_tree = [], arg_names = 0;

    while (_fmt) {
        if ((match = re.text.exec(_fmt)) !== null) {
            parse_tree.push(match[0]);
        }
        else if ((match = re.modulo.exec(_fmt)) !== null) {
            parse_tree.push('%');
        }
        else if ((match = re.placeholder.exec(_fmt)) !== null) {
            if (match[2]) {
                arg_names |= 1;

                let field_list = [], replacement_field = match[2], field_match = [];

                if ((field_match = re.key.exec(replacement_field)) !== null) {
                    field_list.push(field_match[1]);
                    while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                        if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                            field_list.push(field_match[1]);
                        }
                        else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                            field_list.push(field_match[1]);
                        }
                        else {
                            throw new SyntaxError('[sprintf] failed to parse named argument key')
                        }
                    }
                }
                else {
                    throw new SyntaxError('[sprintf] failed to parse named argument key')
                }
                match[2] = field_list;
            }
            else {
                arg_names |= 2;
            }
            if (arg_names === 3) {
                throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
            }

            parse_tree.push(
                {
                    placeholder: match[0],
                    param_no:    match[1],
                    keys:        match[2],
                    sign:        match[3],
                    pad_char:    match[4],
                    align:       match[5],
                    width:       match[6],
                    precision:   match[7],
                    type:        match[8]
                }
            );
        }
        else {
            throw new SyntaxError('[sprintf] unexpected placeholder')
        }
        _fmt = _fmt.substring(match[0].length);
    }
    return sprintf_cache[fmt] = parse_tree
}

const sprintf = key => sprintf_format(sprintf_parse(key), arguments);
const vsprintf = (fmt, argv) => sprintf.apply(null, [fmt].concat(argv || []));

const includes = (s, sub, pos) => toStr(s).includes(sub, pos);

const split = (str, sep = undefined, limit = undefined, trim = true) => {
    return toStr(str)
        .split(sep, limit)
        .map( el => trim ? el.trim() : el )
        .filter( el => trim ? !isEmpty(el) : true)
};

const strip = (str, what = null, replace = "") => {
    let _str = toStr(str);
    let regexp;

    if (!what) return _str

    regexp = new RegExp(what, "g");

    return _str.replace(regexp, replace)
};

const wrapTag = (s, tag = "div") => `<${tag}>${toStr(s)}</${tag}>`;
const wrap = (s, before = "", after = "") => before + toStr(s) + after;

const isString = s => typeof s === "string";

const matches$1 = (s, pattern, flags = '') => {
    let _s = toStr(s);
    let patternStr;

    if (!(pattern instanceof RegExp)) {
        patternStr = pattern ? trim(toStr(pattern)) : '';
        if (!patternStr) {
            return false
        }
        pattern = new RegExp(patternStr, flags);
    }
    return pattern.test(_s)
};

const append = (s, what = '', times = 1) => toStr(s) + repeat(what, times);

const prepend = (s, what = '', times = 1) => repeat(what, times) + toStr(s);

const stripBoom = s => {
    let _s = toStr(s);
    if (_s === '') return _s
    return _s[0] === BYTE_ORDER_MARK ? _s.substring(1) : _s
};

const shorten = (v, l = 5, d = '...') => !v ? v : `${v.substring(0, l)}${d}${v.substring(v.length - l)}`;

var f = {
    camelCase: camelCase$2,
    capitalize,
    chars: chars$1,
    count,
    countChars,
    countUniqueChars,
    countSubstr,
    countWords,
    countUniqueWords,
    dashedName: dashedName$1,
    decapitalize,
    kebab,
    lower,
    reverse,
    shuffle,
    snake,
    swap,
    title: title$1,
    upper,
    words,
    wrap,
    wrapTag,
    escapeHtml,
    unescapeHtml,
    unique,
    uniqueWords,
    substring,
    first,
    last,
    truncate,
    truncateWithAlign,
    slice,
    prune,
    repeat,
    pad,
    lpad,
    rpad,
    insert,
    trim,
    ltrim,
    rtrim,
    endsWith: endsWith$1,
    isAlpha,
    isAlphaDigit,
    isDigit,
    isBlank,
    isEmpty,
    isLower,
    isUpper,
    startsWith: startsWith$1,
    stripTags,
    stripTagsAll,
    sprintf,
    vsprintf,
    includes,
    split,
    strip,
    isString,
    matches: matches$1,
    append,
    prepend,
    stripBoom,
    shorten
};

let Str$1 = class Str {
    constructor(v = "", {mutable = true} = {}) {
        this.value = v.toString();
        this.mutable = mutable;
    }

    [Symbol.toPrimitive](hint){
        if (hint === "number") {
            return +this.value
        }

        return this.value
    }

    get [Symbol.toStringTag](){return "Str"}

    val(v){
        if (typeof v === "undefined" || v === null) return this.value
        this.value = v.toString();
        return this
    }

    get length(){
        return this.value.length
    }

    immutable(state = true){
        this.mutable = !state;
    }

    toString(){
        return this.value
    }

    _result(v){
        if (!this.mutable) {
            return str$1(v)
        }
        this.value = v;
        return this
    }

    camelCase(){
        return this._result(f.camelCase(this.value))
    }

    capitalize(strong){
        return this._result(f.capitalize(this.value, strong))
    }

    chars(ignore){
        return this._result(f.chars(this.value, ignore))
    }

    count(){
        return f.count(this.value)
    }

    countChars(ignore){
        return f.countChars(this.value, ignore)
    }

    countUniqueChars(ignore){
        return f.countUniqueChars(this.value, ignore)
    }

    countSubstr(sub){
        return f.countSubstr(this.value, sub)
    }

    countWords(pattern, flags){
        return f.countChars(this.value, pattern, flags)
    }

    countUniqueWords(pattern, flags){
        return f.countUniqueChars(this.value, pattern, flags)
    }

    dashedName(){
        return this._result(f.dashedName(this.value))
    }

    decapitalize(){
        return this._result(f.decapitalize(this.value))
    }

    endsWith(str, pos){
        return f.endsWith(this.value, str, pos)
    }

    escapeHtml(){
        return this._result(f.escapeHtml(this.value))
    }

    first(){
        return this._result(f.first(this.value))
    }

    includes(sub, pos){
        return f.includes(this.value, sub, pos)
    }

    insert(str, pos){
        return this._result(f.insert(this.value, str, pos))
    }

    isAlpha(){
        return f.isAlpha(this.value)
    }

    isAlphaDigit(){
        return f.isAlphaDigit(this.value)
    }

    isBlank(strong){
        return f.isBlank(this.value, strong)
    }

    isDigit(){
        return f.isDigit(this.value)
    }

    isEmpty(){
        return f.isEmpty(this.value)
    }

    isLower(){
        return f.isLower(this.value)
    }

    static isString(v){
        return f.isString(v)
    }

    isUpper(){
        return f.isUpper(this.value)
    }

    kebab(joinWith){
        return this._result(f.kebab(this.value, joinWith))
    }

    last(len){
        return this._result(f.last(this.value, len))
    }

    lower(){
        return this._result(f.lower(this.value))
    }

    matches(pattern, flags){
        return f.matches(this.value, pattern, flags)
    }

    pad(pad, len){
        return this._result(f.pad(this.value, pad, len))
    }

    lpad(pad, len){
        return this._result(f.lpad(this.value, pad, len))
    }

    rpad(pad, len){
        return this._result(f.rpad(this.value, pad, len))
    }

    prune(len, end){
        return this._result(f.prune(this.value, len, end))
    }

    repeat(times){
        return this._result(f.repeat(this.value, times))
    }

    append(str, times){
        return this._result(f.append(this.value, str, times))
    }

    prepend(str, times){
        return this._result(f.prepend(this.value, str, times))
    }

    reverse(ignore){
        return this._result(f.reverse(this.value, ignore))
    }

    shuffle(){
        return this._result(f.shuffle(this.value))
    }

    slice(parts){
        return this._result(f.slice(this.value, parts))
    }

    snake(){
        return this._result(f.snake(this.value))
    }

    split(sep, limit, trim){
        return this._result(f.split(this.value, sep, limit, trim))
    }

    sprintf(...args){
        return this._result(f.sprintf(this.value, ...args))
    }

    vsprintf(...args){
        return this._result(f.vsprintf(this.value, ...args))
    }

    startsWith(str, pos){
        return f.startsWith(this.value, str, pos)
    }

    stripBoom(){
        return this._result(f.stripBoom(this.value))
    }

    stripTags(allowed){
        return this._result(f.stripTags(this.value, allowed))
    }

    stripTagsAll(){
        return this._result(f.stripTagsAll(this.value))
    }

    strip(str, replace){
        return this._result(f.strip(this.value, str, replace))
    }

    substring(start, len){
        return this._result(f.substring(this.value, start, len))
    }

    swap(){
        return this._result(f.swap(this.value))
    }

    title(noSplit, sep){
        return this._result(f.title(this.value, noSplit, sep))
    }

    trim(ws){
        return this._result(f.trim(this.value, ws))
    }

    ltrim(ws){
        return this._result(f.ltrim(this.value, ws))
    }

    rtrim(ws){
        return this._result(f.rtrim(this.value, ws))
    }

    truncate(len, end){
        return this._result(f.truncate(this.value, len, end))
    }

    truncateWithAlign(len, end){
        return this._result(f.truncateWithAlign(this.value, len, end))
    }

    unescapeHtml(){
        return this._result(f.unescapeHtml(this.value))
    }

    unique(ignore){
        return this._result(f.unique(this.value, ignore))
    }

    uniqueWords(pattern, flags){
        return this._result(f.uniqueWords(this.value, pattern, flags))
    }

    upper(){
        return this._result(f.upper(this.value))
    }

    words(pattern, flags){
        return f.words(this.value, pattern, flags)
    }

    wrap(before, after){
        return this._result(f.wrap(this.value, before, after))
    }

    wrapTag(tag){
        return this._result(f.wrapTag(this.value, tag))
    }

    shorten(l, d){
        return this._result(f.shorten(this.value, l, d))
    }
};

Object.assign(Str$1, f);

const str$1 = v => new Str$1(v);

const version$5 = "0.5.0";
const build_time$5 = "08.05.2024, 14:20:26";

const info$5 = () => {
    console.info(`%c String %c v${version$5} %c ${build_time$5} `, "color: #000000; font-weight: bold; background: #fff200", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

Str$1.info = info$5;

globalThis.Str = Str$1;
globalThis.str = str$1;

/*!
 * Module For Query (m4q, https://metroui.org.ua)
 * Copyright 2012-2024 by Serhii Pimenov
 * Licensed under MIT
 !*/

const numProps$1 = ['opacity', 'zIndex'];

function isSimple(v){
    return typeof v === "string" || typeof v === "boolean" || typeof v === "number";
}

function isVisible(elem) {
    return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}

function isHidden(elem) {
    const s = getComputedStyle(elem);
    return !isVisible(elem) || +s.opacity === 0 || elem.hidden || s.visibility === "hidden";
}

function not(value){
    return value === undefined || value === null;
}

function camelCase$1(string){
    return string.replace( /-([a-z])/g, function(all, letter){
        return letter.toUpperCase();
    });
}

function isPlainObject( obj ) {
    let proto;
    if ( !obj || Object.prototype.toString.call( obj ) !== "[object Object]" ) {
        return false;
    }
    proto = obj.prototype !== undefined;
    if ( !proto ) {
        return true;
    }
    return proto.constructor && typeof proto.constructor === "function";
}

function isEmptyObject( obj ) {
    for (const name in obj ) {
        if (hasProp(obj, name)) return false;
    }
    return true;
}

function isArrayLike$1 (o){
    return o instanceof Object && 'length' in o;
}

function str2arr (str, sep) {
    sep = sep || " ";
    return str.split(sep).map(function(el){
        return  (""+el).trim();
    }).filter(function(el){
        return el !== "";
    });
}

function parseUnit$1(str, out) {
    if (!out) out = [ 0, '' ];
    str = String(str);
    out[0] = parseFloat(str);
    out[1] = str.match(/[\d.\-+]*\s*(.*)/)[1] || '';
    return out;
}

function getUnit$1(val, und){
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    return typeof split[1] !== "undefined" ? split[1] : und;
}

function setStyleProp(el, key, val){
    key = camelCase$1(key);

    if (["scrollLeft", "scrollTop"].indexOf(key) > -1) {
        el[key] = (parseInt(val));
    } else {
        el.style[key] = isNaN(val) || numProps$1.indexOf(""+key) > -1 ? val : val + 'px';
    }
}

function acceptData(owner){
    return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
}

function getData(data){
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}

function dataAttr(elem, key, data){
    let name;

    if ( not(data) && elem.nodeType === 1 ) {
        name = "data-" + key.replace( /[A-Z]/g, "-$&" ).toLowerCase();
        data = elem.getAttribute( name );

        if ( typeof data === "string" ) {
            data = getData( data );
            dataSet.set( elem, key, data );
        } else {
            data = undefined;
        }
    }
    return data;
}

function normName(name) {
    return typeof name !== "string" ? undefined : name.replace(/-/g, "").toLowerCase();
}

function hasProp(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isLocalhost(host){
    const hostname = host || globalThis.location.hostname;
    return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname === "" ||
        hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) !== null
    );
}

function isTouch() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
}

function isPrivateAddress (host) {
    const hostname = host || globalThis.location.hostname;
    return /(^localhost)|(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2\d\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(hostname)
}

const matches = Element.prototype.matches;

const $ = (selector, context) => new $.init(selector, context);

$.version = "3.0.3";
$.build_time = "17.07.2024, 10:20:08";
$.info = () => console.info(`%c M4Q %c v${$.version} %c ${$.build_time} `, "color: white; font-weight: bold; background: #fd6a02", "color: white; background: darkgreen", "color: white; background: #0080fe;");

$.fn = $.prototype = Object.create(Array.prototype);

$.prototype.constructor = $;
$.prototype.uid = "";

$.extend = $.fn.extend = function(){
    let options, name,
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length;

    if ( typeof target !== "object" && typeof target !== "function" ) {
        target = {};
    }

    if ( i === length ) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {
        if ( ( options = arguments[ i ] ) != null ) {
            for ( name in options ) {
                if (hasProp(options, name))
                    target[ name ] = options[ name ];
            }
        }
    }

    return target;
};

$.assign = function(){
    let options, name,
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length;

    if ( typeof target !== "object" && typeof target !== "function" ) {
        target = {};
    }

    if ( i === length ) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {
        if ( ( options = arguments[ i ] ) != null ) {
            for ( name in options ) {
                if (hasProp(options, name) && options[name] !== undefined)
                    target[ name ] = options[ name ];
            }
        }
    }

    return target;
};

(function (workerScript) {
    try {
        const blob = new Blob ([`
            var fakeIdToId = {};
            onmessage = function (event) {
                var data = event.data,
                    name = data.name,
                    fakeId = data.fakeId,
                    time;
                if(data.hasOwnProperty('time')) {
                    time = data.time;
                }
                switch (name) {
                    case 'setInterval':
                        fakeIdToId[fakeId] = setInterval(function () {
                            postMessage({fakeId: fakeId});
                        }, time);
                        break;
                    case 'clearInterval':
                        if (fakeIdToId.hasOwnProperty (fakeId)) {
                            clearInterval(fakeIdToId[fakeId]);
                            delete fakeIdToId[fakeId];
                        }
                        break;
                    case 'setTimeout':
                        fakeIdToId[fakeId] = setTimeout(function () {
                            postMessage({fakeId: fakeId});
                            if (fakeIdToId.hasOwnProperty (fakeId)) {
                                delete fakeIdToId[fakeId];
                            }
                        }, time);
                        break;
                    case 'clearTimeout':
                        if (fakeIdToId.hasOwnProperty (fakeId)) {
                            clearTimeout(fakeIdToId[fakeId]);
                            delete fakeIdToId[fakeId];
                        }
                        break;
                }
            }
        `]);
        workerScript = window.URL.createObjectURL(blob);
    } catch (error) {}

    let worker,
        fakeIdToCallback = {},
        lastFakeId = 0,
        maxFakeId = 0x7FFFFFFF,
        logPrefix = '';

    function getFakeId () {
        do {
            if (lastFakeId === maxFakeId) {
                lastFakeId = 0;
            } else {
                lastFakeId ++;
            }
        } while (fakeIdToCallback.hasOwnProperty (lastFakeId));
        return lastFakeId;
    }

    if (typeof (Worker) !== 'undefined') {
        try {
            worker = new Worker (workerScript);
            window.setInterval = function (callback, time /* , parameters */) {
                const fakeId = getFakeId ();
                fakeIdToCallback[fakeId] = {
                    callback: callback,
                    parameters: Array.prototype.slice.call(arguments, 2)
                };
                worker.postMessage ({
                    name: 'setInterval',
                    fakeId: fakeId,
                    time: time
                });
                return fakeId;
            };
            window.clearInterval = function (fakeId) {
                if (fakeIdToCallback.hasOwnProperty(fakeId)) {
                    delete fakeIdToCallback[fakeId];
                    worker.postMessage ({
                        name: 'clearInterval',
                        fakeId: fakeId
                    });
                }
            };
            window.setTimeout = function (callback, time /* , parameters */) {
                const fakeId = getFakeId ();
                fakeIdToCallback[fakeId] = {
                    callback: callback,
                    parameters: Array.prototype.slice.call(arguments, 2),
                    isTimeout: true
                };
                worker.postMessage ({
                    name: 'setTimeout',
                    fakeId: fakeId,
                    time: time
                });
                return fakeId;
            };
            window.clearTimeout = function (fakeId) {
                if (fakeIdToCallback.hasOwnProperty(fakeId)) {
                    delete fakeIdToCallback[fakeId];
                    worker.postMessage ({
                        name: 'clearTimeout',
                        fakeId: fakeId
                    });
                }
            };
            window.setImmediate = function (callback) {
                return setTimeout(callback, 0)
            };
            window.clearImmediate = function (fakeId) {
                clearTimeout(fakeId);
            };
            worker.onmessage = function (event) {
                let data = event.data,
                    fakeId = data.fakeId,
                    request,
                    parameters,
                    callback;
                if (fakeIdToCallback.hasOwnProperty(fakeId)) {
                    request = fakeIdToCallback[fakeId];
                    callback = request.callback;
                    parameters = request.parameters;
                    if (request.hasOwnProperty ('isTimeout') && request.isTimeout) {
                        delete fakeIdToCallback[fakeId];
                    }
                }
                if (typeof (callback) === 'string') {
                    try {
                        callback = new Function (callback);
                    } catch (error) {
                        console.error (logPrefix + 'Error parsing callback code string: ', error);
                    }
                }
                if (typeof (callback) === 'function') {
                    callback.apply (window, parameters);
                }
            };
            worker.onerror = function (event) {
                console.error (event);
            };
        } catch (error) {
            console.error (logPrefix + 'Initialisation failed');
            console.error (error);
        }
    } else {
        console.error (logPrefix + 'Initialisation failed - HTML5 Web Worker is not supported');
    }
})();


$.fn.extend({
    index: function(sel){
        let el, _index = -1;

        if (this.length === 0) {
            return _index;
        }

        if (not(sel)) {
            el = this[0];
        } else if (sel instanceof $ && sel.length > 0) {
            el = sel[0];
        } else if (typeof sel === "string") {
            el = $(sel)[0];
        } else {
            el = undefined;
        }

        if (not(el)) {
            return _index;
        }

        if (el && el.parentNode) $.each(el.parentNode.children, function(i){
            if (this === el) {
                _index = i;
            }
        });
        return _index;
    },

    indexOf: function(sel){
        let el, _index = -1;

        if (this.length === 0) {
            return _index;
        }

        if (not(sel)) {
            el = this[0];
        } else if (sel instanceof $ && sel.length > 0) {
            el = sel[0];
        } else if (typeof sel === "string") {
            el = $(sel)[0];
        } else {
            el = undefined;
        }

        if (not(el)) {
            return _index;
        }

        this.each(function(i){
            if (this === el) {
                _index = i;
            }
        });
        
        return _index;
    },

    get: function(i){
        if (i === undefined) {
            return this.items();
        }
        return i < 0 ? this[ i + this.length ] : this[ i ];
    },

    eq: function(i){
        return !not(i) && this.length > 0 ? $.extend($(this.get(i)), {_prevObj: this}) : this;
    },

    is: function(s){
        let result = false;

        if (this.length === 0) {
            return false;
        }

        if (s instanceof $) {
            return this.same(s);
        }

        if (s === ":selected") {
            this.each(function(){
                if (this.selected) result = true;
            });
        } else

        if (s === ":checked") {
            this.each(function(){
                if (this.checked) result = true;
            });
        } else

        if (s === ":visible") {
            this.each(function(){
                if (isVisible(this)) result = true;
            });
        } else

        if (s === ":hidden") {
            this.each(function(){
                const styles = getComputedStyle(this);
                if (
                    this.getAttribute('type') === 'hidden'
                        || this.hidden
                        || styles.display === 'none'
                        || styles.visibility === 'hidden'
                        || parseInt(styles.opacity) === 0
                ) result = true;
            });
        } else

        if (typeof  s === "string" && [':selected'].indexOf(s) === -1) {
            this.each(function(){
                if (matches.call(this, s)) {
                    result = true;
                }
            });
        } else

        if (isArrayLike$1(s)) {
            this.each(function(){
                const el = this;
                $.each(s, function(){
                    const sel = this;
                    if (el === sel) {
                        result = true;
                    }
                });
            });
        } else

        if (typeof s === "object" && s.nodeType === 1) {
            this.each(function(){
                if  (this === s) {
                    result = true;
                }
            });
        }

        return result;
    },

    same: function(o){
        let result = true;

        if (!(o instanceof $)) {
            o = $(o);
        }

        if (this.length !== o.length) return false;

        this.each(function(){
            if (o.items().indexOf(this) === -1) {
                result = false;
            }
        });

        return result;
    },

    last: function(){
        return this.eq(this.length - 1);
    },

    first: function(){
        return this.eq(0);
    },

    odd: function(){
        const result = this.filter(function(el, i){
            return i % 2 === 0;
        });
        return $.extend(result, {_prevObj: this});
    },

    even: function(){
        const result = this.filter(function(el, i){
            return i % 2 !== 0;
        });
        return $.extend(result, {_prevObj: this});
    },

    filter: function(fn){
        if (typeof fn === "string") {
            const sel = fn;
            fn = function(el){
                return matches.call(el, sel);
            };
        }

        return $.extend($.merge($(), [].filter.call(this, fn)), {_prevObj: this});
    },

    find: function(s){
        let res = [], result;

        if (s instanceof $) return s;

        if (this.length === 0) {
            result = this;
        } else {
            this.each(function () {
                const el = this;
                if (typeof el.querySelectorAll === "undefined") {
                    return ;
                }
                res = res.concat([].slice.call(el.querySelectorAll(s)));
            });
            result = $.merge($(), res);
        }

        return $.extend(result, {_prevObj: this});
    },

    contains: function(s){
        return this.find(s).length > 0;
    },

    children: function(s){
        let i, res = [];

        if (s instanceof $) return s;

        this.each(function(){
            const el = this;
            for(i = 0; i < el.children.length; i++) {
                if (el.children[i].nodeType === 1)
                    res.push(el.children[i]);
            }
        });
        res = s ? res.filter(function(el){
            return matches.call(el, s);
        }) : res;

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    parent: function(s){
        let res = [];
        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            if (this.parentNode) {
                if (res.indexOf(this.parentNode) === -1) res.push(this.parentNode);
            }
        });
        res = s ? res.filter(function(el){
            return matches.call(el, s);
        }) : res;

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    parents: function(s){
        let res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            let par = this.parentNode;
            while (par) {
                if (par.nodeType === 1 && res.indexOf(par) === -1) {
                    if (!not(s)) {
                        if (matches.call(par, s)) {
                            res.push(par);
                        }
                    } else {
                        res.push(par);
                    }
                }
                par = par.parentNode;
            }
        });

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    siblings: function(s){
        let res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            const el = this;
            if (el.parentNode) {
                $.each(el.parentNode.children, function(){
                    if (el !== this) res.push(this);
                });
            }
        });

        if (s) {
            res = res.filter(function(el){
                return matches.call(el, s);
            });
        }

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    _siblingAll: function(dir, s){
        let res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            let el = this;
            while (el) {
                el = el[dir];
                if (!el) break;
                res.push(el);
            }
        });

        if (s) {
            res = res.filter(function(el){
                return matches.call(el, s);
            });
        }

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    _sibling: function(dir, s){
        let res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            const el = this[dir];
            if (el && el.nodeType === 1) {
                res.push(el);
            }
        });

        if (s) {
            res = res.filter(function(el){
                return matches.call(el, s);
            });
        }

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    prev: function(s){
        return this._sibling('previousElementSibling', s);
    },

    next: function(s){
        return this._sibling('nextElementSibling', s);
    },

    prevAll: function(s){
        return this._siblingAll('previousElementSibling', s);
    },

    nextAll: function(s){
        return this._siblingAll('nextElementSibling', s);
    },

    closest: function(s){
        let res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        if (!s) {
            return this.parent(s);
        }

        this.each(function(){
            let el = this;
            while (el) {
                if (!el) break;
                if (matches.call(el, s)) {
                    res.push(el);
                    return ;
                }
                el = el.parentElement;
            }
        });

        return $.extend($.merge($(), res.reverse()), {_prevObj: this});
    },

    has: function(selector){
        let res = [];

        if (this.length === 0) {
            return ;
        }

        this.each(function(){
            const el = $(this);
            const child = el.children(selector);
            if (child.length > 0) {
                res.push(this);
            }
        });

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    back: function(to_start){
        let ret;
        if (to_start === true) {
            ret = this._prevObj;
            while (ret) {
                if (!ret._prevObj) break;
                ret = ret._prevObj;
            }
        } else {
            ret = this._prevObj ? this._prevObj : this;
        }
        return ret;
    }
});

function createScript(script){
    const s = document.createElement('script');
    s.type = 'text/javascript';

    if (not(script)) return $(s);

    const _script = $(script)[0];

    if (_script.src) {
        s.src = _script.src;
    } else {
        s.textContent = _script.innerText;
    }

    document.body.appendChild(s);

    if (_script.parentNode) _script.parentNode.removeChild(_script);

    return s;
}

$.extend({
    script: function(el){

        if (not(el)) {
            return createScript();
        }

        const _el = $(el)[0];

        if (_el.tagName && _el.tagName === "SCRIPT") {
            createScript(_el);
        } else $.each($(_el).find("script"), function(){
            createScript(this);
        });
    }
});

$.fn.extend({
    script: function(){
        return this.each(function(){
            $.script(this);
        });
    }
});

$.fn.extend({
    _prop: function(prop, value){
        if (arguments.length === 1) {
            return this.length === 0 ? undefined : this[0][prop];
        }

        if (not(value)) {
            value = '';
        }

        return this.each(function(){
            const el = this;

            el[prop] = value;

            if (prop === "innerHTML") {
                $.script(el);
            }
        });
    },

    prop: function(prop, value){
        return arguments.length === 1 ? this._prop(prop) : this._prop(prop, typeof value === "undefined" ? "" : value);
    },

    val: function(value){
        if (not(value)) {
            return this.length === 0 ? undefined : this[0].value;
        }

        return this.each(function(){
            const el = $(this);
            if (typeof this.value !== "undefined") {
                this.value = value;
            } else {
                el.html(value);
            }
        });
    },

    html: function(value){
        const that = this, v = [];

        if (arguments.length === 0) {
            return this._prop('innerHTML');
        }

        if (value instanceof $) {
            value.each(function(){
                v.push($(this).outerHTML());
            });
        } else {
            v.push(value);
        }

        that._prop('innerHTML', v.length === 1 && not(v[0]) ? "" : v.join("\n"));

        return this;
    },

    outerHTML: function(){
        return this._prop('outerHTML');
    },

    text: function(value){
        return arguments.length === 0 ? this._prop('textContent') : this._prop('textContent', typeof value === "undefined" ? "" : value);
    },

    innerText: function(value){
        return arguments.length === 0 ? this._prop('innerText') : this._prop('innerText', typeof value === "undefined" ? "" : value);
    },

    empty: function(){
        return this.each(function(){
            if (typeof this.innerHTML !== "undefined") this.innerHTML = "";
        });
    },

    clear: function(){
        return this.empty();
    }
});

$.each = function(ctx, cb){
    let index = 0;
    if (isArrayLike$1(ctx)) {
        [].forEach.call(ctx, function(val, key) {
            cb.apply(val, [key, val]);
        });
    } else {
        for(const key in ctx) {
            if (hasProp(ctx, key))
                cb.apply(ctx[key], [key, ctx[key],  index++]);
        }
    }

    return ctx;
};

$.fn.extend({
    each: function(cb){
        return $.each(this, cb);
    }
});


/*
 * Data routines
 * Url: https://jquery.com
 * Copyright (c) Copyright JS Foundation and other contributors, https://js.foundation/
 * Licensed under MIT
 */
const Data$1 = function(ns){
    this.expando = "DATASET:UID:" + ns.toUpperCase();
    Data$1.uid++;
};

Data$1.uid = -1;

Data$1.prototype = {
    cache: function(owner){
        let value = owner[this.expando];
        if (!value) {
            value = {};
            if (acceptData(owner)) {
                if (owner.nodeType) {
                    owner[this.expando] = value;
                } else {
                    Object.defineProperty(owner, this.expando, {
                        value: value,
                        configurable: true
                    });
                }
            }
        }
        return value;
    },

    set: function(owner, data, value){
        let prop, cache = this.cache(owner);

        if (typeof data === "string") {
            cache[camelCase$1(data)] = value;
        } else {
            for (prop in data) {
                if (hasProp(data, prop))
                    cache[camelCase$1(prop)] = data[prop];
            }
        }
        return cache;
    },

    get: function(owner, key){
        return key === undefined ? this.cache(owner) : owner[ this.expando ] && owner[ this.expando ][ camelCase$1( key ) ];
    },

    access: function(owner, key, value){
        if (key === undefined || ((key && typeof key === "string") && value === undefined) ) {
            return this.get(owner, key);
        }
        this.set(owner, key, value);
        return value !== undefined ? value : key;
    },

    remove: function(owner, key){
        let i, cache = owner[this.expando];
        if (cache === undefined) {
            return ;
        }
        if (key !== undefined) {
            if ( Array.isArray( key ) ) {
                key = key.map( camelCase$1 );
            } else {
                key = camelCase$1( key );

                key = key in cache ? [ key ] : ( key.match( /[^\x20\t\r\n\f]+/g ) || [] ); // ???
            }

            i = key.length;

            while ( i-- ) {
                delete cache[ key[ i ] ];
            }
        }
        if ( key === undefined || isEmptyObject( cache ) ) {
            if ( owner.nodeType ) {
                owner[ this.expando ] = undefined;
            } else {
                delete owner[ this.expando ];
            }
        }
        return true;
    },

    hasData: function(owner){
        const cache = owner[ this.expando ];
        return cache !== undefined && !isEmptyObject( cache );
    }
};

const dataSet = new Data$1('m4q');

$.extend({
    hasData: function(elem){
        return dataSet.hasData(elem);
    },

    data: function(elem, key, val){
        return dataSet.access(elem, key, val);
    },

    removeData: function(elem, key){
        return dataSet.remove(elem, key);
    },

    dataSet: function(ns){
        if (not(ns)) return dataSet;
        if (['INTERNAL', 'M4Q'].indexOf(ns.toUpperCase()) > -1) {
            throw Error("You can not use reserved name for your dataset");
        }
        return new Data$1(ns);
    }
});

$.fn.extend({
    data: function(key, val){
        let res, elem, data, attrs, name, i;

        if (this.length === 0) {
            return ;
        }

        elem = this[0];

        if ( arguments.length === 0 ) {
            if ( this.length ) {
                data = dataSet.get( elem );

                if ( elem.nodeType === 1) {
                    attrs = elem.attributes;
                    i = attrs.length;
                    while ( i-- ) {
                        if ( attrs[ i ] ) {
                            name = attrs[ i ].name;
                            if ( name.indexOf( "data-" ) === 0 ) {
                                name = camelCase$1( name.slice( 5 ) );
                                dataAttr( elem, name, data[ name ] );
                            }
                        }
                    }
                }
            }

            return data;
        }

        if ( arguments.length === 1 ) {
            res = dataSet.get(elem, key);
            if (res === undefined) {
                if ( elem.nodeType === 1) {
                    if (elem.hasAttribute("data-"+key)) {
                        res = elem.getAttribute("data-"+key);
                    }
                }
            }
            return res;
        }

        return this.each( function() {
            dataSet.set( this, key, val );
        } );
    },

    removeData: function( key ) {
        return this.each( function() {
            dataSet.remove( this, key );
        } );
    },

    origin: function(name, value, def){

        if (this.length === 0) {
            return this;
        }

        if (not(name) && not(value)) {
            return $.data(this[0]);
        }

        if (not(value)) {
            const res = $.data(this[0], "origin-"+name);
            return !not(res) ? res : def;
        }

        this.data("origin-"+name, value);

        return this;
    }
});

$.extend({

    device: (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),
    localhost: isLocalhost(),
    isLocalhost: isLocalhost,
    touchable: isTouch(),
    isPrivateAddress: isPrivateAddress,

    uniqueId: function (prefix) {
        let d = new Date().getTime();
        if (not(prefix)) {
            prefix = 'm4q';
        }
        return (prefix !== '' ? prefix + '-' : '') + 'xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    toArray: function(n){
        let i, out = [];

        for (i = 0 ; i < n.length; i++ ) {
            out.push(n[i]);
        }

        return out;
    },

    import: function(ctx){
        const res = [];
        this.each(ctx, function(){
            res.push(this);
        });
        return this.merge($(), res);
    },

    merge: function( first, second ) {
        let len = +second.length,
            j = 0,
            i = first.length;

        for ( ; j < len; j++ ) {
            first[ i++ ] = second[ j ];
        }

        first.length = i;

        return first;
    },

    type: function(obj){
        return Object.prototype.toString.call(obj).replace(/^\[object (.+)]$/, '$1').toLowerCase();
    },

    sleep: function(ms) {
        ms += new Date().getTime();
    },

    isSelector: function(selector){
        if (typeof selector !== 'string') {
            return false;
        }
        try {
            document.querySelector(selector);
        } catch(error) {
            return false;
        }
        return true;
    },

    remove: function(s){
        return $(s).remove();
    },

    isPlainObject: isPlainObject,
    isEmptyObject: isEmptyObject,
    isArrayLike: isArrayLike$1,
    acceptData: acceptData,
    not: not,
    parseUnit: parseUnit$1,
    getUnit: getUnit$1,
    unit: parseUnit$1,
    isVisible: isVisible,
    isHidden: isHidden,
    matches: function(el, s) {return matches.call(el, s);},
    random: function(from, to) {
        if (arguments.length === 1 && isArrayLike$1(from)) {
            return from[Math.floor(Math.random()*(from.length))];
        }
        return Math.floor(Math.random()*(to-from+1)+from);
    },
    hasProp: hasProp,
    dark: globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches,

    serializeToArray: function(form){
        const _form = $(form)[0];
        if (!_form || _form.nodeName !== "FORM") {
            console.warn("Element is not a HTMLFromElement");
            return;
        }
        let i, j, q = [];
        for (i = _form.elements.length - 1; i >= 0; i = i - 1) {
            if (_form.elements[i].name === "") {
                continue;
            }
            switch (_form.elements[i].nodeName) {
                case 'INPUT':
                    switch (_form.elements[i].type) {
                        case 'checkbox':
                        case 'radio':
                            if (_form.elements[i].checked) {
                                q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                            }
                            break;
                        case 'file':
                            break;
                        default: q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                    }
                    break;
                case 'TEXTAREA':
                    q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                    break;
                case 'SELECT':
                    switch (_form.elements[i].type) {
                        case 'select-one':
                            q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                            break;
                        case 'select-multiple':
                            for (j = _form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                if (_form.elements[i].options[j].selected) {
                                    q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].options[j].value));
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (_form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                            break;
                    }
                    break;
            }
        }
        return q;
    },
    serialize: function(form){
        return $.serializeToArray(form).join("&");
    }
});

$.fn.extend({
    items: function(){
        return $.toArray(this);
    }
});

const overriddenStop =  Event.prototype.stopPropagation;
const overriddenPrevent =  Event.prototype.preventDefault;

Event.prototype.stopPropagation = function(){
    this.isPropagationStopped = true;
    overriddenStop.apply(this, arguments);
};
Event.prototype.preventDefault = function(){
    this.isPreventedDefault = true;
    overriddenPrevent.apply(this, arguments);
};

Event.prototype.stop = function(immediate){
    return immediate ? this.stopImmediatePropagation() : this.stopPropagation();
};

$.extend({
    events: [],
    eventHooks: {},

    eventUID: -1,

    /*
    * el, eventName, handler, selector, ns, id, options
    * */
    setEventHandler: function(obj){
        let i, freeIndex = -1, eventObj, resultIndex;
        if (this.events.length > 0) {
            for(i = 0; i < this.events.length; i++) {
                if (this.events[i].handler === null) {
                    freeIndex = i;
                    break;
                }
            }
        }

        eventObj = {
            element: obj.el,
            event: obj.event,
            handler: obj.handler,
            selector: obj.selector,
            ns: obj.ns,
            id: obj.id,
            options: obj.options
        };

        if (freeIndex === -1) {
            this.events.push(eventObj);
            resultIndex = this.events.length - 1;
        } else {
            this.events[freeIndex] = eventObj;
            resultIndex = freeIndex;
        }

        return resultIndex;
    },

    getEventHandler: function(index){
        if (this.events[index] !== undefined && this.events[index] !== null) {
            this.events[index] = null;
            return this.events[index].handler;
        }
        return undefined;
    },

    off: function(){
        $.each(this.events, function(){
            this.element.removeEventListener(this.event, this.handler, true);
        });
        this.events = [];
        return this;
    },

    getEvents: function(){
        return this.events;
    },

    getEventHooks: function(){
        return this.eventHooks;
    },

    addEventHook: function(event, handler, type){
        if (not(type)) {
            type = "before";
        }
        $.each(str2arr(event), function(){
            this.eventHooks[camelCase$1(type+"-"+this)] = handler;
        });
        return this;
    },

    removeEventHook: function(event, type){
        if (not(type)) {
            type = "before";
        }
        $.each(str2arr(event), function(){
            delete this.eventHooks[camelCase$1(type+"-"+this)];
        });
        return this;
    },

    removeEventHooks: function(event){
        const that = this;
        if (not(event)) {
            this.eventHooks = {};
        } else {
            $.each(str2arr(event), function(){
                delete that.eventHooks[camelCase$1("before-"+this)];
                delete that.eventHooks[camelCase$1("after-"+this)];
            });
        }
        return this;
    }
});

$.fn.extend({
    on: function(eventsList, sel, handler, options){
        if (this.length === 0) {
            return ;
        }

        if (typeof sel === 'function') {
            options = handler;
            handler = sel;
            sel = undefined;
        }

        if (!isPlainObject(options)) {
            options = {};
        }

        return this.each(function(){
            const el = this;
            $.each(str2arr(eventsList), function(){
                let h, ev = this,
                    event = ev.split("."),
                    name = normName(event[0]),
                    ns = options.ns ? options.ns : event[1],
                    index, originEvent;

                $.eventUID++;

                h = function(e){
                    let target = e.target;
                    const beforeHook = $.eventHooks[camelCase$1("before-"+name)];
                    const afterHook = $.eventHooks[camelCase$1("after-"+name)];

                    if (typeof beforeHook === "function") {
                        beforeHook.call(target, e);
                    }

                    if (!sel) {
                        handler.call(el, e);
                    } else {
                        while (target && target !== el) {
                            if (matches.call(target, sel)) {
                                handler.call(target, e);
                                if (e.isPropagationStopped) {
                                    e.stopImmediatePropagation();
                                    break;
                                }
                            }
                            target = target.parentNode;
                        }
                    }

                    if (typeof afterHook === "function") {
                        afterHook.call(target, e);
                    }

                    if (options.once) {
                        index = +$(el).origin( "event-"+e.type+(sel ? ":"+sel:"")+(ns ? ":"+ns:"") );
                        if (!isNaN(index)) $.events.splice(index, 1);
                    }
                };

                Object.defineProperty(h, "name", {
                    value: handler.name && handler.name !== "" ? handler.name : "func_event_"+name+"_"+$.eventUID
                });

                originEvent = name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"");

                el.addEventListener(name, h, !isEmptyObject(options) ? options : false);

                index = $.setEventHandler({
                    el: el,
                    event: name,
                    handler: h,
                    selector: sel,
                    ns: ns,
                    id: $.eventUID,
                    options: !isEmptyObject(options) ? options : false
                });
                $(el).origin('event-'+originEvent, index);
            });
        });
    },

    one: function(events, sel, handler, options){
        if (!isPlainObject(options)) {
            options = {};
        }

        options.once = true;

        return this.on.apply(this, [events, sel, handler, options]);
    },

    off: function(eventsList, sel, options){

        if (isPlainObject(sel)) {
            options = sel;
            sel = null;
        }

        if (!isPlainObject(options)) {
            options = {};
        }

        if (not(eventsList) || eventsList.toLowerCase() === 'all') {
            return this.each(function(){
                const el = this;
                $.each($.events, function(){
                    const e = this;
                    if (e.element === el) {
                        el.removeEventListener(e.event, e.handler, e.options);
                        e.handler = null;
                        $(el).origin("event-"+name+(e.selector ? ":"+e.selector:"")+(e.ns ? ":"+e.ns:""), null);
                    }
                });
            });
        }

        return this.each(function(){
            const el = this;
            $.each(str2arr(eventsList), function(){
                let evMap = this.split("."),
                    name = normName(evMap[0]),
                    ns = options.ns ? options.ns : evMap[1],
                    originEvent, index;

                originEvent = "event-"+name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"");
                index = $(el).origin(originEvent);

                if (index !== undefined && $.events[index].handler) {
                    el.removeEventListener(name, $.events[index].handler, $.events[index].options);
                    $.events[index].handler = null;
                }

                $(el).origin(originEvent, null);
            });
        });
    },

    trigger: function(name, data){
        return this.fire(name, data);
    },

    fire: function(name, data){
        let _name, e;

        if (this.length === 0) {
            return ;
        }

        _name = normName(name);

        if (['focus', 'blur'].indexOf(_name) > -1) {
            this[0][_name]();
            return this;
        }

        e = new CustomEvent(_name, {
            bubbles: true,
            cancelable: true,
            detail: data
        });

        return this.each(function(){
            this.dispatchEvent(e);
        });
    }
});

( "blur focus resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu touchstart touchend touchmove touchcancel" )
    .split( " " )
    .forEach(
    function( name ) {
        $.fn[ name ] = function( sel, fn, opt ) {
            return arguments.length > 0 ?
                this.on( name, sel, fn, opt ) :
                this.fire( name );
        };
});

$.fn.extend( {
    hover: function( fnOver, fnOut ) {
        return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
    }
});

$.ready = function(fn, options){
    document.addEventListener('DOMContentLoaded', fn, (options || false));
};

$.load = function(fn){
    return $(window).on("load", fn);
};

$.unload = function(fn){
    return $(window).on("unload", fn);
};

$.fn.extend({
    unload: function(fn){
        return (this.length === 0 || this[0].self !== window) ? undefined : $.unload(fn);
    }
});

$.beforeunload = function(fn){
    if (typeof fn === "string") {
        return $(window).on("beforeunload", function(e){
            e.returnValue = fn;
            return fn;
        });
    } else {
        return $(window).on("beforeunload", fn);
    }
};

$.fn.extend({
    beforeunload: function(fn){
        return (this.length === 0 || this[0].self !== window) ? undefined : $.beforeunload(fn);
    }
});

$.fn.extend({
    ready: function(fn){
        if (this.length && this[0] === document && typeof fn === 'function') {
            return $.ready(fn);
        }
    }
});

$.ajax = function(p){
    return new Promise(function(resolve, reject){
        const xhr = new XMLHttpRequest();
        let method = (p.method || "GET").toUpperCase();
        const headers = [];
        const async = not(p.async) ? true : p.async;
        let url = p.url;

        let data;

        const exec = function(fn, params){
            if (typeof fn === "function") {
                fn.apply(null, params);
            }
        };

        const isGet = function(method){
            return ["GET", "JSON"].indexOf(method) !== -1;
        };

        const plainObjectToData = function(obj){
            const _data = [];
            $.each(obj, function(k, v){
                const _v = isSimple(v) ? v : JSON.stringify(v);
                _data.push(k+"=" + _v);
            });
            return _data.join("&");
        };

        if (p.data instanceof HTMLFormElement) {
            let _action = p.data.getAttribute("action").trim();
            let _method = p.data.getAttribute("method").trim();

            if (not(url) && _action) {url = _action;}
            if (_method) {method = _method.toUpperCase();}
        }


        if (p.timeout) {
            xhr.timeout = p.timeout;
        }

        if (p.withCredentials) {
            xhr.withCredentials = p.withCredentials;
        }

        if (p.data instanceof HTMLFormElement) {
            data = $.serialize(p.data);
        } else if (p.data instanceof HTMLElement && p.data.getAttribute("type") && p.data.getAttribute("type").toLowerCase() === "file") {
            const _name = p.data.getAttribute("name");
            data = new FormData();
            for (let i = 0; i < p.data.files.length; i++) {
                data.append(_name, p.data.files[i]);
            }
        } else if (isPlainObject(p.data)) {
            data = plainObjectToData(p.data);
        } else if (p.data instanceof FormData) {
            data = p.data;
        } else if (typeof p.data === "string") {
            data = p.data;
        } else {
            data = new FormData();
            data.append("_data", JSON.stringify(p.data));
        }

        if (isGet(method)) {
            url += (typeof data === "string" ? "?"+data : isEmptyObject(data) ? "" : "?"+JSON.stringify(data));
        }

        xhr.open(method, url, async, p.user, p.password);
        if (p.headers) {
            $.each(p.headers, function(k, v){
                xhr.setRequestHeader(k, v);
                headers.push(k);
            });
        }
        if (!isGet(method)) {
            if (headers.indexOf("Content-type") === -1 && p.contentType !== false) {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
        }
        xhr.send(data);

        xhr.addEventListener("load", function(e){
            if (xhr.readyState === 4 && xhr.status < 300) {
                let _return = p.returnValue && p.returnValue === 'xhr' ? xhr : xhr.response;
                if (p.parseJson) {
                    try {
                        _return = JSON.parse(_return);
                    } catch (ex) {
                        _return = {};
                    }
                }
                exec(resolve, [_return]);
                exec(p.onSuccess, [e, xhr]);
            } else {
                exec(reject, [xhr]);
                exec(p.onFail, [e, xhr]);
            }
            exec(p.onLoad, [e, xhr]);
        });

        $.each(["readystatechange", "error", "timeout", "progress", "loadstart", "loadend", "abort"], function(){
            const ev = camelCase$1("on-"+(this === 'readystatechange' ? 'state' : this));
            xhr.addEventListener(ev, function(e){
                exec(p[ev], [e, xhr]);
            });
        });
    });
};

['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'JSON'].forEach(function(method){
    $[method] = function(url, data, options){
        const _options = {
            method: method === 'JSON' ? 'GET' : method,
            url: url,
            data: data,
            parseJson: method === 'JSON'
        };
        return $.ajax($.extend({}, _options, options));
    };
});

$.fn.extend({
    load: function(url, data, options){
        const that = this;

        if (this.length && this[0].self === window ) {
            return $.load(url);
        }

        return $.get(url, data, options).then(function(data){
            that.each(function(){
                this.innerHTML = data;
            });
        });
    }
});

$.fn.extend({

    style: function(name, pseudo){
        let el;

        function _getStyle(el, prop, pseudo){
            return ["scrollLeft", "scrollTop"].indexOf(prop) > -1 ? $(el)[prop]() : getComputedStyle(el, pseudo)[prop];
        }

        if (typeof name === 'string' && this.length === 0) {
            return undefined;
        }

        if (this.length === 0) {
            return this;
        }

        el = this[0];

        if (not(name) || name === "all") {
            return getComputedStyle(el, pseudo);
        } else {
            let result = {}, names = name.split(", ").map(function(el){
                return (""+el).trim();
            });
            if (names.length === 1)  {
                return _getStyle(el, names[0], pseudo);
            } else {
                $.each(names, function () {
                    const prop = this;
                    result[this] = _getStyle(el, prop, pseudo);
                });
                return result;
            }
        }
    },

    removeStyleProperty: function(name){
        if (not(name) || this.length === 0) return this;
        const names = name.split(", ").map(function(el){
            return (""+el).trim();
        });

        return this.each(function(){
            const el = this;
            $.each(names, function(){
                el.style.removeProperty(this);
            });
        });
    },

    css: function(key, val){
        key = key || 'all';

        if (typeof key === "string" && not(val)) {
            return  this.style(key);
        }

        return this.each(function(){
            const el = this;
            if (typeof key === "object") {
                $.each(key, function(key, val){
                    setStyleProp(el, key, val);
                });
            } else if (typeof key === "string") {
                setStyleProp(el, key, val);
            }
        });
    },

    scrollTop: function(val){
        if (not(val)) {
            return this.length === 0 ? undefined : this[0] === window ? scrollY : this[0].scrollTop;
        }
        return this.each(function(){
            this.scrollTop = val;
        });
    },

    scrollLeft: function(val){
        if (not(val)) {
            return this.length === 0 ? undefined : this[0] === window ? scrollX : this[0].scrollLeft;
        }
        return this.each(function(){
            this.scrollLeft = val;
        });
    }
});



$.fn.extend({
    addClass: function(){},
    removeClass: function(){},
    toggleClass: function(){},

    containsClass: function(cls){
        return this.hasClass(cls);
    },

    hasClass: function(cls){
        let result = false;
        const classes = cls.split(" ").filter(function(v){
            return (""+v).trim() !== "";
        });

        if (not(cls)) {
            return false;
        }

        this.each(function(){
            const el = this;

            $.each(classes, function(){
                if (!result && el.classList && el.classList.contains(this)) {
                    result = true;
                }
            });
        });

        return result;
    },

    clearClasses: function(){
        return this.each(function(){
            this.className = "";
        });
    },

    cls: function(array){
        return this.length === 0 ? undefined : array ? this[0].className.split(" ") : this[0].className;
    },

    removeClassBy: function(mask){
        return this.each(function(){
            const el = $(this);
            const classes = el.cls(true);
            $.each(classes, function(){
                const elClass = this;
                if (elClass.indexOf(mask) > -1) {
                    el.removeClass(elClass);
                }
            });
        });
    },

    classNames: function(){
        const args = Array.prototype.slice.call(arguments, 0);
        const classes = [];
        $.each(args, function(_, a){
            if (typeof a === "string") {
                classes.push(a);
            } else if (isPlainObject(a)) {
                $.each(a, function(k, v){
                    if (v) {
                        classes.push(k);
                    }
                });
            } else ;
        });
        return this.each(function(){
            this.className += ' ' + classes.join(' ');
        })
    }
});

['add', 'remove', 'toggle'].forEach(function (method) {
    $.fn[method + "Class"] = function(cls){
        const _classes = !cls
            ? []
            : Array.isArray(cls)
                ? cls
                : cls.split(" ").filter(function (v) { return !!v; });
        if (!_classes.length) return this;
        return this.each(function(){
            const el = this;
            const hasClassList = typeof el.classList !== "undefined";

            if (hasClassList) {
                $.each(_classes, function(_, v){
                    el.classList[method](v);
                });
            } else {
                el.className += _classes.join(" ");
            }
        });
    };
});


$.parseHTML = function(data){
    let base, singleTag, result = [], ctx, _context;
    const regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i; // eslint-disable-line

    if (typeof data !== "string") {
        return [];
    }

    data = data.trim();

    ctx = document.implementation.createHTMLDocument("");
    base = ctx.createElement( "base" );
    base.href = document.location.href;
    ctx.head.appendChild( base );
    _context = ctx.body;

    singleTag = regexpSingleTag.exec(data);

    if (singleTag) {
        result.push(document.createElement(singleTag[1]));
    } else {
        _context.innerHTML = data;
        for(let i = 0; i < _context.childNodes.length; i++) {
            result.push(_context.childNodes[i]);
        }
    }

    return result;
};


$.fn.extend({
    _size: function(prop, val){
        if (this.length === 0) return ;

        if (not(val)) {

            const el = this[0];

            if (prop === 'height') {
                return el === window ? window.innerHeight : el === document ? el.body.clientHeight : parseInt(getComputedStyle(el).height);
            }
            if (prop === 'width') {
                return el === window ? window.innerWidth : el === document ? el.body.clientWidth : parseInt(getComputedStyle(el).width);
            }
        }

        return this.each(function(){
            const el = this;
            if (el === window || el === document) {return ;}
            el.style[prop] = isNaN(val) ? val : val + 'px';
        });
    },

    height: function(val){
        return this._size('height', val);
    },

    width: function(val){
        return this._size('width', val);
    },

    _sizeOut: function(prop, val){
        let el, size, style, result;

        if (this.length === 0) {
            return ;
        }

        if (!not(val) && typeof val !== "boolean") {
            return this.each(function(){
                const el = this;
                if (el === window || el === document) {return ;}
                let h, style = getComputedStyle(el),
                    bs = prop === 'width' ? parseInt(style['border-left-width']) + parseInt(style['border-right-width']) : parseInt(style['border-top-width']) + parseInt(style['border-bottom-width']),
                    pa = prop === 'width' ? parseInt(style['padding-left']) + parseInt(style['padding-right']) : parseInt(style['padding-top']) + parseInt(style['padding-bottom']);

                h = $(this)[prop](val)[prop]() - bs - pa;
                el.style[prop] = h + 'px';
            });
        }

        el = this[0];
        size = el[prop === 'width' ? 'offsetWidth' : 'offsetHeight'];
        style = getComputedStyle(el);
        result = size + parseInt(style[prop === 'width' ? 'margin-left' : 'margin-top']) + parseInt(style[prop === 'width' ? 'margin-right' : 'margin-bottom']);
        return val === true ? result : size;
    },

    outerWidth: function(val){
        return this._sizeOut('width', val);
    },

    outerHeight: function(val){
        return this._sizeOut('height', val);
    },

    padding: function(p){
        if (this.length === 0) return;
        const s = getComputedStyle(this[0], p);

        return {
            top: parseInt(s["padding-top"]),
            right: parseInt(s["padding-right"]),
            bottom: parseInt(s["padding-bottom"]),
            left: parseInt(s["padding-left"])
        };
    },

    margin: function(p){
        if (this.length === 0) return;
        const s = getComputedStyle(this[0], p);

        return {
            top: parseInt(s["margin-top"]),
            right: parseInt(s["margin-right"]),
            bottom: parseInt(s["margin-bottom"]),
            left: parseInt(s["margin-left"])
        };
    },

    border: function(p){
        if (this.length === 0) return;
        const s = getComputedStyle(this[0], p);

        return {
            top: parseInt(s["border-top-width"]),
            right: parseInt(s["border-right-width"]),
            bottom: parseInt(s["border-bottom-width"]),
            left: parseInt(s["border-left-width"])
        };
    }
});

$.fn.extend({
    offset: function(val){
        let rect;

        if (not(val)) {
            if (this.length === 0) return undefined;
            rect = this[0].getBoundingClientRect();
            return {
                top: rect.top + scrollY,
                left: rect.left + scrollX
            };
        }

        return this.each(function(){ //?
            let el = $(this),
                top = val.top,
                left = val.left,
                position = getComputedStyle(this).position,
                offset = el.offset();

            if (position === "static") {
                el.css("position", "relative");
            }

            if (["absolute", "fixed"].indexOf(position) === -1) {
                top = top - offset.top;
                left = left - offset.left;
            }

            el.css({
                top: top,
                left: left
            });
        });
    },

    position: function(margin){
        let ml = 0, mt = 0, el, style;

        if (not(margin) || typeof margin !== "boolean") {
            margin = false;
        }

        if (this.length === 0) {
            return undefined;
        }

        el = this[0];
        style = getComputedStyle(el);

        if (margin) {
            ml = parseInt(style['margin-left']);
            mt = parseInt(style['margin-top']);
        }

        return {
            left: el.offsetLeft - ml,
            top: el.offsetTop - mt
        };
    },

    left: function(val, margin){
        if (this.length === 0) return ;
        if (not(val)) {
            return this.position(margin).left;
        }
        if (typeof val === "boolean") {
            margin = val;
            return this.position(margin).left;
        }
        return this.each(function(){
            $(this).css({
                left: val
            });
        });
    },

    top: function(val, margin){
        if (this.length === 0) return ;
        if (not(val)) {
            return this.position(margin).top;
        }
        if (typeof val === "boolean") {
            margin = val;
            return this.position(margin).top;
        }
        return this.each(function(){
            $(this).css({
                top: val
            });
        });
    },

    coord: function(){
        return this.length === 0 ? undefined : this[0].getBoundingClientRect();
    },

    pos: function(){
        if (this.length === 0) return ;
        return {
            top: parseInt($(this[0]).style("top")),
            left: parseInt($(this[0]).style("left"))
        };
    }
});

$.fn.extend({
    attr: function(name, val){
        const attributes = {};

        if (this.length === 0 && arguments.length === 0) {
            return undefined;
        }

        if (this.length && arguments.length === 0) {
            $.each(this[0].attributes, function(){
                attributes[this.nodeName] = this.nodeValue;
            });
            return attributes;
        }

        if (arguments.length === 1 && typeof name === "string") {
            return this.length && this[0].nodeType === 1 && this[0].hasAttribute(name) ? this[0].getAttribute(name) : undefined;
        }

        return this.each(function(){
            const el = this;
            if (isPlainObject(name)) {
                $.each(name, function(k, v){
                    el.setAttribute(k, v);
                });
            } else {
                el.setAttribute(name, val);
                // console.log(name, val);
            }
        });
    },

    removeAttr: function(name){
        let attributes;

        if (not(name)) {
            return this.each(function(){
                const el = this;
                $.each(this.attributes, function(){
                    el.removeAttribute(this);
                });
            });
        }

        attributes = typeof name === "string" ? name.split(",").map(function(el){
            return el.trim();
        }) : name;

        return this.each(function(){
            const el = this;
            $.each(attributes, function(){
                if (el.hasAttribute(this)) el.removeAttribute(this);
            });
        });
    },

    toggleAttr: function(name, val){
        return this.each(function(){
            const el = this;

            if (not(val)) {
                el.removeAttribute(name);
            } else {
                el.setAttribute(name, val);
            }

        });
    },

    id: function(val){
        if (typeof val === "undefined") {
            return this.length === 1
                ? $(this[0]).attr("id")
                : this.map(el => $(el).attr("id"))
        }
        return this.each(function(){
            $(this).attr("id", val);
        });
    }
});

$.extend({
    meta: function(name){
        return not(name) ? $("meta") : $("meta[name='$name']".replace("$name", name));
    },

    metaBy: function(name){
        return not(name) ? $("meta") : $("meta[$name]".replace("$name", name));
    },

    doctype: function(){
        return $("doctype");
    },

    html: function(){
        return $("html");
    },

    head: function(){
        return $("html").find("head");
    },

    body: function(){
        return $("body");
    },

    document: function(){
        return $(document);
    },

    window: function(){
        return $(window);
    },

    charset: function(val){
        if (val) {
            const m = $('meta[charset]');
            if (m.length > 0) {
                m.attr('charset', val);
            }
        }
        return document.characterSet
    }
});

$.extend({
    bind: (fn, ctx) => fn.bind(ctx)
});


(function (arr) {
    arr.forEach(function (item) {
        ['append', 'prepend'].forEach(function(where){
            if (hasProp(item, where)) {
                return;
            }

            Object.defineProperty(item, where, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function () {
                    const argArr = Array.prototype.slice.call(arguments),
                        docFrag = document.createDocumentFragment();

                    argArr.forEach(function (argItem) {
                        const isNode = argItem instanceof Node;
                        docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                    });

                    if (where === 'prepend')
                        this.insertBefore(docFrag, this.firstChild);
                    else
                        this.appendChild(docFrag);
                }
            });
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

const normalizeElements = function(s){
    let result;

    if (typeof s === "string") result = $.isSelector(s) ? $(s) : $.parseHTML(s);
    else if (s instanceof HTMLElement) result = [s];
    else if (isArrayLike$1(s)) result = s;
    return result;
};

$.fn.extend({

    appendText: function(text){
        return this.each(function(elIndex, el){
            el.innerHTML += text;
        });
    },

    prependText: function(text){
        return this.each(function(elIndex, el){
            el.innerHTML = text + el.innerHTML;
        });
    },

    append: function(elements){
        const _elements = normalizeElements(elements);

        return this.each(function(elIndex, el){
            $.each(_elements, function(){
                if (el === this) return ;
                const child = elIndex === 0 ? this : this.cloneNode(true);
                $.script(child);
                if (child.tagName && child.tagName !== "SCRIPT") el.append(child);
            });
        });
    },

    appendTo: function(elements){
        const _elements = normalizeElements(elements);

        return this.each(function(){
            const el = this;
            $.each(_elements, function(parIndex, parent){
                if (el === this) return ;
                parent.append(parIndex === 0 ? el : el.cloneNode(true));
            });
        });
    },

    prepend: function(elements){
        const _elements = normalizeElements(elements);

        return this.each(function (elIndex, el) {
            $.each(_elements, function(){
                if (el === this) return ;
                const child = elIndex === 0 ? this : this.cloneNode(true);
                $.script(child);
                if (child.tagName && child.tagName !== "SCRIPT") el.prepend(child);
            });
        });
    },

    prependTo: function(elements){
        const _elements = normalizeElements(elements);

        return this.each(function(){
            const el = this;
            $.each(_elements, function(parIndex, parent){
                if (el === this) return ;
                $(parent).prepend(parIndex === 0 ? el : el.cloneNode(true));
            });
        });
    },

    insertBefore: function(elements){
        const _elements = normalizeElements(elements);

        return this.each(function(){
            const el = this;
            $.each(_elements, function(elIndex){
                if (el === this) return ;
                const parent = this.parentNode;
                if (parent) {
                    parent.insertBefore(elIndex === 0 ? el : el.cloneNode(true), this);
                }
            });
        });
    },

    insertAfter: function(elements){
        const _elements = normalizeElements(elements);

        return this.each(function(){
            const el = this;
            $.each(_elements, function(elIndex, element){
                if (el === this) return ;
                const parent = this.parentNode;
                if (parent) {
                    parent.insertBefore(elIndex === 0 ? el : el.cloneNode(true), element.nextSibling);
                }
            });
        });
    },

    after: function(html){
        return this.each(function(){
            const el = this;
            if (typeof html === "string") {
                el.insertAdjacentHTML('afterend', html);
            } else {
                $(html).insertAfter(el);
            }
        });
    },

    before: function(html){
        return this.each(function(){
            const el = this;
            if (typeof html === "string") {
                el.insertAdjacentHTML('beforebegin', html);
            } else {
                $(html).insertBefore(el);
            }
        });
    },

    clone: function(deep, withData){
        const res = [];
        if (not(deep)) {
            deep = false;
        }
        if (not(withData)) {
            withData = false;
        }
        this.each(function(){
            const el = this.cloneNode(deep);
            const $el = $(el);
            let data;
            if (withData && $.hasData(this)) {
                data = $(this).data();
                $.each(data, function(k, v){
                    $el.data(k, v);
                });
            }
            res.push(el);
        });
        return $.merge($(), res);
    },

    import: function(deep){
        const res = [];
        if (not(deep)) {
            deep = false;
        }
        this.each(function(){
            res.push(document.importNode(this, deep));
        });
        return $.merge($(), res);
    },

    adopt: function(){
        const res = [];
        this.each(function(){
            res.push(document.adoptNode(this));
        });
        return $.merge($(), res);
    },

    remove: function(selector){
        let i = 0, node, out, res = [];

        if (this.length === 0) {
            return ;
        }

        out = selector ? this.filter(function(el){
            return matches.call(el, selector);
        }) : this.items();

        for ( ; ( node = out[ i ] ) != null; i++ ) {
            if (node.parentNode) {
                res.push(node.parentNode.removeChild(node));
                $.removeData(node);
            }
        }

        return $.merge($(), res);
    },

    wrap: function( el ){
        if (this.length === 0) {
            return ;
        }

        const wrapper = $(normalizeElements(el));

        if (!wrapper.length) {
            return ;
        }

        const res = [];

        this.each(function(){
            let _target, _wrapper;

            _wrapper = wrapper.clone(true, true);
            _wrapper.insertBefore(this);

            _target = _wrapper;
            while (_target.children().length) {
                _target = _target.children().eq(0);
            }
            _target.append(this);

            res.push(_wrapper);
        });

        return $(res);
    },

    wrapAll: function( el ){
        let wrapper, _wrapper, _target;

        if (this.length === 0) {
            return ;
        }

        wrapper = $(normalizeElements(el));

        if (!wrapper.length) {
            return ;
        }

        _wrapper = wrapper.clone(true, true);
        _wrapper.insertBefore(this[0]);

        _target = _wrapper;
        while (_target.children().length) {
            _target = _target.children().eq(0);
        }

        this.each(function(){
            _target.append(this);
        });

        return _wrapper;
    },

    wrapInner: function( el ){
        if (this.length === 0) {
            return ;
        }

        const wrapper = $(normalizeElements(el));

        if (!wrapper.length) {
            return ;
        }

        const res = [];

        this.each(function(){
            const elem = $(this);
            const html = elem.html();
            const wrp = wrapper.clone(true, true);
            elem.html(wrp.html(html));
            res.push(wrp);
        });

        return $(res);
    }
});

$.extend({
    animation: {
        duration: 1000,
        ease: "linear",
        elements: {}
    }
});

if (typeof window["setupAnimation"] === 'object') {
    $.each(window["setupAnimation"], function(key, val){
        if (typeof $.animation[key] !== "undefined" && !not(val))
            $.animation[key] = val;
    });
}

const transformProps$1 = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY'];
const numberProps$1 = ['opacity', 'zIndex'];
const floatProps$1 = ['opacity', 'volume'];
const scrollProps$1 = ["scrollLeft", "scrollTop"];
const reverseProps$1 = ["opacity", "volume"];

function _validElement(el) {
    return el instanceof HTMLElement || el instanceof SVGElement;
}

/**
 *
 * @param to
 * @param from
 * @returns {*}
 * @private
 */
function _getRelativeValue$1 (to, from) {
    const operator = /^(\*=|\+=|-=)/.exec(to);
    if (!operator) return to;
    const u = getUnit$1(to) || 0;
    const x = parseFloat(from);
    const y = parseFloat(to.replace(operator[0], ''));
    switch (operator[0][0]) {
        case '+':
            return x + y + u;
        case '-':
            return x - y + u;
        case '*':
            return x * y + u;
        case '/':
            return x / y + u;
    }
}

/**
 *
 * @param el
 * @param prop
 * @param pseudo
 * @returns {*|number|string}
 * @private
 */
function _getStyle$1 (el, prop, pseudo){
    if (typeof el[prop] !== "undefined") {
        if (scrollProps$1.indexOf(prop) > -1) {
            return prop === "scrollLeft" ? el === window ? pageXOffset : el.scrollLeft : el === window ? pageYOffset : el.scrollTop;
        } else {
            return el[prop] || 0;
        }
    }

    return el.style[prop] || getComputedStyle(el, pseudo)[prop];
}

/**
 *
 * @param el
 * @param key
 * @param val
 * @param unit
 * @param toInt
 * @private
 */
function _setStyle$1 (el, key, val, unit, toInt) {

    if (not(toInt)) {
        toInt = false;
    }

    key = camelCase$1(key);

    if (toInt) {
        val  = parseInt(val);
    }

    if (_validElement(el)) {
        if (typeof el[key] !== "undefined") {
            el[key] = val;
        } else {
            el.style[key] = key === "transform" || key.toLowerCase().indexOf('color') > -1 ? val : val + unit;
        }
    } else {
        el[key] = val;
    }
}

/**
 *
 * @param el
 * @param mapProps
 * @param p
 * @private
 */
function _applyStyles$1 (el, mapProps, p) {
    $.each(mapProps, function (key, val) {
        _setStyle$1(el, key, val[0] + (val[2] * p), val[3], val[4]);
    });
}

/**
 *
 * @param el
 * @returns {{}}
 * @private
 */
function _getElementTransforms$1 (el) {
    if (!_validElement(el)) return {};
    const str = el.style.transform || '';
    const reg = /(\w+)\(([^)]*)\)/g;
    const transforms = {};
    let m;

    while (m = reg.exec(str))
        transforms[m[1]] = m[2];

    return transforms;
}

/**
 *
 * @param val
 * @returns {number[]}
 * @private
 */
function _getColorArrayFromHex$1 (val){
    const a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(val ? val : "#000000");
    return a.slice(1).map(function(v) {
        return parseInt(v, 16);
    });
}

/**
 *
 * @param el
 * @param key
 * @returns {number[]}
 * @private
 */
function _getColorArrayFromElement$1 (el, key) {
    return getComputedStyle(el)[key].replace(/[^\d.,]/g, '').split(',').map(function(v) {
        return parseInt(v);
    });
}

/**
 *
 * @param el
 * @param mapProps
 * @param p
 * @private
 */
function _applyTransform$1 (el, mapProps, p) {
    const t = [];
    const elTransforms = _getElementTransforms$1(el);

    $.each(mapProps, function(key, val) {
        let from = val[0], to = val[1], delta = val[2], unit = val[3];
        key = "" + key;

        if ( key.indexOf("rotate") > -1 || key.indexOf("skew") > -1) {
            if (unit === "") unit = "deg";
        }

        if (key.indexOf('scale') > -1) {
            unit = '';
        }

        if (key.indexOf('translate') > -1 && unit === '') {
            unit = 'px';
        }

        if (unit === "turn") {
            t.push(key+"(" + (to * p) + unit + ")");
        } else {
            t.push(key +"(" + (from + (delta * p)) + unit+")");
        }
    });

    $.each(elTransforms, function(key, val) {
        if (mapProps[key] === undefined) {
            t.push(key+"("+val+")");
        }
    });

    el.style.transform = t.join(" ");
}

/**
 *
 * @param el
 * @param mapProps
 * @param p
 * @private
 */
function _applyColors$1 (el, mapProps, p) {
    $.each(mapProps, function (key, val) {
        let i, result = [0, 0, 0], v;
        for (i = 0; i < 3; i++) {
            result[i] = Math.floor(val[0][i] + (val[2][i] * p));
        }
        v = "rgb("+(result.join(","))+")";
        el.style[key] = v;
    });
}

/**
 *
 * @param val
 * @returns {string|*}
 * @private
 */
function _expandColorValue$1 (val) {
    const regExp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    if (val[0] === "#" && val.length === 4) {
        return "#" + val.replace(regExp, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
    }
    return val[0] === "#" ? val : "#"+val;
}

/**
 *
 * @param el
 * @param map
 * @param p
 */
function applyProps$1 (el, map, p) {
    _applyStyles$1(el, map.props, p);
    _applyTransform$1(el, map.transform, p);
    _applyColors$1(el, map.color, p);
}

/**
 *
 * @param el
 * @param draw
 * @param dir
 * @returns {{transform: {}, color: {}, props: {}}}
 */
function createAnimationMap$1 (el, draw, dir) {
    const map = {
        props: {},
        transform: {},
        color: {}
    };
    let i, from, to, delta, unit, temp;
    const elTransforms = _getElementTransforms$1(el);

    if (not(dir)) {
        dir = "normal";
    }

    $.each(draw, function(key, val) {

        const isTransformProp = transformProps$1.indexOf(""+key) > -1;
        const isNumProp = numberProps$1.indexOf(""+key) > -1;
        const isColorProp = (""+key).toLowerCase().indexOf("color") > -1;

        if (Array.isArray(val) && val.length === 1) {
            val = val[0];
        }

        if (!Array.isArray(val)) {
            if (isTransformProp) {
                from = elTransforms[key] || 0;
            } else if (isColorProp) {
                from = _getColorArrayFromElement$1(el, key);
            } else {
                from = _getStyle$1(el, key, undefined);
            }
            from = !isColorProp ? parseUnit$1(from) : from;
            to = !isColorProp ? parseUnit$1(_getRelativeValue$1(val, Array.isArray(from) ? from[0] : from)) : _getColorArrayFromHex$1(val);
        } else {
            from = !isColorProp ? parseUnit$1(val[0]) : _getColorArrayFromHex$1(_expandColorValue$1(val[0]));
            to = !isColorProp ? parseUnit$1(val[1]) : _getColorArrayFromHex$1(_expandColorValue$1(val[1]));
        }

        if (reverseProps$1.indexOf(""+key) > -1 && from[0] === to[0]) {
            from[0] = to[0] > 0 ? 0 : 1;
        }

        if (dir === "reverse") {
            temp = from;
            from = to;
            to = temp;
        }

        unit = el instanceof HTMLElement && to[1] === '' && !isNumProp && !isTransformProp ? 'px' : to[1];

        if (isColorProp) {
            delta = [0, 0, 0];
            for (i = 0; i < 3; i++) {
                delta[i] = to[i] - from[i];
            }
        } else {
            delta = to[0] - from[0];
        }

        if (isTransformProp) {
            map.transform[key] = [from[0], to[0], delta, unit];
        } else if (isColorProp) {
            map.color[key] = [from, to, delta, unit];
        } else {
            map.props[key] = [from[0], to[0], delta, unit, floatProps$1.indexOf(""+key) === -1];
        }
    });

    return map;
}

function minMax$1(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

const Easing$1 = {
    linear: function(){return function(t) {return t;};}
};

Easing$1.default = Easing$1.linear;

const eases$1 = {
    Sine: function(){
        return function(t){
            return 1 - Math.cos(t * Math.PI / 2);
        };
    },
    Circ: function(){
        return function(t){
            return 1 - Math.sqrt(1 - t * t);
        };
    },
    Back: function(){
        return function(t){
            return t * t * (3 * t - 2);
        };
    },
    Bounce: function(){
        return function(t){
            let pow2, b = 4;
            while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2);
        };
    },
    Elastic: function(amplitude, period){
        if (not(amplitude)) {
            amplitude = 1;
        }

        if (not(period)) {
            period = 0.5;
        }
        const a = minMax$1(amplitude, 1, 10);
        const p = minMax$1(period, 0.1, 2);
        return function(t){
            return (t === 0 || t === 1) ? t :
                -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        };
    }
};

['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach(function(name, i) {
    eases$1[name] = function(){
        return function(t){
            return Math.pow(t, i + 2);
        };
    };
});

Object.keys(eases$1).forEach(function(name) {
    const easeIn = eases$1[name];
    Easing$1['easeIn' + name] = easeIn;
    Easing$1['easeOut' + name] = function(a, b){
        return function(t){
            return 1 - easeIn(a, b)(1 - t);
        };
    };
    Easing$1['easeInOut' + name] = function(a, b){
        return function(t){
            return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
        };
    };
});

let defaultAnimationProps = {
    id: null,
    el: null,
    draw: {},
    dur: $.animation.duration,
    ease: $.animation.ease,
    loop: 0,
    pause: 0,
    dir: "normal",
    defer: 0,
    onStart: function(){},
    onStop: function(){},
    onStopAll: function(){},
    onPause: function(){},
    onPauseAll: function(){},
    onResume: function(){},
    onResumeAll: function(){},
    onFrame: function(){},
    onDone: function(){}
};

function animate$1(args){
    return new Promise(function(resolve){
        const that = this;
        const props = $.assign({}, defaultAnimationProps, {dur: $.animation.duration, ease: $.animation.ease}, args);
        let id = props.id, el = props.el, draw = props.draw, dur = props.dur, ease = props.ease, loop = props.loop,
            onStart = props.onStart, onFrame = props.onFrame, onDone = props.onDone,
            pauseStart = props.pause, dir = props.dir, defer = props.defer;
        let map = {};
        let easeName = "linear", easeArgs = [], easeFn = Easing$1.linear, matchArgs;
        let direction = dir === "alternate" ? "normal" : dir;
        let replay = false;
        let animationID = id ? id : +(performance.now() * Math.pow(10, 14));

        if (not(el)) {
            throw new Error("Unknown element!");
        }

        if (typeof el === "string") {
            el = document.querySelector(el);
        }

        if (typeof draw !== "function" && typeof draw !== "object") {
            throw new Error("Unknown draw object. Must be a function or object!");
        }

        if (dur === 0) {
            dur = 1;
        }

        if (dir === "alternate" && typeof loop === "number") {
            loop *= 2;
        }

        if (typeof ease === "string") {
            matchArgs = /\(([^)]+)\)/.exec(ease);
            easeName = ease.split("(")[0];
            easeArgs = matchArgs ? matchArgs[1].split(',').map(function(p){return parseFloat(p);}) : [];
            easeFn = Easing$1[easeName] || Easing$1.linear;
        } else if (typeof ease === "function") {
            easeFn = ease;
        } else {
            easeFn = Easing$1.linear;
        }

        $.animation.elements[animationID] = {
            element: el,
            id: null,
            stop: 0,
            pause: 0,
            loop: 0,
            t: -1,
            started: 0,
            paused: 0
        };

        const play = function() {
            if (typeof draw === "object") {
                map = createAnimationMap$1(el, draw, direction);
            }

            if (typeof onStart === "function") {
                onStart.apply(el);
            }

            // start = performance.now();
            $.animation.elements[animationID].loop += 1;
            $.animation.elements[animationID].started = performance.now();
            $.animation.elements[animationID].duration = dur;
            $.animation.elements[animationID].id = requestAnimationFrame(animate);
        };

        const done = function() {
            cancelAnimationFrame($.animation.elements[animationID].id);
            delete $.animation.elements[id];

            if (typeof onDone === "function") {
                onDone.apply(el);
            }

            resolve(that);
        };

        const animate = function(time) {
            let p, t;
            let {stop, pause, started: start} = $.animation.elements[animationID];

            if ($.animation.elements[animationID].paused) {
                start = time - $.animation.elements[animationID].t * dur;
                $.animation.elements[animationID].started = start;
            }

            t = ((time - start) / dur).toFixed(4);

            if (t > 1) t = 1;
            if (t < 0) t = 0;

            p = easeFn.apply(null, easeArgs)(t);

            $.animation.elements[animationID].t = t;
            $.animation.elements[animationID].p = p;

            if (pause) {
                $.animation.elements[animationID].id = requestAnimationFrame(animate);
                return;
            }

            if ( stop > 0) {
                if (stop === 2) {
                    if (typeof draw === "function") {
                        draw.bind(el)(1, 1);
                    } else {
                        applyProps$1(el, map, 1);
                    }
                }
                done();
                return;
            }

            if (typeof draw === "function") {
                draw.bind(el)(t, p);
            } else {
                applyProps$1(el, map, p);
            }

            if (typeof onFrame === 'function') {
                onFrame.apply(el, [t, p]);
            }

            if (t < 1) {
                $.animation.elements[animationID].id = requestAnimationFrame(animate);
            }

            if (parseInt(t) === 1) {
                if (loop) {
                    if (dir === "alternate") {
                        direction = direction === "normal" ? "reverse" : "normal";
                    }

                    if (typeof loop === "boolean") {
                        setTimeout(function () {
                            play();
                        }, pauseStart);
                    } else {
                        if (loop > $.animation.elements[animationID].loop) {
                            setTimeout(function () {
                                play();
                            }, pauseStart);
                        } else {
                            done();
                        }
                    }
                } else {
                    if (dir === "alternate" && !replay) {
                        direction = direction === "normal" ? "reverse" : "normal";
                        replay = true;
                        play();
                    } else {
                        done();
                    }
                }
            }
        };
        if (defer > 0) {
            setTimeout(function() {
                play();
            }, defer);
        } else {
            play();
        }
    });
}

// Stop animation
function stopAnimation(id, done){
    const an = $.animation.elements[id];

    if (typeof an === "undefined") {
        return ;
    }

    if (not(done)) {
        done = true;
    }

    an.stop = done === true ? 2 : 1;

    if (typeof an.onStop === "function") {
        an.onStop.apply(an.element);
    }
}

function stopAnimationAll(done, filter){
    $.each($.animation.elements, function(k, v){
        if (filter) {
            if (typeof filter === "string") {
                if (matches.call(v.element, filter)) stopAnimation(k, done);
            } else if (filter.length) {
                $.each(filter, function(){
                    if (v.element === this) stopAnimation(k, done);
                });
            } else if (filter instanceof Element) {
                if (v.element === filter) stopAnimation(k, done);
            }
        } else {
            stopAnimation(k, done);
        }
    });
}
// end of stop

// Pause and resume animation
function pauseAnimation(id){
    const an = $.animation.elements[id];

    if (typeof an === "undefined") {
        return ;
    }

    an.pause = 1;
    an.paused = performance.now();

    if (typeof an.onPause === "function") {
        an.onPause.apply(an.element);
    }
}

function pauseAnimationAll(filter){
    $.each($.animation.elements, function(k, v){
        if (filter) {
            if (typeof filter === "string") {
                if (matches.call(v.element, filter)) pauseAnimation(k);
            } else if (filter.length) {
                $.each(filter, function(){
                    if (v.element === this) pauseAnimation(k);
                });
            } else if (filter instanceof Element) {
                if (v.element === filter) pauseAnimation(k);
            }
        } else {
            pauseAnimation(k);
        }
    });
}
// end of pause

function resumeAnimation(id){
    const an = $.animation.elements[id];

    if (typeof an === "undefined") {
        return ;
    }

    an.pause = 0;
    an.paused = 0;

    if (typeof an.onResume === "function") {
        an.onResume.apply(an.element);
    }
}

function resumeAnimationAll(filter){
    $.each($.animation.elements, function(k, v){
        if (filter) {
            if (typeof filter === "string") {
                if (matches.call(v.element, filter)) resumeAnimation(k);
            } else if (filter.length) {
                $.each(filter, function(){
                    if (v.element === this) resumeAnimation(k);
                });
            } else if (filter instanceof Element) {
                if (v.element === filter) resumeAnimation(k);
            }
        } else {
            resumeAnimation(k);
        }
    });
}

/* eslint-enable */

let defaultChainOptions = {
    loop: false,
    onChainItem: null,
    onChainItemComplete: null,
    onChainComplete: null
};

function chain$1(arr, opt){
    const o = $.extend({}, defaultChainOptions, opt);

    if (typeof o.loop !== "boolean") {
        o.loop--;
    }

    if (!Array.isArray(arr)) {
        console.warn("Chain array is not defined!");
        return false;
    }

    const reducer = function(acc, item){
        return acc.then(function(){
            if (typeof o["onChainItem"] === "function") {
                o["onChainItem"](item);
            }
            return animate$1(item).then(function(){
                if (typeof o["onChainItemComplete"] === "function") {
                    o["onChainItemComplete"](item);
                }
            });
        });
    };

    arr.reduce(reducer, Promise.resolve()).then(function(){
        if (typeof o["onChainComplete"] === "function") {
            o["onChainComplete"]();
        }

        if (o.loop) {
            chain$1(arr, o);
        }
    });
}

$.easing = {};

$.extend($.easing, Easing$1);

$.extend({
    animate: function(args){
        let el, draw, dur, ease, cb;

        if (arguments.length > 1) {
            el = $(arguments[0])[0];
            draw = arguments[1];
            dur = arguments[2] || $.animation.duration;
            ease = arguments[3] || $.animation.ease;
            cb = arguments[4];

            if (typeof dur === 'function') {
                cb = dur;
                ease = $.animation.ease;
                dur = $.animation.duration;
            }

            if (typeof ease === 'function') {
                cb = ease;
                ease = $.animation.ease;
            }

            return animate$1({
                el: el,
                draw: draw,
                dur: dur,
                ease: ease,
                onDone: cb
            });
        }

        return animate$1(args);
    },
    chain: chain$1,
    stop: stopAnimation,
    stopAll: stopAnimationAll,
    resume: resumeAnimation,
    resumeAll: resumeAnimationAll,
    pause: pauseAnimation,
    pauseAll: pauseAnimationAll
});

$.fn.extend({
    /**
     *

     args = {
     draw: {} | function,
     dur: 1000,
     ease: "linear",
     loop: 0,
     pause: 0,
     dir: "normal",
     defer: 0,
     onFrame: function,
     onDone: function
     }

     * @returns {this}
     */
    animate: function(args){
        const that = this;
        let draw, dur, easing, cb;
        const a = args;
        let compatibilityMode;

        compatibilityMode = !Array.isArray(args) && (arguments.length > 1 || (arguments.length === 1 && typeof arguments[0].draw === 'undefined'));

        if ( compatibilityMode ) {
            draw = arguments[0];
            dur = arguments[1] || $.animation.duration;
            easing = arguments[2] || $.animation.ease;
            cb = arguments[3];

            if (typeof dur === 'function') {
                cb = dur;
                dur = $.animation.duration;
                easing = $.animation.ease;
            }

            if (typeof easing === 'function') {
                cb = easing;
                easing = $.animation.ease;
            }

            return this.each(function(){
                return $.animate({
                    el: this,
                    draw: draw,
                    dur: dur,
                    ease: easing,
                    onDone: cb
                });
            });
        }

        if (Array.isArray(args)) {
            $.each(args, function(){
                const a = this;
                that.each(function(){
                    a.el = this;
                    $.animate(a);
                });
            });
            return this;
        }

        return this.each(function(){
            a.el = this;
            $.animate(a);
        });
    },

    chain: function(arr, loop){
        return this.each(function(){
            const el = this;
            $.each(arr, function(){
                this.el = el;
            });
            $.chain(arr, loop);
        });
    },

    /**
     *
     * @param done
     * @returns {this}
     */
    stop: function(done){
        return this.each(function(){
            const el = this;
            $.each($.animation.elements, function(k, o){
                if (o.element === el) {
                    stopAnimation(k, done);
                }
            });
        });
    },

    pause: function(){
        return this.each(function(){
            const el = this;
            $.each($.animation.elements, function(k, o){
                if (o.element === el) {
                    pauseAnimation(k);
                }
            });
        });
    },

    resume: function(){
        return this.each(function(){
            const el = this;
            $.each($.animation.elements, function(k, o){
                if (o.element === el) {
                    resumeAnimation(k);
                }
            });
        });
    }
});

$.extend({
    hidden: function(el, val, cb){
        el = $(el)[0];

        if (typeof val === "string") {
            val = val.toLowerCase() === "true";
        }

        if (typeof val === "function") {
            cb = val;
            val = !el.hidden;
        }

        el.hidden = val;

        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }

        return this;
    },

    hide: function(el, cb){
        const $el = $(el);

        el = $el[0];

        const inline = el.style.display;
        const css = getComputedStyle(el, null).display;

        $el.origin('display', {
            inline,
            css
        });

        el.style.display = 'none';

        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }

        return this;
    },

    show: function(el, cb){
        const $el = $(el);
        const display = $el.origin('display');

        el = $(el)[0];

        el.style.display = '';

        if (display) {
            const inline = display.inline || '';
            const css = display.css || '';
            if (inline && inline !== 'none') {
                el.style.display = inline;
            } else if (css === 'none') {
                el.style.display = 'block';
            }
        } else {
            el.style.display = 'block';
        }

        if (parseInt(el.style.opacity) === 0) {
            el.style.opacity = "1";
        }

        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }

        return this;
    },

    visible: function(el, mode, cb){
        if (mode === undefined) {
            mode = true;
        }
        el.style.visibility = mode ? 'visible' : 'hidden';
        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }
        return this;
    },

    toggle: function(el, cb){
        const func = getComputedStyle(el, null).display !== 'none' ? 'hide' : 'show';
        return $[func](el, cb);
    }
});

$.fn.extend({
    hide: function(){
        let callback;

        $.each(arguments, function(){
            if (typeof this === 'function') {
                callback = this;
            }
        });

        return this.each(function(){
            $.hide(this, callback);
        });
    },

    show: function(){
        let callback;

        $.each(arguments, function(){
            if (typeof this === 'function') {
                callback = this;
            }
        });

        return this.each(function(){
            $.show(this, callback);
        });
    },

    visible: function(mode, cb){
        return this.each(function(){
            $.visible(this, mode, cb);
        });
    },

    toggle: function(cb){
        return this.each(function(){
            $.toggle(this, cb);
        });
    },

    hidden: function(val, cb){
        return this.each(function(){
            $.hidden(this, val, cb);
        });
    }
});



$.extend({
    fx: {
        off: false
    }
});

$.fn.extend({
    fadeIn: function(dur, easing, cb){
        return this.each(function(){
            const el = this;
            const $el = $(el);
            const visible = !(!isVisible(el) || (isVisible(el) && +($el.style('opacity')) === 0));

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }

            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            if ($.fx.off) {
                dur = 0;
            }

            if (visible) {
                if (typeof cb === 'function') {
                    $.bind(cb, this)();
                }
                return this;
            }

            const originDisplay = $el.origin("display", undefined, 'block');

            el.style.opacity = "0";
            el.style.display = originDisplay;

            return $.animate({
                el,
                draw: {
                    opacity: 1
                },
                dur,
                ease: easing,
                onDone: function(){
                    if (typeof cb === 'function') {
                        $.bind(cb, this)();
                    }
                }
            });
        });
    },

    fadeOut: function(dur, easing, cb){
        return this.each(function(){
            const el = this;
            const $el = $(el);

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else
            if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }
            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            $el.origin("display", $el.style('display'));

            if ( !isVisible(el) ) {
                if (typeof cb === 'function') {
                    $.bind(cb, this)();
                }
                return this;
            }

            return $.animate({
                el,
                draw: {
                    opacity: 0
                },
                dur,
                ease: easing,
                onDone: function(){
                    this.style.display = 'none';

                    if (typeof cb === 'function') {
                        $.bind(cb, this)();
                    }
                }
            });
        });
    },

    slideUp: function(dur, easing, cb){
        return this.each(function(){
            const el = this;
            const $el = $(el);
            let currHeight;

            if ($el.height() === 0) return ;

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else
            if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }
            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            currHeight = $el.height();
            $el.origin("height", currHeight);
            $el.origin("display", $(el).style('display'));

            $el.css({
                overflow: "hidden"
            });

            return $.animate({
                el,
                draw: {
                    height: 0
                },
                dur,
                ease: easing,
                onDone: function(){
                    $el.hide().removeStyleProperty("overflow, height");
                    if (typeof cb === 'function') {
                        $.bind(cb, this)();
                    }
                }
            });
        });
    },

    slideDown: function(dur, easing, cb){
        return this.each(function(){
            const el = this;
            const $el = $(el);
            let targetHeight, originDisplay;

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else
            if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }
            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            $el.show().visible(false);
            targetHeight = +$el.origin("height", undefined, $el.height());
            if (parseInt(targetHeight) === 0) {
                targetHeight = el.scrollHeight;
            }
            originDisplay = $el.origin("display", $el.style('display'), "block");
            $el.height(0).visible(true);

            $el.css({
                overflow: "hidden",
                display: originDisplay === "none" ? "block" : originDisplay
            });

            return $.animate({
                el,
                draw: {
                    height: targetHeight
                },
                dur,
                ease: easing,
                onDone: function(){
                    $(el).removeStyleProperty("overflow, height, visibility");
                    if (typeof cb === 'function') {
                        $.bind(cb, this)();
                    }
                }
            });
        });
    },

    moveTo: function(x, y, dur, ease, cb){
        const draw = {
            top: y,
            left: x
        };

        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            ease = $.animation.ease;
        }

        if (typeof ease === "function") {
            cb = ease;
            ease = $.animation.ease;
        }

        return this.each(function(){
            $.animate({
                el: this,
                draw,
                dur,
                ease,
                onDone: cb
            });
        });
    },

    centerTo: function(x, y, dur, ease, cb){
        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            ease = $.animation.ease;
        }

        if (typeof ease === "function") {
            cb = ease;
            ease = $.animation.ease;
        }

        return this.each(function(){
            const draw = {
                left: x - this.clientWidth / 2,
                top: y - this.clientHeight / 2
            };
            $.animate({
                el: this,
                draw,
                dur,
                ease,
                onDone: cb
            });
        });
    },

    colorTo: function(color, dur, easing, cb){
        const draw = {
            color: color
        };

        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            easing = $.animation.ease;
        }

        if (typeof easing === "function") {
            cb = easing;
            easing = $.animation.ease;
        }

        return this.each(function(){
            $.animate({
                el: this,
                draw,
                dur,
                ease: easing,
                onDone: cb
            });
        });
    },

    backgroundTo: function(color, dur, easing, cb){
        const draw = {
            backgroundColor: color
        };

        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            easing = $.animation.ease;
        }

        if (typeof easing === "function") {
            cb = easing;
            easing = $.animation.ease;
        }

        return this.each(function(){
            $.animate({
                el: this,
                draw,
                dur,
                ease: easing,
                onDone: cb
            });
        });
    }
});

$.init = function(sel, ctx){
    let parsed;
    const that = this;

    if (typeof sel === "string") {
        sel = sel.trim();
    }

    this.uid = $.uniqueId();

    if (!sel) {
        return this;
    }

    if (typeof sel === "function") {
        return $.ready(sel);
    }

    if (sel instanceof Element) {
        this.push(sel);
        return this;
    }

    if (sel instanceof $) {
        $.each(sel, function(){
            that.push(this);
        });
        return this;
    }

    if (sel === "window") sel = window;
    if (sel === "document") sel = document;
    if (sel === "body") sel = document.body;
    if (sel === "html") sel = document.documentElement;
    if (sel === "doctype") sel = document.doctype;
    if (sel && (sel.nodeType || sel.self === window)) {
        this.push(sel);
        return this;
    }

    if (isArrayLike$1(sel)) {
        $.each(sel, function(){
            $(this).each(function(){
                that.push(this);
            });
        });
        return this;
    }

    if (typeof sel !== "string" && (sel.self && sel.self !== window)) {
        return this;
    }

    if (sel === "#" || sel === ".") {
        console.error("Selector can't be # or .") ;
        return this;
    }

    if (sel[0] === "@") {

        $("[data-role]").each(function(){
            const roles = str2arr($(this).attr("data-role"), ",");
            if (roles.indexOf(sel.slice(1)) > -1) {
                that.push(this);
            }
        });

    } else {

        parsed = $.parseHTML(sel);

        if (parsed.length === 1 && parsed[0].nodeType === 3) { // Must be a text node -> css sel
            try {
                [].push.apply(this, document.querySelectorAll(sel));
            } catch (e) {
                //console.error(sel + " is not a valid selector");
            }
        } else {
            $.merge(this, parsed);
        }
    }

    if (ctx !== undefined) {
        if (ctx instanceof $) {
            this.each(function () {
                $(ctx).append(that);
            });
        } else if (ctx instanceof HTMLElement) {
            $(ctx).append(that);
        } else {
            if (isPlainObject(ctx)) {
                $.each(this,function(){
                    for(const name in ctx) {
                        if (hasProp(ctx, name))
                            this.setAttribute(name, ctx[name]);
                    }
                });
            }
        }
    }

    return this;
};

$.init.prototype = $.fn;

// import "./m4q.js"

globalThis.$ = $;
globalThis.m4q = $;

/*!
 * HooksJS - The set of hooks  (https://github.com/olton/hooks)
 * Copyright 2024 by Serhii Pimenov
 * Licensed under MIT
 !*/

const state = [];
let stateIndex = -1;
const useState = (initialState, onStateChange) => {
    const index = stateIndex++;
    state[index] = { value: initialState };
    const setState = (arg) => {
        const old = state[index].value;
        state[index].value = typeof arg === "function" ? arg(old) : arg;
        if (typeof onStateChange === "function") {
            onStateChange(state[index].value, old);
        }
    };
    return [state[index], setState];
};

var EVENTS;
(function (EVENTS) {
    EVENTS["LOAD"] = "load";
    EVENTS["VIEWPORT"] = "viewport";
    EVENTS["ATTRIBUTE"] = "attribute";
    EVENTS["CHILDREN"] = "children";
    EVENTS["DATA"] = "data";
})(EVENTS || (EVENTS = {}));
const useEvent = ({ event, root, target, effect }) => {
    const _target = typeof target === "string" ? document.querySelector(target) : target;
    if (typeof effect !== "function") {
        throw Error("Side effect must be a function!");
    }
    if (!_target) {
        throw Error("Please specify a target element!");
    }
    switch (event) {
        case EVENTS.LOAD: {
            const observer = new MutationObserver((mutations, observer) => {
                const el = document.querySelector(target);
                if (el !== null) {
                    effect(el);
                    observer.disconnect();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
            break;
        }
        case EVENTS.VIEWPORT: {
            const _root = root instanceof HTMLElement ? root : typeof root === "string" ? document.querySelector(root) : null;
            const observerOptions = {
                root: _root,
                rootMargin: "0px",
                threshold: 0.5
            };
            const observer = new IntersectionObserver((entries, observer) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        effect(_target);
                    }
                }
            }, observerOptions);
            observer.observe(_target);
            break;
        }
        case EVENTS.ATTRIBUTE: {
            const observer = new MutationObserver((mutations) => {
                for (const mut of mutations) {
                    if (mut.target === _target && mut.type === 'attributes') {
                        effect(_target, mut.attributeName, _target.getAttribute(mut.attributeName));
                    }
                }
            });
            observer.observe(_target, {
                attributes: true,
            });
            break;
        }
        case EVENTS.CHILDREN: {
            const observer = new MutationObserver((mutations) => {
                for (const mut of mutations) {
                    if (mut.target === _target && mut.type === 'childList') {
                        effect(_target, mut.addedNodes, mut.removedNodes);
                    }
                }
            });
            observer.observe(_target, {
                childList: true,
                subtree: true,
            });
            break;
        }
        case EVENTS.DATA: {
            const observer = new MutationObserver((mutations) => {
                for (const mut of mutations) {
                    if (mut.target === _target && mut.type === 'characterData') {
                        effect(_target, _target.textContent);
                    }
                }
            });
            observer.observe(_target, {
                characterData: true,
            });
            break;
        }
        default: {
            if (_target instanceof HTMLElement) {
                _target.addEventListener(event, (e) => {
                    effect(_target, e);
                });
            }
        }
    }
};

const useMemo = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = `${args.length}${args.join("+")}`;
        if (cache.has(key)) {
            return cache.get(key);
        }
        // @ts-ignore
        const result = fn.apply(null, args);
        cache.set(key, result);
        return result;
    };
};

const useDebounce = (fn, wait) => {
    let timer;
    return function (...args) {
        const func = () => {
            // @ts-ignore
            fn.apply(this, args);
        };
        clearTimeout(timer);
        timer = setTimeout(func, wait);
    };
};

const usePipe = (...functions) => {
    // @ts-ignore
    return (first) => functions.reduce((acc, fn) => fn(acc), first);
};

const useCurry = (func) => {
    return function curried(...args) {
        // @ts-ignore
        if (args.length >= func.length) {
            // @ts-ignore
            return func.apply(this, args);
        }
        return function (...args2) {
            // @ts-ignore
            return curried.apply(this, args.concat(args2));
        };
    };
};

const useCompose = (...functions) => {
    // @ts-ignore
    return (first) => functions.reduceRight((acc, fn) => fn(acc), first);
};

const useThrottle = (fn, wait) => {
    let isThrottled = false;
    let saveThis;
    let saveArgs;
    function wrapper(...args) {
        if (isThrottled) {
            // @ts-ignore
            saveThis = this;
            saveArgs = args;
            return;
        }
        // @ts-ignore
        fn.apply(this, args);
        isThrottled = true;
        setTimeout(() => {
            if (saveArgs) {
                // @ts-ignore
                wrapper.apply(saveThis, saveArgs);
                saveArgs = saveThis = null;
            }
        }, wait);
    }
    return wrapper;
};

const version$4 = "0.10.0";
const build_time$4 = "09.07.2024, 13:04:50";
const info$4 = () => {
    console.info(`%c Hooks %c v${version$4} %c ${build_time$4} `, "color: #ffffff; font-weight: bold; background: #5c2c05", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

var Hooks$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get EVENTS () { return EVENTS; },
    info: info$4,
    useCompose: useCompose,
    useCurry: useCurry,
    useDebounce: useDebounce,
    useEvent: useEvent,
    useMemo: useMemo,
    usePipe: usePipe,
    useState: useState,
    useThrottle: useThrottle
});

globalThis.Hooks = Hooks$1;

/*!
 * Farbe  v1.0.3 - Color manipulation library
 * Copyright 2024 by Serhii Pimenov
 * Licensed under MIT
 !*/

class HSV {
    constructor(h = 0, s = 0, v = 0) {
        this.h = h;
        this.s = s;
        this.v = v;
    }

    toString(){
        return "hsv(" + [Math.round(this.h), Math.round(this.s*100)+"%", Math.round(this.v*100)+"%"].join(", ") + ")";
    }
}

class HSL {
    constructor(h = 0, s = 0, l = 0) {
        this.h = h;
        this.s = s;
        this.l = l;
    }

    toString(){
        return "hsl(" + [Math.round(this.h), Math.round(this.s*100)+"%", Math.round(this.l*100)+"%"].join(", ") + ")";
    }
}

class HSLA {
    constructor(h = 0, s = 0, l = 0, a = 0) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }

    toString(){
        return "hsla(" + [Math.round(this.h), Math.round(this.s*100)+"%", Math.round(this.l*100)+"%", parseFloat(this.a).toFixed(2)].join(", ") + ")";
    }
}

class RGB {
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toString(){
        return `rgb(${this.r},${this.g},${this.b})`;
    }
}

class RGBA {
    constructor(r = 0, g = 0, b = 0, a = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toString(){
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}

class CMYK {
    constructor(c = 0, m = 0, y = 0, k = 0) {
        this.c = c;
        this.m = m;
        this.y = y;
        this.k = k;
    }

    toString(){
        return `cmyk(${this.c},${this.m},${this.y},${this.k})`;
    }
}

const StandardColorPalette = {
    aliceBlue: "#f0f8ff",
    antiqueWhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedAlmond: "#ffebcd",
    blue: "#0000ff",
    blueViolet: "#8a2be2",
    brown: "#a52a2a",
    burlyWood: "#deb887",
    cadetBlue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerBlue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkBlue: "#00008b",
    darkCyan: "#008b8b",
    darkGoldenRod: "#b8860b",
    darkGray: "#a9a9a9",
    darkGreen: "#006400",
    darkKhaki: "#bdb76b",
    darkMagenta: "#8b008b",
    darkOliveGreen: "#556b2f",
    darkOrange: "#ff8c00",
    darkOrchid: "#9932cc",
    darkRed: "#8b0000",
    darkSalmon: "#e9967a",
    darkSeaGreen: "#8fbc8f",
    darkSlateBlue: "#483d8b",
    darkSlateGray: "#2f4f4f",
    darkTurquoise: "#00ced1",
    darkViolet: "#9400d3",
    deepPink: "#ff1493",
    deepSkyBlue: "#00bfff",
    dimGray: "#696969",
    dodgerBlue: "#1e90ff",
    fireBrick: "#b22222",
    floralWhite: "#fffaf0",
    forestGreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#DCDCDC",
    ghostWhite: "#F8F8FF",
    gold: "#ffd700",
    goldenRod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenYellow: "#adff2f",
    honeyDew: "#f0fff0",
    hotPink: "#ff69b4",
    indianRed: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderBlush: "#fff0f5",
    lawnGreen: "#7cfc00",
    lemonChiffon: "#fffacd",
    lightBlue: "#add8e6",
    lightCoral: "#f08080",
    lightCyan: "#e0ffff",
    lightGoldenRodYellow: "#fafad2",
    lightGray: "#d3d3d3",
    lightGreen: "#90ee90",
    lightPink: "#ffb6c1",
    lightSalmon: "#ffa07a",
    lightSeaGreen: "#20b2aa",
    lightSkyBlue: "#87cefa",
    lightSlateGray: "#778899",
    lightSteelBlue: "#b0c4de",
    lightYellow: "#ffffe0",
    lime: "#00ff00",
    limeGreen: "#32dc32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumAquaMarine: "#66cdaa",
    mediumBlue: "#0000cd",
    mediumOrchid: "#ba55d3",
    mediumPurple: "#9370db",
    mediumSeaGreen: "#3cb371",
    mediumSlateBlue: "#7b68ee",
    mediumSpringGreen: "#00fa9a",
    mediumTurquoise: "#48d1cc",
    mediumVioletRed: "#c71585",
    midnightBlue: "#191970",
    mintCream: "#f5fffa",
    mistyRose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajoWhite: "#ffdead",
    navy: "#000080",
    oldLace: "#fdd5e6",
    olive: "#808000",
    oliveDrab: "#6b8e23",
    orange: "#ffa500",
    orangeRed: "#ff4500",
    orchid: "#da70d6",
    paleGoldenRod: "#eee8aa",
    paleGreen: "#98fb98",
    paleTurquoise: "#afeeee",
    paleVioletRed: "#db7093",
    papayaWhip: "#ffefd5",
    peachPuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderBlue: "#b0e0e6",
    purple: "#800080",
    rebeccaPurple: "#663399",
    red: "#ff0000",
    rosyBrown: "#bc8f8f",
    royalBlue: "#4169e1",
    saddleBrown: "#8b4513",
    salmon: "#fa8072",
    sandyBrown: "#f4a460",
    seaGreen: "#2e8b57",
    seaShell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    slyBlue: "#87ceeb",
    slateBlue: "#6a5acd",
    slateGray: "#708090",
    snow: "#fffafa",
    springGreen: "#00ff7f",
    steelBlue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whiteSmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowGreen: "#9acd32",
};

const MetroColorPalette = {
    lime: "#a4c400",
    green: "#60a917",
    emerald: "#008a00",
    blue: "#00AFF0",
    teal: "#00aba9",
    cyan: "#1ba1e2",
    cobalt: "#0050ef",
    indigo: "#6a00ff",
    violet: "#aa00ff",
    pink: "#dc4fad",
    magenta: "#d80073",
    crimson: "#a20025",
    red: "#CE352C",
    orange: "#fa6800",
    amber: "#f0a30a",
    yellow: "#fff000",
    brown: "#825a2c",
    olive: "#6d8764",
    steel: "#647687",
    mauve: "#76608a",
    taupe: "#87794e",
};

const Palette = {
    color: function (
        name,
        palette = StandardColorPalette,
        undefined_color = undefined
    ) {
        return palette[name] !== undefined ? palette[name] : undefined_color;
    },

    palette: function (palette = StandardColorPalette) {
        return Object.keys(palette);
    },

    colors: function (palette = StandardColorPalette) {
        return Object.values(palette);
    },
};

const Primitives$1 = {
    HSV,
    HSL,
    HSLA,
    RGB,
    RGBA,
    CMYK,
};

const colorTypes = {
    HEX: "hex",
    RGB: "rgb",
    RGBA: "rgba",
    HSV: "hsv",
    HSL: "hsl",
    HSLA: "hsla",
    CMYK: "cmyk",
    UNKNOWN: "unknown",
};

const colorDefaultProps = {
    angle: 30,
    algorithm: 1,
    step: 0.1,
    distance: 5,
    tint1: 0.8,
    tint2: 0.4,
    shade1: 0.6,
    shade2: 0.3,
    alpha: 1,
    baseLight: "#ffffff",
    baseDark: "self"
};

function convert(source, format) {
    let result;
    switch (format) {
        case "hex":
            result = source.map(function (v) {
                return toHEX(v);
            });
            break;
        case "rgb":
            result = source.map(function (v) {
                return toRGB(v);
            });
            break;
        case "rgba":
            result = source.map(function (v) {
                return toRGBA(v, opt.alpha);
            });
            break;
        case "hsl":
            result = source.map(function (v) {
                return toHSL(v);
            });
            break;
        case "hsla":
            result = source.map(function (v) {
                return toHSLA(v, opt.alpha);
            });
            break;
        case "cmyk":
            result = source.map(function (v) {
                return toCMYK(v);
            });
            break;
        default:
            result = source;
    }

    return result;
}

function clamp(num, min, max) {
    return Math.max(min, Math.min(num, max));
}

function toRange(a, b, c) {
    return a < b ? b : a > c ? c : a;
}

function shift(h, s) {
    h += s;
    while (h >= 360.0) h -= 360.0;
    while (h < 0.0) h += 360.0;
    return h;
}

const test = (color) => {
    const _isHEX = color => /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
    const _isRGB = color => /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
    const _isRGBA = color => /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0(\.\d+)?|1(\.0+)?)\s*\)$/.test(color);
    const _isHSV = color => /^hsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
    const _isHSL = color => /^hsl\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
    const _isHSLA = color => /^hsla\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0(\.\d+)?|1(\.0+)?)\s*\)$/.test(color);
    const _isCMYK = color => /^cmyk\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);

    return _isHEX(color) || _isRGB(color) || _isHSV(color) || _isHSLA(color) || _isHSLA(color) || _isRGBA(color) || _isHSL(color) || _isCMYK(color);
};

/**
 * Create color in specified format
 * @param {string} colorType
 * @param {*} from
 * @returns {RGB|RGBA|HSV|HSL|HSLA|CMYK|undefined}
 */
const createColor = (colorType = "hex", from = "#000000") => {
    let baseColor;

    if (typeof from === "string") {
        baseColor = parseColor(from);
    }

    if (!isColor(baseColor)) {
        baseColor = "#000000";
    }

    return toColor(baseColor, colorType.toLowerCase());
};

const create = createColor;

/**
 * Expand shorthand form (e.g. "#03F") to full form (e.g. "#0033FF")
 * @param hex
 * @returns {string}
 */
const expandHexColor = function (hex) {
    if (isColor(hex) && typeof hex !== "string") {
        return hex;
    }
    if (typeof hex !== "string") {
        throw new Error("Value is not a string!");
    }
    if (hex[0] === "#" && hex.length === 4) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        return (
            "#" +
            hex.replace(shorthandRegex, (m, r, g, b) => {
                return r + r + g + g + b + b;
            })
        );
    }
    return hex[0] === "#" ? hex : "#" + hex;
};

const expand = expandHexColor;

/**
 * Check if specified color is dark
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isDark = color => {
    color = parseColor(color);
    if (!isColor(color)) return;
    const rgb = toRGB(color);
    const YIQ = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return YIQ < 128;
};

/**
 * Check if specified color is light
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isLight = color => {
    return !isDark(color);
};

/**
 * Check if specified color is HSV color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isHSV = color => {
    return parseColor(color) instanceof HSV;
};

/**
 * Check if specified color is HSL color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isHSL = color => {
    return parseColor(color) instanceof HSL;
};

/**
 * Check if specified color is HSLA color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isHSLA = color => {
    return parseColor(color) instanceof HSLA;
};

/**
 * Check if specified color is RGB color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isRGB = color => {
    return parseColor(color) instanceof RGB;
};

/**
 * Check if specified color is RGBA color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isRGBA = color => {
    return parseColor(color) instanceof RGBA;
};

/**
 * Check if specified color is CMYK color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isCMYK = color => {
    return parseColor(color) instanceof CMYK;
};

/**
 * Check if specified color is HEX color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isHEX = color => {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
};

/**
 * Check if value is a supported color
 * @param {*} color
 * @returns {boolean|undefined}
 */
const isColor = color => {
    if (!color) return false

    if (typeof color === "string") {
        return test(color)
    }

    return isHEX(color) ||
        isRGB(color) ||
        isRGBA(color) ||
        isHSV(color) ||
        isHSL(color) ||
        isHSLA(color) ||
        isCMYK(color);
};

/**
 * Return type of color
 * @param {*} color
 * @returns {string}
 */
const colorType = color => {
    if (isHEX(color)) return colorTypes.HEX;
    if (isRGB(color)) return colorTypes.RGB;
    if (isRGBA(color)) return colorTypes.RGBA;
    if (isHSV(color)) return colorTypes.HSV;
    if (isHSL(color)) return colorTypes.HSL;
    if (isHSLA(color)) return colorTypes.HSLA;
    if (isCMYK(color)) return colorTypes.CMYK;

    return colorTypes.UNKNOWN;
};

/**
 * Check if color1 is equal to comparison color2
 * @param {*} color1
 * @param {*} color2
 * @returns {boolean}
 */
const equal = (color1, color2) => {
    if (!isColor(color1) || !isColor(color2)) {
        return false;
    }

    return toHEX(color1) === toHEX(color2);
};

/**
 * Get stringify color value
 * @param {*} color
 * @returns {string} This function return string presentation of color. Example: for RGB will return rgb(x, y, z)
 */
const colorToString = color => {
    return color.toString();
};

/**
 * @param {string} hex
 * @returns {RGB} Value returned as RGB object
 */
const hex2rgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
        expandHexColor(hex)
    );
    const rgb = [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ];
    return result ? new RGB(...rgb) : null;
};

/**
 *
 * @param {RGB} rgb
 * @returns {string}
 */
const rgb2hex = rgb => {
    return (
        "#" +
        ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
    );
};

/**
 *
 * @param {RGB} rgb
 * @returns {HSV}
 */
const rgb2hsv = rgb => {
    const hsv = new HSV();
    let h, s, v;
    const r = rgb.r / 255,
        g = rgb.g / 255,
        b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    v = max;

    if (max === 0) {
        s = 0;
    } else {
        s = 1 - min / max;
    }

    if (max === min) {
        h = 0;
    } else if (max === r && g >= b) {
        h = 60 * ((g - b) / delta);
    } else if (max === r && g < b) {
        h = 60 * ((g - b) / delta) + 360;
    } else if (max === g) {
        h = 60 * ((b - r) / delta) + 120;
    } else if (max === b) {
        h = 60 * ((r - g) / delta) + 240;
    } else {
        h = 0;
    }

    hsv.h = h;
    hsv.s = s;
    hsv.v = v;

    return hsv;
};

/**
 *
 * @param {HSV} hsv
 * @returns {RGB}
 */
const hsv2rgb = hsv => {
    let r, g, b;
    const h = hsv.h,
        s = hsv.s * 100,
        v = hsv.v * 100;
    const Hi = Math.floor(h / 60);
    const Vmin = ((100 - s) * v) / 100;
    const alpha = (v - Vmin) * ((h % 60) / 60);
    const Vinc = Vmin + alpha;
    const Vdec = v - alpha;

    switch (Hi) {
        case 0:
            r = v;
            g = Vinc;
            b = Vmin;
            break;
        case 1:
            r = Vdec;
            g = v;
            b = Vmin;
            break;
        case 2:
            r = Vmin;
            g = v;
            b = Vinc;
            break;
        case 3:
            r = Vmin;
            g = Vdec;
            b = v;
            break;
        case 4:
            r = Vinc;
            g = Vmin;
            b = v;
            break;
        case 5:
            r = v;
            g = Vmin;
            b = Vdec;
            break;
    }

    return new RGB(
        Math.round((r * 255) / 100),
        Math.round((g * 255) / 100),
        Math.round((b * 255) / 100)
    );
};

/**
 *
 * @param {HSV} hsv
 * @returns {string}
 */
const hsv2hex = hsv => {
    return rgb2hex(hsv2rgb(hsv));
};

/**
 *
 * @param {string} hex
 * @returns {HSV}
 */
const hex2hsv = hex => {
    return rgb2hsv(hex2rgb(hex));
};

/**
 *
 * @param {RGB} rgb
 * @returns {CMYK}
 */
const rgb2cmyk = rgb => {
    const cmyk = new CMYK();

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    cmyk.k = Math.min(1 - r, 1 - g, 1 - b);

    cmyk.c = 1 - cmyk.k === 0 ? 0 : (1 - r - cmyk.k) / (1 - cmyk.k);
    cmyk.m = 1 - cmyk.k === 0 ? 0 : (1 - g - cmyk.k) / (1 - cmyk.k);
    cmyk.y = 1 - cmyk.k === 0 ? 0 : (1 - b - cmyk.k) / (1 - cmyk.k);

    cmyk.c = Math.round(cmyk.c * 100);
    cmyk.m = Math.round(cmyk.m * 100);
    cmyk.y = Math.round(cmyk.y * 100);
    cmyk.k = Math.round(cmyk.k * 100);

    return cmyk;
};

/**
 *
 * @param {CMYK} cmyk
 * @returns {RGB}
 */
const cmyk2rgb = cmyk => {
    const r = Math.floor(255 * (1 - cmyk.c / 100) * (1 - cmyk.k / 100));
    const g = Math.ceil(255 * (1 - cmyk.m / 100) * (1 - cmyk.k / 100));
    const b = Math.ceil(255 * (1 - cmyk.y / 100) * (1 - cmyk.k / 100));

    return new RGB(r, g, b);
};

/**
 *
 * @param {HSV} hsv
 * @returns {HSL}
 */
const hsv2hsl = hsv => {
    let h, s, l, d;
    h = parseInt(hsv.h);
    l = (2 - hsv.s) * hsv.v;
    s = hsv.s * hsv.v;
    if (l === 0) {
        s = 0;
    } else {
        d = l <= 1 ? l : 2 - l;
        if (d === 0) {
            s = 0;
        } else {
            s /= d;
        }
    }
    l /= 2;

    if (Number.isNaN(s)) s = 0;
    if (Number.isNaN(l)) l = 0;

    return new HSL(h, s, l);
};

/**
 *
 * @param {HSL} hsl
 * @returns {HSV}
 */
const hsl2hsv = hsl => {
    let h, s, v, l;
    h = hsl.h;
    l = hsl.l * 2;
    s = hsl.s * (l <= 1 ? l : 2 - l);

    v = (l + s) / 2;

    if (l + s === 0) {
        s = 0;
    } else {
        s = (2 * s) / (l + s);
    }

    return new HSV(h, s, v);
};

/**
 *
 * @param {RGB|RGBA} rgb
 * @returns {RGB}
 */
const rgb2websafe = rgb => {
    return new RGB(
        Math.round(rgb.r / 51) * 51,
        Math.round(rgb.g / 51) * 51,
        Math.round(rgb.b / 51) * 51
    );
};

/**
 *
 * @param {RGBA} rgba
 * @returns {RGBA}
 */
const rgba2websafe = rgba => {
    const rgbWebSafe = rgb2websafe(rgba);
    return new RGBA(rgbWebSafe.r, rgbWebSafe.g, rgbWebSafe.b, rgba.a);
};

/**
 *
 * @param {string} hex
 * @returns {string}
 */
const hex2websafe = hex => {
    return rgb2hex(rgb2websafe(hex2rgb(hex)));
};

/**
 *
 * @param hsv
 * @returns {HSV}
 */
const hsv2websafe = hsv => {
    return rgb2hsv(rgb2websafe(toRGB(hsv)));
};

const hsl2websafe = hsl => {
    return hsv2hsl(rgb2hsv(rgb2websafe(toRGB(hsl))));
};

const cmyk2websafe = cmyk => {
    return rgb2cmyk(rgb2websafe(cmyk2rgb(cmyk)));
};

const websafe = color => {
    if (isHEX(color)) return hex2websafe(color);
    if (isRGB(color)) return rgb2websafe(color);
    if (isRGBA(color)) return rgba2websafe(color);
    if (isHSV(color)) return hsv2websafe(color);
    if (isHSL(color)) return hsl2websafe(color);
    if (isCMYK(color)) return cmyk2websafe(color);

    return color;
};

/**
 * Convert color to specified
 * @param color
 * @param mode
 * @param alpha
 * @returns {*}
 */
const toColor = (color, mode = "rgb", alpha = 1) => {
    let result;
    switch (mode.toLowerCase()) {
        case "hex":
            result = toHEX(color);
            break;
        case "rgb":
            result = toRGB(color);
            break;
        case "rgba":
            result = toRGBA(color, alpha);
            break;
        case "hsl":
            result = toHSL(color);
            break;
        case "hsla":
            result = toHSLA(color, alpha);
            break;
        case "hsv":
            result = toHSV(color);
            break;
        case "cmyk":
            result = toCMYK(color);
            break;
        default:
            result = color;
    }
    return result;
};

/**
 * Convert color to hex
 * @param color
 * @returns {string}
 */
const toHEX = color => {
    return typeof color === "string"
        ? expandHexColor(color)
        : rgb2hex(toRGB(color));
};

/**
 * Convert color to RGB
 * @param color
 * @returns {RGB|*}
 */
const toRGB = color => {
    if (isRGB(color)) return color;
    if (isRGBA(color)) return new RGB(color.r, color.g, color.b);
    if (isHSV(color)) return hsv2rgb(color);
    if (isHSL(color)) return hsv2rgb(hsl2hsv(color));
    if (isHSLA(color)) return hsv2rgb(hsl2hsv(color));
    if (isHEX(color)) return hex2rgb(color);
    if (isCMYK(color)) return cmyk2rgb(color);

    throw new Error("Unknown color format!");
};

/**
 * Convert color to RGBA
 * @param color
 * @param alpha
 * @returns {RGBA|*}
 */
const toRGBA = (color, alpha = 1) => {
    if (isRGBA(color)) {
        if (alpha) {
            color.a = alpha;
        }
        return color;
    }
    const rgb = toRGB(color);
    return new RGBA(rgb.r, rgb.g, rgb.b, typeof color.a !== "undefined" ? color.a : alpha);
};

/**
 * Convert color to HSV
 * @param color
 * @returns {HSV}
 */
const toHSV = color => {
    return rgb2hsv(toRGB(color));
};

/**
 * Convert color to HSL
 * @param color
 * @returns {HSL}
 */
const toHSL = color => {
    return hsv2hsl(rgb2hsv(toRGB(color)));
};

/**
 * Convert color to HSLA
 * @param color
 * @param alpha
 * @returns {HSLA|*}
 */
const toHSLA = (color, alpha = 1) => {
    if (isHSLA(color)) {
        if (alpha) {
            color.a = alpha;
        }
        return color;
    }
    let hsla = hsv2hsl(rgb2hsv(toRGB(color)));
    hsla.a = typeof color.a !== "undefined" ? color.a : alpha;
    return new HSLA(hsla.h, hsla.s, hsla.l, hsla.a);
};

/**
 * Convert color to CMYK
 * @param color
 * @returns {CMYK}
 */
const toCMYK = color => {
    return rgb2cmyk(toRGB(color));
};

/**
 * Convert color to grayscale
 * @param color
 * @returns {*}
 */
const grayscale = color => {
    const rgb = toRGB(color);
    const type = colorType(color).toLowerCase();
    const gray = Math.round(rgb.r * 0.2125 + rgb.g * 0.7154 + rgb.b * 0.0721);
    const mono = new RGB(gray, gray, gray);

    return toColor(mono, type);
};

/**
 * Darken color to specified percent
 * @param color
 * @param amount
 * @returns {*}
 */
const darken = (color, amount = 10) => {
    return lighten(color, -1 * Math.abs(amount));
};

/**
 * lighten color to specified percent
 * @param color
 * @param amount
 * @returns {*}
 */
const lighten = (color, amount = 10) => {
    let type,
        res,
        ring = amount > 0;

    const calc = function (_color, _amount) {
        let r, g, b;
        const col = _color.slice(1);

        const num = parseInt(col, 16);
        r = (num >> 16) + _amount;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        b = ((num >> 8) & 0x00ff) + _amount;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        g = (num & 0x0000ff) + _amount;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return "#" + (g | (b << 8) | (r << 16)).toString(16);
    };

    type = colorType(color).toLowerCase();

    if (type === colorTypes.RGBA) {
        color.a;
    }

    do {
        res = calc(toHEX(color), amount);
        ring ? amount-- : amount++;
    } while (res.length < 7);

    return toColor(res, type);
};

/**
 * Rotate color on color wheel to specified angle
 * @param color
 * @param angle
 * @param alpha
 * @returns {*}
 */
const hueShift = (color, angle, alpha = 1) => {
    const hsv = toHSV(color);
    const type = colorType(color).toLowerCase();
    let h = hsv.h;
    h += angle;
    while (h >= 360.0) h -= 360.0;
    while (h < 0.0) h += 360.0;
    hsv.h = h;

    return toColor(hsv, type, alpha);
};

const mix = (color1, color2, amount) => {

    amount = (amount === 0) ? 0 : (amount || 50);

    const rgb = new RGB(0,0,0);
    const rgb1 = toRGB(color1);
    const rgb2 = toRGB(color2);

    const p = amount / 100;

    rgb.r = Math.round(((rgb2.r - rgb1.r) * p) + rgb1.r);
    rgb.g = Math.round(((rgb2.g - rgb1.g) * p) + rgb1.g);
    rgb.b = Math.round(((rgb2.b - rgb1.b) * p) + rgb1.b);

    return toHEX(rgb);
};

const multiply = (color1, color2) => {
    const rgb1 = toRGB(color1);
    const rgb2 = toRGB(color2);
    const rgb = new RGB();

    rgb1.b = Math.floor(rgb1.b * rgb2.b / 255);
    rgb1.g = Math.floor(rgb1.g * rgb2.g / 255);
    rgb1.r = Math.floor(rgb1.r * rgb2.r / 255);

    return toHEX(rgb);
};

const shade = (color, amount) => {
    if (!isColor(color)) {
        throw new Error(color + " is not a valid color value!");
    }

    amount /= 100;

    const type = colorType(color).toLowerCase();
    const rgb = toRGB(color);
    const t = amount < 0 ? 0 : 255;
    const p = amount < 0 ? amount * -1 : amount;
    let r, g, b, a;

    r = (Math.round((t - rgb.r) * p) + rgb.r);
    g = (Math.round((t - rgb.g) * p) + rgb.g);
    b = (Math.round((t - rgb.b) * p) + rgb.b);

    if (type === colorTypes.RGBA || type === colorTypes.HSLA) {
        a = color.a;
    }

    return toColor(new RGB(r, g, b), type, a);
};

const saturate = (color, amount) => {
    let hsl, type, alpha;

    if (!isColor(color)) {
        throw new Error(color + " is not a valid color value!");
    }

    hsl = toHSL(color);
    hsl.s += amount / 100;
    hsl.s = clamp(0, 1, hsl.s);

    type = colorType(color).toLowerCase();

    if (type === colorTypes.RGBA || type === colorTypes.HSLA) {
        alpha = color.a;
    }

    return toColor(hsl, type, alpha);
};

const desaturate = (color, amount) => {
    let hsl, type, alpha;

    if (!isColor(color)) {
        throw new Error(color + " is not a valid color value!");
    }

    hsl = toHSL(color);
    hsl.s -= amount / 100;
    hsl.s = clamp(hsl.s);

    type = colorType(color).toLowerCase();

    if (type === colorTypes.RGBA || type === colorTypes.HSLA) {
        alpha = color.a;
    }

    return toColor(hsl, type, alpha);
};

const spin = (color, amount) => {
    let hsl, type, alpha, hue;

    if (!isColor(color)) {
        throw new Error(color + " is not a valid color value!");
    }

    hsl = toHSL(color);
    hue = (hsl.h + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;

    type = colorType(color).toLowerCase();

    if (type === colorTypes.RGBA || type === colorTypes.HSLA) {
        alpha = color.a;
    }

    return toColor(hsl, type, alpha);
};

const brighten = (color, amount) => {
    let rgb, type, alpha;

    if (!isColor(color)) {
        throw new Error(color + " is not a valid color value!");
    }

    rgb = toRGB(color);
    rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * - (amount / 100))));
    rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * - (amount / 100))));
    rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * - (amount / 100))));

    type = colorType(color).toLowerCase();

    if (type === colorTypes.RGBA || type === colorTypes.HSLA) {
        alpha = color.a;
    }

    return toColor(rgb, type, alpha);
};

const add = (val1, val2, returnAs) => {
    const color1 = parse$1(val1);
    const color2 = parse$1(val2);
    const c1 = toRGBA(color1, undefined);
    const c2 = toRGBA(color2, undefined);
    const result = new RGBA();
    (""+returnAs).toLowerCase() || "hex";

    result.r = Math.round((c1.r + c2.r) / 2);
    result.g = Math.round((c1.g + c2.g) / 2);
    result.b = Math.round((c1.b + c2.b) / 2);
    result.a = Math.round((c1.a + c2.a) / 2);

    return toColor(result, returnAs, result.a);
};

/**
 * Create color scheme
 * @param color
 * @param name
 * @param format
 * @param options
 * @returns {boolean|*}
 */
const createColorScheme = (color, name, format = colorTypes.HEX, options) => {
    const opt = Object.assign({}, colorDefaultProps, options);

    let i;
    const scheme = [];
    let hsv;
    let rgb, h, s, v;

    hsv = toHSV(color);

    if (isHSV(hsv) === false) {
        console.warn("The value is a not supported color format!");
        return false;
    }

    h = hsv.h;
    s = hsv.s;
    v = hsv.v;

    switch (name) {
        case "monochromatic":
        case "mono": {
            if (opt.algorithm === 1) {
                rgb = hsv2rgb(hsv);
                rgb.r = toRange(
                    Math.round(rgb.r + (255 - rgb.r) * opt.tint1),
                    0,
                    255
                );
                rgb.g = toRange(
                    Math.round(rgb.g + (255 - rgb.g) * opt.tint1),
                    0,
                    255
                );
                rgb.b = toRange(
                    Math.round(rgb.b + (255 - rgb.b) * opt.tint1),
                    0,
                    255
                );
                scheme.push(rgb2hsv(rgb));

                rgb = hsv2rgb(hsv);
                rgb.r = toRange(
                    Math.round(rgb.r + (255 - rgb.r) * opt.tint2),
                    0,
                    255
                );
                rgb.g = toRange(
                    Math.round(rgb.g + (255 - rgb.g) * opt.tint2),
                    0,
                    255
                );
                rgb.b = toRange(
                    Math.round(rgb.b + (255 - rgb.b) * opt.tint2),
                    0,
                    255
                );
                scheme.push(rgb2hsv(rgb));

                scheme.push(hsv);

                rgb = hsv2rgb(hsv);
                rgb.r = toRange(Math.round(rgb.r * opt.shade1), 0, 255);
                rgb.g = toRange(Math.round(rgb.g * opt.shade1), 0, 255);
                rgb.b = toRange(Math.round(rgb.b * opt.shade1), 0, 255);
                scheme.push(rgb2hsv(rgb));

                rgb = hsv2rgb(hsv);
                rgb.r = toRange(Math.round(rgb.r * opt.shade2), 0, 255);
                rgb.g = toRange(Math.round(rgb.g * opt.shade2), 0, 255);
                rgb.b = toRange(Math.round(rgb.b * opt.shade2), 0, 255);
                scheme.push(rgb2hsv(rgb));
            } else if (opt.algorithm === 2) {
                scheme.push(hsv);
                for (i = 1; i <= opt.distance; i++) {
                    v = clamp(v - opt.step, 0, 1);
                    s = clamp(s - opt.step, 0, 1);
                    scheme.push({h: h, s: s, v: v});
                }
            } else if (opt.algorithm === 3) {
                scheme.push(hsv);
                for (i = 1; i <= opt.distance; i++) {
                    v = clamp(v - opt.step, 0, 1);
                    scheme.push({h: h, s: s, v: v});
                }
            } else {
                v = clamp(hsv.v + opt.step * 2, 0, 1);
                scheme.push({h: h, s: s, v: v});

                v = clamp(hsv.v + opt.step, 0, 1);
                scheme.push({h: h, s: s, v: v});

                scheme.push(hsv);
                s = hsv.s;
                v = hsv.v;

                v = clamp(hsv.v - opt.step, 0, 1);
                scheme.push({h: h, s: s, v: v});

                v = clamp(hsv.v - opt.step * 2, 0, 1);
                scheme.push({h: h, s: s, v: v});
            }
            break;
        }

        case "complementary":
        case "complement":
        case "comp": {
            scheme.push(hsv);

            h = shift(hsv.h, 180.0);
            scheme.push(new HSV(h, s, v));
            break;
        }

        case "double-complementary":
        case "double-complement":
        case "double": {
            scheme.push(hsv);

            h = shift(h, 180.0);
            scheme.push(new HSV(h, s, v));

            h = shift(h, opt.angle);
            scheme.push(new HSV(h, s, v));

            h = shift(h, 180.0);
            scheme.push(new HSV(h, s, v));

            break;
        }

        case "analogous":
        case "analog": {
            h = shift(h, opt.angle);
            scheme.push(new HSV(h, s, v));

            scheme.push(hsv);

            h = shift(hsv.h, 0.0 - opt.angle);
            scheme.push(new HSV(h, s, v));

            break;
        }

        case "triadic":
        case "triad": {
            scheme.push(hsv);
            for (i = 1; i < 3; i++) {
                h = shift(h, 120.0);
                scheme.push(new HSV(h, s, v));
            }
            break;
        }

        case "tetradic":
        case "tetra": {
            scheme.push(hsv);
            h = shift(hsv.h, 180.0);
            scheme.push(new HSV(h, s, v));
            h = shift(hsv.h, -1 * opt.angle);
            scheme.push(new HSV(h, s, v));
            h = shift(h, 180.0);
            scheme.push(new HSV(h, s, v));
            break;
        }

        case "square": {
            scheme.push(hsv);
            for (i = 1; i < 4; i++) {
                h = shift(h, 90.0);
                scheme.push(new HSV(h, s, v));
            }
            break;
        }

        case "split-complementary":
        case "split-complement":
        case "split": {
            h = shift(h, 180.0 - opt.angle);
            scheme.push(new HSV(h, s, v));

            scheme.push(hsv);

            h = shift(hsv.h, 180.0 + opt.angle);
            scheme.push(new HSV(h, s, v));
            break;
        }
        case "material": {
            var baseLight = opt.baseLight;
            var baseDark = opt.baseDark === "self" || !opt.baseDark ? multiply(color, color) : opt.baseDark;

            scheme.push({
                "50": mix(baseLight, color, 10),
                "100": mix(baseLight, color, 30),
                "200": mix(baseLight, color, 50),
                "300": mix(baseLight, color, 70),
                "400": mix(baseLight, color, 85),
                "500": mix(baseLight, color, 100),
                "600": mix(baseDark, color, 92),
                "700": mix(baseDark, color, 83),
                "800": mix(baseDark, color, 74),
                "900": mix(baseDark, color, 65),

                "A100": lighten(saturate(mix(baseDark, color, 15), 80), 65),
                "A200": lighten(saturate(mix(baseDark, color, 15), 80), 55),
                "A400": lighten(saturate(mix(baseLight, color, 100), 55), 10),
                "A700": lighten(saturate(mix(baseDark, color, 83), 65), 10)
            });

            break
        }

        default:
            console.error("Unknown scheme name");
    }

    return name === "material" ? scheme[0] : convert(scheme, format);
};

/**
 * Parse from string to color type
 * @param color
 * @returns {HSL|RGB|RGBA|string|HSV|CMYK|HSLA}
 */
const parseColor = function (color) {
    let _color = (""+color).toLowerCase();

    if (typeof StandardColorPalette[_color] !== 'undefined') {
        _color = StandardColorPalette[_color];
    }

    if (typeof MetroColorPalette[_color] !== 'undefined') {
        _color = MetroColorPalette[_color];
    }

    let a = _color
        .replace(/[^\d.,]/g, "")
        .split(",")
        .map(v => +v);

    if (_color[0] === "#") {
        return expandHexColor(_color);
    }

    if (_color.includes("rgba")) {
        return new RGBA(a[0], a[1], a[2], a[3]);
    }
    if (_color.includes("rgb")) {
        return new RGB(a[0], a[1], a[2]);
    }
    if (_color.includes("cmyk")) {
        return new CMYK(a[0], a[1], a[2], a[3]);
    }
    if (_color.includes("hsv")) {
        return new HSV(a[0], a[1], a[2]);
    }
    if (_color.includes("hsla")) {
        return new HSLA(a[0], a[1], a[2], a[3]);
    }
    if (_color.includes("hsl")) {
        return new HSL(a[0], a[1], a[2]);
    }
    return _color;
};

const parse$1 = parseColor;

/**
 * Create random color
 */
const randomColor = (colorType = "hex", alpha = 1) => {
    const rnd = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
    let hex, r, g, b;

    r = rnd(0, 255);
    g = rnd(0, 255);
    b = rnd(0, 255);

    hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return colorType === "hex" ? hex : toColor(hex, colorType, alpha);
};

const random = randomColor;

var routines = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Primitives: Primitives$1,
    colorTypes: colorTypes,
    colorDefaultProps: colorDefaultProps,
    test: test,
    createColor: createColor,
    create: create,
    expandHexColor: expandHexColor,
    expand: expand,
    isDark: isDark,
    isLight: isLight,
    isHSV: isHSV,
    isHSL: isHSL,
    isHSLA: isHSLA,
    isRGB: isRGB,
    isRGBA: isRGBA,
    isCMYK: isCMYK,
    isHEX: isHEX,
    isColor: isColor,
    colorType: colorType,
    equal: equal,
    colorToString: colorToString,
    hex2rgb: hex2rgb,
    rgb2hex: rgb2hex,
    rgb2hsv: rgb2hsv,
    hsv2rgb: hsv2rgb,
    hsv2hex: hsv2hex,
    hex2hsv: hex2hsv,
    rgb2cmyk: rgb2cmyk,
    cmyk2rgb: cmyk2rgb,
    hsv2hsl: hsv2hsl,
    hsl2hsv: hsl2hsv,
    rgb2websafe: rgb2websafe,
    rgba2websafe: rgba2websafe,
    hex2websafe: hex2websafe,
    hsv2websafe: hsv2websafe,
    hsl2websafe: hsl2websafe,
    cmyk2websafe: cmyk2websafe,
    websafe: websafe,
    toColor: toColor,
    toHEX: toHEX,
    toRGB: toRGB,
    toRGBA: toRGBA,
    toHSV: toHSV,
    toHSL: toHSL,
    toHSLA: toHSLA,
    toCMYK: toCMYK,
    grayscale: grayscale,
    darken: darken,
    lighten: lighten,
    hueShift: hueShift,
    mix: mix,
    multiply: multiply,
    shade: shade,
    saturate: saturate,
    desaturate: desaturate,
    spin: spin,
    brighten: brighten,
    add: add,
    createColorScheme: createColorScheme,
    parseColor: parseColor,
    parse: parse$1,
    randomColor: randomColor,
    random: random
});

let Farbe$1 = class Farbe {
    /**
     * Private method for setting value. Do not use outside
     * @param {*} color
     * @private
     */
    _setValue(color) {
        if (!color) {
            color = "#000000";
        }
        if (typeof color === "string") {
            color = parseColor(color);
        }
        if (color && isColor(color)) {
            this._value = color;
        } else {
            this._value = undefined;
        }
    }

    /**
     * Private method for setting options
     * @param options
     * @private
     */
    _setOptions(options) {
        this._options = Object.assign({}, colorDefaultProps, options);
    }

    /**
     * Constructor
     * @param {*} color. Set color value. Value must one of: hex, RGB, RGBA, HSL, HSLA, HSV, CMYK.
     * @param {Object} options
     */
    constructor(color = "#000000", options = null) {
        this._setValue(color);
        this._setOptions(options);
    }

    /**
     * Getter. Get options
     * @returns {{shade1: number, shade2: number, tint1: number, tint2: number, distance: number, alpha: number, angle: number, step: number, algorithm: number}}
     */
    get options() {
        return this._options;
    }

    /**
     * Setter. Set options. Will override default options
     * @param options
     */
    set options(options) {
        this._setOptions(options);
    }

    /**
     * Getter. Return current color value.
     * @returns {*}
     */
    get value() {
        return this._value ? this._value : undefined;
    }

    /**
     * Setter. Set color value. Value must one of: hex, RGB, RGBA, HSL, HSLA, HSV, CMYK.
     * @param {*} color
     */
    set value(color) {
        this._setValue(color);
    }

    /**
     * Convert current color to RGB
     * @returns {this | undefined}
     */
    toRGB() {
        if (!this._value) {
            return;
        }
        this._value = toRGB(this._value);
        return this;
    }

    /**
     * Getter.  Get color in RGB format
     * @returns {RGB | undefined}
     */
    get rgb() {
        return this._value ? toRGB(this._value) : undefined;
    }

    /**
     * Convert current value to RGBA
     * @param alpha - Alpha chanel value.
     * @returns {this | undefined}
     */
    toRGBA(alpha) {
        if (!this._value) {
            return;
        }
        if (isRGBA(this._value)) {
            if (alpha) {
                this._value = toRGBA(this._value, alpha);
            }
        } else {
            this._value = toRGBA(
                this._value,
                alpha || colorDefaultProps.alpha
            );
        }
        return this;
    }

    /**
     * Getter. Get value in RGBA format. For alpha chanel value used options.alpha
     * @returns {RGBA | undefined}
     */
    get rgba() {
        return this._value
            ? isRGBA(this._value)
                ? this._value
                : toRGBA(this._value, this._options.alpha)
            : undefined;
    }

    /**
     * Convert current value to HEX
     * @returns {this | undefined}
     */
    toHEX() {
        if (!this._value) {
            return;
        }
        this._value = toHEX(this._value);
        return this;
    }

    /**
     * Getter. Get value as HEX
     * @returns {string | undefined}
     */
    get hex() {
        return this._value ? toHEX(this._value) : undefined;
    }

    /**
     * Convert current value to HSV
     * @returns {this | undefined}
     */
    toHSV() {
        if (!this._value) {
            return;
        }
        this._value = toHSV(this._value);
        return this;
    }

    /**
     * Getter. Get value as HSV
     * @returns {HSV | undefined}
     */
    get hsv() {
        return this._value ? toHSV(this._value) : undefined;
    }

    /**
     * Convert current value to HSL
     * @returns {this | undefined}
     */
    toHSL() {
        if (!this._value) {
            return;
        }
        this._value = toHSL(this._value);
        return this;
    }

    /**
     * Getter. Get value as HSL
     * @returns {HSL | undefined}
     */
    get hsl() {
        return this._value ? toHSL(this._value) : undefined;
    }

    /**
     * Convert current value to HSV
     * @param alpha
     * @returns {this | undefined}
     */
    toHSLA(alpha) {
        if (!this._value) {
            return;
        }
        if (isHSLA(this._value)) {
            if (alpha) {
                this._value = toHSLA(this._value, alpha);
            }
        } else {
            this._value = toHSLA(this._value, alpha);
        }
        return this;
    }

    /**
     * Getter. Get value as HSLA. For alpha used options.alpha
     * @returns {HSLA | undefined}
     */
    get hsla() {
        return this._value
            ? isHSLA(this._value)
                ? this._value
                : toHSLA(this._value, this._options.alpha)
            : undefined;
    }

    /**
     * Convert current value to CMYK
     * @returns {this | undefined}
     */
    toCMYK() {
        if (!this._value) {
            return;
        }
        this._value = toCMYK(this._value);
        return this;
    }

    /**
     * Getter. Get value as CMYK
     * @returns {CMYK | undefined}
     */
    get cmyk() {
        return this._value ? toCMYK(this._value) : undefined;
    }

    /**
     * Convert color value to websafe value
     * @returns {this | undefined}
     */
    toWebsafe() {
        if (!this._value) {
            return;
        }
        this._value = websafe(this._value);
        return this;
    }

    /**
     * Getter. Get value as websafe.
     * @returns {HSLA | undefined}
     */
    get websafe() {
        return this._value ? websafe(this._value) : undefined;
    }

    /**
     * Get stringify color value
     * @returns {string} This function return string presentation of color. Example: for RGB will return rgb(x, y, z)
     */
    toString() {
        return this._value ? colorToString(this._value) : undefined;
    }

    /**
     * Darken color for requested percent value
     * @param {int} amount - Value must between 0 and 100. Default value is 10
     * @returns {this | undefined}
     */
    darken(amount = 10) {
        if (!this._value) {
            return;
        }
        this._value = darken(this._value, amount);
        return this;
    }

    /**
     * Darken color for requested percent value
     * @param {int} amount - Value must between 0 and 100. Default value is 10
     * @returns {this | undefined}
     */
    lighten(amount = 10) {
        if (!this._value) {
            return;
        }
        this._value = lighten(this._value, amount);
        return this;
    }

    /**
     * Return true, if current color id dark
     * @returns {boolean|undefined}
     */
    isDark() {
        return this._value ? isDark(this._value) : undefined;
    }

    /**
     * Return true, if current color id light
     * @returns {boolean|undefined}
     */
    isLight() {
        return this._value ? isLight(this._value) : undefined;
    }

    /**
     * Change value on wheel with specified angle
     * @param {int} angle - Value between -360 and 360
     */
    hueShift(angle) {
        if (!this._value) {
            return;
        }
        this._value = hueShift(this._value, angle);
        return this;
    }

    /**
     * Convert color value to grayscale value
     * @returns {this | undefined}
     */
    grayscale() {
        if (!this._value || this.type === colorTypes.UNKNOWN) {
            return;
        }
        this._value = grayscale(
            this._value,
            ("" + this.type).toLowerCase()
        );
        return this;
    }

    /**
     * Getter. Get color type
     * @returns {string}
     */
    get type() {
        return colorType(this._value);
    }

    /**
     * Create specified  color scheme for current color value
     * @param {string} name - Scheme name
     * @param {string} format - Format for returned values
     * @param {Object} options - Options for generated schema, will override default options
     * @returns {Array | undefined}
     */
    getScheme(name, format, options) {
        return this._value
            ? createColorScheme(this._value, name, format, options)
            : undefined;
    }

    /**
     * Check if color is equal to comparison color
     * @param {*} color
     * @returns {boolean}
     */
    equal(color) {
        return equal(this._value, color);
    }

    random(colorType, alpha){
        this._value = randomColor(colorType, alpha);
    }

    channel(ch, val){
        const currentType = this.type;

        if (["red", "green", "blue"].includes(ch)) {
            this.toRGB();
            this._value[["red", "green", "blue"].indexOf(ch)] = val;
            this["to"+currentType]();
        }
        if (ch === "alpha" && this._value.a) {
            this._value.a = val;
        }
        if (["hue", "saturation", "value"].includes(ch)) {
            this.toHSV();
            this._value[["hue", "saturation", "value"].indexOf(ch)] = val;
            this["to"+currentType]();
        }
        if (["lightness"].includes(ch)) {
            this.toHSL();
            this._value[2] = val;
            this["to"+currentType]();
        }
        if (["cyan", "magenta", "yellow", "black"].includes(ch)) {
            this.toCMYK();
            this._value[["cyan", "magenta", "yellow", "black"].indexOf(ch)] = val;
            this["to"+currentType]();
        }

        return this;
    }

    add(color){
        this._setValue(add(this._value, color));
    }

    mix(color, amount){
        this._setValue(mix(this._value, color, amount));
    }

    multiply(color){
        this._setValue(multiply(this._value, color));
    }

    shade(amount){
        this._setValue(shade(this._value, amount));
    }

    saturate(amount){
        this._setValue(saturate(this._value, amount));
    }

    desaturate(amount){
        this._setValue(desaturate(this._value, amount));
    }

    spin(amount){
        this._setValue(spin(this._value, amount));
    }

    brighten(amount){
        this._setValue(brighten(this._value, amount));
    }
};

const Primitives = {
    ...Primitives$1
};

const version$3 = "1.0.3";
const build_time$3 = "14.07.2024, 17:25:33";

const info$3 = () => {
    console.info(`%c Farbe %c v${version$3} %c ${build_time$3} `, "color: #ffffff; font-weight: bold; background: #ff00ff", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

globalThis.Farbe = Farbe$1;
globalThis.farbe = c => new Farbe$1(c);

globalThis.Farbe.Routines = routines;
globalThis.Farbe.Palette = Palette;
globalThis.Farbe.StandardColors = StandardColorPalette;
globalThis.Farbe.MetroColors = MetroColorPalette;
globalThis.Farbe.Primitives = Primitives;
globalThis.Farbe.info = info$3;

/*!
 * HtmlJS - Create html elements with JS
 * Copyright 2024 by Serhii Pimenov
 * Licensed under MIT
 !*/

function dashedName(str){
    return str.replace(/([A-Z])/g, function(u) { return "-" + u.toLowerCase(); });
}

function setClasses(src = []){
    return Array.isArray(src) ? src.join(" ") : src.toString()
}

const numProps = ['opacity', 'zIndex', "order", "zoom"];

function setStyles(src = {}){
    return typeof src === "string" ? src : Object.keys( src ).map( key => {
        const propName = dashedName(key);
        let propVal = src[key];

        if (!numProps.includes(propName) && !isNaN(propVal)) {
            propVal += 'px';
        }

        return `${propName}: ${propVal}`
    } ).join(";")
}

const globalAttributes = [
    "accesskey",
    "autocapitalize",
    "autofocus",
    "contenteditable",
    "dir",
    "draggable",
    "enterkeyhint",
    "hidden",
    "inert",
    "inputmode",
    "is",
    "itemid",
    "itemprop",
    "itemref",
    "itemscope",
    'itemtype',
    "lang",
    "nonce",
    "popover",
    "spellcheck",
    "style",
    "tabindex",
    "title",
    "translate",
    "writingsuggestions"
];

const htmlParser = (str) => {
    let base, singleTag, result = [], ctx, _context;
    let regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i; // eslint-disable-line

    if (typeof str !== "string") {
        return undefined;
    }

    str = str.trim();

    ctx = document.implementation.createHTMLDocument("");
    base = ctx.createElement( "base" );
    base.href = document.location.href;
    ctx.head.appendChild( base );
    _context = ctx.body;

    singleTag = regexpSingleTag.exec(str);
    if (singleTag) {
        return document.createElement(singleTag[1])
    } else {
        _context.innerHTML = str;
        for(let i = 0; i < _context.childNodes.length; i++) {
            result.push(_context.childNodes[i]);
        }
    }

    return result[0];
};

const eventsList = [
    "onauxclick",
    "onbeforeinput",
    "onbeforematch",
    "onbeforetoggle",
    "onblur",
    "oncancel",
    "oncanplay",
    "oncanplaythrough",
    "onchange",
    "onclick",
    "onclose",
    "oncontextlost",
    "oncontextmenu",
    "oncontextrestored",
    "oncopy",
    "oncuechange",
    "oncut",
    "ondblclick",
    "ondrag",
    "ondragend",
    "ondragenter",
    "ondragleave",
    "ondragover",
    "ondragstart",
    "ondrop",
    "ondurationchange",
    "onemptied",
    "onended",
    "onerror",
    "onfocus",
    "onformdata",
    "oninput",
    "oninvalid",
    "onkeydown",
    "onkeypress",
    "onkeyup",
    "onload",
    "onloadeddata",
    "onloadedmetadata",
    "onloadstart",
    "onmousedown",
    "onmouseenter",
    "onmouseleave",
    "onmousemove",
    "onmouseout",
    "onmouseover",
    "onmouseup",
    "onpaste",
    "onpause",
    "onplay",
    "onplaying",
    "onprogress",
    "onratechange",
    "onreset",
    "onresize",
    "onscroll",
    "onscrollend",
    "onsecuritypolicyviolation",
    "onseeked",
    "onseeking",
    "onselect",
    "onslotchange",
    "onstalled",
    "onsubmit",
    "onsuspend",
    "ontimeupdate",
    "ontoggle",
    "onvolumechange",
    "onwaiting",
    "onwheel",
];

class BaseElement {
    constructor(options = {}) {
        this.options = options;
        this.tag = "div";
    }

    selfAttributes(){
        return []
    }

    get attributes(){
        return this.getAttributes().join(" ")
    }

    getAttributes(){
        let attr = [],
            single = ['hidden', 'disabled', 'required', 'readonly', 'selected', 'open', 'multiply', 'default'],
            service = ["className", "style", "data", "tag", "events"];

        for(let key in this.options) {
            if (service.includes(key))
                continue

            if ( single.includes(key) && this.options[key] === true ) {
                attr.push(key);
                continue
            }

            if ( (this.selfAttributes().includes(key) && !attr.includes(key)) || globalAttributes.includes(key) ) {
                attr.push(`${key}="${this.options[key]}"`);
            }
        }

        if (this.classes) attr.push(`class="${this.classes}"`);
        if (this.styles) attr.push(`style="${this.styles}"`);
        if (this.dataSet) attr.push(this.dataSet);
        if (this.aria) attr.push(this.aria);

        return attr
    }

    draw(){
        return this.template()
    }

    get dataSet(){
        const {data = {}} = this.options;
        let _ = [];

        for(let key in data) {
            _.push(`data-${dashedName(key)}="${data[key]}"`);
        }

        return _.join(" ")
    }

    get aria(){
        const {aria = {}} = this.options;
        let _ = [];

        for(let key in aria) {
            _.push(`aria-${key.toLowerCase()}="${aria[key]}"`);
        }

        return _.join(" ")
    }

    get events(){
        const {events = {}, control = true} = this.options;
        let eventsArray = [];

        for(let key in events) {
            if (control && !eventsList.includes(key)) {
                console.info(`Event ${key} for element ${this.tag} not specified in HTML specification`);
            }
            eventsArray.push(`${key.toLowerCase()}="${events[key]}"`);
        }

        return eventsArray.join(" ")
    }

    get classes(){
        return setClasses(this.options.class)
    }

    get styles(){
        return setStyles(this.options.style)
    }

    template(){
        return ``
    }

    toString(){
        return this.draw()
    }

    toElement(){
        return htmlParser(this.draw())
    }
}

const parser = element => {
    if (Array.isArray(element)) {
        return element.map( parser ).join("\n")
    } else if (typeof element === 'string' || typeof element === 'number' || typeof element === 'boolean') {
        return element
    } else if (element.draw) {
        return element.draw()
    }
    throw new Error("Unknown element! " + element)
};

class Tag extends BaseElement {
    constructor(...args) {
        let options = {};
        let children = [];
        for(let a of args) {
            if (typeof a === "object" && !(a instanceof BaseElement)) {
                options = a;
            } else {
                children.push(a);
            }
        }
        super(options);
        this.children = children;
    }

    template(content){
        const tag = this.options.tag ? this.options.tag : this.tag;
        return `
            <${tag} ${this.attributes} ${this.events}>${content}</${tag}>
        `
    }

    draw(){
        return this.template(this.children.map( parser ).join(""))
    }
}

class SingleTag extends BaseElement {
    constructor(options = {}) {
        super(options);
        this.options = options;
    }

    template(){
        const tag = this.options.tag ? this.options.tag : this.tag;

        return `
            <${tag} ${this.attributes} ${this.events}/>
        `
    }
}

const render = (view = [], renderTo = document.body, options = {}) => {
    let html, renderPoint;


    const {clear = true, where = 'beforeend'} = options;

    renderPoint = typeof renderTo === "string" ? document.querySelector(renderTo) : renderTo;

    if (!(renderPoint instanceof HTMLElement)) {
        renderPoint = document.body;
    }

    if (clear) {
        renderPoint.innerHTML = "";
    }

    if (!Array.isArray(view)) {
        view = [view];
    }

    html = view.map( parser ).join("");
    renderPoint.insertAdjacentHTML(where, html);
};

class Router {
    version = "0.1.0"
    _routes = []
    _route = '/'
    _mode = null
    _ignore = '[data-route-ignore]'
    _404 = () => {}

    constructor(options = {}) {
        this.options = Object.assign({}, this.options, options);

        if (this.options.mode) this._mode = this.options.mode;
        if (this.options.ignore) this._ignore = this.options.ignore;
        if (this.options.routes) this.addRoutes(this.options.routes);
        if (this.options["404"] && typeof this.options["404"] === "function") this._404 = this.options["404"];
    }

    clearSlashes(path) {
        return path.replace(/\/$/, '').replace(/^\//, '')
    }

    index(path){
        let exists = -1;

        for(let i = 0; i < this._routes.length; i++) {
            if (this._routes[i].path === path) {
                exists = i;
                break
            }
        }

        return exists
    }

    routeExists(path){
        return this.index(path) !== -1
    }

    _routesFn(routes, fn){
        if (Array.isArray(routes) && routes.length) {
            routes.forEach( r => {
                if (r.path)
                    this[fn](r.path, r.callback);
            } );
        } else if (typeof routes === "object") {
            for (let key in routes) {
                if (routes.hasOwnProperty(key))
                    this[fn](key, routes[key]);
            }
        }

    }

    addRoute(path, callback){
        if (path && !this.routeExists(path)) {
            this._routes.push({
                path: path,
                callback: callback,
                pattern: new RegExp('^' + (path).replace(/:\w+/g,'(\\w+)') + '$'),
            });
        }

        return this
    }

    addRoutes(routes){
        this._routesFn(routes, 'addRoute');
        return this
    }

    updRoute(path, route){
        const i = this.index(path);

        if (i === -1) return

        if (route && route.path) this._routes[i].path = route.path;
        if (route && route.callback) this._routes[i].callback = route.callback;

        return this
    }

    updRoutes(routes){
        this._routesFn(routes, 'updRoute');
        return this
    }

    delRoute(path){
        if (this.routeExists(path))
            delete this._routes[path];

        return this
    }

    findRoute(path){
        let result;

        for (let i = 0; i < this._routes.length; i++) {
            if (path.match(this._routes[i].pattern)) {
                result = this._routes[i];
                break
            }
        }

        return result
    }

    exec(loc = document.location, pushState = false){
        let url, path, route;

        url = new URL(loc);
        path = url.pathname;
        route = this.findRoute(path);

        if (!route) {
            this._404();
            return this
        }

        if (pushState)
            history.pushState(null, null, path);

        if (route && typeof route.callback === "function") {
            route.callback.apply(this, [path]);
        }

        this.route = path;

        return this
    }

    listen(){
        const {ignore} = this.options;

        window.addEventListener('click', (e) => {
            const target = e.target;
            let href;

            if (target.tagName.toLowerCase() !== "a" || target.matches(ignore)) return

            e.preventDefault();

            href = target.href;

            if (href) this.exec(href, true);
        }, false);

        window.addEventListener("popstate", (e) => {
            this.exec(document.location);
        }, false);

        return this
    }
}

const router = routes => new Router(routes);

const createStyleElement = (content = '', media) => {
    let style = document.createElement("style");

    if (media !== undefined) {
        style.setAttribute("media", media);
    }

    style.appendChild(document.createTextNode(content));
    document.head.appendChild(style);

    return style
};

const createStyleSheet = (media) => {
    return createStyleElement(media).sheet
};

const addCssRule = (sheet, selector, rules) => {
    sheet.insertRule(selector + "{" + rules + "}");
};

const addStyle = (style, media) => {
    if (typeof style === "string") {
        createStyleElement(style, media);
        return
    }

    const sheet = createStyleSheet(media);
    for(let key in style) {
        addCssRule(sheet, key, setStyles(style[key]));
    }
};

const cssLoader = async (path, options) => {
    let response = await fetch(path, options), textNode, tag;

    if (!response.ok) {
        throw new Error("HTTP error: " + response.status)
    }

    textNode = await response.text();
    tag = document.createElement("style");
    tag.appendChild(document.createTextNode(textNode));
    document.body.appendChild(tag);
};

const jsLoader = async (path, options) => {
    let response = await fetch(path, options), textNode, tag;

    if (!response.ok) {
        throw new Error("HTTP error: " + response.status)
    }

    textNode = await response.text();
    tag = document.createElement("script");
    tag.appendChild(document.createTextNode(textNode));
    document.body.appendChild(tag);
};

const viewLoader = async (path, options = {}, storage = false) => {
    let response, textNode, result = () => {}, storageKey;

    if (storage !== false) {
        storageKey = `html::key::${path}`;
        textNode = localStorage.getItem(storageKey);
    }

    if (!textNode) {

        response = await fetch(path, options);

        if (!response.ok) {
            throw new Error("HTTP error: " + response.status)
        }

        textNode = await response.text();

        if (storage !== false) {
            localStorage.setItem(storageKey, textNode);
        }
    }

    const eval2 = eval;

    eval2(`result = ${textNode}`);

    return typeof result === "function" ? result() : result
};

const clearViewStorageHolder = path => localStorage.removeItem(`html::key::${path}`);

class Html extends Tag {
    tag = 'html'

    selfAttributes() {
        return ["lang"]
    }
}

const html$1 = (...args) => new Html(...args);

class Head extends Tag {
    tag = 'head'
}

const head = (...args) => new Head(...args);

class Base extends SingleTag {
    tag = 'base'

    selfAttributes() {
        return ["href", "target"]
    }
}

const base = (options) => new Base(options);

class Link extends SingleTag {
    tag = 'link'

    selfAttributes() {
        return ["href", "crossorigin", "rel", "media", "integrity", "hreflang", "type", "referrerpolicy", "sizes", "imagesrcset", "imagesizes", "as", "blocking", "color", "disabled", "fetchpriority"]
    }
}

const link = options => new Link(options);

class Body extends Tag {
    tag = 'body'
}

const body = (...args) => new Body(...args);

class Span extends Tag {
    tag = 'span'
}

const span = (...args) => new Span(...args);

class Img extends SingleTag {
    tag = 'img'

    selfAttributes() {
        return ["align", "alt", "border", "height", "hspace", "ismap", "longdesc", "lowsrc", "src", "vspace", "width", "usemap"]
    }
}

const img = (src = '', alt = '', options = {}) => new Img({...options, src, alt});

class Input extends SingleTag {
    tag = "input"

    selfAttributes() {
        return [
            "accept", "align", "alt", "autocomplete", "autofocus", "border", "checked", "disabled", "form", "formaction",
            "formenctype", "formmethod", "formnovalidate", "formtarget", "list", "max", "maxlength", "min", "multiple",
            "name", "pattern", "placeholder", "size", "src", "step", "type", "value"
        ]
    }
}

const input = (options = {}) => new Input(options);

class Br extends SingleTag {
    tag = 'br'

    selfAttributes() {
        return ["clear"]
    }
}

const br = options => new Br(options);

class Hr extends SingleTag {
    tag = 'hr'
}

const hr = options => new Hr(options);

class Heading extends Tag {
    constructor(tag = 'h1', ...args) {
        super(...args);
        this.tag = tag;
    }
}

const heading = (tag = 'h1', ...args) => new Heading(tag, ...args);
const h1 = (...args) => heading('h1', ...args);
const h2 = (...args) => heading('h2', ...args);
const h3 = (...args) => heading('h3', ...args);
const h4 = (...args) => heading('h4', ...args);
const h5 = (...args) => heading('h5', ...args);
const h6 = (...args) => heading('h6', ...args);

class Section extends Tag {
    tag = 'section'
}

const section = (...args) => new Section(...args);

class Anchor extends Tag {
    tag = 'a'

    selfAttributes() {
        return ["coords", "download", "hreflang", "name", "rel", "rev", "shape", "target", "type", "href"]
    }
}

const anchor = (...args) => new Anchor(...args);
const a = (...args) => new Anchor(...args);

class Abbr extends Tag {
    tag = "abbr"
}

const abbr = (...args) => new Abbr(...args);

class Article extends Tag {
    tag = 'article'
}

const article = (...args) => new Article(...args);

class Nav extends Tag {
    tag = 'nav'
}

const nav = (...args) => new Nav(...args);

class Aside extends Tag {
    tag = 'aside'
}

const aside = (...args) => new Aside(...args);

class Header extends Tag {
    tag = 'header'
}

const header = (...args) => new Header(...args);

class Footer extends Tag {
    tag = 'footer'
}

const footer = (...args) => new Footer(...args);

class Address extends Tag {
    tag = 'address'
}

const address = (...args) => new Address(...args);

let Map$1 = class Map extends Tag {
    tag = 'map'

    selfAttributes() {
        return ["name"]
    }
};

const map = (...args) => new Map$1(...args);

class Area extends SingleTag {
    tag = 'area'

    selfAttributes() {
        return ["alt", "coords", "hreflang", "nohref", "shape", "target", "type", "href"]
    }
}

const area = (options = {}) => new Area(options);

class AudioTag extends Tag {
    tag = 'audio'

    selfAttributes() {
        return ["autoplay", "controls", "loop", "preload", "src"]
    }
}

const audio = (...args) => new AudioTag(...args);

class Bold extends Tag {
    tag = 'b'
}

const bold = (...args) => new Bold(...args);

class Bdi extends Tag {
    tag = 'bdi'
}

const bdi = (...args) => new Bdi(...args);

class Bdo extends Tag {
    tag = 'bdo'
}

const bdo = (...args) => new Bdo(...args);

class Blockquote extends Tag {
    tag = 'blockquote'

    selfAttributes() {
        return ["cite"];
    }
}

const blockquote = (...args) => new Blockquote(...args);

class Button extends Tag {
    tag = 'button'

    selfAttributes() {
        return ["autofocus", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "name", "type", "value"]
    }
}

const button = (...args) => new Button(...args);

class Canvas extends Tag {
    tag = 'canvas'

    selfAttributes() {
        return ["width", "height"]
    }
}

const canvas = (...args) => new Canvas(...args);

class Table extends Tag {
    tag = 'table'

    selfAttributes() {
        return [
            "align", "background", "bgcolor", "border", "bordercolor", "cellpadding",
            "cellspacing", "cols", "frame", "height", "rules", "summary", "width"
        ]
    }
}

const table = (...args) => new Table(...args);

class Caption extends Tag {
    tag = 'caption'

    selfAttributes() {
        return ["align", "valign"]
    }
}

const caption = (...args) => new Caption(...args);

class Col extends SingleTag {
    tag = 'col'

    selfAttributes() {
        return ["align", "valign", "char", "charoff", "span", "width"]
    }
}

const col = options => new Col(options);

class Colgroup extends SingleTag {
    tag = 'colgroup'

    selfAttributes() {
        return ["align", "valign", "char", "charoff", "span", "width"]
    }
}

const colgroup = options => new Colgroup(options);

class TableSection extends Tag {
    constructor(tag = 'tbody', ...args) {
        super(...args);
        this.tag = tag;
    }

    selfAttributes() {
        return ["align", "valign", "char", "charoff", "bgcolor"]
    }
}

const tbody = (...args) => new TableSection('tbody', ...args);
const thead = (...args) => new TableSection('thead', ...args);
const tfoot = (...args) => new TableSection('tfoot', ...args);

class TableRow extends Tag {
    tag = "tr"

    selfAttributes() {
        return ["align", "bgcolor", "bordercolor", "char", "charoff", "valign"]
    }
}

const tr = (...args) => new TableRow(...args);

class TableCell extends Tag {
    constructor(tag = 'td', ...args) {
        super(...args);
        this.tag = tag;
    }

    selfAttributes() {
        return ["abbr", "align", "axis", "background", "bgcolor", "bordercolor", "char", "charoff", "colspan", "headers", "height", "nowrap", "rowspan", "scope", "valign", "width"]
    }
}

const th = (...args) => new TableCell('th', ...args);
const td = (...args) => new TableCell('td', ...args);

class Cite extends Tag {
    tag = 'cite'
}

const cite = (...args) => new Cite(...args);

class Code extends Tag {
    tag = 'code'
}

const code = (...args) => new Code(...args);

class Dl extends Tag {
    tag = 'dl'
}

class Dt extends Tag {
    tag = 'dt'
}

class Dd extends Tag {
    tag = 'dd'
}

const dl = (...args) => new Dl(...args);
const dt = (...args) => new Dt(...args);
const dd = (...args) => new Dd(...args);

class Details extends Tag {
    tag = 'details'
}

const details = (...args) => new Details(...args);

class Summary extends Tag {
    tag = 'summary'
}

const summary = (...args) => new Summary(...args);

class Dfn extends Tag {
    tag = 'dfn'
}

const dfn = (...args) => new Dfn(...args);

class Div extends Tag {
    tag = 'div'

    selfAttributes() {
        return ["align", "title"]
    }
}

const div = (...args) => new Div(...args);

class Em extends Tag {
    tag = 'em'
}

const em = (...args) => new Em(...args);

class Ital extends Tag {
    tag = 'i'
}

const ital = (...args) => new Ital(...args);
const i = (...args) => new Ital(...args);

class Strong extends Tag {
    tag = 'strong'
}

const strong = (...args) => new Strong(...args);

class Embed extends Tag {
    tag = 'embed'

    selfAttributes() {
        return ["align", "height", "hspace", "pluginspace", "src", "type", "vspace", "width"]
    }
}

const embed = (...args) => new Embed(...args);

class NoEmbed extends Tag {
    tag = 'noembed'
}

const noembed = (...args) => new NoEmbed(...args);

class Fieldset extends Tag {
    tag = 'fieldset'

    selfAttributes() {
        return ["form", "title"]
    }
}

const fieldset = (...args) => new Fieldset(...args);

class Legend extends Tag {
    tag = 'legend'

    selfAttributes() {
        return ["align", "title"]
    }
}

const legend = (...args) => new Legend(...args);

class Figure extends Tag {
    tag = 'figure'
}

const figure = (...args) => new Figure(...args);

class FigCaption extends Tag {
    tag = 'figcaption'
}

const figcaption = (...args) => new FigCaption(...args);

class Form extends Tag {
    tag = 'form'

    selfAttributes() {
        return ["accept-charset", "action", "autocomplete", "enctype", "method", "name", "novalidate", "target"]
    }
}

const form = (...args) => new Form(...args);

class Frameset extends Tag {
    tag = 'frameset'

    selfAttributes() {
        return ["border", "bordercolor", "cols", "frameborder", "framespacing", "rows"]
    }
}

const frameset = (...args) => new Frameset(...args);

class Frame extends SingleTag {
    tag = 'frame'

    selfAttributes() {
        return ["bordercolor", "frameborder", "noresize", "name", "src", "scrolling"]
    }
}

const frame = (options = {}) => new Frame(options);

class NoFrames extends Tag {
    tag = 'noframes'
}

const noframes = (...args) => new NoFrames(...args);

class IFrame extends Tag {
    tag = 'iframe'

    selfAttributes() {
        return ["align", "allowtransparency", "frameborder", "height", "hspace", "marginheight", "marginwidth", "name", "sandbox", "scrolling", "seamless", "src", "srcdoc", "vspace", "width"]
    }
}

const iframe = (...args) => new IFrame(...args);

class Ins extends Tag {
    tag = 'ins'

    selfAttributes() {
        return ["cite", "datetime"]
    }
}

const ins = (...args) => new Ins(...args);

class Kbd extends Tag {
    tag = 'kbd'
}

const kbd = (...args) => new Kbd(...args);

class Label extends Tag {
    tag = 'label'

    selfAttributes() {
        return ["for"]
    }
}

const label = (...args) => new Label(...args);

class List extends Tag {
    constructor(tag = 'ul', ...args) {
        super(...args);
        this.tag = tag;
    }

    selfAttributes() {
        return this.tag === 'ul'
            ? ["type"]
            : ["type", "reserved", "start"]
    }
}

class ListItem extends Tag {
    tag = "li"

    selfAttributes() {
        return ["type", "value"]
    }
}

const ul = (...args) => new List('ul', ...args);
const ol = (...args) => new List('ol', ...args);
const li = (...args) => new ListItem(...args);

class Mark extends Tag {
    tag = 'mark'
}

const mark = (...args) => new Mark(...args);

class NoScript extends Tag {
    tag = 'noscript'
}

const noscript = (...args) => new NoScript(...args);

class Select extends Tag {
    tag = 'select'

    selfAttributes() {
        return ["autofocus", "form", "name", "size"]
    }
}

const select = (...args) => new Select(...args);

class OptionGroup extends Tag {
    tag = 'optgroup'

    selfAttributes() {
        return ["label"]
    }
}

const optgroup = (...args) => new OptionGroup(...args);

class Option extends Tag {
    tag = 'option'

    selfAttributes() {
        return ["label", "value"]
    }
}

const option = (...args) => new Option(...args);

class Output extends Tag {
    tag = 'output'

    selfAttributes() {
        return ["for", "form", "name"]
    }
}

const output = (...args) => new Output(...args);

class Paragraph extends Tag {
    tag = 'p'

    selfAttributes() {
        return ["align"]
    }
}

const paragraph = (...args) => new Paragraph(...args);
const p = (...args) => new Paragraph(...args);

class Pre extends Tag {
    tag = 'pre'
}

const pre = (...args) => new Pre(...args);

class Quoted extends Tag {
    tag = 'q'

    selfAttributes() {
        return ["cite"]
    }
}

const q = (...args) => new Quoted(...args);
const quoted = (...args) => new Quoted(...args);

class Strike extends Tag {
    tag = 'strike'
}

const strike = (...args) => new Strike(...args);
const s = (...args) => new Strike(...args);

class Script extends Tag {
    tag = 'script'

    selfAttributes() {
        return ["async", "defer", "language", "src", "type"]
    }
}

const script = (...args) => new Script(...args);

class Small extends Tag {
    tag = 'small'
}

const small = (...args) => new Small(...args);

class Source extends SingleTag {
    tag = 'source'

    selfAttributes() {
        return ["media", "src", "type"]
    }
}

const source = (options = {}) => new Source(options);

class Sub extends Tag {
    tag = 'sub'
}

const sub = (...args) => new Sub(...args);

class Sup extends Tag {
    tag = 'sup'
}

const sup = (...args) => new Sup(...args);

class Textarea extends Tag {
    tag = 'textarea'

    selfAttributes() {
        return ["autofocus", "cols", "form", "maxlength", "name", "placeholder", "rows", "wrap"]
    }
}

const textarea = (...args) => new Textarea(...args);

class Time extends Tag {
    tag = 'time'

    selfAttributes() {
        return ["datetime", "pubdate"]
    }
}

const time = (...args) => new Time(...args);

class Track extends SingleTag {
    tag = 'track'

    selfAttributes() {
        return ["kind", "src", "srclang", "label"]
    }
}

const track = (options = {}) => new Track(options);

class Var extends Tag {
    tag = 'var'
}

const variable = (...args) => new Var(...args);

class VideoTag extends Tag {
    tag = 'video'

    selfAttributes() {
        return ["autoplay", "controls", "height", "loop", "loop", "poster", "preload", "src", "width"]
    }
}

const video = (...args) => new VideoTag(...args);

class Wbr extends SingleTag {
    tag = 'wbr'
}

const wbr = options => new Wbr(options);

class Main extends Tag {
    tag = 'main'
}

const main = (...args) => new Main(...args);

class Meta extends SingleTag {
    tag = 'meta'

    selfAttributes() {
        return ["content", "name", "http-equiv", "charset"]
    }
}

const meta = options => new Meta(options);

class Title extends Tag {
    tag = 'title'
}

const title = text => new Title(text);

class Template extends Tag {
    tag = 'template'

    selfAttributes() {
        return ["shadowrootmode", "shadowrootdelegatesfocus", "shadowrootclonable", "shadowrootserializable"]
    }
}

const template = (...args) => new Template(...args);

class Ruby extends Tag {
    tag = 'ruby'
}

class Rt extends SingleTag {
    tag = 'rt'
}

class Rp extends SingleTag {
    tag = 'rp'
}

const ruby = (...args) => new Ruby(...args);
const rt = options => new Rt(options);
const rp = options => new Rp(options);

class Data extends Tag {
    tag = 'data'
}

const data = (...args) => new Data(...args);

class Picture extends Tag {
    tag = 'picture'
}

const picture = (...args) => new Picture(...args);

class Dialog extends Tag {
    tag = 'dialog'

    selfAttributes() {
        return ["open"]
    }
}

const dialog = (...args) => new Dialog(...args);

class Slot extends Tag {
    tag = 'slot'

    selfAttributes() {
        return ["name"]
    }
}

const slot = (...args) => new Slot(...args);

var Elements = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Abbr: Abbr,
    Address: Address,
    Anchor: Anchor,
    Area: Area,
    Article: Article,
    Aside: Aside,
    AudioTag: AudioTag,
    Base: Base,
    Bdi: Bdi,
    Bdo: Bdo,
    Blockquote: Blockquote,
    Body: Body,
    Bold: Bold,
    Br: Br,
    Button: Button,
    Canvas: Canvas,
    Caption: Caption,
    Cite: Cite,
    Code: Code,
    Col: Col,
    Colgroup: Colgroup,
    Data: Data,
    Dd: Dd,
    Details: Details,
    Dfn: Dfn,
    Dialog: Dialog,
    Div: Div,
    Dl: Dl,
    Dt: Dt,
    Em: Em,
    Embed: Embed,
    Fieldset: Fieldset,
    FigCaption: FigCaption,
    Figure: Figure,
    Footer: Footer,
    Form: Form,
    Frame: Frame,
    Frameset: Frameset,
    Head: Head,
    Header: Header,
    Heading: Heading,
    Hr: Hr,
    Html: Html,
    IFrame: IFrame,
    Img: Img,
    Input: Input,
    Ins: Ins,
    Ital: Ital,
    Kbd: Kbd,
    Label: Label,
    Legend: Legend,
    Link: Link,
    List: List,
    ListItem: ListItem,
    Main: Main,
    Map: Map$1,
    Mark: Mark,
    Meta: Meta,
    Nav: Nav,
    NoEmbed: NoEmbed,
    NoFrames: NoFrames,
    NoScript: NoScript,
    Option: Option,
    OptionGroup: OptionGroup,
    Output: Output,
    Paragraph: Paragraph,
    Picture: Picture,
    Pre: Pre,
    Quoted: Quoted,
    Rp: Rp,
    Rt: Rt,
    Ruby: Ruby,
    Script: Script,
    Section: Section,
    Select: Select,
    Slot: Slot,
    Small: Small,
    Source: Source,
    Span: Span,
    Strike: Strike,
    Strong: Strong,
    Sub: Sub,
    Summary: Summary,
    Sup: Sup,
    Table: Table,
    TableCell: TableCell,
    TableRow: TableRow,
    TableSection: TableSection,
    Template: Template,
    Textarea: Textarea,
    Time: Time,
    Title: Title,
    Track: Track,
    Var: Var,
    VideoTag: VideoTag,
    Wbr: Wbr,
    a: a,
    abbr: abbr,
    address: address,
    anchor: anchor,
    area: area,
    article: article,
    aside: aside,
    audio: audio,
    base: base,
    bdi: bdi,
    bdo: bdo,
    blockquote: blockquote,
    body: body,
    bold: bold,
    br: br,
    button: button,
    canvas: canvas,
    caption: caption,
    cite: cite,
    code: code,
    col: col,
    colgroup: colgroup,
    data: data,
    dd: dd,
    details: details,
    dfn: dfn,
    dialog: dialog,
    div: div,
    dl: dl,
    dt: dt,
    em: em,
    embed: embed,
    fieldset: fieldset,
    figcaption: figcaption,
    figure: figure,
    footer: footer,
    form: form,
    frame: frame,
    frameset: frameset,
    h1: h1,
    h2: h2,
    h3: h3,
    h4: h4,
    h5: h5,
    h6: h6,
    head: head,
    header: header,
    heading: heading,
    hr: hr,
    html: html$1,
    i: i,
    iframe: iframe,
    img: img,
    input: input,
    ins: ins,
    ital: ital,
    kbd: kbd,
    label: label,
    legend: legend,
    li: li,
    link: link,
    main: main,
    map: map,
    mark: mark,
    meta: meta,
    nav: nav,
    noembed: noembed,
    noframes: noframes,
    noscript: noscript,
    ol: ol,
    optgroup: optgroup,
    option: option,
    output: output,
    p: p,
    paragraph: paragraph,
    picture: picture,
    pre: pre,
    q: q,
    quoted: quoted,
    rp: rp,
    rt: rt,
    ruby: ruby,
    s: s,
    script: script,
    section: section,
    select: select,
    slot: slot,
    small: small,
    source: source,
    span: span,
    strike: strike,
    strong: strong,
    sub: sub,
    summary: summary,
    sup: sup,
    table: table,
    tbody: tbody,
    td: td,
    template: template,
    textarea: textarea,
    tfoot: tfoot,
    th: th,
    thead: thead,
    time: time,
    title: title,
    tr: tr,
    track: track,
    ul: ul,
    variable: variable,
    video: video,
    wbr: wbr
});

const __htmlSaver = {};

const version$2 = "0.11.0";
const build_time$2 = "24.06.2024, 17:03:41";

const info$2 = () => {
    console.info(`%c HtmlJS %c v${version$2} %c ${build_time$2} `, "color: #ffffff; font-weight: bold; background: #708238", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

const extract = (ctx = globalThis) => {
    for (let key in Elements) {
        if (globalThis[key]) __htmlSaver[key] = globalThis[key];
        ctx[key] = Elements[key];
    }
};

const restore = (ctx = globalThis) => {
    for (let key in __htmlSaver) {
        ctx[key] = __htmlSaver[key];
    }
};

const htmljs = {
    ...Elements,
    extract,
    restore,
    info: info$2
};

globalThis.htmljs = {
    addStyle,
    addCssRule,
    cssLoader,
    jsLoader,
    viewLoader,
    clearViewStorageHolder,
    createStyleElement,
    createStyleSheet,
    render,
    ...htmljs
};

globalThis.Router = Router;
globalThis.Router.create = router;

/*!
 * Animation - Library for animating HTML elements.
 * Copyright 2024 by Serhii Pimenov
 * Licensed under MIT
 !*/

const transformProps = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY'];
const numberProps = ['opacity', 'zIndex'];
const floatProps = ['opacity', 'volume'];
const scrollProps = ["scrollLeft", "scrollTop"];
const colorProps = ["backgroundColor", "color"];
const reverseProps = ["opacity"];

const _getRelativeValue = (to, from) => {
    const operator = /^(\*=|\+=|-=)/.exec(to);
    if (!operator) return to;
    const u = getUnit(to) || 0;
    const x = parseFloat(from);
    const y = parseFloat(to.replace(operator[0], ''));
    switch (operator[0][0]) {
        case '+':
            return x + y + u;
        case '-':
            return x - y + u;
        case '*':
            return x * y + u;
    }
};

const _getStyle = (el, prop, pseudo) => {
    if (typeof el[prop] !== "undefined") {
        if (scrollProps.includes(prop)) {
            return prop === "scrollLeft" ? el === window ? pageXOffset : el.scrollLeft : el === window ? pageYOffset : el.scrollTop
        } else {
            return el[prop] || 0;
        }
    }
    return el.style[prop] || getComputedStyle(el, pseudo)[prop];
};

const _setStyle = (el, key, val, unit, toInt = false) => {
    key = camelCase(key);

    if (toInt) {
        val  = parseInt(val);
    }

    if (el instanceof HTMLElement) {
        if (typeof el[key] !== "undefined") {
            el[key] = val;
        } else {
            el.style[key] = key === "transform" || key.toLowerCase().includes('color') ? val : val + unit;
        }
    } else {
        el[key] = val;
    }
};

const _applyStyles = (el, mapProps, p) => {
    each(mapProps, (key, val) => {
        _setStyle(el, key, val[0] + (val[2] * p), val[3], val[4]);
    });
};

const _getElementTransforms = (el) => {
    if (!el instanceof HTMLElement) return;
    const str = el.style.transform || '';
    const reg = /(\w+)\(([^)]*)\)/g;
    const transforms = new Map();
    let m;
    while (m = reg.exec(str))
        transforms.set(m[1], m[2]);
    return transforms;
};

const _getColorArrayFromHex = (val) => Array.from(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(val ? val : "#000000")).slice(1).map((v) => parseInt(v, 16));
const _getColorArrayFromElement = (el, key) => getComputedStyle(el)[key].replace(/[^\d.,]/g, '').split(',').map((v) => parseInt(v));

const _applyTransform = (el, mapProps, p) => {
    let t = [];
    let elTransforms = _getElementTransforms(el);

    each(mapProps, (key, val) => {
        let from = val[0]; val[1]; let delta = val[2], unit = val[3];

        if ((key).includes("rotate") || (key).includes("skew")) {
            if (unit === "") unit = "deg";
        } else if ((key).includes("scale")) {
            unit = "";
        } else {
            unit = "px";
        }

        if (unit === "turn") {
            t.push(`${key}(${(val[1] * p) + unit})`);
        } else {
            t.push(`${key}(${from + (delta * p) + unit})`);
        }
    });

    elTransforms.forEach((val, key) => {
        if (mapProps[key] === undefined) {
            t.push(`${key}(${val})`);
        }
    });

    _setStyle(el, "transform", t.join(" "));
};

const _applyColors = function (el, mapProps, p) {
    each(mapProps, function (key, val) {
        let result = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            result[i] = Math.floor(val[0][i] + (val[2][i] * p));
        }
        _setStyle(el, key, `rgb(${result.join(",")})`);
    });
};

const _expandColorValue = (val) => {
    const regExp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    if (val[0] === "#" && val.length === 4) {
        return "#" + val.replace(regExp, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });
    }
    return val[0] === "#" ? val : "#"+val;
};

const applyProps = function (el, map, p) {
    _applyStyles(el, map.props, p);
    _applyTransform(el, map.transform, p);
    _applyColors(el, map.color, p);
};

const createAnimationMap = (el, draw, dir = "normal") => {
    const map = {
        props: {},
        transform: {},
        color: {}
    };
    let from, to, delta, unit;
    let elTransforms = _getElementTransforms(el);

    each(draw, (key, val) => {
        const isTransformProp = transformProps.includes(key);
        const isNumProp = numberProps.includes(key);
        const isColorProp = colorProps.includes(key);

        if (Array.isArray(val) && val.length === 1) {
            val = val[0];
        }

        if (!Array.isArray(val)) {
            if (isTransformProp) {
                from = elTransforms.get(key) || 0;
            } else if (isColorProp) {
                from = _getColorArrayFromElement(el, key);
            } else {
                from = _getStyle(el, key);
            }
            from = !isColorProp ? parseUnit(from) : from;
            to = !isColorProp ? parseUnit(_getRelativeValue(val, Array.isArray(from) ? from[0] : from)) : _getColorArrayFromHex(val);
        } else {
            from = !isColorProp ? parseUnit(val[0]) : _getColorArrayFromHex(_expandColorValue(val[0]));
            to = !isColorProp ? parseUnit(val[1]) : _getColorArrayFromHex(_expandColorValue(val[1]));
        }

        if (reverseProps.includes(key) && from[0] === to[0]) {
            from[0] = to[0] > 0 ? 0 : 1;
        }

        if (dir === "reverse") {
            [to, from] = [from, to];
        }

        unit = el instanceof HTMLElement && to[1] === '' && !isNumProp && !isTransformProp ? 'px' : to[1];

        if (isColorProp) {
            delta = [0, 0, 0];
            for (let i = 0; i < 3; i++) {
                delta[i] = to[i] - from[i];
            }
        } else {
            delta = to[0] - from[0];
        }

        if (isTransformProp) {
            map.transform[key] = [from[0], to[0], delta, unit];
        } else if (isColorProp) {
            map.color[key] = [from, to, delta, unit];
        } else {
            map.props[key] = [from[0], to[0], delta, unit, !floatProps.includes(key)];
        }
    });

    return map;
};

const exec = (fn, args, context) => {
    let func;

    if (typeof fn === "function") {
        func = fn;
    } else
    if (/^[a-z]+[\w.]*[\w]$/i.test(fn)) {
        const ns = fn.split(".");
        func = global;

        for(let i = 0; i < ns.length; i++) {
            func = func[ns[i]];
        }
    } else {
        func = new Function("a", fn);
    }

    return func.apply(context, args);
};

const undef = (val) => typeof val === "undefined" || val === undefined || val === null;

const camelCase = (str) => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

const each = (ctx, cb) => {
    let index = 0;
    if (isArrayLike(ctx)) {
        [].forEach.call(ctx, function(val, key) {
            cb.apply(val, [key, val]);
        });
    } else {
        for(let key in ctx) {
            if (ctx.hasOwnProperty(key))
                cb.apply(ctx[key], [key, ctx[key],  index++]);
        }
    }

    return ctx;
};

const isArrayLike = (obj) => {
    return (
        Array.isArray(obj) || (
            typeof obj === "object" &&
            "length" in obj &&
            typeof obj.length === "number"
        )
    );
};

const getUnit = (val, und) => {
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    return typeof split[1] !== "undefined" ? split[1] : und;
};

const parseUnit = (str) => {
    const out = [ 0, '' ];
    str = ""+str;
    out[0] = parseFloat(str);
    out[1] = str.match(/[\d.\-+]*\s*(.*)/)[1] || '';
    return out;
};

// Based on anime.js by Julian Garnier (https://github.com/juliangarnier/anime)

function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

const Easing = {
    linear: () => t => t
};

Easing.default = Easing.linear;

const eases = {
    Sine: () => t => 1 - Math.cos(t * Math.PI / 2),
    Circ: () => t => 1 - Math.sqrt(1 - t * t),
    Back: () => t => t * t * (3 * t - 2),
    Bounce: () => t => {
        let pow2, b = 4;
        while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    },
    Elastic: (amplitude = 1, period = .5) => {
        const a = minMax(amplitude, 1, 10);
        const p = minMax(period, .1, 2);
        return t => {
            return (t === 0 || t === 1) ? t :
                -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        }
    }
};

['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach((name, i) => {
    eases[name] = () => t => Math.pow(t, i + 2);
});

Object.keys(eases).forEach(name => {
    const easeIn = eases[name];
    Easing['easeIn' + name] = easeIn;
    Easing['easeOut' + name] = (a, b) => t => 1 - easeIn(a, b)(1 - t);
    Easing['easeInOut' + name] = (a, b) => t => t < 0.5 ? easeIn(a, b)(t * 2) / 2 :
        1 - easeIn(a, b)(t * -2 + 2) / 2;
});

const Animation$1 = {
    fx: true,
    elements: {}
};

const defaultProps = {
    id: null,
    el: null,
    draw: {},
    dur: 1000,
    ease: "linear",
    loop: 0,
    pause: 0,
    dir: "normal",
    defer: 0,
    onFrame: () => {},
    onDone: () => {}
};

const animate = function(args){
    return new Promise(function(resolve){
        let start;
        let {id, el, draw, dur, ease, loop, onFrame, onDone, pause, dir, defer} = Object.assign({}, defaultProps, args);
        let map = {};
        let easeName = "linear", easeArgs = [], easeFn = Easing.linear, matchArgs;
        let direction = dir === "alternate" ? "normal" : dir;
        let replay = false;
        let animationID = id ? id : +(performance.now() * Math.pow(10, 14));

        if (undef(el)) {
            throw new Error("Unknown element!")
        }

        if (typeof el === "string") {
            el = document.querySelector(el);
        }

        if (typeof draw !== "function" && typeof draw !== "object") {
            throw new Error("Unknown draw object. Must be a function or object!")
        }

        if (dur === 0 || !Animation$1.fx) {
            dur = 1;
        }

        if (dir === "alternate" && typeof loop === "number") {
            loop *= 2;
        }

        if (typeof ease === "string") {
            matchArgs = /\(([^)]+)\)/.exec(ease);
            easeName = ease.split("(")[0];
            easeArgs = matchArgs ? matchArgs[1].split(',').map(p => parseFloat(p)) : [];
            easeFn = Easing[easeName];
        } else if (typeof ease === "function") {
            easeFn = ease;
        } else {
            easeFn = Easing.linear;
        }

        Animation$1.elements[animationID] = {
            element: el,
            id: null,
            stop: 0,
            pause: 0,
            loop: 0
        };

        const play = () => {
            if (typeof draw === "object") {
                map = createAnimationMap(el, draw, direction);
            }
            start = performance.now();
            Animation$1.elements[animationID].loop += 1;
            Animation$1.elements[animationID].id = requestAnimationFrame(animate);
        };

        const done = () => {
            cancelAnimationFrame(Animation$1.elements[animationID].id);
            delete Animation$1.elements[id];
            exec(onDone, null, el);
            exec(resolve, [this], el);
        };

        const animate = (time) => {
            let p, t;
            const stop = Animation$1.elements[animationID].stop;

            if ( stop > 0) {
                if (stop === 2) {
                    if (typeof draw === "function") {
                        draw.bind(el)(1, 1);
                    } else {
                        applyProps(el, map, 1);
                    }
                }
                done();
                return
            }

            t = (time - start) / dur;

            if (t > 1) t = 1;
            if (t < 0) t = 0;

            p = easeFn.apply(null, easeArgs)(t);

            if (typeof draw === "function") {
                draw.bind(el)(t, p);
            } else {
                applyProps(el, map, p);
            }

            exec(onFrame, [t, p], el);

            if (t < 1) {
                Animation$1.elements[animationID].id = requestAnimationFrame(animate);
            }

            if (parseInt(t) === 1) {
                if (loop) {
                    if (dir === "alternate") {
                        direction = direction === "normal" ? "reverse" : "normal";
                    }

                    if (typeof loop === "boolean") {
                        setTimeout(function () {
                            play();
                        }, pause);
                    } else {
                        if (loop > Animation$1.elements[animationID].loop) {
                            setTimeout(function () {
                                play();
                            }, pause);
                        } else {
                            done();
                        }
                    }
                } else {
                    if (dir === "alternate" && !replay) {
                        direction = direction === "normal" ? "reverse" : "normal";
                        replay = true;
                        play();
                    } else {
                        done();
                    }
                }
            }
        };
        if (defer > 0) {
            setTimeout(()=>{
                play();
            }, defer);
        } else {
            play();
        }
    })
};

const stop = function(id, done = true){
    Animation$1.elements[id].stop = done === true ? 2 : 1;
};

async function chain(arr, loop) {
    for(let i = 0; i < arr.length; i ++) {
        const a = arr[i];
        a.loop = false;
        await animate(a);
    }
    if (typeof loop === "boolean" && loop) {
        await chain(arr, loop);
    } else if (typeof loop === "number") {
        loop--;
        if (loop > 0) {
            await chain(arr, loop);
        }
    }
}

const version$1 = "0.3.0";
const build_time$1 = "08.05.2024, 13:35:42";

const info$1 = () => {
    console.info(`%c Animation %c v${version$1} %c ${build_time$1} `, "color: #ffffff; font-weight: bold; background: #468284", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

Animation$1.animate = animate;
Animation$1.stop = stop;
Animation$1.chain = chain;
Animation$1.easing = Easing;
Animation$1.info = info$1;

globalThis.Animation = Animation$1;

/*!
 * Guardian v0.5.0
 * Data guard and validation library
 * Copyright 2024 Serhii Pimenov
 * Licensed under MIT
 *
 * Build time: 22.07.2024 10:27:11
 */

class GuardianError extends Error {
    constructor(message = "", guard = null, value) {
        super(message);

        this.message = message;
        this.name = guard;
        this.value = value;
    }
}

/*
* Parse data by scheme
* Function return parsed data.
* if the data does not match the scheme, the parser throws an error with the GuardianParseError object
* @param {object}: schema - schema object
* @param {any}: data - user input
* @return {any} Parsed data
* */

const parse = (schema, data) => {
    let result;

    if (!schema) {
        throw new Error(`Schema object required for parse data!`)
    }

    if (typeof schema === "function") {
        result = schema.apply(null, [data]);
        if (result instanceof GuardianError) {
            throw result
        }
    } else {
        for(let key in schema){
            const value = data[key];
            const guard = schema[key];

            if (!guard) throw new GuardianError(`Guard not defined for field ${key} in input data!`, "general", data)
            if (!data.hasOwnProperty(key)) throw new GuardianError(`Field ${key} doesn't exists in input data!`, "general", data)

            if (typeof guard === "function") {
                console.log(guard.name);
                result = guard.apply(null, [value]);

                if (result instanceof GuardianError) {
                    throw result
                }
            } else {
                parse(guard, value);
            }
        }
    }

    return data
};

const safeParse = (schema, data) => {
    let result;

    if (!schema) {
        throw new Error(`Schema object required for parse data!`)
    }

    if (typeof schema === "function") {
        result = schema.apply(null, [data]);
        if (result instanceof GuardianError) {
            return {
                ok: false,
                error: result
            }
        }
    } else {
        for(let key in schema){
            const value = data[key];
            const guard = schema[key];

            if (!guard) {continue}

            if (typeof guard === "function") {
                result = guard.apply(null, [data]);
                if (result instanceof GuardianError) {
                    return {
                        ok: false,
                        error: result
                    }
                }
            } else {
                parse(guard, value);
            }
        }
    }

    return {
        ok: true,
        output: data
    }
};

const pipe = (...functions) => {
    return (first) => functions.reduce((acc, fn) => fn(acc), first);
};

const compose = (...functions) => {
    return (first) => functions.reduceRight((acc, fn) => fn(acc), first);
};

const GUARD_STRING_MESSAGE = 'VAL must be a string';

var string = (errorMessage = GUARD_STRING_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string";
        if (!check) {
            return new GuardianError( msg,"string", input )
        }
        return input
    }
};

var isValue = (val) => typeof val !== 'undefined' && val !== null;

const GUARD_STARTS_WITH_MESSAGE = 'VAL must starts with START_VAL';

var startsWith = (startValue, errorMessage = GUARD_STARTS_WITH_MESSAGE) => {
    if (!isValue(startValue)) throw new Error(`START_VALUE not defined!`)

    return function(input){
        const msg = errorMessage.replace(/VAL/g, input).replace(/START_VAL/g, startValue);
        const check = typeof input === "string" && input.startsWith(startValue);
        if (!check) {
            return new GuardianError( msg, "startsWith", input )
        }
        return input
    }
};

const GUARD_ENDS_WITH_MESSAGE = 'VAL must end with END_VAL';

var endsWith = (endValue, errorMessage = GUARD_ENDS_WITH_MESSAGE) => {
    if (!isValue(endValue)) throw new Error(`END_VALUE not defined!`)

    return function(input){
        const msg = errorMessage.replace(/VAL/g, input).replace(/END_VAL/g, endValue);
        const check = typeof input === "string" && input.endsWith(endValue);
        if (!check) {
            return new GuardianError( msg, "endsWith", input )
        }
        return input
    }
};

var unknown = () => {
    return function(input){
        return input
    }
};

const GUARD_SYMBOL_MESSAGE = 'A symbol is required';

var symbol = (msg = GUARD_SYMBOL_MESSAGE) => {
    return function(input){
        const check = typeof input === "symbol";
        if (!check) {
            return new GuardianError( msg, "symbol", input )
        }
        return input
    }
};

const GUARD_BIGINT_MESSAGE = 'VAL must be a bigint';

var bigint = (errorMessage = GUARD_BIGINT_MESSAGE) => {
    return function(input){
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "bigint";
        if (!check) {
            return new GuardianError( msg,"bigint", input )
        }
        return input
    }
};

const GUARD_DATE_MESSAGE = 'VAL must be valid date object or date string';

var date = (errorMessage = GUARD_DATE_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = input instanceof Date;
        if (!check) {
            return new GuardianError( msg,"date", input )
        }
        return input
    }
};

const GUARD_FUNCTION_MESSAGE = 'The value must be a function';

var _function = (errorMessage = GUARD_FUNCTION_MESSAGE) => {
    return function (input) {
        const check = typeof input === "function";
        if (!check) {
            return new GuardianError( errorMessage,"function", input )
        }
        return input
    }
};

const GUARD_INTEGER_MESSAGE = 'VAL must be an integer';

var integer = (errorMessage = GUARD_INTEGER_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = Number.isInteger(input);
        if (!check) {
            return new GuardianError( msg,"integer", input )
        }
        return input
    }
};

const GUARD_SAFE_INTEGER_MESSAGE = 'VAL must be an safe integer';

var safeInteger = (errorMessage = GUARD_SAFE_INTEGER_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = Number.isSafeInteger(input);
        if (!check) {
            return new GuardianError( msg,"safeInteger", input )
        }
        return input
    }
};

const GUARD_MIN_VALUE_MESSAGE = 'VAL must be a great then MIN_VALUE';

var minValue = (minValue, errorMessage = GUARD_MIN_VALUE_MESSAGE) => {
    if (!isValue(minValue)) throw new Error(`MIN_VALUE not defined!`)

    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input).replace(/MIN_VALUE/g, minValue);
        const given = +input;
        const check = !isNaN(given) && given >= +minValue;
        if (!check) {
            return new GuardianError( msg,"minValue", input )
        }
        return input
    }
};

const GUARD_MAX_VALUE_MESSAGE = 'VAL must be a less then MAX_VALUE';

var maxValue = (maxValue, errorMessage = GUARD_MAX_VALUE_MESSAGE) => {
    if (!isValue(maxValue)) throw new Error(`MAX_VALUE not defined!`)

    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input).replace(/MAX_VALUE/g, maxValue);
        const given = +input;
        const check = !isNaN(given) && given <= +maxValue;
        if (!check) {
            return new GuardianError( msg,"maxValue", input )
        }
        return input
    }
};

const GUARD_EMAIL_MESSAGE = 'VAL must be a string in valid email format';

var email = (errorMessage = GUARD_EMAIL_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const check = typeof input === "string" && emailRegex.test(input);
        if (!check) {
            return new GuardianError( msg,"email", input )
        }
        return input
    }
};

const GUARD_REQUIRED_MESSAGE = 'Any value required';

var required = (errorMessage = GUARD_REQUIRED_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input !== "undefined" && input !== null && input;
        if (!check) {
            return new GuardianError( msg,"required", input )
        }
        return input
    }
};

const GUARD_NUMBER_MESSAGE = 'VAL must be a number';

var number = (errorMessage = GUARD_NUMBER_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "number"; //!isNaN(input)
        if (!check) {
            return new GuardianError( msg,"number", input )
        }
        return input
    }
};

const GUARD_OBJECT_MESSAGE = 'VAL must be an object';

var object = (input) => {
    const check = typeof input === "object";
    if (!check) {
        throw new GuardianError( GUARD_OBJECT_MESSAGE.replace(/VAL/g, input),"object", input )
    }
    return {
        ...input
    }
};

const GUARD_BETWEEN_MESSAGE = 'VAL must be between MIN_VAL and MAX_VAL';

var between = (minValue, maxValue, errorMessage = GUARD_BETWEEN_MESSAGE) => {
    if (!isValue(minValue)) throw new Error(`MIN_VALUE not defined!`)
    if (!isValue(maxValue)) throw new Error(`MAX_VALUE not defined!`)

    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input).replace(/MIN_VAL/g, minValue).replace(/MAX_VAL/g, maxValue);
        const given = +input;
        const check = !isNaN(given) && (input >= +minValue && input <= +maxValue);
        if (!check) {
            return new GuardianError( msg,"between", input )
        }
        return input
    }
};

const GUARD_FINITE_MESSAGE = 'VAL must be a finite number';

var finite = (errorMessage = GUARD_FINITE_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = Number.isFinite(input);
        if (!check) {
            return new GuardianError( msg,"finite", input )
        }
        return input
    }
};

const GUARD_BASE64_MESSAGE = 'VAL must be a string in valid base 64 format';

var base64 = (errorMessage = GUARD_BASE64_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        const check = typeof input === "string" && base64Regex.test(input);
        if (!check) {
            return new GuardianError( msg,"base64", input )
        }
        return input
    }
};

const GUARD_NOT_NUMBER_MESSAGE = 'VAL can`t be a number';

var notNumber = (errorMessage = GUARD_NOT_NUMBER_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = isNaN(input);
        if (!check) {
            return new GuardianError( msg,"notNumber", input )
        }
        return input
    }
};

const GUARD_BOOLEAN_MESSAGE = 'VAL must be a boolean';

var boolean = (errorMessage = GUARD_BOOLEAN_MESSAGE) => {
    return function(input){
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "boolean";
        if (!check) {
            return new GuardianError( msg, "boolean", input )
        }
        return input
    }
};

const GUARD_ARRAY_MESSAGE = 'VAL must be an array of TYPE';

var array = (guard, errorMessage = GUARD_ARRAY_MESSAGE) => {
    if (!guard && !errorMessage) {
        guard = string();
        errorMessage = GUARD_ARRAY_MESSAGE;
    }

    if (typeof guard === "string") {
        errorMessage = guard;
        guard = string();
    }

    return function(input){
        const msg = errorMessage.replace(/VAL/g, input).replace(/TYPE/g, guard.name);

        if (!Array.isArray(input)) {
            return new GuardianError( msg, "array", input )
        }

        for (let v of input) {
            const result = guard(v);
            if (result instanceof GuardianError) {
                return new GuardianError( msg, "array", input )
            }
        }

        return input
    }
};

const GUARD_EMEI_MESSAGE = 'VAL must be a valid EMEI';

const isValidIMEI = (n) => {
    const sumDig = (n) => {
        let a = 0;
        while (n > 0)
        {
            a = a + n % 10;
            n = parseInt(""+n / 10, 10);
        }
        return a;
    };

    let len = (""+n).length;
    if (len !== 15) return false;

    let sum = 0;
    for(let i = len; i >= 1; i--) {
        let d = (n % 10);
        if (i % 2 === 0) d = 2 * d;
        sum += sumDig(d);
        n = parseInt(""+n / 10, 10);
    }

    return (sum % 10 === 0);
};

var imei = (errorMessage = GUARD_EMEI_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = isValidIMEI(input);
        if (!check) {
            return new GuardianError( msg,"emei", input )
        }
        return input
    }
};

const GUARD_LENGTH_MESSAGE = 'VAL must be a string or array with length N';

const length =  (length, errorMessage = GUARD_LENGTH_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input).replace(/N/g, length);
        const check = (typeof input === "string" || Array.isArray(input)) && input.length === length;
        if (!check) {
            return new GuardianError( msg,"length", input )
        }
        return input
    }
};

const minLength =  (length, errorMessage = GUARD_LENGTH_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input).replace(/N/g, length);
        const check = (typeof input === "string" || Array.isArray(input)) && input.length >= length;
        if (!check) {
            return new GuardianError( msg,"minLength", input )
        }
        return input
    }
};

const maxLength =  (length, errorMessage = GUARD_LENGTH_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input).replace(/N/g, length);
        const check = (typeof input === "string" || Array.isArray(input)) && input.length <= length;
        if (!check) {
            return new GuardianError( msg,"maxLength", input )
        }
        return input
    }
};

const GUARD_IP_MESSAGE = 'VAL must be a valid ip address ipv4 or ipv6';
const GUARD_IPv4_MESSAGE = 'VAL must be a valid ipv4 address';
const GUARD_IPv6_MESSAGE = 'VAL must be a valid ipv6 address';

const regexpIpv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const regexpIpv6 = /^[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}:[a-fA-F0-9]{1, 4}$/;

const ip = (errorMessage = GUARD_IP_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && (regexpIpv4.test(input) || regexpIpv6.test(input));
        if (!check) {
            return new GuardianError( msg,"ip", input )
        }
        return input
    }
};

const ipv4 = (errorMessage = GUARD_IPv4_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && regexpIpv4.test(input);
        if (!check) {
            return new GuardianError( msg,"ipv4", input )
        }
        return input
    }
};

const ipv6 = (errorMessage = GUARD_IPv6_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && regexpIpv6.test(input);
        if (!check) {
            return new GuardianError( msg,"ipv6", input )
        }
        return input
    }
};

const GUARD_DOMAIN_MESSAGE = 'VAL must be a valid domain name, xn--* for internationalized names';

const regexpDomain = /^((xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

var domain = (errorMessage = GUARD_DOMAIN_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && regexpDomain.test(input);
        if (!check) {
            return new GuardianError( msg,"domain", input )
        }
        return input
    }
};

const GUARD_URL_MESSAGE = 'VAL must be a valid url';

const regexpUrl = /^(?:(?:(?:https?|ftp|wss?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

var url = (errorMessage = GUARD_URL_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && regexpUrl.test(input);
        if (!check) {
            return new GuardianError( msg,"url", input )
        }
        return input
    }
};

const GUARD_HEX_COLOR_MESSAGE = 'VAL must be a valid hex color';

const regexp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

var hexColor = (errorMessage = GUARD_HEX_COLOR_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && regexp.test(input);
        if (!check) {
            return new GuardianError( msg,"hexColor", input )
        }
        return input
    }
};

const visaRegEx = /^4\d{12}(?:\d{3,6})?$/u;
const mastercardRegEx = /^5[1-5]\d{2}|(?:222\d|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/u;
const amexpRegEx = /^3[47]\d{13}$/u;
const discovRegEx = /^6(?:011|5\d{2})\d{12,15}$/u;
const dinersRegEx = /^3(?:0[0-5]|[68]\d)\d{11,13}$/u;
const jcbRegExp = /^(?:2131|1800|35\d{3})\d{11}$/u;
const unionRegExp = /^(?:6[27]\d{14,17}|81\d{14,17})$/u;


const GUARD_CREDIT_CARD_MESSAGE = 'VAL must be a valid CC number (visa, mastercard, american express, discover, diners club, jcb, or union pay)';
const GUARD_CREDIT_CARD_VISA_MESSAGE = 'VAL must be a valid Visa card number';
const GUARD_CREDIT_CARD_MASTER_MESSAGE = 'VAL must be a valid Mastercard card number';
const GUARD_CREDIT_CARD_AMEX_MESSAGE = 'VAL must be a valid American Express card number';
const GUARD_CREDIT_CARD_DISC_MESSAGE = 'VAL must be a valid DISCOVER card number';
const GUARD_CREDIT_CARD_DINER_MESSAGE = 'VAL must be a valid DINERS CLUB card number';
const GUARD_CREDIT_CARD_JCB_MESSAGE = 'VAL must be a valid JCB card number';
const GUARD_CREDIT_CARD_UNION_MESSAGE = 'VAL must be a valid Union Pay card number';

const creditCard = (errorMessage = GUARD_CREDIT_CARD_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && (
            visaRegEx.test(input)
            || mastercardRegEx.test(input)
            || amexpRegEx.test(input)
            || discovRegEx.test(input)
            || dinersRegEx.test(input)
            || jcbRegExp.test(input)
            || unionRegExp.test(input)
        );
        if (!check) {
            return new GuardianError( msg,"creditCard", input )
        }
        return input
    }
};



const card = (name, pattern, errorMessage = GUARD_CREDIT_CARD_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && (
            pattern.test(input)
        );
        if (!check) {
            return new GuardianError( msg,name, input )
        }
        return input
    }
};


const visa = (errorMessage = GUARD_CREDIT_CARD_VISA_MESSAGE) => {
    return card("visa", visaRegEx, errorMessage)
};

const mastercard = (errorMessage = GUARD_CREDIT_CARD_MASTER_MESSAGE) => {
    return card("mastercard", mastercardRegEx, errorMessage)
};

const americanExpress = (errorMessage = GUARD_CREDIT_CARD_AMEX_MESSAGE) => {
    return card("american express", amexpRegEx, errorMessage)
};

const discover = (errorMessage = GUARD_CREDIT_CARD_DISC_MESSAGE) => {
    return card("discover", discovRegEx, errorMessage)
};

const diners = (errorMessage = GUARD_CREDIT_CARD_DINER_MESSAGE) => {
    return card("diners club", dinersRegEx, errorMessage)
};

const jcb = (errorMessage = GUARD_CREDIT_CARD_JCB_MESSAGE) => {
    return card("jcb card", jcbRegExp, errorMessage)
};

const unionPay = (errorMessage = GUARD_CREDIT_CARD_UNION_MESSAGE) => {
    return card("union pay", unionRegExp, errorMessage)
};

const GUARD_BYTES_MESSAGE = 'The length of string must be VAL bytes';

var bytes = (length, errorMessage = GUARD_BYTES_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = typeof input === "string" && new TextEncoder().encode(input).length === length;
        if (!check) {
            return new GuardianError( msg,"bytes", input )
        }
        return input
    }
};

const GUARD_NOT_NULL_MESSAGE = 'VAL can`t be null or undefined.';

var notNull = (errorMessage = GUARD_NOT_NULL_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = isValue(input);
        if (!check) {
            return new GuardianError( msg,"notNull", input )
        }
        return input
    }
};

const GUARD_PATTERN_MESSAGE = 'The value must match the pattern';

var pattern = (pattern, errorMessage = GUARD_PATTERN_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const regexp = typeof pattern === "string" ? new RegExp(pattern, 'g') : pattern;
        const check = regexp.test(""+input);
        if (!check) {
            return new GuardianError( msg,"pattern", input )
        }
        return input
    }
};

const GUARD_DIGITS_MESSAGE = 'VAL must contains only digits';

var digits = (errorMessage = GUARD_DIGITS_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = /^\d+$/g.test(""+input);
        if (!check) {
            return new GuardianError( msg,"digits", input )
        }
        return input
    }
};

const GUARD_FLOAT_MESSAGE = 'VAL must be a float';

var float = (errorMessage = GUARD_FLOAT_MESSAGE) => {
    return function (input) {
        const msg = errorMessage.replace(/VAL/g, input);
        const check = (!isNaN(input) && +n % 1 !== 0) || /^\d*\.\d+$/.test(input);
        if (!check) {
            return new GuardianError( msg,"float", input )
        }
        return input
    }
};

const version = "0.5.0";
const build_time = "22.07.2024, 10:27:11";

var info = () => {
    console.info(`%c GUARDIAN %c v${version} %c ${build_time} `, "color: pink; font-weight: bold; background: #2b1700", "color: white; background: darkgreen", "color: white; background: #0080fe;");
};

var G$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    americanExpress: americanExpress,
    array: array,
    base64: base64,
    between: between,
    bigint: bigint,
    boolean: boolean,
    bytes: bytes,
    compose: compose,
    creditCard: creditCard,
    date: date,
    digits: digits,
    diners: diners,
    discover: discover,
    domain: domain,
    email: email,
    endsWith: endsWith,
    finite: finite,
    float: float,
    func: _function,
    hexColor: hexColor,
    imei: imei,
    info: info,
    integer: integer,
    ip: ip,
    ipv4: ipv4,
    ipv6: ipv6,
    jcb: jcb,
    length: length,
    mastercard: mastercard,
    maxLength: maxLength,
    maxValue: maxValue,
    minLength: minLength,
    minValue: minValue,
    notNull: notNull,
    notNumber: notNumber,
    number: number,
    object: object,
    parse: parse,
    pattern: pattern,
    pipe: pipe,
    required: required,
    safeInteger: safeInteger,
    safeParse: safeParse,
    startsWith: startsWith,
    string: string,
    symbol: symbol,
    unionPay: unionPay,
    unknown: unknown,
    url: url,
    visa: visa
});

globalThis.G = G$1;

(function($) {

    var meta_init = $.meta('metro4:init').attr("content");
    var meta_locale = $.meta('metro4:locale').attr("content");
    var meta_week_start = $.meta('metro4:week_start').attr("content");
    var meta_date_format = $.meta('metro4:date_format').attr("content");
    var meta_date_format_input = $.meta('metro4:date_format_input').attr("content");
    var meta_animation_duration = $.meta('metro4:animation_duration').attr("content");
    var meta_callback_timeout = $.meta('metro4:callback_timeout').attr("content");
    var meta_timeout = $.meta('metro4:timeout').attr("content");
    var meta_scroll_multiple = $.meta('metro4:scroll_multiple').attr("content");
    var meta_cloak = $.meta('metro4:cloak').attr("content");
    var meta_cloak_duration = $.meta('metro4:cloak_duration').attr("content");
    var meta_global_common = $.meta('metro4:global_common').attr("content");
    var meta_blur_image = $.meta('metro4:blur_image').attr("content");

    if (window.METRO_BLUR_IMAGE === undefined) {
        window.METRO_BLUR_IMAGE = meta_blur_image !== undefined ? JSON.parse(meta_global_common) : false;
    }

    if (window.METRO_GLOBAL_COMMON === undefined) {
        window.METRO_GLOBAL_COMMON = meta_global_common !== undefined ? JSON.parse(meta_global_common) : false;
    }

    var meta_jquery = $.meta('metro4:jquery').attr("content"); //undefined
    window.jquery_present = typeof jQuery !== "undefined";
    if (window.METRO_JQUERY === undefined) {
        window.METRO_JQUERY = meta_jquery !== undefined ? JSON.parse(meta_jquery) : true;
    }
    window.useJQuery = window.jquery_present && window.METRO_JQUERY;


    /* Added by Ken Kitay https://github.com/kens-code*/
    var meta_info = $.meta('metro4:info').attr("content");
    if (window.METRO_SHOW_INFO === undefined) {
        window.METRO_SHOW_INFO = meta_info !== undefined ? JSON.parse(meta_info) : true;
    }
    /* --- end ---*/

    var meta_compile = $.meta('metro4:compile').attr("content");
    if (window.METRO_SHOW_COMPILE_TIME === undefined) {
        window.METRO_SHOW_COMPILE_TIME = meta_compile !== undefined ? JSON.parse(meta_compile) : true;
    }

    if (window.METRO_INIT === undefined) {
        window.METRO_INIT = meta_init !== undefined ? JSON.parse(meta_init) : true;
    }

    if (window.METRO_DEBUG === undefined) {window.METRO_DEBUG = true;}

    if (window.METRO_WEEK_START === undefined) {
        window.METRO_WEEK_START = meta_week_start !== undefined ? parseInt(meta_week_start) : 0;
    }
    if (window.METRO_DATE_FORMAT === undefined) {
        window.METRO_DATE_FORMAT = meta_date_format !== undefined ? meta_date_format : "YYYY-MM-DD";
    }
    if (window.METRO_DATE_FORMAT_INPUT === undefined) {
        window.METRO_DATE_FORMAT_INPUT = meta_date_format_input !== undefined ? meta_date_format_input : "YYYY-MM-DD";
    }
    if (window.METRO_LOCALE === undefined) {
        window.METRO_LOCALE = meta_locale !== undefined ? meta_locale : 'en-US';
    }
    if (window.METRO_ANIMATION_DURATION === undefined) {
        window.METRO_ANIMATION_DURATION = meta_animation_duration !== undefined ? parseInt(meta_animation_duration) : 100;
    }
    if (window.METRO_CALLBACK_TIMEOUT === undefined) {
        window.METRO_CALLBACK_TIMEOUT = meta_callback_timeout !== undefined ? parseInt(meta_callback_timeout) : 500;
    }
    if (window.METRO_TIMEOUT === undefined) {
        window.METRO_TIMEOUT = meta_timeout !== undefined ? parseInt(meta_timeout) : 2000;
    }
    if (window.METRO_SCROLL_MULTIPLE === undefined) {
        window.METRO_SCROLL_MULTIPLE = meta_scroll_multiple !== undefined ? parseInt(meta_scroll_multiple) : 20;
    }
    if (window.METRO_CLOAK_REMOVE === undefined) {
        window.METRO_CLOAK_REMOVE = meta_cloak !== undefined ? (""+meta_cloak).toLowerCase() : "fade";
    }
    if (window.METRO_CLOAK_DURATION === undefined) {
        window.METRO_CLOAK_DURATION = meta_cloak_duration !== undefined ? parseInt(meta_cloak_duration) : 300;
    }

    if (window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE === undefined) {window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE = true;}
    if (window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS === undefined) {window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS = true;}
    if (window.METRO_HOTKEYS_FILTER_TEXT_INPUTS === undefined) {window.METRO_HOTKEYS_FILTER_TEXT_INPUTS = true;}
    if (window.METRO_HOTKEYS_BUBBLE_UP === undefined) {window.METRO_HOTKEYS_BUBBLE_UP = false;}
    if (window.METRO_THROWS === undefined) {window.METRO_THROWS = true;}

    window.METRO_MEDIA = [];

}(m4q));

(function() {

    var $ = m4q;

    if (typeof m4q === 'undefined') {
        throw new Error('Metro UI requires m4q helper!');
    }

    if (!('MutationObserver' in window)) {
        throw new Error('Metro UI requires MutationObserver!');
    }

    var isTouch = (('ontouchstart' in window) || (navigator["MaxTouchPoints"] > 0) || (navigator["msMaxTouchPoints"] > 0));

    var normalizeComponentName = function(name){
        return typeof name !== "string" ? undefined : name.replace(/-/g, "").toLowerCase();
    };

    var Metro = {

        version: "5.0.9",
        build_time: "23.07.2024, 19:35:45",
        buildNumber: 0,
        isTouchable: isTouch,
        fullScreenEnabled: document.fullscreenEnabled,
        sheet: null,


        controlsPosition: {
            INSIDE: "inside",
            OUTSIDE: "outside"
        },

        groupMode: {
            ONE: "one",
            MULTI: "multi"
        },

        aspectRatio: {
            HD: "hd",
            SD: "sd",
            CINEMA: "cinema"
        },

        fullScreenMode: {
            WINDOW: "window",
            DESKTOP: "desktop"
        },

        position: {
            TOP: "top",
            BOTTOM: "bottom",
            LEFT: "left",
            RIGHT: "right",
            TOP_RIGHT: "top-right",
            TOP_LEFT: "top-left",
            BOTTOM_LEFT: "bottom-left",
            BOTTOM_RIGHT: "bottom-right",
            LEFT_BOTTOM: "left-bottom",
            LEFT_TOP: "left-top",
            RIGHT_TOP: "right-top",
            RIGHT_BOTTOM: "right-bottom"
        },

        popoverEvents: {
            CLICK: "click",
            HOVER: "hover",
            FOCUS: "focus"
        },

        stepperView: {
            SQUARE: "square",
            CYCLE: "cycle",
            DIAMOND: "diamond"
        },

        listView: {
            LIST: "list",
            CONTENT: "content",
            ICONS: "icons",
            ICONS_MEDIUM: "icons-medium",
            ICONS_LARGE: "icons-large",
            TILES: "tiles",
            TABLE: "table"
        },

        events: {
            click: 'click',
            start: isTouch ? 'touchstart' : 'mousedown',
            stop: isTouch ? 'touchend' : 'mouseup',
            move: isTouch ? 'touchmove' : 'mousemove',
            enter: isTouch ? 'touchstart' : 'mouseenter',

            startAll: 'mousedown touchstart',
            stopAll: 'mouseup touchend',
            moveAll: 'mousemove touchmove',

            leave: 'mouseleave',
            focus: 'focus',
            blur: 'blur',
            resize: 'resize',
            keyup: 'keyup',
            keydown: 'keydown',
            keypress: 'keypress',
            dblclick: 'dblclick',
            input: 'input',
            change: 'change',
            cut: 'cut',
            paste: 'paste',
            scroll: 'scroll',
            mousewheel: 'mousewheel',
            inputchange: "change input propertychange cut paste copy drop",
            dragstart: "dragstart",
            dragend: "dragend",
            dragenter: "dragenter",
            dragover: "dragover",
            dragleave: "dragleave",
            drop: 'drop',
            drag: 'drag'
        },

        keyCode: {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            BREAK: 19,
            CAPS: 20,
            ESCAPE: 27,
            SPACE: 32,
            PAGEUP: 33,
            PAGEDOWN: 34,
            END: 35,
            HOME: 36,
            LEFT_ARROW: 37,
            UP_ARROW: 38,
            RIGHT_ARROW: 39,
            DOWN_ARROW: 40,
            COMMA: 188
        },

        media_queries: {
            FS: "(min-width: 0px)",
            XS: "(min-width: 360px)",
            SM: "(min-width: 576px)",
            LD: "(min-width: 640px)",
            MD: "(min-width: 768px)",
            LG: "(min-width: 992px)",
            XL: "(min-width: 1200px)",
            XXL: "(min-width: 1452px)",
            XXXL: "(min-width: 2000px)"
        },

        media_sizes: {
            FS: 0,
            XS: 360,
            SM: 576,
            LD: 640,
            MD: 768,
            LG: 992,
            XL: 1200,
            XXL: 1452,
            XXXL: 2000
        },

        media_mode: {
            FS: "fs",
            XS: "xs",
            SM: "sm",
            LD: "ld",
            MD: "md",
            LG: "lg",
            XL: "xl",
            XXL: "xxl",
            XXXL: "xxxl"
        },

        media_modes: ["fs","xs","sm","ld","md","lg","xl","xxl","xxxl"],

        actions: {
            REMOVE: 1,
            HIDE: 2
        },

        hotkeys: {},
        locales: {},
        utils: {},
        colors: {},
        dialog: null,
        pagination: null,
        md5: null,
        storage: null,
        export: null,
        animations: null,
        cookie: null,
        template: null,
        defaults: {},

        info: function(){
            if (typeof globalThis["METRO_DISABLE_LIB_INFO"] === 'undefined') {
                console.info(`%c METRO UI %c v${Metro.version} %c ${Metro.build_time} `, "color: pink; font-weight: bold; background: #800000", "color: white; background: darkgreen", "color: white; background: #0080fe;");

                if (globalThis.$ && $.info) $.info();
                if (globalThis.Hooks && Hooks.info) Hooks.info();
                if (globalThis.html && html.info) html.info();
                if (globalThis.Animation && Animation.info) Animation.info();
                if (globalThis.Farbe && Farbe.info) Farbe.info();
                if (globalThis.Datetime && Datetime.info) Datetime.info();
                if (globalThis.Str && Str.info) Str.info();
                if (globalThis.G && G.info) G.info();
            }
        },

        aboutDlg: function(){
            alert("Metro UI - v" + Metro.version);
        },

        observe: function(){
            var observer, observerCallback;
            var observerConfig = {
                childList: true,
                attributes: true,
                subtree: true
            };
            observerCallback = function(mutations){
                mutations.map(function(mutation){
                    if (mutation.type === 'attributes' && mutation.attributeName !== "data-role") {
                        if (mutation.attributeName === 'data-hotkey') {
                            Metro.initHotkeys([mutation.target], true);
                        } else {
                            var element = $(mutation.target);
                            var mc = element.data('metroComponent');
                            var attr = mutation.attributeName, newValue = element.attr(attr), oldValue = mutation.oldValue;

                            if (mc !== undefined) {
                                element.fire("attr-change", {
                                    attr: attr,
                                    newValue: newValue,
                                    oldValue: oldValue,
                                    __this: element[0]
                                });

                                $.each(mc, function(){
                                    var plug = Metro.getPlugin(element, this);
                                    if (plug && typeof plug.changeAttribute === "function") {
                                        plug.changeAttribute(attr, newValue, oldValue);
                                    }
                                });
                            }
                        }
                    } else

                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        var i, widgets = [];
                        var $node, node, nodes = mutation.addedNodes;

                        if (nodes.length) {
                            for(i = 0; i < nodes.length; i++) {
                                node = nodes[i];
                                $node = $(node);

                                if ($node.attr("data-role") !== undefined) {
                                    widgets.push(node);
                                }

                                $.each($node.find("[data-role]"), function(){
                                    var o = this;
                                    if (widgets.indexOf(o) !== -1) {
                                        return;
                                    }
                                    widgets.push(o);
                                });
                            }

                            if (widgets.length) Metro.initWidgets(widgets, "observe");
                        }

                    } else  ;
                });
            };
            observer = new MutationObserver(observerCallback);
            observer.observe($("html")[0], observerConfig);
        },

        init: function(){
            var widgets = $("[data-role]");
            var hotkeys = $("[data-hotkey]");
            var html = $("html");

            if (window.METRO_BLUR_IMAGE) {
                html.addClass("use-blur-image");
            }

            if (window.METRO_SHOW_INFO) {
                Metro.info(true);
            }

            if (isTouch === true) {
                html.addClass("metro-touch-device");
            } else {
                html.addClass("metro-no-touch-device");
            }

            Metro.sheet = Metro.utils.newCssSheet();

            Metro.utils.addCssRule(Metro.sheet, "*, *::before, *::after", "box-sizing: border-box;");

            window.METRO_MEDIA = [];
            $.each(Metro.media_queries, function(key, query){
                if (Metro.utils.media(query)) {
                    window.METRO_MEDIA.push(Metro.media_mode[key]);
                }
            });

            Metro.observe();

            Metro.initHotkeys(hotkeys);
            Metro.initWidgets(widgets, "init");

            if (window.METRO_CLOAK_REMOVE !== "fade") {
                $(".m4-cloak").removeClass("m4-cloak");
                $(".cloak").removeClass("cloak");
                $(window).fire("metro-initiated");
            } else {
                $(".m4-cloak, .cloak").animate({
                    draw: {
                        opacity: [0, 1]
                    },
                    dur: 300,
                    onDone: function(){
                        $(".m4-cloak").removeClass("m4-cloak");
                        $(".cloak").removeClass("cloak");
                        $(window).fire("metro-initiated");
                    }
                });
            }

            $(document).on("click", "[data-copy-to-clipboard]", function(e) {
                const val = $(this).attr("data-copy-to-clipboard");
                Metro.utils.copy2clipboard(val);
                if (Metro.toast) {
                    Metro.toast.create(`Data copied to clipboard!`);
                }
            });
        },

        initHotkeys: function(hotkeys, redefine){
            $.each(hotkeys, function(){
                var element = $(this);
                var hotkey = element.attr('data-hotkey') ? element.attr('data-hotkey').toLowerCase() : false;
                var fn = element.attr('data-hotkey-func') ? element.attr('data-hotkey-func') : false;

                if (hotkey === false) {
                    return;
                }

                if (element.data('hotKeyBonded') === true && redefine !== true) {
                    return;
                }

                Metro.hotkeys[hotkey] = [this, fn];
                element.data('hotKeyBonded', true);
                element.fire("hot-key-bonded", {
                    __this: element[0],
                    hotkey: hotkey,
                    fn: fn
                });
            });
        },

        initWidgets: function(widgets) {

            $.each(widgets, function () {
                var $this = $(this), roles;

                if (!this.hasAttribute("data-role")) {
                    return ;
                }

                roles = $this.attr('data-role').split(/\s*,\s*/);

                roles.map(function (func) {

                    var $$ = Metro.utils.$();
                    var _func = normalizeComponentName(func);

                    if ($$.fn[_func] !== undefined && $this.attr("data-role-"+_func) === undefined) {
                        try {
                            $$.fn[_func].call($this);
                            $this.attr("data-role-"+_func, true);

                            var mc = $this.data('metroComponent');

                            if (mc === undefined) {
                                mc = [_func];
                            } else {
                                mc.push(_func);
                            }
                            $this.data('metroComponent', mc);

                            $this.fire("create", {
                                __this: $this[0],
                                name: _func
                            });
                            $(document).fire("component-create", {
                                element: $this[0],
                                name: _func
                            });
                        } catch (e) {
                            console.error("Error creating component " + func + " for ", $this[0]);
                            throw e;
                        }
                    }
                });
            });
        },

        plugin: function(name, object){
            var _name = normalizeComponentName(name);

            var register = function($){
                $.fn[_name] = function( options ) {
                    return this.each(function() {
                        $.data( this, _name, Object.create(object).init(options, this ));
                    });
                };
            };

            register(m4q);

            if (window.useJQuery) {
                register(jQuery);
            }
        },

        pluginExists: function(name){
            var $ = window.useJQuery ? jQuery : m4q;
            return typeof $.fn[normalizeComponentName(name)] === "function";
        },

        destroyPlugin: function(element, name){
            var p, mc;
            var el = $(element);
            var _name = normalizeComponentName(name);

            p = Metro.getPlugin(el, _name);

            if (typeof p === 'undefined') {
                console.warn("Component "+name+" can not be destroyed: the element is not a Metro UI component.");
                return ;
            }

            if (typeof p['destroy'] !== 'function') {
                console.warn("Component "+name+" can not be destroyed: method destroy not found.");
                return ;
            }

            p['destroy']();
            mc = el.data("metroComponent");
            Metro.utils.arrayDelete(mc, _name);
            el.data("metroComponent", mc);
            $.removeData(el[0], _name);
            el.removeAttr("data-role-"+_name);
        },

        destroyPluginAll: function(element){
            var el = $(element);
            var mc = el.data("metroComponent");

            if (mc !== undefined && mc.length > 0) $.each(mc, function(){
                Metro.destroyPlugin(el[0], this);
            });
        },

        noop: function(){},
        noop_true: function(){return true;},
        noop_false: function(){return false;},
        noop_arg: function(a){return a;},

        requestFullScreen: function(element){
            if (element["mozRequestFullScreen"]) {
                element["mozRequestFullScreen"]();
            } else if (element["webkitRequestFullScreen"]) {
                element["webkitRequestFullScreen"]();
            } else if (element["msRequestFullscreen"]) {
                element["msRequestFullscreen"]();
            } else {
                element.requestFullscreen().catch( function(err){
                    console.warn("Error attempting to enable full-screen mode: "+err.message+" "+err.name);
                });
            }
        },

        exitFullScreen: function(){
            if (document["mozCancelFullScreen"]) {
                document["mozCancelFullScreen"]();
            }
            else if (document["webkitCancelFullScreen"]) {
                document["webkitCancelFullScreen"]();
            }
            else if (document["msExitFullscreen"]) {
                document["msExitFullscreen"]();
            } else {
                document.exitFullscreen().catch( function(err){
                    console.warn("Error attempting to disable full-screen mode: "+err.message+" "+err.name);
                });
            }
        },

        inFullScreen: function(){
            var fsm = (document.fullscreenElement || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"]);
            return fsm !== undefined;
        },

        $: function(){
            return window.useJQuery ? jQuery : m4q;
        },

        get$el: function(el){
            return Metro.$()($(el)[0]);
        },

        get$elements: function(el){
            return Metro.$()($(el));
        },

        // TODO add if name is not defined, return one or array of plugins
        getPlugin: function(el, name){
            var _name = normalizeComponentName(name);
            var $el = Metro.get$el(el);
            return $el.length ? $el.data(_name) : undefined;
        },

        makePlugin: function(el, name, options){
            var _name = normalizeComponentName(name);
            var $el = Metro.get$elements(el);
            return $el.length && typeof $el[_name] === "function" ? $el[_name](options) : undefined;
        },

        Component: function(nameName, compObj){
            var name = normalizeComponentName(nameName);
            var Utils = Metro.utils;
            var component = $.extend({name: name}, {
                _super: function(el, options, defaults, setup){
                    var self = this;

                    this.elem = el;
                    this.element = $(el);
                    this.options = $.extend( {}, defaults, options );
                    this.component = this.elem;

                    this._setOptionsFromDOM();
                    this._runtime();

                    if (setup && typeof setup === 'object') {
                        $.each(setup, function(key, val){
                            self[key] = val;
                        });
                    }

                    this._createExec();
                },

                _setOptionsFromDOM: function(){
                    var element = this.element, o = this.options;

                    $.each(element.data(), function(key, value){
                        if (key in o) {
                            try {
                                o[key] = JSON.parse(value);
                            } catch (e) {
                                o[key] = value;
                            }
                        }
                    });
                },

                _runtime: function(){
                    var element = this.element, mc;
                    var roles = (element.attr("data-role") || "").toArray(",").map(function(v){
                        return normalizeComponentName(v);
                    }).filter(function(v){
                        return v.trim() !== "";
                    });

                    if (!element.attr('data-role-'+this.name)) {
                        element.attr("data-role-"+this.name, true);
                        if (roles.indexOf(this.name) === -1) {
                            roles.push(this.name);
                            element.attr("data-role", roles.join(","));
                        }

                        mc = element.data('metroComponent');
                        if (mc === undefined) {
                            mc = [this.name];
                        } else {
                            mc.push(this.name);
                        }
                        element.data('metroComponent', mc);
                    }
                },

                _createExec: function(){
                    var that = this, timeout = this.options[this.name+'Deferred'];

                    if (timeout) {
                        setTimeout(function(){
                            that._create();
                        }, timeout);
                    } else {
                        that._create();
                    }
                },

                _fireEvent: function(eventName, data, log, noFire, context = null){
                    var element = this.element, o = this.options;
                    var _data;
                    var event = str(eventName).camelCase().capitalize(false).value;

                    data = $.extend({}, data, {__this: element[0]});

                    _data = data ? Object.values(data) : {};

                    if (log) {
                        console.warn(log);
                        console.warn("Event: " + "on"+event);
                        console.warn("Data: ", data);
                        console.warn("Element: ", element[0]);
                    }

                    if (noFire !== true)
                        element.fire(event.toLowerCase(), data);

                    return Utils.exec(o["on"+event], _data, context ? context : element[0]);
                },

                _fireEvents: function(events, data, log, noFire, context){
                    var that = this, _events;

                    if (arguments.length === 0) {
                        return ;
                    }

                    if (arguments.length === 1) {

                        $.each(events, function () {
                            var ev = this;
                            that._fireEvent(ev.name, ev.data, ev.log, ev.noFire, context);
                        });

                        return Utils.objectLength(events);
                    }

                    if (!Array.isArray(events) && typeof events !== "string") {
                        return ;
                    }

                    _events = Array.isArray(events) ? events : events.toArray(",");

                    $.each(_events, function(){
                        that._fireEvent(this, data, log, noFire, context);
                    });
                },

                getComponent: function(){
                    return this.component;
                },

                getComponentName: function(){
                    return this.name;
                }
            }, compObj);

            Metro.plugin(name, component);

            return component;
        },

        fetch: {
            status: function(response){
                return response.ok ? Promise.resolve(response) : Promise.reject(new Error(response.statusText));
            },

            json: function(response){
                return response.json();
            },

            text: function(response){
                return response.text();
            },

            form: function(response){
                return response.formData();
            },

            blob: function(response){
                return response.blob();
            },

            buffer: function(response){
                return response.arrayBuffer();
            }
        },

        i18n: {
            loadLocale(lang = 'en-US'){

            },

            getMessage(id){
                return ""
            },

            updateUI(){
            }
        }
    };

    $(window).on(Metro.events.resize, function(){
        window.METRO_MEDIA = [];
        $.each(Metro.media_queries, function(key, query){
            if (Metro.utils.media(query)) {
                window.METRO_MEDIA.push(Metro.media_mode[key]);
            }
        });
    });

    window.Metro = Metro;

    if (window.METRO_INIT ===  true) {
        $(function(){
            Metro.init();
        });
    }

    return Metro;
}());

/* global Metro */
(function(Metro, $) {
    $.extend(Metro.locales, {
        'en-US': {
            "calendar": {
                "months": [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ],
                "days": [
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                    "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa",
                    "Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"
                ],
                "time": {
                    "days": "DAYS",
                    "hours": "HOURS",
                    "minutes": "MINS",
                    "seconds": "SECS",
                    "month": "MON",
                    "day": "DAY",
                    "year": "YEAR"
                },
                "weekStart": 0
            },
            "buttons": {
                "ok": "OK",
                "cancel": "Cancel",
                "done": "Done",
                "today": "Today",
                "now": "Now",
                "clear": "Clear",
                "help": "Help",
                "yes": "Yes",
                "no": "No",
                "random": "Random",
                "save": "Save",
                "reset": "Reset"
            },
            "table": {
                "rowsCount": "Show entries:",
                "search": "Search:",
                "info": "Showing $1 to $2 of $3 entries",
                "prev": "Prev",
                "next": "Next",
                "all": "All",
                "inspector": "Inspector",
                "skip": "Goto page",
                "empty": "Nothing to show"
            },
            "colorSelector": {
                addUserColorButton: "ADD TO SWATCHES",
                userColorsTitle: "USER COLORS"
            },
            "switch": {
                on: "on",
                off: "off"
            }
        }
    });
}(Metro, m4q));

(function() {

    if (typeof Array.prototype.shuffle !== "function") {
        Array.prototype.shuffle = function () {
            var currentIndex = this.length, temporaryValue, randomIndex;

            while (0 !== currentIndex) {

                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = this[currentIndex];
                this[currentIndex] = this[randomIndex];
                this[randomIndex] = temporaryValue;
            }

            return this;
        };
    }

    if (typeof Array.prototype.clone !== "function") {
        Array.prototype.clone = function () {
            return this.slice(0);
        };
    }

    if (typeof Array.prototype.unique !== "function") {
        Array.prototype.unique = function () {
            var a = this.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        };
    }

    if (typeof Array.prototype.pack !== "function") {
        Array.prototype.pack = function () {
            return this.map(n => n.trim()).filter(Boolean);
        };
    }

}());

(function() {

    /**
     * Number.prototype.format(n, x, s, c)
     *
     * @param  n: length of decimal
     * @param  x: length of whole part
     * @param  s: sections delimiter
     * @param  c: decimal delimiter
     */
    Number.prototype.format = function(n, x, s, c) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));

        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };
}());

/* global Datetime, datetime */

(function() {

    String.prototype.toArray = function(delimiter, type, format, locale){
        var str = this;
        var a;

        type = type || "string";
        delimiter = delimiter || ",";
        format = format === undefined || format === null ? false : format;

        a = (""+str).split(delimiter);

        return a.map(function(s){
            var result;

            switch (type) {
                case "int":
                case "integer": result = isNaN(s) ? s.trim() : parseInt(s); break;
                case "number":
                case "float": result = isNaN(s) ? s : parseFloat(s); break;
                case "date": result = !format ? datetime(s) : Datetime.from(s, format, locale || 'en-US'); break;
                default: result = s.trim();
            }

            return result;
        });
    };

    String.prototype.capitalize = function(){
        var str = this;
        return str.substr(0, 1).toUpperCase() + str.substr(1)
    };
}());

(function(Metro, $) {
    Metro.utils = {
        nothing: function(){},
        noop: function(){},

        elementId: function(prefix){
            return prefix+"-"+(new Date()).getTime()+$.random(1, 1000);
        },

        secondsToTime: function(s) {
            var days = Math.floor((s % 31536000) / 86400);
            var hours = Math.floor(((s % 31536000) % 86400) / 3600);
            var minutes = Math.floor((((s % 31536000) % 86400) % 3600) / 60);
            var seconds = Math.round((((s % 31536000) % 86400) % 3600) % 60);

            return {
                "d": days,
                "h": hours,
                "m": minutes,
                "s": seconds
            };
        },

        secondsToFormattedString: function(time){
            var sec_num = parseInt(time, 10);
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            return [
                Str.lpad(hours, "0", 2),
                Str.lpad(minutes, "0", 2),
                Str.lpad(seconds, "0", 2)
            ].join(":");
        },

        func: function(f){
            /* jshint -W054 */
            return new Function("a", f);
        },

        exec: function(f, args, context){
            var result;
            if (f === undefined || f === null) {return false;}
            var func = this.isFunc(f);

            if (func === false) {
                func = this.func(f);
            }

            try {
                result = func.apply(context, args);
            } catch (err) {
                result = null;
                if (window.METRO_THROWS === true) {
                    throw err;
                }
            }
            return result;
        },

        embedUrl: function(val){
            if (val.indexOf("youtu.be") !== -1) {
                val = "https://www.youtube.com/embed/" + val.split("/").pop();
            }
            return "<div class='embed-container'><iframe src='"+val+"'></iframe></div>";
        },

        isVisible: function(element){
            var el = $(element)[0];
            return this.getStyleOne(el, "display") !== "none"
                && this.getStyleOne(el, "visibility") !== "hidden"
                && el.offsetParent !== null;
        },

        isUrl: function (val) {
            return /^(\.\/|\.\.\/|ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-\/]))?/.test(val);
        },

        isTag: function(val){
            return /^<\/?[\w\s="/.':;#-\/\?]+>/gi.test(val);
        },

        isEmbedObject: function(val){
            var embed = ["iframe", "object", "embed", "video"];
            var result = false;
            $.each(embed, function(){
                if (typeof val === "string" && val.toLowerCase() === this) {
                    result = true;
                } else if (val.nodeType !== undefined && val.tagName.toLowerCase() === this) {
                    result = true;
                }
            });
            return result;
        },

        isVideoUrl: function(val){
            return /youtu\.be|youtube|twitch|vimeo/gi.test(val);
        },

        isDate: function(val, format, locale = "en-US"){
            var result;

            if (this.isDateObject(val)) {
                return true;
            }

            try {
                result = format ? Datetime.from(val, format, locale) : datetime(val);
                return Datetime.isDatetime(result);
            } catch (e) {
                return false;
            }
        },

        isDateObject: function(v){
            return typeof v === 'object' && v.getMonth !== undefined;
        },

        isInt: function(n){
            return !isNaN(n) && +n % 1 === 0;
        },

        isFloat: function(n){
            return (!isNaN(n) && +n % 1 !== 0) || /^\d*\.\d+$/.test(n);
        },

        isFunc: function(f){
            return this.isType(f, 'function');
        },

        isObject: function(o){
            return this.isType(o, 'object');
        },

        isObject2: function(o){
            return typeof o === "object" && !Array.isArray(o);
        },

        isType: function(o, t){
            if (!this.isValue(o)) {
                return false;
            }

            if (typeof o === t) {
                return o;
            }

            if ((""+t).toLowerCase() === 'tag' && this.isTag(o)) {
                return o;
            }

            if ((""+t).toLowerCase() === 'url' && this.isUrl(o)) {
                return o;
            }

            if ((""+t).toLowerCase() === 'array' && Array.isArray(o)) {
                return o;
            }

            if (t !== "string" && this.isTag(o) || this.isUrl(o)) {
                return false;
            }

            if (typeof window[o] === t) {
                return window[o];
            }

            if (typeof o === 'string' && o.indexOf(".") === -1) {
                return false;
            }

            if (typeof o === 'string' && /[/\s([]+/gm.test(o)) {
                return false;
            }

            if (typeof o === "number" && t.toLowerCase() !== "number") {
                return false;
            }

            var ns = o.split(".");
            var i, context = window;

            for(i = 0; i < ns.length; i++) {
                context = context[ns[i]];
            }

            return typeof context === t ? context : false;
        },

        $: function(){
            return window.useJQuery ? jQuery : m4q;
        },

        isMetroObject: function(el, type){
            var $el = $(el), el_obj = Metro.getPlugin(el, type);

            if ($el.length === 0) {
                console.warn(type + ' ' + el + ' not found!');
                return false;
            }

            if (el_obj === undefined) {
                console.warn('Element not contain role '+ type +'! Please add attribute data-role="'+type+'" to element ' + el);
                return false;
            }

            return true;
        },

        isJQuery: function(el){
            return (typeof jQuery !== "undefined" && el instanceof jQuery);
        },

        isM4Q: function(el){
            return (typeof m4q !== "undefined" && el instanceof m4q);
        },

        isQ: function(el){
            return this.isJQuery(el) || this.isM4Q(el);
        },

        isOutsider: function(element) {
            var el = $(element);
            var inViewport;
            var clone = el.clone();

            clone.removeAttr("data-role").css({
                visibility: "hidden",
                position: "absolute",
                display: "block"
            });
            el.parent().append(clone);

            inViewport = this.inViewport(clone[0]);

            clone.remove();

            return !inViewport;
        },

        inViewport: function(el){
            var rect = this.rect(el);

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        rect: function(el){
            return el.getBoundingClientRect();
        },

        getCursorPosition: function(el, e){
            var a = this.rect(el);
            return {
                x: this.pageXY(e).x - a.left - window.scrollX,
                y: this.pageXY(e).y - a.top - window.scrollY
            };
        },

        getCursorPositionX: function(el, e){
            return this.getCursorPosition(el, e).x;
        },

        getCursorPositionY: function(el, e){
            return this.getCursorPosition(el, e).y;
        },

        objectLength: function(obj){
            return Object.keys(obj).length;
        },

        percent: function(total, part, round_value){
            if (total === 0) {
                return 0;
            }
            var result = part * 100 / total;
            return round_value === true ? Math.round(result) : Math.round(result * 100) / 100;
        },

        objectShift: function(obj){
            var min = 0;
            $.each(obj, function(i){
                if (min === 0) {
                    min = i;
                } else {
                    if (min > i) {
                        min = i;
                    }
                }
            });
            delete obj[min];

            return obj;
        },

        objectDelete: function(obj, key){
            if (key in obj) delete obj[key];
        },

        arrayDeleteByMultipleKeys: function(arr, keys){
            keys.forEach(function(ind){
                delete arr[ind];
            });
            return arr.filter(function(item){
                return item !== undefined;
            });
        },

        arrayDelete: function(arr, val){
            var i = arr.indexOf(val);
            if (i > -1) arr.splice(i, 1);
        },

        arrayDeleteByKey: function(arr, key){
            arr.splice(key, 1);
        },

        nvl: function(data, other){
            return data === undefined || data === null ? other : data;
        },

        objectClone: function(obj){
            var copy = {};
            for(var key in obj) {
                if ($.hasProp(obj, key)) {
                    copy[key] = obj[key];
                }
            }
            return copy;
        },

        github: async function(repo, callback){
            const res = await fetch(`https://api.github.com/repos/${repo}`);
            if (!res.ok) return
            const data = await res.json();
            this.exec(callback, [data]);
        },

        pageHeight: function(){
            var body = document.body,
                html = document.documentElement;

            return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
        },

        cleanPreCode: function(selector){
            var els = Array.prototype.slice.call(document.querySelectorAll(selector), 0);

            els.forEach(function(el){
                var txt = el.textContent
                    .replace(/^[\r\n]+/, "")	// strip leading newline
                    .replace(/\s+$/g, "");

                if (/^\S/gm.test(txt)) {
                    el.textContent = txt;
                    return;
                }

                var mat, str, re = /^[\t ]+/gm, len, min = 1e3;

                /* jshint -W084 */
                /* eslint-disable-next-line */
                while (mat = re.exec(txt)) {
                    len = mat[0].length;

                    if (len < min) {
                        min = len;
                        str = mat[0];
                    }
                }

                if (min === 1e3)
                    return;

                el.textContent = txt.replace(new RegExp("^" + str, 'gm'), "").trim();
            });
        },

        coords: function(element){
            var el = $(element)[0];
            var box = el.getBoundingClientRect();

            return {
                top: box.top + window.pageYOffset,
                left: box.left + window.pageXOffset
            };
        },

        positionXY: function(e, t){
            switch (t) {
                case 'client': return this.clientXY(e);
                case 'screen': return this.screenXY(e);
                case 'page': return this.pageXY(e);
                default: return {x: 0, y: 0};
            }
        },

        /**
         *
         * @param {TouchEvent|Event|MouseEvent} e
         * @returns {{x: (*), y: (*)}}
         */
        clientXY: function(e){
            return {
                x: e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
                y: e.changedTouches ? e.changedTouches[0].clientY : e.clientY
            };
        },

        /**
         *
         * @param {TouchEvent|Event|MouseEvent} e
         * @returns {{x: (*), y: (*)}}
         */
        screenXY: function(e){
            return {
                x: e.changedTouches ? e.changedTouches[0].screenX : e.screenX,
                y: e.changedTouches ? e.changedTouches[0].screenY : e.screenY
            };
        },

        /**
         *
         * @param {TouchEvent|Event|MouseEvent} e
         * @returns {{x: (*), y: (*)}}
         */
        pageXY: function(e){
            return {
                x: e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
                y: e.changedTouches ? e.changedTouches[0].pageY : e.pageY
            };
        },

        isRightMouse: function(e){
            return "which" in e ? e.which === 3 : "button" in e ? e.button === 2 : undefined;
        },

        hiddenElementSize: function(el, includeMargin){
            var width, height, clone = $(el).clone(true);

            clone.removeAttr("data-role").css({
                visibility: "hidden",
                position: "absolute",
                display: "block"
            });
            $("body").append(clone);

            if (!this.isValue(includeMargin)) {
                includeMargin = false;
            }

            width = clone.outerWidth(includeMargin);
            height = clone.outerHeight(includeMargin);
            clone.remove();
            return {
                width: width,
                height: height
            };
        },

        getStyle: function(element, pseudo){
            var el = $(element)[0];
            return window.getComputedStyle(el, pseudo);
        },

        getStyleOne: function(el, property){
            return this.getStyle(el).getPropertyValue(property);
        },

        getInlineStyles: function(element){
            var i, l, styles = {}, el = $(element)[0];
            for (i = 0, l = el.style.length; i < l; i++) {
                var s = el.style[i];
                styles[s] = el.style[s];
            }

            return styles;
        },

        encodeURI: function(str){
            return encodeURI(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
        },

        updateURIParameter: function(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            }
            else {
                return uri + separator + key + "=" + value;
            }
        },

        getURIParameter: function(url, name){
            if (!url) url = window.location.href;
            /* eslint-disable-next-line */
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },

        getLocales: function(){
            return Object.keys(Metro.locales);
        },

        addLocale: function(locale){
            Metro.locales = $.extend( {}, Metro.locales, locale );
        },

        aspectRatioH: function(width, a){
            if (a === "16/9") return width * 9 / 16;
            if (a === "21/9") return width * 9 / 21;
            if (a === "4/3") return width * 3 / 4;
        },

        aspectRatioW: function(height, a){
            if (a === "16/9") return height * 16 / 9;
            if (a === "21/9") return height * 21 / 9;
            if (a === "4/3") return height * 4 / 3;
        },

        valueInObject: function(obj, value){
            return Object.values(obj).indexOf(value) > -1;
        },

        keyInObject: function(obj, key){
            return Object.keys(obj).indexOf(key) > -1;
        },

        inObject: function(obj, key, val){
            return obj[key] !== undefined && obj[key] === val;
        },

        newCssSheet: function(media){
            var style = document.createElement("style");

            if (media !== undefined) {
                style.setAttribute("media", media);
            }

            style.appendChild(document.createTextNode(""));

            document.head.appendChild(style);

            return style.sheet;
        },

        addCssRule: function(sheet, selector, rules, index){
            sheet.insertRule(selector + "{" + rules + "}", index);
        },

        media: function(query){
            return window.matchMedia(query).matches;
        },

        mediaModes: function(){
            return window.METRO_MEDIA;
        },

        mediaExist: function(media){
            return window.METRO_MEDIA.indexOf(media) > -1;
        },

        inMedia: function(media){
            return window.METRO_MEDIA.indexOf(media) > -1 && window.METRO_MEDIA.indexOf(media) === window.METRO_MEDIA.length - 1;
        },

        isValue: function(val){
            return val !== undefined && val !== null && val !== "";
        },

        isNull: function(val){
            return val === undefined || val === null;
        },

        isNegative: function(val){
            return parseFloat(val) < 0;
        },

        isPositive: function(val){
            return parseFloat(val) > 0;
        },

        isZero: function(val){
            return (parseFloat(val.toFixed(2))) === 0.00;
        },

        between: function(val, bottom, top, equals){
            return equals === true ? val >= bottom && val <= top : val > bottom && val < top;
        },

        parseMoney: function(val){
            return Number(parseFloat(val.replace(/[^0-9-.]/g, '')));
        },

        parseCard: function(val){
            return val.replace(/[^0-9]/g, '');
        },

        parsePhone: function(val){
            return this.parseCard(val);
        },

        parseNumber: function(val, thousand, decimal){
            return val.replace(new RegExp('\\'+thousand, "g"), "").replace(new RegExp('\\'+decimal, 'g'), ".");
        },

        nearest: function(val, precision, down){
            val /= precision;
            val = Math[down === true ? 'floor' : 'ceil'](val) * precision;
            return val;
        },

        bool: function(value){
            switch(value){
                case true:
                case "true":
                case 1:
                case "1":
                case "on":
                case "yes":
                    return true;
                default:
                    return false;
            }
        },

        copy: function(element){
            var body = document.body, range, sel;
            var el = $(element)[0];

            if (document.createRange && window.getSelection) {
                range = document.createRange();
                sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    range.selectNodeContents(el);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(el);
                    sel.addRange(range);
                }
            } else if (body["createTextRange"]) {
                range = body["createTextRange"]();
                range["moveToElementText"](el);
                range.select();
            }

            document.execCommand("Copy");

            if (window.getSelection) {
                if (window.getSelection().empty) {  // Chrome
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
            } else if (document["selection"]) {  // IE?
                document["selection"].empty();
            }
        },

        decCount: function(v){
            return v % 1 === 0 ? 0 : v.toString().split(".")[1].length;
        },

        classNames: function(){
            const args = Array.prototype.slice.call(arguments, 0);
            const classes = [];
            for (let a of args) {
                if (!a) continue;
                if (typeof a === "string") {
                    classes.push(a);
                } else if (Metro.utils.isObject(a)) {
                    for(let k in a) {
                        if (a[k]) {
                            classes.push(k);
                        }
                    }
                } else {
                    Metro.utils.nothing();
                }
            }
            return classes.join(' ');
        },

        join: function(){
            const values = Array.prototype.slice.call(arguments, 0);
            const sep = values.pop();
            const classes = [];
            for (let a of values) {
                if (!a) continue;
                classes.push(Metro.utils.isObject(a) ? Object.values(a)[0] : a);
            }
            return classes.join(sep);
        },

        copy2clipboard: function(v, cb){
            navigator.clipboard.writeText(v).then(function(){
                Metro.utils.exec(cb, [v]);
            });
        },

        getCssVar: function(v){
            var root = document.documentElement;
            var style = getComputedStyle(root);
            return style.getPropertyValue(v)
        }
    };

    if (window.METRO_GLOBAL_COMMON === true) {
        window.Utils = Metro.utils;
    }
}(Metro, m4q));
