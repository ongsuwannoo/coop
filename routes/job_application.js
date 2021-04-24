const express = require('express');
const router = express.Router();
const fs = require("fs");
const contentDisposition = require('content-disposition');

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('job_application', { title: 'เอกสารสหกิจ' });
});

router.post('/send', async function (req, res, next) {
  console.log("send")

  let payload = req.body;
  let outputName = "ใบสมัครงานสหกิจศึกษา " + payload.firstname;

  // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
  function replaceErrors(key, value) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce(function (error, key) {
        error[key] = value[key];
        return error;
      }, {});
    }
    return value;
  }

  function errorHandler(error) {
    console.log(JSON.stringify({ error: error }, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map(function (error) {
        return error.properties.explanation;
      }).join("\n");
      console.log('errorMessages', errorMessages);
      // errorMessages is a humanly readable message looking like this :
      // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
  }

  //Load the docx file as a binary
  var content = fs.readFileSync('./public/file/job_application.docx', 'binary');

  var zip = new PizZip(content);
  var doc;
  try {
    doc = new Docxtemplater(zip);
  } catch (error) {
    // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
    errorHandler(error);
  }

  //set the templateVariables

  payload.prefixEnd = payload.prefix === 'นาย' ? 'Mr.' : 'Miss.';

  doc.setData(payload);

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()

  }
  catch (error) {
    // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
    errorHandler(error);
  }

  var buf = doc.getZip()
    .generate({ type: 'nodebuffer' });

  let fileName = `./public/file/${outputName}.docx`

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(fileName, buf);
  console.log("writeFileSync ", outputName + ".docx")

  let file = fs.createReadStream(fileName);
  let stat = fs.statSync(fileName);
  res.setHeader('Content-disposition', contentDisposition(outputName + '.docx'));
  res.setHeader('Content-Length', stat.size);
  console.log("sending... ", outputName + ".docx")
  file.on('end', function () {
    fs.unlink(fileName, function () {
      console.log('File deleted ...');
    });
  });
  file.pipe(res);
})

module.exports = router;
