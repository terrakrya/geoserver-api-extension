require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const slugify = require("slugify");
const { execSync } = require("child_process");

const { createDataStore, createFeatureType } = require("./geoserver");

const app = express();
const PORT = 8084;

const localUploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir);

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localUploadDir),
  filename: (req, file, cb) => {
    // Usar apenas o nome original sem prefixo
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

  // Passo 1: Verifica se o arquivo foi enviado
  if (!req.file) {
    return res.status(400).json({ error: "Arquivo .kml não enviado." });
  }

  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, "utf8");

  try {
    // Passo 2: Validação básica do XML/KML
    const parsed = await xml2js.parseStringPromise(fileContent);
    if (!parsed.kml) throw new Error("KML inválido");

    // Usar o nome original do arquivo (sem prefixo)
    const originalName = slugify(path.parse(req.file.originalname).name, {
      lower: true,
    });
    const layerName = originalName;
    const dataStoreName = `upload-${originalName}`;

    // Passo 3: Cria diretório temporário para o Shapefile
    const shpDir = path.join(localUploadDir, `${layerName}-shp`);
    if (!fs.existsSync(shpDir)) fs.mkdirSync(shpDir);
    const shpPath = path.join(shpDir, `${layerName}.shp`);

    // Passo 4: Converter KML para Shapefile usando ogr2ogr
    execSync(`ogr2ogr -f "ESRI Shapefile" "${shpDir}" "${filePath}"`);

    // Passo 5: Copiar todos os arquivos do Shapefile para o diretório do GeoServer
    const absoluteShpPath = path.join(
      process.env.UPLOAD_PATH,
      `${layerName}-shp`,
      `${layerName}.shp`
    );
    const shpFiles = fs.readdirSync(shpDir);
    const destDir = path.join(process.env.UPLOAD_PATH, `${layerName}-shp`);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);
    shpFiles.forEach((f) => {
      fs.copyFileSync(path.join(shpDir, f), path.join(destDir, f));
    });

    // Passo 6: Criar DataStore e FeatureType no GeoServer
    await createDataStore(dataStoreName, absoluteShpPath);
    await createFeatureType(dataStoreName, path.parse(shpPath).name);

    // Passo 7: Resposta de sucesso
    const data = {
      message: "Upload concluído",
      filename: req.file.filename,
      layerName,
    };
    console.log(
      "Upload, conversão e criação de camada concluídos com sucesso.",
      data
    );
    console.log("### End upload");

    return res.status(200).json(data);
  } catch (err) {
    // Passo 8: Tratamento de erro
    fs.unlinkSync(filePath);
    console.error("Erro:", err);
    return res.status(400).json({
      error: "Arquivo .kml inválido, erro na conversão ou ao criar camada.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
