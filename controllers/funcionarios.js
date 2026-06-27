import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/funcionarios', async (req, res) => {
    let funcionarios = await prisma.funcionarios.findMany()
    res.status(200).json(funcionarios)
})


router.post('/funcionarios', async (req, res) => {
    try {
        const { nome, contato, cargo, cpf } = req.body

        let funcionarios = await prisma.funcionarios.create({
            data: {
                nome_funcionarios: nome,
                contato_funcionarios: contato,
                cargo_funcionarios: cargo,
                cpf_funcionarios: cpf
            }
        })

        res.status(201).json(funcionarios)
    } catch (err) {
        res.status(400).json({ message: 'Erro ao cadastrar!' })
    }
})

export default router