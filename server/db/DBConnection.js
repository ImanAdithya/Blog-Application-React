const mongoose=require('mongoose');
const dotenv=require('dotenv');

dotenv.config()


const MONGODB_URL=process.env.MONGODB_URL;


const db  = async ()=>{
    try{
        const conn = await mongoose.connect(MONGODB_URL);//Asnycrones Task ==> Promise Type
        console.info(`MongoDB Connected to :${conn.connection.host}`);

    }catch(err) {
        console.error("MongoDB connect error",err)
    }
}

module.exports=db;
//
//adithyaiman07

//mongodb+srv://adithyaiman07:Xgv1R1GDuSn0PD3J@cluster0.y7ufzpi.mongodb.net/?retryWrites=true&w=majority