
const {default : axios} = require('axios');

const BASE_ENDPOINT = `http://192.168.0.21:7500/api/creditMemos`


const saveCreditMemo = async (formData) => {
  // formData is a FormData instance (payload + files)
  const resp = await axios.post(
    "http://192.168.0.21:7500/api/creditMemos",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return resp.data;
};

const getCreditMemoByUUID = async (uuid) => {
    try{
        const response = await axios.get(`${BASE_ENDPOINT}/${uuid}`);
        return response.data;
    }catch(error){
        console.log(error);
    }
}
const updateCreditMemo = async (uuid, formData) => {
  const { data } = await axios.put(
    `http://192.168.0.21:7500/api/creditMemos/${uuid}`,
    formData // multipart/form-data (browser sets boundary)
  );
  return data;
};
module.exports = {
    saveCreditMemo,
    getCreditMemoByUUID,
    updateCreditMemo
}