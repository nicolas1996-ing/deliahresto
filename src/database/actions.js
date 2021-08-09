const Sequelize = require('sequelize');
const database = new Sequelize('mysql://root:1088339674@localhost:3306/deliahrestoproyec3');

module.exports.Select = async (query, data) => {
    let result;
    try {
        result = await database.query(query, {
            replacements: data,
            type: database.QueryTypes.SELECT
        });

    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }

    return result;
}

module.exports.Insert = async (query, data) => {
    let result;
    try {
        result = await database.query(query, {
            replacements: data,
            type: database.QueryTypes.INSERT
        });
    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }
    return result;
}

module.exports.Update = async (query, data) => {
    let result;

    try {
        result = await database.query(query, {
            replacements: data,
            type: database.QueryTypes.UPDATE
        });
    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }
    return result;
}

module.exports.Delete = async (query, data) => {
    let result;

    try {
        result = await database.query(query, {
            replacements: data,
            type: database.QueryTypes.DELETE
        });
    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }
    return result;
}
