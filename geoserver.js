const axios = require("axios");
const slugify = require("slugify");

require("dotenv").config();

const { GEOSERVER_URL, GEOSERVER_WORKSPACE, GEOSERVER_USER, GEOSERVER_PASS } =
  process.env;

const auth = {
  username: GEOSERVER_USER,
  password: GEOSERVER_PASS,
};

async function createDataStore(dataStoreName, kmlPath) {
  const config = {
    dataStore: {
      name: dataStoreName,
      connectionParameters: {
        entry: [{ "@key": "url", $: `file:${kmlPath}` }],
      },
    },
  };

  const url = `${GEOSERVER_URL}/rest/workspaces/${GEOSERVER_WORKSPACE}/datastores`;
  await axios.post(url, config, {
    auth,
    headers: { "Content-Type": "application/json" },
  });
}

async function createFeatureType(dataStoreName, layerName) {
  const config = {
    featureType: {
      name: layerName,
      nativeName: layerName,
      title: layerName,
    },
  };

  const url = `${GEOSERVER_URL}/rest/workspaces/${GEOSERVER_WORKSPACE}/datastores/${dataStoreName}/featuretypes`;
  await axios.post(url, config, {
    auth,
    headers: { "Content-Type": "application/json" },
  });
}

module.exports = {
  createDataStore,
  createFeatureType,
};
