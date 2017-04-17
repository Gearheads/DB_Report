var db = require('oracledb');
var dbConfig = require('./dbconfig.js');
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var nodemailer = require('nodemailer');
var cron = require('node-cron');

// number of rows to return from each call to getRows()
var numRows = 100;

//cron.schedule('* * * * *', function(){
cron.schedule('0 10 * * Mon', function(){

    var connection = db.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(err, connection)
        {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                // The statement to execute
                '<sql_statement>',
      
                // no bind variables
                [],
    
                // Optional execute options argument, such as the query result
                // format or whether to get extra metadata
                // { outFormat: oracledb.OBJECT, extendedMetaData: true },
    
                // number of rows is unpredictable, so need to use a ResultSet
                // default is false
                { resultSet: true },
    
                function(err, result)
                {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                        return;
                    }
                    // format response from database
                    result.metaData.forEach(function(element, index, headers) {
                        headers[index] = element["name"];
                    });
            
                    var writer = csvWriter({headers: result.metaData});
                    writer.pipe(fs.createWriteStream('<file_name>'));
    
                    fetchRowsFromRS(connection, result.resultSet, numRows, writer);
                });
        });
    
    // The callback function handles the SQL execution results
    function fetchRowsFromRS(connection, resultSet, numRows, writer)
    {
        resultSet.getRows(
            numRows,
            function(err, rows)
            {
                if (err) {
                    console.error(err.message);
                    resultSet.close();
                    doRelease(connection);
                    return;
                } else if (rows.length > 0) {
                    rows.forEach(function(element, index, rows) {
                        writer.write(element);
                    });
                    
    
                    
                    if (rows.length === numRows) {
                        fetchRowsFromRS(connection, resultSet, numRows, writer);
                        resultSet.close();
                    // less than the requested number of rows
                    // reached the end of the ResultSet
                    } else {
                        writer.end();
                        // create reusable transporter object using the default SMTP transport
                        var transporter = nodemailer.createTransport({
                            host: '<server_name>',
                            port: '<port>'
                        });
                        
                        // setup email data with unicode symbols
                        var mailOptions = {
                            from: '<sender_email_address>', // sender address
                            to: '<receiver_email_address_1>, <receiver_email_address_2>', // list of receivers
                            subject: '<subject_name>', // Subject line
                            attachments: [
                                {
                                    filename: '<file_name>',
                                    path: './<file_name>'
                                }
                            ]
                        };
                        
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message %s sent: %s', info.messageId, info.response);
                        });
                        doRelease(connection);
                        return;
                    }
                // no rows
                } else {
                    console.error(err.message);
                    resultSet.close();
                    doRelease(connection);
                    return;
                }
            });
    };
});

// Note: connections should always be released when not needed
function doRelease(connection)
{
  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
};
