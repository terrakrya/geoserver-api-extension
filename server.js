require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const slugify = require("slugify");

const { createDataStore, createFeatureType } = require("./geoserver");

const app = express();
const PORT = 8084;

const localUploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir);

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localUploadDir),
  filename: (req, file, cb) => {
    const layerName = slugify(path.parse(file.originalname).name, {
      lower: true,
    });
    const datastoreName = `upload-${slugify(layerName, { lower: true })}`;
    cb(null, `${datastoreName}-${layerName}.kml`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === ".kml") cb(null, true);
    else cb(new Error("Apenas arquivos .kml são permitidos."));
  },
});

app.post("/upload", upload.single("kmlfile"), async (req, res) => {
  console.log("### Init upload");

  if (!req.file) {
    return res.status(400).json({ error: "Arquivo .kml não enviado." });
  }

  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, "utf8");

  try {
    const parsed = await xml2js.parseStringPromise(fileContent);
    if (!parsed.kml) throw new Error("KML inválido");

    const fileName = req.file.filename;
    const layerName = slugify(path.parse(fileName).name, { lower: true });
    const dataStoreName = `upload-${layerName}`;
    const absoluteKmlPath = path.join(process.env.UPLOAD_PATH, fileName);

    // Copiar arquivo para o diretório do GeoServer
    fs.copyFileSync(filePath, absoluteKmlPath);

    await createDataStore(dataStoreName, absoluteKmlPath);
    await createFeatureType(dataStoreName, layerName);

    const data = { message: "Upload concluído", filename: fileName, layerName };
    console.log("Upload e criação de camada concluídos com sucesso.", data);
    console.log("### End upload");

    return res.status(200).json(data);
  } catch (err) {
    fs.unlinkSync(filePath);
    console.error("Erro:", err.message);
    return res
      .status(400)
      .json({ error: "Arquivo .kml inválido ou erro ao criar camada." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
