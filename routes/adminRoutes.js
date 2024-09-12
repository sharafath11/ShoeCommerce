import express from "express"
const router=express.Router()
router.get("/admin/st",(req,res)=>{
 res.render("admin/login")
})