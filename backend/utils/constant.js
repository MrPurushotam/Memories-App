const jwt= require("jsonwebtoken")

function createToken(object){
    const token = jwt.sign(object,process.env.SECRET_KEY,{expiresIn:'3d'})
    return token
}

function verifyToken(token){
    try {
        const data = jwt.verify(token,process.env.SECRET_KEY)
        return {success:true, data}
    }catch (error) {
        console.log("Error in Token: ",JSON.stringify(error))
        if(error.name=="TokenExpiredError"){
            return {success:false, jwtExpire:true}
        }
        return {success:false}
    }
}

module.exports={createToken , verifyToken}