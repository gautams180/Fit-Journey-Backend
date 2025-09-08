const dbPool = require("../connections/mysql");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const http = require("http");
const https = require("https");
const async = require("async");
let CONSTANTS = require("../helper/constants");

const pool = dbPool.pool;

let self = (module.exports = {
  is_exist: async function (query, values = [], connection = false) {
    return new Promise((resolve, reject) => {
      try {
        let exist_query = `SELECT EXISTS(` + query + `) as 'EXISTS'`;
        if (connection) {
          connection.query(exist_query, values, (err, results, fields) => {
            if (err) {
              console.log(err);
              let response = {
                code: 500,
                result: err,
              };
              reject(response);
            } else {
              resolve(results[0].EXISTS);
            }
          });
        } else {
          pool.query(exist_query, values, (err, results, fields) => {
            if (err) {
              console.log(err);
              let response = {
                code: 500,
                result: err,
              };
              reject(response);
            } else {
              resolve(results[0].EXISTS);
            }
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  insert: async function (query, values = [], connection = false) {
    return new Promise((resolve, reject) => {
      try {
        if (connection) {
          connection.query(query, values, (err, results, fields) => {
            if (err) {
              console.log(err);
              let response = {
                code: 500,
                result: err,
              };
              reject(response);
            } else {
              let response = {
                code: 200,
                result: results.insertId,
              };
              resolve(response);
            }
          });
        } else {
          pool.query(query, values, (err, results, fields) => {
            if (err) {
              console.log(err);
              let response = {
                code: 500,
                result: err,
              };
              reject(response);
            } else {
              let response = {
                code: 200,
                result: results.insertId,
              };
              resolve(response);
            }
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  update: async function (query, values = [], connection = false) {
    return new Promise((resolve, reject) => {
      try {
        if (connection) {
          connection.query(query, values, (err, results, fields) => {
            if (err) {
              console.log(err);
              let response = {
                code: 500,
                result: err,
              };
              reject(response);
            } else {
              let response = {
                code: 200,
                result: results,
              };
              resolve(response);
            }
          });
        } else {
          pool.query(query, values, (err, results, fields) => {
            if (err) {
              console.log(err);
              let response = {
                code: 500,
                result: err,
              };
              reject(response);
            } else {
              let response = {
                code: 200,
                result: results,
              };
              resolve(response);
            }
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  fetch: async function (query, values = [], connection = false) {
    return new Promise((resolve, reject) => {
      try {
        let conn = connection || pool
        conn.query(query, values, (err, results, fields) => {
          if (err) {
            console.log(err);
            let response = {
              code: 500,
              result: err,
            };
            reject(response);
          } else {
            let response = {
              code: 200,
              result: results,
            };
            resolve(response);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  fetch_array: async function (query, connection = false) {
    return new Promise((resolve, reject) => {
      try {
        if (connection) {
          connection.query(query, (err, results, fields) => {
            if (err) {
              console.log(err);
              resolve([]);
            } else {
              resolve(results);
            }
          });
        } else {
          pool.query(query, (err, results, fields) => {
            if (err) {
              console.log(err);
              resolve([]);
            } else {
              resolve(results);
            }
          });
        }
      } catch (e) {
        resolve([]);
      }
    });
  },
  delete: async function (query) {
    return new Promise((resolve, reject) => {
      try {
        pool.query(query, (err, results, fields) => {
          if (err) {
            console.log(err);
            let response = {
              code: 500,
              result: err,
            };
            reject(response);
          } else {
            let response = {
              code: 200,
              result: results,
            };
            resolve(response);
          }
        });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  },
  transaction: async function (queries) {
    return new Promise((resolve, reject) => {
      try {
        if (typeof queries === "object" && queries.length > 0) {
          pool.getConnection((err, connection) => {
            if (err) {
              let response = {
                result: err,
                code: 500,
              };
              reject(response);
            } else {
              connection.beginTransaction((err) => {
                if (err) {
                  console.log(err);
                  connection.release();
                  let response = {
                    result: err,
                    code: 500,
                  };
                  reject(response);
                } else {
                  async.eachSeries(
                    queries,
                    async function iterateValues(element, callback) {
                      try {
                        connection.query(element, (err, result, fields) => {
                          if (err) {
                            console.log(err);
                            connection.rollback();
                            connection.release();
                            let response = {
                              result: err,
                              code: 500,
                            };
                            reject(response);
                          } else {
                            if (element === queries[queries.length - 1]) {
                              connection.commit((err) => {
                                if (err) {
                                  console.log(err);
                                  let response = {
                                    result: err,
                                    code: 500,
                                  };
                                  reject(response);
                                } else {
                                  let response = {
                                    result: result,
                                    code: 200,
                                  };
                                  resolve(response);
                                }
                              });
                            }
                            callback;
                          }
                        });
                      } catch (e) {
                        console.log(e);
                        reject(e);
                      }
                    }
                  );
                }
              });
            }
          });
        } else {
          let response = {
            code: 200,
            result: results,
          };
          resolve(response);
        }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  },
  data_transaction: async function (queries) {
    return new Promise((resolve, reject) => {
      try {
        if (typeof queries === "object" && queries.length > 0) {
          pool.getConnection((err, connection) => {
            if (err) {
              let response = {
                result: err,
                code: 500,
              };
              reject(response);
            } else {
              connection.beginTransaction((err) => {
                if (err) {
                  console.log(err);
                  connection.release();
                  let response = {
                    result: err,
                    code: 500,
                  };
                  reject(response);
                } else {
                  async.eachSeries(
                    queries,
                    async function iterateValues(element, callback) {
                      try {
                        connection.query(
                          element[0],
                          [element[1]],
                          (err, result, fields) => {
                            if (err) {
                              console.log(err);
                              connection.rollback();
                              connection.release();
                              let response = {
                                result: err,
                                code: 500,
                              };
                              reject(response);
                            } else {
                              if (element === queries[queries.length - 1]) {
                                connection.commit((err) => {
                                  if (err) {
                                    console.log(err);
                                    let response = {
                                      result: err,
                                      code: 500,
                                    };
                                    reject(response);
                                  } else {
                                    let response = {
                                      result: result,
                                      code: 200,
                                    };
                                    resolve(response);
                                  }
                                });
                              }
                              callback;
                            }
                          }
                        );
                      } catch (e) {
                        console.log(e);
                        reject(e);
                      }
                    }
                  );
                }
              });
            }
          });
        } else {
          let response = {
            code: 200,
            result: results,
          };
          resolve(response);
        }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  },
  double_query_transaction: async function (query1, query2) {
    return new Promise((resolve, reject) => {
      try {
        pool.getConnection((err, connection) => {
          if (err) {
            let response = {
              result: err,
              code: 500,
            };
            reject(response);
          } else {
            connection.beginTransaction((err) => {
              if (err) {
                connection.release();
                let response = {
                  result: err,
                  code: 500,
                };
                reject(response);
              } else {
                connection.query(query1, (err, result1, fields) => {
                  if (err) {
                    connection.release();
                    let response = {
                      result: err,
                      code: 500,
                    };
                    reject(response);
                  } else {
                    connection.query(query2, (err, result2, fields) => {
                      if (err) {
                        connection.release();
                        let response = {
                          result: err,
                          code: 500,
                        };
                        reject(response);
                      } else {
                        connection.commit((err) => {
                          if (err) {
                            let response = {
                              result: err,
                              code: 500,
                            };
                            reject(response);
                          } else {
                            connection.release();
                            let response = {
                              result1: result1,
                              result2: result2,
                              code: 200,
                            };
                            resolve(response);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  fetch_nested: async function (query1, query2, query3) {
    return new Promise((resolve, reject) => {
      try {
        pool.query(query1, (err, results, fields) => {
          if (err) {
            console.log(err);
            let response = {
              code: 500,
              result: err,
            };
            reject(response);
          } else {
            async.each(
              results,
              async function (element, callback) {
                let value = await self.fetch(query2);

                element["a"] = value.result;

                let value2 = await self.fetch(query3);

                element["b"] = value2.result.length > 0 ? value2.result[0] : {};

                callback;
              },
              async function (err) {
                if (err) {
                  console.log(err);

                  let response = {
                    code: 500,
                    result: err,
                  };
                  reject(response);
                } else {
                  let response = {
                    code: 200,
                    result: results,
                  };
                  resolve(response);
                }
              }
            );
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  getConnection: async function () {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  },
  beginTransaction: async function (connection) {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(async (err) => {
        if (err) {
          console.log(err);
          connection.release();
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  },
  commitConnection: async function (connection) {
    return new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  },
});
