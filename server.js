const app = require('./app');
const CONFIG = require('./config/config')
const { connetToMongoDB } = require("./db");


connetToMongoDB()

app.listen(CONFIG.PORT, () => {
    console.log(`app is listening on the port ${CONFIG.PORT}`);
  }); 

