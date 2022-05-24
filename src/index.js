const express = require("express");
const axios = require('axios');
const responseTime = require("response-time");
const redis = require("redis")




//inicializar el server
const app = express()

//utilizar el metodo responseTime para saber el timepo de ejecusion
app.use(responseTime());

//SET
app.post('/redis-entry', async (req, res) => {
  const client = await createRedisClient()
  
  var bodyStr = '';
  req.on("data",function(chunk){
      bodyStr += chunk.toString();
  });
  req.on("end",function(){
      data = JSON.parse(bodyStr)
      client.set(data.redis_index, data.redis_data)
      res.send(data.redis_index + " : " + data.redis_data)
  })

})



//GET
app.get('/redis-entry', async (req,res) =>{

  const client = await createRedisClient()
  
  const redisIndex = req.query.index
  let response = ""

  try{
     value = await client.get(redisIndex);
     if(value == null)
       response = "index: '" + redisIndex + "' doesn't contain any value in Redis"
     else
       response = value;
    
     res.send(response);  
  }catch (e){
    res.send("error: " + e.message);
  }

})  



//DEL
app.delete('/redis-entry', async (req,res) =>{

  const client = await createRedisClient();
  const redisIndex = req.query.index

  const result = await client.del(redisIndex) 
  if(result == 1)
    res.status(204).send();
  else
    res.status(404).send("Index: '"+ redisIndex + "' does not exist");

})  

async function createRedisClient(){
  const client = redis.createClient({
    port:6379,
    host:'localhost'
  })
  client.on('ready', () => {
    console.log('Redis3 GET')
  });

  await client.connect();
  return client
}


app.listen(3000)
console.log("Server on port 3000")

