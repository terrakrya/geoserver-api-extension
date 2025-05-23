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
    const originalName = slugify(path.parse(file.originalname).name, {
      lower: true,
    });
    cb(null, `${originalName}.kml`);
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
    // Validação do KML
    const parsed = await xml2js.parseStringPromise(fileContent);
    if (!parsed.kml) throw new Error("KML inválido");

    const originalName = slugify(path.parse(req.file.originalname).name, {
      lower: true,
    });
    const layerName = originalName;
    const dataStoreName = `upload-${originalName}`;

    // Copiar KML para o diretório do GeoServer
    const kmlDir = path.join(process.env.UPLOAD_PATH, `${layerName}-kml`);
    if (!fs.existsSync(kmlDir)) fs.mkdirSync(kmlDir);
    fs.copyFileSync(filePath, path.join(kmlDir, `${layerName}.kml`));

    // Criar DataStore e FeatureType no GeoServer
    const kmlPath = path.join(
      process.env.UPLOAD_PATH,
      `${layerName}-kml`,
      `${layerName}.kml`
    );
    await createDataStore(dataStoreName, kmlPath);
    await createFeatureType(dataStoreName, layerName);

    const data = {
      message: "Upload concluído",
      filename: req.file.filename,
      layerName,
    };
    console.log("Upload e criação de camada concluídos com sucesso.", data);
    console.log("### End upload");

    return res.status(200).json(data);
  } catch (err) {
    fs.unlinkSync(filePath);
    console.error("Erro:", err);
    return res.status(400).json({
      error: "Arquivo .kml inválido ou erro ao criar camada.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
