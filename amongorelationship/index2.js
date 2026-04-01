const mongoose= require("mongoose");
const {Schema}= mongoose;

main()
.then(()=>{console.log("connected to mongodb")})
.catch((err)=>{console.log(err)})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/realtionPractise2');
}

const orderSchema= new Schema({
    item:String,
    price:Number,
})

const Order= mongoose.model("Order",orderSchema);

// let addOrders= async()=>{
//     await Order.insertMany([
//         {item:"Chips", price:20},
//         {item:"Kurkure", price: 10},
//     ]).then((res)=>{console.log(res)})
// }

// addOrders();

const userSchema= new Schema({
    name:String,
    orders:[{
        type:Schema.Types.ObjectId,
        ref:"Order"
    }]
})

const User= mongoose.model("User", userSchema);

// let addCustomer= async()=>{
//     let user1= new User({
//         name:"Lucky",
//     })
//     let order1= await Order.findOne({item:"Chips"});
//     let order2= await Order.findOne({item:"Kurkure"});

//     user1.orders.push(order1);
//     user1.orders.push(order2);

//     let res= await user1.save();
//     console.log(res);
// }

// addCustomer();

const findUser= async()=>{
    let find=await User.find({}).populate("orders");
    console.log(find);
}
findUser();