// client-upload.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadKmlFile() {
  const form = new FormData();
  form.append("kmlfile", fs.createReadStream("example/morro-santana.kml"));

  try {
    const response = await axios.post("http://localhost:8084/upload", form, {
      headers: form.getHeaders(),
    });

    console.log("✅ Upload feito com sucesso!");
    console.log(response.data); // { message: '...', filename: 'upload-camada-kml-nome-do-arquivo.kml' }
  } catch (error) {
    console.error("❌ Erro no upload:", error.response?.data || error.message);
  }
}

uploadKmlFile();
