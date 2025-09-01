try {
  exports.notNull = (val) => {
    return (
      val !== null &&
      val !== NaN &&
      val !== undefined &&
      val !== "NULL" &&
      val !== "NaN" &&
      val !== "null" &&
      val !== "undefined" &&
      val !== "UNDEFINED" &&
      (val + "").trim() !== ""
    );
  };

  exports.notZero = (val) => {
    return Number(val + "") > 0;
  };

  exports.get_role = (id) => {
    return new Promise(async (resolve, reject) => {
      let query = `select role from roles where id = ${id}`;
      let res = await DatabaseService.single_query_transaction(query);
      // console.log(res)
      if (res.code == 200) resolve(res.result[0]);
      else reject("");
    });
  };

  exports.trim = (val) => {
    return (val + "").trim();
  };

  exports.dateDDMMYYYY = (date, delimeter) => {
    // console.log(date);
    var user_date = new Date(date);
    var year = user_date.getFullYear();
    var month = user_date.getMonth() + 1;
    var day = user_date.getDate();
    var day_2, month_2;
    if (Number(day) < 10) {
      day_2 = "0" + day;
    } else {
      day_2 = day;
    }
    if (Number(month) < 10) {
      month_2 = "0" + month;
    } else {
      month_2 = month;
    }
    return day_2 + delimeter + month_2 + delimeter + year;
  };

  exports.getDate = (date, delimeter) => {
    // console.log(date);
    var user_date = new Date(date);
    var year = user_date.getFullYear();
    var month = user_date.getMonth() + 1;
    var day = user_date.getDate();
    var day_2, month_2;
    if (Number(day) < 10) {
      day_2 = "0" + day;
    } else {
      day_2 = day;
    }
    if (Number(month) < 10) {
      month_2 = "0" + month;
    } else {
      month_2 = month;
    }
    return year + delimeter + month_2 + delimeter + day_2;
  };

  exports.weightage = {
    quality: 45,
    time: 25,
    credit: 20,
    type: 10,
  };

  exports.changeDateFormat = (date) => {
    var user_date = new Date(date);
    var year = user_date.getFullYear();
    var month = user_date.getMonth() + 1;
    var day = user_date.getDate();
    var day_2, month_2;
    if (Number(day) < 10) {
      day_2 = "0" + day;
    } else {
      day_2 = day;
    }
    if (Number(month) < 10) {
      month_2 = "0" + month;
    } else {
      month_2 = month;
    }
    return year + "-" + month_2 + "-" + day_2;
  };
} catch (error) {
  console.log(error);
}
