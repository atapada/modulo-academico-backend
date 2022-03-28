const sequelize = require("sequelize");
const conexao = require("./database");

const student = conexao.define('student', {
    academic_record:{
        type: sequelize.BIGINT(11),
        allowNull: false,
        primaryKey: true,
        unique: true,
        comment: 'Registro acadêmico que identifica o aluno.'
    },
    name:{
        type: sequelize.STRING(80),
        allowNull: false,
        comment: 'Nome de identificação do aluno.'
    },
    email:{
        type: sequelize.STRING(80),
        allowNull: false,
        comment: 'E-mail de contato do aluno.'
    },
    cpf:{
        type: sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Registro de pessoa física do aluno.'
    }
}, 
{
    freezeTableName: true
});

student.sync({force: false}).then(() =>{});

module.exports = student;