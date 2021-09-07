const Sequelize = require("sequelize");
const database = new Sequelize(
  "mysql://root:andresxss2@localhost:3306/deliahresto"
);

module.exports.Select = async (query, data) => {
  // retorna 'error' o array de objetos [{}]
  let result;
  try {
    result = await database.query(query, {
      replacements: data,
      type: database.QueryTypes.SELECT,
    });
  } catch (error) {
    result = {
      error: true,
      message: error,
    };
  }

  return result;
};

module.exports.Insert = async (query, data) => {
  // retorna un array [10, 1] [id, cantObjetosInsertados]
  let result;
  try {
    result = await database.query(query, {
      replacements: data,
      type: database.QueryTypes.INSERT,
    });
  } catch (error) {
    result = {
      error: true,
      message: error,
    };
  }
  return result;
};

module.exports.Update = async (query, data) => {
  // retorna arrya [null, 1] [null, numeroEntidadesActualizdas]
  let result;

  try {
    result = await database.query(query, {
      replacements: data,
      type: database.QueryTypes.UPDATE,
    });
  } catch (error) {
    result = {
      error: true,
      message: error,
    };
  }
  return result;
};

module.exports.Delete = async (query, data) => {
  // retorna 'undefined'
  let result;

  try {
    result = await database.query(query, {
      replacements: data,
      type: database.QueryTypes.DELETE,
    });
  } catch (error) {
    result = {
      error: true,
      message: error,
    };
  }
  return result;
};
