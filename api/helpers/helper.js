const express = require('express');
const app = express();
const path = require('path');
const mg = require("nodemailer-mailgun-transport");
const hbs = require('nodemailer-express-handlebars')

const handlebars = require("handlebars")
const fs = require('fs');
const nodemailer = require('nodemailer')


const mailgunAuth = { auth: { api_key: '676aa8e3a738346daf1a935d59d64793-2af183ba-7a6aa600', domain: 'getshopeasy.com' } }

module.exports = sendEmail = (req, res,username, to, from,subject, templateName,address,status,wallet,amount,orderDateorderId) => {


    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

    smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

    readHTMLFile(__dirname + `/views/${templateName}`, function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            name: username
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: htmlToSend,
            context: { name: 'James wayne' }
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                callback(error);
            } else {
                console.log(response)
            }
        });
    });


};
