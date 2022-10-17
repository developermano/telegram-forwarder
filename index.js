const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');


db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS forwarder (id INTEGER PRIMARY KEY,sendergroup TEXT,recivergroup TEXT)");
});



// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.token;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});




bot.onText(/\/forwarderdelete (.+)/,(msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  db.prepare("SELECT * FROM forwarder WHERE sendergroup=? AND recivergroup=?").run(chatId,resp).all(function(err,data){
      
    if(data.length==0){
    bot.sendMessage(chatId,"nothing to delete");
    } else{
      bot.getChatMember(chatId,msg.from.id).then(function(data) {
        if ((data.status == "administrator" || data.status == "creator")){
      db.prepare("DELETE FROM forwarder WHERE sendergroup=? AND recivergroup=?").run(chatId,resp);
    bot.sendMessage(chatId,"deleted forwading");
  }else{
    bot.sendMessage(chatId,data.status+"you are not administrator");
  }
});
    }
});
  
});


// Matches "/echo [whatever]"
bot.onText(/\/forwarder (.+)/, (msg, match) => {
 
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  
  if(resp!=""){
    db.prepare("SELECT * FROM forwarder WHERE sendergroup=? AND recivergroup=?").run(chatId,resp).all(function(err,data){
    //console.log(data);
    if(data.length==0){
      bot.getChatMember(chatId,msg.from.id).then(function(data) {
        if ((data.status == "administrator" || data.status == "creator")){
            // I'm admin 
        var stmt =db.prepare("INSERT INTO forwarder VALUES (NULL,?,?)");
        stmt.run(chatId,resp);
        stmt.finalize();
        bot.sendMessage(chatId,"forwarding is added")
        }else{
          bot.sendMessage(chatId,"you are not a administrator");
        }
    });
    
        
    }else{
      bot.sendMessage(chatId,"forwarding is already added")
    }
    });
  }
  
});





bot.onText(/\/groupchatid/, (msg, match) => {
  const chatId = msg.chat.id;
  //db.each("SELECT * FROM forwarder", function(_err, row) {
    //console.log(row);
//});
  bot.sendMessage(chatId,chatId);
});


bot.on("channel_post",(post)=>{
  var username=post['chat']['username'];
  var msg=post['text'];
  var chatId='@'+username;
  if(post['text']!=undefined){
if(msg.startsWith("/forwarder ")){
  
  //console.log(chatId);
   var resp=msg.replace("/forwarder ","");
   if(resp!=""){
    db.prepare("SELECT * FROM forwarder WHERE sendergroup=? AND recivergroup=?").run(chatId,resp).all(function(err,data){
    //console.log(data);
    if(data.length==0){
        var stmt =db.prepare("INSERT INTO forwarder VALUES (NULL,?,?)");
        stmt.run(chatId,resp);
        stmt.finalize();
        console.log("ss")
        bot.sendMessage(chatId,"forwarding is added")
    }else{
      console.log("ss")
      bot.sendMessage(chatId,"forwarding is already added")
    }
    });
  }
  }else{

if(msg.startsWith("/forwarderdelete ")){
  var resp=msg.replace("/forwarderdelete ","");
  db.prepare("SELECT * FROM forwarder WHERE sendergroup=? AND recivergroup=?").run(chatId,resp).all(function(err,data){
      
    if(data.length==0){
    bot.sendMessage(chatId,"nothing to delete");
    } else{

    db.prepare("DELETE FROM forwarder WHERE sendergroup=? AND recivergroup=?").run(chatId,resp);
    bot.sendMessage(chatId,"deleted forwading");

    }
});
}else{
    db.prepare("SELECT * FROM forwarder WHERE sendergroup=?").run(chatId).all(function(err,data){
      
      data.forEach(function(data){
        bot.forwardMessage(data['recivergroup'],post.chat.id,post.message_id);
        //bot.sendMessage(data['recivergroup'],msg);
    });
  });}
  }
}else{
  db.prepare("SELECT * FROM forwarder WHERE sendergroup=?").run(chatId).all(function(err,data){
      
    data.forEach(function(data){
      console.log("ss")
      bot.forwardMessage(data['recivergroup'],post.chat.id,post.message_id);
      //bot.sendMessage(data['recivergroup'],msg);
  });
});
}
}
);


bot.on("message",(msg)=>{
 if(msg['text']!=undefined){
  if(!msg['text'].startsWith("/")){
    db.prepare("SELECT * FROM forwarder WHERE sendergroup=?").run(msg['chat']['id']).all(function(err,data){
      
      data.forEach(function(data){
//console.log(msg);
        bot.forwardMessage(data['recivergroup'],msg.chat.id,msg.message_id);
      //bot.sendMessage(data['recivergroup'],msg['text']);
    });
  });
  }}
else{
  db.prepare("SELECT * FROM forwarder WHERE sendergroup=?").run(msg['chat']['id']).all(function(err,data){
      
    data.forEach(function(data){
//console.log(msg);
      bot.forwardMessage(data['recivergroup'],msg.chat.id,msg.message_id);
    //bot.sendMessage(data['recivergroup'],msg['text']);
  });
});
}
}
);
