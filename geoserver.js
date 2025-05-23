const axios = require("axios");
const slugify = require("slugify");

require("dotenv").config();

const { GEOSERVER_URL, GEOSERVER_WORKSPACE, GEOSERVER_USER, GEOSERVER_PASS } =
  process.env;

const auth = {
  username: GEOSERVER_USER,
  password: GEOSERVER_PASS,
};

const createDataStore = async (dataStoreName, filePath) => {
  try {
    const data = {
      dataStore: {
        name: dataStoreName,
        type: "KML",
        connectionParameters: {
          entry: [
            {
              "@key": "url",
              $: `file:${filePath}`,
            },
            {
              "@key": "namespace",
              $: GEOSERVER_WORKSPACE,
            },
          ],
        },
      },
    };

    const response = await axios.post(
      `${GEOSERVER_URL}/rest/workspaces/${GEOSERVER_WORKSPACE}/datastores`,
      data,
      {
        auth: {
          username: GEOSERVER_USER,
          password: GEOSERVER_PASS,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao criar DataStore:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const createFeatureType = async (dataStoreName, layerName) => {
  try {
    const data = {
      featureType: {
        name: layerName,
        nativeName: layerName,
        title: layerName,
        srs: "EPSG:4326",
      },
    };

    const response = await axios.post(
      `${GEOSERVER_URL}/rest/workspaces/${GEOSERVER_WORKSPACE}/datastores/${dataStoreName}/featuretypes`,
      data,
      {
        auth: {
          username: GEOSERVER_USER,
          password: GEOSERVER_PASS,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao criar FeatureType:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  createDataStore,
  createFeatureType,
};
