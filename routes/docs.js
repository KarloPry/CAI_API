const express = require("express");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const { jsPDF } = require("jspdf");
const db = require("../config/db");
const HttpError = require("../models/http-error");
const checkAuth = require("../middleware/check-auth");
const docs = express.Router();
const doc = new jsPDF();
const app = express();
const openaiApiKey = "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"; // Replace with your actual API key
let pathToPdf;

app.use(checkAuth);
docs.get("/:uid", async (req, res, next) => {
  try {
    let query = `SELECT * FROM docs WHERE creator_id = ${req.params.uid}`;
    const response = await db.query(query);
    console.log(response);
    return res
      .status(200)
      .json({ code: 201, message: "Todo cool", data: response });
  } catch (err) {
    console.log(err);
    return next(new HttpError(500, "Ocurrio un error en el servidor"));
  }
});
docs.post("/:uid/new", async (req, res, next) => {   
  try {
    const promptResponse = await axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: req.body.prompt }],
          temperature: 0.2,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
        }
      )
      .then((response) => response.data.choices[0].message.content)
      .catch((error) => console.log(error));
    const JSON_TASKS = await axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Enlista las obligaciones SOLO del contratado: \n${promptResponse}`,
            },
          ],
          temperature: 0.2,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
        }
      )
      .then((response) => {
        doc.setFontSize(12);
        doc.setFont("Times New Roman");
        console.log(promptResponse);
        doc.text(promptResponse.toString(), 10, 10, {
          align: "left",
          lineHeightFactor: 1.15,
          maxWidth: 175, // decrease maxWidth to fit within margins
        });
        pathToPdf = `uploads/pdfs/${uuid()}.pdf`;
        doc.save(pathToPdf);
        return response.data.choices[0].message.content;
      })
      .catch((error) => console.log(error));
    const DEADLINE = await axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Genera en formato ISO la fecha del final del contrato siguiente, como si fuera generado por New Date(): \n${promptResponse}`,
            },
          ],
          temperature: 0.2,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
        }
      )
      .then((response) => response.data.choices[0].message.content)
      .catch((error) => console.log(error));
    const tasks = JSON_TASKS.split(`\n`);
    let query = `INSERT INTO docs ( creator_id, doc_tasks, doc_limit_date, signer_id, doc_path) VALUES (${req.params.uid},'${tasks}','${DEADLINE}',${req.body.contractor},'${pathToPdf}')`;
    const responseQuery = await db.query(query);
    console.log(tasks);
    return res.status(200).json({
      message: "It works fine!",
      data: promptResponse,
      tasks: JSON.stringify(tasks),
      limit: DEADLINE,
      query: responseQuery,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "An error ocurred on the server" });
  }
});
docs.get("/:uid/:docid", async (req, res, next) => {
  try {
    let query = `SELECT * FROM docs WHERE creator_id = ${req.params.uid} AND doc_id = ${req.params.docid}`;
    const response = await db.query(query);
    return res
      .status(200)
      .json({ status: 200, message: "Todo nice", data: response[0] });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "An error ocurred on the server" });
  }
});
module.exports = docs;
docs.delete("/:uid/:docid", async (req, res, next) => {
  try {
    let query = `DELETE * FROM docs WHERE doc_id = ${req.params.docid}`;
    const response = await db.query(query);
    return res
      .status(200)
      .json({ status: 200, message: "Todo nice", data: response[0] });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "An error ocurred on the server" });
  }
});
docs.post('/getPath', async(req,res,next)=>{
    try{
        let query = `SELECT doc_path FROM docs WHERE doc_id = ${req.body.docid}`
        const response = db.query(query);
        return res.status(200).json({status: 200, message:"Got data", data: response[0]});
    }catch(err){
        console.log(err);
        return res.status(500).json({status:500, message: "Somethin went wrong"});
    }
})