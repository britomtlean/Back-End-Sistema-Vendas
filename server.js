//Framework
import express from 'express'

//Middleware
import cors from 'cors'

//ORM
import { PrismaClient } from '@prisma/client'

//Diretórios
import { fileURLToPath } from 'url'
import path from 'path'

//Upload de arquivos
import fileUpload from "express-fileupload";

//SOCKET
import http from "http";
import { Server } from "socket.io";

//rotas
import funcionarios from './controllers/funcionarios.js'
import vendas from './controllers/vendas.js'
import pruduvendas from './controllers/vendas_produto.js'
import produtos from './controllers/produtos.js'

//Configurações
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Instancia para manipular o Banco de dados
const prisma = new PrismaClient()

// Configurações de diretório e pasta pública

const __filename = fileURLToPath(import.meta.url); // Diretório com arquivo
const __dirname = path.dirname(__filename); // Dirétório sem o arquivo
console.log("Diretório principal: ",__dirname);

// Arquivos Estáticos (como CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

//Rota pública para imagens
app.use('/imagens', express.static(path.join(__dirname, '/public/imagens'))); //define como rota pública para acessar arquivos de imagens


/************************************************************************************** */


/****************************SOCKET***************************** */

// Criando instancia servidor HTTP
const server = http.createServer(app);

// Criando servidor Socket.IO
const io = new Server(server,
    {
        cors: {
            origin: ["https://sistema-vendas.netlify.app/", "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Recebendo mensagem do cliente
    socket.on("mensagem", (data) => {

        console.log(`Pedido recebido: ${JSON.stringify(data)}`);

        // Envia para todos os clientes conectados
        io.emit("mensagem_retorno", data);
    });

    // Desconexão
    socket.on("disconnect", () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

// Rota principal envia o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

//rotas
app.use('/', funcionarios)
app.use('/', vendas)
app.use('/', pruduvendas)
app.use('/', produtos)


server.listen(3001, () => {
    console.log('online')
})
