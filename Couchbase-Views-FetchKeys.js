var express = require("express");
var couchbase = require("couchbase");
var fs = require('fs');
var app = express();
var async = require("async");
var bucket = (new couchbase.Cluster("http://10.33.169.89:8091")).openBucket("StatsReporting");
 
var ViewQuery = couchbase.ViewQuery;
var query = ViewQuery.from('dev_abc', 'def').full_set(true);
 console.log(query)
 
bucket.query(query, function(error, results) {
    if(error) {
        console.log(error);
    }
    console.log("Found " + results.length + " documents to save");


var count = 1
async.eachSeries(results,function(result,callback){

        //  console.log(i + " " + results[i].key)
            var keyToFetch = result.key
            bucket.get(keyToFetch, function(err, data) {
            if (err) {
                console.log("error aayi hai" + err);
                callback();
            }
            //Writing to the file
            if(data != null){
                var dataToWrite = result.key + ", " + JSON.stringify(data.value)
                fs.appendFile('/Users/kunal.bansal/Desktop/dataBackup.csv', dataToWrite + "\n", 'utf8', function (err1) {
                if (err1) {
                    console.log('Some error occured - file either not saved or corrupted file saved.' + result.key);
                    callback();
                } else{
                    console.log('It\'s saved!' + count);
                    count = count + 1
                    callback();
                }
                });
            }
        });



},function(){
    console.log('It\'s saved!');
})

});
 
var server = app.listen(3000, function () {
    console.log("Listening on port %s...", server.address().port);
});
 
/*
function (doc, meta) {
    if ((meta.id).match("20170[8-9][0-9]*.ceryx.*")) { 
  emit(meta.id, null);
    }
}

 var startKey = "20170822.ceryx."
 var endKey = "20170905.ceryx."
query.range(startKey, endKey, true);

 CREATE INDEX idx ON StatsReporting((meta().`id`)) USING GSI
 CREATE PRIMARY INDEX #primary ON StatsReporting USING GSI
*/
