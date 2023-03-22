console.log("client.js loads successed")
document.addEventListener("DOMContentLoaded", event => { 
  // 建立 WebSocket (本例 server 端於本地運行)
  const WS_URL = 'ws://192.168.2.95:8081'
  const ws = new WebSocket(WS_URL)
  
  //設定DOM  
  //聊天室元件
  const chatWindow = document.querySelector('#chat-window');
  const chatMessages = document.querySelector('#chat-messages');
  const inputArea = document.querySelector('.inputArea');
  const keyinDom = document.querySelector('#txtInput');
  const sendBtn = document.querySelector("#btnSend");
  //表單元件
  const userForm = document.querySelector('#userInfoForm');
  const nameInput = document.querySelector('#userName');
  const avatarInput = document.querySelector('#userAvatar');
  //預覽元件
  const avatarPreview = document.querySelector("#avatarPreview");
  const namePreview = document.querySelector("#namePreview");

  //設定各種功能
  //webSocket相關功能
  // 監聽連線狀態
  ws.onopen = () => console.log(`Client Connected to ${WS_URL}`);
  ws.onclose = () =>console.log(`Client Disconnect from ${WS_URL}`);
  //接收 Server 發送的訊息
  ws.onmessage = (event) => {
    if(typeof(event) == 'object'){
      const obj = JSON.parse(event.data);
      switch (obj.type){
        case 'RESPONSE':
          createChatLine(obj.avatar , obj.name , obj.msg);
          break;
        case 'CHAT':
          createChatLine(obj.avatar , obj.name , obj.msg);
          break;
      }
    }
  }
  //處理聊天視窗
  function createChatLine(avatar , name , msg){
    //新增聊天列
    var chatline = document.createElement('li');
    var avatar_img = document.createElement('img');
    var chatmsg = document.createElement('p');
    //新增聊天列在聊天視窗
    chatline.classList.add("chatLine");
    avatar_img.classList.add('chatAvatar');
    chatmsg.classList.add('chatMsg');
    //存放聊天訊息
    chatMessages.appendChild(chatline);
    chatline.appendChild(avatar_img);
    chatline.appendChild(chatmsg);
    if(avatar !="")
    avatar_img.src = avatar;
    chatmsg.textContent = name.toString().trim() + ":" + msg.toString().trim();
  }
  //發送聊天訊息
  function jsonChat(msg){
    const jsonMsg = JSON.stringify({
      "type":'CHAT',
      "msg" : msg.toString().trim()   
    })
    return jsonMsg
  }
  // 聊天訊息送出按鈕
  sendBtn.addEventListener('click',() => {
    let txt = keyinDom.value.trim();
    if(txt){
      // 將使用者名稱和頭像資訊傳送給伺服器端
      ws.send(jsonChat(txt));
      keyinDom.value = "";      
    }
  })
  // 按ENTER發出訊息
  keyinDom.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // 防止預設的換行行為
      let txt = keyinDom.value.trim();
      if (txt) {
        ws.send(jsonChat(txt));
        keyinDom.value = "";   
      }
    }
  }); 
  // 新增表單元素和提交事件監聽器
  userForm.addEventListener('submit', (event) => {
    event.preventDefault(); // 防止表單提交時刷新頁面
    const userName = nameInput.value.trim();
    const avatarFile = avatarInput.files[0];

    // 讀取頭像圖片並轉換為 Base64 字串
    const reader = new FileReader();
    reader.readAsDataURL(avatarFile);
    reader.onloadend = () => {
      const avatarBase64 = reader.result;

      // 將使用者名稱和頭像資訊傳送給伺服器端
      ws.send(JSON.stringify({
        "type": 'SET_USER_INFO',
        "userName": userName,
        "avatar": avatarBase64,
        "msg" : "Request to change userInfo"
      }));
      enable(chatWindow);
      enable(inputArea);      
    }
  });

  // 更改使用者預覽 update Preview
  // 更改頭像預覽
  avatarInput.addEventListener('change', (event) => {
    const file = avatarInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      avatarPreview.src = "data:image/png;base64," + base64String;
      // avatarPreview.src = reader.result;
    };
  });
  // 更改使用者名稱預覽
  nameInput.addEventListener('keyup',(event)=>{
    namePreview.textContent = nameInput.value;
  })

  //啓用元件
  const enable = (el) => {
    el.classList.remove('hidden')
    el.disabled = false;
  }
  //關閉元件
  const disable = (el) => {
    el.classList.add('hidden')
    el.disabled = true;
  }
  
  //初始化設定
  disable(chatWindow);
  disable(inputArea);


});