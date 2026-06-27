import express from 'express'
import { PrismaClient } from '@prisma/client'

import { fileURLToPath } from "url";
import path from "path";

const router = express.Router()
const prisma = new PrismaClient()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get('/produtos', async (req, res) => {
    let produtos = await prisma.produtos.findMany()
    res.status(200).json(produtos)
})


router.post('/produtos', async (req, res) => {

    try {

        if(!req.body || !req.files || !req.files.imagem_produtos){
            return res.status(400).json({message: "Falta de dados na requisição"})
        }

        console.log("Objetos recebidos: ", req.body) //objetos recebidos via body

        const { produto_produtos, descricao_produtos, valor_produtos, estoque_produtos } = req.body;
        const arquivo = req.files.imagem_produtos;

        /****************************************************************************************************** */

        const nomeArquivo = arquivo.name; //define o nome do arquivo
        const pastaImagens = path.join(__dirname, "../public/imagens"); //define a pasta onde armazenar o arquivo
        const caminhoDestino = path.join(pastaImagens, nomeArquivo); //configura os dados para mover o arquivo
        console.log("caminho da imagem: ", caminhoDestino)
        console.log(nomeArquivo)

        /******************************************************************************************************** */

        const produtos = await prisma.produtos.create({
            data: {
                produto_produtos,
                descricao_produtos,
                valor_produtos: parseFloat(valor_produtos.replace(",", ".")),
                estoque_produtos: parseInt(estoque_produtos),
                imagem_produtos: nomeArquivo,
            }
        })

        await new Promise((resolve, reject) => {
            arquivo.mv(caminhoDestino, (err) => (err ? reject(err) : resolve())); //código para mover o arquivo com base nos dados configurados
        });

        console.log("Prooduto cadastrado: ", produtos)

        res.status(201).json({ message: "Cadastro realizado!" })
    }
    catch (err) {
        res.status(400).json(err.message)
    }
})

//rota para dar baixa ao concluir uma venda
router.put('/produtos/:id/baixa', async (req, res) => {
    try {
        if (!req.params.id) {
            return (
                res.status(400).json({ message: 'ID não definida' })
            )
        }

        const id = Number(req.params.id)

        // 1. Busca todos os produtos dessa venda
        const itensVenda = await prisma.vendas_produtos.findMany({
            where: { id_venda: id },
            include: { produtos: true } // traz também os dados do produto
        })

        if (itensVenda.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado para essa venda' })
        }

        // 2. Atualiza o estoque de cada produto
        for (const item of itensVenda) {
            await prisma.produtos.update({
                where: { id_produtos: item.id_produto },
                data: {
                    estoque_produtos: {
                        decrement: item.quantidade // Prisma já suporta decremento seguro
                    }
                }
            })
        }

        res.status(201).json({ message: 'Estoque atualizado' })

    } catch (err) {
        console.log('Erro na execução do sql', err)
        res.status(500).json(err)
    }
})

//rota para realizar uma devolução
router.put('/produtos/:id/entrada', async (req, res) => {
    try {
        if (!req.params.id) {
            return (
                res.status(400).json({ message: 'ID não definida' })
            )
        }

        const id = Number(req.params.id)

        // 1. Busca todos os produtos dessa venda
        const itensVenda = await prisma.vendas_produtos.findMany({
            where: { id_venda: id },
            include: { produtos: true } // traz também os dados do produto
        })

        if (itensVenda.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado para essa venda' })
        }

        // 2. Atualiza o estoque de cada produto
        for (const item of itensVenda) {
            await prisma.produtos.update({
                where: { id_produtos: item.id_produto },
                data: {
                    estoque_produtos: {
                        increment: item.quantidade // Prisma já suporta decremento seguro
                    }
                }
            })
        }

        res.status(201).json({ message: 'Estoque atualizado' })

    } catch (err) {
        console.log('Erro na execução do sql', err)
        res.status(500).json(err)
    }
})

export default router