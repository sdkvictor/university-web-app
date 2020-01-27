let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let jsonParser = bodyParser.json();
let {StudentList} = require('./model');
let {DATABASE_URL, PORT} = require('./config');

let app = express();

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
})

app.use(express.static('public'));


app.use(morgan('dev'));

let estudiantes = [{
    nombre : "Carlos",
    apellido : "Estronado",
    matricula : 1039919
},
{
    nombre: "Nancy",
    apellido: "Gonzalez",
    matricula : 1039859
},
{
    nombre: "Victor",
    apellido : "Villarreal",
    matricula : 1039863
}];

app.get('/api/students', (req, res) => {
    StudentList.getAll()
    .then(studentList=>{
        return res.status(200).json(studentList);
    })
    .catch (error => {
        res.statusMessage = "Hubo un error de conexion con la BD.";
        return res.status(500).send();
    });
    return res.status(200).json(estudiantes);
});

app.get('/api/getById/:id', (req,res)=>{
    let id = req.params.id;
    let result = estudiantes.find((elemento)=>{
        if(elemento.matricula == id){
            return elemento;
        }
    });
    if(result){
        return res.status(200).json(result);
    }
    else{
        res.statusMessage = "El alumno no se encuentra en la lista";
        return res.status(404).send();
    }
});

app.get('/api/getByName/:name', (req,res)=>{
    let name = req.params.name;
    let result = estudiantes.filter((elemento)=>{
        if(elemento.nombre == name){
            return elemento;
        }
    });
    if(result.length>0){
        return res.status(200).json(result);
    }
    else{
        res.statusMessage = "El alumno no se encuentra en la lista";
        return res.status(404).send();
    }
});

app.post('/api/newStudent', jsonParser, (req,res)=>{
    console.log(req.body);
    result = estudiantes.find((elemento)=>{
        if(elemento.matricula == req.body.matricula){
            return elemento;
        }
    });
    if(req.body.nombre==""||req.body.matricula==""||req.body.apellido==""){
        res.statusMessage = "Error 406: Datos incompletos";
        return res.status(406).send();
    }
    else if(result){
        res.statusMessage = "Error 409: Matricula debe ser unica";
        return res.status(409).send();
    }
    else{
        estudiantes.push({nombre:req.body.nombre, apellido:req.body.apellido, matricula:req.body.matricula});
        return res.status(201).json(estudiantes);
    }
});

app.put('/api/updateStudent/:id',(req,res)=>{
    if(req.body.matricula!=""&&(req.body.nombre!=""||req.body.apellido!="")){

    }
    else{
        res.statusMessage = "Error 409: Debe introducirse matricula y un nombre o apellido";
        return res.status(409).send();
    }
});

let server;

function runServer(port, databaseUrl){
    return new Promise( (resolve, reject ) => {
        mongoose.connect(databaseUrl, response => {
            if ( response ){
                return reject(response);
            }
            else{
                server = app.listen(port, () => {
                console.log( "App is running on port " + port );
                resolve();
            })
                .on( 'error', err => {
                    mongoose.disconnect();
                    return reject(err);
                })
            }
        });
    });
   }
   
   function closeServer(){
        return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing the server');
                server.close( err => {
                    if (err){
                        return reject(err);
                    }
                    else{
                        resolve();
                    }
                });
            });
        });
   }

runServer(PORT,DATABASE_URL);
module.exports = {app,runServer, closeServer};