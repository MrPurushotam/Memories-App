const multer = require("multer")
const multerS3=require("multer-s3")
const { s3Client } = require("../utils/aws")

const memoriesMiddleware=multer({
    storage:multerS3({
        s3:s3Client,
        bucket:"aws-shit",
        key:function(req,file,cb){
            const filename=`memories/${req.userId}--${Date.now()}`
            cb(null,filename)
        }
    }),
    limits:{fileSize: 20*1024*1024},
    fileFilter:(req,file,cb)=>{
        if(file.mimetype.startsWith("image/") || file.mimetype.startsWith('video/')){
            return cb(null,true)
        }
        else{
            cb(new Error("Invalid File type. Image files only."))
        }
    }
})

module.exports=memoriesMiddleware