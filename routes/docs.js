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
        doc.setFont('Times New Roman');
        console.log(promptResponse);
        doc.text(promptResponse.toString(), 10, 10, {
            align: "left",
            lineHeightFactor: 1.15,
            maxWidth: 175, // decrease maxWidth to fit within margins
          });
        doc.save(`uploads/pdfs/${uuid()}.pdf`);
        return response.data.choices[0].message.content;
      })
      .catch((error) => console.log(error));

    return res
      .status(200)
      .json({
        message: "It works fine!",
        data: promptResponse,
        tasks: JSON_TASKS,
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "An error ocurred on the server" });
  }
});

module.exports = docs;
