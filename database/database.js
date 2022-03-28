const sequelize = require('sequelize');
const conexao = new sequelize('bd_modulo_academico','postgres','bdpg9021*inv',{
    host:'localhost',
    dialect:'postgres'
});

module.exports = conexao;