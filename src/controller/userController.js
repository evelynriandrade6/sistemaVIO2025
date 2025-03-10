const connect = require("../db/connect");
module.exports = class userController {
  static async createUser(req, res) {
    const { cpf, email, password, name, data_nascimento} = req.body;

    if (!cpf || !email || !password || !name || !data_nascimento) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    } else if (isNaN(cpf) || cpf.length !== 11) {
      return res.status(400).json({
        error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
      });
    } else if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido. Deve conter @" });
    } else {
      // Construção da query INSERT
      const query = `INSERT INTO usuario(name, cpf, email, password, data_nascimento) VALUES ('${name}', '${cpf}', '${email}', '${password}', '${data_nascimento}');`;

      // Executando a query INSERT
      try {
        connect.query(query, function (err) {
          if (err) {
            console.log(err);
            console.log(err.code);
            if (err.code === "ER_DUP_ENTRY") {
              if(err.message.includes(`email`)){
                return res
                .status(400)
                .json({ error: "O Email já está vinculado a outro usuário" });
              }else{
                return res
                .status(400)
                .json({ error: "O CPF já está vinculado a outro usuário" });
              }
             
            } else {
              return res
                .status(500)
                .json({ error: "Erro Interno Do Servidor" });
            }
          } else {
            return res
              .status(201)
              .json({ message: "Usuário criado com sucesso" });
          }
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }

  static async loginUser(req, res) {
    const {email, password} = req.body;

    if(!email||!password){
      return res.status(400).json({error:'O E-mail e a Senha são obrigatórios para o login!'})
    }

    const query = `SELECT * FROM usuario WHERE email = ?`
    try{
      connect.query(query, [email], (err, results) =>{
        if(err){
          console.log(err);
          return res.status(500).json({error:"Erro Interno do Servidor"})
        }
        if(results.length===0){
          return res.status(404).json({error:'Usuário não encontrado'})
        }
        const user = results[0];

        if(user.password !== password){
          return res.status(403).json({error:"Senha Incorreta"})
        }
        return res.status(200).json({message:`Login Efetuado com Sucesso!`, user})
      })
    }catch(error){
      console.log(error);
      return res.status(500).json({error:'Erro interno do Servidor'})
    }
  }


  static async getAllUsers(req, res) {
    const query = `SELECT * FROM usuario`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res.status(200).json({
          message: "Mostrando usuários: ",
          users: results,
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Um erro foi encontrado." });
    }
  }

  static async updateUser(req, res) {
    //Desestrutura e recupera os dados enviados via corpo da requisição
    const { cpf, email, password, name, id } = req.body;
    //Validar se todos os campos foram preenchidos
    if (!cpf || !email || !password || !name || !id) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }
    const query = `UPDATE usuario SET name=?, email=?, password=?, cpf=? WHERE id_usuario = ?`;
    const values = [name, email, password, cpf, id];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "E-mail já cadastrado por outro usuário." });
          } else {
            console.error(err);
            return res.status(500).json({ error: "Erro Interno do Servidor" });
          }
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Usuário atualizado com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }

  static async deleteUser(req, res) {
    const userId = req.params.id;

    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    const values = [userId];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Usuário excluído com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }
};
