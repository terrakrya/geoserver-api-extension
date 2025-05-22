const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const slugify = require("slugify");

const app = express();
const PORT = 8084;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Mock para dataStoreLabel - você pode receber isso via query param ou body futuramente
const dataStoreLabel = "Camada KML";

// Configuração do Multer (nome do arquivo customizado com slugify)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const layerName = slugify(path.parse(file.originalname).name, {
      lower: true,
    });
    const datastoreName = `upload-${slugify(dataStoreLabel, { lower: true })}`;
    const finalName = `${datastoreName}-${layerName}.kml`;
    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === ".kml") cb(null, true);
    else cb(new Error("Apenas arquivos .kml são permitidos."));
  },
});

app.post("/upload", upload.single("kmlfile"), (req, res) => {
  console.log("### Init upload");
  if (!req.file) {
    console.log("Arquivo .kml não enviado.");
    return res.status(400).json({ error: "Arquivo .kml não enviado." });
  }

  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, "utf8");

  xml2js.parseString(fileContent, (err, result) => {
    if (err || !result.kml) {
      fs.unlinkSync(filePath);
      console.log("Arquivo .kml inválido.");
      return res.status(400).json({ error: "Arquivo .kml inválido." });
    }
    const data = {
      message: "Arquivo .kml recebido e validado com sucesso.",
      filename: req.file.filename,
    };
    console.log("Arquivo .kml recebido e validado com sucesso.");
    console.log(data);
    console.log("### End upload");

    return res.status(200).json(data);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
