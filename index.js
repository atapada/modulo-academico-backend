const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const conexao = require("./database/database");
const Student = require("./database/student");
const { response } = require("express");
const res = require("express/lib/response");

const cors = require("cors");

// Lista de origens permitidas para acessar o servidor
const allowedOrigins = ['http://localhost:8080', 'http://localhost:8081', 'http://localhost'];

const options = cors.CorsOptions = {
    origin: allowedOrigins
};

app.use(cors(options));

app.use(express.json());

conexao
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados");
    })
    .catch((msgErro) => {
        console.log(msgErro);
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Rotas

// Rota para incluir os dados de um aluno no banco de dados.
app.post("/student",(requisicao, resposta) => {
    var {academic_record, name, email, cpf} = requisicao.body;
    
    if ( name == '' ) {
        resposta.json({"erro":"O nome é obrigatório!"});
    }

    if ( email == '' ) {
        resposta.json({"erro":"O e-mail é obrigatório!"});
    }
    
    if ( isNaN(academic_record) ) {
        resposta.json({"erro":"O registro acadêmico deve ser numérico!"});
    }

    if ( academic_record == '' ) {
        resposta.json({"erro":"O registro acadêmico é obrigatório!"});
    }

    if ( cpf == '' ) {
        resposta.json({"erro":"O CPF é obrigatório!"});
    }

    try {
        Student.create({
            academic_record: academic_record,
            name: name,
            email: email,
            cpf: cpf
        }).then(() => {
            // Informa que tudo deu certo
            resposta.sendStatus(200);
        })
        .catch(function(erroCreate) {
            if(erroCreate.parent.code == 23505){
                let detail = erroCreate.parent.detail;
                
                if(detail.indexOf('(academic_record)') > -1){
                    resposta.json({"erro":"Registro acadêmico já cadastrado!"});
                }

                if(detail.indexOf('(cpf)') > -1){
                    resposta.json({"erro":"CPF já cadastrado!"});
                }
            }
        });
    } catch (error) {
        resposta.send(error);
    }

});

// Rota para consultar os alunos no banco de dados.
app.get("/students",(requisicao, resposta) => {
    Student.findAll({raw:true}).then(students => {
        resposta.statusCode = 200;
        resposta.json(students);    
    });
});

// Rota para consultar o aluno referente ao registro acadêmico informado.
app.get("/student/:academic_record",(requisicao, resposta) => {
    var academic_record = requisicao.params.academic_record;

    if(!isNaN(academic_record)){
        Student.findOne({
            where: {academic_record: academic_record}
        }).then(student => {
            if(student != undefined){
                // Aluno encontrado
                resposta.statusCode = 200;
                resposta.json(student.dataValues);
            } else {
                // Aluno não encontrado
                resposta.sendStatus(404);
            }
        });  
    } else {
        // Parâmetro incorreto informado
        resposta.sendStatus(400);
    }
});

// Rota para excluir o aluno referente ao registro acadêmico informado.
app.delete("/student/:academic_record",(requisicao, resposta) => {
    var academic_record = requisicao.params.academic_record;
    
    if(!isNaN(academic_record)){
        Student.findOne({
            where: {academic_record: academic_record}
        }).then(student => {
            if(student != undefined){
                // Se o aluno existe exclui o mesmo
                Student.destroy({
                    where: {academic_record: academic_record}
                }).then(student => {
                    // Aluno encontrado e excluído
                    resposta.sendStatus(200);
                });
            } else {
                // Aluno não encontrado não é possível excluir
                resposta.sendStatus(404);
            }
        });
    } else {
        // O parâmetro informado esta inválido
        resposta.sendStatus(400);
    }
});

// Rota para atualizar dados do aluno referente ao registro acadêmico informado.
app.put("/student/:academic_record",(requisicao, resposta) => {
    var academic_record = requisicao.params.academic_record
    if (isNaN(academic_record)) {
        resposta.json({"erro":"O registro acadêmico deve ser numérico!"});
    } else {
        // Verifica se existe no banco de dados o aluno referente ao registro acadêmico informado
        Student.findOne({
            where: {academic_record: academic_record}
        }).then(student => {
            // Se existe o aluno edita os dados do mesmo
            if (student != undefined){
                var name = requisicao.body.name;
                var email = requisicao.body.email;
                
                if (name == '') {
                    resposta.json({"erro":"O nome é obrigatório!"});
                }

                if (email == '') {
                    resposta.json({"erro":"O e-mail é obrigatório!"});
                }
                
                Student.update({
                    name:name,
                    email:email
                }, {
                    where:{
                        academic_record:academic_record
                    }
                }).then(() => {
                    // Dados do aluno editados com sucesso
                    resposta.sendStatus(200);
                });  
            } else {
                // Aluno não encontrado não é possível excluir
                resposta.json({"erro":"Aluno não encontrado!"});
            }
        });
    }
});

app.listen(8081, function(erro){
    if(erro){
        console.log("Ocorreu um erro!");
    } else {
        console.log("Servidor iniciado com sucesso!");
    }
});

