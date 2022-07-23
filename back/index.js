const express = require("./config/express");
const { logger } = require("./config/winston"); // log 찍는것 (배포 후 에러 났을때 찾아줌)

const port = 3000;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
