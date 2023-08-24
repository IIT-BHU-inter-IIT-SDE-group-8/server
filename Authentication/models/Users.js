// const postgres = require('pg');
// const {Schema} = postgres;
// const userShchema = new Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     email:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     date:{
//         type:Date,
//         default: Date.now
//     }
// })
// const User = postgres.model('user',userShchema);
// User.createIndexes();
// module.exports = User;