import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

//retorna dados da tabela de vendas e funcionarios com a relação entre elas
router.get('/vendas', async (req, res) => {

    const resultado = await prisma.vendas.findMany({
        select: {
            id_funcionario_vendas: true,
            id_vendas: true,
            data_vendas: true,
            valorTotal_vendas: true,
            status: true,
            funcionarios: {
                select: {
                    nome_funcionarios: true,
                },
            },
        },
        orderBy: {
            data_vendas: 'desc', // ou 'desc' para ordem decrescente
        },
    });
    res.status(200).json(resultado)
})

//receber produtos vendidos
router.get('/vendas/:id', async (req, res) => {
    try {
        const id = Number(req.params.id)

        const venda = await prisma.vendas_produtos.findMany({
            where: {
                id_venda: id
            },
            select: {
                id_venda: true,
                quantidade: true,
                valorUni: true,
                valorTotal_vendasprodutos: true,
                produtos: {
                    select: {
                        produto_produtos: true,
                    }
                }
            },
            orderBy: {
                quantidade: 'asc'
            }

        })

        res.status(200).json(venda)
    } catch (err) {
        res.status(400).json({ message: 'Erro ao cadastrar!' })
        console.log(err)
    }
})


//atualizar status da venda
router.put('/vendas/:id', async (req, res) => {
    try {
        const id = Number(req.params.id)

        const venda = await prisma.vendas.update({
            where: {
                id_vendas: id
            },
            data: {status: req.body.status }

        })

        res.status(200).json(venda)
    } catch (err) {
        res.status(400).json({ message: 'Erro ao cadastrar!' })
        console.log(err)
    }
})



router.get('/venda-completa', async (req, res) => {
    try {
        const resultado = await prisma.vendas.findMany({
            select: {
                id_vendas: true,
                data_vendas: true,
                funcionarios: {
                    select: {
                        nome_funcionarios: true
                    }
                },
                vendas_produtos: { // relacionamento com a tabela de junção
                    select: {
                        quantidade: true,
                        produtos: {
                            select: {
                                produto_produtos: true
                            }
                        }
                    },
                    orderBy: {
                        quantidade: 'asc'
                    }
                }
            },
            orderBy: {
                id_vendas: 'asc'
            }
        });

        res.status(200).json(resultado);
    } catch (err) {
        console.error('Erro ao buscar vendas:', err);
        res.status(500).json({ message: 'Erro ao buscar vendas' });
    }
});




export default router