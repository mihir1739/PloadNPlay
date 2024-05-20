// Not Working
const express = require('express');
const app = express();
const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');
// const crypto = require('crypto');
const cors = require("cors");
const path = require('path');
require("dotenv").config();
// MongoDB connection
mongoose.connect(process.env.DB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
    console.log("connected");
});
// GridFS setup
const conn = mongoose.connection;
let gfs,gridfsBucket;;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'videos'
    })
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('videos');
});

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const fileExt = path.extname(file.originalname);
//     const randomName = crypto.randomBytes(20).toString('hex');
//     cb(null, `${randomName}${fileExt}`);
//   }
// });

app.use(cors());
app.use(express.json());

const gridstorage = () => {
    let storageFS = new GridFsStorage({
        url: process.env.DB_URL,
        file: (req, file) => {
            return {
                filename: file.originalname,
                bucketName: "videos"
            }
        }
    })

    let uploadGrid = multer({ storage: storageFS });
    return uploadGrid;
}

// const upload = multer({ storage });

// Serve static files
app.use(express.static('public'));

// Upload video
app.post('/upload', gridstorage().single('video'), async (req, res) => {
    try {
        res.status(200).send("File uploaded Successfully");
    }
    catch (err) {
        res.status(400).send(err.message);
    }
});

// Get all video files
app.get('/videos', async (req, res) => {
    try {
        const videos = await gfs.files.find().toArray();
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving videos' });
    }
});

// Stream video
app.get('/stream',(req, res) => {
  console.log(req.query.id);
  gfs.files.findOne(
    { _id: new mongoose.Types.ObjectId(req.query.id) },
    (err, video) => {
      if(err) {
        console.log(err);
      }
      console.log(video,err);
      res.status(200).send({"message":working});
    }
    //   if (err) {
    //     return res.status(400).send({
    //       err: errorHandler.getErrorMessage(err),
    //     });
    //   }
    //   if (!video) {
    //     console.log(video, "Couldn't stream video not found");
    //     return res.status(404).send({
    //       err: "Not Found",
    //     });
    //   }
    //   const videoSize = video.length;
    //   console.log(videoSize);
    //   const range = req.headers.range;
    //   if (range) {
        
    //     const CHUNK_SIZE = 10 ** 6;
    //     const start = Number(range.replace(/\D/g, ""));
    //     const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    //     const contentLength = end - start + 1;
        
    //     console.log(
    //       streamCounter,
    //       " start ",
    //       start,
    //       " end ",
    //       end,
    //       "content-length",
    //       contentLength,
    //       "video size",
    //       videoSize
    //     );
    //     const downloadStream = gridfsBucket.openDownloadStream(video._id, {
    //       start: start,
    //       end: end + 1,
    //     });

    //     // Finally pipe video to response
    //     streamCounter++;
    //     const head = {
    //       "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    //       "Accept-Ranges": "bytes",
    //       "Content-Length": contentLength,
    //       "Content-Type": "video/mp4",
    //     };

    //     res.writeHead(206, head);
    //     downloadStream.on("data", (chunk) => {
    //       res.write(chunk);
    //     });

    //     downloadStream.on("error", (err) => {
    //       res.sendStatus(404);
    //     });

    //     downloadStream.on("end", () => {
    //       res.end();
    //     });
    //   } else {
    //     const downloadStream = gridfsBucket.openDownloadStream(video._id);
    //     const head = {
    //       "Content-Length": videoSize,
    //       "Content-Type": "video/mp4",
    //     };
    //     res.writeHead(200, head);
    //     downloadStream.pipe(res);
    //   }
    // }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});