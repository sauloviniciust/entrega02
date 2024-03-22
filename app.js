const fs = require("fs");

class FileManager {
  // Lê o conteúdo de um arquivo e o converte de JSON para objeto JavaScript
  async readFile(path) {
    const data = await fs.promises.readFile(path, "utf8");
    return data ? JSON.parse(data) : [];
  }

  // Cria um arquivo apenas se ele não existir, evitando a sobreescrita
  async createFile(path) {
    if (!fs.existsSync(path)) {
      await fs.promises.writeFile(path, JSON.stringify([]));
    }
  }

  // Atualiza o conteúdo de um arquivo com novos dados
  async updateFile(path, data) {
    await fs.promises.writeFile(path, JSON.stringify(data, null, 2));
  }

  // Exclui um arquivo
  async deleteFile(path) {
    await fs.promises.unlink(path);
  }
}

class ProductManager {
  #fileManager = new FileManager();
  path = "";

  constructor(path) {
    this.path = path;
    this.init(); // Chamada do método de inicialização na criação da instância
  }

  // Método inicializador para garantir que o arquivo exista antes de qualquer operação
  async init() {
    await this.#fileManager.createFile(this.path);
  }

  // Adiciona um novo produto, verificando primeiro se já não existe um produto com o mesmo código
  async addProduct(product) {
    let products = await this.#fileManager.readFile(this.path);

    const productExists = products.some((prod) => prod.code === product.code);
    if (productExists) {
      console.log("Produto com este código já existe.");
      return;
    }

    product.id = products.length + 1; // Geração simples de ID baseada no tamanho do array
    products.push(product);
    await this.#fileManager.updateFile(this.path, products);
  }

  // Retorna todos os produtos
  async getProducts() {
    return await this.#fileManager.readFile(this.path);
  }

  // Obtém um produto pelo seu ID
  async getProductById(id) {
    const products = await this.getProducts();
    const product = products.find((product) => product.id === id);
    return product || "Não encontrado!";
  }

  // Atualiza um produto existente com base no ID, alterando apenas as propriedades fornecidas
  async updateProduct(id, updatedProduct) {
    let products = await this.getProducts();
    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) {
      console.log("Produto não encontrado.");
      return;
    }

    // Mescla as propriedades do produto existente com as atualizações
    products[productIndex] = { ...products[productIndex], ...updatedProduct };
    await this.#fileManager.updateFile(this.path, products);
  }
}

const main = async () => {
  const productManager = new ProductManager("./products.json");

  // Adição de produtos demonstrativos
  await productManager.addProduct({
    title: "Product 1",
    description: "Descrição do Product 1",
    price: 1200,
    thumbnail: "product1.jpg",
    stock: 10,
    code: 180,
  });

  await productManager.addProduct({
    title: "Product 2",
    description: "Descrição do Product 2",
    price: 1500,
    thumbnail: "product2.jpg",
    stock: 20,
    code: 181,
  });

  // Atualização de um produto pelo ID
  await productManager.updateProduct(1, {
    description: "Descrição atualizada do Product 1",
  });

  // Exibição dos produtos após as operações
  const products = await productManager.getProducts();
  console.log(products);
};

main().catch(console.error); // Executa a função principal e lida com possíveis erros
