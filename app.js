//加载express模块
const express=require("express");

//加载cors模块
const cors=require("cors");

//加载body-parser模块
const bodyParser=require("body-parser");

//加载MySql模块
const mysql=require("mysql");
const { Console } = require("console");
//创建mysql连接池
const pool=mysql.createPool({
  host:'127.0.0.1',
  port:"3306",
  user:"root",
  password:"",
  database:"trip",
  charset:"utf8",
  connectionLimit:20
});

//创建express实例
const  server=express();

//使用cors模块
server.use(cors({
  origin:['http://127.0.0.1:8080','http://localhost:8080']
}))

//使用body-parser模块
server.use(bodyParser.urlencoded({
  extended:false
}))

//指定监听的端口
server.listen(3030,()=>{
  console.log("server is running----")
});



//用户注册的接口
server.post("/reg",(req,res)=>{
  //1.获取客户端提交的用户名和密码
  let uname=req.body.uname;
  let upwd=req.body.upwd;
  let phone=req.body.phone;
  // console.log(uname,upwd)
  //2.以当前的用户名为条件进行查找操作，如果没有找到的话
  let sql="SELECT uname FROM trip_user WHERE uname=?"
  pool.query(sql,[uname],(err,result)=>{
    if(err) throw  err;
    if(result.length>0){
      //如果找得到的话，直接响应错误信息到客户端的用户名
      res.send({
        message:"用户名已经存在",
        code:"0"
      })
    }else{
      //将用户信息写入数据表
      let sql="INSERT INTO trip_user(uname,upwd,phone) VALUES(?,?,?)"
      pool.query(sql,[uname,upwd,phone],(err,result)=>{
        if(err) throw err;
        if(result.affectedRows>0){
          res.send({
            message:"注册成功",
            code:"1"
          })
        }
      })
    }
  })
})

//用户登录的接口
server.post("/login",(req,res)=>{
  let uname=req.body.uname;
  let upwd=req.body.upwd;
  console.log(uname,upwd);
  let sql="SELECT uid,uname,upwd FROM trip_user WHERE uname=? AND upwd=?";
  pool.query(sql,[uname,upwd],(err,result)=>{
    if(err) throw err;
    console.log(result);
    if(result.length>0){
      res.send({
        message:"登录成功",
        code:"1",
        result:result[0]
      })
    }else{
      res.send({
        massage:"登录失败",
        code:"0"
      })
    }
  })
});

// 获取用户信息
server.post('/findPerson',(req,res)=>{
  let uname=req.body.uname;
  let phone=req.body.phone;
  pool.query("select uid,uname,phone from trip_user where uname = ? and phone = ? ",[uname,phone],(err,data)=>{
      //console.log('data:',data);
      // res.send(data);
      if(err){
          console.log(err);
          return;
      }
      res.send(data);  
  });
});
// 忘记密码，修改密码
server.post('/updatePwd',function(req,res,next){
  pool.query("update trip_user set upwd = ?  where uid = ? ",[req.body.upwd,req.body.uid],function(err,data){
      //console.log('data:',data);
      // res.send(data);
      if(err){
          console.log(err);
          return;
      }
      res.json({res_code:0});
    
  });
});

// 获取用户信息
server.get('/getInfo',(req,res)=>{
  var uid = req.query.uid;
      pool.query("select *  from trip_user where uid = ? ",[uid],(err,data)=>{
          console.log(data);
          //res.send(data);
          if(err){
              console.log(err);
              return;
          }
          res.send(data);  
      });
});


// 修改个人信息
server.post('/edit',(req,res,next)=>{
  pool.query("update trip_user set uname = ?,nickname = ?,phone = ?,gender = ? where uid =? ",[req.body.uname,req.body.nickname,req.body.phone,req.body.gender,req.body.uid],function(err,data){
      // console.log('data:',data);
      // res.send(data);
      if(err){
          console.log(err);
          return;
      }
     res.send({code:1});
  });
});
// 获取景点的列表信息
//通过城市名
server.get('/getTourList',(req,res)=>{
  var type_id = req.query.type_id;
  console.log(type_id);
  pool.query("select *  from trip_recommend where type_id = ?",[type_id],(err,data)=>{
      //console.log(data);
      // res.send(data);
      if(err){
          console.log(err);
          return;
      }
      res.send(data);
  });
});

// 获取景点的详情信息
server.get('/getTourDetail',function(req,res,next){
  var rid = req.query.rid;
  //console.log(rid);
  pool.query("select *  from  trip_recommend where rid = ?",[rid],function(err,data){
      //console.log('data:',data);
      // res.send(data);
      if(err){
          console.log(err);
          return;
      }
      res.send(data);
      // console.log(data)
      
  });
});
//搜索数据的数据
server.get('/findTour',function(req,res,next){
      var name = req.query.name;
  
      pool.query("select *  from  trip_recommend  where name = ? ",[name],function(err,data){
        //  console.log('data:',data);
          // res.send(data);
          if(err){
              console.log(err);
              return;
          }
          res.send(data); 
      });
  });

  //获取评论列表
server.get('/selectComment',(req,res)=>{
    var rid = req.query.rid;
    console.log(rid);
    let sql="select *  from  comment,trip_user  where comment.uid = trip_user.uid and comment.rid = ?"
      pool.query(sql,[rid],(err,data)=>{
            if(err) throw err;
            if(data.length>0){
              res.send(data); 
            }
            //console.log(rid);  
        });
});

// 新增评论
server.post('/addComment',function(req,res,next){
        pool.query("insert into comment (uid,rid,content,createtime) values (?,?,?,?) ",[req.body.uid,req.body.rid,req.body.content,req.body.createtime],function(err,data){
            if(err){
                console.log(err);
                return;
            }
            res.json({res_code:0});
        });

});