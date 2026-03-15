const carregarProdutos = async () => {
    //Código de requisição

    const res = await fetch('https://servidor-sistema-vendas.up.railway.app/produtos', {
        method: 'GET',
        headers: {
            'Content-type': 'application-json',
        },
    });

    const produtos = await res.json();
    console.log(produtos.map((array) => array));
    /************************************************************************************/

    //Criação de elementos

    const ul = document.getElementById('lista-produtos'); //elemento html que irá receber código javascript
    produtos.forEach((array) => {
        const boxProduto = document.createElement('div'); //div para separar cada produto
        const boxNome = document.createElement('div'); //div para exibir o nome de cada produto
        const boxInfo = document.createElement('div'); //div para exibir as informações de cada produto

        const produto = document.createElement('li'); //li nome do produto
        const preco = document.createElement('li'); //li preco do produto
        const img = document.createElement('img'); //img imagem do produto
        const a = document.createElement('a');
        /***********************************************************************/

        //inserção de dados nos elementos

        produto.innerHTML = array.produto_produtos; //recebe nome
        preco.innerHTML = array.valor_produtos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        a.innerHTML = 'Detalhes';
        a.href = '';

        // 👉 Exibe a imagem do produto
        img.src = `https://servidor-sistema-vendas.up.railway.app/imagens/${array.imagem_produtos}`; //recebe imagem através da url
        img.alt = array.produto_produtos; //descrição do produto
        /***************************************************************/

        //inserção de elementos

        boxNome.appendChild(produto); //add li com nome na div1
        boxInfo.appendChild(img); //add img na div2
        boxInfo.appendChild(preco); //add preço na div2
        boxInfo.appendChild(a);

        boxProduto.appendChild(boxNome);
        boxProduto.appendChild(boxInfo);
        ul.appendChild(boxProduto);
        /**********************************************************/

        //CSS

        boxNome.style.width = '100%';
        boxNome.style.textAlign = 'center';
        boxNome.style.fontSize = '1rem';
        boxNome.style.fontWeight = 'bold';
        boxNome.style.padding = '1rem 0';
        boxNome.style.background = 'rgb(48, 83, 83)';
        boxNome.style.color = 'white';

        // INFORMAÇÕES
        boxInfo.style.width = '100%';
        boxInfo.style.display = 'flex';
        boxInfo.style.justifyContent = 'space-between';
        boxInfo.style.alignItems = 'center';
        boxInfo.style.padding = '0.8rem 0.8rem';
        boxInfo.style.listStyle = 'none';

        boxProduto.style.display = 'flex';
        boxProduto.style.flexDirection = 'column';
        boxProduto.style.background = 'radial-gradient(circle, rgb(230,230,230,0.3), rgb(197,197,197,0.3))';

        boxProduto.style.minHeight = '10rem';
        boxProduto.style.width = '100%';
        boxProduto.style.borderBottom = '2px solid rgb(158, 158, 158)';
        boxProduto.style.borderRadius = '0.25rem';

        img.style.width = '4rem';
        img.style.borderRadius = '50%';
        img.style.flex = '1';

        preco.style.flex = '3';
        preco.style.textAlign = 'center';
        preco.style.fontWeight = 'bold';
        preco.style.fontSize = '1rem';
        preco.style.position = 'relative';
        //preco.style.right = "90px"

        a.style.textDecoration = 'none';
        /*****************************************************/
    });
};

carregarProdutos();
