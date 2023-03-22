const express = require('express')
const WebSocket = require("ws");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();

//指令httpPort
const HTTP_PORT = process.env.HTTP_PORT
const WS_PORT = process.env.WS_SERVER_PORT
const ClinetIP = process.env.SERVERIP

//建立讓客戶端取得聊天室html的主Server 監聽8080port
const app = express()
app.listen(HTTP_PORT, ()=>{ 
   console.log(`Main Server listening at PORT ${HTTP_PORT} `) 
   console.log(`connect to chat room : ${ClinetIP}:${HTTP_PORT}/client`)
})
//當用戶端連線至 192.168.2.95:8080/client 時 回傳 client.html給客戶
app.get('/client' , (req,res)=>{
   res.sendFile(path.resolve(__dirname , './client.html'))   
})
//使用public做靜態資源
app.use(express.static(__dirname + '/public'));


//建立聊天室實際溝通的伺服器
const wsServer = new WebSocket.Server(
   {port:WS_PORT},
   ()=> console.log("> Websocket Server Created <"));

const connectedClients = {};
wsServer.on('connection' , ws =>{   
   const id = Date.now(); // 使用時間戳作為唯一ID
   ws.id = id;
   connectedClients[id] = ws; // 將新連線的WebSocket物件存儲到clients物件中
   console.log(`id ${ws.id} 加入了聊天室`);

   //當有用戶傳送訊息
   ws.on('message' , message =>{      
      if(typeof(message) == 'object'){
         let obj = JSON.parse(message);    
         //使用 switch處理各種類型的JSON
         switch (obj.type){
            case 'SET_USER_INFO':
               //更改Client的名稱和頭像
               ws.userName = obj.userName;
               ws.avatar = obj.avatar;
               // 傳送JSON        
               ws.send(JSON.stringify({
                  "type": 'RESPONSE',
                  "avatar": "",
                  "name": "<System>",
                  "msg" :"HI!" + ws.userName +"，使用者名稱和頭像已更新。"               
               }))
               break;
            case 'CHAT':
               Object.keys(connectedClients).forEach(key => {
                  if (connectedClients[key].readyState === ws.OPEN) {
                     connectedClients[key].send(JSON.stringify({
                        "type" : 'CHAT',
                        "avatar" : ws.avatar,
                        "name" : ws.userName,
                        "msg" : obj.msg
                     }));
                  }
               });  
               break;
         }
      }           
   })
   //當有用戶段開連線
   ws.on('close' , ()=>{ 
      console.log(`id ${ws.id} 離開了聊天室!`);
      delete connectedClients[ws.id];
   })
})
