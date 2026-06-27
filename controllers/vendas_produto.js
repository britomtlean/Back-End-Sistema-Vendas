import express from 'express'
import { PrismaClient } from '@prisma/client'

//Diretórios
import { fileURLToPath } from 'url'
import path from 'path'


//PDF
import PDFDocument from 'pdfkit'
import fs from 'fs'

const router = express.Router()
const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//GET
router.get('/venderproduto', async (req, res) => {
    let produtos = await prisma.vendas_produtos.findMany()
    res.status(200).json(produtos)
})

//ROTA PARA REALIZAR UMA VENDA ADICIONANDO UMA LINHA NA TABELA DE VENDAS E UMA LINHA PARA CADA PRODUTO EM VENDAS_PRODUTOS
router.post('/venderproduto', async (req, res) => {
    console.log(req.body);
    try {
        const { idFuncionario, produtos } = req.body

        const valorVenda = produtos.map(array => array.total
        ).reduce((soma, valorArray) => soma + valorArray, 0)
        console.log('total da venda,', valorVenda)

        const novaVenda = await prisma.vendas.create({
            data: {
                //cria uma venda com id do funcionário
                id_funcionario_vendas: idFuncionario,
                valorTotal_vendas: valorVenda,

                //insere as vendas de cada produto na tabela relacionada vendas_produtos
                vendas_produtos: {
                    create: produtos.map(array => ({
                        id_produto: array.id,
                        valorUni: array.valorUni,
                        quantidade: array.quantidade,
                        valorTotal_vendasprodutos: array.total
                    }))
                }
            },
            include: { vendas_produtos: true }
        })




        /***************************************************CRIAÇAO DE PDF************************************************** */




        const pdfDir = path.join(__dirname, "../public/PDF");
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const pdfPath = path.join(pdfDir, `venda_${novaVenda.id_vendas}.pdf`);
        const doc = new PDFDocument({ margin: 30 });

        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // ================== CABEÇALHO ==================

        const logoPath = path.join(__dirname, "../public/imagens/logo.png"); // opcional
        if (fs.existsSync(logoPath)) {
            const pageWidth = doc.page.width;
            const imageWidth = 80;
            const x = (pageWidth - imageWidth) / 2;

            doc.image(logoPath, x, 30, { width: imageWidth });
        }
        doc.moveDown(7);

        doc

            .fontSize(20)
            .text("Central de Pedidos", { align: "center", bold: true })
            .moveDown(0.5);
        doc
            .fontSize(12)
            .text(`Data: ${new Date().toLocaleString("pt-BR")}`, { align: "center" })
            .text(`ID da Venda: ${novaVenda.id_vendas}`, { align: "center" })
            .moveDown(1);

        doc
            .fontSize(14)
            .text("Detalhes da Venda", { align: "center" })
            .moveDown(3);

        // ================== TABELA ==================
        doc.fontSize(12).text("Itens:", { underline: true }).moveDown(0.5);

        produtos.forEach((p, index) => {
            doc
                .fontSize(10)
                .text(
                    `${index + 1}. ${p.nome} — ${p.quantidade}x R$ ${p.valorUni.toFixed(
                        2
                    )}`,
                    { align: "left" }
                )
                .text(`   Total: R$ ${p.total.toFixed(2)}`)
                .moveDown(1);
        });

        // ================== LINHA ==================
        doc.moveDown(0.5);
        doc
            .moveTo(doc.x, doc.y)
            .lineTo(550, doc.y)
            .strokeColor("#f3cb80ff")
            .stroke();

        // ================== TOTAL ==================
        doc.moveDown(1);
        doc
            .fontSize(14)
            .text(`Total da Venda: R$ ${valorVenda.toFixed(2)}`, {
                align: "right",
                bold: true,
            });

        // ================== RODAPÉ ==================
        doc.moveDown(2);
        doc
            .fontSize(11)
            .text("Obrigado pela preferência!", { align: "center" })
            .text("Sistema de Vendas • Desenvolvido Brit's Enterprise", {
                align: "center",
            });

        doc.end();

        writeStream.on("finish", () => {
            res.status(201).json({
                message: "Venda efetuada e PDF gerado com sucesso",
                pdf: `/PDF/venda_${novaVenda.id_vendas}.pdf`,
            });
        });






        /************************************************************************************************ */

    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Erro na operação' })
    }
})

router.post('/gerarPDF', async (req, res) => {

    console.log(req.body);

    try {
        const { id, dataPedido, produtos, valorTotal, nomeCliente, contatoCliente, enderecoCliente } = req.body;


        /***************************************************CRIAÇAO DE PDF************************************************** */

        const pdfDir = path.join(__dirname, '../public/PDF');
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const pdfPath = path.join(pdfDir, `venda_${id}.pdf`);
        const doc = new PDFDocument({ margin: 30 });

        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // ================== CABEÇALHO ==================

        const logoPath = path.join(__dirname, '../public/imagens/logo.png'); // opcional
        if (fs.existsSync(logoPath)) {
            const pageWidth = doc.page.width;
            const imageWidth = 80;
            const x = (pageWidth - imageWidth) / 2;

            doc.image(logoPath, x, 30, { width: imageWidth });
        }
        doc.moveDown(7);

        doc.fontSize(20).text('Central de Pedidos', { align: 'center', bold: true }).moveDown(0.5);
        doc.fontSize(12)
            .text(
                `Data: ${new Date(dataPedido).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                })}`,
                { align: 'center' }
            )
            .text(`ID da Venda: ${id}`, { align: 'center' })
            .moveDown(1);

        doc.fontSize(14).text('Detalhes da Venda', { align: 'center' }).moveDown(3);

        // ================== TABELA ==================
        doc.fontSize(12).text('Produtos:', { underline: true }).moveDown(0.5);

        produtos.forEach((p, index) => {
            doc.fontSize(10)
                .text(`${index + 1}. ${p.nome} — ${p.quantidade} x R$ ${p.valorUnitario.toFixed()}`, {
                    align: 'left',
                })
                .text(`   Total: R$ ${p.subtotal.toFixed(2)}`)
                .moveDown(1);
        });

        // ================== LINHA ==================
        doc.moveDown(0.5);
        doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).strokeColor('#f3cb80ff').stroke();

        // ================== TOTAL ==================
        doc.moveDown(1);
        doc.fontSize(14).text(`Total da Venda: R$ ${valorTotal.toFixed(2)}`, {
            align: 'right',
            bold: true,
        });

        // ================== RODAPÉ ==================
        doc.moveDown(2);
        doc.fontSize(11)
            .text('Obrigado pela preferência!', { align: 'center' })
            .text("Sistema de Vendas • Desenvolvido Brit's Enterprise", {
                align: 'center',
            });

        doc.end();

        writeStream.on('finish', () => {
            res.status(201).json({
                message: 'Venda efetuada e PDF gerado com sucesso',
                pdf: `/PDF/venda_${id}.pdf`,
            });
        });

        /************************************************************************************************ */
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Erro na operação' });
    }
});

export default router
