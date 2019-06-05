// for keeping youtube apikeys and mongodb atlas passwords inside .env file
require('dotenv').config();

// for repeated runs
const CronJob = require('cron').CronJob;

// for validating input
const assert = require('assert');

// for youtube request
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(`${process.env.YOUTUBE_API_KEY}`);

// for line-by-line reading of input file
const readline = require('readline');
const fs = require('fs');

// for mongodb connection
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@youtubevideoinfotestapp-wsocj.mongodb.net/test?retryWrites=true&w=majority`;

// this function to uploads an array of documents to mongodb database.
async function uploadVideoStatisticsToMongoDB(docs_array) {
    // MongoClient object can not be reused for multiple connections
    const client = new MongoClient(uri, { useNewUrlParser: true });
    try {
        await client.connect();
    } catch(err) {
        client.close();
        console.log(`Error connecting to database ${err}`);
        return false;
    }

    try {
        const db = client.db("youtube_video");
        const collection = db.collection("statistics");
        // see https://docs.mongodb.com/v3.2/reference/method/Bulk.find.updateOne
        // and https://stackoverflow.com/questions/40244739/insert-or-update-many-documents-in-mongodb
        let bulkOperation = collection.initializeUnorderedBulkOp();
        docs_array.forEach(doc => {
            bulkOperation.find({ url: doc.url }).upsert().updateOne(doc);
        });
        await bulkOperation.execute();
    } catch (err) {
        client.close();
        console.log(`Error inserting into database ${err}`);
        return false;
    }

    client.close();
    return true;
}

async function downloadVideoStatistics(url_array) {
    let stats = url_array.map(url => {
        return youtube.getVideo(`${url}`, { part: 'statistics' });
    });

    try {
        stats = await Promise.all(stats);
    } catch (err) {
        console.log(`Failed to get youtube statistics: ${err}.`);
        return [];
    }
    return stats;
}

async function updateVideoStatistics(video_urls) {
    // get data
    const stats = await downloadVideoStatistics(video_urls);
    if (stats.length <= 0) {
        return;
    }
    // transform data
    const mongodb_docs = stats.map(video => {
        return {
            url: `https://www.youtube.com/watch?v=${video.raw.id}`,
            viewCount: video.raw.statistics.viewCount,
            likeCount: video.raw.statistics.likeCount,
            dislikeCount: video.raw.statistics.dislikeCount,
            commentCount: video.raw.statistics.commentCount,
        };
    });
    // upload data stats in one batch
    await uploadVideoStatisticsToMongoDB(mongodb_docs);
}

// entry point
(function() {
    // might have problems with Windows/Linux line endings "\n\r" vs "\n"
    let rl = readline.createInterface({
        input: fs.createReadStream('input-videos.txt')
    });

    let video_url_array = [];

    rl.on('line', function(line) {
        video_url_array.push(line);
    });

    setInterval(function() {
        updateVideoStatistics(video_url_array);
    }, 5000);

})();
